/**
 * Nice Numbers — Lightweight Analytics
 * Anonymous user journey tracking via navigator.sendBeacon.
 * No cookies, no PII, respects Do Not Track.
 */

const HM_ANALYTICS = (() => {
    // On native (Capacitor) the app is served from https://localhost, so a relative
    // "/api/event" beacon hits the local bundle instead of the Cloudflare backend —
    // silently dropping every in-app analytics event. Mirror app.js apiUrl(): force
    // the absolute production origin when native (or on a *.pages.dev branch preview),
    // stay same-origin on web.
    function resolveEndpoint() {
        try {
            const isNative = typeof window.Capacitor !== 'undefined'
                && typeof window.Capacitor.isNativePlatform === 'function'
                && window.Capacitor.isNativePlatform();
            const isPreview = typeof location !== 'undefined' && /\.pages\.dev$/.test(location.hostname);
            if (isNative || isPreview) return 'https://nicenumbers.app/api/event';
        } catch (e) {}
        return '/api/event';
    }
    const ENDPOINT = resolveEndpoint();

    // Platform dimension so the backend can split app vs web (and iOS later).
    function getPlatform() {
        try {
            if (typeof window.Capacitor !== 'undefined'
                && typeof window.Capacitor.getPlatform === 'function') {
                return window.Capacitor.getPlatform(); // 'android' | 'ios' | 'web'
            }
        } catch (e) {}
        return 'web';
    }
    const PLATFORM = getPlatform();

    // Best-effort app version. On native, ask the Capacitor App plugin (async, cached
    // once). On web it stays null until a build constant is wired — platform already
    // tells app vs web, so this is a secondary dimension.
    let APP_VERSION = null;
    (function loadAppVersion() {
        try {
            const App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
            if (App && typeof App.getInfo === 'function') {
                App.getInfo().then(info => {
                    if (info && info.version) APP_VERSION = String(info.version).slice(0, 20);
                }).catch(() => {});
            }
        } catch (e) {}
    })();

    // Persistent anonymous device id (not PII) so returning users can be counted for
    // retention (DAU/WAU). Distinct from SESSION_ID, which is per page-load.
    function getDeviceId() {
        try {
            let id = localStorage.getItem('nn_device_id');
            if (!id) {
                id = 'd_' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
                localStorage.setItem('nn_device_id', id);
            }
            return id;
        } catch (e) { return null; }
    }
    const DEVICE_ID = getDeviceId();

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
            did: DEVICE_ID,
            platform: PLATFORM,
            ver: APP_VERSION,
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

        // Use sendBeacon for non-blocking delivery (survives page unload).
        // NOTE: type must be 'text/plain' — that is CORS-safelisted, so the beacon
        // needs no preflight and works cross-origin from the native app
        // (https://localhost → https://nicenumbers.app). The backend parses the body
        // as JSON regardless of the declared content type.
        const payload = JSON.stringify({ events });
        if (navigator.sendBeacon) {
            navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'text/plain;charset=UTF-8' }));
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
