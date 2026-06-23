/**
 * /api/user — User registration and premium status
 * POST: Create/update user record after Firebase sign-in
 * GET: Check premium status
 *
 * Requires: Firebase Auth token in Authorization header
 * Requires: D1 database binding as DB
 */

// Full Firebase ID-token verification using Web Crypto (no external deps).
// Verifies the RS256 signature against Google's public keys and validates the
// standard claims (aud = project, iss = securetoken, exp/iat). A forged or
// tampered token fails closed (returns null → 401). Legitimate tokens, which
// Google signs with these keys, pass unchanged.
const FIREBASE_PROJECT_ID = 'happymoments-app';
const FIREBASE_ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
const GOOGLE_JWK_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

// Soft per-isolate cache of Google's public keys (refetched after max-age).
let _jwkCache = { map: null, exp: 0 };

async function getGooglePublicKeys() {
    const now = Date.now();
    if (_jwkCache.map && _jwkCache.exp > now) return _jwkCache.map;
    const res = await fetch(GOOGLE_JWK_URL);
    if (!res.ok) throw new Error('Failed to fetch Google public keys');
    const data = await res.json();
    const map = {};
    for (const k of (data.keys || [])) map[k.kid] = k;
    const cc = res.headers.get('cache-control') || '';
    const m = cc.match(/max-age=(\d+)/);
    const ttl = (m ? parseInt(m[1], 10) : 3600) * 1000;
    _jwkCache = { map, exp: now + ttl };
    return map;
}

function b64urlJson(seg) {
    return JSON.parse(atob(seg.replace(/-/g, '+').replace(/_/g, '/')));
}
function b64urlBytes(seg) {
    let s = seg.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}

async function verifyFirebaseToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;

    let header, payload;
    try {
        header = b64urlJson(headerB64);
        payload = b64urlJson(payloadB64);
    } catch {
        return null;
    }

    if (header.alg !== 'RS256' || !header.kid) return null;

    const now = Math.floor(Date.now() / 1000);
    if (payload.aud !== FIREBASE_PROJECT_ID) return null;
    if (payload.iss !== FIREBASE_ISSUER) return null;
    if (!payload.sub) return null;
    if (!payload.exp || payload.exp <= now) return null;
    if (!payload.iat || payload.iat > now + 300) return null; // allow small clock skew

    let valid;
    try {
        const keys = await getGooglePublicKeys();
        const jwk = keys[header.kid];
        if (!jwk) return null;
        const key = await crypto.subtle.importKey(
            'jwk',
            { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
            { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
            false,
            ['verify']
        );
        valid = await crypto.subtle.verify(
            'RSASSA-PKCS1-v1_5',
            key,
            b64urlBytes(sigB64),
            new TextEncoder().encode(`${headerB64}.${payloadB64}`)
        );
    } catch {
        return null;
    }
    if (!valid) return null;

    return {
        uid: payload.sub,
        email: payload.email || null,
        name: payload.name || null,
        email_verified: payload.email_verified || false
    };
}

async function getFirebaseUid(request) {
    const auth = request.headers.get('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) return null;
    return verifyFirebaseToken(auth.slice(7));
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

    // Parse request body for UTM data
    let utm = {};
    try {
        const body = await context.request.json();
        if (body.utm) utm = body.utm;
    } catch {}

    // Upsert user (only set UTM on first registration, not on updates)
    await db.prepare(`
        INSERT INTO users (uid, email, display_name, utm_source, utm_medium, utm_campaign, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(uid) DO UPDATE SET
            email = excluded.email,
            display_name = excluded.display_name,
            updated_at = excluded.updated_at
    `).bind(
        claims.uid, claims.email, claims.name,
        utm.utm_source || null, utm.utm_medium || null, utm.utm_campaign || null,
        now, now
    ).run();

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

// DELETE /api/user — Delete user account and associated data
export async function onRequestDelete(context) {
    const claims = await getFirebaseUid(context.request);
    if (!claims) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = context.env.DB;
    if (!db) {
        return Response.json({ ok: true });
    }

    // Delete user record
    await db.prepare('DELETE FROM users WHERE uid = ?').bind(claims.uid).run();
    // Delete associated analytics events
    await db.prepare('DELETE FROM events WHERE user_id = ?').bind(claims.uid).run();

    return Response.json({ ok: true, deleted: true });
}
