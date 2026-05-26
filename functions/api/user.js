/**
 * /api/user — User registration and premium status
 * POST: Create/update user record after Firebase sign-in
 * GET: Check premium status
 *
 * Requires: Firebase Auth token in Authorization header
 * Requires: D1 database binding as DB
 */

// Lightweight Firebase token verification (extracts claims without full verification)
// For production, use firebase-auth-cloudflare-workers package for full JWT verification
async function getFirebaseUid(request) {
    const auth = request.headers.get('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) return null;

    const token = auth.slice(7);
    try {
        // Decode JWT payload (base64url)
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

        // Basic validation
        if (!payload.sub || !payload.exp) return null;
        if (payload.exp * 1000 < Date.now()) return null;

        return {
            uid: payload.sub,
            email: payload.email || null,
            name: payload.name || null,
            email_verified: payload.email_verified || false
        };
    } catch {
        return null;
    }
}

// POST /api/user — Register or update user
export async function onRequestPost(context) {
    const claims = await getFirebaseUid(context.request);
    if (!claims) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = context.env.DB;
    if (!db) {
        return Response.json({ error: 'Database not configured' }, { status: 503 });
    }

    const now = Math.floor(Date.now() / 1000);

    // Upsert user
    await db.prepare(`
        INSERT INTO users (uid, email, display_name, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(uid) DO UPDATE SET
            email = excluded.email,
            display_name = excluded.display_name,
            updated_at = excluded.updated_at
    `).bind(claims.uid, claims.email, claims.name, now, now).run();

    // Get current status
    const user = await db.prepare('SELECT * FROM users WHERE uid = ?').bind(claims.uid).first();

    return Response.json({
        uid: user.uid,
        email: user.email,
        is_premium: user.premium_until ? user.premium_until > now : false,
        premium_until: user.premium_until || null,
        created_at: user.created_at
    });
}

// GET /api/user — Check premium status
export async function onRequestGet(context) {
    const claims = await getFirebaseUid(context.request);
    if (!claims) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = context.env.DB;
    if (!db) {
        return Response.json({ is_premium: false, premium_until: null });
    }

    const user = await db.prepare('SELECT premium_until FROM users WHERE uid = ?').bind(claims.uid).first();
    const now = Math.floor(Date.now() / 1000);

    return Response.json({
        is_premium: user?.premium_until ? user.premium_until > now : false,
        premium_until: user?.premium_until || null
    });
}
