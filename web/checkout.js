/**
 * HappyMoments — Checkout & Payment Integration
 * Uses Stripe Checkout for gift store payments.
 *
 * SETUP REQUIRED:
 * 1. Create a Stripe account at https://stripe.com
 * 2. Replace STRIPE_PUBLIC_KEY with your publishable key
 * 3. Deploy the server-side endpoint (see checkout-server.js)
 * 4. Update CHECKOUT_API_URL to your server URL
 */

const CHECKOUT_CONFIG = {
    // Replace with your Stripe publishable key
    STRIPE_PUBLIC_KEY: 'pk_test_PLACEHOLDER_replace_with_real_key',

    // Server endpoint that creates Stripe Checkout Sessions
    CHECKOUT_API_URL: '/api/create-checkout-session',

    // Currency
    CURRENCY: 'eur',

    // Success/cancel URLs (relative to app origin)
    SUCCESS_URL: '/index.html?checkout=success',
    CANCEL_URL: '/index.html?checkout=cancelled',
};

// Product price mapping (cents) — replace with Stripe Price IDs in production
const PRODUCT_PRICES = {
    wine:      { amount: 3500, stripe_price_id: 'price_PLACEHOLDER_wine' },
    mug:       { amount: 1800, stripe_price_id: 'price_PLACEHOLDER_mug' },
    poster:    { amount: 2500, stripe_price_id: 'price_PLACEHOLDER_poster' },
    chocolate: { amount: 2200, stripe_price_id: 'price_PLACEHOLDER_chocolate' },
    tshirt:    { amount: 2600, stripe_price_id: 'price_PLACEHOLDER_tshirt' },
    candle:    { amount: 2000, stripe_price_id: 'price_PLACEHOLDER_candle' },
    notebook:  { amount: 2500, stripe_price_id: 'price_PLACEHOLDER_notebook' },
    keychain:  { amount: 1400, stripe_price_id: 'price_PLACEHOLDER_keychain' },
    puzzle:    { amount: 3000, stripe_price_id: 'price_PLACEHOLDER_puzzle' },
    bottle:    { amount: 2400, stripe_price_id: 'price_PLACEHOLDER_bottle' },
};

// Load Stripe.js dynamically
let stripePromise = null;
function getStripe() {
    if (stripePromise) return stripePromise;
    stripePromise = new Promise((resolve, reject) => {
        if (window.Stripe) {
            resolve(window.Stripe(CHECKOUT_CONFIG.STRIPE_PUBLIC_KEY));
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.onload = () => resolve(window.Stripe(CHECKOUT_CONFIG.STRIPE_PUBLIC_KEY));
        script.onerror = () => reject(new Error('Failed to load Stripe.js'));
        document.head.appendChild(script);
    });
    return stripePromise;
}

// Create a checkout session and redirect
async function startCheckout(order) {
    const isLive = !CHECKOUT_CONFIG.STRIPE_PUBLIC_KEY.includes('PLACEHOLDER');

    if (!isLive) {
        // Demo mode: show order summary
        showOrderPreview(order);
        return;
    }

    try {
        showToast('Preparing checkout...', 'info');

        const response = await fetch(CHECKOUT_CONFIG.CHECKOUT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: order.productId,
                customization: order.customization,
                quantity: 1,
                successUrl: window.location.origin + CHECKOUT_CONFIG.SUCCESS_URL,
                cancelUrl: window.location.origin + CHECKOUT_CONFIG.CANCEL_URL,
            })
        });

        if (!response.ok) throw new Error('Checkout session creation failed');

        const session = await response.json();
        const stripe = await getStripe();
        const result = await stripe.redirectToCheckout({ sessionId: session.id });

        if (result.error) {
            showToast(result.error.message, 'error');
        }
    } catch (err) {
        showToast('Checkout unavailable. Please try again later.', 'error');
        console.error('Checkout error:', err);
    }
}

// Show order preview (demo mode or pre-checkout confirmation)
function showOrderPreview(order) {
    const product = GIFT_CATALOG.find(p => p.id === order.productId);
    if (!product) return;

    const _esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const price = PRODUCT_PRICES[order.productId];
    const formattedPrice = price ? (price.amount / 100).toFixed(2) : product.priceRange;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'checkoutModal';
    modal.innerHTML = `
        <div class="modal-content checkout-modal">
            <h3>Order Summary</h3>
            <div class="checkout-product">
                <span class="checkout-icon">${product.icon}</span>
                <div>
                    <strong>${product.name}</strong>
                    <p class="checkout-custom">Personalized with: "${_esc(order.customization.number)} ${_esc(order.customization.unit)}"</p>
                    ${order.customization.recipientName ? `<p class="checkout-custom">For: ${_esc(order.customization.recipientName)}</p>` : ''}
                    ${order.customization.message ? `<p class="checkout-custom">Message: "${_esc(order.customization.message)}"</p>` : ''}
                </div>
            </div>
            <div class="checkout-price">EUR ${formattedPrice}</div>
            <div class="checkout-notice">
                <p>The gift store is launching soon. Leave your email to be notified when ordering becomes available.</p>
                <div class="form-group" style="margin-top: 8px;">
                    <input type="email" id="notifyEmail" placeholder="your@email.com" class="checkout-email-input">
                </div>
            </div>
            <div class="modal-buttons">
                <button class="btn-primary" onclick="handleNotifyMe()">Notify Me</button>
                <button class="btn-secondary" onclick="closeCheckoutModal()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.remove();
}

function handleNotifyMe() {
    const email = document.getElementById('notifyEmail');
    if (email && email.value && email.value.includes('@')) {
        // In production, this would POST to a mailing list API
        showToast('Thanks! We\'ll let you know when the store launches.', 'success');
        closeCheckoutModal();
    } else {
        showToast('Please enter a valid email address.', 'error');
    }
}

// Check for checkout result on page load
function checkCheckoutResult() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
        showToast('Order placed successfully! You\'ll receive a confirmation email.', 'success', 5000);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('checkout') === 'cancelled') {
        showToast('Checkout cancelled.', 'info');
        window.history.replaceState({}, '', window.location.pathname);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CHECKOUT_CONFIG, PRODUCT_PRICES, startCheckout };
}
