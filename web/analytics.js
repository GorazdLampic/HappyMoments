/**
 * HappyMoments — Lightweight Analytics
 * Anonymous user journey tracking via navigator.sendBeacon.
 * No cookies, no PII, respects Do Not Track.
 */

const HM_ANALYTICS = (() => {
    const ENDPOINT = '/api/event';
    const SESSION_ID = Math.random().toString(36).slice(2, 10);
    let queue = [];
    let flushTimer = null;

    function isEnabled() {
        // Respect Do Not Track
        if (navigator.doNotTrack === '1') return false;
        return true;
    }

    function track(action, data) {
        if (!isEnabled()) return;

        queue.push({
            action,
            data: data || {},
            ts: Date.now(),
            sid: SESSION_ID,
            uid: (typeof HM_AUTH !== 'undefined' && HM_AUTH.isLoggedIn())
                ? HM_AUTH.getUser()?.uid || null
                : null
        });

        // Flush when queue hits 5 events, or after 10 seconds
        if (queue.length >= 5) {
            flush();
        } else if (!flushTimer) {
            flushTimer = setTimeout(flush, 10000);
        }
    }

    function flush() {
        if (queue.length === 0) return;
        if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }

        const events = queue.splice(0);

        // Use sendBeacon for non-blocking delivery (survives page unload)
        const payload = JSON.stringify({ events });
        if (navigator.sendBeacon) {
            navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'application/json' }));
        } else {
            // Fallback for older browsers
            fetch(ENDPOINT, {
                method: 'POST',
                body: payload,
                headers: { 'Content-Type': 'application/json' },
                keepalive: true
            }).catch(() => {});
        }
    }

    // Flush on page unload
    if (typeof window !== 'undefined') {
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') flush();
        });
        window.addEventListener('pagehide', flush);
    }

    return { track, flush };
})();
