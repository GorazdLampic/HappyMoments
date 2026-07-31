/**
 * Regenerate the SHIPPING_COUNTRIES list + COUNTRY_STATES map in web/giftStore.js
 * from Printful's authoritative /countries API. Run manually when Printful's
 * catalogue changes:  node tools/gen-shipping-countries.js
 *
 * Keeps the data INLINE in giftStore.js (no new file / build.js / index.html
 * changes) and free of hand-typos. Only the SHIPPING_COUNTRIES / COUNTRY_STATES
 * blocks are rewritten; everything else in giftStore.js is untouched.
 */
const fs = require('fs');
const path = require('path');

// Common destinations pinned to the top (in this order); the rest follow alphabetically.
const PINNED = ['US','GB','DE','FR','IT','ES','NL','BE','AT','CH','SI','HR','IE','PT',
    'SE','DK','NO','FI','PL','CZ','HU','GR','RO','SK','CA','AU','NZ','JP','KR','SG',
    'AE','BR','MX','IN','ZA'];

async function main() {
    const res = await fetch('https://api.printful.com/countries');
    const json = await res.json();
    const all = json.result || [];

    const byCode = {};
    all.forEach(c => { byCode[c.code] = c; });

    const pinned = PINNED.filter(code => byCode[code]).map(code => byCode[code]);
    const rest = all
        .filter(c => !PINNED.includes(c.code))
        .sort((a, b) => a.name.localeCompare(b.name));
    const ordered = [...pinned, ...rest];

    const esc = s => String(s).replace(/'/g, "\\'");
    const countryLines = ordered
        .map(c => `    { code: '${c.code}', name: '${esc(c.name)}' }`)
        .join(',\n');

    // States: only countries Printful returns a states list for (US/CA/AU/JP/BR).
    const withStates = all.filter(c => Array.isArray(c.states) && c.states.length);
    const stateBlocks = withStates.map(c => {
        const states = c.states
            .map(s => `{ code: '${esc(s.code)}', name: '${esc(s.name)}' }`)
            .join(', ');
        return `    ${c.code}: [${states}]`;
    }).join(',\n');

    const block =
`// Shipping destinations — the full Printful /countries list (regenerate with
// tools/gen-shipping-countries.js). Common destinations pinned first.
const SHIPPING_COUNTRIES = [
${countryLines}
];

// Countries where Printful REQUIRES a state/province code. The gift form shows a
// State dropdown for these and forwards state_code to the order.
const COUNTRY_STATES = {
${stateBlocks}
};`;

    const file = path.join(__dirname, '..', 'web', 'giftStore.js');
    let src = fs.readFileSync(file, 'utf8');
    const re = /\/\/ (?:Country list for shipping|Shipping destinations)[\s\S]*?const SHIPPING_COUNTRIES = \[[\s\S]*?\];(?:\s*\/\/[\s\S]*?const COUNTRY_STATES = \{[\s\S]*?\};)?/;
    if (!re.test(src)) throw new Error('SHIPPING_COUNTRIES block not found in giftStore.js');
    src = src.replace(re, block);
    fs.writeFileSync(file, src, 'utf8');
    console.log(`Wrote ${ordered.length} countries + ${withStates.length} state-lists to web/giftStore.js`);
}

main().catch(e => { console.error(e); process.exit(1); });
