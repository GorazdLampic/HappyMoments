/**
 * Nice Numbers — Shareable Image Card Generator
 * Generates beautiful milestone cards as PNG images using Canvas API.
 */

const CARD_CONFIG = {
    width: 1080,
    height: 1080,
    storyWidth: 1080,
    storyHeight: 1920,
    padding: 80,
    // Color themes
    themes: {
        dark: {
            bg: '#1a1a1a',
            bgGradient: ['#1a1a1a', '#2a2233'],
            text: '#e0e0e0',
            accent: '#d4b876',
            muted: '#888888',
            highlight: '#a0b8a0',
        },
        warm: {
            bg: '#2d1f1a',
            bgGradient: ['#2d1f1a', '#1a2020'],
            text: '#f0e6d8',
            accent: '#e8a850',
            muted: '#998877',
            highlight: '#c8d8b0',
        },
        ocean: {
            bg: '#0f1a2e',
            bgGradient: ['#0f1a2e', '#1a2d3d'],
            text: '#d8e8f0',
            accent: '#60a0c8',
            muted: '#6688aa',
            highlight: '#88c8b8',
        },
        sunset: {
            bg: '#2a1520',
            bgGradient: ['#2a1520', '#301a10'],
            text: '#f0ddd0',
            accent: '#e87040',
            muted: '#aa7766',
            highlight: '#f0a860',
        },
        // ── Premium-exclusive designs ──
        goldfoil: {
            bg: '#0d0d0d',
            bgGradient: ['#0d0d0d', '#1c1608'],
            text: '#f2ead2',
            accent: '#e8c86a',
            muted: '#7a7060',
            highlight: '#d4b876',
        },
        rose: {
            bg: '#2a1620',
            bgGradient: ['#2a1620', '#3a1a2c'],
            text: '#f6e2ea',
            accent: '#e6a6bc',
            muted: '#a67e8e',
            highlight: '#f2c6d6',
        },
        ivory: {
            bg: '#f5f0e6',
            bgGradient: ['#f7f2ea', '#ede2d0'],
            text: '#3a352c',
            accent: '#b8933c',
            muted: '#9a9080',
            highlight: '#7a8a6a',
        }
    }
};

// ── Card designs: which are free vs premium ──
// 'dark' is always free; the rest are premium-exclusive perks.
const FREE_CARD_THEME = 'dark';
const PREMIUM_CARD_THEMES = ['ocean', 'sunset', 'goldfoil', 'rose', 'ivory'];

// The card design the user has chosen. Card designs are FREE for everyone (they
// are not a premium exclusive), so any valid theme is honoured.
function getCardTheme() {
    try {
        const sel = localStorage.getItem('happymoments_card_theme') || FREE_CARD_THEME;
        return CARD_CONFIG.themes[sel] ? sel : FREE_CARD_THEME;
    } catch (e) {
        return FREE_CARD_THEME;
    }
}

// #5 Per-number cards: the card's accent colour and background motif vary by
// the milestone's category, and the motif is drawn from the ACTUAL number, so
// a palindrome, a repdigit and a round number each get a distinct look instead
// of one generic template. Category comes from giftStore's getGiftCategory()
// (reused), with cosmic handled here.
function getCardCategory(milestone) {
    if (!milestone) return 'generic';
    if (milestone.isCosmic) return 'cosmic';
    if (typeof getGiftCategory === 'function') return getGiftCategory(milestone);
    if (milestone.isBirthday) return 'birthday';
    return milestone.type || 'generic';
}

// Accent colour per category (falls back to the theme accent for 'generic').
const CARD_ACCENTS = {
    round:      '#d4b876', // classic gold
    repdigit:   '#86c08f', // green
    palindrome: '#b89ad4', // violet
    birthday:   '#e8975a', // warm orange
    cosmic:     '#7fb0e0', // starlight blue
    fibonacci:  '#6fb6c0', // teal
    power_of_2: '#6fb6c0',
    scientific: '#6fb6c0',
    sequential: '#6fb6c0'
};

function getCardAccent(category, theme) {
    return CARD_ACCENTS[category] || theme.accent;
}

// Draw a faint background motif derived from the category + the real number.
function drawCategoryMotif(ctx, W, H, accent, category, valueStr) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = accent;
    ctx.strokeStyle = accent;

    if (category === 'round') {
        // Concentric rings — the roundness of the number, made visual.
        ctx.globalAlpha = 0.05;
        ctx.lineWidth = 3;
        for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            ctx.arc(W / 2, H * 0.42, i * Math.min(W, H) * 0.07, 0, Math.PI * 2);
            ctx.stroke();
        }
    } else if (category === 'repdigit') {
        // The single repeated digit, oversized behind the content.
        ctx.globalAlpha = 0.045;
        ctx.font = `800 ${Math.round(Math.min(W, H) * 0.6)}px "Helvetica Neue", "Arial", sans-serif`;
        ctx.fillText((valueStr.replace(/\D/g, '')[0] || '8'), W / 2, H * 0.62);
    } else if (category === 'palindrome') {
        // Mirror axis — palindromes read the same both ways.
        ctx.globalAlpha = 0.05;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(W / 2, H * 0.12);
        ctx.lineTo(W / 2, H * 0.88);
        ctx.stroke();
        ctx.globalAlpha = 0.035;
        ctx.font = `300 ${Math.round(Math.min(W, H) * 0.16)}px "Helvetica Neue", "Arial", sans-serif`;
        ctx.fillText(valueStr, W / 2, H * 0.30);
    } else if (category === 'birthday') {
        // Confetti dots.
        const dots = [[0.18,0.16],[0.82,0.2],[0.28,0.78],[0.74,0.82],[0.5,0.1],[0.12,0.5],[0.88,0.55],[0.62,0.7]];
        ctx.globalAlpha = 0.10;
        dots.forEach((d, i) => {
            ctx.beginPath();
            ctx.arc(W * d[0], H * d[1], (i % 3 + 2) * (W / 180), 0, Math.PI * 2);
            ctx.fill();
        });
    } else if (category === 'cosmic') {
        // Scattered stars + a faint orbit.
        ctx.globalAlpha = 0.12;
        const stars = [[0.15,0.18],[0.85,0.16],[0.22,0.82],[0.8,0.8],[0.5,0.12],[0.68,0.3],[0.3,0.42],[0.9,0.5]];
        ctx.font = `${Math.round(W * 0.03)}px "EB Garamond", serif`;
        stars.forEach(s => ctx.fillText('✱', W * s[0], H * s[1]));
        ctx.globalAlpha = 0.05;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(W / 2, H * 0.42, W * 0.4, H * 0.18, -0.25, 0, Math.PI * 2);
        ctx.stroke();
    } else if (category === 'fibonacci' || category === 'power_of_2' || category === 'scientific' || category === 'sequential') {
        // Faint dotted spiral — the sense of a sequence.
        ctx.globalAlpha = 0.06;
        for (let i = 0; i < 60; i++) {
            const a = i * 0.5;
            const r = a * Math.min(W, H) * 0.012;
            ctx.beginPath();
            ctx.arc(W / 2 + Math.cos(a) * r, H * 0.42 + Math.sin(a) * r, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        // Generic: the original single star flourish.
        ctx.globalAlpha = 0.03;
        ctx.font = '800 400px "Helvetica Neue", "Arial", sans-serif';
        ctx.fillText('*', W * 0.8, H * 0.35);
    }
    ctx.restore();
}

function generateMilestoneCard(milestone, options) {
    options = options || {};
    const theme = CARD_CONFIG.themes[options.theme || getCardTheme()] || CARD_CONFIG.themes.dark;
    const W = CARD_CONFIG.width;
    const H = CARD_CONFIG.height;
    const P = CARD_CONFIG.padding;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, theme.bgGradient[0]);
    grad.addColorStop(1, theme.bgGradient[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // #5 Category-driven look: motif from the actual number + per-category accent
    const category = getCardCategory(milestone);
    const catAccent = getCardAccent(category, theme);
    drawCategoryMotif(ctx, W, H, catAccent, category, ((typeof formatMilestoneValue === 'function') ? formatMilestoneValue(milestone.value) : milestone.value.toLocaleString()));
    drawDecorations(ctx, W, H, theme);

    // Content
    const _du = (typeof displayNumberAndUnit === 'function')
        ? displayNumberAndUnit(milestone.value, milestone.unitName, { plain: true })
        : { num: milestone.value.toLocaleString(), unit: (milestone.unitName || '') };
    const val = _du.num;
    const unit = _du.unit || '';
    const name = milestone.eventName || '';
    const dateStr = milestone.date.toLocaleDateString((typeof getAppLocale==='function'?getAppLocale():'en'), {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
    // Countdown intentionally omitted from the shareable card — a celebratory
    // share shouldn't read "in 3 months 1 week". Dashboard rows keep it.
    const why = milestone.description || '';

    // Top: app name
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.muted;
    ctx.font = 'italic 43px "EB Garamond", Georgia, serif';
    ctx.fillText('Nice Numbers', W / 2, P + 20);

    // Tagline
    ctx.fillStyle = catAccent;
    ctx.font = 'italic 48px "EB Garamond", Georgia, serif';
    ctx.fillText('Share & Celebrate', W / 2, P + 58);

    // Thin line
    ctx.strokeStyle = theme.muted + '40';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(P + 100, P + 82);
    ctx.lineTo(W - P - 100, P + 82);
    ctx.stroke();

    // Auto-size any text to fit the card width (long units like "Mercury orbits"
    // or long descriptions used to run off the edge).
    const fitFont = (txt, base, min, tmpl) => {
        let s = base; ctx.font = tmpl(s);
        while (ctx.measureText(txt).width > W - P * 2 && s > min) { s -= 4; ctx.font = tmpl(s); }
        return s;
    };

    // Person name — auto-shrink so long names still fit
    ctx.fillStyle = theme.highlight;
    let nameSize = 78;
    ctx.font = `italic ${nameSize}px "EB Garamond", Georgia, serif`;
    while (ctx.measureText(name).width > W - P * 2 && nameSize > 34) {
        nameSize -= 4;
        ctx.font = `italic ${nameSize}px "EB Garamond", Georgia, serif`;
    }
    ctx.fillText(name, W / 2, P + 138);

    // Big number — the star of the card
    ctx.fillStyle = catAccent;
    ctx.font = '300 158px "Helvetica Neue", "Arial", sans-serif';

    // Auto-size if number is too wide
    let fontSize = 158;
    while (ctx.measureText(val).width > W - P * 2 - 40 && fontSize > 60) {
        fontSize -= 10;
        ctx.font = `300 ${fontSize}px "Helvetica Neue", "Arial", sans-serif`;
    }
    ctx.fillText(val, W / 2, H / 2 + 20);

    // Unit
    ctx.fillStyle = theme.text;
    fitFont(unit, 114, 46, s => `italic ${s}px "EB Garamond", Georgia, serif`);
    ctx.fillText(unit, W / 2, H / 2 + 116);

    // Why it's special
    if (why) {
        ctx.fillStyle = theme.muted;
        fitFont(why, 60, 32, s => `italic ${s}px "EB Garamond", Georgia, serif`);
        ctx.fillText(why, W / 2, H / 2 + 184);
    }

    // Date
    ctx.fillStyle = theme.text;
    fitFont(dateStr, 64, 34, s => `${s}px "Helvetica Neue", "Arial", sans-serif`);
    ctx.fillText(dateStr, W / 2, H - P - 122);

    // Bottom line
    ctx.strokeStyle = theme.muted + '40';
    ctx.beginPath();
    ctx.moveTo(P + 100, H - P - 30);
    ctx.lineTo(W - P - 100, H - P - 30);
    ctx.stroke();

    // Footer — the app URL, prominent so people know where to go (the card is an
    // image, so this can't itself be a hyperlink; the clickable link travels in
    // the shared message text alongside the card).
    ctx.fillStyle = catAccent;
    ctx.font = '44px "EB Garamond", Georgia, serif';
    ctx.fillText('nicenumbers.app', W / 2, H - P + 14);

    // Watermark for free users — premium gets clean cards
    const _isPremium = typeof isPremium === 'function' && isPremium();
    if (!_isPremium) {
        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = theme.text;
        ctx.font = 'italic 81px "EB Garamond", Georgia, serif';
        ctx.translate(W / 2, H / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText('nicenumbers.app', 0, 0);
        ctx.restore();
    }

    return canvas;
}

// Generate Instagram Story format card (1080x1920)
function generateStoryCard(milestone, options) {
    options = options || {};
    const theme = CARD_CONFIG.themes[options.theme || getCardTheme()] || CARD_CONFIG.themes.dark;
    const W = CARD_CONFIG.storyWidth;
    const H = CARD_CONFIG.storyHeight;
    const P = 100;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Background gradient (vertical for story)
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, theme.bgGradient[0]);
    grad.addColorStop(0.5, theme.bgGradient[1]);
    grad.addColorStop(1, theme.bgGradient[0]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // #5 Category-driven look (same as square)
    const category = getCardCategory(milestone);
    const catAccent = getCardAccent(category, theme);
    drawCategoryMotif(ctx, W, H, catAccent, category, ((typeof formatMilestoneValue === 'function') ? formatMilestoneValue(milestone.value) : milestone.value.toLocaleString()));
    drawDecorations(ctx, W, H, theme);

    const _du = (typeof displayNumberAndUnit === 'function')
        ? displayNumberAndUnit(milestone.value, milestone.unitName, { plain: true })
        : { num: milestone.value.toLocaleString(), unit: (milestone.unitName || '') };
    const val = _du.num;
    const unit = _du.unit || '';
    const name = milestone.eventName || '';
    const dateStr = milestone.date.toLocaleDateString((typeof getAppLocale==='function'?getAppLocale():'en'), {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
    // Countdown intentionally omitted from the shareable story card.
    const why = milestone.description || '';

    ctx.textAlign = 'center';

    // Top section — app name
    ctx.fillStyle = theme.muted;
    ctx.font = 'italic 43px "EB Garamond", Georgia, serif';
    ctx.fillText('Nice Numbers', W / 2, P + 40);

    // Tagline
    ctx.fillStyle = catAccent;
    ctx.font = 'italic 35px "EB Garamond", Georgia, serif';
    ctx.fillText('Share & Celebrate', W / 2, P + 75);

    // Thin line
    ctx.strokeStyle = theme.muted + '40';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(P + 100, P + 100);
    ctx.lineTo(W - P - 100, P + 100);
    ctx.stroke();

    // Person name — upper third (auto-shrink for long names)
    ctx.fillStyle = theme.highlight;
    let nameSize = 78;
    ctx.font = `italic ${nameSize}px "EB Garamond", Georgia, serif`;
    while (ctx.measureText(name).width > W - P * 2 && nameSize > 42) {
        nameSize -= 4;
        ctx.font = `italic ${nameSize}px "EB Garamond", Georgia, serif`;
    }
    ctx.fillText(name, W / 2, H * 0.25);

    // "will be" text
    ctx.fillStyle = theme.muted;
    ctx.font = 'italic 59px "EB Garamond", Georgia, serif';
    ctx.fillText('will be', W / 2, H * 0.32);

    // BIG NUMBER — center of story
    ctx.fillStyle = catAccent;
    let fontSize = 180;
    ctx.font = `300 ${fontSize}px "Helvetica Neue", "Arial", sans-serif`;
    while (ctx.measureText(val).width > W - P * 2 - 40 && fontSize > 80) {
        fontSize -= 10;
        ctx.font = `300 ${fontSize}px "Helvetica Neue", "Arial", sans-serif`;
    }
    ctx.fillText(val, W / 2, H * 0.45);

    // Unit
    ctx.fillStyle = theme.text;
    ctx.font = 'italic 108px "EB Garamond", Georgia, serif';
    ctx.fillText(unit, W / 2, H * 0.525);

    // Why it's special
    if (why) {
        ctx.fillStyle = theme.muted;
        ctx.font = 'italic 59px "EB Garamond", Georgia, serif';
        ctx.fillText(why, W / 2, H * 0.59);
    }

    // Date — lower section
    ctx.fillStyle = theme.text;
    ctx.font = '62px "Helvetica Neue", "Arial", sans-serif';
    ctx.fillText(dateStr, W / 2, H * 0.68);

    // Call to action
    ctx.fillStyle = theme.muted;
    ctx.font = 'italic 51px "EB Garamond", Georgia, serif';
    ctx.fillText('When is YOUR special number?', W / 2, H * 0.84);

    // Bottom line
    ctx.strokeStyle = theme.muted + '40';
    ctx.beginPath();
    ctx.moveTo(P + 100, H - P - 40);
    ctx.lineTo(W - P - 100, H - P - 40);
    ctx.stroke();

    // Footer
    ctx.fillStyle = theme.accent;
    ctx.font = '38px "EB Garamond", Georgia, serif';
    ctx.fillText('nicenumbers.app', W / 2, H - P);

    // Watermark for free users
    const _isPremium = typeof isPremium === 'function' && isPremium();
    if (!_isPremium) {
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = theme.text;
        ctx.font = 'italic 95px "EB Garamond", Georgia, serif';
        ctx.translate(W / 2, H * 0.45);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText('nicenumbers.app', 0, 0);
        ctx.restore();
    }

    return canvas;
}

function downloadStoryCard(milestone, theme) {
    const canvas = generateStoryCard(milestone, { theme: theme || getCardTheme() });
    const link = document.createElement('a');
    link.download = `NiceNumbers-story-${milestone.value}-${milestone.unitName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    if (typeof HM_ANALYTICS !== 'undefined') HM_ANALYTICS.track('card_downloaded', { value: milestone.value, unit: milestone.unitName, format: 'story', theme: theme || 'dark', category: getCardCategory(milestone) });
    showToast('Story card downloaded!', 'success');
}

async function shareStoryCard(milestone, theme) {
    const canvas = generateStoryCard(milestone, { theme: theme || getCardTheme() });
    if (navigator.share && navigator.canShare) {
        try {
            const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
            const file = new File([blob], 'NiceNumbers-story.png', { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Nice Numbers',
                    text: typeof generateShareMessage === 'function' ? generateShareMessage(milestone) : '',
                    files: [file]
                });
                if (typeof HM_ANALYTICS !== 'undefined') HM_ANALYTICS.track('card_shared', { value: milestone.value, unit: milestone.unitName, format: 'story', category: getCardCategory(milestone) });
                return;
            }
        } catch (e) {
            if (e.name === 'AbortError') return;
        }
    }
    downloadStoryCard(milestone, theme);
}

function drawDecorations(ctx, W, H, theme) {
    ctx.save();
    ctx.textAlign = 'center';

    // Corner accents (the background motif is drawn separately by category)
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2;

    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(40, 80);
    ctx.lineTo(40, 40);
    ctx.lineTo(80, 40);
    ctx.stroke();

    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(W - 80, 40);
    ctx.lineTo(W - 40, 40);
    ctx.lineTo(W - 40, 80);
    ctx.stroke();

    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(40, H - 80);
    ctx.lineTo(40, H - 40);
    ctx.lineTo(80, H - 40);
    ctx.stroke();

    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(W - 80, H - 40);
    ctx.lineTo(W - 40, H - 40);
    ctx.lineTo(W - 40, H - 80);
    ctx.stroke();

    ctx.restore();
}

// Download the card as PNG
function downloadMilestoneCard(milestone, theme) {
    const canvas = generateMilestoneCard(milestone, { theme: theme || getCardTheme() });
    const link = document.createElement('a');
    link.download = `NiceNumbers-${milestone.value}-${milestone.unitName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    if (typeof HM_ANALYTICS !== 'undefined') HM_ANALYTICS.track('card_downloaded', { value: milestone.value, unit: milestone.unitName, format: 'square', theme: theme || 'dark', category: getCardCategory(milestone) });
    showToast('Card downloaded!', 'success');
}

// Share the card using Web Share API (if available)
async function shareMilestoneCard(milestone, theme) {
    const canvas = generateMilestoneCard(milestone, { theme: theme || getCardTheme() });

    // Try Web Share API with file support
    if (navigator.share && navigator.canShare) {
        try {
            const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
            const file = new File([blob], 'NiceNumbers.png', { type: 'image/png' });

            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Nice Numbers',
                    text: generateShareMessage(milestone),
                    files: [file]
                });
                if (typeof HM_ANALYTICS !== 'undefined') HM_ANALYTICS.track('card_shared', { value: milestone.value, unit: milestone.unitName, format: 'square', category: getCardCategory(milestone) });
                return;
            }
        } catch (e) {
            if (e.name !== 'AbortError') {
                console.warn('File share failed, falling back to download');
            } else {
                return; // User cancelled
            }
        }
    }

    // Fallback: download
    downloadMilestoneCard(milestone, theme);
}

// Render card preview in a container element
function renderCardPreview(milestone, containerId, theme) {
    const container = document.getElementById(containerId);
    if (!container || !milestone) return;

    const canvas = generateMilestoneCard(milestone, { theme: theme || getCardTheme() });
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '8px';
    canvas.style.cursor = 'pointer';
    canvas.title = 'Click to download';
    canvas.onclick = () => downloadMilestoneCard(milestone, theme);

    container.innerHTML = '';
    container.appendChild(canvas);

    // Theme selector
    const themes = Object.keys(CARD_CONFIG.themes);
    const selector = document.createElement('div');
    selector.className = 'card-theme-selector';
    selector.innerHTML = themes.map(t =>
        `<button class="card-theme-btn ${t === (theme || 'dark') ? 'active' : ''}"
                 onclick="renderCardPreview(allMilestonesFlat[selectedMilestone !== null ? selectedMilestone : 0], '${containerId}', '${t}')"
                 style="background: ${CARD_CONFIG.themes[t].bgGradient[0]}; color: ${CARD_CONFIG.themes[t].accent};"
                 title="${t}">${t}</button>`
    ).join('');

    // Format selector (Square / Story)
    const formatSel = document.createElement('div');
    formatSel.className = 'card-format-selector';
    formatSel.innerHTML = `
        <button class="card-format-btn active" onclick="renderCardPreview(allMilestonesFlat[selectedMilestone !== null ? selectedMilestone : 0], '${containerId}', '${theme || 'dark'}')">Square</button>
        <button class="card-format-btn" onclick="renderStoryPreview(allMilestonesFlat[selectedMilestone !== null ? selectedMilestone : 0], '${containerId}', '${theme || 'dark'}')">Story</button>
    `;

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    actions.innerHTML = `
        <button class="btn-secondary" onclick="downloadMilestoneCard(allMilestonesFlat[selectedMilestone !== null ? selectedMilestone : 0], '${theme || 'dark'}')">Download PNG</button>
        <button class="btn-primary" onclick="shareMilestoneCard(allMilestonesFlat[selectedMilestone !== null ? selectedMilestone : 0], '${theme || 'dark'}')">Share Image</button>
    `;

    container.appendChild(selector);
    container.appendChild(formatSel);
    container.appendChild(actions);
}

function renderStoryPreview(milestone, containerId, theme) {
    const container = document.getElementById(containerId);
    if (!container || !milestone) return;

    const canvas = generateStoryCard(milestone, { theme: theme || getCardTheme() });
    canvas.style.width = '50%';
    canvas.style.margin = '0 auto';
    canvas.style.display = 'block';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '8px';
    canvas.style.cursor = 'pointer';
    canvas.title = 'Click to download';
    canvas.onclick = () => downloadStoryCard(milestone, theme);

    container.innerHTML = '';
    container.appendChild(canvas);

    // Theme selector
    const themes = Object.keys(CARD_CONFIG.themes);
    const selector = document.createElement('div');
    selector.className = 'card-theme-selector';
    selector.innerHTML = themes.map(t =>
        `<button class="card-theme-btn ${t === (theme || 'dark') ? 'active' : ''}"
                 onclick="renderStoryPreview(allMilestonesFlat[selectedMilestone !== null ? selectedMilestone : 0], '${containerId}', '${t}')"
                 style="background: ${CARD_CONFIG.themes[t].bgGradient[0]}; color: ${CARD_CONFIG.themes[t].accent};"
                 title="${t}">${t}</button>`
    ).join('');

    // Format selector
    const formatSel = document.createElement('div');
    formatSel.className = 'card-format-selector';
    formatSel.innerHTML = `
        <button class="card-format-btn" onclick="renderCardPreview(allMilestonesFlat[selectedMilestone !== null ? selectedMilestone : 0], '${containerId}', '${theme || 'dark'}')">Square</button>
        <button class="card-format-btn active" onclick="renderStoryPreview(allMilestonesFlat[selectedMilestone !== null ? selectedMilestone : 0], '${containerId}', '${theme || 'dark'}')">Story</button>
    `;

    const actions = document.createElement('div');
    actions.className = 'card-actions';
    actions.innerHTML = `
        <button class="btn-secondary" onclick="downloadStoryCard(allMilestonesFlat[selectedMilestone !== null ? selectedMilestone : 0], '${theme || 'dark'}')">Download Story</button>
        <button class="btn-primary" onclick="shareStoryCard(allMilestonesFlat[selectedMilestone !== null ? selectedMilestone : 0], '${theme || 'dark'}')">Share Story</button>
    `;

    container.appendChild(selector);
    container.appendChild(formatSel);
    container.appendChild(actions);
}

// ============================================================
// Gift Product Design Generator
// Creates print-ready designs for Printful products
// ============================================================

const GIFT_DESIGN_SIZES = {
    mug:     { width: 2700, height: 1100 },  // Printful mug print area
    tshirt:  { width: 4500, height: 5400 },  // Front print area
    tumbler: { width: 3017, height: 1200 }   // Printful tumbler 742 wrap (300dpi)
};

/**
 * Generate a print-ready design image for a Printful product.
 * @param {Object} milestone - { value, unitName, eventName }
 * @param {string} productType - 'mug' | 'tshirt' | 'tumbler'
 * @param {Object} [options] - { theme, message }
 * @returns {HTMLCanvasElement} - Canvas with the design rendered
 */
function generateGiftDesign(milestone, productType, options) {
    options = options || {};
    const theme = CARD_CONFIG.themes[options.theme || 'dark'];
    // Fallback must be a key that EXISTS (poster/tote/canvas were removed) —
    // an unknown productType previously crashed on `dims.width`.
    const dims = GIFT_DESIGN_SIZES[productType] || GIFT_DESIGN_SIZES.mug;
    const W = dims.width;
    const H = dims.height;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, theme.bgGradient[0]);
    grad.addColorStop(1, theme.bgGradient[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Scale factor relative to the 1080px base
    const S = Math.min(W, H) / 1080;

    // Decorative corner accents (scaled)
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 3 * S;
    const cornerLen = 60 * S;
    const cornerInset = 40 * S;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(cornerInset, cornerInset + cornerLen);
    ctx.lineTo(cornerInset, cornerInset);
    ctx.lineTo(cornerInset + cornerLen, cornerInset);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(W - cornerInset - cornerLen, cornerInset);
    ctx.lineTo(W - cornerInset, cornerInset);
    ctx.lineTo(W - cornerInset, cornerInset + cornerLen);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(cornerInset, H - cornerInset - cornerLen);
    ctx.lineTo(cornerInset, H - cornerInset);
    ctx.lineTo(cornerInset + cornerLen, H - cornerInset);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(W - cornerInset - cornerLen, H - cornerInset);
    ctx.lineTo(W - cornerInset, H - cornerInset);
    ctx.lineTo(W - cornerInset, H - cornerInset - cornerLen);
    ctx.stroke();
    ctx.restore();

    // Subtle inset frame — makes the printed piece read as a designed keepsake
    // instead of a number floating in empty space.
    ctx.save();
    ctx.strokeStyle = theme.accent;
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = 2 * S;
    const _fi = 26 * S;
    if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(_fi, _fi, W - 2 * _fi, H - 2 * _fi, 14 * S);
        ctx.stroke();
    } else {
        ctx.strokeRect(_fi, _fi, W - 2 * _fi, H - 2 * _fi);
    }
    ctx.restore();

    // Layout depends on aspect ratio
    const isWide = W > H; // mug is wide
    // Printed keepsake: plain digits (no thousands separators — "123456", not
    // "123,456") but keep the full unit word; the print area has room.
    const _du = (typeof displayNumberAndUnit === 'function')
        ? displayNumberAndUnit(milestone.value, milestone.unitName, { plain: true, fullUnit: true })
        : { num: milestone.value.toLocaleString(), unit: (milestone.unitName || '') };
    // The number line is user-editable (options.numberText); fall back to the
    // auto-formatted value. Unit stays auto-derived from the milestone.
    const val = (options.numberText != null && String(options.numberText).trim() !== '')
        ? String(options.numberText).trim() : _du.num;
    const unit = _du.unit || '';
    const name = milestone.eventName || '';
    const message = options.message || '';
    // Extra free-text line the buyer can add, printed near the bottom.
    const custom = (options.custom != null) ? String(options.custom).trim() : '';

    ctx.textAlign = 'center';

    if (isWide) {
        // === MUG layout: horizontal, number centered ===
        const P = 80 * S;
        const centerX = W / 2;
        const centerY = H / 2;

        // Person name top
        if (name) {
            ctx.fillStyle = theme.highlight;
            ctx.font = `italic ${Math.round(70 * S)}px "EB Garamond", Georgia, serif`;
            ctx.fillText(name, centerX, P + 64 * S);
        }

        // Thin line
        ctx.strokeStyle = theme.muted + '40';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(W * 0.25, P + 80 * S);
        ctx.lineTo(W * 0.75, P + 80 * S);
        ctx.stroke();

        // BIG number
        ctx.fillStyle = theme.accent;
        let fontSize = Math.round(200 * S);
        ctx.font = `300 ${fontSize}px "Helvetica Neue", "Arial", sans-serif`;
        while (ctx.measureText(val).width > W - P * 2 - 100 * S && fontSize > 60 * S) {
            fontSize -= Math.round(10 * S);
            ctx.font = `300 ${fontSize}px "Helvetica Neue", "Arial", sans-serif`;
        }
        ctx.fillText(val, centerX, centerY + 30 * S);

        // Unit below
        ctx.fillStyle = theme.text;
        ctx.font = `italic ${Math.round(80 * S)}px "EB Garamond", Georgia, serif`;
        ctx.fillText(unit, centerX, centerY + 108 * S);

        // Personal message
        if (message) {
            ctx.fillStyle = theme.muted;
            ctx.font = `italic ${Math.round(32 * S)}px "EB Garamond", Georgia, serif`;
            ctx.fillText(message, centerX, H - P - 60 * S);
        }

        // Custom free-text line near the bottom (same size as the message)
        if (custom) {
            ctx.fillStyle = theme.text;
            ctx.font = `italic ${Math.round(32 * S)}px "EB Garamond", Georgia, serif`;
            ctx.fillText(custom, centerX, H - P);
        }

    } else {
        // === PORTRAIT / SQUARE layout: poster, tshirt, tote, canvas ===
        const P = 100 * S;
        const centerX = W / 2;

        // No top brand on the printed keepsake — a gift shouldn't read as an ad.
        // (The shareable card keeps its branding; that one is meant to travel.)

        // Person name
        if (name) {
            ctx.fillStyle = theme.highlight;
            ctx.font = `italic ${Math.round(82 * S)}px "EB Garamond", Georgia, serif`;
            ctx.fillText(name, centerX, H * 0.24);
        }

        // BIG NUMBER — the hero
        ctx.fillStyle = theme.accent;
        let fontSize = Math.round(220 * S);
        ctx.font = `300 ${fontSize}px "Helvetica Neue", "Arial", sans-serif`;
        while (ctx.measureText(val).width > W - P * 2 - 40 * S && fontSize > 80 * S) {
            fontSize -= Math.round(10 * S);
            ctx.font = `300 ${fontSize}px "Helvetica Neue", "Arial", sans-serif`;
        }
        ctx.fillText(val, centerX, H * 0.45);

        // Unit
        ctx.fillStyle = theme.text;
        ctx.font = `italic ${Math.round(88 * S)}px "EB Garamond", Georgia, serif`;
        ctx.fillText(unit, centerX, H * 0.525);

        // Personal message
        if (message) {
            ctx.fillStyle = theme.muted;
            ctx.font = `italic ${Math.round(40 * S)}px "EB Garamond", Georgia, serif`;
            // Word-wrap long messages
            const maxWidth = W - P * 2;
            const words = message.split(' ');
            let line = '';
            let y = H * 0.60;
            for (const word of words) {
                const test = line + (line ? ' ' : '') + word;
                if (ctx.measureText(test).width > maxWidth) {
                    ctx.fillText(line, centerX, y);
                    line = word;
                    y += 50 * S;
                } else {
                    line = test;
                }
            }
            if (line) ctx.fillText(line, centerX, y);
        }

        // Custom free-text line near the bottom (same size as the message)
        if (custom) {
            ctx.fillStyle = theme.text;
            ctx.font = `italic ${Math.round(40 * S)}px "EB Garamond", Georgia, serif`;
            ctx.fillText(custom, centerX, H - P - 10 * S);
        }
    }

    return canvas;
}

/**
 * Generate a gift design and return as base64 PNG data URL.
 * @param {Object} milestone - { value, unitName, eventName }
 * @param {string} productType - 'mug' | 'tshirt' | 'tumbler'
 * @param {Object} [options] - { theme, message }
 * @returns {string} - Base64 data URL (image/png)
 */
function generateGiftDesignBase64(milestone, productType, options) {
    const canvas = generateGiftDesign(milestone, productType, options);
    // High-quality JPEG: the gradient background makes PNG huge (>2 MB, exceeds
    // Cloudflare D1's value limit, so the print file silently fell back to SVG).
    // JPEG at 0.92 keeps the look, stays a few hundred KB, and prints fine.
    return canvas.toDataURL('image/jpeg', 0.92);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateMilestoneCard, generateStoryCard,
        downloadMilestoneCard, downloadStoryCard,
        generateGiftDesign, generateGiftDesignBase64,
        GIFT_DESIGN_SIZES
    };
}
