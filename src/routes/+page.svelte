<script>
  import { onMount } from 'svelte';
  let loggedIn = false;
  let query = '';
  let messages = [];
  let status = '';
  let showToast = false;
  let activeTab = 'search';
  let alerts = [];

  onMount(async () => {
    // Log cookies for debugging
    console.log('Client cookies:', document.cookie);
    // Try to fetch a protected endpoint to check login
    const res = await fetch('/.netlify/functions/check-mail?sender=me');
    loggedIn = res.status !== 401;
    if (loggedIn && window.location.search.includes('code=')) {
      showToast = true;
      setTimeout(() => showToast = false, 3000);
    }
  });

  function login() {
    window.location.href = '/api/auth/login';
  }

  async function checkMail() {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    // Log cookies and request for debugging
    console.log('Client cookies before checkMail:', document.cookie);
    console.log('Sending fetch to:', `/.netlify/functions/check-mail?${params.toString()}`);
    const res = await fetch(`/.netlify/functions/check-mail?${params.toString()}`);
    if (res.status === 401) {
      logout();
      return;
    }
    const data = await res.json();
    if (data && data.error === 'User not found') {
      logout();
      return;
    }
    messages = data.messages || [];
    status = messages.length ? `Found ${messages.length} messages.` : 'No new messages.';
  }

  async function setAlert(criteria) {
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(criteria)
    });
    alert('Alert set!');
  }

  async function fetchAlerts() {
    const res = await fetch('/api/alerts');
    if (res.status === 401) {
      logout();
      return;
    }
    const data = await res.json();
    if (data && data.error === 'User not found') {
      logout();
      return;
    }
    alerts = data.alerts || [];
  }

  async function deleteAlert(alert) {
    await fetch('/api/alerts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
    await fetchAlerts();
  }

  function logout() {
    // Remove all cookies (best effort, works for most modern browsers)
    document.cookie.split(';').forEach(c => {
      document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    });
    // Optionally clear localStorage/sessionStorage if used
    // Reload the page to reset state
    window.location.reload();
  }

  $: if (activeTab === 'alerts' && loggedIn) fetchAlerts();
</script>

<nav class="nav">
  <a href="/">Home</a>
  <a href="/journey">Project Journey</a>
  <a href="/privacy">Privacy Policy</a>
  {#if loggedIn}
    <button class="logout-btn" on:click={logout}>Logout</button>
  {/if}
</nav>

{#if showToast}
  <div class="toast">✅ Login successful!</div>
{/if}

<main>
  <h1>Slot Alert</h1>
  <p class="desc">Get instant Telegram alerts for new Gmail messages. Secure, fast, and easy to use.</p>
  {#if !loggedIn}
    <button on:click={login}>Login with Google</button>
  {/if}
  {#if loggedIn}
    <div class="tabbar">
      <button on:click={() => activeTab = 'search'} disabled={activeTab === 'search'}>Search Mail</button>
      <button on:click={() => activeTab = 'alerts'} disabled={activeTab === 'alerts'}>Active Alerts</button>
    </div>
    {#if activeTab === 'search'}
      <input placeholder="Search sender, subject, or content" bind:value={query} />
      <button on:click={checkMail}>Check Mail</button>
      <div class="status">{status}</div>
      <ul>
        {#each messages as msg}
          <li>
            <strong>Subject:</strong> {msg.subject}<br>
            <strong>From:</strong> {msg.from}<br>
            <strong>Title:</strong> {msg.title}<br>
            <strong>Time:</strong> {new Date(Number(msg.time)).toLocaleString()}<br>
            <button on:click={() => setAlert({ sender: msg.from })}>Set Alert for Sender</button>
            <button on:click={() => setAlert({ subject: msg.subject })}>Set Alert for Subject</button>
            <button on:click={() => setAlert({ text: msg.title })}>Set Alert for Text</button>
          </li>
        {/each}
        {#if messages.length === 0}
          <li class="empty">No messages found.</li>
        {/if}
      </ul>
    {/if}
    {#if activeTab === 'alerts'}
      <h2>Active Alerts</h2>
      <ul>
        {#each alerts as alert}
          <li>
            {#if alert.sender}<span><strong>Sender:</strong> {alert.sender}</span>{/if}
            {#if alert.subject}<span><strong> Subject:</strong> {alert.subject}</span>{/if}
            {#if alert.text}<span><strong> Text:</strong> {alert.text}</span>{/if}
            <button on:click={() => deleteAlert(alert)}>Delete</button>
          </li>
        {/each}
        {#if alerts.length === 0}
          <li class="empty">No active alerts.</li>
        {/if}
      </ul>
    {/if}
  {/if}
</main>

<style>
  .nav {
    display: flex;
    gap: 1.5em;
    justify-content: center;
    margin-bottom: 2em;
    background: #f8f9fa;
    padding: 1em 0;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .nav a {
    color: #0077cc;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }
  .nav a:hover {
    color: #005fa3;
    text-decoration: underline;
  }
  main {
    max-width: 600px;
    margin: 2em auto;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.07);
    padding: 2em;
  }
  .desc {
    color: #444;
    margin-bottom: 1.5em;
    font-size: 1.1em;
    text-align: center;
  }
  .tabbar {
    margin-bottom: 1em;
  }
  button {
    background: #0077cc;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0.5em 1.2em;
    margin: 0.2em 0.5em 0.2em 0;
    cursor: pointer;
    font-size: 1em;
    transition: background 0.2s;
  }
  button:hover {
    background: #005fa3;
  }
  input {
    padding: 0.5em;
    border-radius: 6px;
    border: 1px solid #ccc;
    margin-right: 0.5em;
    font-size: 1em;
    width: 60%;
  }
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    background: #f4f8fb;
    margin: 1em 0;
    padding: 1em;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  }
  .empty {
    color: #888;
    text-align: center;
    font-style: italic;
    background: none;
    box-shadow: none;
    padding: 0.5em;
  }
  .status {
    margin: 1em 0 0.5em 0;
    color: #0077cc;
    font-weight: 500;
  }
  .toast {
    position: fixed;
    top: 20px; right: 20px;
    background: #333; color: #fff;
    padding: 12px 24px; border-radius: 6px;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
</style>
