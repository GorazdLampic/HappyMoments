/**
 * HappyMoments — Shareable Image Card Generator
 * Generates beautiful milestone cards as PNG images using Canvas API.
 */

const CARD_CONFIG = {
    width: 1080,
    height: 1080,
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
        }
    }
};

function generateMilestoneCard(milestone, options) {
    options = options || {};
    const theme = CARD_CONFIG.themes[options.theme || 'dark'];
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

    // Subtle decorative elements
    drawDecorations(ctx, W, H, theme);

    // Content
    const val = milestone.value.toLocaleString();
    const unit = milestone.unitName || '';
    const name = milestone.eventName || '';
    const dateStr = milestone.date.toLocaleDateString((typeof getAppLocale==='function'?getAppLocale():'en'), {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
    const countdown = typeof formatTimeDistance === 'function'
        ? formatTimeDistance(milestone.timeUntil) : '';
    const why = milestone.description || '';

    // Top: app name
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.muted;
    ctx.font = 'italic 28px "EB Garamond", Georgia, serif';
    ctx.fillText('HappyMoments', W / 2, P + 20);

    // Thin line
    ctx.strokeStyle = theme.muted + '40';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(P + 100, P + 50);
    ctx.lineTo(W - P - 100, P + 50);
    ctx.stroke();

    // Person name
    ctx.fillStyle = theme.highlight;
    ctx.font = 'italic 42px "EB Garamond", Georgia, serif';
    ctx.fillText(name, W / 2, P + 120);

    // Big number — the star of the card
    ctx.fillStyle = theme.accent;
    ctx.font = '300 140px "Source Code Pro", "Courier New", monospace';

    // Auto-size if number is too wide
    let fontSize = 140;
    while (ctx.measureText(val).width > W - P * 2 - 40 && fontSize > 60) {
        fontSize -= 10;
        ctx.font = `300 ${fontSize}px "Source Code Pro", "Courier New", monospace`;
    }
    ctx.fillText(val, W / 2, H / 2 + 20);

    // Unit
    ctx.fillStyle = theme.text;
    ctx.font = 'italic 48px "EB Garamond", Georgia, serif';
    ctx.fillText(unit, W / 2, H / 2 + 80);

    // Why it's special
    if (why) {
        ctx.fillStyle = theme.muted;
        ctx.font = 'italic 30px "EB Garamond", Georgia, serif';
        ctx.fillText(why, W / 2, H / 2 + 140);
    }

    // Date
    ctx.fillStyle = theme.text;
    ctx.font = '32px "Source Code Pro", "Courier New", monospace';
    ctx.fillText(dateStr, W / 2, H - P - 120);

    // Countdown
    if (countdown) {
        ctx.fillStyle = theme.accent;
        ctx.font = 'italic 36px "EB Garamond", Georgia, serif';
        ctx.fillText(countdown + ' from now', W / 2, H - P - 70);
    }

    // Bottom line
    ctx.strokeStyle = theme.muted + '40';
    ctx.beginPath();
    ctx.moveTo(P + 100, H - P - 30);
    ctx.lineTo(W - P - 100, H - P - 30);
    ctx.stroke();

    // Footer
    ctx.fillStyle = theme.muted;
    ctx.font = '22px "EB Garamond", Georgia, serif';
    ctx.fillText('happymoments.app', W / 2, H - P + 5);

    return canvas;
}

function drawDecorations(ctx, W, H, theme) {
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = theme.accent;

    // Large decorative number in background
    ctx.font = '800 400px "Source Code Pro", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('*', W * 0.8, H * 0.35);

    // Corner accents
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
    const canvas = generateMilestoneCard(milestone, { theme: theme || 'dark' });
    const link = document.createElement('a');
    link.download = `happymoment-${milestone.value}-${milestone.unitName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Card downloaded!', 'success');
}

// Share the card using Web Share API (if available)
async function shareMilestoneCard(milestone, theme) {
    const canvas = generateMilestoneCard(milestone, { theme: theme || 'dark' });

    // Try Web Share API with file support
    if (navigator.share && navigator.canShare) {
        try {
            const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
            const file = new File([blob], 'happymoment.png', { type: 'image/png' });

            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'HappyMoment',
                    text: generateShareMessage(milestone),
                    files: [file]
                });
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

    const canvas = generateMilestoneCard(milestone, { theme: theme || 'dark' });
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

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    actions.innerHTML = `
        <button class="btn-secondary" onclick="downloadMilestoneCard(allMilestonesFlat[selectedMilestone !== null ? selectedMilestone : 0], '${theme || 'dark'}')">Download PNG</button>
        <button class="btn-primary" onclick="shareMilestoneCard(allMilestonesFlat[selectedMilestone !== null ? selectedMilestone : 0], '${theme || 'dark'}')">Share Image</button>
    `;

    container.appendChild(selector);
    container.appendChild(actions);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateMilestoneCard, downloadMilestoneCard };
}
