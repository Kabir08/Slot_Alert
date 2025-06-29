import { json } from '@sveltejs/kit';
import { redis } from '$lib/redis.js';

export async function POST({ request }) {
  const update = await request.json();
  if (!update.message || !update.message.from || !update.message.chat) {
    return json({ ok: true }); // Ignore non-message updates
  }

  const chatId = update.message.chat.id;
  const telegramUserId = update.message.from.id;
  const username = update.message.from.username;
  const firstName = update.message.from.first_name;
  const text = update.message.text;

  // If user replies with their email, link chatId to user
  let userEmail = null;
  if (text && text.includes('@')) {
    userEmail = text.trim();
    const userRaw = await redis.get(`user:${userEmail}`);
    if (userRaw) {
      const user = JSON.parse(userRaw);
      // Save chatId and related info in the same user object
      user.telegram_chat_id = chatId;
      user.telegram_user_id = telegramUserId;
      user.telegram_username = username;
      user.telegram_first_name = firstName;
      await redis.set(`user:${userEmail}`, JSON.stringify(user));
    }
  }

  // Send welcome message on /start
  if (text === '/start') {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: 'Welcome! Please reply with your email address to link your Slot Alert account.'
      })
    });
  }

  return json({ ok: true });
}
