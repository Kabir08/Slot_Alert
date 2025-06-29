export async function sendTelegramAlarm(message, repeat = 60, chatId = process.env.TELEGRAM_CHAT_ID) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  for (let i = 0; i < repeat; i++) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      });
      const data = await res.json();
      console.log('Telegram API response:', data);
      if (!data.ok) {
        console.error('Telegram error:', data);
      }
    } catch (err) {
      console.error('Telegram fetch error:', err);
    }
    await new Promise(res => setTimeout(res, 1000)); // 1 second delay
  }
}
