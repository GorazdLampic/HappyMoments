/**
 * /api/reminders — OPT-IN reminder subscriptions for milestone push notifications.
 *
 * Privacy model (important):
 *  - Entirely opt-in. Nothing is stored unless the user explicitly enables
 *    "cloud reminders". The account-less local-first app keeps working with no
 *    server data at all.
 *  - We store the MINIMUM needed to send a reminder: a random client-generated
 *    device id, the Web-Push subscription, and a compact list of the events the
 *    user chose to be reminded about ({ n: name, d: 'YYYY-MM-DD' }). No email,
 *    no analytics, no linkage to identity.
 *  - The row is keyed by the device id so the user can update or delete it
 *    (DELETE) at any time — full control.
 *
 * POST   { id, subscription, events:[{n,d}], locale?, tz? }  -> upsert
 * DELETE { id }                                              -> remove (unsubscribe)
 *
 * Fails soft: if D1 isn't bound, returns { ok:true, stored:0 } so the client
 * never errors — reminders are simply not active until the backend is configured.
 */

const MAX_EVENTS = 100;
const MAX_SUB_BYTES = 4000;

function ensureTable(db) {
    return db.prepare(
        `CREATE TABLE IF NOT EXISTS reminders (
            id TEXT PRIMARY KEY,
            endpoint TEXT,
            subscription TEXT NOT NULL,
            events TEXT NOT NULL,
            locale TEXT,
            tz TEXT,
            created_at INTEGER,
            updated_at INTEGER
        )`
    ).run();
}

export async function onRequestPost(context) {
    let body;
    try { body = await context.request.json(); } catch { return Response.json({ error: 'Invalid body' }, { status: 400 }); }

    const id = String(body.id || '').slice(0, 64);
    const subscription = body.subscription;
    const events = Array.isArray(body.events) ? body.events : [];

    if (!id || !/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
        return Response.json({ error: 'Invalid id' }, { status: 400 });
    }
    if (!subscription || !subscription.endpoint || typeof subscription.endpoint !== 'string') {
        return Response.json({ error: 'Invalid subscription' }, { status: 400 });
    }
    const subJson = JSON.stringify(subscription);
    if (subJson.length > MAX_SUB_BYTES) {
        return Response.json({ error: 'Subscription too large' }, { status: 400 });
    }
    if (events.length > MAX_EVENTS) {
        return Response.json({ error: 'Too many events' }, { status: 400 });
    }
    // Normalise events to the minimal { n, d } shape and validate dates.
    const clean = [];
    for (const e of events) {
        const n = String(e && e.n != null ? e.n : '').slice(0, 60);
        const d = String(e && e.d != null ? e.d : '');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
        clean.push({ n, d });
    }

    const db = context.env.DB;
    if (!db) return Response.json({ ok: true, stored: 0, note: 'backend-not-configured' });

    try {
        await ensureTable(db);
        const now = Date.now();
        await db.prepare(
            `INSERT INTO reminders (id, endpoint, subscription, events, locale, tz, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
                endpoint = excluded.endpoint,
                subscription = excluded.subscription,
                events = excluded.events,
                locale = excluded.locale,
                tz = excluded.tz,
                updated_at = excluded.updated_at`
        ).bind(
            id,
            String(subscription.endpoint).slice(0, 512),
            subJson,
            JSON.stringify(clean),
            String(body.locale || '').slice(0, 12) || null,
            String(body.tz || '').slice(0, 48) || null,
            now, now
        ).run();
        return Response.json({ ok: true, stored: clean.length });
    } catch (err) {
        return Response.json({ error: 'Store failed' }, { status: 500 });
    }
}

export async function onRequestDelete(context) {
    let body;
    try { body = await context.request.json(); } catch { body = {}; }
    const id = String(body.id || new URL(context.request.url).searchParams.get('id') || '').slice(0, 64);
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
    const db = context.env.DB;
    if (!db) return Response.json({ ok: true });
    try {
        await ensureTable(db);
        await db.prepare('DELETE FROM reminders WHERE id = ?').bind(id).run();
        return Response.json({ ok: true });
    } catch {
        return Response.json({ error: 'Delete failed' }, { status: 500 });
    }
}
