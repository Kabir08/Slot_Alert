import { json } from '@sveltejs/kit';
import { redis } from '$lib/redis.js';

function getUserEmailFromCookies(cookies) {
	// You should set this cookie after login/callback
	return cookies.get('user_email');
}

export async function POST({ request, cookies }) {
	const userEmail = getUserEmailFromCookies(cookies);
	if (!userEmail) return json({ error: 'Unauthorized' }, { status: 401 });
	const { sender, subject, text } = await request.json();
	const userRaw = await redis.get(`user:${userEmail}`);
	if (!userRaw) return json({ error: 'User not found' }, { status: 404 });
	const user = JSON.parse(userRaw);
	if (user.alerts.length >= 3) {
		return json({ error: 'Maximum 3 alerts allowed per user.' }, { status: 400 });
	}
	user.alerts.push({ sender, subject, text });
	await redis.set(`user:${userEmail}`, JSON.stringify(user));
	return json({ success: true });
}

export async function GET({ cookies }) {
	const userEmail = getUserEmailFromCookies(cookies);
	if (!userEmail) return json({ error: 'Unauthorized' }, { status: 401 });
	const userRaw = await redis.get(`user:${userEmail}`);
	if (!userRaw) return json({ alerts: [] });
	const user = JSON.parse(userRaw);
	return json({ alerts: user.alerts || [] });
}

export async function DELETE({ request, cookies }) {
	const userEmail = getUserEmailFromCookies(cookies);
	if (!userEmail) return json({ error: 'Unauthorized' }, { status: 401 });
	const { sender, subject, text } = await request.json();
	const userRaw = await redis.get(`user:${userEmail}`);
	if (!userRaw) return json({ error: 'User not found' }, { status: 404 });
	const user = JSON.parse(userRaw);
	user.alerts = (user.alerts || []).filter(a => !(a.sender === sender && a.subject === subject && a.text === text));
	await redis.set(`user:${userEmail}`, JSON.stringify(user));
	return json({ success: true });
}
