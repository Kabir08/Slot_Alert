import { redirect } from '@sveltejs/kit';
import crypto from 'crypto';

const CLIENT_ID = process.env.GMAIL_CLIENT_ID ?? '';
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI ?? '';
const SCOPES = process.env.GMAIL_SCOPES ?? '';

export async function GET({ cookies }) {
  const state = crypto.randomBytes(16).toString('hex');
  cookies.set('oauth_state', state, { path: '/', httpOnly: true, secure: true, sameSite: 'lax' });
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}&access_type=offline&state=${state}&prompt=consent`;
  throw redirect(302, authUrl);
}
