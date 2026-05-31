/**
 * Generate "Daily Nice Numbers" calendar v2
 *
 * Improvements:
 * 1. No same event repeated within 7 days
 * 2. Filter out negative/tragic events
 * 3. Diversify number types (not just palindromes)
 * 4. Combine related events for combined milestones
 * 5. For seconds/minutes, note the exact time the milestone hits
 */

const { HISTORY_FACTS } = require('../web/historyFacts.js');
const fs = require('fs');

// === NEGATIVE EVENT FILTER ===
const NEGATIVE_KEYWORDS = [
    'bomb', 'atomic', 'hiroshima', 'nagasaki', 'earthquake', 'tsunami',
    'hurricane', 'devastat', 'kills', 'killed', 'death', 'dies', 'died',
    'assassinat', 'murder', 'war begin', 'invades', 'attack', 'terror',
    'crash', 'disaster', 'sank', 'sinking', 'plague', 'pandemic',
    'famine', 'genocide', 'massacre', 'nuclear test', 'breaks apart',
    'erupts', 'bankrupt', 'collapse', 'forced to recant'
];

function isNegativeEvent(event) {
    const lower = event.toLowerCase();
    return NEGATIVE_KEYWORDS.some(kw => lower.includes(kw));
}

// === COMBINED EVENT PAIRS ===
// Related events that can be combined for combined milestones
const COMBINED_PAIRS = [
    { name: 'Space Race', events: [
        { desc: 'Gagarin first human in space', year: 1961, month: 4, day: 12 },
        { desc: 'Moon landing', year: 1969, month: 7, day: 20 }
    ]},
    { name: 'Computing Revolution', events: [
        { desc: 'ENIAC first computer', year: 1946, month: 2, day: 14 },
        { desc: 'World Wide Web invented', year: 1989, month: 7, day: 29 }
    ]},
    { name: 'Flight Pioneers', events: [
        { desc: 'Wright Brothers first flight', year: 1903, month: 12, day: 17 },
        { desc: 'Gagarin first human in space', year: 1961, month: 4, day: 12 }
    ]},
    { name: 'Walls of History', events: [
        { desc: 'Berlin Wall built', year: 1961, month: 8, day: 13 },
        { desc: 'Berlin Wall fell', year: 1989, month: 11, day: 9 }
    ]},
    { name: 'DNA to Genome', events: [
        { desc: 'DNA structure discovered', year: 1953, month: 4, day: 25 },
        { desc: 'Human Genome Project first draft', year: 2000, month: 6, day: 26 }
    ]},
    { name: 'Darwin + Origin of Species', events: [
        { desc: 'Darwin born', year: 1809, month: 2, day: 12 },
        { desc: 'Darwin departs on HMS Beagle', year: 1831, month: 12, day: 27 }
    ]},
    { name: 'Electricity Pioneers', events: [
        { desc: 'Tesla born', year: 1856, month: 7, day: 10 },
        { desc: 'Edison patents kinetoscope', year: 1897, month: 8, day: 31 }
    ]},
    { name: 'Moon Missions', events: [
        { desc: 'Moon landing Apollo 11', year: 1969, month: 7, day: 20 },
        { desc: 'Apollo 17 returns (last humans on Moon)', year: 1972, month: 12, day: 19 }
    ]},
    { name: 'Internet Era', events: [
        { desc: 'First ARPANET message', year: 1969, month: 10, day: 29 },
        { desc: 'Google founded', year: 1998, month: 9, day: 4 }
    ]},
    { name: 'Women Pioneers', events: [
        { desc: 'Marie Curie born', year: 1867, month: 11, day: 7 },
        { desc: 'Sally Ride first American woman in space', year: 1983, month: 6, day: 18 }
    ]},
    { name: 'Human Rights Milestones', events: [
        { desc: 'Universal Declaration of Human Rights', year: 1948, month: 12, day: 10 },
        { desc: 'Nelson Mandela born', year: 1918, month: 7, day: 18 }
    ]},
    { name: 'Exploration Extremes', events: [
        { desc: 'Amundsen reaches South Pole', year: 1911, month: 12, day: 14 },
        { desc: 'Everest first summit', year: 1953, month: 5, day: 29 }
    ]},
    { name: 'Einstein + Hawking', events: [
        { desc: 'Einstein publishes special relativity', year: 1905, month: 6, day: 30 },
        { desc: 'Hawking born', year: 1942, month: 1, day: 8 }
    ]},
    { name: 'Voyager Missions', events: [
        { desc: 'Voyager 2 launched', year: 1977, month: 8, day: 25 },
        { desc: 'Voyager 1 closest to Saturn', year: 1980, month: 11, day: 12 }
    ]},
    { name: 'Print to Internet', events: [
        { desc: 'Gutenberg Bible printed', year: 1455, month: 2, day: 23 },
        { desc: 'World Wide Web invented', year: 1989, month: 7, day: 29 }
    ]},
    { name: 'Telephone to Smartphone', events: [
        { desc: 'Alexander Graham Bell patents telephone', year: 1876, month: 3, day: 7 },
        { desc: 'First iPhone released', year: 2007, month: 6, day: 29 }
    ]},
    { name: 'Nobel Legacy', events: [
        { desc: 'First Nobel Prizes awarded', year: 1901, month: 12, day: 10 },
        { desc: 'Marie Curie born', year: 1867, month: 11, day: 7 }
    ]},
    { name: 'Photography to Cinema', events: [
        { desc: 'Daguerreotype announced', year: 1839, month: 8, day: 19 },
        { desc: 'Edison patents kinetoscope', year: 1897, month: 8, day: 31 }
    ]},
    { name: 'Steam to Electric', events: [
        { desc: 'Robert Fulton steamboat', year: 1807, month: 8, day: 17 },
        { desc: 'Ford Model T on sale', year: 1908, month: 10, day: 1 }
    ]},
];

// === PRETTY PALINDROME CHECK ===
// Only accept palindromes with internal monotone pattern
// e.g. 1234321 (ascending then descending), 14541, 5678765, 97579
function isPrettyPalindrome(s) {
    if (new Set(s).size < 3) return false; // Need at least 3 distinct digits
    const half = Math.floor(s.length / 2);
    const firstHalf = s.substring(0, half).split('').map(Number);

    // Check ascending with max gap of 3 between consecutive digits
    let ascending = true;
    for (let i = 1; i < firstHalf.length; i++) {
        const gap = firstHalf[i] - firstHalf[i-1];
        if (gap < 0 || gap > 3) { ascending = false; break; }
    }
    if (ascending && firstHalf[firstHalf.length-1] > firstHalf[0]) return true;

    // Check descending with max gap of 3
    let descending = true;
    for (let i = 1; i < firstHalf.length; i++) {
        const gap = firstHalf[i-1] - firstHalf[i];
        if (gap < 0 || gap > 3) { descending = false; break; }
    }
    if (descending && firstHalf[0] > firstHalf[firstHalf.length-1]) return true;

    // Check equal spacing with small gaps (like 13531, 24642)
    if (firstHalf.length >= 3) {
        const gaps = [];
        for (let i = 1; i < firstHalf.length; i++) gaps.push(Math.abs(firstHalf[i] - firstHalf[i-1]));
        if (new Set(gaps).size === 1 && gaps[0] <= 3 && gaps[0] >= 1) return true;
    }

    return false;
}

// === NICE NUMBER CHECKER ===
function isNiceNumber(n) {
    if (n <= 0) return null;
    const s = String(n);

    // Power of 10
    if (n >= 1000 && Math.log10(n) === Math.floor(Math.log10(n)))
        return { type: 'power_of_10', desc: '10^' + Math.log10(n), score: 100, diversity: 10 };

    // Repdigit
    if (s.length >= 4 && new Set(s).size === 1)
        return { type: 'repdigit', desc: s.length + ' x ' + s[0], score: 80 + s.length * 3, diversity: 7 };

    // Fibonacci (only larger ones)
    const fibs = [4181,6765,10946,17711,28657,46368,75025,121393,196418,317811,514229,832040,1346269,2178309,3524578,5702887,9227465,14930352,24157817,39088169,63245986,102334155,165580141,267914296,433494437,701408733,1134903170];
    if (fibs.includes(n))
        return { type: 'fibonacci', desc: 'Fibonacci', score: 72, diversity: 6 };

    // Palindrome (7+ digits, must have internal monotone pattern)
    if (s.length >= 7 && s === s.split('').reverse().join('') && isPrettyPalindrome(s))
        return { type: 'palindrome', desc: 'palindrome', score: 68 + s.length * 2, diversity: 5 };

    // Asian lucky
    const luckyMap = {888:'triple fortune (888)',8888:'supreme prosperity (8888)',88888:'five 8s!',9999:'eternal (9999)',99999:'five 9s!',520:'I love you (520)',1314:'forever (1314)',168:'prosperity (168)',1688:'prosperity road',6666:'smooth sailing (6666)',66666:'five 6s!'};
    if (luckyMap[n])
        return { type: 'lucky', desc: luckyMap[n], score: 65, diversity: 4 };

    // Sacred
    if (n === 108) return { type: 'sacred', desc: 'sacred 108', score: 60, diversity: 3 };
    if (n === 786) return { type: 'sacred', desc: 'sacred 786', score: 60, diversity: 3 };

    // (round numbers handled in the unified round section below)

    // Sequential
    if ('123456789'.includes(s) && s.length >= 4)
        return { type: 'sequential', desc: 'ascending ' + s, score: 55, diversity: 2 };
    if ('987654321'.includes(s) && s.length >= 4)
        return { type: 'sequential', desc: 'descending ' + s, score: 55, diversity: 2 };

    // Palindrome 5-6 digits (lower priority, must be pretty)
    if (s.length >= 5 && s.length <= 6 && s === s.split('').reverse().join('') && isPrettyPalindrome(s))
        return { type: 'palindrome', desc: 'palindrome', score: 42, diversity: 5 };

    // Powers of 2 (exact)
    if (n >= 1024 && n <= 1073741824 && (n & (n - 1)) === 0)
        return { type: 'power_of_2', desc: '2^' + Math.round(Math.log2(n)), score: 55, diversity: 6 };

    // Multiples of Pi (approx)
    if (n >= 31415 && n <= 31416) return { type: 'pi', desc: 'Pi × 10K', score: 55, diversity: 7 };
    if (n >= 314159 && n <= 314160) return { type: 'pi', desc: 'Pi × 100K', score: 60, diversity: 7 };
    if (n >= 3141592 && n <= 3141593) return { type: 'pi', desc: 'Pi × 1M', score: 65, diversity: 7 };
    if (n >= 31415926 && n <= 31415927) return { type: 'pi', desc: 'Pi × 10M', score: 75, diversity: 7 };
    if (n >= 314159265 && n <= 314159266) return { type: 'pi', desc: 'Pi × 100M', score: 85, diversity: 7 };

    // Round — ONLY truly clean round numbers
    // Must look like: 5,000,000 or 2,000,000 or 500,000 or 1,500,000
    // NOT: 1,941,750 or 3,851,100
    if (n >= 100000) {
        // Exact single digit × power of 10: 1M, 2M, 5M, 10M, 100M, 1B
        const log = Math.floor(Math.log10(n));
        const leadingPower = Math.pow(10, log);
        const leadingDigit = Math.floor(n / leadingPower);
        if (n === leadingDigit * leadingPower) {
            if (n >= 1000000000) return { type: 'round', desc: (n/1e9) + ' billion', score: 95, diversity: 9 };
            if (n >= 100000000) return { type: 'round', desc: (n/1e6) + ' million', score: 80, diversity: 8 };
            if (n >= 10000000) return { type: 'round', desc: (n/1e6) + ' million', score: 68, diversity: 8 };
            if (n >= 1000000) return { type: 'round', desc: (n/1e6) + ' million', score: 58, diversity: 8 };
            if (n >= 100000) return { type: 'round', desc: (n/1e3) + 'K', score: 45, diversity: 8 };
        }
        // Clean half values: 500K, 1.5M, 2.5M
        const cleanHalves = [500000, 1500000, 2500000, 3500000, 4500000, 5500000, 7500000, 15000000, 25000000, 50000000, 75000000, 150000000, 250000000, 500000000, 750000000, 1500000000];
        if (cleanHalves.includes(n)) {
            if (n >= 1000000) return { type: 'round', desc: (n/1e6) + ' million', score: 50, diversity: 8 };
            return { type: 'round', desc: (n/1e3) + 'K', score: 42, diversity: 8 };
        }
    }

    return null;
}

const units = [
    { name: 'seconds', ms: 1000 },
    { name: 'minutes', ms: 60000 },
    { name: 'hours', ms: 3600000 },
    { name: 'days', ms: 86400000 },
    { name: 'weeks', ms: 604800000 },
];

// === THEMATIC BONUS ===
// Extra score when number type matches event category
function getThematicBonus(niceType, category, event) {
    const evLower = event.toLowerCase();

    // Power of 2 + technology/computing = perfect
    if (niceType === 'power_of_2' && (category === 'technology' || category === 'invention'))
        return { bonus: 30, reason: 'binary number for tech event' };
    if (niceType === 'power_of_2' && evLower.match(/computer|ibm|internet|digital|byte|bit|code|program|software/))
        return { bonus: 35, reason: 'binary number for computing event' };

    // Pi + science/math = perfect
    if (niceType === 'pi' && (category === 'science' || evLower.match(/math|physics|einstein|newton|copernicus|galileo/)))
        return { bonus: 30, reason: 'Pi for science event' };

    // Fibonacci + nature/biology = perfect
    if (niceType === 'fibonacci' && (category === 'nature' || evLower.match(/darwin|dna|genome|species|biology|life|flower|beagle/)))
        return { bonus: 30, reason: 'Fibonacci for nature/biology event' };

    // Lucky numbers + culture/love events
    if (niceType === 'lucky' && (category === 'culture' || evLower.match(/love|wedding|valentine|romance|heart/)))
        return { bonus: 25, reason: 'lucky number for cultural event' };

    // Sacred + human rights/spiritual
    if (niceType === 'sacred' && (category === 'human_rights' || evLower.match(/peace|rights|freedom|independence|gandhi|mandela|nobel/)))
        return { bonus: 25, reason: 'sacred number for human rights event' };

    // Round millions + space (millions of km)
    if (niceType === 'round' && category === 'space')
        return { bonus: 20, reason: 'round millions for space event' };

    // Sequential + exploration/progress
    if (niceType === 'sequential' && (category === 'exploration' || evLower.match(/first|pioneer|discover|invent|summit|record/)))
        return { bonus: 20, reason: 'sequential for progress/exploration' };

    // Repdigit + sports (jersey numbers, records)
    if (niceType === 'repdigit' && category === 'sports')
        return { bonus: 15, reason: 'repdigit for sports event' };

    // Power of 10 + anything = always great
    if (niceType === 'power_of_10')
        return { bonus: 10, reason: 'power of 10 is universally impressive' };

    return { bonus: 0, reason: null };
}

// Flatten positive events only
const allEvents = [];
Object.entries(HISTORY_FACTS).forEach(([key, facts]) => {
    facts.forEach(f => {
        if (isNegativeEvent(f.event)) return; // Skip negative events
        const [m, d] = key.split('-').map(Number);
        allEvents.push({ ...f, month: m, day: d, key, isCombined: false });
    });
});

console.log(`Events after filtering negatives: ${allEvents.length}`);

// === MAIN GENERATION ===
const results = [];
const recentlyUsedEvents = []; // Track last 7 days of used events

for (let dd = new Date(2026, 5, 1); dd <= new Date(2026, 11, 31); dd.setDate(dd.getDate() + 1)) {
    const dateStr = dd.toISOString().split('T')[0];
    const candidates = [];

    // === Single event matches ===
    allEvents.forEach(ev => {
        const evDate = new Date(ev.year, ev.month - 1, ev.day);
        if (evDate >= dd) return;
        const diffMs = dd - evDate;

        // Skip if this event was used in last 7 days
        const evKey = ev.event + '|' + ev.year;
        if (recentlyUsedEvents.includes(evKey)) return;

        units.forEach(u => {
            const val = Math.floor(diffMs / u.ms);
            const nice = isNiceNumber(val);
            if (!nice) return;

            // Calculate exact time for sub-day units
            let exactTime = null;
            if (u.name === 'seconds' || u.name === 'minutes' || u.name === 'hours') {
                const targetMs = evDate.getTime() + val * u.ms;
                const targetDate = new Date(targetMs);
                if (targetDate.toISOString().split('T')[0] === dateStr) {
                    exactTime = targetDate.toISOString().split('T')[1].substring(0, 8);
                }
            }

            // Check thematic bonus
            const thematic = getThematicBonus(nice.type, ev.category, ev.event);

            candidates.push({
                date: dateStr,
                event: ev.event,
                eventYear: ev.year,
                category: ev.category,
                value: val,
                unit: u.name,
                niceType: nice.type,
                niceDesc: nice.desc,
                score: nice.score + thematic.bonus,
                baseScore: nice.score,
                thematicBonus: thematic.bonus,
                thematicReason: thematic.reason,
                diversity: nice.diversity,
                exactTime,
                isCombined: false,
                evKey
            });
        });
    });

    // === Combined event matches ===
    COMBINED_PAIRS.forEach(pair => {
        const dates = pair.events.map(e => new Date(e.year, e.month - 1, e.day));
        if (dates.some(d => d >= dd)) return;

        // Combined = sum of elapsed times
        const totalMs = dates.reduce((sum, d) => sum + (dd - d), 0);

        units.forEach(u => {
            const val = Math.floor(totalMs / u.ms);
            const nice = isNiceNumber(val);
            if (!nice) return;

            const evKey = 'combined|' + pair.name;
            if (recentlyUsedEvents.includes(evKey)) return;

            // Boost combined matches slightly (they're more interesting)
            candidates.push({
                date: dateStr,
                event: pair.name + ': ' + pair.events.map(e => e.desc).join(' + '),
                eventYear: pair.events.map(e => e.year).join('+'),
                category: 'combined',
                value: val,
                unit: u.name,
                niceType: nice.type,
                niceDesc: nice.desc,
                score: nice.score + 5, // Bonus for combined
                diversity: nice.diversity,
                exactTime: null,
                isCombined: true,
                evKey
            });
        });
    });

    // === Pick the best candidate ===
    // Sort by: score first, then diversity (prefer non-palindrome variety)
    candidates.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.diversity - a.diversity;
    });

    const best = candidates[0] || null;

    if (best) {
        // Track this event to avoid repeating within 7 days
        recentlyUsedEvents.push(best.evKey);
        if (recentlyUsedEvents.length > 7) recentlyUsedEvents.shift();
    }

    results.push({ date: dateStr, match: best });
}

// === STATS ===
const withMatch = results.filter(r => r.match);
const highScore = results.filter(r => r.match && r.match.score >= 70);
const typeCount = {};
withMatch.forEach(r => { typeCount[r.match.niceType] = (typeCount[r.match.niceType] || 0) + 1; });
const combinedCount = withMatch.filter(r => r.match.isCombined).length;

console.log(`Days: ${results.length} | With match: ${withMatch.length} | Without: ${results.length - withMatch.length} | High quality: ${highScore.length}`);
console.log(`Combined events used: ${combinedCount}`);
console.log('Type distribution:', typeCount);

// === GENERATE HTML ===
const monthNames = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

let html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Daily Nice Numbers v2 — Jun-Dec 2026</title>
<style>
body{font-family:-apple-system,sans-serif;background:#1a1a1a;color:#e0e0e0;padding:20px;margin:0}
h1{color:#d4b876;text-align:center;margin-bottom:5px}
.sub{text-align:center;color:#888;font-style:italic;margin-bottom:10px}
.stats{text-align:center;color:#aaa;margin:10px 0;font-size:13px}.stats b{color:#d4b876}
.types{text-align:center;margin:10px 0;font-size:12px;color:#888}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:#2a2a2a;color:#d4b876;padding:10px 6px;text-align:left;position:sticky;top:0;z-index:1}
td{padding:7px 6px;border-bottom:1px solid #333;vertical-align:top}
tr:hover{background:#252525}
.hi{background:rgba(212,184,118,0.18)}
.med{background:rgba(212,184,118,0.08)}
.comb{border-left:3px solid #6ab0f3}
.no{color:#555}
.num{font-family:'Source Code Pro',monospace;color:#d4b876;font-size:16px;font-weight:bold}
.unit{color:#a0b8a0;font-style:italic;font-size:12px}
.time{color:#888;font-size:10px;font-family:monospace}
.badge{font-size:11px;padding:2px 8px;border-radius:10px;display:inline-block;white-space:nowrap}
.t-power_of_10{background:#4a2d1a;color:#f3b06a}
.t-repdigit{background:#2d1a4a;color:#b06af3}
.t-palindrome{background:#1a4a2d;color:#6af3b0}
.t-fibonacci{background:#1a2d4a;color:#6ab0f3}
.t-round_billion,.t-round_100M,.t-round_10M,.t-round_1M,.t-round_100K,.t-round_50K{background:#3a3a1a;color:#d4d46a}
.t-lucky{background:#4a1a1a;color:#f36a6a}
.t-sacred{background:#4a3a1a;color:#f3d46a}
.t-sequential{background:#1a4a4a;color:#6af3f3}
.t-combined{background:#1a2d4a;color:#6ab0f3}
.ev{max-width:300px;font-size:12px}
.evyr{color:#666;font-size:11px}
.sc{font-family:monospace;font-size:12px;color:#888}
.mhdr td{background:#2a2233;color:#d4b876;font-weight:bold;font-size:16px;border-bottom:2px solid #d4b876;padding:12px 6px}
.phrase{font-size:13px;color:#e0d8c8;font-style:italic;max-width:400px}
.comb-tag{font-size:10px;padding:1px 5px;border-radius:6px;background:#1a2d4a;color:#6ab0f3;margin-left:4px}
.theme-tag{font-size:10px;padding:1px 5px;border-radius:6px;background:#2d4a1a;color:#b0f36a;margin-left:4px}
</style></head><body>
<h1>Daily Nice Numbers v2</h1>
<p class="sub">Every day: a historical event + nice number. No negatives, no repeats within 7 days, combined events supported.</p>
<div class="stats">Days: <b>${results.length}</b> | With match: <b>${withMatch.length}</b> | Without: <b>${results.length - withMatch.length}</b> | High quality: <b>${highScore.length}</b> | Combined: <b>${combinedCount}</b></div>
<div class="types">Types: ${Object.entries(typeCount).map(([k,v]) => k + ':' + v).join(' | ')}</div>
<table><thead><tr><th>Date</th><th>Nice Number</th><th>Unit</th><th>Type</th><th>Score</th><th>Event</th><th>User-facing phrase</th></tr></thead><tbody>`;

let curMonth = -1;
results.forEach(r => {
    const m = parseInt(r.date.split('-')[1]);
    if (m !== curMonth) {
        curMonth = m;
        html += `<tr class="mhdr"><td colspan="7">${monthNames[m]} 2026</td></tr>`;
    }

    if (!r.match) {
        html += `<tr class="no"><td>${r.date}</td><td colspan="6">— no match (need more events) —</td></tr>`;
        return;
    }
    const mm = r.match;
    let cls = mm.score >= 70 ? 'hi' : mm.score >= 50 ? 'med' : '';
    if (mm.isCombined) cls += ' comb';

    const combTag = mm.isCombined ? '<span class="comb-tag">combined</span>' : '';
    const thematicTag = mm.thematicBonus > 0 ? `<span class="theme-tag" title="${mm.thematicReason}">+${mm.thematicBonus} thematic</span>` : '';
    const timeNote = mm.exactTime ? `<div class="time">at ${mm.exactTime} UTC</div>` : '';

    // User-facing phrase
    let phrase = '';
    const valStr = mm.value.toLocaleString();
    if (mm.isCombined) {
        phrase = `Combined: ${valStr} ${mm.unit} since ${mm.event} — ${mm.niceDesc}!`;
    } else if (mm.niceType.startsWith('round')) {
        phrase = `${mm.niceDesc} ${mm.unit} since ${mm.event} (${mm.eventYear})!`;
    } else {
        phrase = `${valStr} ${mm.unit} since ${mm.event} (${mm.eventYear}) — ${mm.niceDesc}!`;
    }
    if (mm.thematicReason) phrase += ` [${mm.thematicReason}]`;

    html += `<tr class="${cls}">
        <td>${r.date}</td>
        <td class="num">${valStr}${timeNote}</td>
        <td class="unit">${mm.unit}</td>
        <td><span class="badge t-${mm.niceType}">${mm.niceDesc}</span>${combTag}${thematicTag}</td>
        <td class="sc">${mm.score}</td>
        <td class="ev">${mm.event} <span class="evyr">(${mm.eventYear})</span></td>
        <td class="phrase">${phrase}</td>
    </tr>`;
});

html += '</tbody></table></body></html>';

fs.writeFileSync('C:/Users/LokalniAdmin/Projects/HappyMoments/docs/daily-nice-numbers.html', html);
console.log('Done: docs/daily-nice-numbers.html');
