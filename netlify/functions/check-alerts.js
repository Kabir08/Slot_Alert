// Netlify Scheduled Function: Check alerts and trigger Telegram notifications
import { redis } from '../../src/lib/redis.js';
import { getNewMessages, isMessageUnread, addLabelToMessage } from '../../src/lib/gmail.js';
import { sendTelegramAlarm } from '../../src/lib/telegram.js';

export default async function handler(event, context) {
  // 1. Load all alert criteria (for demo, just one user)
  const alerts = await redis.lrange('user:alerts', 0, -1);
  if (!alerts || alerts.length === 0) {
    return {
      statusCode: 200,
      body: 'No alerts configured.'
    };
  }

  // 2. For each alert, check for new messages
  let triggered = false;
  for (const alertStr of alerts) {
    console.log('typeof alertStr:', typeof alertStr, 'alertStr:', alertStr);
    let alert;
    if (typeof alertStr === 'string') {
      try {
        alert = JSON.parse(alertStr);
      } catch (e) {
        console.error('Failed to parse alertStr:', alertStr, e);
        continue;
      }
    } else {
      alert = alertStr;
    }
    // Build Gmail query from alert
    let query = '';
    if (alert.sender) query += `from:${alert.sender} `;
    if (alert.subject) query += `subject:${alert.subject} `;
    if (alert.text) query += `${alert.text} `;
    const messages = await getNewMessages(process.env.GMAIL_ACCESS_TOKEN, query.trim());
    if (messages && messages.length > 0) {
      const msg = messages[0];
      let stillUnread = await isMessageUnread(msg.id);
      let sentCount = 0;
      for (let i = 0; i < 180 && stillUnread; i++) {
        await sendTelegramAlarm(`ALERT: New mail matched your alert!\n${JSON.stringify(msg, null, 2)}`, 1);
        sentCount++;
        // Wait 1 second before next alert
        await new Promise(res => setTimeout(res, 1000));
        stillUnread = await isMessageUnread(msg.id);
      }
      if (!stillUnread) {
        await addLabelToMessage(msg.id, 'Processed by Slot Alert');
        console.log(`Stopped alerts for message ${msg.id} after user read it. Labeled as processed.`);
      } else {
        console.log(`Sent ${sentCount} alerts for message ${msg.id}, still unread.`);
      }
      triggered = true;
    }
  }

  return {
    statusCode: 200,
    body: triggered ? 'Alert triggered!' : 'No new matching emails.'
  };
}

// Netlify scheduled function config
export const config = {
  schedule: '@every 1m' // every 1 minute (minimum allowed by Netlify)
};
