import { redis } from '$lib/redis.js';

export async function GET({ cookies }) {
  const userEmail = cookies.get('user_email');
  if (!userEmail) return new Response('Not logged in', { status: 401 });
  const userRaw = await redis.get(`user:${userEmail}`);
  if (!userRaw) return new Response('User not found', { status: 404 });
  return new Response(userRaw, { status: 200, headers: { 'Content-Type': 'application/json' } });
}
