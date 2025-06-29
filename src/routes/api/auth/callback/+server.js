// Handles OAuth2 callback from Google
import { redirect } from '@sveltejs/kit';
import { redis } from '$lib/redis.js';

const CLIENT_ID = process.env.GMAIL_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET ?? '';
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI ?? '';

export async function GET({ url, cookies }) {
  // Only handle callback if code and state are present
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const savedState = cookies.get('oauth_state');
  if (!code || !state || state !== savedState) {
    return new Response('Invalid or missing code/state', { status: 400 });
  }
  cookies.delete('oauth_state', { path: '/' });

  // Exchange code for tokens
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  });
  const tokens = await res.json();
  if (tokens.error) return new Response('Token error: ' + tokens.error, { status: 400 });

  // Store tokens in Redis (keyed by a session/user id, here just 'user' for demo)
  if (tokens.access_token) await redis.set('user:access_token', tokens.access_token);
  if (tokens.refresh_token) await redis.set('user:refresh_token', tokens.refresh_token);

  // Store tokens in httpOnly cookie for session (optional)
  cookies.set('access_token', tokens.access_token, { path: '/', httpOnly: true, secure: true, sameSite: 'lax' });
  cookies.set('refresh_token', tokens.refresh_token, { path: '/', httpOnly: true, secure: true, sameSite: 'lax' });

  // Redirect to your app's home or dashboard
  return redirect(302, '/');
}
