/**
 * native-contract.js — static guard against the two regression classes that
 * repeatedly broke the Android app (web worked, native didn't):
 *
 *   1. A relative  fetch('/api/...')  → on native resolves to https://localhost
 *      (the bundle), NOT the backend. Every API call MUST go through apiUrl().
 *   2. A bare  navigator.share(...)  for a TEXT share with no _nativeShareSheet
 *      fallback → does nothing in the Capacitor WebView (no navigator.share).
 *
 * Runs offline over web/*.js. Exit non-zero on any violation so it can gate a
 * release (npm run release-check). This is a heuristic, not a parser — it errs
 * toward flagging; add an explicit allow-comment (see below) if ever needed.
 */
const fs = require('fs');
const path = require('path');

const webDir = path.join(__dirname, '..', 'web');
const files = fs.readdirSync(webDir).filter(f => f.endsWith('.js'));
const violations = [];

for (const file of files) {
    const full = path.join(webDir, file);
    const src = fs.readFileSync(full, 'utf8');
    const lines = src.split('\n');

    lines.forEach((line, i) => {
        const n = i + 1;
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) return; // skip comments

        // ---- Rule 1: relative /api fetch not wrapped in apiUrl() ----
        // Match fetch('/api  fetch("/api  fetch(`/api  (a string literal, so the
        // char before /api is a quote — that's what distinguishes it from
        // fetch(apiUrl('/api'...)).
        const relApi = /fetch\(\s*['"`]\/api/;
        if (relApi.test(line) && !/allow-native-fetch/.test(line)) {
            violations.push(`${file}:${n}  relative /api fetch — use apiUrl('/api...')\n    ${trimmed}`);
        }

        // ---- Rule 2: bare navigator.share text-share without native fallback ----
        if (/navigator\.share\s*\(/.test(line)) {
            // A file-share (card image) legitimately uses navigator.share (it
            // falls back to download on native) — allow when files: appears in the
            // share object (which can span several lines).
            const near = lines.slice(i, i + 7).join(' ');
            const isFileShare = /files\s*:/.test(near);
            if (isFileShare) return;
            // Otherwise require a _nativeShareSheet call within the preceding 25
            // lines (same function), the native-first guard.
            const before = lines.slice(Math.max(0, i - 25), i).join('\n');
            if (!/_nativeShareSheet/.test(before) && !/allow-bare-share/.test(line)) {
                violations.push(`${file}:${n}  navigator.share text-share with no _nativeShareSheet fallback (breaks native)\n    ${trimmed}`);
            }
        }
    });
}

// Sanity: the helpers the contract depends on must exist.
const appJs = fs.readFileSync(path.join(webDir, 'app.js'), 'utf8');
['function apiUrl', 'async function _nativeShareSheet'].forEach(sig => {
    if (!appJs.includes(sig)) violations.push(`app.js  missing required helper: ${sig}`);
});

if (violations.length) {
    console.error(`native-contract: ${violations.length} violation(s)\n`);
    violations.forEach(v => console.error('  ✗ ' + v + '\n'));
    process.exit(1);
}
console.log('native-contract: OK — all /api calls use apiUrl(), all text shares are native-guarded.');
