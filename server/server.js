import { sendTCP } from './iot_server.js';
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import moment from 'moment';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(cors({
  origin: process.env.BE_CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(cookieParser(process.env.COOKIE_SECRET));

// ── Connection pool (auto-reconnects, handles concurrency) ───────────────────
const database = mysql.createPool({
  host: process.env.BE_DB_HOST,
  user: process.env.BE_DB_USER,
  password: process.env.BE_DB_PASS,
  database: process.env.BE_DB_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ── Middleware ───────────────────────────────────────────────────────────────

function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized: no token' });

  jwt.verify(token, process.env.BE_JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
}

function Decode(data) {
  return crypto.createHmac('sha256', process.env.BE_SECRET_KEY)
    .update(data)
    .digest('hex');
}

// ── Auth ─────────────────────────────────────────────────────────────────────

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'Нэвтрэх нэр болон нууц үгээ оруулна уу!' });

  database.query(
    'SELECT * FROM ajiltan WHERE ajiltan_id = ?',
    [username.toUpperCase()],
    async (err, results) => {
      if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
      if (results.length === 0)
        return res.status(401).json({ message: 'Хэрэглэгч олдсонгүй' });

      const user = results[0];
      const storedPass = user.ajiltan_pass ?? '';

      // Detect legacy plain-text passwords (bcrypt hashes always start with $2b$)
      const isBcrypt = storedPass.startsWith('$2b$') || storedPass.startsWith('$2a$');

      let match = false;
      if (isBcrypt) {
        match = await bcrypt.compare(password, storedPass).catch(() => false);
      } else {
        // Plain-text legacy password — compare directly, then auto-upgrade to bcrypt
        match = storedPass === password;
        if (match) {
          const hashed = await bcrypt.hash(password, 12);
          database.query(
            'UPDATE ajiltan SET ajiltan_pass = ? WHERE ajiltan_id = ?',
            [hashed, user.ajiltan_id],
            (upgradeErr) => {
              if (upgradeErr) console.error('Password upgrade failed:', upgradeErr);
              else console.log(`Password auto-upgraded for ${user.ajiltan_id}`);
            }
          );
        }
      }

      if (!match)
        return res.status(401).json({ message: 'Нууц үг буруу байна' });

      const token = jwt.sign(
        { id: user.ajiltan_id, role: user.ajiltan_turul, username: user.ajiltan_ner },
        process.env.BE_JWT_SECRET,
        { expiresIn: '6h' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 6 * 60 * 60 * 1000,
      });

      res.json({
        message: 'Амжилттай нэвтэрлээ',
        token,
        type: Decode(user.ajiltan_turul.toString()),
      });
    }
  );
});

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

app.get('/verify', verifyToken, (req, res) => {
  res.json({ message: 'Authenticated', user: req.user });
});

// ── IoT command ──────────────────────────────────────────────────────────────

app.post('/send-udp', verifyToken, async (req, res) => {
  try {
    const { node_id, command } = req.body;
    if (node_id == null || command == null)
      return res.status(400).json({ error: 'node_id and command are required' });

    const result = await sendTCP(node_id, command);
    if (result.success) {
      res.json({ status: 'ok', message: result.result });
    } else {
      res.json({ status: 'failed', message: result.reason });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Admin reference data ─────────────────────────────────────────────────────

app.post('/admin', verifyToken, (req, res) => {
  const action = req.body.action;

  const queries = {
    getAjiltanLavlah: 'SELECT * FROM ajiltan_turul',
    getStateLavlah:   'SELECT * FROM state',
    getCommandLavlah: 'SELECT * FROM command',
    one:   'SELECT COUNT(*) as num FROM ajiltan_turul',
    two:   'SELECT COUNT(*) as num FROM state',
    three: 'SELECT COUNT(*) as num FROM command',
  };

  if (action === 'usertype') {
    const q = `SELECT turul_ner, COUNT(ajiltan_turul) as num FROM ajiltan
               LEFT JOIN ajiltan_turul ON ajiltan_turul.turul_id = ajiltan_turul
               GROUP BY ajiltan_turul`;
    return database.query(q, (err, data) => {
      if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
      res.json(data);
    });
  }

  if (queries[action]) {
    return database.query(queries[action], (err, data) => {
      if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
      res.json(data);
    });
  }

  res.status(400).json({ message: 'Unknown action' });
});

// ── Header stats ─────────────────────────────────────────────────────────────

app.post('/header', verifyToken, (req, res) => {
  const q = `SELECT COUNT(*) as num FROM node UNION SELECT COUNT(*) FROM ajiltan`;
  database.query(q, (err, data) => {
    if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
    res.json({ data });
  });
});

// ── Profile (password change) ────────────────────────────────────────────────

app.post('/profile', verifyToken, (req, res) => {
  const { user: id, newP, old } = req.body;

  if (!id || !newP || !old)
    return res.status(400).json({ message: 'Бүх талбарыг бөглөнө үү' });

  database.query(
    'SELECT ajiltan_pass FROM ajiltan WHERE ajiltan_id = ?',
    [id],
    async (err, data) => {
      if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
      if (data.length === 0) return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй' });

      const match = await bcrypt.compare(old, data[0].ajiltan_pass).catch(() => false);
      if (!match)
        return res.json({ message: 'Өмнөх нууц үг буруу байна' });

      const hashed = await bcrypt.hash(newP, 12);
      database.query(
        'UPDATE ajiltan SET ajiltan_pass = ? WHERE ajiltan_id = ?',
        [hashed, id],
        (err2) => {
          if (err2) return res.status(500).json({ message: 'Серверийн алдаа' });
          res.json({ message: 'Амжилттай шинэчлэгдлээ' });
        }
      );
    }
  );
});

// ── Main data endpoint ───────────────────────────────────────────────────────

app.post('/mid', verifyToken, (req, res) => {
  const action = req.body.action;

  if (action === 'fav_node') {
    const id = req.body.user;
    const q = `
      SELECT n.node_id, n.node_name, l.log_command_hc, l.log_command_hw,
             l.log_command_wc, l.log_sensor, star.star_node
      FROM node n
      LEFT JOIN (
        SELECT nl.log_command_hc, nl.log_command_hw, nl.log_command_wc, nl.log_sensor, nl.log_node
        FROM node_log nl
        JOIN (SELECT log_node, MAX(log_date) AS max_log_date FROM node_log GROUP BY log_node) latest
        ON nl.log_node = latest.log_node AND nl.log_date = latest.max_log_date
      ) l ON n.node_id = l.log_node
      RIGHT JOIN (SELECT * FROM star WHERE star_ajil = ?) star ON n.node_id = star.star_node
      ORDER BY n.node_id`;
    return database.query(q, [id], (err, data) => {
      if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
      res.json({ data });
    });
  }

  if (action === 'log') {
    const node = Number(req.body.node);
    const start = req.body.start;
    const end = req.body.end;
    const q = `SELECT * FROM node_log
               WHERE log_date BETWEEN ? AND ? AND log_node = ?`;
    return database.query(q, [start + ' 00:00', end + ' 23:59', node], (err, data) => {
      if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
      res.json({ data });
    });
  }

  if (action === 'statistic') {
    const node = Number(req.body.node);
    const date = req.body.date;
    const q = `SELECT * FROM node_log
               WHERE log_date BETWEEN ? AND ? AND log_node = ?`;
    return database.query(q, [date + ' 00:00', date + ' 23:59', node], (err, data) => {
      if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
      res.json({ data });
    });
  }

  if (action === 'getUser') {
    const id = req.body.user;
    const q = `SELECT a.ajiltan_id, a.ajiltan_ovog, a.ajiltan_ner, a.ajiltan_utas,
                      a.ajiltan_email, t.turul_ner
               FROM ajiltan a
               LEFT JOIN ajiltan_turul t ON a.ajiltan_turul = t.turul_id
               WHERE a.ajiltan_id = ?`;
    return database.query(q, [id], (err, data) => {
      if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
      res.json(data);
    });
  }

  if (action === 'fetch_node') {
    const id = req.body.user;
    const q = `
      SELECT n.node_id, n.node_name, l.log_command_hc, l.log_command_hw,
             l.log_command_wc, l.log_sensor, star.star_node
      FROM node n
      LEFT JOIN (
        SELECT nl.log_command_hc, nl.log_command_hw, nl.log_command_wc, nl.log_sensor, nl.log_node
        FROM node_log nl
        JOIN (SELECT log_node, MAX(log_date) AS max_log_date FROM node_log GROUP BY log_node) latest
        ON nl.log_node = latest.log_node AND nl.log_date = latest.max_log_date
      ) l ON n.node_id = l.log_node
      LEFT JOIN (SELECT * FROM star WHERE star_ajil = ?) star ON n.node_id = star.star_node
      ORDER BY star.star_node DESC`;
    return database.query(q, [id], (err, data) => {
      if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
      res.json({ data });
    });
  }

  if (action === 'add_log') {
    const node_id = req.body.id;
    const ajiltan = req.body.user;
    const cmd = req.body.cmd;
    database.query(
      'SELECT log_id FROM node_log WHERE log_node = ? ORDER BY log_date DESC LIMIT 1',
      [node_id],
      (err, data) => {
        if (err || data.length === 0)
          return res.json({ message: 'Команд илгээхэд алдаа гарлаа' });

        const log_id = data[0].log_id;
        const time = moment().format('YYYY-MM-DD HH:mm:ss');
        database.query(
          'INSERT INTO command_log VALUES (null, ?, ?, ?, ?)',
          [time, log_id, ajiltan, cmd],
          (err2) => {
            if (err2) return res.json({ message: 'Команд илгээхэд алдаа гарлаа' });
            res.json({ message: 'Команд амжилттай илгээлээ' });
          }
        );
      }
    );
    return;
  }

  if (action === 'star') {
    if (req.body.state) {
      database.query(
        'INSERT INTO star VALUES (null, ?, ?)',
        [Number(req.body.node), req.body.user],
        (err) => {
          if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
          res.json({ message: 'done' });
        }
      );
    } else {
      database.query(
        'DELETE FROM star WHERE star_node = ? AND star_ajil = ?',
        [Number(req.body.node), req.body.user],
        (err) => {
          if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
          res.json({ message: 'done' });
        }
      );
    }
    return;
  }

  if (action === 'fetch_log') {
    const id = req.body.search;
    let q, params;
    if (id.length > 5) {
      q = `SELECT c.cmd_date, n.node_id, n.node_name, s.state_name, c.cmd_ajiltan,
                  com.command_name, com.command_info
           FROM command_log c
           LEFT JOIN node_log l ON c.cmd_log = l.log_id
           INNER JOIN node n ON l.log_node = n.node_id
           INNER JOIN state s ON s.state_id = l.log_state
           INNER JOIN command com ON c.cmd_command = com.command_id
           WHERE c.cmd_ajiltan = ?
           ORDER BY c.cmd_date DESC`;
      params = [id];
    } else {
      q = `SELECT c.cmd_date, n.node_id, n.node_name, s.state_name, c.cmd_ajiltan,
                  com.command_name, com.command_info
           FROM command_log c
           LEFT JOIN node_log l ON c.cmd_log = l.log_id
           INNER JOIN node n ON l.log_node = n.node_id
           INNER JOIN state s ON s.state_id = l.log_state
           INNER JOIN command com ON c.cmd_command = com.command_id
           WHERE l.log_node = ?
           ORDER BY c.cmd_date DESC`;
      params = [id];
    }
    return database.query(q, params, (err, data) => {
      if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
      res.json(data);
    });
  }

  if (action === 'fetch_last_log') {
    const id = req.body.id;
    return database.query(
      'SELECT * FROM node_log WHERE log_node = ? ORDER BY log_date DESC LIMIT 1',
      [id],
      (err, data) => {
        if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
        res.json(data);
      }
    );
  }

  if (action === 'dash_node_log') {
    return database.query(
      'SELECT * FROM node_log ORDER BY log_date DESC LIMIT 5',
      (err, data) => {
        if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
        res.json({ data });
      }
    );
  }

  if (action === 'search') {
    const id = `%${req.body.id}%`;
    return database.query(
      'SELECT * FROM node WHERE node_id LIKE ? OR node_name LIKE ? OR node_address LIKE ?',
      [id, id, id],
      (err, data) => {
        if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
        res.json(data);
      }
    );
  }

  if (action === 'dash_log') {
    return database.query(
      `SELECT c.cmd_date, n.node_id, n.node_name, s.state_name, c.cmd_ajiltan, com.command_name
       FROM command_log c
       LEFT JOIN node_log l ON c.cmd_log = l.log_id
       INNER JOIN node n ON l.log_node = n.node_id
       INNER JOIN state s ON s.state_id = l.log_state
       INNER JOIN command com ON c.cmd_command = com.command_id
       ORDER BY c.cmd_date DESC LIMIT 5`,
      (err, data) => {
        if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
        res.json({ data });
      }
    );
  }

  if (action === 'fetch_single_node_log') {
    return database.query(
      'SELECT * FROM node_log WHERE log_node = ? ORDER BY log_date DESC LIMIT 10',
      [req.body.id],
      (err, data) => {
        if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
        res.json({ data });
      }
    );
  }

  if (action === 'fetch_single_node') {
    const id = req.body.id;
    const q = `
      SELECT n.node_id, n.node_name, l.log_command_hc, l.log_command_hw,
             l.log_command_wc, l.log_sensor
      FROM node n
      LEFT JOIN (
        SELECT nl.log_command_hc, nl.log_command_hw, nl.log_command_wc, nl.log_sensor, nl.log_node
        FROM node_log nl
        JOIN (SELECT log_node, MAX(log_date) AS max_log_date FROM node_log GROUP BY log_node) latest
        ON nl.log_node = latest.log_node AND nl.log_date = latest.max_log_date
      ) l ON n.node_id = l.log_node
      WHERE n.node_id = ?
      ORDER BY n.node_id ASC LIMIT 1`;
    return database.query(q, [id], (err, data) => {
      if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
      res.json({ data });
    });
  }

  res.status(400).json({ message: 'Unknown action' });
});

// ── Operator (node/user CRUD) ────────────────────────────────────────────────

app.post('/operator', verifyToken, (req, res) => {
  const action = req.body.action;

  if (action === 'add_node') {
    const { node_id, node_name, node_address } = req.body.info;
    return database.query(
      'INSERT INTO node VALUES (?, ?, ?)',
      [node_id, node_name, node_address],
      (err) => {
        if (err) return res.json({ message: 'Зангилаа нэмэхэд алдаа гарлаа' });
        res.json({ message: 'Зангилаа амжилттай нэмэгдлээ' });
      }
    );
  }

  if (action === 'fetch_single_node') {
    return database.query(
      'SELECT * FROM node WHERE node_id = ?',
      [Number(req.body.nodeID)],
      (err, data) => {
        if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
        res.json(data);
      }
    );
  }

  if (action === 'edit_node') {
    const { node_id, node_name, node_address } = req.body.info;
    return database.query(
      'UPDATE node SET node_name = ?, node_address = ? WHERE node_id = ?',
      [node_name, node_address, node_id],
      (err) => {
        if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
        res.json({ message: 'Амжилттай засварлалаа' });
      }
    );
  }

  if (action === 'delete_node') {
    return database.query(
      'DELETE FROM node WHERE node_id = ?',
      [req.body.id],
      (err) => {
        if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
        res.json({ message: 'Амжилттай устгагдлаа' });
      }
    );
  }

  if (action === 'add_user') {
    const { ajiltan_id, ajiltan_ner, ajiltan_ovog, ajiltan_utas, ajiltan_email } = req.body.info;
    return database.query(
      'INSERT INTO ajiltan (ajiltan_id, ajiltan_ner, ajiltan_ovog, ajiltan_utas, ajiltan_email) VALUES (?, ?, ?, ?, ?)',
      [ajiltan_id, ajiltan_ner, ajiltan_ovog, ajiltan_utas, ajiltan_email],
      (err) => {
        if (err) return res.json({ message: 'Хэрэглэгч нэмэхэд алдаа гарлаа!' });
        res.json({ message: 'Хэрэглэгч амжилттай нэмэгдлээ' });
      }
    );
  }

  if (action === 'delete_user') {
    return database.query(
      'DELETE FROM ajiltan WHERE ajiltan_id = ?',
      [req.body.id],
      (err) => {
        if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
        res.json({ message: 'Амжилттай устгагдлаа' });
      }
    );
  }

  if (action === 'fetch_user') {
    return database.query(
      `SELECT a.ajiltan_id, a.ajiltan_ovog, a.ajiltan_ner, a.ajiltan_utas,
              a.ajiltan_email, t.turul_ner
       FROM ajiltan a LEFT JOIN ajiltan_turul t ON a.ajiltan_turul = t.turul_id`,
      (err, data) => {
        if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
        res.json(data);
      }
    );
  }

  if (action === 'fetch_single_user') {
    return database.query(
      `SELECT a.ajiltan_id, a.ajiltan_ovog, a.ajiltan_ner, a.ajiltan_utas,
              a.ajiltan_email, t.turul_ner
       FROM ajiltan a
       LEFT JOIN ajiltan_turul t ON a.ajiltan_turul = t.turul_id
       WHERE a.ajiltan_id = ?`,
      [req.body.id],
      (err, data) => {
        if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
        res.json(data);
      }
    );
  }

  if (action === 'update_user') {
    const { ajiltan_id, ajiltan_ovog, ajiltan_ner, ajiltan_utas, ajiltan_email } = req.body.info;
    return database.query(
      `UPDATE ajiltan SET ajiltan_ovog = ?, ajiltan_ner = ?, ajiltan_utas = ?, ajiltan_email = ?
       WHERE ajiltan_id = ?`,
      [ajiltan_ovog, ajiltan_ner, ajiltan_utas, ajiltan_email, ajiltan_id],
      (err) => {
        if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
        res.json({ message: 'Амжилттай шинэчиллээ' });
      }
    );
  }

  if (action === 'xlsx_node') {
    return database.query(
      'SELECT * FROM node_log WHERE log_node = ?',
      [req.body.id],
      (err, data) => {
        if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
        res.json(data);
      }
    );
  }

  if (action === 'xlsx_user') {
    return database.query(
      'SELECT * FROM command_log WHERE cmd_ajiltan = ?',
      [req.body.id],
      (err, data) => {
        if (err) return res.status(500).json({ message: 'Серверийн алдаа' });
        res.json(data);
      }
    );
  }

  res.status(400).json({ message: 'Unknown action' });
});

app.listen(3001, () => {
  console.log('Server started on port 3001');
});
