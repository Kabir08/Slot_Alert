// Checks Gmail for new messages from a specific sender
import { json } from '@sveltejs/kit';
import { getNewMessages } from '$lib/gmail.js';

export async function GET({ cookies, url }) {
  const userEmail = cookies.get('user_email');
  if (!userEmail) return json({ error: 'Missing user email' }, { status: 400 });
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
