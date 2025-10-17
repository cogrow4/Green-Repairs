// Netlify Function: site-stats API
// Methods:
// - GET: return current stats { devicesRepaired }
// - PUT: update stats (admin only) { devicesRepaired }

const { getStore } = require('@netlify/blobs');
const fs = require('fs');
const path = require('path');

const STORE_NAME = 'site-stats';
const KEY = 'data.json';

// Local fallback paths for dev when Blobs isn't configured
const LOCAL_DIR = path.join(process.cwd(), '.netlify', 'blobs-dev');
const LOCAL_FILE = path.join(LOCAL_DIR, 'site-stats.json');

// Default stats
const DEFAULT_STATS = {
  devicesRepaired: 50
};

async function readStatsFromBlobs(store) {
  const data = await store.get(KEY, { type: 'json' });
  return data && typeof data === 'object' ? { ...DEFAULT_STATS, ...data } : DEFAULT_STATS;
}

async function writeStatsToBlobs(store, stats) {
  await store.set(KEY, JSON.stringify(stats), { contentType: 'application/json' });
}

function readStatsFromLocal() {
  try {
    if (!fs.existsSync(LOCAL_FILE)) return DEFAULT_STATS;
    const raw = fs.readFileSync(LOCAL_FILE, 'utf8');
    const data = JSON.parse(raw || '{}');
    return { ...DEFAULT_STATS, ...data };
  } catch { return DEFAULT_STATS; }
}

function writeStatsToLocal(stats) {
  if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true });
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(stats, null, 2), 'utf8');
}

function getIO() {
  // Prefer Blobs when available; otherwise local file fallback
  try {
    const store = getStore({ name: STORE_NAME });
    return {
      mode: 'blobs',
      read: () => readStatsFromBlobs(store),
      write: (stats) => writeStatsToBlobs(store, stats),
    };
  } catch (e) {
    return {
      mode: 'local',
      read: () => Promise.resolve(readStatsFromLocal()),
      write: (stats) => Promise.resolve(writeStatsToLocal(stats)),
    };
  }
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  String(header).split(';').forEach((p) => {
    const [k, ...v] = p.trim().split('=');
    out[k] = decodeURIComponent(v.join('='));
  });
  return out;
}

function verifyToken(token) {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const [username, exp, sig] = raw.split('.');
    const secret = process.env.ADMIN_SECRET || 'dev-insecure-secret-change-me';
    const expect = require('crypto').createHmac('sha256', secret).update(`${username}.${exp}`).digest('hex');
    if (expect !== sig) return false;
    if (Number.isNaN(Number(exp)) || Number(exp) < Math.floor(Date.now() / 1000)) return false;
    return username === 'admin';
  } catch { return false; }
}

function isAuthed(event) {
  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie);
  const token = cookies['gr_admin'];
  if (!token) return false;
  return verifyToken(token);
}

exports.handler = async function (event) {
  const io = getIO();
  const origin = event.headers.origin || event.headers.Origin || '*';
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      const stats = await io.read();
      return { statusCode: 200, headers, body: JSON.stringify(stats) };
    }

    if (event.httpMethod === 'PUT') {
      if (!isAuthed(event)) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
      const body = JSON.parse(event.body || '{}');
      const { devicesRepaired } = body;
      
      if (typeof devicesRepaired === 'undefined' || devicesRepaired === null) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'devicesRepaired is required' }) };
      }
      
      const count = parseInt(devicesRepaired, 10);
      if (isNaN(count) || count < 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'devicesRepaired must be a non-negative number' }) };
      }
      
      const stats = { devicesRepaired: count };
      await io.write(stats);
      return { statusCode: 200, headers, body: JSON.stringify(stats) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error', details: String(err) }) };
  }
};
