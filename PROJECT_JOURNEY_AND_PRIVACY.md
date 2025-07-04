# Slot Alert Project Journey & Privacy

## Project Overview
Slot Alert is a SvelteKit app that lets users set up alerts for new Gmail messages and receive notifications via Telegram. The app uses Google OAuth2 for authentication, Upstash Redis for storage, and is deployed on Netlify.

## Privacy Policy
- **Data Storage:** Only alert criteria, message IDs, and minimal user info (email, Telegram chat ID, tokens) are stored in Upstash Redis. No email content is stored.
- **Token Security:** OAuth tokens are stored securely and only used for the user's own alerts.
- **Telegram:** Your Telegram chat ID is only used to send you notifications you have requested.
- **Cookies:** Used for session management and are set securely.
- **User Control:** You can delete your alerts or unlink your Telegram at any time.
- **No Analytics:** Slot Alert does not use third-party analytics or tracking.
- **Open Source:** All code is public for transparency.

## Timeline & Milestones

### 1. Initial Setup
- Scaffolded a SvelteKit project with both frontend and backend in one repo.
- Set up .env for Gmail OAuth2, Pushcut, Upstash Redis, and Telegram bot credentials.

### 2. Authentication & Gmail Integration
- Implemented Google OAuth2 login with CSRF protection.
- Tokens are stored in Redis and cookies for secure session management.
- Added token refresh logic and moved it to a helper file.

### 3. Alerting Logic
- UI allows users to search Gmail and set alerts for sender, subject, or content.
- Alerts are stored in Redis (now as part of a user object).
- Telegram bot integration for notifications, with repeated messages for alarm effect.

### 4. Scheduled Monitoring
- Netlify scheduled function checks for new matching emails and triggers Telegram alerts.
- Added logic to stop alerts if the user reads the email, and label the email as processed in Gmail.

### 5. Multi-User & Robust Storage
- Refactored storage to use a single user object (email, name, tokens, expiry, alerts, Telegram chat ID, etc.).
- All alert and token logic now works per user.

### 6. Telegram Webhook
- Implemented a webhook to automatically collect Telegram chat IDs when users send /start and their email to the bot.
- No need for users to manually provide chat IDs.

### 7. UI Improvements
- Added an "Active Alerts" tab for users to view and delete their alerts.
- Improved error handling and session UX.

## Challenges & Solutions
- **Token Expiry:** Initially, access tokens were not refreshed properly, causing missed alerts. Solution: Store expiry and refresh tokens as needed.
- **Multi-User Support:** Moved from global Redis keys to per-user objects for all data.
- **Telegram Chat ID Collection:** Automated via webhook and email association.
- **Netlify Environment:** Ensured all environment variables are set in the dashboard and not just .env.
- **Gmail API Quotas:** Limited polling frequency and alert volume to stay within API limits.

## Current State
- Fully functional end-to-end alerting from Gmail to Telegram.
- Secure, multi-user, and scalable architecture.
- Easy onboarding: just log in with Google and send /start to the bot.

---

Thank you for using Slot Alert!
