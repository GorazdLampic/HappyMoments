/**
 * POST /api/create-checkout-session — Create Stripe Checkout for premium subscription
 * Requires: STRIPE_SECRET_KEY in environment
 */

// Only return the buyer to an origin we own — on native this is https://localhost
// (so Stripe redirects back INTO the app), on web it's the site they came from.
function resolveReturnBase(origin, appUrl) {
    const allowed = [
        'https://nicenumbers.app', 'https://www.nicenumbers.app',
        'https://happymoments.app', 'https://www.happymoments.app',
        'https://localhost'
    ];
    if (typeof origin === 'string' &&
        (allowed.includes(origin) || /^https:\/\/[a-z0-9-]+\.happymoments\.pages\.dev$/.test(origin))) {
        return origin;
    }
    return appUrl;
}

export async function onRequestPost(context) {
    const STRIPE_KEY = context.env.STRIPE_SECRET_KEY;
    if (!STRIPE_KEY) {
        return Response.json({ error: 'Payments not configured' }, { status: 503 });
    }

    let body;
    try {
        body = await context.request.json();
    } catch {
        return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { type, uid, email, returnOrigin } = body;

    // For now, only premium subscription
    if (type !== 'premium') {
        return Response.json({ error: 'Invalid product type' }, { status: 400 });
    }

    const appUrl = context.env.APP_URL || 'https://nicenumbers.app';
    const returnBase = resolveReturnBase(returnOrigin, appUrl);

    try {
        // Create Stripe Checkout Session via REST API (no SDK needed in Workers)
        const params = new URLSearchParams({
            'mode': 'subscription',
            // Card only — keeps Apple/Google Pay (card wallets) but drops Link and
            // other methods that confused testers on the checkout page.
            'payment_method_types[0]': 'card',
            'line_items[0][price_data][currency]': 'eur',
            'line_items[0][price_data][unit_amount]': '149',
            'line_items[0][price_data][recurring][interval]': 'year',
            'line_items[0][price_data][product_data][name]': 'Nice Numbers Premium',
            // No "Billed annually." here — Stripe already shows that for a yearly
            // recurring price, so repeating it made it appear twice.
            'line_items[0][price_data][product_data][description]': 'Watermark-free share cards and exclusive card designs.',
            'line_items[0][quantity]': '1',
            'success_url': `${returnBase}/index.html?checkout=premium_success&session_id={CHECKOUT_SESSION_ID}`,
            'cancel_url': `${returnBase}/index.html?checkout=premium_cancelled`,
            'metadata[uid]': uid || '',
            'metadata[type]': 'premium',
            'allow_promotion_codes': 'true'
        });

        if (email) {
            params.set('customer_email', email);
        }

        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        const session = await response.json();

        if (session.error) {
            return Response.json({ error: session.error.message }, { status: 400 });
        }

        return Response.json({ url: session.url, id: session.id });
    } catch (err) {
        return Response.json({ error: 'Failed to create checkout' }, { status: 500 });
    }
}
