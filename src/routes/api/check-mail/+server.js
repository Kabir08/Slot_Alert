// Checks Gmail for new messages from a specific sender
import { json } from '@sveltejs/kit';
import { getNewMessages } from '$lib/gmail.js';
import { getValidAccessToken } from '$lib/auth-helpers.js';

export async function GET({ cookies, url }) {
  // Robustly decode user_email cookie (handles URL-encoded values)
  let userEmail = cookies.get('user_email');
  if (userEmail) userEmail = decodeURIComponent(userEmail);
  if (!userEmail) return json({ error: 'Unauthorized' }, { status: 401 });
  const access_token = await getValidAccessToken(userEmail);
  if (!access_token) return json({ error: 'Unauthorized' }, { status: 401 });
  const q = url.searchParams.get('q');
  // If no query, fetch last 5 emails
  const query = (q && q.trim()) ? q : '';
  const messages = await getNewMessages(userEmail, query);
  return json({
    messages: messages.map(m => ({
      id: m.id,
      title: m.snippet,
      subject: m.subject,
      from: m.from,
      time: m.internalDate
    }))
  });
}
