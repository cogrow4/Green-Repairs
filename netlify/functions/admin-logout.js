const COOKIE_NAME = 'gr_admin';

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '*';
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const expire = `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${process.env.NETLIFY ? '; Secure' : ''}`;
  return { statusCode: 200, headers: { ...headers, 'Set-Cookie': expire }, body: JSON.stringify({ ok: true }) };
};
