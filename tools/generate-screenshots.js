#!/usr/bin/env node
/**
 * HappyMoments — Automated Screenshot Generator
 * Generates Play Store screenshots (1080x1920) and OG image (1200x630).
 *
 * Usage: node tools/generate-screenshots.js
 * Output: screenshots/ directory
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://happymoments.app';
const LANDING_URL = 'https://happymoments.app/landing.html';
const OG_URL = 'file:///' + path.join(__dirname, '..', 'web', 'og-image.html').replace(/\\/g, '/');

const OUT_DIR = path.join(__dirname, '..', 'screenshots');

const PHONE = { width: 411, height: 731, deviceScaleFactor: 2.625 };
const OG = { width: 1200, height: 630, deviceScaleFactor: 1 };
const FEATURE = { width: 1024, height: 500, deviceScaleFactor: 1 };

const SAMPLE_DATA = JSON.stringify({
    sets: [{
        name: 'My People',
        events: [
            { id: 'demo1', name: 'You', date: '1993-07-15', type: 'birthday' },
            { id: 'demo2', name: 'Mom', date: '1965-03-22', type: 'birthday' },
            { id: 'demo3', name: 'Partner', date: '1995-01-20', type: 'birthday' },
            { id: 'demo4', name: 'Child', date: '2020-06-10', type: 'birthday' }
        ],
        groups: [{ name: 'Family', memberIds: ['demo1', 'demo3', 'demo4'] }]
    }]
});

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Inject localStorage BEFORE the page JS runs by using page.evaluateOnNewDocument
async function setupAppState(page, opts = {}) {
    const { clearData, injectData, skipWizard } = opts;
    await page.evaluateOnNewDocument((data, skip, clear) => {
        if (clear) {
            localStorage.clear();
            sessionStorage.clear();
        }
        if (skip) {
            localStorage.setItem('happymoments_wizard_done', 'true');
            localStorage.setItem('happymoments_consent', 'true');
            localStorage.setItem('happymoments_consent_date', new Date().toISOString());
        }
        if (data) {
            localStorage.setItem('happymoments_data', data);
        }
    }, injectData || null, skipWizard || false, clearData || false);
}

async function main() {
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    console.log('\nHappyMoments Screenshot Generator');
    console.log('==================================\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files'],
        defaultViewport: null,
    });

    try {
        // ── 1. Onboarding (fresh state, no consent banner) ──
        await capture(browser, '01-onboarding', PHONE, async (page) => {
            await setupAppState(page, { clearData: true });
            // Accept consent via evaluateOnNewDocument so banner doesn't show
            await page.evaluateOnNewDocument(() => {
                localStorage.setItem('happymoments_consent', 'true');
                localStorage.setItem('happymoments_consent_date', new Date().toISOString());
            });
            await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
            await sleep(2000);
        });

        // ── 2. Wizard Preferences screen ──
        await capture(browser, '02-preferences', PHONE, async (page) => {
            await setupAppState(page, { clearData: true });
            await page.evaluateOnNewDocument(() => {
                localStorage.setItem('happymoments_consent', 'true');
                localStorage.setItem('happymoments_consent_date', new Date().toISOString());
            });
            await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
            await sleep(2000);
            // Click "Let's find out" button to advance
            await page.evaluate(() => {
                const btn = document.getElementById('startBtn') || document.querySelector('.wizard-btn-primary');
                if (btn) btn.click();
            });
            await sleep(1500);
        });

        // ── 3. Personal milestones (with data, wizard done) ──
        await capture(browser, '03-personal-milestones', PHONE, async (page) => {
            await setupAppState(page, { clearData: true, injectData: SAMPLE_DATA, skipWizard: true });
            await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
            await sleep(3000);
        });

        // ── 4. Scroll down to see milestone cards ──
        await capture(browser, '04-milestone-cards', PHONE, async (page) => {
            await setupAppState(page, { clearData: true, injectData: SAMPLE_DATA, skipWizard: true });
            await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
            await sleep(3000);
            // Scroll down to milestone content
            await page.evaluate(() => {
                const cards = document.querySelector('.person-column, .milestone-card, .cm-card, #personalContent');
                if (cards) cards.scrollIntoView({ behavior: 'instant', block: 'start' });
                else window.scrollBy(0, 500);
            });
            await sleep(500);
        });

        // ── 5. Team tab ──
        await capture(browser, '05-team-tab', PHONE, async (page) => {
            await setupAppState(page, { clearData: true, injectData: SAMPLE_DATA, skipWizard: true });
            await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
            await sleep(2000);
            // Click Team tab
            await page.evaluate(() => {
                const tabs = document.querySelectorAll('.tab-btn');
                for (const tab of tabs) {
                    if (tab.textContent.includes('Team') || tab.dataset.tab === 'team') {
                        tab.click();
                        break;
                    }
                }
            });
            await sleep(2000);
        });

        // ── 6. Settings / language picker ──
        await capture(browser, '06-settings', PHONE, async (page) => {
            await setupAppState(page, { clearData: true, injectData: SAMPLE_DATA, skipWizard: true });
            await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
            await sleep(2000);
            await page.evaluate(() => {
                const tabs = document.querySelectorAll('.tab-btn');
                for (const tab of tabs) {
                    if (tab.textContent.includes('Settings') || tab.dataset.tab === 'settings') {
                        tab.click();
                        break;
                    }
                }
            });
            await sleep(2000);
        });

        // ── 7. Landing page — "When's Your Billion?" ──
        await capture(browser, '07-whens-your-billion', PHONE, async (page) => {
            await page.goto(LANDING_URL, { waitUntil: 'networkidle2', timeout: 30000 });
            await sleep(2000);
        });

        // ── 8. Landing page with result ──
        await capture(browser, '08-billion-result', PHONE, async (page) => {
            await page.goto(LANDING_URL, { waitUntil: 'networkidle2', timeout: 30000 });
            await sleep(1500);
            // Type a birthday and calculate
            await page.evaluate(() => {
                const inputs = document.querySelectorAll('input[type="number"], input[inputmode="numeric"]');
                if (inputs.length >= 3) {
                    inputs[0].value = '15'; inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
                    inputs[1].value = '07'; inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
                    inputs[2].value = '1993'; inputs[2].dispatchEvent(new Event('input', { bubbles: true }));
                }
                // Also try by ID
                const d = document.getElementById('day'); if (d) { d.value = '15'; d.dispatchEvent(new Event('input', { bubbles: true })); }
                const m = document.getElementById('month'); if (m) { m.value = '07'; m.dispatchEvent(new Event('input', { bubbles: true })); }
                const y = document.getElementById('year'); if (y) { y.value = '1993'; y.dispatchEvent(new Event('input', { bubbles: true })); }
            });
            await sleep(300);
            await page.evaluate(() => {
                const btn = document.querySelector('button');
                if (btn) btn.click();
            });
            await sleep(2000);
            // Scroll to results
            await page.evaluate(() => {
                const result = document.getElementById('result') || document.querySelector('.result, .billion-result');
                if (result) result.scrollIntoView({ behavior: 'instant', block: 'start' });
            });
            await sleep(500);
        });

        // ── OG Image (from local HTML) ──
        await capture(browser, 'og-image', OG, async (page) => {
            await page.goto(OG_URL, { waitUntil: 'networkidle2', timeout: 30000 });
            await sleep(3000);
            // Screenshot just the card element
            const card = await page.$('.card');
            if (card) {
                await card.screenshot({ path: path.join(OUT_DIR, 'og-image.png') });
                console.log('  -> Cropped to .card element');
            }
        });

        // ── Feature Graphic (1024x500 from same template) ──
        await capture(browser, 'feature-graphic', FEATURE, async (page) => {
            await page.goto(OG_URL, { waitUntil: 'networkidle2', timeout: 30000 });
            await sleep(3000);
        });

        console.log(`\n${'='.repeat(40)}`);
        console.log(`  Screenshots: ${OUT_DIR}`);
        console.log(`${'='.repeat(40)}\n`);

    } finally {
        await browser.close();
    }
}

async function capture(browser, name, viewport, setupFn) {
    const page = await browser.newPage();
    await page.setViewport(viewport);
    page.on('console', () => {});
    page.on('pageerror', () => {});

    try {
        await setupFn(page);
        const filepath = path.join(OUT_DIR, `${name}.png`);
        // Don't overwrite if element-level screenshot was already saved (og-image)
        if (!fs.existsSync(filepath) || name !== 'og-image') {
            await page.screenshot({ path: filepath, fullPage: false });
        }
        const size = (fs.statSync(filepath).size / 1024).toFixed(0);
        console.log(`  Captured: ${name}.png (${size} KB)`);
    } catch (err) {
        console.error(`  FAILED: ${name} — ${err.message}`);
    } finally {
        await page.close();
    }
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
