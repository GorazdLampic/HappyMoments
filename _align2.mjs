import { chromium } from 'playwright';
const BASE = 'https://nicenumbers.app';
const browser = await chromium.launch();
const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const type = async (s, v) => { await page.click(s); await page.fill(s, v); };
await page.goto(BASE + '/?z=' + Math.random(), { waitUntil: 'networkidle' });
await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
await page.goto(BASE + '/?z=' + Math.random(), { waitUntil: 'networkidle' });
await type('#birthDay', '02'); await type('#birthMonth', '06'); await type('#birthYear', '1978');
await page.click('#startBtn'); await page.waitForTimeout(500);
await page.click('#wizardStep2 .wizard-actions .wizard-btn'); await page.waitForTimeout(300);
await page.click('#wizardStep3 .wizard-actions .wizard-btn'); await page.waitForTimeout(300);
await type('#friendDay', '13'); await type('#friendMonth', '03'); await type('#friendYear', '1990');
await page.evaluate(() => { const n = document.querySelector('#wizardStep4 input[type=text]'); if (n && !n.value) { n.removeAttribute('readonly'); n.value = 'Nastja'; ['input', 'change'].forEach(ev => n.dispatchEvent(new Event(ev, { bubbles: true }))); } });
await page.click('#wizardShowTheirBtn'); await page.waitForTimeout(600);
if (await page.$('#wizardStep5 .wizard-btn')) { await page.click('#wizardStep5 .wizard-btn'); await page.waitForTimeout(600); }
await page.click('#wizardAddMoreBtn6'); await page.waitForTimeout(600);
await page.evaluate(() => { const c = document.getElementById('groupContinueBtn'); if (c) c.click(); });
await page.waitForTimeout(900);
for (let i = 0; i < 6; i++) { await page.evaluate(() => { const b = [...document.querySelectorAll('.wizard-step-active button.wizard-btn')].find(x => x.offsetParent !== null && !x.classList.contains('wizard-btn-secondary')); if (b) b.click(); }); await page.waitForTimeout(500); if (!(await page.evaluate(() => { const o = document.getElementById('onboarding'); return o && !o.classList.contains('hidden'); }))) break; }
await page.waitForTimeout(700);
// helper: normalize (drop spaces)
await page.evaluate(() => { const t = document.querySelector('.tab-btn-bottom[data-tab="together"],.tab-btn-bottom[data-tab="combined"]'); if (t) t.click(); });
await page.waitForTimeout(900);
const res = await page.evaluate(() => {
  const norm = s => String(s).replace(/\s+/g, ' ').trim();
  const list = (typeof _combinedShareList !== 'undefined') ? _combinedShareList : [];
  const out = { checked: 0, mism: [] };
  list.forEach(m => {
    if (!m || m.isCosmic) return; out.checked++;
    const expected = (typeof formatMilestoneValue === 'function') ? formatMilestoneValue(m.value) : m.value.toLocaleString();
    const msg = (typeof generateCombinedShareMessage === 'function') ? generateCombinedShareMessage(m) : '';
    // message should contain the SAME formatted number the row shows
    if (!norm(msg).includes(norm(expected))) out.mism.push({ value: m.value, expected, msg: msg.slice(0, 90) });
  });
  // also verify the row display equals expected
  const rowBad = [];
  [...document.querySelectorAll('.combined-milestone-item')].forEach(item => {
    const sm = (item.getAttribute('onclick') || '').match(/shareCombinedMilestone\((\d+)\)/);
    if (!sm) return; const m = list[+sm[1]]; if (!m || m.isCosmic) return;
    const expected = (typeof formatMilestoneValue === 'function') ? formatMilestoneValue(m.value) : m.value.toLocaleString();
    const shown = norm(item.querySelector('.cmi-value')?.textContent || '');
    if (shown !== norm(expected)) rowBad.push({ shown, expected, value: m.value });
  });
  return { ...out, rowBad };
});
console.log('TOGETHER msg-vs-row: checked=' + res.checked + ' msg-mismatch=' + res.mism.length + ' row-mismatch=' + res.rowBad.length);
res.mism.slice(0, 8).forEach(x => console.log('  MSG expected="' + x.expected + '" msg="' + x.msg + '"'));
res.rowBad.slice(0, 8).forEach(x => console.log('  ROW shown="' + x.shown + '" expected="' + x.expected + '"'));
// SOLO individual message vs row
await page.evaluate(() => { const t = document.querySelector('.tab-btn-bottom[data-tab="me"],.tab-btn-bottom[data-tab="milestones"]'); if (t) t.click(); });
await page.waitForTimeout(800);
const solo = await page.evaluate(() => {
  const norm = s => String(s).replace(/\s+/g, ' ').trim();
  const list = (typeof _homeMilestones !== 'undefined') ? _homeMilestones : [];
  let checked = 0; const mism = [];
  list.forEach(m => {
    if (!m || m.isCosmic) return; checked++;
    const expected = (typeof formatMilestoneValue === 'function') ? formatMilestoneValue(m.value) : m.value.toLocaleString();
    const msg = (typeof generateShareMessage === 'function') ? generateShareMessage(m) : '';
    if (!norm(msg).includes(norm(expected))) mism.push({ value: m.value, expected, msg: msg.slice(0, 90) });
  });
  return { checked, mism };
});
console.log('SOLO msg-vs-row: checked=' + solo.checked + ' msg-mismatch=' + solo.mism.length);
solo.mism.slice(0, 8).forEach(x => console.log('  MSG expected="' + x.expected + '" msg="' + x.msg + '"'));
const total = res.mism.length + res.rowBad.length + solo.mism.length;
console.log('\n=== ALIGNMENT (formatter-consistent): ' + (res.checked + solo.checked) + ' checked, ' + (total === 0 ? 'ALL ALIGNED ✓' : total + ' MISMATCHES ✗') + ' ===');
await browser.close();
