/**
 * prod-api-smoke.js — post-deploy check against PRODUCTION that would have caught
 * the build-109 "Failed to fetch" gift bug (the app's native origin was not in
 * the /api CORS allow-list, so the WebView blocked every backend call).
 *
 * Run AFTER any backend (functions/) deploy, BEFORE relying on the native app:
 *   node tools/prod-api-smoke.js
 *
 * Checks:
 *   1. /api/health returns JSON with db+stripe bound.
 *   2. An OPTIONS preflight from the Capacitor origin (https://localhost) is
 *      echoed back in Access-Control-Allow-Origin (else native fetch is blocked).
 */
const BASE = process.env.SMOKE_BASE || 'https://nicenumbers.app';
const NATIVE_ORIGIN = 'https://localhost';
const problems = [];

async function main() {
    // 1) health
    try {
        const res = await fetch(`${BASE}/api/health`);
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) problems.push(`/api/health did not return JSON (${ct})`);
        const j = await res.json();
        if (j.status !== 'ok') problems.push(`/api/health status=${j.status}`);
        if (!j.db) problems.push('/api/health db not bound');
        if (!j.stripe) problems.push('/api/health stripe not bound');
        console.log(`health: status=${j.status} db=${j.db} stripe=${j.stripe}`);
    } catch (e) {
        problems.push(`/api/health request failed: ${e.message}`);
    }

    // 2) CORS preflight from the native origin
    try {
        const res = await fetch(`${BASE}/api/gift-order`, {
            method: 'OPTIONS',
            headers: {
                'Origin': NATIVE_ORIGIN,
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'content-type',
            },
        });
        const allow = res.headers.get('access-control-allow-origin');
        if (allow !== NATIVE_ORIGIN) {
            problems.push(`CORS: Allow-Origin='${allow}' (expected '${NATIVE_ORIGIN}') — native app calls will be blocked`);
        }
        console.log(`cors: preflight Allow-Origin=${allow}`);
    } catch (e) {
        problems.push(`CORS preflight failed: ${e.message}`);
    }

    if (problems.length) {
        console.error(`\nprod-api-smoke: ${problems.length} problem(s):`);
        problems.forEach(p => console.error('  ✗ ' + p));
        process.exit(1);
    }
    console.log('\nprod-api-smoke: OK — backend reachable and native origin allowed.');
}

main().catch(e => { console.error(e); process.exit(1); });
