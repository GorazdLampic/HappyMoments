/**
 * GET /api/admin — Admin dashboard API
 * Returns analytics data from D1 database.
 *
 * Query params:
 *   action = stats | journey | events | users | campaigns
 *   filter = (optional) action type filter for events
 *
 * Auth: Bearer hm-admin-2026
 */

const ADMIN_TOKEN = 'hm-admin-2026';

function checkAuth(request) {
    const auth = request.headers.get('Authorization');
    return auth === `Bearer ${ADMIN_TOKEN}`;
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function onRequestGet(context) {
    if (!checkAuth(context.request)) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const db = context.env.DB;
    if (!db) {
        return jsonResponse({ error: 'Database not configured' }, 503);
    }

    const url = new URL(context.request.url);
    const action = url.searchParams.get('action') || 'stats';

    try {
        switch (action) {
            case 'stats':
                return jsonResponse(await getStats(db));
            case 'journey':
                return jsonResponse(await getJourney(db));
            case 'events':
                return jsonResponse(await getEvents(db, url.searchParams));
            case 'users':
                return jsonResponse(await getUsers(db));
            case 'campaigns':
                return jsonResponse(await getCampaigns(db));
            default:
                return jsonResponse({ error: `Unknown action: ${action}` }, 400);
        }
    } catch (err) {
        return jsonResponse({ error: 'Server error', detail: err.message }, 500);
    }
}

async function getStats(db) {
    const now = Math.floor(Date.now() / 1000);
    const todayStart = now - (now % 86400);
    const weekStart = now - 7 * 86400;

    const [totalUsers, usersToday, usersWeek, totalEvents, eventsToday, premiumUsers, happyClicks] =
        await Promise.all([
            db.prepare('SELECT COUNT(*) as c FROM users').first(),
            db.prepare('SELECT COUNT(*) as c FROM users WHERE created_at >= ?').bind(todayStart).first(),
            db.prepare('SELECT COUNT(*) as c FROM users WHERE created_at >= ?').bind(weekStart).first(),
            db.prepare('SELECT COUNT(*) as c FROM events').first(),
            db.prepare('SELECT COUNT(*) as c FROM events WHERE created_at >= ?').bind(todayStart * 1000).first(),
            db.prepare('SELECT COUNT(*) as c FROM users WHERE premium_until IS NOT NULL AND premium_until > ?').bind(now).first(),
            db.prepare("SELECT COUNT(*) as c FROM events WHERE action = 'happy_click'").first(),
        ]);

    // Daily signups for last 14 days
    const dailySignups = await db.prepare(`
        SELECT (created_at - (created_at % 86400)) as day, COUNT(*) as c
        FROM users
        WHERE created_at >= ?
        GROUP BY day
        ORDER BY day DESC
    `).bind(now - 14 * 86400).all();

    return {
        total_users: totalUsers?.c || 0,
        users_today: usersToday?.c || 0,
        users_this_week: usersWeek?.c || 0,
        total_events: totalEvents?.c || 0,
        events_today: eventsToday?.c || 0,
        premium_users: premiumUsers?.c || 0,
        happy_clicks: happyClicks?.c || 0,
        daily_signups: dailySignups?.results || []
    };
}

async function getJourney(db) {
    const funnelActions = [
        'page_view',
        'deeplink_opened',
        'deeplink_accepted',
        'onboard_complete',
        'event_added',
        'tab_switched',
        'auth_signed_in',
        'notifications_enabled',
        'quick_share',
        'share_whatsapp',
        'share_viber',
        'share_email',
        'challenge_share',
        'group_challenge',
        'card_downloaded',
        'card_shared',
        'share_app',
        'premium_gate_hit',
        'checkout_started',
        'payment_complete',
        'payment_cancelled',
        'account_deleted',
        'happy_click'
    ];

    const results = await Promise.all(
        funnelActions.map(action =>
            db.prepare('SELECT COUNT(*) as c FROM events WHERE action = ?').bind(action).first()
        )
    );

    const funnel = funnelActions.map((action, i) => ({
        action,
        count: results[i]?.c || 0
    }));

    return { funnel };
}

async function getEvents(db, params) {
    const filter = params.get('filter');
    const limit = Math.min(parseInt(params.get('limit') || '50'), 200);

    let query, args;
    if (filter) {
        query = 'SELECT id, session_id, user_id, action, data, country, created_at FROM events WHERE action = ? ORDER BY created_at DESC LIMIT ?';
        args = [filter, limit];
    } else {
        query = 'SELECT id, session_id, user_id, action, data, country, created_at FROM events ORDER BY created_at DESC LIMIT ?';
        args = [limit];
    }

    const stmt = db.prepare(query);
    const result = await (filter ? stmt.bind(...args) : stmt.bind(limit)).all();

    // Get distinct action types for filter dropdown
    const actions = await db.prepare('SELECT DISTINCT action FROM events ORDER BY action').all();

    return {
        events: result?.results || [],
        action_types: (actions?.results || []).map(r => r.action)
    };
}

async function getUsers(db) {
    const result = await db.prepare(`
        SELECT uid, email, display_name, premium_until, stripe_customer_id,
               utm_source, utm_medium, utm_campaign, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 200
    `).all();

    return { users: result?.results || [] };
}

async function getCampaigns(db) {
    const result = await db.prepare(`
        SELECT utm_source, utm_medium, utm_campaign, COUNT(*) as count
        FROM users
        WHERE utm_source IS NOT NULL OR utm_campaign IS NOT NULL
        GROUP BY utm_source, utm_medium, utm_campaign
        ORDER BY count DESC
    `).all();

    return { campaigns: result?.results || [] };
}
