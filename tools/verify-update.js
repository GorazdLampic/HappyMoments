// Verify the Nice Numbers update: header tagline + simplified age strip (screen 2),
// recent-milestones engine, and card tagline. Run: node tools/verify-update.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const WEB = path.join(__dirname, '..', 'web');
const OUT = path.join(__dirname, '..', 'screenshots');
const PORT = 8768;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

function serve() {
    return new Promise(resolve => {
        const srv = http.createServer((req, res) => {
            let p = req.url.split('?')[0];
            if (p === '/') p = '/index.html';
            const file = path.join(WEB, decodeURIComponent(p));
            if (!file.startsWith(WEB) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
            res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
            fs.createReadStream(file).pipe(res);
        });
        srv.listen(PORT, () => resolve(srv));
    });
}

(async () => {
    const srv = await serve();
    const browser = await chromium.launch();
    const errors = [];
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(String(e)));

    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(700);

    // Header tagline present?
    const headerTagline = await page.evaluate(() => document.querySelector('.header-tagline')?.textContent || null);

    // Engineer a birthdate so 10,000 days passed 3 days ago
    const d = new Date(Date.now() - 10003 * 86400000);
    await page.fill('#birthDay', String(d.getDate()).padStart(2, '0'));
    await page.fill('#birthMonth', String(d.getMonth() + 1).padStart(2, '0'));
    await page.fill('#birthYear', String(d.getFullYear()));
    await page.click('#startBtn');
    await page.waitForTimeout(4000);

    const strip = await page.evaluate(() => {
        const el = document.querySelector('#wizardStep2 .age-stats-strip');
        if (!el) return null;
        return { line: el.querySelector('.age-stats-line')?.textContent, more: el.querySelector('.age-stats-more')?.textContent };
    });
    await page.screenshot({ path: path.join(OUT, 'verify-update-screen2.png') });

    // Recent-milestones engine for this date
    const recent = await page.evaluate((days) => {
        const bd = new Date(Date.now() - days * 86400000);
        const r = (typeof findRecentMilestones === 'function') ? findRecentMilestones(bd, 7, (typeof appSettings !== 'undefined' ? appSettings : {})) : null;
        return r ? r.map(m => ({ value: m.value, unit: m.unit, daysAgo: Math.round(-m.timeUntil / 86400000) })) : null;
    }, 10003);

    // A card to confirm the tagline
    fs.mkdirSync(path.join(OUT, 'cards'), { recursive: true });
    const cardUrl = await page.evaluate(() => {
        const m = { value: 7777, unitName: 'days', eventName: 'Luka', type: 'repdigit', description: 'All sevens', date: new Date(Date.now() + 30 * 86400000), timeUntil: 30 * 86400000 };
        return generateMilestoneCard(m, { theme: 'dark' }).toDataURL('image/png');
    });
    fs.writeFileSync(path.join(OUT, 'cards', 'card-rebranded.png'), Buffer.from(cardUrl.split(',')[1], 'base64'));

    console.log('header tagline:', JSON.stringify(headerTagline));
    console.log('age strip:', JSON.stringify(strip));
    console.log('recent milestones (last 7d):', JSON.stringify(recent));
    console.log('pageerrors:', errors.length ? errors : 'none');

    await browser.close();
    srv.close();
})();
