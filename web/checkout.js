/**
 * Nice Numbers — Checkout & Payment Integration
 * Uses Stripe Checkout for premium subscriptions and gift store payments.
 *
 * SETUP REQUIRED:
 * 1. Create a Stripe account at https://stripe.com
 * 2. Replace STRIPE_PUBLIC_KEY with your publishable key
 * 3. Set STRIPE_SECRET_KEY in Cloudflare Pages environment
 * 4. Set PRINTFUL_API_TOKEN in Cloudflare Pages environment for gifts
 */

const CHECKOUT_CONFIG = {
    // Stripe publishable key (safe to expose — public by design). Test mode.
    STRIPE_PUBLIC_KEY: 'pk_test_51TbbOPILb32Vl4arafYeCIybPl09IL95fCLnsZ6ZaG9mqNoOxlkQ14xXj0WlnpuFpRfBQKA5bQ1aAUiaR5sp1yU2004x2vHcba',

    // Server endpoint for premium subscription checkout
    CHECKOUT_API_URL: '/api/create-checkout-session',

    // Server endpoint for gift orders (Printful + Stripe)
    GIFT_ORDER_API_URL: '/api/gift-order',

    // Currency
    CURRENCY: 'eur',

    // Success/cancel URLs (relative to app origin)
    SUCCESS_URL: '/index.html?checkout=success',
    CANCEL_URL: '/index.html?checkout=cancelled',
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

// Create a checkout session and redirect (for premium subscription)
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

        // If backend returns a direct URL (gift-order style), redirect there
        if (session.url || session.checkoutUrl) {
            window.location.href = session.url || session.checkoutUrl;
            return;
        }

        // Otherwise use Stripe.js redirect
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
    const product = typeof GIFT_CATALOG !== 'undefined'
        ? GIFT_CATALOG.find(p => p.id === order.productId)
        : null;
    if (!product) return;

    const _esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const formattedPrice = product.price ? product.price.toFixed(2) : '—';

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
        if (typeof HM_ANALYTICS !== 'undefined') {
            HM_ANALYTICS.track('gift_notify_signup', { source: 'checkout_preview' });
        }
        showToast('Thanks! We\'ll let you know when the store launches.', 'success');
        closeCheckoutModal();
    } else {
        showToast('Please enter a valid email address.', 'error');
    }
}

// Check for checkout result on page load
function checkCheckoutResult() {
    const params = new URLSearchParams(window.location.search);
    const checkoutResult = params.get('checkout');

    if (checkoutResult === 'success' || checkoutResult === 'premium_success') {
        showToast('Order placed successfully! You\'ll receive a confirmation email.', 'success', 5000);
        window.history.replaceState({}, '', window.location.pathname);
    } else if (checkoutResult === 'gift_success') {
        const orderId = params.get('order');
        showToast('Gift order confirmed! You\'ll receive tracking information via email.', 'success', 6000);
        if (typeof HM_ANALYTICS !== 'undefined') {
            HM_ANALYTICS.track('gift_payment_success', { orderId: orderId || 'unknown' });
        }
        window.history.replaceState({}, '', window.location.pathname);
    } else if (checkoutResult === 'cancelled' || checkoutResult === 'premium_cancelled') {
        showToast('Checkout cancelled.', 'info');
        window.history.replaceState({}, '', window.location.pathname);
    } else if (checkoutResult === 'gift_cancelled') {
        showToast('Gift order cancelled. Your design is saved if you want to try again.', 'info');
        window.history.replaceState({}, '', window.location.pathname);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CHECKOUT_CONFIG, startCheckout, checkCheckoutResult };
}
