// Quick inventory of hardcoded English vs i18n coverage — run: node tools/i18n-inventory.js
const fs = require('fs');
const path = require('path');
const W = p => fs.readFileSync(path.join(__dirname, '..', 'web', p), 'utf8');

const app = W('app.js');
const html = W('index.html');
const share = W('shareMessages.js');

console.log('data-i18n attributes in index.html:', (html.match(/data-i18n=/g) || []).length);
console.log('t(...) calls in app.js:', (app.match(/[^a-zA-Z]t\('[a-z_0-9]+'\)/g) || []).length);
console.log('showToast EN literals in app.js:', (app.match(/showToast\('[A-Z][^']+'/g) || []).length);
console.log('hardcoded headings in app.js templates:', (app.match(/wizard-question[^>]*>[A-Z][^<$]{8,}</g) || []).length);
console.log('hardcoded textContent button strings:', (app.match(/textContent = '[A-Z][^']{5,}'/g) || []).length);
console.log('hardcoded innerHTML EN fragments (rough):', (app.match(/>(?:[A-Z][a-z]+ ){2,}[a-z]+[<.…]/g) || []).length);
console.log('share message strings in shareMessages.js:', (share.match(/^\s+"/gm) || []).length);
console.log('ordinal suffix logic (EN-only th/st/nd/rd):', (app.match(/'th','st','nd','rd'/g) || []).length, '(formatMilestoneDate)');
console.log('plural() EN-only helper used at sites:', (app.match(/plural\(/g) || []).length);
console.log('dir="rtl" handling for Arabic:', (html.match(/dir=/g) || []).length, '+', (app.match(/dir\s*=/g) || []).length);
