// OAuth2 login and callback endpoints for Google
import { json, redirect } from '@sveltejs/kit';
import { redis } from '$lib/redis.js';
import { getValidAccessToken } from '$lib/auth-helpers.js';

const CLIENT_ID = process.env.GMAIL_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET ?? '';
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI ?? '';
const SCOPES = process.env.GMAIL_SCOPES ?? '';

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

// GET /api/auth/callback - Handles OAuth2 callback from Google
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
	cookies.set('access_token', tokens.access_token, { path: '/', httpOnly: true, secure: true });
	cookies.set('refresh_token', tokens.refresh_token, { path: '/', httpOnly: true, secure: true });

	// Redirect to your app's home or dashboard
	return redirect(302, '/');
}
