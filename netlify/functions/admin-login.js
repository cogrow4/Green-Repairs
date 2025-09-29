const crypto = require('crypto');

const USERNAME = 'admin';
// Read password from environment variable for security. No fallback in production.
const PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_TTL_SECONDS = 60 * 60 * 12; // 12 hours
const COOKIE_NAME = 'gr_admin';

function getSecret() {
  return process.env.ADMIN_SECRET || 'dev-insecure-secret-change-me';
}

function sign(payload) {
  const secret = getSecret();
  const h = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return h;
}

function makeToken(username) {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const payload = `${username}.${exp}`;
  const sig = sign(payload);
  const token = Buffer.from(`${payload}.${sig}`).toString('base64url');
  return token;
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': event.headers.origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // Ensure admin password is configured
    if (!PASSWORD) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Admin password not configured', code: 'ADMIN_PASSWORD_NOT_SET' })
      };
    }

    const { username, password } = JSON.parse(event.body || '{}');
    if (username !== USERNAME || password !== PASSWORD) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid credentials' }) };
    }
    const token = makeToken(username);
    const cookie = `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax${process.env.NETLIFY ? '; Secure' : ''}`;
    return {
      statusCode: 200,
      headers: { ...headers, 'Set-Cookie': cookie },
      body: JSON.stringify({ ok: true })
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) };
  }
};
