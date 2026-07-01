/**
 * Top-level middleware — runs for EVERY request to the Pages project.
 * Both custom domains (nicenumbers.app + happymoments.app) point at this one
 * project, so this is where we enforce the canonical domain.
 *
 * Canonical-domain redirect:
 *   301  happymoments.app / www.happymoments.app  ->  nicenumbers.app
 * preserving the full path + query string. Everything else (nicenumbers.app,
 * www.nicenumbers.app, *.pages.dev previews) passes straight through.
 *
 * Chains correctly with functions/api/_middleware.js: this runs first for all
 * routes; for non-legacy hosts we call context.next(), which continues to the
 * /api/* middleware and handlers (or serves the static asset).
 */
const LEGACY_HOSTS = ['happymoments.app', 'www.happymoments.app'];
const CANONICAL_HOST = 'nicenumbers.app';

export async function onRequest(context) {
    const url = new URL(context.request.url);

    // Redirect only user-facing pages. NEVER redirect /api/* — server-to-server
    // callers (Stripe webhooks, Printful) don't follow 301s, so redirecting an
    // API/webhook call would silently break payments and fulfilment.
    if (LEGACY_HOSTS.includes(url.hostname) && !url.pathname.startsWith('/api/')) {
        url.hostname = CANONICAL_HOST;
        return Response.redirect(url.toString(), 301);
    }

    return context.next();
}
