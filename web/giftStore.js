/**
 * HappyMoments — Gift Store
 * Personalized gifts via Printful print-on-demand.
 * Each product features the customer's milestone number as the design.
 */

// ============================================================
// GIFT COLLECTIONS — curated product bundles by milestone personality
// ============================================================

const GIFT_COLLECTIONS = {
    'Number Nerd': {
        tagline: 'For minds that love the math behind the moment',
        products: ['poster', 'canvas'],
        icon: '&#129504;'  // brain emoji
    },
    'Celebrator': {
        tagline: 'Toast to life\'s perfectly round moments',
        products: ['mug', 'tshirt'],
        icon: '&#127881;'  // party popper
    },
    'Romantic': {
        tagline: 'Love written in numbers',
        products: ['canvas', 'poster'],
        icon: '&#10084;'   // heart
    },
    'Family': {
        tagline: 'Numbers that bring everyone together',
        products: ['tote', 'mug'],
        icon: '&#128106;'  // family
    },
    'Achiever': {
        tagline: 'Epic milestones deserve epic keepsakes',
        products: ['tshirt', 'poster'],
        icon: '&#127942;'  // trophy
    },
    'Lucky': {
        tagline: 'Prosperity, fortune, and auspicious vibes',
        products: ['mug', 'canvas'],
        icon: '&#127882;'  // red gift
    },
    'Minimalist': {
        tagline: 'Elegant numbers, clean design',
        products: ['poster'],
        icon: '&#9674;'    // diamond
    },
    'Adventurer': {
        tagline: 'For those who see patterns everywhere',
        products: ['tote', 'tshirt'],
        icon: '&#127757;'  // globe
    }
};

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

    const collection = getGiftCollection(milestone);
    const collectionDef = GIFT_COLLECTIONS[collection.name];
    const collectionProductIds = collectionDef ? collectionDef.products : [];

    // Score products: collection products first, then category match, then generic
    const category = getGiftCategory(milestone);
    const scored = GIFT_CATALOG.map(product => {
        let score = 0;
        // Collection match is the strongest signal
        if (collectionProductIds.includes(product.id)) score += 20;
        // Category match from the original system still contributes
        if (product.categories.includes(category)) score += 10;
        if (product.categories.includes('generic')) score += 2;
        // Add slight randomness for variety among equally scored items
        score += Math.random() * 1.5;
        return { product, score, collection: collection.name };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, maxItems).map(s => {
        // Attach collection context to each returned product
        const p = Object.assign({}, s.product);
        p._collectionName = s.collection;
        return p;
    });
}

/**
 * Determine the gift collection for a milestone based on its characteristics.
 * Returns { name: string, reason: string }.
 */
function getGiftCollection(milestone) {
    if (!milestone) return { name: 'Celebrator', reason: 'Default collection' };

    const type = milestone.type || '';
    const value = milestone.value || 0;
    const eventId = milestone.eventId || '';
    const description = (milestone.description || '').toLowerCase();
    const isCombined = eventId === 'combined_sum' || eventId === 'combined_ratio' ||
                       eventId === 'combined_duration' || eventId === 'combined';

    // --- Romantic: couple/love milestones ---
    // 520 = "I love you", 1314 = "forever", 5201314 = "I love you forever"
    const romanticValues = [520, 521, 1314, 1688, 5201314];
    if (romanticValues.includes(value)) {
        return { name: 'Romantic', reason: 'Love number (' + value + ')' };
    }
    // Combined ratio milestones (age ratios) are inherently relational
    if (eventId === 'combined_ratio') {
        return { name: 'Romantic', reason: 'Relationship ratio milestone' };
    }

    // --- Achiever: big milestones ---
    if (milestone.isBigMilestone) {
        return { name: 'Achiever', reason: 'Big milestone' };
    }
    // Billion seconds (value >= 1,000,000,000 in seconds)
    if (value >= 1000000000 && (milestone.unitName === 'sec' || milestone.unit === 'seconds')) {
        return { name: 'Achiever', reason: 'Billion seconds milestone' };
    }
    // 10K+ days
    if (value >= 10000 && (milestone.unitName === 'd' || milestone.unit === 'days')) {
        return { name: 'Achiever', reason: value.toLocaleString() + ' days milestone' };
    }

    // --- Family: team/combined sum milestones ---
    if (eventId === 'combined_sum' || eventId === 'combined_duration' || eventId === 'combined') {
        return { name: 'Family', reason: 'Combined milestone' };
    }

    // --- Lucky: Asian auspicious numbers ---
    if (type === 'asian_lucky') {
        return { name: 'Lucky', reason: 'Auspicious number' };
    }
    const luckyValues = [88, 99, 168, 188, 288, 388, 888, 999, 1088, 1188,
                         1888, 2888, 3888, 6666, 8888, 9999, 88888, 99999];
    if (luckyValues.includes(value)) {
        return { name: 'Lucky', reason: 'Lucky number (' + value + ')' };
    }

    // --- Number Nerd: scientific/fibonacci/power milestones ---
    if (type === 'fibonacci') {
        return { name: 'Number Nerd', reason: 'Fibonacci number' };
    }
    if (type === 'power_of_2') {
        return { name: 'Number Nerd', reason: 'Power of 2' };
    }
    if (type === 'scientific') {
        return { name: 'Number Nerd', reason: 'Scientific constant' };
    }

    // --- Minimalist: palindromes ---
    if (type === 'palindrome') {
        return { name: 'Minimalist', reason: 'Palindrome number' };
    }

    // --- Adventurer: sequential/alternating patterns ---
    if (type === 'sequential') {
        return { name: 'Adventurer', reason: 'Sequential pattern' };
    }
    if (type === 'alternating') {
        return { name: 'Adventurer', reason: 'Alternating pattern' };
    }

    // --- Celebrator: birthdays and round numbers ---
    if (milestone.isBirthday) {
        return { name: 'Celebrator', reason: 'Birthday milestone' };
    }
    if (type === 'round' || type === 'power_of_10') {
        return { name: 'Celebrator', reason: 'Round number milestone' };
    }
    if (type === 'repdigit') {
        return { name: 'Celebrator', reason: 'Repeating digit milestone' };
    }

    // --- Default ---
    return { name: 'Celebrator', reason: 'General milestone' };
}

function getGiftCategory(milestone) {
    if (milestone.isBirthday) return 'birthday';
    const typeMap = {
        'power_of_10': 'round', 'round': 'round',
        'repdigit': 'repdigit', 'palindrome': 'palindrome',
        'fibonacci': 'fibonacci', 'power_of_2': 'power_of_2',
        'scientific': 'scientific', 'sequential': 'sequential',
        'alternating': 'generic', 'asian_lucky': 'generic'
    };
    return typeMap[milestone.type] || 'generic';
}

function renderGiftSuggestions(milestone) {
    const section = document.getElementById('giftSection');
    const preview = document.getElementById('giftPreview');
    const products = document.getElementById('giftProducts');
    if (!section || !preview || !products) return;

    if (!milestone) {
        section.style.display = 'none';
        return;
    }

    // Show gifts for any moderately special milestone
    const isSpecialEnough = milestone.isBirthday
        || milestone.isBigMilestone
        || (typeof isVerySpecialNumber === 'function' && isVerySpecialNumber(milestone.value))
        || (milestone.value >= 1000 && milestone.value % 1000 === 0)
        || (milestone.type && milestone.type !== 'special');
    if (!isSpecialEnough) {
        section.style.display = 'none';
        return;
    }
    section.style.display = '';

    const _esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const val = milestone.value.toLocaleString();
    const unit = _esc(milestone.unitName || '');
    const name = _esc(milestone.eventName || '');

    const suggestions = getGiftSuggestions(milestone);
    const collection = getGiftCollection(milestone);
    const collectionDef = GIFT_COLLECTIONS[collection.name];
    const collectionTagline = collectionDef ? collectionDef.tagline : '';
    const collectionIcon = collectionDef ? collectionDef.icon : '';

    preview.innerHTML = `
        <p class="gift-intro">Celebrate <strong>${val} ${unit}</strong> with a personalized gift for ${name}.</p>
        ${collectionDef ? `<p class="gift-collection-label">${collectionIcon} <strong>The ${_esc(collection.name)}</strong> &mdash; ${_esc(collectionTagline)}</p>` : ''}
    `;

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
        // Submit to backend (Stripe checkout, Printful fulfilled separately)
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
                size: size
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

    // Show collection context in the CTA line
    const collection = getGiftCollection(milestone);
    const collectionDef = GIFT_COLLECTIONS[collection.name];
    const collectionLabel = collectionDef
        ? `The ${collection.name} collection &mdash; `
        : '';

    return `
        <div class="gift-banner" onclick="openGiftOrder('${p.id}', ${milestone.value}, '${milestone.unitName}', '${escapedName}')">
            <span class="gift-banner-icon">${p.icon}</span>
            <div class="gift-banner-text">
                <span class="gift-banner-tagline">${tagline}</span>
                <span class="gift-banner-cta">${collectionLabel}${p.name} &middot; EUR ${p.price.toFixed(2)} &rarr;</span>
            </div>
        </div>
    `;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GIFT_CATALOG, GIFT_COLLECTIONS, getGiftSuggestions, getGiftCollection, getGiftCategory, renderGiftSuggestions, generateGiftBanner };
}
