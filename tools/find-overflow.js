// Measure document-level horizontal overflow magnitude + deepest non-fixed offender
// on the group editor (3-member fixture). Run: node tools/find-overflow.js ko
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const WEB = path.join(__dirname, '..', 'web');
const PORT = 8767;
const LOCALE = process.argv[2] || 'ko';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };

const srv = http.createServer((req, res) => {
    let p = req.url.split('?')[0];
    if (p === '/') p = '/index.html';
    const file = path.join(WEB, decodeURIComponent(p));
    if (!file.startsWith(WEB) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
});

async function measure(page, label) {
    const r = await page.evaluate(() => {
        const doc = document.documentElement;
        const vw = doc.clientWidth;
        const sw = doc.scrollWidth;
        let widest = null;
        document.querySelectorAll('*').forEach(el => {
            const b = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            if (cs.position === 'fixed' || b.width === 0) return;
            if (b.right > vw + 0.5 && (!widest || b.right > widest.right)) {
                widest = { tag: el.tagName, cls: String(el.className || '').slice(0, 45), right: Math.round(b.right * 10) / 10, w: Math.round(b.width), txt: (el.textContent || '').trim().slice(0, 25) };
            }
        });
        return { vw, sw, overflow: sw - vw, widest };
    });
    console.log(`[${label}] vw=${r.vw} scrollW=${r.sw} overflow=${r.overflow}px`, r.widest ? `| widest: ${r.widest.tag}.${r.widest.cls} right=${r.widest.right} "${r.widest.txt}"` : '| no non-fixed offender');
}

(async () => {
    await new Promise(r => srv.listen(PORT, r));
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page.evaluate(l => {
        localStorage.clear();
        localStorage.setItem('happymoments_locale', l);
        const d = { events: [
            {name:'Me', date:'1978-06-02', type:'birthday'},
            {name:'Nastja', date:'1990-03-13', type:'birthday'},
            {name:'V', date:'2012-07-07', type:'birthday'} ],
            groups: [{ name:'Family', memberIds:[0,1,2] }], activeGroup:0, settings: {} };
        try { localStorage.setItem('happymoments_data', JSON.stringify(d)); } catch(e){}
    }, LOCALE);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    await page.evaluate(() => switchTab && switchTab('manage'));
    await page.waitForTimeout(500);
    await measure(page, LOCALE + ' edit-tab');
    // open the group editor via the pencil/edit control on the group card
    await page.evaluate(() => { const b = document.querySelector('[onclick*="ditGroup"],[onclick*="penGroupEditor"],.group-edit-btn'); if (b) b.click(); });
    await page.waitForTimeout(500);
    await measure(page, LOCALE + ' group-editor');
    await browser.close();
    srv.close();
})();
