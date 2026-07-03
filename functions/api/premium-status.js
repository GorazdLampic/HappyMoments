/**
 * GET /api/premium-status — account-less premium verification.
 *
 *   ?session_id=cs_...  → verify a just-completed Stripe Checkout session was PAID
 *                          (source of truth for immediate activation after purchase).
 *   ?email=a@b.com      → restore: look up a previously purchased premium by the
 *                          email the customer paid with (stored by the webhook).
 *
 * Returns { premium: bool, premium_until?: <unix seconds>, email?: string }.
 * No sign-in / no account required.
 */

const ONE_YEAR = 365 * 24 * 60 * 60;

export async function onRequestGet(context) {
    const url = new URL(context.request.url);
    const sessionId = url.searchParams.get('session_id');
    const email = (url.searchParams.get('email') || '').trim().toLowerCase();
    const STRIPE_KEY = context.env.STRIPE_SECRET_KEY;

    // 1) Verify a paid checkout session directly with Stripe.
    if (sessionId) {
        if (!STRIPE_KEY) return Response.json({ premium: false, error: 'not_configured' });
        try {
            const r = await fetch(
                `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
                { headers: { Authorization: `Bearer ${STRIPE_KEY}` } }
            );
            const s = await r.json();
            // STRICT: only a genuinely PAID, LIVE, PREMIUM (subscription) session
            // grants premium. Without these checks a paid GIFT session — whose id
            // the client also receives — could be replayed here to unlock premium
            // for free (cross-product reuse). Test-mode sessions never grant.
            const isPremiumSession = (s.mode === 'subscription') || (s.metadata && s.metadata.type === 'premium');
            const paid = s && s.payment_status === 'paid' && s.livemode === true && isPremiumSession;
            if (paid) {
                const until = Math.floor(Date.now() / 1000) + ONE_YEAR;
                const custEmail = (s.customer_details && s.customer_details.email) || s.customer_email || '';
                return Response.json({ premium: true, premium_until: until, email: custEmail });
            }
            return Response.json({ premium: false });
        } catch {
            return Response.json({ premium: false, error: 'verify_failed' });
        }
    }

    // 2) Restore by email from the premium table the webhook maintains.
    if (email && email.includes('@')) {
        if (!context.env.DB) return Response.json({ premium: false });
        try {
            const row = await context.env.DB
                .prepare('SELECT premium_until FROM premium WHERE email = ?')
                .bind(email).first();
            if (row && row.premium_until && row.premium_until * 1000 > Date.now()) {
                return Response.json({ premium: true, premium_until: row.premium_until });
            }
            return Response.json({ premium: false });
        } catch {
            // Table may not exist yet (no purchases) — treat as no premium.
            return Response.json({ premium: false });
        }
    }

    return Response.json({ error: 'session_id or email required' }, { status: 400 });
}
