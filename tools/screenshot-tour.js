// Screenshot tour — walks the full onboarding + dashboard at phone viewports
// and captures what the user actually sees. Run: node tools/screenshot-tour.js
// Output: screenshots/audit/<viewport>/NN-name.png + screenshots/audit/report.json
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const WEB = path.join(__dirname, '..', 'web');
const OUT = path.join(__dirname, '..', 'screenshots', 'audit');
const PORT = 8765;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

function serve() {
    return new Promise(resolve => {
        const srv = http.createServer((req, res) => {
            let p = req.url.split('?')[0];
            if (p === '/') p = '/index.html';
            const file = path.join(WEB, decodeURIComponent(p));
            if (!file.startsWith(WEB) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
                res.writeHead(404); res.end('not found'); return;
            }
            res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
            fs.createReadStream(file).pipe(res);
        });
        srv.listen(PORT, () => resolve(srv));
    });
}

// --lang=de,sl,ru runs the tour per language at a single viewport (360x800),
// writing to screenshots/audit/lang-<code>/ — for translation fit review
const LANG_ARG = (process.argv.find(a => a.startsWith('--lang=')) || '').replace('--lang=', '');
const LANGS = LANG_ARG ? LANG_ARG.split(',').filter(Boolean) : [null];

const VIEWPORTS = LANG_ARG
    ? [{ name: 'android-360x800', width: 360, height: 800 }]
    : [
        { name: 'iphone-390x844', width: 390, height: 844 },
        { name: 'android-360x800', width: 360, height: 800 },
    ];

async function fillField(page, sel, value) {
    await page.click(sel);                    // removes readonly via onfocus
    await page.fill(sel, value);
}

async function run() {
    const srv = await serve();
    const browser = await chromium.launch();
    const report = [];

    for (const lang of LANGS) {
    for (const vp of VIEWPORTS) {
        const dir = path.join(OUT, lang ? 'lang-' + lang : vp.name);
        fs.mkdirSync(dir, { recursive: true });
        const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
        const page = await ctx.newPage();
        page.on('pageerror', e => report.push({ viewport: vp.name, type: 'pageerror', message: String(e) }));

        let shotIdx = 0;
        async function shot(name) {
            shotIdx++;
            const fname = String(shotIdx).padStart(2, '0') + '-' + name + '.png';
            await page.screenshot({ path: path.join(dir, fname) });
            const metrics = await page.evaluate(() => ({
                scrollHeight: document.documentElement.scrollHeight,
                clientHeight: document.documentElement.clientHeight,
                horizOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            }));
            report.push({ viewport: vp.name, screen: fname, ...metrics, overflowsViewport: metrics.scrollHeight > metrics.clientHeight + 4 });
        }

        await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
        await page.evaluate((l) => {
            localStorage.clear(); sessionStorage.clear();
            if (l) localStorage.setItem('happymoments_locale', l);
        }, lang);
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(800);

        // Screen 1
        await shot('screen1-intro');
        await page.fill('#birthDay', '02');
        await page.fill('#birthMonth', '06');
        await page.fill('#birthYear', '1978');
        await page.click('#startBtn');
        await page.waitForTimeout(3800);             // reveal counter animation
        await shot('screen2-your-reveal');

        await page.click('#wizardStep2 .wizard-actions .wizard-btn');
        await page.waitForTimeout(600);
        await shot('screen3-your-more');

        await page.click('#wizardStep3 .wizard-actions .wizard-btn');
        await page.waitForTimeout(400);
        await shot('screen4-add-person');

        await fillField(page, '#friendNameField', 'Nastja');
        await page.fill('#friendDay', '13');
        await page.fill('#friendMonth', '03');
        await page.fill('#friendYear', '1990');
        await page.click('#wizardShowTheirBtn');
        await page.waitForTimeout(3800);
        await shot('screen5-friend-reveal');

        await page.click('#wizardStep5 .wizard-actions .wizard-btn');   // Check what you share together
        await page.waitForTimeout(1200);
        await shot('screen6-combined-name');

        await page.click('#wizardAddMoreBtn6');
        await page.waitForTimeout(600);
        await shot('screen7-group-builder');

        await fillField(page, '#groupPersonField', 'V');
        await page.fill('#groupDay', '07');
        await page.fill('#groupMonth', '07');
        await page.fill('#groupYear', '2012');       // auto-add fires here
        await page.waitForTimeout(800);
        await shot('screen7-after-autoadd');

        await page.click('#groupContinueBtn');
        await page.waitForTimeout(1500);
        await shot('screen8-phase1-individual');

        await page.click('#wizardShareBtn8');        // -> phase 2 combined
        await page.waitForTimeout(1500);
        await shot('screen8-phase2-combined');

        await page.click('#wizardDashboardBtn8');    // quiet exit (first-group variant)
        await page.waitForTimeout(1200);
        await shot('dashboard-solo');

        await page.click('.tab-btn-bottom[data-tab="together"]');
        await page.waitForTimeout(800);
        await shot('dashboard-together');

        await page.click('.tab-btn-bottom[data-tab="manage"]');
        await page.waitForTimeout(800);
        await shot('dashboard-edit');

        await page.evaluate(() => openGroupEditor());
        await page.waitForTimeout(600);
        await shot('group-editor');

        await page.evaluate(() => closeGroupEditor());
        await page.waitForTimeout(400);
        await page.evaluate(() => toggleProfilePanel());
        await page.waitForTimeout(600);
        await page.evaluate(() => {
            const adv = document.querySelector('button[onclick*="advancedSettings"]');
            if (adv) adv.click();
        });
        await page.waitForTimeout(400);
        await shot('settings-advanced');

        await ctx.close();
    }
    }

    await browser.close();
    srv.close();
    fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
    const issues = report.filter(r => r.overflowsViewport || r.horizOverflow || r.type === 'pageerror');
    console.log(`Done. ${report.filter(r => r.screen).length} screenshots in ${OUT}`);
    console.log(`Screens taller than viewport (scroll needed): ${report.filter(r => r.overflowsViewport).map(r => r.viewport + '/' + r.screen).join(', ') || 'none'}`);
    console.log(`Horizontal overflow: ${report.filter(r => r.horizOverflow).map(r => r.viewport + '/' + r.screen).join(', ') || 'none'}`);
    console.log(`Page errors: ${report.filter(r => r.type === 'pageerror').length}`);
}

run().catch(e => { console.error(e); process.exit(1); });
