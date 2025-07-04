// SvelteKit middleware to secure backend API routes
import { redis } from '$lib/redis.js';

export async function handle({ event, resolve }) {
  // Allow public access to auth endpoints
  if (event.url.pathname.startsWith('/api/auth')) {
    return resolve(event);
  }

  // Protect all other /api routes
  if (event.url.pathname.startsWith('/api/')) {
    const sessionId = event.cookies.get('session_id');
    if (!sessionId) {
      return new Response('Unauthorized', { status: 401 });
    }
    const userEmail = await redis.get(`session:${sessionId}`);
    if (!userEmail) {
      return new Response('Unauthorized', { status: 401 });
    }
    const decodedEmail = decodeURIComponent(userEmail);
    const redisKey = `user:${decodedEmail}`;
    console.log('Looking up Redis key:', redisKey);
    const userRaw = await redis.get(redisKey);
    console.log('Raw value fetched from Redis:', userRaw);
    if (!userRaw || typeof userRaw !== 'string' || !userRaw.trim().startsWith('{')) {
      return new Response('Unauthorized', { status: 401 });
    }
    // Attach userEmail to event.locals for downstream use
    event.locals.userEmail = decodedEmail;
  }

  // Proceed as normal for all other routes
  return resolve(event);
}
