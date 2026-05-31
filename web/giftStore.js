/**
 * HappyMoments — Gift Store
 * Personalized gifts via Printful print-on-demand.
 * Each product features the customer's milestone number as the design.
 */

const GIFT_CATALOG = [
    {
        id: 'mug',
        name: 'Milestone Mug',
        description: 'White ceramic 11oz mug with your milestone number',
        price: 22.00,
        currency: 'EUR',
        icon: '&#9749;',
        printful_variant: 1320,
        printful_product: 19,
        tagline: '{value} {unit} — every morning',
        designType: 'mug',
        categories: ['birthday', 'round', 'repdigit', 'palindrome', 'generic']
    },
    {
        id: 'poster',
        name: 'Milestone Poster',
        description: 'Museum-quality 12x18" poster with your number',
        price: 28.00,
        currency: 'EUR',
        icon: '&#128444;',
        printful_variant: 2103,
        printful_product: 1,
        tagline: 'The art of {value}',
        designType: 'poster',
        categories: ['scientific', 'fibonacci', 'palindrome', 'power_of_2', 'generic']
    },
    {
        id: 'tshirt',
        name: 'Milestone Tee',
        description: 'Soft cotton t-shirt with your milestone number',
        price: 28.00,
        currency: 'EUR',
        icon: '&#128085;',
        printful_variant: 4012,
        printful_product: 71,
        tagline: 'Wearing {value} with pride',
        designType: 'tshirt',
        hasSize: true,
        categories: ['fibonacci', 'power_of_2', 'scientific', 'repdigit', 'generic']
    },
    {
        id: 'tote',
        name: 'Milestone Tote',
        description: 'Sturdy tote bag with your special number',
        price: 20.00,
        currency: 'EUR',
        icon: '&#128092;',
        printful_variant: 5765,
        printful_product: 83,
        tagline: 'Carry {value} everywhere',
        designType: 'tote',
        categories: ['birthday', 'round', 'generic']
    },
    {
        id: 'canvas',
        name: 'Milestone Canvas',
        description: 'Gallery-wrapped canvas print with your number',
        price: 35.00,
        currency: 'EUR',
        icon: '&#127912;',
        printful_variant: 3845,
        printful_product: 56,
        tagline: 'The masterpiece of {value}',
        designType: 'canvas',
        categories: ['sequential', 'round', 'scientific', 'generic']
    }
];

// Country list for shipping (most common first)
const SHIPPING_COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'AT', name: 'Austria' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'HR', name: 'Croatia' },
    { code: 'PL', name: 'Poland' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'SE', name: 'Sweden' },
    { code: 'DK', name: 'Denmark' },
    { code: 'NO', name: 'Norway' },
    { code: 'FI', name: 'Finland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'IE', name: 'Ireland' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: 'BR', name: 'Brazil' },
    { code: 'IN', name: 'India' },
    { code: 'MX', name: 'Mexico' }
];

function getGiftSuggestions(milestone, maxItems) {
    maxItems = maxItems || 4;
    if (!milestone) return [];

    const category = getGiftCategory(milestone);

    // Score products by category match
    const scored = GIFT_CATALOG.map(product => {
        let score = 0;
        if (product.categories.includes(category)) score += 10;
        if (product.categories.includes('generic')) score += 2;
        // Add some randomness for variety
        score += Math.random() * 3;
        return { product, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, maxItems).map(s => s.product);
}

function getGiftCategory(milestone) {
    if (milestone.isBirthday) return 'birthday';
    const typeMap = {
        'power_of_10': 'round', 'round': 'round',
        'repdigit': 'repdigit', 'palindrome': 'palindrome',
        'fibonacci': 'fibonacci', 'power_of_2': 'power_of_2',
        'scientific': 'scientific', 'sequential': 'sequential',
        'alternating': 'generic'
    };
    return typeMap[milestone.type] || 'generic';
}

function renderGiftSuggestions(milestone) {
    const section = document.getElementById('giftSection');
    const preview = document.getElementById('giftPreview');
    const products = document.getElementById('giftProducts');
    if (!section || !preview || !products) return;

    if (!milestone) {
        preview.innerHTML = '<p class="empty-text">Select a milestone to see gift options.</p>';
        products.innerHTML = '';
        return;
    }

    const _esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const val = milestone.value.toLocaleString();
    const unit = _esc(milestone.unitName || '');
    const name = _esc(milestone.eventName || '');

    const suggestions = getGiftSuggestions(milestone);

    preview.innerHTML = `<p class="gift-intro">Celebrate <strong>${val} ${unit}</strong> with a personalized gift for ${name}.</p>`;

    products.innerHTML = suggestions.map(p => {
        const tagline = p.tagline
            .replace(/\{value\}/g, val)
            .replace(/\{unit\}/g, unit)
            .replace(/\{name\}/g, name);

        return `
            <div class="gift-product-card" onclick="openGiftOrder('${p.id}', ${milestone.value}, '${milestone.unitName}', '${(milestone.eventName || '').replace(/'/g, "\\'")}')">
                <div class="gift-icon">${p.icon}</div>
                <div class="gift-info">
                    <div class="gift-name">${p.name}</div>
                    <div class="gift-tagline">${tagline}</div>
                    <div class="gift-price">${p.currency} ${p.price.toFixed(2)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Store current milestone context for the order flow
let _currentGiftMilestone = null;

function openGiftOrder(productId, value, unit, eventName) {
    const product = GIFT_CATALOG.find(p => p.id === productId);
    if (!product) return;

    // Track analytics
    if (typeof HM_ANALYTICS !== 'undefined') {
        HM_ANALYTICS.track('gift_order_started', { product: productId, value: value, unit: unit });
    }

    // Store milestone context
    _currentGiftMilestone = { value: value, unitName: unit, eventName: eventName || '' };

    const val = typeof value === 'number' ? value.toLocaleString() : value;
    const _esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    const countryOptions = SHIPPING_COUNTRIES.map(c =>
        `<option value="${c.code}"${c.code === 'US' ? ' selected' : ''}>${c.name}</option>`
    ).join('');

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'giftOrderModal';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `
        <div class="modal-content checkout-modal gift-order-modal">
            <h3>${product.icon} ${product.name}</h3>
            <p class="checkout-custom">${product.description}</p>

            <!-- Design Preview -->
            <div class="gift-design-preview" id="giftDesignPreview">
                <p class="gift-design-loading">Generating design preview...</p>
            </div>

            <div class="gift-order-form">
                <div class="gift-form-section">
                    <div class="gift-form-section-title">Customization</div>
                    <div class="form-group">
                        <label>Number on the gift</label>
                        <input type="text" id="giftNumber" value="${val} ${_esc(unit)}" readonly class="checkout-email-input" style="background: var(--bg-elevated);">
                    </div>
                    <div class="form-group">
                        <label>Name on the gift</label>
                        <input type="text" id="giftRecipient" value="${_esc(eventName || '')}" placeholder="Who is this for?" class="checkout-email-input">
                    </div>
                    <div class="form-group">
                        <label>Personal message (optional)</label>
                        <input type="text" id="giftMessage" placeholder="e.g. Happy 10,000 days!" maxlength="80" class="checkout-email-input">
                    </div>
                    ${product.hasSize ? `
                    <div class="form-group">
                        <label>Size</label>
                        <select id="giftSize" class="checkout-email-input">
                            <option value="S">Small</option>
                            <option value="M" selected>Medium</option>
                            <option value="L">Large</option>
                            <option value="XL">X-Large</option>
                            <option value="2XL">2X-Large</option>
                        </select>
                    </div>
                    ` : ''}
                </div>

                <div class="gift-form-section">
                    <div class="gift-form-section-title">Shipping Address</div>
                    <div class="form-group">
                        <label>Full name *</label>
                        <input type="text" id="shipName" placeholder="Full name" class="checkout-email-input" autocomplete="name" required>
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" id="shipEmail" placeholder="your@email.com" class="checkout-email-input" autocomplete="email" required>
                    </div>
                    <div class="form-group">
                        <label>Street address *</label>
                        <input type="text" id="shipAddress" placeholder="Street and number" class="checkout-email-input" autocomplete="address-line1" required>
                    </div>
                    <div class="form-group">
                        <label>City *</label>
                        <input type="text" id="shipCity" placeholder="City" class="checkout-email-input" autocomplete="address-level2" required>
                    </div>
                    <div class="form-row" style="gap: 8px;">
                        <div class="form-group" style="flex: 1;">
                            <label>ZIP / Postal code *</label>
                            <input type="text" id="shipZip" placeholder="ZIP" class="checkout-email-input" autocomplete="postal-code" required>
                        </div>
                        <div class="form-group" style="flex: 2;">
                            <label>Country *</label>
                            <select id="shipCountry" class="checkout-email-input" autocomplete="country" required>
                                ${countryOptions}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="checkout-price">EUR ${product.price.toFixed(2)}</div>
            <p class="gift-shipping-note">Shipping costs will be calculated at checkout.</p>

            <div id="giftOrderError" class="auth-error hidden"></div>

            <div class="modal-buttons">
                <button class="btn-primary" id="giftOrderBtn" onclick="submitGiftOrder('${productId}', ${value}, '${unit}')">
                    Proceed to Payment
                </button>
                <button class="btn-secondary" onclick="document.getElementById('giftOrderModal').remove()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Generate design preview asynchronously
    setTimeout(() => {
        renderGiftDesignPreview(product.designType, value, unit, eventName || '');
    }, 50);
}

function renderGiftDesignPreview(designType, value, unit, name) {
    const container = document.getElementById('giftDesignPreview');
    if (!container) return;

    if (typeof generateGiftDesign !== 'function') {
        container.innerHTML = '<p class="gift-design-loading">Design preview unavailable</p>';
        return;
    }

    try {
        const milestone = { value: value, unitName: unit, eventName: name };
        const message = '';
        const canvas = generateGiftDesign(milestone, designType, { theme: 'dark', message: message });

        // Scale down for preview
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.borderRadius = '6px';
        canvas.style.border = '1px solid var(--border)';

        container.innerHTML = '';
        container.appendChild(canvas);
    } catch (err) {
        console.error('Design preview error:', err);
        container.innerHTML = '<p class="gift-design-loading">Design preview unavailable</p>';
    }
}

async function submitGiftOrder(productId, value, unit) {
    const product = GIFT_CATALOG.find(p => p.id === productId);
    if (!product) return;

    const errorEl = document.getElementById('giftOrderError');
    const orderBtn = document.getElementById('giftOrderBtn');

    // Collect form values
    const recipientName = (document.getElementById('giftRecipient')?.value || '').trim();
    const personalMessage = (document.getElementById('giftMessage')?.value || '').trim();
    const sizeEl = document.getElementById('giftSize');
    const size = sizeEl ? sizeEl.value : null;

    const shipName = (document.getElementById('shipName')?.value || '').trim();
    const shipEmail = (document.getElementById('shipEmail')?.value || '').trim();
    const shipAddress = (document.getElementById('shipAddress')?.value || '').trim();
    const shipCity = (document.getElementById('shipCity')?.value || '').trim();
    const shipZip = (document.getElementById('shipZip')?.value || '').trim();
    const shipCountry = (document.getElementById('shipCountry')?.value || '').trim();

    // Validate
    function showError(msg) {
        if (errorEl) {
            errorEl.textContent = msg;
            errorEl.classList.remove('hidden');
        } else {
            if (typeof showToast === 'function') showToast(msg, 'error');
        }
    }

    if (!shipName) { showError('Please enter the recipient name for shipping.'); return; }
    if (!shipEmail || !shipEmail.includes('@')) { showError('Please enter a valid email address.'); return; }
    if (!shipAddress) { showError('Please enter a street address.'); return; }
    if (!shipCity) { showError('Please enter a city.'); return; }
    if (!shipZip) { showError('Please enter a ZIP/postal code.'); return; }
    if (!shipCountry) { showError('Please select a country.'); return; }

    // Disable button and show loading
    if (orderBtn) {
        orderBtn.disabled = true;
        orderBtn.textContent = 'Preparing your order...';
    }
    if (errorEl) errorEl.classList.add('hidden');

    try {
        // Generate the design image
        let designBase64 = '';
        if (typeof generateGiftDesignBase64 === 'function') {
            const milestone = {
                value: value,
                unitName: unit,
                eventName: recipientName || (_currentGiftMilestone ? _currentGiftMilestone.eventName : '')
            };
            designBase64 = generateGiftDesignBase64(milestone, product.designType, {
                theme: 'dark',
                message: personalMessage
            });
        }

        if (!designBase64) {
            showError('Failed to generate design image. Please try again.');
            if (orderBtn) { orderBtn.disabled = false; orderBtn.textContent = 'Proceed to Payment'; }
            return;
        }

        // Submit to backend
        const response = await fetch('/api/gift-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productType: product.id,
                milestoneValue: value,
                milestoneUnit: unit,
                milestoneName: recipientName || (_currentGiftMilestone ? _currentGiftMilestone.eventName : ''),
                personalMessage: personalMessage,
                customerEmail: shipEmail,
                shippingAddress: {
                    name: shipName,
                    address1: shipAddress,
                    city: shipCity,
                    country_code: shipCountry,
                    zip: shipZip
                },
                size: size,
                designImageBase64: designBase64
            })
        });

        const result = await response.json();

        if (!response.ok) {
            // Handle "coming soon" gracefully
            if (response.status === 503) {
                showOrderComingSoon(product, value, unit, shipEmail);
                return;
            }
            throw new Error(result.error || 'Order failed');
        }

        // Track analytics
        if (typeof HM_ANALYTICS !== 'undefined') {
            HM_ANALYTICS.track('gift_order_completed', {
                product: productId,
                value: value,
                unit: unit,
                orderId: result.orderId
            });
        }

        // Redirect to Stripe checkout
        if (result.checkoutUrl) {
            window.location.href = result.checkoutUrl;
        } else {
            showError('Payment session could not be created. Please try again.');
            if (orderBtn) { orderBtn.disabled = false; orderBtn.textContent = 'Proceed to Payment'; }
        }

    } catch (err) {
        console.error('Gift order error:', err);
        showError(err.message || 'Something went wrong. Please try again.');
        if (orderBtn) { orderBtn.disabled = false; orderBtn.textContent = 'Proceed to Payment'; }
    }
}

/**
 * Show a "coming soon" fallback when the backend is not yet configured.
 * Collects the email for notification.
 */
function showOrderComingSoon(product, value, unit, email) {
    const modal = document.getElementById('giftOrderModal');
    if (modal) modal.remove();

    const comingSoonModal = document.createElement('div');
    comingSoonModal.className = 'modal';
    comingSoonModal.id = 'giftComingSoonModal';
    comingSoonModal.onclick = (e) => { if (e.target === comingSoonModal) comingSoonModal.remove(); };
    comingSoonModal.innerHTML = `
        <div class="modal-content checkout-modal">
            <h3>${product.icon} ${product.name}</h3>
            <div class="checkout-notice">
                <p>The gift store is launching soon! We'll notify you when personalized ${product.name.toLowerCase()} ordering becomes available.</p>
                <div class="form-group" style="margin-top: 8px;">
                    <input type="email" id="comingSoonEmail" value="${email || ''}" placeholder="your@email.com" class="checkout-email-input">
                </div>
            </div>
            <div class="modal-buttons">
                <button class="btn-primary" onclick="handleGiftNotifyMe()">Notify Me</button>
                <button class="btn-secondary" onclick="document.getElementById('giftComingSoonModal').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(comingSoonModal);
}

function handleGiftNotifyMe() {
    const emailEl = document.getElementById('comingSoonEmail');
    if (emailEl && emailEl.value && emailEl.value.includes('@')) {
        if (typeof HM_ANALYTICS !== 'undefined') {
            HM_ANALYTICS.track('gift_notify_signup', { email_hash: emailEl.value.length });
        }
        if (typeof showToast === 'function') {
            showToast('Thanks! We\'ll let you know when the store launches.', 'success');
        }
        const modal = document.getElementById('giftComingSoonModal');
        if (modal) modal.remove();
    } else {
        if (typeof showToast === 'function') {
            showToast('Please enter a valid email address.', 'error');
        }
    }
}

// Generate an inline gift banner for insertion between milestones
function generateGiftBanner(milestone) {
    if (!milestone) return '';
    const suggestions = getGiftSuggestions(milestone, 1);
    if (suggestions.length === 0) return '';

    const p = suggestions[0];
    const val = milestone.value.toLocaleString();
    const unit = milestone.unitName || '';
    const name = milestone.eventName || 'someone special';
    const tagline = p.tagline
        .replace(/\{value\}/g, val)
        .replace(/\{unit\}/g, unit)
        .replace(/\{name\}/g, name);

    const escapedName = (milestone.eventName || '').replace(/'/g, "\\'");

    return `
        <div class="gift-banner" onclick="openGiftOrder('${p.id}', ${milestone.value}, '${milestone.unitName}', '${escapedName}')">
            <span class="gift-banner-icon">${p.icon}</span>
            <div class="gift-banner-text">
                <span class="gift-banner-tagline">${tagline}</span>
                <span class="gift-banner-cta">${p.name} &middot; EUR ${p.price.toFixed(2)} &rarr;</span>
            </div>
        </div>
    `;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GIFT_CATALOG, getGiftSuggestions, renderGiftSuggestions, generateGiftBanner };
}
