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
    STRIPE_PUBLIC_KEY: 'pk_live_51TbbOFEalepGaTT0MQwdLB4dgP7I5LE05EtCs3iH7qRGfip5ExlX5SQPBC9tJ0rrYz599BjMDzU3pNXCTLzSanXr00KkJYJZzO',

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

    // NOTE: premium_success / premium_cancelled are intentionally NOT handled here.
    // checkPremiumReturn() in app.js owns them — it needs the session_id in the URL
    // to verify the paid Stripe session and activate premium. Cleaning the URL here
    // would strip that before it runs.
    if (checkoutResult === 'gift_success') {
        const orderId = params.get('order');
        // Clean the URL first so a refresh doesn't re-trigger this.
        window.history.replaceState({}, '', window.location.pathname);
        if (typeof HM_ANALYTICS !== 'undefined') {
            HM_ANALYTICS.track('gift_payment_success', { orderId: orderId || 'unknown' });
        }
        recordGiftOrder(orderId);
        showGiftConfirmation(orderId);
    } else if (checkoutResult === 'gift_cancelled') {
        showToast('Gift order cancelled. Your design is saved if you want to try again.', 'info');
        window.history.replaceState({}, '', window.location.pathname);
    } else if (checkoutResult === 'support_success') {
        window.history.replaceState({}, '', window.location.pathname);
        if (typeof HM_ANALYTICS !== 'undefined') HM_ANALYTICS.track('support_payment_success', {});
        if (typeof showSupportThanks === 'function') showSupportThanks();
    } else if (checkoutResult === 'support_cancelled') {
        window.history.replaceState({}, '', window.location.pathname);
    }
}

// Keep a local record of placed gift orders so the user has an in-app trace of
// what they ordered (Printful emails the actual shipment tracking).
function recordGiftOrder(orderId) {
    if (!orderId) return;
    try {
        const key = 'nn_gift_orders';
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        if (!list.some(o => o.id === orderId)) {
            list.unshift({ id: orderId, at: new Date().toISOString() });
            localStorage.setItem(key, JSON.stringify(list.slice(0, 50)));
        }
    } catch (e) { /* storage unavailable — non-fatal */ }
}

function getGiftOrders() {
    try { return JSON.parse(localStorage.getItem('nn_gift_orders') || '[]'); }
    catch (e) { return []; }
}
if (typeof window !== 'undefined') window.getGiftOrders = getGiftOrders;

// Clear, persistent confirmation (replaces a fleeting toast) so the buyer knows
// the order went through and how tracking will reach them.
function showGiftConfirmation(orderId) {
    const T = (typeof tt === 'function') ? tt : (k => null);
    const existing = document.getElementById('giftConfirmModal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'giftConfirmModal';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    const ref = orderId ? orderId.replace(/^hm-/, '').toUpperCase() : '';
    modal.innerHTML = `<div class="modal-content" style="text-align:center;">
        <div style="font-size:3rem;line-height:1;margin-bottom:8px;">&#127881;</div>
        <h3>${T('gc_title') || 'Order confirmed!'}</h3>
        <p class="auth-subtitle" style="margin-bottom:16px;">
            ${T('gc_body') || 'Thank you! Your personalized gift is being made to order.'}
        </p>
        <div style="text-align:left;background:var(--bg-elevated,#f5f5f5);border-radius:10px;padding:14px 16px;margin-bottom:16px;font-size:0.92em;line-height:1.6;">
            ${ref ? `<div><strong>${T('gc_order_no') || 'Order'}:</strong> ${ref}</div>` : ''}
            <div>&#9993;&#65039; ${T('gc_receipt') || 'A receipt has been emailed to you.'}</div>
            <div>&#128230; ${T('gc_tracking') || 'Tracking will be emailed as soon as it ships (printing takes ~2–5 business days, then delivery).'}</div>
        </div>
        <button class="btn-primary" style="width:100%;" onclick="document.getElementById('giftConfirmModal').remove()">${T('gc_done') || 'Done'}</button>
    </div>`;
    document.body.appendChild(modal);
}
if (typeof window !== 'undefined') window.showGiftConfirmation = showGiftConfirmation;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CHECKOUT_CONFIG, startCheckout, checkCheckoutResult };
}
