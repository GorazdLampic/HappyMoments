#!/usr/bin/env node
/**
 * HappyMoments — Build Script
 * Minifies JS/CSS, generates versioned service worker, copies to dist/
 *
 * Usage: node build.js
 * Output: dist/ directory ready for deployment
 *
 * Requirements: npm install terser clean-css-cli
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC = path.join(__dirname, 'web');
const DIST = path.join(__dirname, 'dist');
const VERSION = Date.now().toString(36); // Short version hash

console.log(`\nHappyMoments Build — v${VERSION}\n${'='.repeat(40)}\n`);

// Ensure dist directory
if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
}
fs.mkdirSync(DIST, { recursive: true });

// Copy static assets
const staticFiles = ['manifest.json', '_redirects', 'gift-placeholder.svg', 'gift-placeholder.png', 'og-image.png'];
const staticDirs = ['icons'];

staticFiles.forEach(f => {
    const src = path.join(SRC, f);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(DIST, f));
        console.log(`  Copied: ${f}`);
    }
});

staticDirs.forEach(d => {
    const src = path.join(SRC, d);
    if (fs.existsSync(src)) {
        copyDirSync(src, path.join(DIST, d));
        console.log(`  Copied: ${d}/`);
    }
});

// JS files to minify (order matters for concatenation)
const jsFiles = [
    'notifications.js',
    'i18n.js',
    'historyFacts.js',
    'specialNumbers.js',
    'milestoneCalculator.js',
    'combinations.js',
    'shareMessages.js',
    'giftStore.js',
    'dataProtection.js',
    'imageCard.js',
    'checkout.js',
    'analytics.js',
    'auth.js',
    'app.js'
];

// Check if terser is available
let hasTerser = false;
try {
    require.resolve('terser');
    hasTerser = true;
} catch (e) {
    console.log('  Note: Install terser for minification: npm install terser');
    console.log('  Building without minification...\n');
}

// Process JS files
jsFiles.forEach(f => {
    const src = path.join(SRC, f);
    if (!fs.existsSync(src)) { console.log(`  Skip (not found): ${f}`); return; }

    if (hasTerser) {
        try {
            execSync(`npx terser "${src}" -o "${path.join(DIST, f)}" --compress --mangle`, { stdio: 'pipe' });
            const origSize = fs.statSync(src).size;
            const minSize = fs.statSync(path.join(DIST, f)).size;
            const pct = Math.round((1 - minSize / origSize) * 100);
            console.log(`  Minified: ${f} (${formatSize(origSize)} -> ${formatSize(minSize)}, -${pct}%)`);
        } catch (e) {
            // Fallback: copy as-is
            fs.copyFileSync(src, path.join(DIST, f));
            console.log(`  Copied (minify failed): ${f}`);
        }
    } else {
        fs.copyFileSync(src, path.join(DIST, f));
        console.log(`  Copied: ${f}`);
    }
});

// Process CSS
const cssFile = 'styles.css';
let hasCleanCSS = false;
try {
    require.resolve('clean-css');
    hasCleanCSS = true;
} catch (e) { /* no clean-css */ }

const cssSrc = path.join(SRC, cssFile);
if (fs.existsSync(cssSrc)) {
    if (hasCleanCSS) {
        try {
            const CleanCSS = require('clean-css');
            const input = fs.readFileSync(cssSrc, 'utf8');
            const output = new CleanCSS({ level: 2 }).minify(input);
            fs.writeFileSync(path.join(DIST, cssFile), output.styles);
            const pct = Math.round((1 - output.styles.length / input.length) * 100);
            console.log(`  Minified: ${cssFile} (${formatSize(input.length)} -> ${formatSize(output.styles.length)}, -${pct}%)`);
        } catch (e) {
            fs.copyFileSync(cssSrc, path.join(DIST, cssFile));
            console.log(`  Copied (minify failed): ${cssFile}`);
        }
    } else {
        fs.copyFileSync(cssSrc, path.join(DIST, cssFile));
        console.log(`  Copied: ${cssFile}`);
    }
}

// Process HTML — inject version, copy
const htmlSrc = path.join(SRC, 'index.html');
let html = fs.readFileSync(htmlSrc, 'utf8');
// Add cache-busting version to script/css tags
html = html.replace(/(\.js)(")/g, `$1?v=${VERSION}$2`);
html = html.replace(/(styles\.css)(")/g, `$1?v=${VERSION}$2`);

// Inject build version and timestamp into footer
const buildTime = new Date().toISOString().replace('T', ' ').substring(0, 16);
const versionCode = '80'; // Keep in sync with android/app/build.gradle versionCode
const versionInfo = `v${versionCode} &middot; ${buildTime} UTC`;
html = html.replace('id="appVersion">', `id="appVersion">Build: ${versionInfo}`);

fs.writeFileSync(path.join(DIST, 'index.html'), html);
console.log(`  Processed: index.html (v=${VERSION}, build=${buildTime})`);

// Copy HTML pages
['legal.html', 'landing.html', 'admin.html', 'og-image.html'].forEach(f => {
    const src = path.join(SRC, f);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(DIST, f));
        console.log(`  Copied: ${f}`);
    }
});

// Generate versioned service worker
const swContent = `
// HappyMoments Service Worker — v${VERSION}
const CACHE_NAME = 'happymoments-v${VERSION}';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=${VERSION}',
    ${jsFiles.map(f => `'./` + f + `?v=${VERSION}'`).join(',\n    ')},
    './manifest.json',
    './legal.html'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    // Network-first for HTML (get latest), cache-first for assets
    if (e.request.mode === 'navigate') {
        e.respondWith(
            fetch(e.request).catch(() => caches.match(e.request))
        );
    } else {
        e.respondWith(
            caches.match(e.request).then(r => r || fetch(e.request))
        );
    }
});
`.trim();

fs.writeFileSync(path.join(DIST, 'sw.js'), swContent);
console.log(`  Generated: sw.js (cache: happymoments-v${VERSION})`);

// Summary
const distFiles = getAllFiles(DIST);
const totalSize = distFiles.reduce((sum, f) => sum + fs.statSync(f).size, 0);
console.log(`\n${'='.repeat(40)}`);
console.log(`  Build complete: ${distFiles.length} files, ${formatSize(totalSize)}`);
console.log(`  Output: ${DIST}`);
console.log(`${'='.repeat(40)}\n`);

// Helper functions
function copyDirSync(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) copyDirSync(srcPath, destPath);
        else fs.copyFileSync(srcPath, destPath);
    }
}

function getAllFiles(dir) {
    let files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) files = files.concat(getAllFiles(full));
        else files.push(full);
    }
    return files;
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}
