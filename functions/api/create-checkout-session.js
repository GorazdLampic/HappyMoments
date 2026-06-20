/**
 * POST /api/create-checkout-session — Create Stripe Checkout for premium subscription
 * Requires: STRIPE_SECRET_KEY in environment
 */

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

    const { type, uid, email } = body;

    // For now, only premium subscription
    if (type !== 'premium') {
        return Response.json({ error: 'Invalid product type' }, { status: 400 });
    }

    const appUrl = context.env.APP_URL || 'https://nicenumbers.app';

    try {
        // Create Stripe Checkout Session via REST API (no SDK needed in Workers)
        const params = new URLSearchParams({
            'mode': 'subscription',
            'line_items[0][price_data][currency]': 'eur',
            'line_items[0][price_data][unit_amount]': '149',
            'line_items[0][price_data][recurring][interval]': 'year',
            'line_items[0][price_data][product_data][name]': 'Nice Numbers Premium',
            'line_items[0][price_data][product_data][description]': 'Unlimited events, all milestone types, cloud sync. Billed annually.',
            'line_items[0][quantity]': '1',
            'success_url': `${appUrl}/index.html?checkout=premium_success`,
            'cancel_url': `${appUrl}/index.html?checkout=premium_cancelled`,
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
