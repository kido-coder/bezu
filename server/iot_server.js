// udp_server.js
require('dotenv').config();
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

let isPaused = false;
let pausePromise = null;
let resumeCycle = null;

async function initDb() {
  db = await mysql.createConnection({
    host: process.env.BE_DB_HOST,
    user: process.env.BE_DB_USER,
    password: process.env.BE_DB_PASS,
    database: process.env.BE_DB_DB
  });
  console.log('Connected to MySQL');
}

async function getNode() {
    try {
        const [rows] = await db.execute('SELECT node_id, node_ip, node_port, node_status FROM node');

        raw = rows.map(r => ({
            node_id: r.node_id,
            ip: r.node_ip,
            port: Number(r.node_port),
            status: r.node_status
        }));
        console.log('Nodes updated:', raw);
        nodes = raw.filter(r => r.status === 'ON');
        console.log('Filtered:', nodes);
    } catch (err) {
        console.error('Error fetching nodes:', err);
    }
}

function parseRMessage(msgStr) {
  msgStr = msgStr.trim();
  if (!msgStr.startsWith('R') || !msgStr.endsWith('!')) return null;
  const inner = msgStr.slice(2, -1);
  return inner || null;
}

function parseAMessage(msgStr) {
  msgStr = msgStr.trim();
  if (!msgStr.startsWith('A') || !msgStr.endsWith('!')) return null;
  // const parts = msgStr.slice(2, -2).split('_');
  // if (parts.length !== 2) return null;
  // const [nodeId, valueStr] = parts;
  const value = parseInt(msgStr.slice(2, -1), 10);
  if (!nodeId || isNaN(value)) return null;
  return { nodeId, value };
}

async function upsertNode(nodeId, ip, port) {
  nodeId = parseInt(nodeId, 16);

  const sql = `
    INSERT INTO node (node_id, node_ip, node_port, node_status)
    VALUES (?, ?, ?, 'ON')
    ON DUPLICATE KEY UPDATE node_ip = VALUES(node_ip), node_port = VALUES(node_port), node_status = "ON";
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

async function insertOFFStatus(nodeId) {
  const sql = `UPDATE node 
              SET node_status = 'OFF'
              WHERE node_id = ?;`;
  try {
    await db.execute(sql, [Number(nodeId)]);
    console.log(`Updated ${nodeId} status to OFF`);
  } catch (err) {
    console.error('Error inserting transaction:', err);
  }
}

function pauseCycle() {
  if (isPaused) return;
  console.log('⏸️ Pausing cycle loop...');
  isPaused = true;
  pausePromise = new Promise(resolve => (resumeCycle = resolve));
}

function resumeCycleLoop() {
  if (!isPaused) return;
  console.log('▶️ Resuming cycle loop...');
  isPaused = false;
  resumeCycle();
}

server.on('message', async (msgBuf, rinfo) => {
  const msgStr = msgBuf.toString('utf8').trim();

  const nodeIdFromR = parseRMessage(msgStr);
  if (nodeIdFromR) {
    sendAndAwaitResponse(rinfo.address, rinfo.port, "X:!")
    await upsertNode(nodeIdFromR, rinfo.address, rinfo.port);
    await getNode();
    console.log(`Received registration from ${nodeIdFromR}`);
    return;
  }

  const parsed = parseAMessage(msgStr);
  if (parsed) {
    const { nodeId, value } = parsed;

    await upsertNode(nodeId, rinfo.address, rinfo.port);

    const peerKey = `${rinfo.address}:${rinfo.port}`;
    const pendingEntry = pending.get(peerKey);
    if (pendingEntry) {
      clearTimeout(pendingEntry.timer);
      pendingEntry.resolve({ nodeId, value, msg: msgStr, rinfo });
      pending.delete(peerKey);
      faultCounts.set(peerKey, 0);
    } else {
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

async function sendAndAwaitResponse(ip, port, mes) {
  const peerKey = `${ip}:${port}`;
  const message = Buffer.from(mes);

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
      if (isPaused) {
        console.log('⏸️ Cycle paused, waiting...');
        await pausePromise;
      }

      if (nodes.length === 0) {
        console.log('No nodes found in DB. Waiting 30s...');
        await sleep(30 * 1000);
        continue;
      }

      const gap = Math.max(100, Math.floor(CYCLE_MS / nodes.length));
      console.log(`Cycle start: ${nodes.length} nodes, gap = ${gap} ms`);

      for (const node of nodes) {
        if (isPaused) {
          console.log('⏸️ Cycle paused mid-loop, waiting...');
          await pausePromise;
        }

        const { ip, port, node_id } = node;
        const res = await sendAndAwaitResponse(ip, port, 'C:!');

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
            insertOFFStatus(node_id)
            nodes = nodes.filter(n => n.node_id !== node_id)
            faultCounts.delete(peerKey)
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

module.exports.sendUDP = async function sendUDPMessage(node_id, command) {
  try {
    pauseCycle(); // 🔹 pause the main loop first

    let message = "O:";
    switch (command) {
      case 1: message += '1'; break;
      case 2: message += '2'; break;
      case 3: message += '4'; break;
      case 4: message += '8'; break;
    }
    message += '!'
    const buf = Buffer.from(message);
    const target = nodes.find(node => node.node_id === node_id);

    if (!target) {
      resumeCycleLoop();
      return { success: false, reason: 'node_not_found' };
    }
    const result = await sendAndAwaitResponse(target.ip, target.port, message);

    resumeCycleLoop(); // 🔹 resume cycle after completion
    return { success: true, result};

  } catch (err) {
    console.error('sendUDPMessage error:', err);
    resumeCycleLoop();
    return { success: false, reason: err };
  }
};

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
