// Netlify Function: site-stats API
// Methods:
// - GET: return current stats { devicesRepaired }
// - PUT: update stats (admin only) { devicesRepaired }

const { getStore } = require('@netlify/blobs');
const fs = require('fs');
const path = require('path');

const STORE_NAME = 'site-stats';
const KEY = 'data.json';

// Default stats
const DEFAULT_STATS = {
  devicesRepaired: 50
};

// Use /tmp for persistent storage in Netlify functions
const LOCAL_DIR = '/tmp/netlify-blobs';
const LOCAL_FILE = path.join(LOCAL_DIR, 'site-stats.json');

async function readStats() {
  try {
    // Try Netlify Blobs first
    const store = getStore({
      name: STORE_NAME,
      siteID: 'bd21e028-ae93-4bbf-9ffb-bcfbbbc0f8d1',
      token: process.env.NETLIFY_BLOBS_TOKEN
    });
    const data = await store.get(KEY, { type: 'json' });
    return data && typeof data === 'object' ? { ...DEFAULT_STATS, ...data } : DEFAULT_STATS;
  } catch (error) {
    console.error('Blobs read failed, using local fallback:', error.message);
    // Fallback to local file
    try {
      if (!fs.existsSync(LOCAL_FILE)) return DEFAULT_STATS;
      const raw = fs.readFileSync(LOCAL_FILE, 'utf8');
      const data = JSON.parse(raw || '{}');
      return { ...DEFAULT_STATS, ...data };
    } catch (localError) {
      console.error('Local file read failed:', localError);
      return DEFAULT_STATS;
    }
  }
}

async function writeStats(stats) {
  try {
    // Try Netlify Blobs first
    const store = getStore({
      name: STORE_NAME,
      siteID: 'bd21e028-ae93-4bbf-9ffb-bcfbbbc0f8d1',
      token: process.env.NETLIFY_BLOBS_TOKEN
    });
    await store.set(KEY, JSON.stringify(stats), { contentType: 'application/json' });
  } catch (error) {
    console.error('Blobs write failed, using local fallback:', error.message);
    // Fallback to local file
    try {
      if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true });
      fs.writeFileSync(LOCAL_FILE, JSON.stringify(stats, null, 2), 'utf8');
    } catch (localError) {
      console.error('Local file write failed:', localError);
      throw localError;
    }
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
