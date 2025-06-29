<script>
  import { onMount } from 'svelte';
  let loggedIn = false;
  let query = '';
  let messages = [];
  let status = '';
  let showToast = false;

  onMount(async () => {
    // Try to fetch a protected endpoint to check login
    const res = await fetch('/api/check-mail?sender=me');
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

{#if showToast}
  <div class="toast">✅ Login successful!</div>
{/if}

<main>
  <h1>Slot Alert</h1>
  {#if !loggedIn}
    <button on:click={login}>Login with Google</button>
  {/if}
  {#if loggedIn}
    <input placeholder="Search sender, subject, or content" bind:value={query} />
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
  {/if}
</main>

<style>
  .toast {
    position: fixed;
    top: 20px; right: 20px;
    background: #333; color: #fff;
    padding: 12px 24px; border-radius: 6px;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
  .badge {
    background: #ffd700; color: #333; border-radius: 4px; padding: 2px 6px; margin-left: 6px; font-size: 0.8em;
  }
</style>
