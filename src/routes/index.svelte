<script>
let loggedIn = false;
let sender = '';
let messages = [];
let status = '';
let telegramCode = '';

async function login() {
  window.location.href = '/api/auth/login';
}

async function fetchUser() {
  const res = await fetch('/api/user', { credentials: 'include' });
  if (res.ok) {
    const user = await res.json();
    telegramCode = user.telegram_code || '';
    loggedIn = true;
  } else {
    telegramCode = '';
    loggedIn = false;
  }
}

async function checkMail() {
  if (!sender) return;
  const res = await fetch(`/.netlify/functions/check-mail?sender=${encodeURIComponent(sender)}`, { credentials: 'include' });
  const data = await res.json();
  messages = data.messages || [];
  status = messages.length ? `Found ${messages.length} messages.` : 'No new messages.';
}

async function triggerAlarm() {
  const res = await fetch('/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Alarm triggered from Slot Alert!' })
  });
  const data = await res.json();
  status = data.result ? 'Alarm triggered!' : 'Failed to trigger alarm.';
}

import { onMount } from 'svelte';
onMount(() => {
  fetchUser();
});
</script>

<main>
  <h1>Slot Alert</h1>
  <p>Welcome! Use the controls below to connect your Gmail and set up notifications.</p>
  <button on:click={login}>Login with Google</button>
  <div>
    <input placeholder="Sender email" bind:value={sender} />
    <button on:click={checkMail}>Check Mail</button>
  </div>
  <div>
    <button on:click={triggerAlarm}>Trigger Alarm</button>
  </div>
  <div>{status}</div>
  {#if loggedIn && telegramCode}
    <div style="margin-top:2em;">
      <h2>Link Telegram</h2>
      <p>Enter this code in the Telegram bot to link your account:</p>
      <code style="font-size:1.5em; background:#f4f4f4; padding:0.5em; border-radius:4px;">{telegramCode}</code>
    </div>
  {/if}
  <ul>
    {#each messages as msg}
      <li>{msg.id}</li>
    {/each}
  </ul>
</main>
