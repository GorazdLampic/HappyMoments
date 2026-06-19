/**
 * Nice Numbers — Lightweight Analytics
 * Anonymous user journey tracking via navigator.sendBeacon.
 * No cookies, no PII, respects Do Not Track.
 */

const HM_ANALYTICS = (() => {
    const ENDPOINT = '/api/event';
    const SESSION_ID = Math.random().toString(36).slice(2, 10);
    let queue = [];
    let flushTimer = null;
    let utmParams = null;

    // Capture UTM parameters from URL on load
    function captureUtm() {
        const params = new URLSearchParams(window.location.search);
        const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
        const utm = {};
        let hasUtm = false;
        keys.forEach(k => {
            const v = params.get(k);
            if (v) { utm[k] = v.slice(0, 100); hasUtm = true; }
        });
        if (hasUtm) {
            utmParams = utm;
            // Store in sessionStorage so it persists across page navigations
            try { sessionStorage.setItem('hm_utm', JSON.stringify(utm)); } catch {}
        } else {
            // Check sessionStorage for UTM from earlier in this session
            try {
                const stored = sessionStorage.getItem('hm_utm');
                if (stored) utmParams = JSON.parse(stored);
            } catch {}
        }
    }

    // Initialize UTM capture
    if (typeof window !== 'undefined') captureUtm();

    function isEnabled() {
        // Respect Do Not Track
        if (navigator.doNotTrack === '1') return false;
        return true;
    }

    function getUtm() { return utmParams; }

    function track(action, data) {
        if (!isEnabled()) return;

        const eventData = data || {};
        // Attach UTM to first event (page_view) and conversion events
        if (utmParams && (action === 'page_view' || action === 'auth_signed_in' || action === 'checkout_started' || action === 'deeplink_opened' || action === 'payment_complete' || action === 'premium_gate_hit')) {
            eventData.utm = utmParams;
        }

        queue.push({
            action,
            data: eventData,
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

    return { track, flush, getUtm };
})();
