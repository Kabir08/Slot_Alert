# Architecture

Slot-Alert is a SvelteKit app deployed on Netlify, using serverless functions and Upstash Redis for storage. It integrates with Gmail and Telegram APIs.

```mermaid
graph TD
  A[User] -- Google OAuth2 --> B(SvelteKit App)
  A -- Telegram Bot --> C(Telegram Bot Serverless Function)
  B -- API Calls --> D[Netlify Functions]
  D -- Redis --> E[Upstash Redis]
  D -- Gmail API --> F[Gmail]
  D -- Telegram API --> G[Telegram]
```

- **Frontend:** SvelteKit
- **Backend:** Netlify Functions (Node.js)
- **Storage:** Upstash Redis
- **Integrations:** Gmail API, Telegram Bot API
