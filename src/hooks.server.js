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
    // Check that user object exists in Redis
    const userRaw = await redis.get(`user:${userEmail}`);
    if (!userRaw || typeof userRaw !== 'string' || !userRaw.trim().startsWith('{')) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  // Proceed as normal for all other routes
  return resolve(event);
}
