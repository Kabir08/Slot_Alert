// Checks Gmail for new messages from a specific sender
import { json } from '@sveltejs/kit';
import { getNewMessages } from '$lib/gmail.js';
import { getValidAccessToken } from '$lib/auth-helpers.js';

export async function GET({ cookies, url }) {
  const userEmail = cookies.get('user_email');
  console.log('API/check-mail: user_email from cookie:', userEmail);
  if (!userEmail) return json({ error: 'Unauthorized' }, { status: 401 });
  const access_token = await getValidAccessToken(userEmail);
  console.log('API/check-mail: access_token:', access_token);
  if (!access_token) return json({ error: 'Unauthorized' }, { status: 401 });
  const q = url.searchParams.get('q');
  // If no query, fetch last 5 emails
  const query = (q && q.trim()) ? q : '';
  // Log before making Google API request
  console.log('API/check-mail: Making Gmail API request for user:', userEmail, 'with query:', query);
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
