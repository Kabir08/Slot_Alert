// OAuth2 login and callback endpoints for Google
import { json, redirect } from '@sveltejs/kit';
import crypto from 'crypto';
import { redis } from '$lib/redis.js';
import { getValidAccessToken } from '$lib/auth-helpers.js';

const CLIENT_ID = process.env.GMAIL_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET ?? '';
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI ?? '';
const SCOPES = process.env.GMAIL_SCOPES ?? '';

// GET /api/auth/login - Redirects to Google OAuth2
export async function GET({ cookies }) {
  const state = crypto.randomBytes(16).toString('hex');
  cookies.set('oauth_state', state, { path: '/', httpOnly: true, secure: true, sameSite: 'lax' });
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}&access_type=offline&state=${state}&prompt=consent`;
  throw redirect(302, authUrl);
}

// POST /api/auth/callback - Handles OAuth2 callback (exchange code for tokens)
export async function POST({ request, cookies }) {
  const data = await request.json();
  const { code, state } = data;
  const savedState = cookies.get('oauth_state');
  if (state !== savedState) return json({ error: 'Invalid state' }, { status: 400 });
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
  if (tokens.error) return json({ error: tokens.error }, { status: 400 });
  // Store tokens in Redis (keyed by a session/user id, here just 'user' for demo)
  if (tokens.access_token) await redis.set('user:access_token', tokens.access_token);
  if (tokens.refresh_token) await redis.set('user:refresh_token', tokens.refresh_token);
  // Store tokens in httpOnly cookie for session (optional)
  cookies.set('access_token', tokens.access_token, { path: '/', httpOnly: true, secure: true });
  cookies.set('refresh_token', tokens.refresh_token, { path: '/', httpOnly: true, secure: true });
  return json({ success: true });
}
