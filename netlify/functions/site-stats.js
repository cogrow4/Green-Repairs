// Netlify Function: site-stats API
// Methods:
// - GET: return current stats { devicesRepaired }
// - PUT: update stats (admin only) { devicesRepaired }

const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'site-stats';
const KEY = 'data.json';

// Default stats
const DEFAULT_STATS = {
  devicesRepaired: 50
};

async function readStats() {
  try {
    const store = getStore({
      name: STORE_NAME,
      siteID: process.env.SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN
    });
    const data = await store.get(KEY, { type: 'json' });
    return data && typeof data === 'object' ? { ...DEFAULT_STATS, ...data } : DEFAULT_STATS;
  } catch (error) {
    console.error('Error reading stats from Blobs:', error);
    return DEFAULT_STATS;
  }
}

async function writeStats(stats) {
  try {
    const store = getStore({
      name: STORE_NAME,
      siteID: process.env.SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN
    });
    await store.set(KEY, JSON.stringify(stats), { contentType: 'application/json' });
  } catch (error) {
    console.error('Error writing stats to Blobs:', error);
    throw error;
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
      const stats = await readStats();
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
      await writeStats(stats);
      return { statusCode: 200, headers, body: JSON.stringify(stats) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error', details: String(err) }) };
  }
};
