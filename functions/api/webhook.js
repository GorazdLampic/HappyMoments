/**
 * POST /api/webhook — Stripe webhook handler
 * Activates premium status after successful payment.
 * Requires: STRIPE_WEBHOOK_SECRET, DB bindings
 */

export async function onRequestPost(context) {
    const webhookSecret = context.env.STRIPE_WEBHOOK_SECRET;
    const stripeKey = context.env.STRIPE_SECRET_KEY;

    if (!webhookSecret || !stripeKey) {
        return new Response('Webhook not configured', { status: 503 });
    }

    const signature = context.request.headers.get('stripe-signature');
    const rawBody = await context.request.text();

    // Verify webhook signature
    const isValid = await verifyStripeSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
        return new Response('Invalid signature', { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const uid = session.metadata?.uid;

        if (uid && context.env.DB) {
            // Set premium for 1 year from now
            const premiumUntil = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);

            await context.env.DB.prepare(`
                UPDATE users SET
                    premium_until = ?,
                    stripe_customer_id = ?,
                    updated_at = ?
                WHERE uid = ?
            `).bind(
                premiumUntil,
                session.customer || null,
                Math.floor(Date.now() / 1000),
                uid
            ).run();
        }

        // Gift order paid → confirm the Printful draft so it enters fulfilment
        // and actually ships. Without this a paid gift would sit as an unshipped draft.
        if (session.metadata?.type === 'gift') {
            const pfId = session.metadata?.printful_order_id;
            const token = context.env.PRINTFUL_API_TOKEN;
            if (token && pfId && /^\d+$/.test(String(pfId))) {
                try {
                    await fetch(`https://api.printful.com/orders/${pfId}/confirm`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } catch (e) {
                    // Leave the draft unconfirmed; it can be confirmed manually in Printful.
                }
            }
        }
    }

    if (event.type === 'customer.subscription.deleted') {
        // Subscription cancelled — revoke premium
        const subscription = event.data.object;
        const customerId = subscription.customer;

        if (customerId && context.env.DB) {
            await context.env.DB.prepare(
                'UPDATE users SET premium_until = NULL, updated_at = ? WHERE stripe_customer_id = ?'
            ).bind(Math.floor(Date.now() / 1000), customerId).run();
        }
    }

    return Response.json({ received: true });
}

/**
 * Verify Stripe webhook signature using Web Crypto API (Works in Cloudflare Workers)
 */
async function verifyStripeSignature(payload, sigHeader, secret) {
    if (!sigHeader) return false;

    try {
        const parts = {};
        sigHeader.split(',').forEach(item => {
            const [key, value] = item.split('=');
            parts[key.trim()] = value.trim();
        });

        const timestamp = parts['t'];
        const signature = parts['v1'];
        if (!timestamp || !signature) return false;

        // Check timestamp is within 5 minutes
        const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
        if (Math.abs(age) > 300) return false;

        // Compute expected signature
        const signedPayload = `${timestamp}.${payload}`;
        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
        const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

        return expected === signature;
    } catch {
        return false;
    }
}
