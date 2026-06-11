// Regression fixtures for nicenessGrade — run: node tools/test-niceness.js
// Source: Gorazd's feedback 10 Jun 2026 — large round numbers are only nice
// if the mantissa is 1 significant digit or a clean half (x.5).
const fs = require('fs');
const path = require('path');
eval(fs.readFileSync(path.join(__dirname, '..', 'web', 'specialNumbers.js'), 'utf8'));

const cases = [
  // [value, mustShow(grade>=50), label]
  [1150000000, false, '1150 million seconds — Gorazd: not nice by any criteria'],
  [1140000000, false, '1140 million — same family'],
  [870000000,  false, '870 million seconds — nothing special'],
  [1100000000, false, '1.1 billion — bland 2-digit mantissa'],
  [3200000,    false, '3.2M hours — bland vs patterns'],
  [10500000,   false, '10.5M — bland'],
  [995000000,  false, '995 million — junk'],
  [1000000000, true,  '1 billion — the flagship'],
  [1500000000, true,  '1.5 billion — clean half'],
  [2000000,    true,  '2 million'],
  [900000000,  true,  '900 million'],
  [750000000,  true,  '750 million — three quarters'],
  [2500000,    true,  '2.5 million — clean half'],
  [31313131,   true,  '31313131 — alternating, Gorazd: nicer than 3200000'],
  [123456789,  true,  'ascending sequence'],
  [111111111,  true,  'repdigit'],
  [123454321,  true,  'mountain palindrome'],
  [500000,     true,  '500k — mid-scale unchanged'],
  [350000,     true,  '350k hours — mid-scale unchanged'],
  [10000,      true,  '10,000 days'],
  [1048576,    true,  '2^20 — binary million'],
  // 11 Jun: sub-million extension — patterns above bland rounds, 3-sig-digit rounds out
  [19191919,   true,  '19191919 alternating — Gorazd: nicer than 320,000'],
  [320000,     true,  '320,000 — visible but must grade below 19191919'],
  [13500,      false, '13,500 — Gorazd: not worth mentioning at all'],
  [12250,      false, '12,250 — same family'],
  [13000,      true,  '13,000 — clean 2-digit read'],
  [20000,      true,  '20,000 — clean 1-digit read'],
];

// Ordering assertions (ranking, not just show/hide)
const orderChecks = [
  [19191919, 320000, 'alternating pattern must outrank bland 2-digit round'],
];

let fail = 0;
console.log('value'.padEnd(13) + 'grade  verdict   expected  label');
for (const [n, mustShow, label] of cases) {
  const g = nicenessGrade(n);
  const shows = g >= 50; // adult threshold; filter never goes below 50
  const ok = shows === mustShow;
  if (!ok) fail++;
  console.log(
    String(n).padEnd(13) + String(g).padEnd(7) +
    (shows ? 'SHOW' : 'hide').padEnd(10) + (mustShow ? 'SHOW' : 'hide').padEnd(10) +
    (ok ? '' : ' <<< FAIL ') + label
  );
}
for (const [hi, lo, label] of orderChecks) {
  const ok = nicenessGrade(hi) > nicenessGrade(lo);
  if (!ok) fail++;
  console.log((ok ? 'OK   ' : 'FAIL ') + `grade(${hi})=${nicenessGrade(hi)} > grade(${lo})=${nicenessGrade(lo)} — ${label}`);
}
console.log(fail === 0 ? '\nAll fixtures pass.' : `\n${fail} FIXTURE(S) FAILED`);
process.exit(fail === 0 ? 0 : 1);
