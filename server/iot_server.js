// udp_server.js
require('dotenv').config();

const isTest = 1;
let testCounter = 0;

const dgram = require('dgram');
const mysql = require('mysql2/promise');

const PORT = 8888;
const HOST = '0.0.0.0';
// const CYCLE_MS = 3 * 60 * 1000; // 5 minutes total cycle
const CYCLE_MS = 5 * 1000; // 5 second test cycle
const RESPONSE_TIMEOUT_MS = 4 * 1000; // 4 seconds
const MAX_FAULTS_BEFORE_ALERT = 3;

const server = dgram.createSocket('udp4');
const pending = new Map(); // key = ip:port
const faultCounts = new Map();

let db;
let nodes = [];

let isPaused = false;
let cancelled = false;
let pausePromise = null;
let resumeCycle = null;

// Database connection
async function initDb() {
  db = await mysql.createConnection({
    host: process.env.BE_DB_HOST,
    user: process.env.BE_DB_USER,
    password: process.env.BE_DB_PASS,
    database: process.env.BE_DB_DB
  });
  console.log('Connected to MySQL');
}

//Get node from database
async function getNode() {
  try {
    const [rows] = await db.execute(`SELECT node_id, node_ip, node_port FROM node WHERE node_status = 'ON';`);

    nodes = rows.map(r => ({
      node_id: r.node_id,
      ip: r.node_ip,
      port: Number(r.node_port)
    }));
    console.log('Nodes updated:', nodes);
  } catch (err) {
    console.error('Error fetching nodes:', err);
  }
}

//Insert new node into database
async function upsertNode(nodeId, ip, port) {
  const sql = `
    INSERT INTO node (node_id, node_ip, node_port, node_status)
    VALUES (?, ?, ?, 'ON')
    ON DUPLICATE KEY UPDATE node_ip = VALUES(node_ip), node_port = VALUES(node_port), node_status = "ON";
  `;
  await db.execute(sql, [nodeId, ip, String(port)]);
  console.log(`Upserted node ${nodeId} -> ${ip}:${port}`);
}

//Insert new log into database
async function insertTransaction(nodeId, value) {
  const sql = `INSERT INTO node_log (log_node, log_sys_state) VALUES (?, ?)`;
  try {
    await db.execute(sql, [nodeId, String(value)]);
    console.log(`Inserted transaction for ${nodeId}: ${value}`);
  } catch (err) {
    console.error('Error inserting transaction:', err);
  }
}

//Update node status on database
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

//Parse Registration from node
function parseRMessage(msgStr) {
  msgStr = msgStr.trim();
  if (!msgStr.startsWith('R') || !msgStr.endsWith('!')) return null;

  const inner = msgStr.slice(2, -1);

  return inner || null;
}

function checkCRC (msgStr) {
  let message = msgStr.slice(0, -1);
  let crc_sum = msgStr.slice(-2);
  crc_sum = parseInt(crc_sum, 16);
  
  let sum = 0;
  
  for (const char of message) {
    sum ^= char
  }
  
  if (crc_sum === sum)
    return true
  else 
    return false
}

//Parse Cyclic Response (A) from node
function parseAMessage(msgStr) {
  msgStr = msgStr.trim();
  if (!msgStr.startsWith('A') || !msgStr.endsWith('!')) return null;

  const nodeId = parseInt(msgStr.slice(2, 5), 16);
  const value = msgStr.slice(5, -1);

  if (isNaN(nodeId) || isNaN(value)) return null;
  if (!checkCRC(value)) return null;

  value = value.slice(-1);
  return { nodeId, value };
}


//Pausing main cycle for user command
function pauseCycle() {
  if (isPaused) return;
  console.log('⏸️ Pausing cycle loop...');
  isPaused = true;
  pausePromise = new Promise(resolve => (resumeCycle = resolve));
}

//Resuming main cycle after user command
function resumeCycleLoop() {
  if (!isPaused) return;
  console.log('▶️ Resuming cycle loop...');
  isPaused = false;
  resumeCycle();
}

module.exports.sendUDP = async function sendUDPMessage(node_id, command) {
  if (command === 1 || command === 2 || command === 4 || command === 8) {
    try {
      const target = nodes.find(node => node.node_id === node_id);
      if (!target) {
        resumeCycleLoop();
        return { success: false, reason: 'node_not_found' };
      }

      pauseCycle(); // 🔹 pause the main loop first
      let message = "O:";
      message = message + command + "!";
      const result = await sendAndAwaitResponse(target.ip, target.port, message);

      resumeCycleLoop();
      return { success: true, result };

    } catch (err) {
      console.error('sendUDPMessage error:', err);
      resumeCycleLoop();
      return { success: false, reason: err };
    }
  }
};

//Handle incoming message
server.on('message', async (msgBuf, rinfo) => {
  const msgStr = msgBuf.toString('utf8').trim();

  if (!isTest) {
    //Check type of message is A
    const parsed = parseAMessage(msgStr);
    if (parsed) {
      const { nodeId, value } = parsed;
      const newNode = {
        node_id: nodeId,
        ip: rinfo.address,
        port: Number(rinfo.port)
      };

      //Tag alga bolj bgaad genet supriiz mada faka geel orj ireh nuhtsul
      if (!nodes.includes(newNode))
        await upsertNode(nodeId, rinfo.address, rinfo.port);

      const peerKey = `${rinfo.address}:${rinfo.port}`;
      const pendingEntry = pending.get(peerKey);
      if (pendingEntry) {
        clearTimeout(pendingEntry.timer);
        pendingEntry.resolve({ nodeId, value, msg: msgStr, rinfo });
        pending.delete(peerKey);
        faultCounts.set(peerKey, 0);
      } else {
        console.log(`Asuugaagui bhad yavuulchihiin xD ${peerKey}: ${msgStr}`);
        await insertTransaction(nodeId, value);
      }
      return;
    } else {
      //Check type of message is R
      const nodeIdFromR = parseRMessage(msgStr);
      if (nodeIdFromR) {
        nodeId = parseInt(nodeIdFromR, 16);
        await upsertNode(nodeId, rinfo.address, rinfo.port);

        const index = nodes.findIndex(n => n.node_id === nodeId);

        if (index !== -1) {
          nodes[index].ip = rinfo.address;
          nodes[index].port = Number(rinfo.port);
        } else {
          const newNode = {
            node_id: nodeId,
            ip: rinfo.address,
            port: Number(rinfo.port)
          };
          nodes.push(newNode);
        }

        cancelled = true;

        //Sending Registration Accepted packet to node
        const message = Buffer.from("X:!");
        server.send(message, rinfo.port, rinfo.address, (err) => {
          if (err) {
            console.error(`Error sending X :`, err);
          } else {
            console.log(`Sent X`);
          }
        });
        return;
      }
    }
  } else {
    console.log(msgStr)
    const nodeIdFromR = parseRMessage(msgStr);
    if (nodeIdFromR) {
      nodeId = parseInt(nodeIdFromR, 16);
      await upsertNode(nodeId, rinfo.address, rinfo.port);

      const index = nodes.findIndex(n => n.node_id === nodeId);

      if (index !== -1) {
        nodes[index].ip = rinfo.address;
        nodes[index].port = Number(rinfo.port);
      } else {
        const newNode = {
          node_id: nodeId,
          ip: rinfo.address,
          port: Number(rinfo.port)
        };
        nodes.push(newNode);
      }

      cancelled = true;

      //Sending Registration Accepted packet to node
      const message = Buffer.from("X:!");
      server.send(message, rinfo.port, rinfo.address, (err) => {
        if (err) {
          console.error(`Error sending X :`, err);
        } else {
          console.log(`Sent X`);
        }
      });
      return;
    }

    const parsed = parseAMessage(msgStr);
    if (parsed) {
      const { nodeId, value } = parsed;
      console.log(`${nodeId} : ${value}`)
    }
  }

  // console.log(`Unknown message from ${rinfo.address}:${rinfo.port}: ${msgStr}`);
});

function sleep(ms, priority) {
  return new Promise(async resolve => {
    const step = 10;
    for (let i = 0; i < ms; i += step) {
      if (cancelled && priority) return resolve("cancelled");
      await new Promise(r => setTimeout(r, step));
    }
    resolve("done");
  });
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
        console.error(`Error sending ${message} to ${peerKey}:`, err);
        resolve({ success: false, reason: 'send_error', error: err });
      } else {
        console.log(`Sent ${message} -> ${peerKey}`);
      }
    });
  });
}

async function cycleLoop() {
  while (true) {
    try {
      if (nodes.length === 0) {
        console.log('No nodes found in DB. Waiting 30s...');
        cancelled = false;
        await sleep(30 * 1000, true);
        continue;
      }

      const gap = Math.max(100, Math.floor(CYCLE_MS / nodes.length));
      console.log(`Cycle start: ${nodes.length} nodes, gap = ${gap} ms`);
      testCounter ++;

      if (!isTest) {
        for (const node of nodes) {
          const start = performance.now();
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
          const end = performance.now();
          let left = gap - (end - start);
          if (left > 0)
            await sleep(gap, false);
        }
      } else {
        for (const node of nodes) {
          const { ip, port, node_id } = node;
          let message = "";
          if (testCounter === 9) {
            message = Buffer.from('$#$112030!');
            testCounter = 0;
          } else {
            message = Buffer.from('C:!');
          }
          server.send(message, port, ip, (err) => {
            if (err) {
              console.error(`Error sending ${message} to ${node_id}:`, err);
            } else {
              console.log(`Sent ${message} -> ${node_id}`);
            }
          });
          await sleep(gap, false);
        }
      }
    } catch (err) {
      console.error('Error in cycleLoop:', err);
      await sleep(5000, true);
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
