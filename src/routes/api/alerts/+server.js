import { json } from '@sveltejs/kit';
import { redis } from '$lib/redis.js';

export async function POST({ request, cookies }) {
  const access_token = cookies.get('access_token');
  if (!access_token) return json({ error: 'Unauthorized' }, { status: 401 });
  const { sender, subject, text } = await request.json();
  // Save alert criteria in Redis (keyed by user, here just 'user' for demo)
  await redis.lpush('user:alerts', JSON.stringify({ sender, subject, text }));
  return json({ success: true });
}
