<h1>Slot Alert Project Journey</h1>

<article>
  <h2>Project Overview</h2>
  <p>Slot Alert is a SvelteKit app that lets users set up alerts for new Gmail messages and receive notifications via Telegram. The app uses Google OAuth2 for authentication, Upstash Redis for storage, and is deployed on Netlify.</p>

  <h2>Timeline & Milestones</h2>
  <h3>1. Initial Setup</h3>
  <ul>
    <li>Scaffolded a SvelteKit project with both frontend and backend in one repo.</li>
    <li>Set up .env for Gmail OAuth2, Pushcut, Upstash Redis, and Telegram bot credentials.</li>
  </ul>
  <h3>2. Authentication & Gmail Integration</h3>
  <ul>
    <li>Implemented Google OAuth2 login with CSRF protection.</li>
    <li>Tokens are stored in Redis and cookies for secure session management.</li>
    <li>Added token refresh logic and moved it to a helper file.</li>
  </ul>
  <h3>3. Alerting Logic</h3>
  <ul>
    <li>UI allows users to search Gmail and set alerts for sender, subject, or content.</li>
    <li>Alerts are stored in Redis (now as part of a user object).</li>
    <li>Telegram bot integration for notifications, with repeated messages for alarm effect.</li>
  </ul>
  <h3>4. Scheduled Monitoring</h3>
  <ul>
    <li>Netlify scheduled function checks for new matching emails and triggers Telegram alerts.</li>
    <li>Added logic to stop alerts if the user reads the email, and label the email as processed in Gmail.</li>
  </ul>
  <h3>5. Multi-User & Robust Storage</h3>
  <ul>
    <li>Refactored storage to use a single user object (email, name, tokens, expiry, alerts, Telegram chat ID, etc.).</li>
    <li>All alert and token logic now works per user.</li>
  </ul>
  <h3>6. Telegram Webhook</h3>
  <ul>
    <li>Implemented a webhook to automatically collect Telegram chat IDs when users send /start and their email to the bot.</li>
    <li>No need for users to manually provide chat IDs.</li>
  </ul>
  <h3>7. UI Improvements</h3>
  <ul>
    <li>Added an "Active Alerts" tab for users to view and delete their alerts.</li>
    <li>Improved error handling and session UX.</li>
  </ul>

  <h2>Challenges & Solutions</h2>
  <ul>
    <li><b>Token Expiry:</b> Initially, access tokens were not refreshed properly, causing missed alerts. Solution: Store expiry and refresh tokens as needed.</li>
    <li><b>Multi-User Support:</b> Moved from global Redis keys to per-user objects for all data.</li>
    <li><b>Telegram Chat ID Collection:</b> Automated via webhook and email association.</li>
    <li><b>Netlify Environment:</b> Ensured all environment variables are set in the dashboard and not just .env.</li>
    <li><b>Gmail API Quotas:</b> Limited polling frequency and alert volume to stay within API limits.</li>
  </ul>

  <h2>Current State</h2>
  <ul>
    <li>Fully functional end-to-end alerting from Gmail to Telegram.</li>
    <li>Secure, multi-user, and scalable architecture.</li>
    <li>Easy onboarding: just log in with Google and send /start to the bot.</li>
  </ul>

  <p><i>Thank you for using Slot Alert!</i></p>
</article>
