/**
 * HappyMoments — Gift Store
 * Personalized gift suggestions based on milestone numbers
 */

const GIFT_CATALOG = [
    {
        id: 'wine',
        name: 'Milestone Wine',
        description: 'Premium wine with your milestone number on a custom label',
        priceRange: '25 - 45',
        currency: 'EUR',
        icon: '&#127863;',
        tagline: 'A toast to {value} {unit}',
        customizable: ['label_number', 'label_name', 'label_date'],
        categories: ['birthday', 'round', 'combined', 'generic']
    },
    {
        id: 'mug',
        name: 'Number Mug',
        description: 'Ceramic mug featuring your special number in elegant typography',
        priceRange: '15 - 22',
        currency: 'EUR',
        icon: '&#9749;',
        tagline: '{value} reasons to smile every morning',
        customizable: ['number', 'name', 'message'],
        categories: ['birthday', 'round', 'repdigit', 'palindrome', 'generic']
    },
    {
        id: 'poster',
        name: 'Milestone Poster',
        description: 'Framed art print with your number, its meaning, and a personal message',
        priceRange: '20 - 40',
        currency: 'EUR',
        icon: '&#128444;',
        tagline: 'The art of {value}',
        customizable: ['number', 'name', 'date', 'message', 'why'],
        categories: ['scientific', 'fibonacci', 'palindrome', 'power_of_2', 'generic']
    },
    {
        id: 'chocolate',
        name: 'Number Chocolates',
        description: 'Handcrafted chocolate box with your milestone number molded in cocoa',
        priceRange: '18 - 35',
        currency: 'EUR',
        icon: '&#127851;',
        tagline: 'Sweet as {value}',
        customizable: ['number', 'message'],
        categories: ['birthday', 'round', 'generic']
    },
    {
        id: 'tshirt',
        name: 'Milestone Tee',
        description: 'Soft cotton t-shirt with your number and a witty mathematical caption',
        priceRange: '22 - 30',
        currency: 'EUR',
        icon: '&#128085;',
        tagline: 'Wearing {value} with pride',
        customizable: ['number', 'name', 'size'],
        categories: ['fibonacci', 'power_of_2', 'scientific', 'repdigit', 'generic']
    },
    {
        id: 'candle',
        name: 'Numbered Candle',
        description: 'Hand-poured soy candle with milestone number etched into the glass',
        priceRange: '16 - 28',
        currency: 'EUR',
        icon: '&#128367;',
        tagline: 'Let {value} glow',
        customizable: ['number', 'scent'],
        categories: ['birthday', 'round', 'generic']
    },
    {
        id: 'notebook',
        name: 'Milestone Journal',
        description: 'Leather-bound notebook with your number debossed on the cover',
        priceRange: '20 - 35',
        currency: 'EUR',
        icon: '&#128214;',
        tagline: 'Chapter {value}',
        customizable: ['number', 'name'],
        categories: ['sequential', 'round', 'generic']
    },
    {
        id: 'keychain',
        name: 'Number Keychain',
        description: 'Stainless steel keychain laser-engraved with your milestone number',
        priceRange: '10 - 18',
        currency: 'EUR',
        icon: '&#128273;',
        tagline: '{value} — always with you',
        customizable: ['number', 'date'],
        categories: ['birthday', 'round', 'palindrome', 'generic']
    },
    {
        id: 'puzzle',
        name: 'Milestone Puzzle',
        description: 'Custom 500-piece puzzle featuring your number in artistic design',
        priceRange: '25 - 38',
        currency: 'EUR',
        icon: '&#129513;',
        tagline: 'Piece together {value}',
        customizable: ['number', 'image', 'message'],
        categories: ['fibonacci', 'palindrome', 'scientific', 'generic']
    },
    {
        id: 'bottle',
        name: 'Engraved Water Bottle',
        description: 'Insulated bottle with your milestone number and date laser-engraved',
        priceRange: '20 - 32',
        currency: 'EUR',
        icon: '&#129380;',
        tagline: 'Hydrate at {value}',
        customizable: ['number', 'name', 'date'],
        categories: ['round', 'power_of_2', 'generic']
    }
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

    const val = milestone.value.toLocaleString();
    const unit = milestone.unitName || '';
    const name = milestone.eventName || '';
    const why = milestone.description || '';

    const suggestions = getGiftSuggestions(milestone);

    preview.innerHTML = `<p class="gift-intro">Celebrate <strong>${val} ${unit}</strong> with a personalized gift for ${name}.</p>`;

    products.innerHTML = suggestions.map(p => {
        const tagline = p.tagline
            .replace(/\{value\}/g, val)
            .replace(/\{unit\}/g, unit)
            .replace(/\{name\}/g, name);

        return `
            <div class="gift-product-card" onclick="openGiftOrder('${p.id}', ${milestone.value}, '${milestone.unitName}')">
                <div class="gift-icon">${p.icon}</div>
                <div class="gift-info">
                    <div class="gift-name">${p.name}</div>
                    <div class="gift-tagline">${tagline}</div>
                    <div class="gift-price">${p.currency} ${p.priceRange}</div>
                </div>
            </div>
        `;
    }).join('');
}

function openGiftOrder(productId, value, unit) {
    const product = GIFT_CATALOG.find(p => p.id === productId);
    if (!product) return;

    // For now, show a "coming soon" modal
    const val = value.toLocaleString();
    const msg = `${product.name} — personalized with "${val} ${unit}"\n\nThe gift store is coming soon! We're partnering with artisan producers to bring you beautiful, personalized milestone gifts.\n\nWant to be notified when it launches?`;

    if (confirm(msg)) {
        showToast('Thanks! We\'ll notify you when the gift store launches.', 'success');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GIFT_CATALOG, getGiftSuggestions, renderGiftSuggestions };
}
