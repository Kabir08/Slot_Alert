// Netlify function version of /api/alerts
import { redis } from '../../src/lib/redis.js';

function getUserEmailFromCookies(cookieHeader) {
  const cookies = Object.fromEntries((cookieHeader || '').split(';').map(c => c.trim().split('=')));
  let userEmail = cookies['user_email'];
  if (userEmail) userEmail = decodeURIComponent(userEmail);
  return userEmail;
}

function safeParseUser(raw) {
  if (raw && typeof raw === 'string' && raw.trim().startsWith('{')) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse user object from Redis:', raw, e);
      return {};
    }
  }
  if (typeof raw === 'object' && raw !== null) return raw;
  return {};
}

export default async (request, context) => {
  const cookieHeader = request.headers.get('cookie') || '';
  const userEmail = getUserEmailFromCookies(cookieHeader);
  if (!userEmail) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  if (request.method === 'POST') {
    const { sender, subject, text } = await request.json();
    const userRaw = await redis.get(`user:${userEmail}`);
    if (!userRaw) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    const user = safeParseUser(userRaw);
    if ((user.alerts || []).length >= 3) {
      return new Response(JSON.stringify({ error: 'Maximum 3 alerts allowed per user.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    user.alerts = user.alerts || [];
    user.alerts.push({ sender, subject, text });
    if (typeof user !== 'object' || user === null) throw new Error('User must be an object');
    await redis.set(`user:${userEmail}`, JSON.stringify(user));
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (request.method === 'GET') {
    const userRaw = await redis.get(`user:${userEmail}`);
    if (!userRaw) return new Response(JSON.stringify({ alerts: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    const user = safeParseUser(userRaw);
    return new Response(JSON.stringify({ alerts: user.alerts || [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (request.method === 'DELETE') {
    const { sender, subject, text } = await request.json();
    const userRaw = await redis.get(`user:${userEmail}`);
    if (!userRaw) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    const user = safeParseUser(userRaw);
    user.alerts = (user.alerts || []).filter(a => !(a.sender === sender && a.subject === subject && a.text === text));
    if (typeof user !== 'object' || user === null) throw new Error('User must be an object');
    await redis.set(`user:${userEmail}`, JSON.stringify(user));
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
};
