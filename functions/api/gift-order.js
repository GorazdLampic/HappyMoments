/**
 * POST /api/gift-order — Create a Printful order + Stripe checkout for personalized gifts
 * Requires: PRINTFUL_API_TOKEN, STRIPE_SECRET_KEY in environment
 *
 * Flow:
 * 1. Receive order details (product, milestone, shipping address)
 * 2. Upload design image to Printful File Library
 * 3. Create a draft Printful order
 * 4. Create a Stripe Checkout Session for customer payment
 * 5. Return Stripe checkout URL (Printful order confirmed after payment via webhook)
 */

// Printful product variant mappings
const PRINTFUL_VARIANTS = {
    mug:    { variant_id: 1320, product_id: 19, name: 'White Mug 11oz' },
    poster: { variant_id: 2103, product_id: 1,  name: 'Poster 12x18' },
    tshirt: { variant_id: 4012, product_id: 71, name: 'Bella+Canvas 3001 Unisex' },
    tote:   { variant_id: 5765, product_id: 83, name: 'Tote Bag' },
    canvas: { variant_id: 3845, product_id: 56, name: 'Canvas 12x12' }
};

// T-shirt size variant offsets (from base variant 4012 = S)
const TSHIRT_SIZE_VARIANTS = {
    'S':  4012,
    'M':  4013,
    'L':  4014,
    'XL': 4015,
    '2XL': 4016
};

// Retail prices in EUR cents
const GIFT_PRICES = {
    mug:    2200,
    poster: 2800,
    tshirt: 2800,
    tote:   2000,
    canvas: 3500
};

export async function onRequestPost(context) {
    const PRINTFUL_TOKEN = context.env.PRINTFUL_API_TOKEN;
    const STRIPE_KEY = context.env.STRIPE_SECRET_KEY;

    // Gift store not yet fully configured — show coming soon
    // TODO: Verify Printful variant IDs against real catalog before enabling
    return Response.json({
        error: 'Gift store coming soon',
        message: 'The gift store is being set up. Leave your email to be notified when ordering becomes available.'
    }, { status: 503 });

    let body;
    try {
        body = await context.request.json();
    } catch {
        return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const {
        productType,
        milestoneValue,
        milestoneUnit,
        milestoneName,
        personalMessage,
        customerEmail,
        shippingAddress,
        size,
        designImageBase64
    } = body;

    // Validate required fields
    if (!productType || !PRINTFUL_VARIANTS[productType]) {
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
    if (!designImageBase64) {
        return Response.json({ error: 'Design image is required' }, { status: 400 });
    }

    const variant = PRINTFUL_VARIANTS[productType];
    const priceInCents = GIFT_PRICES[productType];

    // For t-shirts, resolve the size variant
    let resolvedVariantId = variant.variant_id;
    if (productType === 'tshirt' && size && TSHIRT_SIZE_VARIANTS[size]) {
        resolvedVariantId = TSHIRT_SIZE_VARIANTS[size];
    }

    try {
        // Step 1: Upload design image to Printful File Library
        const fileUploadResponse = await fetch('https://api.printful.com/files', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'default',
                url: designImageBase64.startsWith('data:')
                    ? designImageBase64
                    : `data:image/png;base64,${designImageBase64}`,
                filename: `happymoments-${productType}-${milestoneValue}-${Date.now()}.png`
            })
        });

        const fileResult = await fileUploadResponse.json();
        if (!fileUploadResponse.ok || fileResult.code !== 200) {
            console.error('Printful file upload failed:', JSON.stringify(fileResult));
            return Response.json({
                error: 'Failed to upload design to print provider',
                detail: fileResult.result || fileResult.error
            }, { status: 502 });
        }

        const fileUrl = fileResult.result.url;
        const fileId = fileResult.result.id;

        // Step 2: Create Printful order (draft, not confirmed — confirm after payment)
        const printfulOrder = {
            external_id: `hm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            recipient: {
                name: shippingAddress.name,
                email: customerEmail,
                address1: shippingAddress.address1,
                address2: shippingAddress.address2 || '',
                city: shippingAddress.city,
                state_code: shippingAddress.state_code || '',
                country_code: shippingAddress.country_code,
                zip: shippingAddress.zip
            },
            items: [
                {
                    variant_id: resolvedVariantId,
                    quantity: 1,
                    name: `HappyMoments ${variant.name} — ${milestoneValue} ${milestoneUnit}`,
                    retail_price: (priceInCents / 100).toFixed(2),
                    files: [
                        {
                            type: 'default',
                            id: fileId,
                            url: fileUrl
                        }
                    ]
                }
            ],
            retail_costs: {
                currency: 'EUR',
                subtotal: (priceInCents / 100).toFixed(2)
            }
        };

        const orderResponse = await fetch('https://api.printful.com/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(printfulOrder)
        });

        const orderResult = await orderResponse.json();
        if (!orderResponse.ok || orderResult.code !== 200) {
            console.error('Printful order creation failed:', JSON.stringify(orderResult));
            return Response.json({
                error: 'Failed to create order with print provider',
                detail: orderResult.result || orderResult.error
            }, { status: 502 });
        }

        const printfulOrderId = orderResult.result.id;

        // Step 3: Create Stripe Checkout Session
        const appUrl = context.env.APP_URL || 'https://happymoments.app';

        const stripeParams = new URLSearchParams({
            'mode': 'payment',
            'line_items[0][price_data][currency]': 'eur',
            'line_items[0][price_data][unit_amount]': String(priceInCents),
            'line_items[0][price_data][product_data][name]': `HappyMoments ${variant.name}`,
            'line_items[0][price_data][product_data][description]':
                `Personalized with: ${milestoneValue} ${milestoneUnit}` +
                (milestoneName ? ` for ${milestoneName}` : ''),
            'line_items[0][quantity]': '1',
            'shipping_address_collection[allowed_countries][]': 'auto',
            'success_url': `${appUrl}/index.html?checkout=gift_success&order=${printfulOrderId}`,
            'cancel_url': `${appUrl}/index.html?checkout=gift_cancelled`,
            'customer_email': customerEmail,
            'metadata[type]': 'gift',
            'metadata[printful_order_id]': String(printfulOrderId),
            'metadata[product_type]': productType,
            'metadata[milestone_value]': String(milestoneValue),
            'metadata[milestone_unit]': milestoneUnit
        });

        const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: stripeParams.toString()
        });

        const stripeSession = await stripeResponse.json();
        if (stripeSession.error) {
            console.error('Stripe session creation failed:', JSON.stringify(stripeSession.error));
            return Response.json({
                error: 'Failed to create payment session',
                detail: stripeSession.error.message
            }, { status: 502 });
        }

        // Return the Stripe checkout URL to the client
        return Response.json({
            checkoutUrl: stripeSession.url,
            sessionId: stripeSession.id,
            printfulOrderId: printfulOrderId,
            orderId: printfulOrder.external_id
        });

    } catch (err) {
        console.error('Gift order error:', err.message, err.stack);
        return Response.json({
            error: 'An unexpected error occurred while processing your order',
            detail: err.message
        }, { status: 500 });
    }
}
