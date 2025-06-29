# Slot Alert

Slot Alert is a privacy-focused SvelteKit app that lets you set up alerts for new Gmail messages and receive notifications via Telegram. Built for speed, security, and ease of use.

## Features
- **Google OAuth2 Login:** Secure authentication with your Google account.
- **Gmail Monitoring:** Search and set alerts for emails by sender, subject, or content.
- **Telegram Notifications:** Get instant alerts on your phone via Telegram bot.
- **Multi-User Support:** Each user’s alerts, tokens, and Telegram chat ID are stored securely and separately.
- **Active Alerts UI:** View and manage your current alerts in the app.
- **Automatic Token Refresh:** Never miss an alert due to expired tokens.
- **Netlify Scheduled Functions:** Checks your mailbox every minute for new matching emails.
- **Upstash Redis:** Fast, serverless storage for sessions, tokens, and alerts.

## How It Works
1. **Login with Google** to connect your Gmail.
2. **Send /start to the Slot Alert Telegram bot** and reply with your email to link your account.
3. **Set up alerts** in the app for sender, subject, or content.
4. **Get notified** on Telegram when a new matching email arrives.
5. **Manage alerts** from the "Active Alerts" tab in the app.

## Privacy & Security
- Your tokens and chat IDs are stored securely in Upstash Redis.
- We never store your emails, only alert criteria and message IDs.
- You can delete your alerts or unlink Telegram at any time.
- See [`/privacy`](./src/routes/privacy/+page.svelte) for full policy.

## Project Journey
See [`PROJECT_JOURNEY_AND_PRIVACY.md`](./PROJECT_JOURNEY_AND_PRIVACY.md) for a detailed technical journey and milestones.

## Local Development
1. Clone the repo and run `npm install`.
2. Copy `.env.example` to `.env` and fill in your credentials.
3. Run `npm run dev` to start the app locally.

## Deployment
- Deploys seamlessly to Netlify (see `netlify.toml`).
- Set all required environment variables in the Netlify dashboard.

## Contributing
Pull requests and issues are welcome!

## License
MIT
