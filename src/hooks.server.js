// SvelteKit middleware to secure backend API routes
import { redis } from '$lib/redis.js';

export async function handle({ event, resolve }) {
  // Allow public access to auth endpoints and /api/docs
  if (
    event.url.pathname.startsWith('/api/auth') ||
    event.url.pathname === '/api/docs'
  ) {
    return resolve(event);
  }

  // Protect all other /api routes
  if (event.url.pathname.startsWith('/api/')) {
    const userEmail = event.cookies.get('user_email');
    if (!userEmail) {
      return new Response('Unauthorized', { status: 401 });
    }
    const decodedEmail = decodeURIComponent(userEmail);
    const redisKey = `user:${decodedEmail}`;
    const userRaw = await redis.get(redisKey);
    if (!userRaw || typeof userRaw !== 'string' || !userRaw.trim().startsWith('{')) {
      return new Response('Unauthorized', { status: 401 });
    }
    // Attach userEmail to event.locals for downstream use
    event.locals.userEmail = decodedEmail;
  }

  // Proceed as normal for all other routes
  return resolve(event);
}
