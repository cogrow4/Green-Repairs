// Netlify Function: testimonials API
// Methods:
// - GET: return list of testimonials
// - POST: add a testimonial { name, location, message, rating }
// - DELETE: remove testimonial { id }

const { getStore } = require('@netlify/blobs');
const fs = require('fs');
const path = require('path');

const STORE_NAME = 'testimonials';
const KEY = 'data.json';

// Use /tmp for persistent storage in Netlify functions
const LOCAL_DIR = '/tmp/netlify-blobs';
const LOCAL_FILE = path.join(LOCAL_DIR, 'testimonials.json');

async function readTestimonials() {
  try {
    // Try Netlify Blobs first
    const store = getStore({
      name: STORE_NAME,
      siteID: 'bd21e028-ae93-4bbf-9ffb-bcfbbbc0f8d1',
      token: process.env.NETLIFY_BLOBS_TOKEN
    });
    const data = await store.get(KEY, { type: 'json' });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Blobs read failed, using local fallback:', error.message);
    // Fallback to local file
    try {
      if (!fs.existsSync(LOCAL_FILE)) return [];
      const raw = fs.readFileSync(LOCAL_FILE, 'utf8');
      const data = JSON.parse(raw || '[]');
      return Array.isArray(data) ? data : [];
    } catch (localError) {
      console.error('Local file read failed:', localError);
      return [];
    }
  }
}

async function writeTestimonials(testimonials) {
  try {
    // Try Netlify Blobs first
    const store = getStore({
      name: STORE_NAME,
      siteID: 'bd21e028-ae93-4bbf-9ffb-bcfbbbc0f8d1',
      token: process.env.NETLIFY_BLOBS_TOKEN
    });
    await store.set(KEY, JSON.stringify(testimonials), { contentType: 'application/json' });
  } catch (error) {
    console.error('Blobs write failed, using local fallback:', error.message);
    // Fallback to local file
    try {
      if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true });
      fs.writeFileSync(LOCAL_FILE, JSON.stringify(testimonials, null, 2), 'utf8');
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
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      const list = await readTestimonials();
      return { statusCode: 200, headers, body: JSON.stringify(list) };
    }

    if (event.httpMethod === 'POST') {
      if (!isAuthed(event)) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
      const body = JSON.parse(event.body || '{}');
      const { name, location, message, rating } = body;
      if (!message || !name) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'name and message are required' }) };
      }
      const item = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: String(name).slice(0, 120),
        location: location ? String(location).slice(0, 120) : '',
        message: String(message).slice(0, 2000),
        rating: Math.max(1, Math.min(5, parseInt(rating || 5, 10))),
        createdAt: Date.now()
      };
      const list = await readTestimonials();
      list.unshift(item);
      await writeTestimonials(list);
      return { statusCode: 201, headers, body: JSON.stringify(item) };
    }

    if (event.httpMethod === 'DELETE') {
      if (!isAuthed(event)) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
      const body = JSON.parse(event.body || '{}');
      const { id } = body;
      if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'id is required' }) };
      }
      const list = await readTestimonials();
      const next = list.filter(t => t.id !== id);
      await writeTestimonials(next);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error', details: String(err) }) };
  }
};
