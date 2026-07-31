// qa-explore.js — exploratory QA: drives the real app as 10 different users,
// captures JS errors, checks milestone rendering, and exercises gift/support/
// share/settings. Output: screenshots/qa/*.png + a console report.
// Run: node tools/qa-explore.js
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const WEB = path.join(__dirname, '..', 'web');
const OUT = path.join(__dirname, '..', 'screenshots', 'qa');
const PORT = 8772;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
function serve() { return new Promise(r => { const s = http.createServer((req, res) => { let p = req.url.split('?')[0]; if (p === '/') p = '/index.html'; const f = path.join(WEB, p); if (!f.startsWith(WEB) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('nf'); return; } res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); }); s.listen(PORT, () => r(s)); }); }

// 10 profiles chosen to trigger different milestone landscapes.
const PROFILES = [
  { n: '01-baby',        d: '15', m: '02', y: '2026', note: 'baby ~5mo (edge: few milestones)' },
  { n: '02-toddler',     d: '10', m: '01', y: '2024', note: 'toddler ~2.5y' },
  { n: '03-child',       d: '06', m: '06', y: '2016', note: 'child ~10y' },
  { n: '04-teen',        d: '11', m: '11', y: '2010', note: 'teen ~15y' },
  { n: '05-near10kdays', d: '15', m: '03', y: '1999', note: '~27y near 10,000 days' },
  { n: '06-nearBillion', d: '05', m: '12', y: '1994', note: '~31y near 1 billion seconds' },
  { n: '07-midlife',     d: '02', m: '02', y: '1976', note: '50y' },
  { n: '08-elderly',     d: '20', m: '08', y: '1940', note: '85y (Saturn returns, big numbers)' },
  { n: '09-leapday',     d: '29', m: '02', y: '1996', note: 'leap-day (edge)' },
  { n: '10-lucky8',      d: '08', m: '08', y: '1988', note: '08/08/88 (lucky 8s)' },
];

const report = [];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serve();
  const browser = await chromium.launch();

  for (const prof of PROFILES) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('PAGEERROR: ' + String(e).split('\n')[0]));
    page.on('console', m => { if (m.type() === 'error') { const t = m.text(); if (!/\/api\/|Failed to load resource|501|404|net::/.test(t)) errors.push('CONSOLE: ' + t.slice(0, 140)); } });
    const rec = { profile: prof.n, note: prof.note, errors, milestones: [], notes: [] };
    try {
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await page.fill('#birthDay', prof.d); await page.fill('#birthMonth', prof.m); await page.fill('#birthYear', prof.y);
      await page.click('#startBtn');
      await page.waitForTimeout(4000); // reveal animation
      await page.screenshot({ path: path.join(OUT, prof.n + '-reveal.png') });
      // Extract the milestone lines shown on the reveal
      rec.milestones = await page.evaluate(() => {
        const els = document.querySelectorAll('.wizard-milestone-value, .wizard-reveal-number, .tc-value');
        return Array.from(els).map(e => e.textContent.trim()).filter(Boolean).slice(0, 12);
      });
      if (rec.milestones.length === 0) rec.notes.push('no milestone lines found on reveal');
    } catch (e) { rec.notes.push('flow error: ' + e.message.split('\n')[0]); }
    report.push(rec);
    await ctx.close();
  }

  // ── Deep flow on one rich profile: dashboard + gift + support + share + settings
  const deep = { profile: 'DEEP-05', errors: [], notes: [] };
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', e => deep.errors.push('PAGEERROR: ' + String(e).split('\n')[0]));
  page.on('console', m => { if (m.type() === 'error') { const t = m.text(); if (!/\/api\/|Failed to load resource|501|404|net::/.test(t)) deep.errors.push('CONSOLE: ' + t.slice(0, 140)); } });
  const step = async (label, fn) => { try { await fn(); deep.notes.push('OK ' + label); } catch (e) { deep.notes.push('FAIL ' + label + ': ' + e.message.split('\n')[0]); } };
  try {
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(500);
    // onboarding to dashboard (mirrors screenshot-tour path)
    await page.fill('#birthDay', '15'); await page.fill('#birthMonth', '03'); await page.fill('#birthYear', '1999');
    await page.click('#startBtn'); await page.waitForTimeout(3800);
    await step('screen2 -> more', async () => { await page.click('#wizardStep2 .wizard-actions .wizard-btn'); await page.waitForTimeout(500); });
    await step('screen3 -> add person', async () => { await page.click('#wizardStep3 .wizard-actions .wizard-btn'); await page.waitForTimeout(400); });
    await step('add friend', async () => { await page.click('#friendNameField'); await page.fill('#friendNameField', 'Ana'); await page.fill('#friendDay', '13'); await page.fill('#friendMonth', '03'); await page.fill('#friendYear', '1990'); await page.click('#wizardShowTheirBtn'); await page.waitForTimeout(3600); });
    await step('to combined', async () => { await page.click('#wizardStep5 .wizard-actions .wizard-btn'); await page.waitForTimeout(1000); });
    await step('exit to dashboard', async () => {
      // try a few known dashboard exits
      const sels = ['#wizardDashboardBtn8', '#wizardStep6 .wizard-btn', 'button[onclick*="finishWizard"]', 'button[onclick*="goToDashboard"]'];
      for (const s of sels) { const el = await page.$(s); if (el) { await el.click(); break; } }
      await page.waitForTimeout(1200);
    });
    // Force dashboard render regardless of wizard state
    await step('render dashboard', async () => { await page.evaluate(() => { try { if (typeof showMainApp === 'function') showMainApp(); } catch(e){} try { renderMilestonesTab(); } catch(e){} }); await page.waitForTimeout(600); });
    await page.screenshot({ path: path.join(OUT, 'deep-dashboard.png') });
    deep.dashMilestones = await page.evaluate(() => Array.from(document.querySelectorAll('.tc-value')).map(e => e.textContent.trim()).slice(0, 12));
    await step('share (no crash on web path)', async () => { await page.evaluate(() => { const m = (window.allMilestonesFlat || [])[0]; if (m && typeof shareMilestone === 'function') shareMilestone(m); }); await page.waitForTimeout(400); });
    await step('open gift modal', async () => { await page.evaluate(() => openGiftOrder('mug', 10000, 'days', 'Me')); await page.waitForTimeout(600); });
    await page.screenshot({ path: path.join(OUT, 'deep-gift.png') });
    await step('close gift', async () => { await page.evaluate(() => { const m = document.getElementById('giftOrderModal'); if (m) m.remove(); }); });
    await step('open support modal', async () => { await page.evaluate(() => openSupportModal()); await page.waitForTimeout(400); });
    await page.screenshot({ path: path.join(OUT, 'deep-support.png') });
    await step('close support', async () => { await page.evaluate(() => { const m = document.getElementById('supportModal'); if (m) m.remove(); }); });
    await step('open settings', async () => { await page.evaluate(() => toggleProfilePanel()); await page.waitForTimeout(500); await page.evaluate(() => { const a = document.querySelector('button[onclick*="advancedSettings"]'); if (a) a.click(); }); await page.waitForTimeout(300); });
    await page.screenshot({ path: path.join(OUT, 'deep-settings.png') });
    deep.settingsToggles = await page.evaluate(() => Array.from(document.querySelectorAll('[data-pattern]')).map(e => e.dataset.pattern));
  } catch (e) { deep.notes.push('deep flow error: ' + e.message.split('\n')[0]); }
  report.push(deep);
  await ctx.close();

  await browser.close(); srv.close();
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));

  // Print summary
  console.log('\n=== QA EXPLORE SUMMARY ===');
  let totalErr = 0;
  for (const r of report) {
    const errs = r.errors || [];
    totalErr += errs.length;
    console.log(`\n[${r.profile}] ${r.note || ''}`);
    if (r.milestones) console.log('  milestones:', r.milestones.slice(0, 6).join(' | ') || '(none)');
    if (r.dashMilestones) console.log('  dashboard:', r.dashMilestones.slice(0, 6).join(' | ') || '(none)');
    if (r.settingsToggles) console.log('  toggles:', r.settingsToggles.join(', '));
    if (r.notes && r.notes.length) r.notes.forEach(n => console.log('  · ' + n));
    if (errs.length) errs.forEach(e => console.log('  !! ' + e)); else console.log('  errors: none');
  }
  console.log(`\nTOTAL JS ERRORS ACROSS ALL PROFILES: ${totalErr}`);
})();
