# Future Scope Ideas for Slot Alert

## Telegram Bot-First Flow
- Let users interact with the Telegram bot as the primary interface.
- On `/start`, capture the user's Telegram `chat_id` and send a welcome message.
- Provide a link to the web app's Google OAuth login, passing the `chat_id` as a URL parameter.
- After OAuth, associate the Telegram `chat_id` with the user's email in Redis for seamless mapping.
- All future bot commands can use `chat_id` to look up the user's email/tokens in Redis.

## Telegram Bot Features
- `/search <query>`: Search Gmail and return results (with numbers for selection).
- User replies with a number and a type (e.g., `1-Sender`) to set up an alert.
- `/alerts`: List current alerts.
- `/delete <number>`: Remove an alert.

## Security & UX
- No need for users to copy/paste their chat ID.
- The OAuth link from Telegram ensures correct user mapping.
- All alert management can be handled via Telegram for a frictionless experience.

## Implementation Notes
- Update OAuth callback to accept and store `chat_id` from the query string.
- Add `/start`, `/search`, `/alerts`, and `/delete` command handlers to the Telegram bot.
- Implement search and alert management logic in the bot.

---

These ideas are for future development to make Slot Alert more user-friendly and Telegram-centric.
