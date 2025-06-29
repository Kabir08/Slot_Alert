// Checks Gmail for new messages from a specific sender
import { json } from '@sveltejs/kit';
import { getNewMessages } from '$lib/gmail.js';

export async function GET({ cookies, url }) {
  const access_token = cookies.get('access_token');
  const q = url.searchParams.get('q');
  if (!access_token) return json({ error: 'Missing token' }, { status: 400 });
  const messages = await getNewMessages(access_token, q || '');
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
