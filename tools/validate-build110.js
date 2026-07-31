// Functional smoke for build 110 changes — loads the real app in Chromium and
// exercises the new code paths (gift design render, number formatting, country
// data, reminder module). Run: node tools/validate-build110.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const WEB = path.join(__dirname, '..', 'web');
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
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', e => pageErrors.push(e.message));
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });

    const r = await page.evaluate(async () => {
        const out = {};
        // #5/#7 number formatting
        out.plain_123456 = formatMilestoneValuePlain(123456);              // expect "123456"
        out.longUnit = displayNumberAndUnit(52525252, 'minutes');          // expect unit "min"
        out.shortNum = displayNumberAndUnit(5000, 'days');                 // expect unit "days" (not long)
        // #1 gift design renders without throwing, honours numberText + custom
        try {
            const c = generateGiftDesign({ value: 123456, unitName: 'hours', eventName: 'Test' }, 'mug',
                { theme: 'dark', message: 'hi', custom: 'Made with love', numberText: '123456', unitText: 'light-years' });
            out.giftCanvas = { w: c.width, h: c.height };
        } catch (e) { out.giftError = e.message; }
        // #3 logo preloads (same-origin, so it renders into the print without tainting)
        out.logoLoaded = await (typeof ensureGiftLogo === 'function' ? ensureGiftLogo() : Promise.resolve(false));
        // #2 countries + states
        out.countryCount = (typeof SHIPPING_COUNTRIES !== 'undefined') ? SHIPPING_COUNTRIES.length : -1;
        out.hasUSStates = (typeof COUNTRY_STATES !== 'undefined') && Array.isArray(COUNTRY_STATES.US) && COUNTRY_STATES.US.length > 0;
        out.stateCountries = (typeof COUNTRY_STATES !== 'undefined') ? Object.keys(COUNTRY_STATES) : [];
        // #2 State field behaviour (inject a minimal country/state DOM)
        try {
            const host = document.createElement('div');
            host.innerHTML = '<select id="shipCountry"><option value="US">US</option><option value="SI">SI</option></select><div id="shipStateGroup" style="display:none;"></div>';
            document.body.appendChild(host);
            const sel = host.querySelector('#shipCountry');
            sel.value = 'US'; _updateStateField();
            out.stateForUS = !!document.getElementById('shipState') && document.getElementById('shipStateGroup').style.display !== 'none';
            sel.value = 'SI'; _updateStateField();
            out.stateForSI = !document.getElementById('shipState');
            host.remove();
        } catch (e) { out.stateErr = e.message; }
        // #4 reminder module
        out.notifDefaults = (typeof NOTIF !== 'undefined') ? NOTIF.getPrefs() : null;
        out.notifApi = (typeof NOTIF !== 'undefined') && typeof NOTIF.scheduleMilestoneNotifications === 'function';
        // #3 celestial toggle present + gated
        out.cosmicToggle = !!document.querySelector('[data-pattern="cosmic"]');
        return out;
    });

    const checks = [
        ['#5 plain number has no commas', r.plain_123456 === '123456', r.plain_123456],
        ['#7 long number → short unit "min"', r.longUnit && r.longUnit.unit === 'min', JSON.stringify(r.longUnit)],
        ['#7 short number keeps full unit', r.shortNum && r.shortNum.unit === 'days', JSON.stringify(r.shortNum)],
        ['#1 gift design renders (with editable unit)', r.giftCanvas && r.giftCanvas.w > 0 && !r.giftError, JSON.stringify(r.giftCanvas || r.giftError)],
        ['#3 gift logo image loads', r.logoLoaded === true, r.logoLoaded],
        ['#2 full country list (>200)', r.countryCount > 200, r.countryCount],
        ['#2 US states present', r.hasUSStates === true, JSON.stringify(r.stateCountries)],
        ['#2 State dropdown appears for US', r.stateForUS === true, r.stateErr || r.stateForUS],
        ['#2 no State dropdown for SI', r.stateForSI === true, r.stateErr || r.stateForSI],
        ['#4 reminders default OFF, no hourly flags', r.notifDefaults && r.notifDefaults.enabled === false && !('hourBefore' in r.notifDefaults), JSON.stringify(r.notifDefaults)],
        ['#4 reminder API present', r.notifApi === true, r.notifApi],
        ['#3 celestial toggle in DOM', r.cosmicToggle === true, r.cosmicToggle],
        ['no page errors on load', pageErrors.length === 0, pageErrors.join('; ')],
    ];

    let failed = 0;
    checks.forEach(([name, ok, detail]) => {
        console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '   → ' + detail}`);
        if (!ok) failed++;
    });

    await browser.close();
    srv.close();
    if (failed) { console.error(`\n${failed} check(s) failed`); process.exit(1); }
    console.log('\nvalidate-build110: all checks passed');
})();
