import { json } from '@sveltejs/kit';
import { redis } from '$lib/redis.js';

export async function POST({ request, cookies }) {
	const access_token = cookies.get('access_token');
	if (!access_token) return json({ error: 'Unauthorized' }, { status: 401 });
	const { sender, subject, text } = await request.json();
	// Limit to 3 alerts per user (here, just 'user' for demo)
	const currentAlerts = await redis.lrange('user:alerts', 0, -1);
	if (currentAlerts && currentAlerts.length >= 3) {
		return json({ error: 'Maximum 3 alerts allowed per user.' }, { status: 400 });
	}
	await redis.lpush('user:alerts', JSON.stringify({ sender, subject, text }));
	return json({ success: true });
}

export async function GET({ cookies }) {
	const access_token = cookies.get('access_token');
	if (!access_token) return json({ error: 'Unauthorized' }, { status: 401 });
	const alerts = await redis.lrange('user:alerts', 0, -1);
	// Parse alerts for UI
	const parsed = (alerts || []).map(a => {
		try {
			return JSON.parse(a);
		} catch {
			return a;
		}
	});
	return json({ alerts: parsed });
}

export async function DELETE({ request, cookies }) {
	const access_token = cookies.get('access_token');
	if (!access_token) return json({ error: 'Unauthorized' }, { status: 401 });
	const { sender, subject, text } = await request.json();
	const alerts = await redis.lrange('user:alerts', 0, -1);
	// Remove the first matching alert
	for (const a of alerts) {
		let parsed;
		try {
			parsed = JSON.parse(a);
		} catch {
			continue;
		}
		if (parsed.sender === sender && parsed.subject === subject && parsed.text === text) {
			await redis.lrem('user:alerts', 1, a);
			break;
		}
	}
	return json({ success: true });
}
