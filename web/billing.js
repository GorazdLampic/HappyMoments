/*
 * billing.js — Google Play Billing for the native Android app.
 *
 * Play policy forbids selling in-app DIGITAL goods (premium) via Stripe, so on
 * Android the premium upgrade must go through Google Play Billing. Web keeps
 * Stripe (handled in app.js handleUpgrade()).
 *
 * Engine: cordova-plugin-purchase (Fovea) — exposes a global `CdvPurchase`,
 * so it works with this no-bundler, classic-<script> app (same style as the
 * Firebase-compat globals). Nothing here runs on the web build; every entry
 * point guards on native Android + presence of the CdvPurchase global.
 *
 * On successful ownership we write `happymoments_premium_until` (a unix-seconds
 * timestamp) — the SAME key isPremium()/renderPremiumUI() already use — so the
 * rest of the app needs no changes.
 *
 * STATUS: integration scaffold. Requires, before it can be tested:
 *   1. Play Console: a payments/merchant profile + an active subscription with
 *      product id === PREMIUM_PRODUCT_ID below.
 *   2. A build carrying this + the plugin (versionCode 102), installed by a
 *      Play "license tester" so the sandbox purchase is free.
 *   3. (hardening, v1.1) a receipt validator (iaptic/server) — see TODO below.
 */

var PREMIUM_PRODUCT_ID = 'premium_yearly';   // must match the Play Console product id
var PREMIUM_FALLBACK_DAYS = 366;             // used only if the receipt carries no expiry
var _billingInited = false;                  // guard: deviceready + DOMContentLoaded both fire

// One-time "Support the developers" tips — CONSUMABLE Play products (buyable
// repeatedly). IDs must match the in-app products created in Play Console.
var TIP_PRODUCT_IDS = ['tip_2', 'tip_5', 'tip_10', 'tip_50'];
var _pendingTip = null;

function billingIsNativeAndroid() {
    try {
        return typeof Capacitor !== 'undefined'
            && typeof Capacitor.getPlatform === 'function'
            && Capacitor.getPlatform() === 'android'
            && typeof CdvPurchase !== 'undefined';
    } catch (e) {
        return false;
    }
}

function _billingSetPremiumUntil(expirySeconds) {
    var until = expirySeconds && expirySeconds > 0
        ? expirySeconds
        : Math.floor(Date.now() / 1000) + PREMIUM_FALLBACK_DAYS * 24 * 60 * 60;
    localStorage.setItem('happymoments_premium_until', String(until));
    try { if (typeof renderPremiumUI === 'function') renderPremiumUI(); } catch (e) {}
    try { if (typeof _track === 'function') _track('payment_complete', { product: 'premium', via: 'play_billing' }); } catch (e) {}
}

// Read the live, localized, VAT-inclusive price Play will actually charge and
// expose it so the UI mirrors the purchase sheet exactly (no €1.49 vs €1.79
// mismatch). Play formats it per the store locale ("€1.79", "1,79 €", …).
function _billingCapturePrice() {
    try {
        var store = CdvPurchase.store;
        var product = store.get(PREMIUM_PRODUCT_ID, CdvPurchase.Platform.GOOGLE_PLAY);
        if (!product) return;
        var price = null;
        var offer = typeof product.getOffer === 'function' ? product.getOffer() : null;
        if (offer && offer.pricingPhases && offer.pricingPhases.length) {
            // Last phase = the ongoing recurring price (after any intro/trial).
            price = offer.pricingPhases[offer.pricingPhases.length - 1].price;
        }
        if (!price && product.pricing && product.pricing.price) price = product.pricing.price;
        if (price && price !== window.__hmPlayPrice) {
            window.__hmPlayPrice = price;
            if (typeof refreshPremiumPriceUI === 'function') refreshPremiumPriceUI();
        }
    } catch (e) {}
}

function _billingExpiryFromTransaction(t) {
    // cordova-plugin-purchase surfaces expiry on the verified transaction.
    try {
        var d = t && (t.expirationDate || (t.transaction && t.transaction.expirationDate));
        if (d) return Math.floor(new Date(d).getTime() / 1000);
    } catch (e) {}
    return 0;
}

function initBilling() {
    if (!billingIsNativeAndroid()) return;   // no-op on web
    if (_billingInited) return;              // run once even if both events fire
    _billingInited = true;
    try {
        var store = CdvPurchase.store;
        var Product = CdvPurchase.ProductType;
        var Platform = CdvPurchase.Platform;

        var _regs = [{
            id: PREMIUM_PRODUCT_ID,
            type: Product.PAID_SUBSCRIPTION,
            platform: Platform.GOOGLE_PLAY
        }];
        TIP_PRODUCT_IDS.forEach(function (tid) {
            _regs.push({ id: tid, type: Product.CONSUMABLE, platform: Platform.GOOGLE_PLAY });
        });
        store.register(_regs);

        store.when()
            // Once Play returns product metadata, mirror its real price in the UI.
            .productUpdated(function () { _billingCapturePrice(); })
            // TODO (v1.1 hardening): set store.validator to iaptic/our endpoint and
            // switch .approved to `t => t.verify()` + `.verified(r => r.finish())`.
            // For now we trust Play's native purchase and finish directly.
            .approved(function (t) { t.finish(); })
            .finished(function (t) {
                if (store.owned({ id: PREMIUM_PRODUCT_ID, platform: Platform.GOOGLE_PLAY })) {
                    _billingSetPremiumUntil(_billingExpiryFromTransaction(t));
                }
                // A one-time tip just completed → thank the buyer (consumables are
                // not "owned" after finishing, so track it via _pendingTip).
                if (_pendingTip) {
                    _pendingTip = null;
                    try { if (typeof _track === 'function') _track('payment_complete', { product: 'tip', via: 'play_billing' }); } catch (e) {}
                    try { if (typeof onTipComplete === 'function') onTipComplete(); } catch (e) {}
                }
            })
            .receiptUpdated(function () {
                if (store.owned({ id: PREMIUM_PRODUCT_ID, platform: Platform.GOOGLE_PLAY })) {
                    _billingSetPremiumUntil(0);
                }
            });

        var initDone = store.initialize([Platform.GOOGLE_PLAY]);
        if (initDone && typeof initDone.then === 'function') {
            initDone.then(function () { _billingCapturePrice(); }).catch(function () {});
        }
    } catch (e) {
        try { console.warn('initBilling failed', e); } catch (_) {}
    }
}

// Called by app.js handleUpgrade() on native Android instead of Stripe.
function startAndroidPurchase() {
    if (!billingIsNativeAndroid()) return;
    try {
        var store = CdvPurchase.store;
        var product = store.get(PREMIUM_PRODUCT_ID, CdvPurchase.Platform.GOOGLE_PLAY);
        var offer = product && product.getOffer();
        if (!offer) {
            if (typeof showToast === 'function') showToast('Store not ready — try again in a moment', 'info');
            return;
        }
        offer.order();
    } catch (e) {
        if (typeof showToast === 'function') showToast('Could not start purchase', 'info');
    }
}

// "Restore purchases" for reinstalls / new devices.
function restoreAndroidPurchases() {
    if (!billingIsNativeAndroid()) return;
    try { CdvPurchase.store.restorePurchases(); } catch (e) {}
}

// One-time tip: order a CONSUMABLE tip product (Play Billing). `productId` is one
// of TIP_PRODUCT_IDS. Consumables can be purchased repeatedly.
function startAndroidTip(productId) {
    if (!billingIsNativeAndroid()) return false;
    try {
        var store = CdvPurchase.store;
        var product = store.get(productId, CdvPurchase.Platform.GOOGLE_PLAY);
        var offer = product && product.getOffer();
        if (!offer) { if (typeof showToast === 'function') showToast('Store not ready — try again in a moment', 'info'); return false; }
        _pendingTip = productId;
        offer.order();
        return true;
    } catch (e) {
        if (typeof showToast === 'function') showToast('Could not start', 'info');
        return false;
    }
}

// Localized Play prices for the tip tiers, for the Support UI.
function getTipProducts() {
    var out = [];
    if (!billingIsNativeAndroid()) return out;
    try {
        var store = CdvPurchase.store;
        TIP_PRODUCT_IDS.forEach(function (id) {
            var p = store.get(id, CdvPurchase.Platform.GOOGLE_PLAY);
            var price = null;
            if (p) {
                var o = p.getOffer && p.getOffer();
                if (o && o.pricingPhases && o.pricingPhases.length) price = o.pricingPhases[0].price;
                if (!price && p.pricing && p.pricing.price) price = p.pricing.price;
            }
            out.push({ id: id, amount: parseInt(id.split('_')[1], 10), price: price });
        });
    } catch (e) {}
    return out;
}

if (typeof window !== 'undefined') {
    window.startAndroidTip = startAndroidTip;
    window.getTipProducts = getTipProducts;
}

// Initialize once the plugin + Capacitor are ready.
document.addEventListener('deviceready', initBilling, false);
document.addEventListener('DOMContentLoaded', function () {
    // Capacitor fires deviceready, but initialize defensively too.
    if (billingIsNativeAndroid()) setTimeout(initBilling, 0);
}, false);
