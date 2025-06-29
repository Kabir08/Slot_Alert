<script>
  import { onMount } from 'svelte';
  let loggedIn = false;
  let sender = '';
  let subject = '';
  let text = '';
  let messages = [];
  let status = '';

  onMount(() => {
    loggedIn = document.cookie.includes('access_token');
  });

  async function checkMail() {
    const params = new URLSearchParams();
    if (sender) params.append('sender', sender);
    if (subject) params.append('subject', subject);
    if (text) params.append('text', text);
    const res = await fetch(`/api/check-mail?${params.toString()}`);
    const data = await res.json();
    messages = data.messages || [];
    status = messages.length ? `Found ${messages.length} messages.` : 'No new messages.';
  }

  async function setAlert(alert) {
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
    alert('Alert set!');
  }
</script>

{#if loggedIn}
  <div class="login-confirmation">✅ Login successful! You are now logged in.</div>
{/if}

<main>
  <h1>Slot Alert</h1>
  <input placeholder="Sender email" bind:value={sender} />
  <input placeholder="Subject" bind:value={subject} />
  <input placeholder="Text in mail" bind:value={text} />
  <button on:click={checkMail}>Check Mail</button>
  <div>{status}</div>
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
  </ul>
</main>
