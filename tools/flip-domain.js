// One-off: flip the displayed/link domain "happymoments.app" -> "nicenumbers.app".
// Literal (not regex) replace, so "happymoments-app.firebaseapp.com" (the Firebase
// authDomain) is NOT touched. API calls are relative, so unaffected.
const fs = require('fs');
const path = require('path');

const WEB = path.join(__dirname, '..', 'web');
const EXT = new Set(['.js', '.html', '.json']);
const FROM = 'happymoments.app';
const TO = 'nicenumbers.app';

function walk(dir, files = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const fp = path.join(dir, e.name);
        if (e.isDirectory()) walk(fp, files);
        else if (EXT.has(path.extname(e.name))) files.push(fp);
    }
    return files;
}

let total = 0;
for (const f of walk(WEB)) {
    const src = fs.readFileSync(f, 'utf8');
    const n = src.split(FROM).length - 1;
    if (!n) continue;
    // Guard: never alter the Firebase authDomain literal.
    const fbBefore = (src.match(/happymoments-app\.firebaseapp\.com/g) || []).length;
    const out = src.split(FROM).join(TO);
    const fbAfter = (out.match(/happymoments-app\.firebaseapp\.com/g) || []).length;
    if (fbBefore !== fbAfter) { console.error('Firebase authDomain affected in', f, '- skipped'); continue; }
    fs.writeFileSync(f, out);
    total += n;
    console.log(`${String(n).padStart(3)}  ${path.relative(WEB, f)}`);
}
console.log(`\nFlipped ${total} occurrences "${FROM}" -> "${TO}". authDomain preserved.`);
