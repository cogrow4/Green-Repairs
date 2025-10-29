// Netlify Function: testimonials API
// Methods:
// - GET: return list of testimonials
// - POST: add a testimonial { name, location, message, rating }
// - DELETE: remove testimonial { id }

<<<<<<< HEAD
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
=======
const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'testimonials';
const KEY = 'data.json';

async function readTestimonials() {
  try {
    const store = getStore(STORE_NAME);
    const data = await store.get(KEY, { type: 'json' });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error reading testimonials from Blobs:', error);
    return [];
  }
}

async function writeTestimonials(testimonials) {
  try {
    const store = getStore(STORE_NAME);
    await store.setJSON(KEY, testimonials);
  } catch (error) {
    console.error('Error writing testimonials to Blobs:', error);
    throw error;
  }
}
>>>>>>> 2e39a7949b5e5ec34863d04391367b46f8c8c2cd

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
<<<<<<< HEAD
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
=======
      const list = await readTestimonials();
      return { statusCode: 200, headers, body: JSON.stringify(list) };
>>>>>>> 2e39a7949b5e5ec34863d04391367b46f8c8c2cd
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
        name: String(name).slice(0, 120),
        location: location ? String(location).slice(0, 120) : '',
        message: String(message).slice(0, 2000),
        rating: Math.max(1, Math.min(5, parseInt(rating || 5, 10)))
      };
<<<<<<< HEAD
      const { data, error } = await supabase
        .from('testimonials')
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return { statusCode: 201, headers, body: JSON.stringify(data) };
=======
      const list = await readTestimonials();
      list.unshift(item);
      await writeTestimonials(list);
      return { statusCode: 201, headers, body: JSON.stringify(item) };
>>>>>>> 2e39a7949b5e5ec34863d04391367b46f8c8c2cd
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
<<<<<<< HEAD
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      if (error) throw error;
=======
      const list = await readTestimonials();
      const next = list.filter(t => t.id !== id);
      await writeTestimonials(next);
>>>>>>> 2e39a7949b5e5ec34863d04391367b46f8c8c2cd
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error', details: String(err) }) };
  }
};
