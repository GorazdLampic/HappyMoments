// One-off verification for #5 per-number cards. Serves web/, loads the app,
// generates a square card for each milestone category and saves PNGs so the
// distinct looks can be eyeballed. Run: node tools/verify-cards.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const WEB = path.join(__dirname, '..', 'web');
const OUT = path.join(__dirname, '..', 'screenshots', 'cards');
const PORT = 8767;
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
    const page = await (await browser.newContext()).newPage();
    page.on('pageerror', e => errors.push(String(e)));

    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.waitForTimeout(500);

    const result = await page.evaluate(() => {
        const inDays = (n) => n * 86400000;
        const base = (o) => Object.assign({
            eventName: 'Luka', date: new Date(Date.now() + inDays(30)), timeUntil: inDays(30)
        }, o);
        const cases = {
            round:      base({ value: 1000000000, unitName: 'seconds', type: 'round', description: 'A billion seconds' }),
            repdigit:   base({ value: 7777, unitName: 'days', type: 'repdigit', description: 'All sevens' }),
            palindrome: base({ value: 1234321, unitName: 'minutes', type: 'palindrome', description: 'Reads the same both ways' }),
            birthday:   base({ value: 40, unitName: 'years', isBirthday: true, description: 'Turns 40' }),
            cosmic:     base({ value: 1, unitName: 'Saturn return', isCosmic: true, description: 'First Saturn return' }),
            fibonacci:  base({ value: 2584, unitName: 'days', type: 'fibonacci', description: 'A Fibonacci number' }),
            generic:    base({ value: 12345, unitName: 'days', type: 'generic', description: '' })
        };
        const out = {};
        const cats = {};
        for (const [k, m] of Object.entries(cases)) {
            cats[k] = (typeof getCardCategory === 'function') ? getCardCategory(m) : '?';
            out[k] = generateMilestoneCard(m, { theme: 'dark' }).toDataURL('image/png');
        }
        return { out, cats };
    });

    fs.mkdirSync(OUT, { recursive: true });
    for (const [k, dataUrl] of Object.entries(result.out)) {
        fs.writeFileSync(path.join(OUT, `card-${k}.png`), Buffer.from(dataUrl.split(',')[1], 'base64'));
    }
    console.log('resolved categories:', JSON.stringify(result.cats));
    console.log('pageerrors:', errors.length ? errors : 'none');
    console.log('saved cards:', Object.keys(result.out).join(', '));

    await browser.close();
    srv.close();
})();
