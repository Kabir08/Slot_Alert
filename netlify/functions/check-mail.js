// netlify/functions/check-mail.js
// Netlify function version of /api/check-mail
const { getNewMessages } = require('../../src/lib/gmail.js');
const { getValidAccessToken } = require('../../src/lib/auth-helpers.js');

exports.handler = async function(event, context) {
  console.log('=== Netlify Function: /check-mail handler invoked ===');
  // Netlify functions get cookies from headers
  const cookieHeader = event.headers.cookie || '';
  const cookies = Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=')));
  const userEmail = cookies['user_email'];
  console.log('Netlify/check-mail: user_email from cookie:', userEmail);
  if (!userEmail) return {
    statusCode: 401,
    body: JSON.stringify({ error: 'Unauthorized' })
  };
  const access_token = await getValidAccessToken(userEmail);
  console.log('Netlify/check-mail: access_token:', access_token);
  if (!access_token) return {
    statusCode: 401,
    body: JSON.stringify({ error: 'Unauthorized' })
  };
  const url = new URL(event.rawUrl || `https://${event.headers.host}${event.path}${event.rawQuery ? '?' + event.rawQuery : ''}`);
  const q = url.searchParams.get('q');
  const query = (q && q.trim()) ? q : '';
  console.log('Netlify/check-mail: Making Gmail API request for user:', userEmail, 'with query:', query);
  const messages = await getNewMessages(userEmail, query);
  return {
    statusCode: 200,
    body: JSON.stringify({
      messages: messages.map(m => ({
        id: m.id,
        title: m.snippet,
        subject: m.subject,
        from: m.from,
        time: m.internalDate
      }))
    })
  };
};
