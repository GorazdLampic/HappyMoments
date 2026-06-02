/**
 * POST /api/gift-order — Create Printful order + Stripe checkout for personalized gifts
 *
 * Flow:
 * 1. Validate order details
 * 2. Create draft Printful order with a design mockup URL
 * 3. Create Stripe Checkout Session for payment
 * 4. Return checkout URL
 * 5. Printful order stays as draft until payment confirmed via webhook
 */

// Printful verified variant IDs
const PRINTFUL_VARIANTS = {
    mug:    { variant_id: 1320, name: 'White Glossy Mug 11oz' },
    poster: { variant_id: 3876, name: 'Enhanced Matte Poster 12×18"' },
    tshirt: { variant_id: 4012, name: 'Bella+Canvas 3001 White M' },
    tote:   { variant_id: 10458, name: 'Eco Tote Bag Oyster' },
    canvas: { variant_id: 19296, name: 'Canvas 10×10"' }
};

const TSHIRT_SIZES = { 'S': 4011, 'M': 4012, 'L': 4013, 'XL': 4014, '2XL': 4015 };

const GIFT_PRICES = {
    mug: 2200, poster: 2800, tshirt: 2800, tote: 2000, canvas: 3500
};

// Simple SVG design generator — returns a URL-encodable SVG string
function generateDesignSVG(value, unit, name, message, width, height) {
    const val = typeof value === 'number' ? value.toLocaleString('en-US') : String(value);
    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const fontSize = val.length > 7 ? Math.floor(height * 0.15) : Math.floor(height * 0.22);
    const unitSize = Math.floor(height * 0.06);
    const nameSize = Math.floor(height * 0.05);
    const brandSize = Math.floor(height * 0.03);

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#1a1a1a"/>
  <rect x="20" y="20" width="${width-40}" height="${height-40}" fill="none" stroke="#d4b876" stroke-width="1" opacity="0.3" rx="4"/>
  <text x="${width/2}" y="${height*0.35}" text-anchor="middle" font-family="Georgia,serif" font-size="${nameSize}" fill="#a0b8a0" font-style="italic">${esc(name)}</text>
  <text x="${width/2}" y="${height*0.55}" text-anchor="middle" font-family="Courier New,monospace" font-size="${fontSize}" fill="#d4b876" font-weight="300">${esc(val)}</text>
  <text x="${width/2}" y="${height*0.65}" text-anchor="middle" font-family="Georgia,serif" font-size="${unitSize}" fill="#e0e0e0" font-style="italic">${esc(unit)}</text>
  ${message ? `<text x="${width/2}" y="${height*0.78}" text-anchor="middle" font-family="Georgia,serif" font-size="${nameSize}" fill="#888888" font-style="italic">${esc(message)}</text>` : ''}
  <text x="${width/2}" y="${height*0.92}" text-anchor="middle" font-family="Georgia,serif" font-size="${brandSize}" fill="#888888">happymoments.app</text>
</svg>`;
}

// Design dimensions per product type
const DESIGN_SIZES = {
    mug:    { w: 2700, h: 1100 },
    poster: { w: 3600, h: 5400 },
    tshirt: { w: 4500, h: 5400 },
    tote:   { w: 3600, h: 3600 },
    canvas: { w: 3000, h: 3000 }
};

export async function onRequestPost(context) {
    const PRINTFUL_TOKEN = context.env.PRINTFUL_API_TOKEN;
    const STRIPE_KEY = context.env.STRIPE_SECRET_KEY;

    if (!STRIPE_KEY) {
        return Response.json({ error: 'Gift store coming soon' }, { status: 503 });
    }

    let body;
    try {
        body = await context.request.json();
    } catch {
        return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { productType, milestoneValue, milestoneUnit, milestoneName,
            personalMessage, customerEmail, shippingAddress, size } = body;

    if (!productType || !GIFT_PRICES[productType]) {
        return Response.json({ error: 'Invalid product type' }, { status: 400 });
    }
    if (!milestoneValue || !milestoneUnit) {
        return Response.json({ error: 'Milestone value and unit are required' }, { status: 400 });
    }
    if (!customerEmail || !customerEmail.includes('@')) {
        return Response.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.address1 ||
        !shippingAddress.city || !shippingAddress.country_code || !shippingAddress.zip) {
        return Response.json({ error: 'Complete shipping address is required' }, { status: 400 });
    }

    const variant = PRINTFUL_VARIANTS[productType];
    const priceInCents = GIFT_PRICES[productType];
    const orderId = `hm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Resolve t-shirt size
    let variantId = variant.variant_id;
    if (productType === 'tshirt' && size && TSHIRT_SIZES[size]) {
        variantId = TSHIRT_SIZES[size];
    }

    try {
        // Generate SVG design and convert to a data URI that Printful can use
        const dims = DESIGN_SIZES[productType];
        const svgString = generateDesignSVG(milestoneValue, milestoneUnit, milestoneName || '', personalMessage || '', dims.w, dims.h);

        // Create Printful order if token available
        let printfulOrderId = null;
        if (PRINTFUL_TOKEN) {
            try {
                // Upload SVG as file to Printful
                const fileResponse = await fetch('https://api.printful.com/files', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'default',
                        url: `data:image/svg+xml;base64,${btoa(svgString)}`,
                        filename: `hm-${productType}-${milestoneValue}.svg`
                    })
                });

                let fileUrl = null;
                if (fileResponse.ok) {
                    const fileResult = await fileResponse.json();
                    if (fileResult.code === 200 && fileResult.result) {
                        fileUrl = fileResult.result.url;
                    }
                }

                // Create draft order even if file upload failed (use placeholder)
                const orderBody = {
                    external_id: orderId,
                    recipient: {
                        name: shippingAddress.name,
                        email: customerEmail,
                        address1: shippingAddress.address1,
                        city: shippingAddress.city,
                        country_code: shippingAddress.country_code,
                        zip: shippingAddress.zip
                    },
                    items: [{
                        variant_id: variantId,
                        quantity: 1,
                        name: `HappyMoments ${variant.name} — ${milestoneValue} ${milestoneUnit}`,
                        retail_price: (priceInCents / 100).toFixed(2),
                        files: fileUrl ? [{ type: 'default', url: fileUrl }] : []
                    }]
                };

                const orderResponse = await fetch('https://api.printful.com/orders', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderBody)
                });

                if (orderResponse.ok) {
                    const orderResult = await orderResponse.json();
                    if (orderResult.code === 200) {
                        printfulOrderId = orderResult.result.id;
                    }
                }
            } catch (pfErr) {
                // Printful failed — continue with Stripe-only checkout
                console.error('Printful error (non-blocking):', pfErr.message);
            }
        }

        // Create Stripe Checkout Session
        const appUrl = context.env.APP_URL || 'https://happymoments.app';
        const description = `Personalized: ${milestoneValue} ${milestoneUnit}` +
            (milestoneName ? ` for ${milestoneName}` : '') +
            (personalMessage ? ` — "${personalMessage}"` : '') +
            (size ? ` (${size})` : '');

        const stripeParams = new URLSearchParams({
            'mode': 'payment',
            'line_items[0][price_data][currency]': 'eur',
            'line_items[0][price_data][unit_amount]': String(priceInCents),
            'line_items[0][price_data][product_data][name]': `HappyMoments ${variant.name}`,
            'line_items[0][price_data][product_data][description]': description,
            'line_items[0][quantity]': '1',
            'success_url': `${appUrl}/index.html?checkout=gift_success&order=${orderId}`,
            'cancel_url': `${appUrl}/index.html?checkout=gift_cancelled`,
            'customer_email': customerEmail,
            'metadata[type]': 'gift',
            'metadata[order_id]': orderId,
            'metadata[printful_order_id]': String(printfulOrderId || 'pending'),
            'metadata[product]': productType,
            'metadata[milestone]': `${milestoneValue} ${milestoneUnit}`,
            'metadata[recipient]': milestoneName || '',
            'metadata[shipping]': `${shippingAddress.name}, ${shippingAddress.address1}, ${shippingAddress.city}, ${shippingAddress.country_code} ${shippingAddress.zip}`
        });

        const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: stripeParams.toString()
        });

        const session = await stripeResponse.json();
        if (session.error) {
            return Response.json({ error: 'Payment setup failed', detail: session.error.message }, { status: 502 });
        }

        return Response.json({
            checkoutUrl: session.url,
            sessionId: session.id,
            orderId: orderId,
            printfulOrderId: printfulOrderId
        });

    } catch (err) {
        return Response.json({ error: 'Order failed', detail: err.message }, { status: 500 });
    }
}
