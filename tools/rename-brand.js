// One-off brand rename: "HappyMoments"/"HappyMoment" -> "Nice Numbers".
// Case-sensitive, so the lowercase domain "happymoments.app" is preserved.
const fs = require('fs');
const path = require('path');

const WEB = path.join(__dirname, '..', 'web');
const EXT = new Set(['.js', '.html', '.json']);

function walk(dir, files = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const fp = path.join(dir, e.name);
        if (e.isDirectory()) walk(fp, files);
        else if (EXT.has(path.extname(e.name))) files.push(fp);
    }
    return files;
}

let totalBefore = 0, totalAfter = 0;
for (const f of walk(WEB)) {
    const src = fs.readFileSync(f, 'utf8');
    const before = (src.match(/HappyMoment/g) || []).length;
    if (!before) continue;
    // Replace longer token first, then the no-s share-title token.
    let out = src.split('HappyMoments').join('Nice Numbers');
    out = out.split('HappyMoment').join('Nice Numbers');
    const domainBefore = (src.match(/happymoments\.app/g) || []).length;
    const domainAfter = (out.match(/happymoments\.app/g) || []).length;
    if (domainBefore !== domainAfter) { console.error('DOMAIN TOUCHED in', f, '- aborting that file'); continue; }
    fs.writeFileSync(f, out);
    const after = (out.match(/HappyMoment/g) || []).length;
    totalBefore += before; totalAfter += after;
    console.log(`${String(before).padStart(4)} -> ${after}  ${path.relative(WEB, f)}`);
}
console.log(`\nTotal brand tokens replaced: ${totalBefore} (remaining: ${totalAfter}). Domain 'happymoments.app' preserved.`);
