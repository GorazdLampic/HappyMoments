#!/usr/bin/env node
/**
 * HappyMoments — Checkout Server
 * Express server for creating Stripe Checkout Sessions.
 *
 * SETUP:
 * 1. npm install express stripe cors
 * 2. Set environment variable: STRIPE_SECRET_KEY=sk_test_...
 * 3. node checkout-server.js
 *
 * PRODUCTION:
 * - Deploy to Cloudflare Workers, Vercel, or any Node.js host
 * - Use Stripe webhooks to handle order fulfillment
 * - Connect to fulfillment partner API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Stripe setup
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER';
const stripe = require('stripe')(STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// Serve static files from dist/ (production) or web/ (development)
const staticDir = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, 'dist')
    : path.join(__dirname, 'web');
app.use(express.static(staticDir));

// Product configuration — maps product IDs to Stripe Price IDs
// In production, create these prices in your Stripe Dashboard
const PRODUCTS = {
    wine:      { name: 'Milestone Wine', price: 3500 },
    mug:       { name: 'Number Mug', price: 1800 },
    poster:    { name: 'Milestone Poster', price: 2500 },
    chocolate: { name: 'Number Chocolates', price: 2200 },
    tshirt:    { name: 'Milestone Tee', price: 2600 },
    candle:    { name: 'Numbered Candle', price: 2000 },
    notebook:  { name: 'Milestone Journal', price: 2500 },
    keychain:  { name: 'Number Keychain', price: 1400 },
    puzzle:    { name: 'Milestone Puzzle', price: 3000 },
    bottle:    { name: 'Engraved Water Bottle', price: 2400 },
};

// Create Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { productId, customization, quantity, successUrl, cancelUrl } = req.body;

        const product = PRODUCTS[productId];
        if (!product) {
            return res.status(400).json({ error: 'Invalid product' });
        }

        // Build product description with customization
        let description = product.name;
        if (customization) {
            const parts = [];
            if (customization.number) parts.push(`Number: ${customization.number}`);
            if (customization.unit) parts.push(`Unit: ${customization.unit}`);
            if (customization.recipientName) parts.push(`For: ${customization.recipientName}`);
            if (customization.message) parts.push(`Message: ${customization.message}`);
            if (parts.length > 0) description += ' — ' + parts.join(', ');
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: product.name,
                        description: description,
                        metadata: {
                            product_id: productId,
                            customization: JSON.stringify(customization || {}),
                        }
                    },
                    unit_amount: product.price,
                },
                quantity: quantity || 1,
            }],
            mode: 'payment',
            success_url: successUrl || `${req.headers.origin}/index.html?checkout=success`,
            cancel_url: cancelUrl || `${req.headers.origin}/index.html?checkout=cancelled`,
            shipping_address_collection: {
                allowed_countries: [
                    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
                    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
                    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
                    'GB', 'US', 'CA', 'AU', 'NZ', 'CH', 'NO'
                ],
            },
            metadata: {
                product_id: productId,
                customization: JSON.stringify(customization || {}),
            }
        });

        res.json({ id: session.id, url: session.url });
    } catch (err) {
        console.error('Stripe session error:', err.message);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Stripe Webhook — handle completed orders
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.log('Webhook received (no secret configured, skipping verification)');
        res.json({ received: true });
        return;
    }

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            console.log('Order completed:', {
                sessionId: session.id,
                customerEmail: session.customer_details?.email,
                amount: session.amount_total,
                product: session.metadata?.product_id,
                customization: session.metadata?.customization,
                shipping: session.shipping_details,
            });

            // TODO: Send order to fulfillment partner API
            // TODO: Send confirmation email to customer
            // TODO: Update order database
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook error:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', stripe: STRIPE_SECRET_KEY !== 'sk_test_PLACEHOLDER' ? 'configured' : 'placeholder' });
});

app.listen(PORT, () => {
    console.log(`\nHappyMoments Server running on port ${PORT}`);
    console.log(`Stripe: ${STRIPE_SECRET_KEY.includes('PLACEHOLDER') ? 'PLACEHOLDER (demo mode)' : 'configured'}`);
    console.log(`Static: ${staticDir}\n`);
});
