// i18n merge tool — translation pipeline plumbing.
//
//   node tools/i18n-merge.js --export   write web/l10n/en.reference.json + <locale>.current.json dumps
//   node tools/i18n-merge.js            merge web/l10n/<locale>.json files into i18n.js + shareMessages.js
//
// Translator/critic agents edit ONLY web/l10n/<locale>.json:
//   { "locale": "de", "translations": {...}, "plurals": {...},
//     "shareMessages": {category: [...]}|null, "shareLink": "..."|null, "dateFallback": "..."|null }
// Merge regenerates the marked blocks (I18N-MERGE:BEGIN/END) from required data + JSON overlays,
// so re-running is idempotent and never loses existing locales (incl. deferred ar).
const fs = require('fs');
const path = require('path');

const WEB = path.join(__dirname, '..', 'web');
const L10N = path.join(WEB, 'l10n');
const { I18N } = require(path.join(WEB, 'i18n.js'));
const SM = require(path.join(WEB, 'shareMessages.js'));

const T = I18N.TRANSLATIONS;
const EN_KEYS = Object.keys(T.en);
const LOCALES = Object.keys(T).filter(l => l !== 'en'); // includes ar (preserved as-is)

function jsStr(s) { return JSON.stringify(String(s)); }
function key(k) { return /^[A-Za-z_][A-Za-z0-9_]*$/.test(k) ? k : JSON.stringify(k); }

if (process.argv.includes('--export')) {
    fs.mkdirSync(L10N, { recursive: true });
    const shareExamples = {};
    for (const cat of Object.keys(SM.SHARE_MESSAGES)) shareExamples[cat] = SM.SHARE_MESSAGES[cat].slice(0, 3);
    fs.writeFileSync(path.join(L10N, 'en.reference.json'), JSON.stringify({
        translations: T.en,
        plurals: I18N.PLURALS.en,
        shareCategories: Object.keys(SM.SHARE_MESSAGES),
        shareExamples,
        shareLink: SM.APP_SHARE_LINK_I18N.en,
        dateFallback: SM.SHARE_DATE_FALLBACK_I18N.en
    }, null, 2));
    for (const loc of LOCALES) {
        fs.writeFileSync(path.join(L10N, loc + '.current.json'), JSON.stringify(T[loc], null, 2));
    }
    console.log(`Exported en.reference.json (${EN_KEYS.length} keys) + ${LOCALES.length} current dumps to web/l10n/`);
    process.exit(0);
}

// ---- merge mode ----
const overlays = {};
for (const f of fs.existsSync(L10N) ? fs.readdirSync(L10N) : []) {
    const m = f.match(/^([a-z_A-Z]+)\.json$/);
    if (!m || f.endsWith('.current.json') || f === 'en.reference.json') continue;
    const data = JSON.parse(fs.readFileSync(path.join(L10N, f), 'utf8'));
    const loc = data.locale || m[1];
    if (loc === 'en') continue;
    overlays[loc] = data;
}
console.log('Overlays found:', Object.keys(overlays).join(', ') || '(none)');

let problems = 0;
function mergedTranslations(loc) {
    const cur = T[loc] || {};
    const ov = (overlays[loc] && overlays[loc].translations) || {};
    const extra = Object.keys(ov).filter(k => !EN_KEYS.includes(k));
    if (extra.length) { problems++; console.log(`WARN ${loc}: dropping ${extra.length} extra keys: ${extra.slice(0, 5).join(', ')}`); }
    const out = {};
    for (const k of EN_KEYS) {
        if (k in ov) out[k] = ov[k];
        else if (k in cur) out[k] = cur[k];
        // else: stays missing — i18n-check reports it
    }
    if (overlays[loc]) {
        const missing = EN_KEYS.filter(k => !(k in out));
        if (missing.length) { problems++; console.log(`WARN ${loc}: still missing ${missing.length} keys after overlay`); }
    }
    return out;
}

function localeBlock(loc, obj, indent) {
    const pad = ' '.repeat(indent), pad2 = ' '.repeat(indent + 4);
    const lines = Object.keys(obj).map(k => `${pad2}${key(k)}: ${jsStr(obj[k])},`);
    return `${pad}${key(loc)}: {\n${lines.join('\n')}\n${pad}},`;
}

function pluralBlock(loc, table, indent) {
    const pad = ' '.repeat(indent), pad2 = ' '.repeat(indent + 4);
    const lines = Object.keys(table).map(n => {
        const forms = table[n];
        const inner = Object.keys(forms).map(c => `${c}: ${jsStr(forms[c])}`).join(', ');
        return `${pad2}${key(n)}: { ${inner} },`;
    });
    return `${pad}${key(loc)}: {\n${lines.join('\n')}\n${pad}},`;
}

function replaceBetween(src, beginTag, endTag, replacement, file) {
    const b = src.indexOf(beginTag), e = src.indexOf(endTag);
    if (b === -1 || e === -1 || e < b) { console.error(`FATAL: markers ${beginTag} not found in ${file}`); process.exit(1); }
    const lineEnd = src.indexOf('\n', b);
    return src.slice(0, lineEnd + 1) + replacement + src.slice(src.lastIndexOf('\n', e) + 1);
}

// i18n.js
let i18nSrc = fs.readFileSync(path.join(WEB, 'i18n.js'), 'utf8');
const tBlocks = LOCALES.map(loc => localeBlock(loc, mergedTranslations(loc), 8)).join('\n\n');
i18nSrc = replaceBetween(i18nSrc, 'I18N-MERGE:BEGIN-LOCALES', 'I18N-MERGE:END-LOCALES', tBlocks + '\n', 'i18n.js');

const pluralLocales = {};
for (const loc of LOCALES) {
    const ov = overlays[loc] && overlays[loc].plurals;
    const cur = I18N.PLURALS[loc];
    if (ov || cur) pluralLocales[loc] = ov || cur;
}
const pBlocks = Object.keys(pluralLocales).map(loc => pluralBlock(loc, pluralLocales[loc], 8)).join('\n');
i18nSrc = replaceBetween(i18nSrc, 'I18N-MERGE:BEGIN-PLURALS', 'I18N-MERGE:END-PLURALS', pBlocks + '\n', 'i18n.js');
fs.writeFileSync(path.join(WEB, 'i18n.js'), i18nSrc);

// shareMessages.js
const links = { ...SM.APP_SHARE_LINK_I18N };
const fallbacks = { ...SM.SHARE_DATE_FALLBACK_I18N };
const msgs = JSON.parse(JSON.stringify(SM.SHARE_MESSAGES_I18N));
for (const loc of Object.keys(overlays)) {
    const ov = overlays[loc];
    const base = loc.split('_')[0];
    if (ov.shareMessages) msgs[base] = ov.shareMessages;
    if (ov.shareLink) links[base] = ov.shareLink;
    if (ov.dateFallback) fallbacks[base] = ov.dateFallback;
}
function flatObj(name, obj) {
    const lines = Object.keys(obj).map(k => `    ${key(k)}: ${jsStr(obj[k])},`);
    return `const ${name} = {\n${lines.join('\n')}\n};`;
}
function msgsObj(obj) {
    const langs = Object.keys(obj).map(lang => {
        const cats = Object.keys(obj[lang]).map(cat => {
            const arr = obj[lang][cat].map(s => `            ${jsStr(s)},`).join('\n');
            return `        ${key(cat)}: [\n${arr}\n        ],`;
        }).join('\n');
        return `    ${key(lang)}: {\n${cats}\n    },`;
    }).join('\n');
    return `const SHARE_MESSAGES_I18N = {\n${langs}\n};`;
}
let smSrc = fs.readFileSync(path.join(WEB, 'shareMessages.js'), 'utf8');
const smGen = [
    '// Per-language app link suffix appended to share messages',
    flatObj('APP_SHARE_LINK_I18N', links),
    '',
    '// Fallback text appended when a template has no {date}/{countdown} placeholder',
    flatObj('SHARE_DATE_FALLBACK_I18N', fallbacks),
    '',
    msgsObj(msgs)
].join('\n');
smSrc = replaceBetween(smSrc, 'I18N-MERGE:BEGIN-SHARE', 'I18N-MERGE:END-SHARE', smGen + '\n', 'shareMessages.js');
fs.writeFileSync(path.join(WEB, 'shareMessages.js'), smSrc);

// self-check: both files must still parse and expose the same shape
const { execSync } = require('child_process');
execSync(`node --check "${path.join(WEB, 'i18n.js')}"`);
execSync(`node --check "${path.join(WEB, 'shareMessages.js')}"`);
console.log(`Merged ${Object.keys(overlays).length} overlay(s); ${problems} warning(s); syntax OK. Run tools/i18n-check.js for the full gate.`);
