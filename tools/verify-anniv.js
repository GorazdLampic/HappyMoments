// Verify #7: 2nd-visit anniversary tip + Together-tab affordance with 1 person.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const WEB = path.join(__dirname, '..', 'web');
const PORT = 8769;
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
    await page.waitForTimeout(600);

    // Onboard "Me" (saves the event -> becomes returning user)
    await page.fill('#birthDay', '02');
    await page.fill('#birthMonth', '06');
    await page.fill('#birthYear', '1978');
    await page.click('#startBtn');
    await page.waitForTimeout(1500);
    // Simulate a finished onboarding so reloads land on the dashboard
    await page.evaluate(() => { localStorage.setItem('hm_onboarded', '1'); localStorage.removeItem('hm_onboard_resume'); });

    // Reload #1 -> launches=1 (no tip)
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3500);
    const toast1 = await page.evaluate(() => document.querySelector('.toast')?.textContent || null);

    const ls1 = await page.evaluate(() => ({ launches: localStorage.getItem('hm_launches'), tip: localStorage.getItem('hm_anniv_tip'), events: (typeof appData!=='undefined'?appData.events.length:'?') }));

    // Reload #2 -> launches=2 (tip should fire ~1.8s)
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3500);
    const toast2 = await page.evaluate(() => document.querySelector('.toast')?.textContent || null);
    const ls2 = await page.evaluate(() => ({ launches: localStorage.getItem('hm_launches'), tip: localStorage.getItem('hm_anniv_tip'), events: (typeof appData!=='undefined'?appData.events.length:'?') }));
    console.log('localStorage after #1:', JSON.stringify(ls1));
    console.log('localStorage after #2:', JSON.stringify(ls2));

    // Together tab affordance with a single person?
    await page.click('.tab-btn-bottom[data-tab="together"]').catch(() => {});
    await page.waitForTimeout(800);
    const affordance = await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const b = btns.find(x => /special date|annivers/i.test(x.textContent));
        return b ? b.textContent.trim() : null;
    });

    console.log('toast after reload #1 (expect null):', JSON.stringify(toast1));
    console.log('toast after reload #2 (expect anniversary tip):', JSON.stringify(toast2));
    console.log('together affordance (1 person):', JSON.stringify(affordance));
    console.log('pageerrors:', errors.length ? errors : 'none');

    await browser.close();
    srv.close();
})();
