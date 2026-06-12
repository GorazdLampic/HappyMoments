// Quick probe: load the app under a given locale, click through screen 1,
// and dump every console error / pageerror. Run: node tools/debug-locale.js pt_BR
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const WEB = path.join(__dirname, '..', 'web');
const PORT = 8766;
const LOCALE = process.argv[2] || 'pt_BR';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };

const srv = http.createServer((req, res) => {
    let p = req.url.split('?')[0];
    if (p === '/') p = '/index.html';
    const file = path.join(WEB, decodeURIComponent(p));
    if (!file.startsWith(WEB) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
});

(async () => {
    await new Promise(r => srv.listen(PORT, r));
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
    page.on('console', m => { if (m.type() === 'error') console.log('[console.error]', m.text()); });
    page.on('pageerror', e => console.log('[pageerror]', e.message, '\n', (e.stack || '').split('\n').slice(0, 5).join('\n')));
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page.evaluate(l => { localStorage.clear(); localStorage.setItem('happymoments_locale', l); }, LOCALE);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.fill('#birthDay', '02');
    await page.fill('#birthMonth', '06');
    await page.fill('#birthYear', '1978');
    await page.click('#startBtn');
    await page.waitForTimeout(4000);
    const state = await page.evaluate(() => ({
        activeStep: document.querySelector('.wizard-step-active')?.id || null,
        locale: localStorage.getItem('happymoments_locale')
    }));
    console.log('[state]', JSON.stringify(state));
    await browser.close();
    srv.close();
})();
