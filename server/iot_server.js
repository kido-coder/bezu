import { createServer } from 'net';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 9000;
const HOST = '0.0.0.0';
const CYCLE_MS = 5 * 1000;
const RESPONSE_TIMEOUT_MS = 4 * 1000;
const MAX_FAULTS_BEFORE_ALERT = 3;

/** nodeId (number) → net.Socket */
const sockets = new Map();
/** nodeId (number) → { timer, resolve } */
const pending = new Map();
const faultCounts = new Map();

let db;
let nodes = [];

let isPaused = false;
let pausePromise = null;
let resumeCycle = null;
let cancelSleep = null;

// ── Database ────────────────────────────────────────────────────────────────

async function initDb() {
  db = await mysql.createConnection({
    host: process.env.BE_DB_HOST,
    user: process.env.BE_DB_USER,
    password: process.env.BE_DB_PASS,
    database: process.env.BE_DB_DB,
  });
  console.log('DB connected');
}

async function getNode() {
  try {
    const [rows] = await db.execute(
      `SELECT node_id, node_ip, node_port FROM node WHERE node_status = 'ON'`
    );
    nodes = rows.map(r => ({
      node_id: r.node_id,
      ip: r.node_ip,
      port: Number(r.node_port),
    }));
    console.log('Nodes loaded:', nodes);
  } catch (err) {
    console.error('Error fetching nodes:', err);
  }
}

async function upsertNode(nodeId, ip, port) {
  await db.execute(
    `INSERT INTO node (node_id, node_ip, node_port, node_status)
     VALUES (?, ?, ?, 'ON')
     ON DUPLICATE KEY UPDATE node_ip = VALUES(node_ip), node_port = VALUES(node_port), node_status = 'ON'`,
    [nodeId, ip, String(port)]
  );
  console.log(`Upserted node ${nodeId} -> ${ip}:${port}`);
}

async function insertTransaction(nodeId, value) {
  // Command_HC Command_HW Command_WC Pres[8] Temp[7]
  // 111113020260251101050604000011001102025025EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
  const Command_HC = value.substring(0, 14)
  const Command_HW = value.substring(14, 28)
  const Command_WC = value.substring(28, 42)
  const sensors = value.substring(42, 87);

  const now = new Date();

  const formatted =
    now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0');
  const query = `INSERT INTO node_log VALUES (null, '${nodeId}', '${formatted}', '${Command_HC}', '${Command_HW}', '${Command_WC}', '${sensors}')`;
  try {
    await db.execute(
      query
    );
  } catch (err) {
    console.error('Error inserting log:', err);
  }
}

async function insertOFFStatus(nodeId) {
  try {
    await db.execute(
      `UPDATE node SET node_status = 'OFF' WHERE node_id = ?`,
      [Number(nodeId)]
    );
    console.log(`Node ${nodeId} marked OFF`);
  } catch (err) {
    console.error('Error marking node OFF:', err);
  }
}

// ── Message parsing ──────────────────────────────────────────────────────────

function parseRMessage(msgStr) {
  msgStr = msgStr.trim();
  if (!msgStr.startsWith('R') || !msgStr.endsWith('!')) return null;
  const inner = msgStr.slice(2, -1);
  return inner || null;
}

function checkCRC(msgStr, crc_sum) {
  const expected = parseInt(crc_sum, 16);
  let sum = 0;
  for (const char of msgStr) {
    sum ^= char.charCodeAt(0);
  }
  return expected === sum;
}

function parseAMessage(msgStr) {
  msgStr = msgStr.trim();
  if (!msgStr.startsWith('A') || !msgStr.endsWith('!')) return null;
  msgStr = msgStr.slice(0, -1);
  const nodeId = parseInt(msgStr.slice(2, 5), 16);
  const value = msgStr.slice(5, -3);
  const crc = msgStr.slice(-2);
  if (isNaN(nodeId) || value.length === 0) return null;
  if (!checkCRC(value, crc)) return null;
  return { nodeId, value };
}

// ── Cycle pause/resume ───────────────────────────────────────────────────────

function pauseCycle() {
  if (isPaused) return;
  isPaused = true;
  pausePromise = new Promise(resolve => { resumeCycle = resolve; });
}

function resumeCycleLoop() {
  if (!isPaused) return;
  isPaused = false;
  resumeCycle?.();
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve('done'), ms);
    cancelSleep = () => {
      clearTimeout(timer);
      resolve('cancelled');
    };
  });
}

function sendAndAwaitResponse(nodeId, socket, message) {
  return new Promise(resolve => {
    if (pending.has(nodeId)) return resolve({ success: false, reason: 'busy' });

    const timer = setTimeout(() => {
      pending.delete(nodeId);
      resolve({ success: false, reason: 'timeout' });
    }, RESPONSE_TIMEOUT_MS);

    pending.set(nodeId, {
      timer,
      resolve: data => resolve({ success: true, data }),
    });

    socket.write(message, 'utf8', err => {
      if (err) {
        clearTimeout(timer);
        pending.delete(nodeId);
        resolve({ success: false, reason: 'send_error' });
      }
    });
  });
}

// ── Public API (used by server.js) ───────────────────────────────────────────

export async function sendTCP(node_id, command) {
  const id = Number(node_id);
  const socket = sockets.get(id);
  if (!socket || socket.destroyed) return { success: false, reason: 'node_not_found' };

  pauseCycle();
  return new Promise(resolve => {
    // socket.write(`O:${command}!`, 'utf8', err => {
    socket.write(`${command}!`, 'utf8', err => {
      resumeCycleLoop();
      if (err) return resolve({ success: false, reason: 'send_error' });
      resolve({ success: true, result: 'Амжилттай илгээлээ' });
    });
  });
}

// ── Message handler ──────────────────────────────────────────────────────────

async function handleMessage(msgStr, socket, onRegister) {
  const rId = parseRMessage(msgStr);
  if (rId !== null) {
    const id = parseInt(rId, 16);
    onRegister(id);
    await upsertNode(id, socket.remoteAddress, socket.remotePort);
    sockets.set(id, socket);

    const idx = nodes.findIndex(n => n.node_id === id);
    if (idx !== -1) {
      nodes[idx].ip = socket.remoteAddress;
      nodes[idx].port = socket.remotePort;
    } else {
      nodes.push({ node_id: id, ip: socket.remoteAddress, port: socket.remotePort });
    }

    socket.write('X:!', 'utf8');
    cancelSleep?.();
    console.log(`Node ${id} registered from ${socket.remoteAddress}`);
    return;
  }

  const parsed = parseAMessage(msgStr);
  if (parsed) {
    const { nodeId, value } = parsed;
    const entry = pending.get(nodeId);
    if (entry) {
      clearTimeout(entry.timer);
      entry.resolve({ nodeId, value });
      pending.delete(nodeId);
      faultCounts.set(nodeId, 0);
    } else {
      await insertTransaction(nodeId, value);
    }
  }
}

// ── TCP server ───────────────────────────────────────────────────────────────

const tcpServer = createServer(socket => {
  let nodeId = null;
  let buf = '';

  socket.on('data', async chunk => {
    buf += chunk.toString('utf8');
    let idx;
    while ((idx = buf.indexOf('!')) !== -1) {
      const msg = buf.slice(0, idx + 1).trim();
      buf = buf.slice(idx + 1);
      if (msg) await handleMessage(msg, socket, id => { nodeId = id; });
    }
  });

  socket.on('close', () => {
    if (nodeId !== null) {
      sockets.delete(nodeId);
      nodes = nodes.filter(n => n.node_id !== nodeId);
      insertOFFStatus(nodeId).catch(() => { });
      console.log(`Node ${nodeId} disconnected`);
    }
  });

  socket.on('error', err => {
    console.error(`Socket error (node ${nodeId ?? 'unregistered'}):`, err.message);
  });
});

// ── Cycle loop ───────────────────────────────────────────────────────────────

async function cycleLoop() {
  while (true) {
    try {
      if (nodes.length === 0) {
        console.log('No active nodes, waiting 30s...');
        await sleep(30 * 1000);
        continue;
      }

      const gap = Math.max(100, Math.floor(CYCLE_MS / nodes.length));
      console.log(`Cycle: ${nodes.length} node(s), gap=${gap}ms`);

      for (const node of [...nodes]) {
        if (isPaused) {
          console.log('Cycle paused, waiting...');
          await pausePromise;
        }

        const socket = sockets.get(node.node_id);
        if (!socket || socket.destroyed) {
          await sleep(gap);
          continue;
        }

        const res = await sendAndAwaitResponse(node.node_id, socket, 'C:!');

        if (res.success) {
          const { nodeId, value } = res.data;
          await insertTransaction(nodeId, value);
          faultCounts.set(node.node_id, 0);
        } else {
          const prev = faultCounts.get(node.node_id) || 0;
          const next = prev + 1;
          faultCounts.set(node.node_id, next);
          console.warn(`Node ${node.node_id} no response (${res.reason}). faults=${next}`);
          if (next >= MAX_FAULTS_BEFORE_ALERT) {
            await insertOFFStatus(node.node_id);
            nodes = nodes.filter(n => n.node_id !== node.node_id);
            faultCounts.delete(node.node_id);
          }
        }

        await sleep(gap);
      }
    } catch (err) {
      console.error('cycleLoop error:', err);
      await sleep(5000);
    }
  }
}

// ── Start ────────────────────────────────────────────────────────────────────

async function start() {
  await initDb();
  await getNode();

  tcpServer.on('error', err => {
    console.error('TCP server error:', err);
  });

  tcpServer.listen(PORT, HOST, () => {
    console.log(`TCP server listening on ${HOST}:${PORT}`);
  });

  cycleLoop().catch(err => console.error('cycleLoop fatal:', err));

  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    tcpServer.close();
    if (db) await db.end();
    process.exit(0);
  });
}

start().catch(err => {
  console.error('Startup failed:', err);
  process.exit(1);
});
