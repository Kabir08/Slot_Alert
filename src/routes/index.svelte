<script>
  let loggedIn = false;
  let sender = '';
  let messages = [];
  let status = '';

  async function login() {
    window.location.href = '/api/auth/login';
  }

  async function checkMail() {
    if (!sender) return;
    const res = await fetch(`/.netlify/functions/check-mail?sender=${encodeURIComponent(sender)}`);
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
  <ul>
    {#each messages as msg}
      <li>{msg.id}</li>
    {/each}
  </ul>
</main>
