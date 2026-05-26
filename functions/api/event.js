/**
 * POST /api/event — Receive analytics events
 * Stores anonymous user journey data in D1.
 */

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const events = body.events;

        if (!Array.isArray(events) || events.length === 0 || events.length > 20) {
            return Response.json({ error: 'Invalid events' }, { status: 400 });
        }

        const db = context.env.DB;
        if (!db) {
            // D1 not bound yet — accept silently
            return Response.json({ ok: true, stored: 0 });
        }

        const country = context.request.headers.get('CF-IPCountry') || 'XX';
        const stmt = db.prepare(
            'INSERT INTO events (session_id, user_id, action, data, country, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        );

        const batch = events.map(e => stmt.bind(
            String(e.sid || '').slice(0, 20),
            e.uid ? String(e.uid).slice(0, 128) : null,
            String(e.action || '').slice(0, 50),
            JSON.stringify(e.data || {}).slice(0, 500),
            country,
            e.ts || Date.now()
        ));

        await db.batch(batch);

        return Response.json({ ok: true, stored: events.length });
    } catch (err) {
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
