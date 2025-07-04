// SvelteKit middleware to secure backend API routes
import { redis } from '$lib/redis.js';

export async function handle({ event, resolve }) {
  // Allow public access to auth endpoints
  if (event.url.pathname.startsWith('/api/auth')) {
    return resolve(event);
  }

  // Protect all other /api routes
  if (event.url.pathname.startsWith('/api/')) {
    const accessToken = event.cookies.get('access_token');
    const userEmail = event.cookies.get('user_email');
    // Optionally, check Redis for session validity here
    if (!accessToken || !userEmail) {
      return new Response('Unauthorized', { status: 401 });
    }
    // Decode userEmail for Redis key
    const decodedEmail = decodeURIComponent(userEmail);
    const redisKey = `user:${decodedEmail}`;
    console.log('Looking up Redis key:', redisKey);
    const userRaw = await redis.get(redisKey);
    console.log('Raw value fetched from Redis:', userRaw);
    if (!userRaw || typeof userRaw !== 'string' || !userRaw.trim().startsWith('{')) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  // Proceed as normal for all other routes
  return resolve(event);
}
