// SvelteKit middleware to secure backend API routes
export async function handle({ event, resolve }) {
  // Allow public access to auth endpoints
  if (event.url.pathname.startsWith('/api/auth')) {
    return resolve(event);
  }

  // Protect all other /api routes
  if (event.url.pathname.startsWith('/api/')) {
    const accessToken = event.cookies.get('access_token');
    // Optionally, check Redis for session validity here
    if (!accessToken) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  // Proceed as normal for all other routes
  return resolve(event);
}
