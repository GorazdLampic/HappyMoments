// End-to-end test of the service-worker update flow (the "A new version is ready"
// toast that used to stick and reappear on Refresh). Serves web/ with a MUTABLE
// sw.js so we can trigger a real update, then drives the toast in Chromium.
// Run: node tools/test-sw-update.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const WEB = path.join(__dirname, '..', 'web');
const PORT = 8767;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
let bump = 0; // mutate to make sw.js "change" → triggers an update

function serve() {
    return new Promise(resolve => {
        const srv = http.createServer((req, res) => {
            let p = req.url.split('?')[0];
            if (p === '/') p = '/index.html';
            const file = path.join(WEB, decodeURIComponent(p));
            if (!file.startsWith(WEB) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
            let body = fs.readFileSync(file);
            const headers = { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' };
            if (p === '/sw.js') { body = Buffer.concat([body, Buffer.from(`\n// bump ${bump}\n`)]); headers['Cache-Control'] = 'no-cache'; }
            res.writeHead(200, headers);
            res.end(body);
        });
        srv.listen(PORT, () => resolve(srv));
    });
}

const results = [];
const check = (name, ok, detail) => { results.push([name, ok, detail]); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '   → ' + detail}`); };

(async () => {
    const srv = await serve();
    const browser = await chromium.launch();
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'load' });

    // Wait for the SW to take control of the page.
    let controlled = await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 12000 }).then(() => true).catch(() => false);
    if (!controlled) { await page.reload({ waitUntil: 'load' }); controlled = await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 12000 }).then(() => true).catch(() => false); }
    check('SW takes control of the page', controlled, 'controller still null');

    // Trigger an update by changing the served sw.js, then calling reg.update().
    bump = 1;
    await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); if (r) await r.update(); });

    const toastAppeared = await page.waitForSelector('#updateToast', { timeout: 12000 }).then(() => true).catch(() => false);
    check('update toast appears when a new version installs', toastAppeared, 'no #updateToast');

    if (toastAppeared) {
        const btnCount = await page.$$eval('#updateToast button', b => b.length);
        check('toast has Refresh + Dismiss buttons', btnCount === 2, `found ${btnCount} buttons`);

        // Dismiss (×) removes the toast — it can never get stuck.
        await page.click('#updateToast button[aria-label="Dismiss"]');
        const gone = await page.$('#updateToast');
        check('Dismiss (×) closes the toast', gone === null, 'toast still present');

        // It reappears on reload (a real waiting worker is still there)…
        await page.reload({ waitUntil: 'load' });
        const reappear = await page.waitForSelector('#updateToast', { timeout: 12000 }).then(() => true).catch(() => false);
        check('toast reappears on reload (waiting worker present)', reappear, 'did not reappear');

        // …and Refresh ACTIVATES the new worker → page reloads → toast is gone.
        if (reappear) {
            await Promise.all([
                page.waitForNavigation({ timeout: 15000 }).catch(() => {}),
                page.click('#updateToast button:not([aria-label])'),
            ]);
            await page.waitForTimeout(1500);
            const stillThere = await page.$('#updateToast');
            check('Refresh applies the update and clears the toast', stillThere === null, 'toast persisted after Refresh');
        }
    }

    await browser.close();
    srv.close();
    const failed = results.filter(r => !r[1]).length;
    if (failed) { console.error(`\n${failed} check(s) failed`); process.exit(1); }
    console.log('\ntest-sw-update: all checks passed');
})();
