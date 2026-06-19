// One-off verification for #6 intro age-stats strip on the Me reveal.
// Serves web/ and drives onboarding step 1 -> reveal, then asserts the strip.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const WEB = path.join(__dirname, '..', 'web');
const OUT = path.join(__dirname, '..', 'screenshots');
const PORT = 8766;
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
    await page.waitForTimeout(800);

    await page.fill('#birthDay', '02');
    await page.fill('#birthMonth', '06');
    await page.fill('#birthYear', '1978');
    await page.click('#startBtn');
    await page.waitForTimeout(4000); // reveal + stagger

    const strip = await page.evaluate(() => {
        const el = document.querySelector('#wizardStep2 .age-stats-strip');
        if (!el) return null;
        const cells = [...el.querySelectorAll('.age-stat')].map(c => ({
            num: c.querySelector('.age-stat-num')?.textContent,
            unit: c.querySelector('.age-stat-unit')?.textContent,
        }));
        return {
            intro: el.querySelector('.age-stats-intro')?.textContent,
            cells,
            more: el.querySelector('.age-stats-more')?.textContent,
            visible: getComputedStyle(el).opacity,
        };
    });

    fs.mkdirSync(OUT, { recursive: true });
    await page.screenshot({ path: path.join(OUT, 'verify-agestrip.png') });

    console.log('pageerrors:', errors.length ? errors : 'none');
    console.log('strip:', JSON.stringify(strip, null, 2));
    console.log(strip && strip.cells.length === 5 ? 'PASS: 5 age stats rendered' : 'FAIL: strip missing or wrong cell count');

    await browser.close();
    srv.close();
})();
