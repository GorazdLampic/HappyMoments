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

    const { type, uid, email, returnOrigin, amount } = body;

    if (type !== 'premium' && type !== 'donation') {
        return Response.json({ error: 'Invalid product type' }, { status: 400 });
    }

    const appUrl = context.env.APP_URL || 'https://nicenumbers.app';
    const returnBase = resolveReturnBase(returnOrigin, appUrl);

    try {
        let params;
        if (type === 'premium') {
            // Yearly subscription. Card only (keeps card wallets, drops Link etc.).
            params = new URLSearchParams({
                'mode': 'subscription',
                'payment_method_types[0]': 'card',
                'line_items[0][price_data][currency]': 'eur',
                'line_items[0][price_data][unit_amount]': '149',
                'line_items[0][price_data][recurring][interval]': 'year',
                'line_items[0][price_data][product_data][name]': 'Nice Numbers Premium',
                // No "Billed annually." — Stripe already shows it for a yearly price.
                'line_items[0][price_data][product_data][description]': 'Watermark-free share cards and exclusive card designs.',
                'line_items[0][quantity]': '1',
                'success_url': `${returnBase}/index.html?checkout=premium_success&session_id={CHECKOUT_SESSION_ID}`,
                'cancel_url': `${returnBase}/index.html?checkout=premium_cancelled`,
                'metadata[uid]': uid || '',
                'metadata[type]': 'premium',
                'allow_promotion_codes': 'true'
            });
        } else {
            // One-time "Support the developers" tip — mode=payment (NOT recurring).
            const cents = parseInt(amount, 10);
            if (!(cents >= 200 && cents <= 50000)) {
                return Response.json({ error: 'Invalid amount' }, { status: 400 });
            }
            params = new URLSearchParams({
                'mode': 'payment',
                'payment_method_types[0]': 'card',
                'line_items[0][price_data][currency]': 'eur',
                'line_items[0][price_data][unit_amount]': String(cents),
                'line_items[0][price_data][product_data][name]': 'Support Nice Numbers',
                'line_items[0][price_data][product_data][description]': 'A one-time thank-you to the developers.',
                'line_items[0][quantity]': '1',
                'success_url': `${returnBase}/index.html?checkout=support_success`,
                'cancel_url': `${returnBase}/index.html?checkout=support_cancelled`,
                'metadata[type]': 'donation'
            });
        }

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
