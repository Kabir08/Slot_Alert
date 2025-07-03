<h1>Privacy Policy</h1>

<article>
  <p>Last updated: June 29, 2025</p>
  <p>Slot Alert is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our app and services.</p>
  <h2>Information We Collect</h2>
  <ul>
    <li><b>Google Account Data:</b> We collect your email address, name, and OAuth tokens (access and refresh tokens) when you log in with Google. This allows us to access your Gmail inbox for alerting purposes.</li>
    <li><b>Gmail Data:</b> We access your Gmail inbox to search for new emails that match your alert criteria. We do not store your emails, only the alert criteria and message IDs needed for alerting.</li>
    <li><b>Alert Criteria:</b> We store the alert rules you set (sender, subject, or content) in our database.</li>
    <li><b>Telegram Data:</b> When you link your Telegram account, we store your Telegram chat ID and basic profile info (username, first name) to send you notifications.</li>
    <li><b>Session Data:</b> We use cookies and Redis to manage your session and securely store tokens.</li>
  </ul>
  <h2>How We Use Your Information</h2>
  <ul>
    <li>To authenticate you with Google and access your Gmail inbox for new messages.</li>
    <li>To store and manage your alert criteria.</li>
    <li>To send you notifications via Telegram when a new matching email arrives.</li>
    <li>To improve the app and provide support.</li>
  </ul>
  <h2>How We Protect Your Information</h2>
  <ul>
    <li>All sensitive data (tokens, chat IDs) are stored securely in Upstash Redis and never shared with third parties.</li>
    <li>Communication with Google and Telegram APIs is encrypted.</li>
    <li>We do not share or sell your data.</li>
  </ul>
  <h2>User Control</h2>
  <ul>
    <li>You can delete your alerts at any time from the app UI.</li>
    <li>You can unlink your Telegram account by removing the chat ID (contact support if needed).</li>
    <li>You can revoke the app's access to your Gmail from your Google account settings.</li>
  </ul>
  <h2>Data Retention</h2>
  <ul>
    <li>We retain your alert criteria and tokens only as long as your account is active.</li>
    <li>If you delete your account or revoke access, your data is deleted from our systems.</li>
  </ul>
  <h2>Contact</h2>
  <p>For questions or concerns, contact us at support@slotalert.app.</p>
</article>

<style>
h1 {
  text-align: center;
  margin-top: 2em;
  color: #0077cc;
  font-size: 2.2em;
  letter-spacing: 0.01em;
}
article {
  max-width: 700px;
  margin: 2em auto 3em auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  padding: 2.5em 2em 2em 2em;
  font-size: 1.13em;
  color: #222;
}
article h2 {
  color: #0077cc;
  margin-top: 1.7em;
  font-size: 1.25em;
  border-left: 4px solid #0077cc;
  padding-left: 0.5em;
  margin-bottom: 0.7em;
}
article ul {
  margin: 0 0 1.5em 1.2em;
  padding-left: 1.2em;
}
article li {
  margin-bottom: 0.7em;
  line-height: 1.6;
}
article p {
  margin-bottom: 1.2em;
}
@media (max-width: 600px) {
  article {
    padding: 1.2em 0.7em;
  }
  h1 {
    font-size: 1.4em;
  }
}
</style>
