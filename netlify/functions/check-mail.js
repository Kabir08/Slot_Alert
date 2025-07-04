// netlify/functions/check-mail.js
// Netlify function version of /api/check-mail
import { getNewMessages } from '../../src/lib/gmail.js';
import { getValidAccessToken } from '../../src/lib/auth-helpers.js';

export default async (request, context) => {
  // Get cookies from request headers
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=')));
  let userEmail = cookies['user_email'];
  if (userEmail) userEmail = decodeURIComponent(userEmail);
  if (!userEmail) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  const access_token = await getValidAccessToken(userEmail);
  if (!access_token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  // Parse query params from request.url
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  const query = (q && q.trim()) ? q : '';
  const messages = await getNewMessages(userEmail, query);
  return new Response(JSON.stringify({
    messages: messages.map(m => ({
      id: m.id,
      title: m.snippet,
      subject: m.subject,
      from: m.from,
      time: m.internalDate
    }))
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
