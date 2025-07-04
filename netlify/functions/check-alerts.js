// Netlify Scheduled Function: Check alerts and trigger Telegram notifications for all users
import { redis } from '../../src/lib/redis.js';
import { getNewMessages, isMessageUnread, addLabelToMessage } from '../../src/lib/gmail.js';
import { sendTelegramAlarm } from '../../src/lib/telegram.js';

export default async function handler(event, context) {
  let cursor = 0;
  let totalUsers = 0, totalAlerts = 0, triggered = 0;
  do {
    // Scan for user:* keys (Upstash compatible)
    const res = await redis.scan(cursor, { match: 'user:*', count: 100 });
    cursor = Number(res[0]);
    const keys = res[1];
    for (const key of keys) {
      totalUsers++;
      let userRaw = await redis.get(key);
      let user;
      if (typeof userRaw === 'object' && userRaw !== null) {
        user = userRaw;
      } else if (typeof userRaw === 'string' && userRaw.trim().startsWith('{')) {
        try {
          user = JSON.parse(userRaw);
        } catch (e) {
          console.warn('Skipping unparsable user object:', key);
          continue;
        }
      } else {
        console.warn('Skipping invalid user object:', key);
        continue;
      }
      const userEmail = key.replace('user:', '');
      const alerts = user.alerts || [];
      const chatId = user.telegram_chat_id;
      if (!Array.isArray(alerts) || alerts.length === 0 || !chatId) {
        continue; // No alerts or no Telegram chat linked
      }
      for (const alert of alerts) {
        totalAlerts++;
        // Build Gmail query from alert
        let query = '';
        if (alert.sender) query += `from:${alert.sender} `;
        if (alert.subject) query += `subject:${alert.subject} `;
        if (alert.text) query += `${alert.text} `;
        try {
          const messages = await getNewMessages(userEmail, query.trim());
          if (messages && messages.length > 0) {
            const msg = messages[0];
            let stillUnread = await isMessageUnread(msg.id, userEmail);
            let sentCount = 0;
            for (let i = 0; i < 180 && stillUnread; i++) {
              await sendTelegramAlarm(
                `ALERT: New mail matched your alert!\nSubject: ${msg.subject}\nFrom: ${msg.from}\nSnippet: ${msg.snippet}`,
                1,
                chatId
              );
              sentCount++;
              await new Promise(res => setTimeout(res, 1000));
              stillUnread = await isMessageUnread(msg.id, userEmail);
            }
            if (!stillUnread) {
              await addLabelToMessage(msg.id, 'Processed by Slot Alert', userEmail);
              console.log(`Stopped alerts for message ${msg.id} after user read it. Labeled as processed.`);
            } else {
              console.log(`Sent ${sentCount} alerts for message ${msg.id}, still unread.`);
            }
            triggered++;
          }
        } catch (err) {
          console.error(`Error processing alert for user ${userEmail}:`, err);
        }
      }
    }
  } while (cursor !== 0);

  return new Response(
    `Checked ${totalUsers} users, ${totalAlerts} alerts. Triggered: ${triggered}`,
    { status: 200, headers: { 'Content-Type': 'text/plain' } }
  );
}

// Netlify scheduled function config
export const config = {
  schedule: '@every 1m' // every 1 minute (minimum allowed by Netlify)
};
