import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { stringify } from 'csv-stringify/sync';

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/admin/', limiter);

// Simple in-memory user store for demo tokens
const SESSIONS = {
  'admin-token': { id: '1', username: 'superadmin', role: 'admin' },
  'auditor-token': { id: '2', username: 'auditor1', role: 'auditor' },
};

// Example logs
let AUDIT_LOGS = [];
for (let i = 0; i < 200; i++) {
  const ts = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 3600 * 1000));
  AUDIT_LOGS.push({
    id: uuidv4(),
    timestamp: ts.toISOString(),
    level: ['INFO','WARN','ERROR','LOGIN','SECURITY','CREATE','UPDATE','DELETE'][Math.floor(Math.random()*8)],
    user: { id: String(Math.floor(Math.random()*5)+1), username: ['alice','bob','carol','dave','system'][Math.floor(Math.random()*5)] },
    message: ['User login failed','Page updated','Settings changed','API key rotated','Order created'][Math.floor(Math.random()*5)],
    entity: ['User:123','Page:/about','Order:#1001','Settings:global'][Math.floor(Math.random()*4)],
    details: { sample: 'This is a mock detail', diff: { changed: true } },
    ipAddress: '192.168.' + (Math.floor(Math.random()*256)) + '.' + (Math.floor(Math.random()*256)),
    userAgent: 'MockAgent/1.0',
  });
}

const authMiddleware = (req, res, next) => {
  const h = req.headers['authorization'];
  const token = typeof h === 'string' && h.startsWith('Bearer ') ? h.split(' ')[1] : req.query.token || req.headers['x-api-token'];
  if (!token || !SESSIONS[token]) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = SESSIONS[token];
  next();
};

const requireRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};

const sanitize = (v) => {
  if (!v) return v;
  return String(v).replace(/[<>;()\\]/g, '');
};

const maskSensitive = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const out = Array.isArray(obj) ? [] : {};
  for (const k of Object.keys(obj)) {
    if (/pass(word)?|secret|token|api(key)?|ssn/i.test(k)) out[k] = '***';
    else if (typeof obj[k] === 'object') out[k] = maskSensitive(obj[k]);
    else out[k] = obj[k];
  }
  return out;
};

// GET /api/admin/audit-logs
app.get('/api/admin/audit-logs', authMiddleware, requireRole(['admin','auditor']), (req, res) => {
  // log access to audit trail
  AUDIT_LOGS.unshift({
    id: uuidv4(), timestamp: new Date().toISOString(), level: 'INFO', user: { id: req.user.id, username: req.user.username }, message: 'Audit logs viewed', entity: 'Audit', details: { ip: req.ip, query: req.query }
  });

  let results = [...AUDIT_LOGS];
  const { startDate, endDate, level, user, search, page = 1, limit = 50, sort = 'timestamp', order = 'desc' } = req.query;

  if (startDate) results = results.filter(r => new Date(r.timestamp) >= new Date(sanitize(startDate)));
  if (endDate) results = results.filter(r => new Date(r.timestamp) <= new Date(sanitize(endDate)));
  if (level) results = results.filter(r => (r.level || '').toString().toUpperCase() === sanitize(level).toUpperCase());
  if (user) results = results.filter(r => (r.user && (r.user.username || '').toString().toLowerCase()).includes(sanitize(user).toLowerCase()));
  if (search) {
    const s = sanitize(search).toLowerCase();
    results = results.filter(r => (r.message || '').toString().toLowerCase().includes(s) || JSON.stringify(r.details || '').toLowerCase().includes(s));
  }

  results = results.map(r => ({ ...r, details: maskSensitive(r.details) }));

  // sort
  results.sort((a,b) => {
    const av = a[sort] || '';
    const bv = b[sort] || '';
    if (order === 'asc') return av > bv ? 1 : av < bv ? -1 : 0;
    return av < bv ? 1 : av > bv ? -1 : 0;
  });

  const p = Math.max(1, parseInt(String(page)));
  const l = Math.max(1, Math.min(1000, parseInt(String(limit))));
  const start = (p - 1) * l;
  const pageSlice = results.slice(start, start + l);

  res.json({ total: results.length, page: p, limit: l, logs: pageSlice });
});

// POST /api/admin/export-logs
app.post('/api/admin/export-logs', authMiddleware, requireRole(['admin','auditor']), (req, res) => {
  const { filter = {}, format = 'csv' } = req.body || {};
  // minimal CSRF check
  const csrf = req.headers['x-csrf-token'];
  if (csrf !== 'demo-csrf-token') return res.status(400).json({ error: 'Missing CSRF token' });

  // reuse query logic
  const q = filter;
  let results = [...AUDIT_LOGS];
  if (q.startDate) results = results.filter(r => new Date(r.timestamp) >= new Date(sanitize(q.startDate)));
  if (q.endDate) results = results.filter(r => new Date(r.timestamp) <= new Date(sanitize(q.endDate)));
  if (q.level) results = results.filter(r => (r.level || '').toString().toUpperCase() === sanitize(q.level).toUpperCase());
  if (q.user) results = results.filter(r => (r.user && (r.user.username || '').toString().toLowerCase()).includes(sanitize(q.user).toLowerCase()));
  if (q.search) {
    const s = sanitize(q.search).toLowerCase();
    results = results.filter(r => (r.message || '').toString().toLowerCase().includes(s) || JSON.stringify(r.details || '').toLowerCase().includes(s));
  }
  results = results.map(r => ({ ...r, details: maskSensitive(r.details) }));

  if (format === 'json') {
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.json"');
    return res.json(results);
  }

  const records = results.map(r => ({ id: r.id, timestamp: r.timestamp, level: r.level, user: r.user?.username || (typeof r.user === 'string' ? r.user : ''), message: r.message, entity: r.entity, ip: r.ipAddress }));
  const csv = stringify(records, { header: true });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
  res.send(csv);
});

// POST /api/admin/audit-access - log access events
app.post('/api/admin/audit-access', authMiddleware, requireRole(['admin','auditor']), (req, res) => {
  const entry = { id: uuidv4(), timestamp: new Date().toISOString(), level: 'INFO', user: { id: req.user.id, username: req.user.username }, message: 'Audit page accessed', details: { filters: req.body.filters } };
  AUDIT_LOGS.unshift(entry);
  res.json({ ok: true });
});

const port = process.env.PORT || 4201;
app.listen(port, () => console.log(`Audit server running on http://localhost:${port}`));
