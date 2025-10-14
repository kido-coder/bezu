// udp_server.js
const dgram = require('dgram');
const mysql = require('mysql2/promise');

const PORT = 8888;
const HOST = '0.0.0.0';
const CYCLE_MS = 5 * 1000; // 5 minutes total cycle
const RESPONSE_TIMEOUT_MS = 4 * 1000; // 4 seconds
const MAX_FAULTS_BEFORE_ALERT = 3;

const server = dgram.createSocket('udp4');
const pending = new Map(); // key = ip:port
const faultCounts = new Map();

let db;
let nodes = []; 

async function initDb() {
  db = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "Mhtsshataasai!@#",
    database: "contor",
  });
  console.log('Connected to MySQL');
}

async function getNode() {
    try {
        const [rows] = await db.execute('SELECT node_id, node_ip, node_port FROM node');

        // Fill/update the global nodes array
        nodes = rows.map(r => ({
            node_id: r.node_id,
            ip: r.node_ip,
            port: Number(r.node_port)
        }));

        console.log('Nodes updated:', nodes); // debug log
    } catch (err) {
        console.error('Error fetching nodes:', err);
    }
}

// Parse registration message: R_nodeid_!
function parseRMessage(msgStr) {
  msgStr = msgStr.trim();
  if (!msgStr.startsWith('R_') || !msgStr.endsWith('_!')) return null;
  const inner = msgStr.slice(2, -2);
  return inner || null;
}

// Parse response message: S_nodeid_someinteger_!
function parseSMessage(msgStr) {
  msgStr = msgStr.trim();
  if (!msgStr.startsWith('S_') || !msgStr.endsWith('_!')) return null;
  const parts = msgStr.slice(2, -2).split('_');
  if (parts.length !== 2) return null;
  const [nodeId, valueStr] = parts;
  const value = parseInt(valueStr, 10);
  if (!nodeId || isNaN(value)) return null;
  return { nodeId, value };
}

async function upsertNode(nodeId, ip, port) {
  nodeId = parseInt(nodeId, 16);
  const sql = `
    INSERT INTO node (node_id, node_ip, node_port)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE node_ip = VALUES(node_ip), node_port = VALUES(node_port)
  `;
  await db.execute(sql, [nodeId, ip, String(port)]);
  console.log(`Upserted node ${nodeId} -> ${ip}:${port}`);
}

async function insertTransaction(nodeId, value) {
  const sql = `INSERT INTO node_log (log_node, log_sys_state) VALUES (?, ?)`;
  try {
    await db.execute(sql, [nodeId, String(value)]);
    console.log(`Inserted transaction for ${nodeId}: ${value}`);
  } catch (err) {
    console.error('Error inserting transaction:', err);
  }
}

server.on('message', async (msgBuf, rinfo) => {
  const msgStr = msgBuf.toString('utf8').trim();

  // 1️⃣ Handle registration: "R_nodeid_!"
  const nodeIdFromR = parseRMessage(msgStr);
  if (nodeIdFromR) {
    await upsertNode(nodeIdFromR, rinfo.address, rinfo.port);
    await getNode();
    console.log(`Received registration from ${nodeIdFromR}`);
    return;
  }

  // 2️⃣ Handle data response: "S_nodeid_someinteger_!"
  const parsed = parseSMessage(msgStr);
  if (parsed) {
    const { nodeId, value } = parsed;

    // Upsert node (keep IP/port fresh)
    await upsertNode(nodeId, rinfo.address, rinfo.port);

    // Match to pending request
    const peerKey = `${rinfo.address}:${rinfo.port}`;
    const pendingEntry = pending.get(peerKey);
    if (pendingEntry) {
      clearTimeout(pendingEntry.timer);
      pendingEntry.resolve({ nodeId, value, msg: msgStr, rinfo });
      pending.delete(peerKey);
      faultCounts.set(peerKey, 0);
    } else {
      // unsolicited "S_" message
      console.log(`Unsolicited S message from ${peerKey}: ${msgStr}`);
      await insertTransaction(nodeId, value);
    }
    return;
  }

  console.log(`Unknown message from ${rinfo.address}:${rinfo.port}: ${msgStr}`);
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendAndAwaitResponse(ip, port) {
  const peerKey = `${ip}:${port}`;
  const message = Buffer.from('C_gimmedata');

  return new Promise((resolve) => {
    if (pending.has(peerKey)) {
      return resolve({ success: false, reason: 'busy' });
    }

    const timer = setTimeout(() => {
      pending.delete(peerKey);
      resolve({ success: false, reason: 'timeout' });
    }, RESPONSE_TIMEOUT_MS);

    pending.set(peerKey, {
      timer,
      resolve: (data) => resolve({ success: true, data }),
    });

    server.send(message, port, ip, (err) => {
      if (err) {
        clearTimeout(timer);
        pending.delete(peerKey);
        console.error(`Error sending C_gimmedata to ${peerKey}:`, err);
        resolve({ success: false, reason: 'send_error', error: err });
      } else {
        console.log(`Sent C_gimmedata -> ${peerKey}`);
      }
    });
  });
}

async function cycleLoop() {
  while (true) {
    try {
      if (nodes.length === 0) {
        console.log('No nodes found in DB. Waiting 30s...');
        await sleep(30 * 1000);
        continue;
      }

      const gap = Math.max(100, Math.floor(CYCLE_MS / nodes.length));
      console.log(`Cycle start: ${nodes.length} nodes, gap = ${gap} ms`);

      for (const node of nodes) {
        const { ip, port, node_id } = node;
        const res = await sendAndAwaitResponse(ip, port);

        const peerKey = `${ip}:${port}`;
        if (res.success) {
          const { nodeId, value } = res.data;
          console.log(`Got response from ${peerKey}: node=${nodeId}, value=${value}`);
          await insertTransaction(nodeId, value);
          faultCounts.set(peerKey, 0);
        } else {
          const prev = faultCounts.get(peerKey) || 0;
          const newCount = prev + 1;
          faultCounts.set(peerKey, newCount);
          console.warn(`No response from ${peerKey} (${res.reason}). fault=${newCount}`);
          if (newCount >= MAX_FAULTS_BEFORE_ALERT) {
            console.error(`Node ${peerKey} failed ${newCount} times!`);
          }
        }

        await sleep(gap);
      }
    } catch (err) {
      console.error('Error in cycleLoop:', err);
      await sleep(5000);
    }
  }
}

async function start() {
  await initDb();
  await getNode();
  
  server.on('error', (err) => {
    console.error('Server error:', err);
    server.close();
  });

  server.bind(PORT, HOST, () => {
    console.log(`UDP server listening on ${HOST}:${PORT}`);
  });

  cycleLoop().catch(err => console.error('cycleLoop fatal error:', err));

  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    server.close();
    if (db) await db.end();
    process.exit(0);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
