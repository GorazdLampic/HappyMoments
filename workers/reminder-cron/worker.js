/**
 * Reminder cron worker — scans opt-in reminder subscriptions and sends a Web
 * Push notification when a stored event is about to hit a milestone.
 *
 * Deploy SEPARATELY from Pages (Pages Functions can't run cron):
 *   cd workers/reminder-cron && npx wrangler deploy
 * Requires (wrangler.toml + secrets):
 *   - D1 binding DB  (same database as the Pages app)
 *   - secret VAPID_PRIVATE_KEY  (base64url 'd' scalar)
 *   - var    VAPID_PUBLIC_KEY   (base64url applicationServerKey)
 *   - var    VAPID_SUBJECT      (mailto:you@domain)
 *   - triggers.crons = ["0 8 * * *"]  (daily 08:00 UTC)
 *
 * IMPORTANT: send one manual test to your own subscription and confirm delivery
 * before relying on this in production (Web Push crypto is unforgiving).
 */

// ---- milestone detection (mirrors the app: round numbers + a few patterns) ----
const UNIT_SECONDS = { days: 86400, weeks: 604800, hours: 3600, minutes: 60, seconds: 1 };

function isRound(n) {
    if (n < 1000) return false;
    const s = String(n);
    // 1 or 2 significant digits then zeros: 1000, 25000, 500000, 1000000...
    return /^[1-9]\d?0{2,}$/.test(s) || /^[1-9]0*$/.test(s);
}
function isRepdigit(n) { return n >= 1111 && /^(\d)\1+$/.test(String(n)); }
function isPalindrome(n) { const s = String(n); return n >= 10001 && s === s.split('').reverse().join(''); }
function isSpecial(n) { return isRound(n) || isRepdigit(n) || isPalindrome(n); }

// Returns milestones (value+unit) that fall within [now, now+windowDays] for a birthdate.
function upcomingMilestones(birthMs, nowMs, windowDays) {
    const out = [];
    const horizon = nowMs + windowDays * 86400000;
    for (const [unit, secs] of Object.entries(UNIT_SECONDS)) {
        const per = secs * 1000;
        const curr = (nowMs - birthMs) / per;
        // check the next handful of candidate values above the current count
        let v = Math.floor(curr) + 1;
        const maxV = Math.floor((horizon - birthMs) / per);
        let scanned = 0;
        while (v <= maxV && scanned < 5000) {
            if (isSpecial(v)) {
                const when = birthMs + v * per;
                if (when >= nowMs && when <= horizon) out.push({ value: v, unit, when });
            }
            v++; scanned++;
        }
    }
    out.sort((a, b) => a.when - b.when);
    return out.slice(0, 3);
}

function fmt(n) {
    if (n >= 1000000 && n % 100000 === 0) {
        if (n >= 1000000000) return (n / 1000000000) + ' billion';
        return (n / 1000000) + ' million';
    }
    return n.toLocaleString('en-US');
}

// ---- Web Push (RFC 8291 aes128gcm + RFC 8292 VAPID) via Web Crypto ----
const b64urlToBytes = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); const pad = s.length % 4 ? '='.repeat(4 - s.length % 4) : ''; const bin = atob(s + pad); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
const bytesToB64url = b => { let s = ''; const u = new Uint8Array(b); for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };

async function vapidJWT(endpoint, privD, pubKey, subject) {
    const aud = new URL(endpoint).origin;
    const header = bytesToB64url(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
    const payload = bytesToB64url(new TextEncoder().encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject })));
    const unsigned = `${header}.${payload}`;
    const jwk = { kty: 'EC', crv: 'P-256', d: privD, x: bytesToB64url(b64urlToBytes(pubKey).slice(1, 33)), y: bytesToB64url(b64urlToBytes(pubKey).slice(33, 65)), ext: true };
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(unsigned));
    return `${unsigned}.${bytesToB64url(sig)}`;
}

async function encryptPayload(payload, p256dh, auth) {
    const asPublic = b64urlToBytes(p256dh);
    const authSecret = b64urlToBytes(auth);
    const localKeys = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
    const localPubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', localKeys.publicKey));
    const uaPub = await crypto.subtle.importKey('raw', asPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
    const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaPub }, localKeys.privateKey, 256));

    const hkdf = async (salt, ikm, info, len) => {
        const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
        return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, k, len * 8));
    };
    const concat = (...a) => { const t = a.reduce((s, x) => s + x.length, 0); const o = new Uint8Array(t); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; };
    const te = s => new TextEncoder().encode(s);

    const prkKey = await hkdf(authSecret, shared, concat(te('WebPush: info\0'), asPublic, localPubRaw), 32);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const cek = await hkdf(salt, prkKey, concat(te('Content-Encoding: aes128gcm\0')), 16);
    const nonce = await hkdf(salt, prkKey, concat(te('Content-Encoding: nonce\0')), 12);

    const rec = concat(new Uint8Array(payload), new Uint8Array([2]));
    const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, rec));

    const header = concat(salt, new Uint8Array([0, 0, 16, 0]), new Uint8Array([localPubRaw.length]), localPubRaw);
    return concat(header, ct);
}

async function sendPush(sub, message, env) {
    const body = await encryptPayload(new TextEncoder().encode(JSON.stringify(message)), sub.keys.p256dh, sub.keys.auth);
    const jwt = await vapidJWT(sub.endpoint, env.VAPID_PRIVATE_KEY, env.VAPID_PUBLIC_KEY, env.VAPID_SUBJECT || 'mailto:hello@nicenumbers.app');
    const res = await fetch(sub.endpoint, {
        method: 'POST',
        headers: {
            'TTL': '86400',
            'Content-Encoding': 'aes128gcm',
            'Content-Type': 'application/octet-stream',
            'Authorization': `vapid t=${jwt}, k=${env.VAPID_PUBLIC_KEY}`
        },
        body
    });
    return res.status; // 201 = queued; 404/410 = expired (should be pruned)
}

export default {
    async scheduled(event, env, ctx) {
        if (!env.DB || !env.VAPID_PRIVATE_KEY) return;
        const now = Date.now();
        let rows;
        try { rows = (await env.DB.prepare('SELECT id, subscription, events FROM reminders').all()).results || []; }
        catch { return; }
        for (const row of rows) {
            let sub, events;
            try { sub = JSON.parse(row.subscription); events = JSON.parse(row.events); } catch { continue; }
            if (!sub || !sub.endpoint || !sub.keys) continue;
            for (const ev of (events || [])) {
                const birth = Date.parse(ev.d + 'T00:00:00Z');
                if (isNaN(birth)) continue;
                const ms = upcomingMilestones(birth, now, 2); // 2-day lookahead window
                for (const m of ms) {
                    const daysAway = Math.round((m.when - now) / 86400000);
                    const who = ev.n ? `${ev.n}` : 'You';
                    const message = {
                        title: `${fmt(m.value)} ${m.unit} coming up`,
                        body: daysAway <= 0 ? `${who} reaches ${fmt(m.value)} ${m.unit} today! 🎉` : `${who} reaches ${fmt(m.value)} ${m.unit} in ${daysAway} day${daysAway === 1 ? '' : 's'}.`,
                        url: 'https://nicenumbers.app/'
                    };
                    try {
                        const status = await sendPush(sub, message, env);
                        if (status === 404 || status === 410) { await env.DB.prepare('DELETE FROM reminders WHERE id = ?').bind(row.id).run(); }
                    } catch (e) { /* skip on error */ }
                }
            }
        }
    }
};
