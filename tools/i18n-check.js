// i18n validator — run: node tools/i18n-check.js
// Gates: key parity vs en, placeholder integrity, length budget, leftover English.
// Exit 1 on errors (missing/extra keys, placeholder mismatch); warnings don't fail.
const path = require('path');
const { I18N } = require(path.join(__dirname, '..', 'web', 'i18n.js'));

const T = I18N.TRANSLATIONS;
const EN = T.en;
const enKeys = Object.keys(EN);
const DEFERRED = ['ar']; // RTL release pending — parity not enforced yet
// CJK/Thai render shorter; length budget does not apply
const NO_LENGTH_CHECK = ['zh', 'ja', 'ko', 'th'];
// Strings allowed to remain identical to English everywhere
const SHARED_OK = /^(OK.*|HappyMoments.*|Premium|Google|Outlook|WhatsApp|Viber|Email|\.ics|\d+.*|Solo|.{1,3})$/;

const placeholders = s => (String(s).match(/\{[a-zA-Z_]+\}/g) || []).sort().join(',');

let errors = 0, warnings = 0;
for (const loc of Object.keys(T)) {
    if (loc === 'en' || DEFERRED.includes(loc)) continue;
    const L = T[loc];
    const missing = enKeys.filter(k => !(k in L));
    const extra = Object.keys(L).filter(k => !(k in EN));
    if (missing.length) { errors++; console.log(`ERROR ${loc}: ${missing.length} missing keys: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? '…' : ''}`); }
    if (extra.length) { errors++; console.log(`ERROR ${loc}: ${extra.length} extra keys: ${extra.slice(0, 8).join(', ')}`); }

    for (const k of enKeys) {
        if (!(k in L)) continue;
        if (placeholders(EN[k]) !== placeholders(L[k])) {
            errors++; console.log(`ERROR ${loc}.${k}: placeholder mismatch — en[${placeholders(EN[k])}] vs [${placeholders(L[k])}]`);
        }
        if (!NO_LENGTH_CHECK.includes(loc) && String(L[k]).length > Math.max(20, String(EN[k]).length * 1.6)) {
            warnings++; console.log(`WARN  ${loc}.${k}: ${String(L[k]).length} chars vs en ${String(EN[k]).length} — may overflow layout`);
        }
        if (String(L[k]) === String(EN[k]) && !SHARED_OK.test(String(EN[k]))) {
            warnings++; console.log(`WARN  ${loc}.${k}: identical to English ("${String(EN[k]).slice(0, 40)}")`);
        }
    }

    // Plural tables: required once translation phase fills them
    const P = I18N.PLURALS[loc];
    if (!P) { warnings++; console.log(`WARN  ${loc}: no plural table (falls back to English forms)`); }
}

console.log(`\n${errors} error group(s), ${warnings} warning(s) across ${Object.keys(T).length - 1 - DEFERRED.length} checked locales (ar deferred).`);
process.exit(errors ? 1 : 0);
