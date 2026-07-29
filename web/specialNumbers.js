/**
 * Nice Numbers - Special Numbers Definition (Web Version)
 * Extended with customizable patterns, scientific constants, and more
 */

// ============================================================
// SCIENTIFIC CONSTANTS
// ============================================================

const SCIENTIFIC_CONSTANTS = {
    pi: {
        name: 'Pi (π)',
        value: '3.14159265358979323846',
        numbers: [314, 3141, 31415, 314159, 3141592, 31415926, 314159265],
        explanation: 'π = 3.14159... - the ratio of a circle\'s circumference to its diameter!'
    },
    e: {
        name: "Euler's Number (e)",
        value: '2.71828182845904523536',
        numbers: [271, 2718, 27182, 271828, 2718281, 27182818],
        explanation: 'e = 2.71828... - the base of natural logarithms, found everywhere in nature!'
    },
    phi: {
        name: 'Golden Ratio (φ)',
        value: '1.61803398874989484820',
        numbers: [161, 1618, 16180, 161803, 1618033, 16180339],
        explanation: 'φ = 1.61803... - the Golden Ratio, nature\'s most beautiful proportion!'
    },
    sqrt2: {
        name: 'Square Root of 2',
        value: '1.41421356237309504880',
        numbers: [141, 1414, 14142, 141421, 1414213, 14142135],
        explanation: '√2 = 1.41421... - the diagonal of a unit square!'
    },
    c: {
        name: 'Speed of Light',
        value: '299792458',
        numbers: [299, 2997, 29979, 299792, 2997924, 29979245, 299792458, 300000000],
        explanation: 'c = 299,792,458 m/s - the speed of light, the universe\'s speed limit!'
    },
    avogadro: {
        name: "Avogadro's Number",
        value: '6.02214076e23',
        numbers: [602, 6022, 60221, 602214],
        explanation: '6.022 × 10²³ - the number of atoms in a mole, chemistry\'s magic number!'
    }
};

// ============================================================
// BASIC PATTERNS
// ============================================================

// Powers of 10
const POWERS_OF_TEN = [
    10, 100, 1000, 10000, 100000,
    1000000, 10000000, 100000000,
    1000000000, 10000000000
];

// Dense round numbers — ensures no time unit goes >~90 days without a milestone
// Density scaled per magnitude: smaller numbers need tighter steps for months/weeks,
// larger numbers need tighter steps for seconds/minutes at older ages.
const ROUND_NUMBERS = (() => {
    const nums = new Set();
    // 10-100: every 10 (for months, years)
    for (let n = 10; n <= 100; n += 10) nums.add(n);
    [25, 50, 75].forEach(n => nums.add(n));
    // 100-500: every 10 (months coverage)
    for (let n = 100; n <= 500; n += 10) nums.add(n);
    for (let n = 100; n <= 500; n += 25) nums.add(n);
    // 500-1000: every 50 (months at ages 40-83 — every 50 months ≈ 4y gap, filtered by niceness)
    for (let n = 500; n <= 1000; n += 50) nums.add(n);
    // 500-2000: every 50 (weeks)
    for (let n = 500; n <= 2000; n += 50) nums.add(n);
    // 2000-10000: every 50 (weeks — 50 weeks ≈ 350d max gap)
    for (let n = 2000; n <= 10000; n += 50) nums.add(n);
    // 10000-50000: every 250 (days — 250d ≈ 8mo max gap)
    for (let n = 10000; n <= 50000; n += 250) nums.add(n);
    // 50000-200000: every 1000 (hours)
    for (let n = 50000; n <= 200000; n += 1000) nums.add(n);
    // 200000-1M: every 10000 (hours — 10Kh ≈ 417d gap, only truly round like 420K, 430K)
    for (let n = 200000; n <= 1000000; n += 10000) nums.add(n);
    // 1M-3M: every 10000 (hours at ages 48-137 — 10Kh ≈ 417d gap)
    for (let n = 1000000; n <= 3000000; n += 10000) nums.add(n);
    // 1M-10M: every 50K (minutes — 50K min ≈ 35d gap)
    for (let n = 1000000; n <= 10000000; n += 50000) nums.add(n);
    // 10M-100M: every 500K (minutes at 20-60y — 500K min ≈ 347d gap, prefer patterns over bland rounds)
    for (let n = 10000000; n <= 100000000; n += 500000) nums.add(n);
    // 100M-1B: every 5M (seconds — 5M sec ≈ 58d gap, less noise)
    for (let n = 100000000; n <= 1000000000; n += 5000000) nums.add(n);
    // 1B-5B: every 10M (seconds at 30-160y — 10M sec ≈ 116d gap, only truly round)
    for (let n = 1000000000; n <= 5000000000; n += 10000000) nums.add(n);
    // 5B-15B: every 100M (combined milestones)
    for (let n = 5000000000; n <= 15000000000; n += 100000000) nums.add(n);
    // Very large for big combined milestones
    for (let n = 15000000000; n <= 100000000000; n += 5000000000) nums.add(n);
    return [...nums].sort((a, b) => a - b);
})();

// Fibonacci numbers
const FIBONACCI = (() => {
    const fibs = [1, 1];
    while (fibs[fibs.length - 1] < 100000000000) {
        fibs.push(fibs[fibs.length - 1] + fibs[fibs.length - 2]);
    }
    return fibs.filter(n => n >= 5); // skip trivial ones
})();

// Powers of 2
const POWERS_OF_TWO = (() => {
    const pows = [];
    for (let i = 3; i <= 40; i++) { // 8 to ~1 trillion
        pows.push(Math.pow(2, i));
    }
    return pows;
})();

// Generate repdigit numbers (111, 222, 3333, etc.)
function generateRepdigits(maxDigits = 11, digits = null) {
    const repdigits = [];
    const useDigits = digits || [1, 2, 3, 4, 5, 6, 7, 8, 9];

    for (let numDigits = 2; numDigits <= maxDigits; numDigits++) {
        for (const d of useDigits) {
            // Use BigInt for large numbers then convert if safe
            const repStr = String(d).repeat(numDigits);
            const repdigit = parseInt(repStr, 10);
            if (repdigit <= Number.MAX_SAFE_INTEGER) {
                repdigits.push(repdigit);
            }
        }
    }
    return repdigits.sort((a, b) => a - b);
}

// Generate alternating digit patterns (1212, 737373, etc.)
function generateAlternating(maxDigits = 10) {
    const alternating = [];

    // Two-digit alternating patterns
    for (let d1 = 1; d1 <= 9; d1++) {
        for (let d2 = 0; d2 <= 9; d2++) {
            if (d1 === d2) continue;

            // Generate patterns of various lengths
            for (let length = 4; length <= maxDigits; length += 2) {
                let pattern = '';
                for (let i = 0; i < length; i++) {
                    pattern += (i % 2 === 0) ? d1 : d2;
                }
                alternating.push(parseInt(pattern, 10));
            }
        }
    }

    return [...new Set(alternating)].sort((a, b) => a - b);
}

// Generate palindrome numbers - STRUCTURED VERSION
// Only palindromes with internal order (mountain patterns, round, binary-style)
// Rationale: 12321 is interesting because digits ascend then descend.
// Random palindromes like 2332 or 5775 are not recognizable to most people.
function generatePalindromes(maxDigits = 10) {
    const palindromes = new Set();

    // Mountain palindromes: ascending then descending (1234321, 123454321)
    palindromes.add(121);
    palindromes.add(12321);
    palindromes.add(1234321);
    palindromes.add(123454321);
    palindromes.add(12345654321);

    // Odd-digit mountains: 1-3-5-7-5-3-1
    palindromes.add(131);
    palindromes.add(13531);
    palindromes.add(1357531);
    palindromes.add(135797531);

    // Even-digit mountains: 2-4-6-4-2
    palindromes.add(242);
    palindromes.add(24642);
    palindromes.add(2468642);

    // Round palindromes (digit-zeros-digit): structurally clean
    palindromes.add(101);
    palindromes.add(1001);
    palindromes.add(10001);
    palindromes.add(100001);
    palindromes.add(1000001);
    palindromes.add(10000001);
    palindromes.add(100000001);
    palindromes.add(1000000001);

    // Binary-style structured palindromes (1-0-1-0-1)
    palindromes.add(10101);
    palindromes.add(1010101);
    palindromes.add(101010101);

    // Descending mountain palindromes
    palindromes.add(7654567);
    palindromes.add(9876789);
    palindromes.add(12344321);

    // Filter by max digits
    return [...palindromes]
        .filter(n => String(n).length <= maxDigits)
        .sort((a, b) => a - b);
}

// Check if palindrome is "interesting" (has mathematical pattern)
function isPalindromeInteresting(num) {
    const str = String(num);
    const len = str.length;

    // All same digits - always interesting
    if (new Set(str).size === 1) return true;

    // Mountain pattern (ascending then descending)
    const half = Math.ceil(len / 2);
    const firstHalf = str.slice(0, half);
    let isMountain = true;
    for (let i = 1; i < firstHalf.length; i++) {
        if (parseInt(firstHalf[i]) <= parseInt(firstHalf[i-1])) {
            isMountain = false;
            break;
        }
    }
    if (isMountain) return true;

    // Contains only certain digits (0,1 or prime digits)
    const binaryLike = str.split('').every(d => d === '0' || d === '1');
    if (binaryLike) return true;

    const primeLike = str.split('').every(d => ['2','3','5','7'].includes(d));
    if (primeLike) return true;

    // Round palindrome (contains multiple zeros)
    const zeroCount = str.split('').filter(d => d === '0').length;
    if (zeroCount >= len / 3) return true;

    return false;
}

// Generate sequential numbers (12345, 98765, etc.)
// Minimum 5 digits — shorter sequences (123, 987) are too common to be special
function generateSequentials() {
    const sequentials = [];

    // Ascending: 12345, 123456, 1234567...
    for (let length = 5; length <= 9; length++) {
        let num = '';
        for (let i = 1; i <= length; i++) num += i;
        sequentials.push(parseInt(num, 10));
    }

    // Descending: 98765, 987654, 9876543...
    for (let length = 5; length <= 9; length++) {
        let num = '';
        for (let i = 9; i >= 9 - length + 1; i--) num += i;
        sequentials.push(parseInt(num, 10));
    }

    // Partial 5+ digit sequences
    sequentials.push(23456, 34567, 45678, 56789);
    sequentials.push(98765, 87654, 76543, 65432, 54321);

    return [...new Set(sequentials)].sort((a, b) => a - b);
}

// Generate lucky digit patterns (numbers made only of specified digits)
function generateLuckyPatterns(luckyDigits, maxValue = 10000000000) {
    if (!luckyDigits || luckyDigits.length === 0) return [];

    // Cap at 3 lucky digits to prevent exponential blowup (4+ digits = millions of combos)
    const digits = luckyDigits.slice(0, 3);

    const patterns = new Set();

    // Generate combinations of lucky digits
    function generate(current, depth) {
        if (current > maxValue || depth > 10) return;
        if (current > 0 && depth >= 2) {
            patterns.add(current);
        }
        for (const digit of digits) {
            generate(current * 10 + digit, depth + 1);
        }
    }

    for (const digit of digits) {
        if (digit > 0) {
            generate(digit, 1);
        }
    }

    return [...patterns].sort((a, b) => a - b);
}

// ============================================================
// DEFAULT SETTINGS
// ============================================================

const DEFAULT_SETTINGS = {
    luckyDigits: [3, 7],
    patterns: {
        powers: true,
        repdigits: true,
        alternating: true,
        palindromes: true,
        sequential: true,
        scientific: true,
        fibonacci: false,
        powers2: true,  // filtered to ≤1024 in generation
        lucky: false,
        cosmic: true    // celestial numbers (planetary returns); Settings toggle
    },
    constants: {
        pi: true,
        e: true,
        phi: true,
        sqrt2: false,
        c: false,
        avogadro: false
    },
    customNumbers: []
};

// Time unit configurations with short abbreviations
const TIME_UNITS = {
    seconds: {
        name: 'seconds',
        plural: 'seconds',
        short: 'sec',
        msMultiplier: 1000,
        maxReasonable: 15000000000
    },
    minutes: {
        name: 'minutes',
        plural: 'minutes',
        short: 'min',
        msMultiplier: 60 * 1000,
        maxReasonable: 200000000
    },
    hours: {
        name: 'hours',
        plural: 'hours',
        short: 'hrs',
        msMultiplier: 60 * 60 * 1000,
        maxReasonable: 3000000
    },
    days: {
        name: 'days',
        plural: 'days',
        short: 'd',
        msMultiplier: 24 * 60 * 60 * 1000,
        maxReasonable: 50000
    },
    weeks: {
        name: 'weeks',
        plural: 'weeks',
        short: 'w',
        msMultiplier: 7 * 24 * 60 * 60 * 1000,
        maxReasonable: 7000
    },
    months: {
        name: 'months',
        plural: 'months',
        short: 'mo',
        msMultiplier: 30.44 * 24 * 60 * 60 * 1000,
        maxReasonable: 1500
    },
    years: {
        name: 'years',
        plural: 'years',
        short: 'y',
        msMultiplier: 365.25 * 24 * 60 * 60 * 1000,
        maxReasonable: 150
    }
};

// ============================================================
// DYNAMIC NUMBER GENERATION BASED ON SETTINGS
// ============================================================

let _specialNumbersCache = null;
let _specialNumbersCacheKey = null;

function generateAllSpecialNumbers(settings) {
    settings = settings || DEFAULT_SETTINGS;

    // Cache key based on settings that affect generation
    const cacheKey = JSON.stringify({
        patterns: settings.patterns,
        constants: settings.constants,
        luckyDigits: settings.luckyDigits,
        customNumbers: settings.customNumbers
    });

    if (_specialNumbersCache && _specialNumbersCacheKey === cacheKey) {
        return _specialNumbersCache;
    }

    const numbers = new Set();

    // Round numbers always included — they are the density floor
    // Without them, pattern milestones (palindromes, alternating) are too sparse at large magnitudes
    ROUND_NUMBERS.forEach(n => numbers.add(n));

    // Powers of 10 — gated by toggle (these are the "impressive" round numbers)
    if (settings.patterns.powers) {
        POWERS_OF_TEN.forEach(n => numbers.add(n));
    }

    // Powers of 2 — include all reasonable powers (up to 2^30 ~ 1 billion)
    if (settings.patterns.powers2 !== false) {
        POWERS_OF_TWO.filter(n => n <= 1073741824).forEach(n => numbers.add(n));
    }

    // Fibonacci
    if (settings.patterns.fibonacci !== false) {
        FIBONACCI.forEach(n => numbers.add(n));
    }

    // Repdigits (up to 11 digits for big combined milestones like 2222222222 seconds)
    if (settings.patterns.repdigits) {
        generateRepdigits(11).forEach(n => numbers.add(n));
    }

    // Alternating
    if (settings.patterns.alternating) {
        generateAlternating(10).forEach(n => numbers.add(n));
    }

    // Palindromes
    if (settings.patterns.palindromes) {
        generatePalindromes(9).forEach(n => numbers.add(n));
    }

    // Sequential
    if (settings.patterns.sequential) {
        generateSequentials().forEach(n => numbers.add(n));
    }

    // Scientific constants
    if (settings.patterns.scientific) {
        for (const [key, constant] of Object.entries(SCIENTIFIC_CONSTANTS)) {
            if (settings.constants[key]) {
                constant.numbers.forEach(n => numbers.add(n));
            }
        }
    }

    // Lucky digit patterns
    if (settings.patterns.lucky && settings.luckyDigits.length > 0) {
        generateLuckyPatterns(settings.luckyDigits).forEach(n => numbers.add(n));
    }

    // Asian auspicious numbers (always included — universal appeal)
    generateAsianAuspicious().forEach(n => numbers.add(n));

    // Custom numbers
    if (settings.customNumbers && settings.customNumbers.length > 0) {
        settings.customNumbers.forEach(n => numbers.add(n));
    }

    const result = [...numbers].sort((a, b) => a - b);
    _specialNumbersCacheKey = cacheKey;
    _specialNumbersCache = result;
    return result;
}

// ============================================================
// NUMBER CLASSIFICATION
// ============================================================

function classifyNumber(num, settings) {
    settings = settings || DEFAULT_SETTINGS;
    const strNum = String(num);
    const types = [];
    const _t = (typeof I18N !== 'undefined') ? I18N.t : (k) => null;

    // Power of 10
    if (POWERS_OF_TEN.includes(num)) {
        types.push({ type: 'power_of_10', description: _t('power_of_10') || 'Power of 10' });
    }

    // Fibonacci
    if (FIBONACCI.includes(num)) {
        types.push({ type: 'fibonacci', description: _t('fibonacci_number') || 'Fibonacci number' });
    }

    // Power of 2 — now classified for all powers, not just ≤1024
    if (POWERS_OF_TWO.includes(num)) {
        const exp = Math.round(Math.log2(num));
        const superscripts = '\u2070\u00B9\u00B2\u00B3\u2074\u2075\u2076\u2077\u2078\u2079';
        const supStr = String(exp).split('').map(d => superscripts[parseInt(d)]).join('');
        types.push({ type: 'power_of_2', description: `2${supStr}` });
    }

    // Nice round number (multiple of 500 or 1000)
    if (ROUND_NUMBERS.includes(num) && !POWERS_OF_TEN.includes(num)) {
        if (num % 1000 === 0) {
            const tmpl = _t('k_milestone') || '{value}k milestone';
            types.push({ type: 'round', description: tmpl.replace('{value}', (num/1000).toLocaleString()) });
        } else {
            types.push({ type: 'round', description: _t('round_number') || 'Round number' });
        }
    }

    // Repdigit
    if (strNum.length >= 2 && new Set(strNum).size === 1) {
        const tmpl = _t('all_digits') || 'All {digit}s';
        types.push({ type: 'repdigit', description: tmpl.replace('{digit}', strNum[0]) });
    }

    // Palindrome
    if (strNum === strNum.split('').reverse().join('') && strNum.length >= 3) {
        types.push({ type: 'palindrome', description: _t('palindrome_label') || 'Palindrome' });
    }

    // Sequential ascending
    if ('123456789'.includes(strNum) && strNum.length >= 3) {
        types.push({ type: 'sequential', description: _t('ascending_seq') || 'Ascending sequence' });
    }

    // Sequential descending
    if ('987654321'.includes(strNum) && strNum.length >= 3) {
        types.push({ type: 'sequential', description: _t('descending_seq') || 'Descending sequence' });
    }

    // Alternating pattern
    if (isAlternating(strNum) && strNum.length >= 4) {
        types.push({ type: 'alternating', description: _t('alternating_label') || 'Alternating pattern' });
    }

    // Scientific constants
    for (const [key, constant] of Object.entries(SCIENTIFIC_CONSTANTS)) {
        if (constant.numbers.includes(num)) {
            types.push({ type: 'scientific', description: constant.explanation || constant.name });
        }
    }

    // Lucky digits
    if (settings.luckyDigits && settings.luckyDigits.length > 0) {
        const digits = strNum.split('').map(Number);
        if (digits.every(d => settings.luckyDigits.includes(d))) {
            types.push({ type: 'lucky', description: _t('lucky_label') || 'Lucky digits' });
        }
    }

    // Asian lucky numbers — 8 is prosperity, 9 is longevity, 6 is smooth/lucky
    const asianLucky = _classifyAsianLucky(num, strNum);
    if (asianLucky) {
        types.push(asianLucky);
    }

    // Custom number
    if (settings.customNumbers && settings.customNumbers.includes(num)) {
        types.push({ type: 'custom', description: _t('custom_label') || 'Your special number' });
    }

    // Note: cosmic milestones (planetary returns) are classified separately
    // via findCosmicMilestones() — they carry their own type/description.

    if (types.length === 0) {
        types.push({ type: 'special', description: _t('special_label') || 'Special number' });
    }

    return types;
}

// Check if a number has alternating digits
function isAlternating(strNum) {
    if (strNum.length < 4) return false;

    const d1 = strNum[0];
    const d2 = strNum[1];

    if (d1 === d2) return false;

    for (let i = 0; i < strNum.length; i++) {
        const expected = (i % 2 === 0) ? d1 : d2;
        if (strNum[i] !== expected) return false;
    }

    return true;
}

// Asian lucky number classification
// 8 = prosperity (ba sounds like fa=wealth in Chinese)
// 9 = longevity, eternity (jiu=long-lasting)
// 6 = smooth, lucky (liu=flow smoothly)
// 88, 888, 8888 = extremely lucky
// 168 = "yi lu fa" = prosperity all the way
// 520 = "wo ai ni" = I love you
// 1314 = "yi sheng yi shi" = one life one world (forever)
// 99 = "jiu jiu" = long-lasting
// Unlucky: 4 = death (si), but we don't hide numbers — we note significance
function _classifyAsianLucky(num, strNum) {
    // Triple/quad 8s — extremely auspicious
    if (/^8+$/.test(strNum) && strNum.length >= 2) {
        return { type: 'asian_lucky', description: strNum.length >= 4 ? 'Extremely lucky (8=prosperity)' : 'Lucky 8s (prosperity)' };
    }
    // Triple/quad 9s — longevity
    if (/^9+$/.test(strNum) && strNum.length >= 2) {
        return { type: 'asian_lucky', description: 'Lucky 9s (longevity)' };
    }
    // Triple/quad 6s — smooth sailing
    if (/^6+$/.test(strNum) && strNum.length >= 3) {
        return { type: 'asian_lucky', description: 'Lucky 6s (smooth sailing)' };
    }
    // Special Chinese number codes
    const chineseCodes = {
        168: '"Yi lu fa" — prosperity all the way',
        520: '"Wo ai ni" — I love you',
        521: '"Wo ai ni" — I love you',
        1314: '"Yi sheng yi shi" — forever & always',
        1688: 'Prosperity road (yi liu ba ba)',
        5201314: 'I love you forever',
        888: 'Triple fortune',
        8888: 'Supreme prosperity',
        9999: 'Eternal longevity',
    };
    if (chineseCodes[num]) {
        return { type: 'asian_lucky', description: chineseCodes[num] };
    }
    // Numbers ending in 88, 888 (e.g. 1088, 10888)
    if (strNum.length >= 4 && /88$/.test(strNum) && num % 100 === 88) {
        return { type: 'asian_lucky', description: 'Ends in 88 (double prosperity)' };
    }
    // Indian auspicious numbers
    // 108 = sacred in Hinduism (prayer beads, cosmic wholeness)
    // 786 = sacred in Islam (Bismillah numerology)
    // 1008 = sacred Hindu (1008 names of deity)
    const sacredNumbers = {
        // Hindu
        108: 'Sacred 108 (cosmic wholeness)',
        1008: 'Sacred 1008 (divine names)',
        1080: 'Sacred 1080 (10 × 108)',
        10008: 'Sacred (prayer count)',
        // Islamic
        786: 'Sacred 786 (Bismillah)',
        // Biblical / Christian
        7: 'Sacred 7 (completeness)',
        12: 'Sacred 12 (tribes & apostles)',
        33: 'Sacred 33 (age of Christ)',
        40: 'Sacred 40 (days of trial)',
        // Universal spiritual
        3: 'Sacred 3 (Trinity, balance)',
    };
    if (sacredNumbers[num]) {
        return { type: 'sacred', description: sacredNumbers[num] };
    }
    return null;
}

// Generate Asian auspicious numbers for the milestone search
function generateAsianAuspicious() {
    const nums = [
        88, 99, 108, 168, 188, 288, 388, 520, 521, 666, 786, 888, 999,
        1008, 1088, 1188, 1314, 1688, 1888, 2888, 3888, 5201314,
        6666, 8888, 9999, 10008, 10088, 88888, 99999
    ];
    return nums;
}

// Get special numbers up to a maximum value
function getSpecialNumbersUpTo(maxValue, settings) {
    const allNumbers = generateAllSpecialNumbers(settings);
    return allNumbers.filter(n => n <= maxValue);
}

// Check if a number is "special" (simplified version for backward compatibility)
function isSpecialNumber(num, settings) {
    const types = classifyNumber(num, settings);
    // Only NAME genuinely notable patterns in the description. Repdigits,
    // palindromes, sequences and alternating patterns are not meaningful to most
    // people (and a palindrome is essentially a repdigit's cousin), so we do NOT
    // mention them — the number itself is the milestone. Powers of 2, scientific
    // constants (π, e, φ) and Fibonacci ARE worth naming. `type` is kept as the
    // top match so scoring/detection is unchanged.
    const MENTIONABLE = ['power_of_2', 'scientific', 'fibonacci'];
    const named = types.filter(t => MENTIONABLE.includes(t.type));
    return {
        type: types[0].type,
        description: named.map(t => t.description).join(', ')
    };
}

// Score how "round" or aesthetically pleasing a number is (higher = better)
function roundnessScore(num) {
    let score = 0;
    const s = String(num);

    // Powers of 10 are the roundest
    if (POWERS_OF_TEN.includes(num)) {
        score += 100 + s.length * 10; // 1000 > 100
        return score;
    }

    // Count trailing zeros — more = rounder
    const trailingZeros = s.length - s.replace(/0+$/, '').length;
    score += trailingZeros * 15;

    // Divisibility hierarchy — finer granularity
    if      (num % 1000000 === 0) score += 70;
    else if (num % 500000 === 0)  score += 55;
    else if (num % 100000 === 0)  score += 45;
    else if (num % 50000 === 0)   score += 38;
    else if (num % 25000 === 0)   score += 32;
    else if (num % 10000 === 0)   score += 28;
    else if (num % 5000 === 0)    score += 22;
    else if (num % 2500 === 0)    score += 18;
    else if (num % 1000 === 0)    score += 15;
    else if (num % 500 === 0)     score += 10;
    else if (num % 250 === 0)     score += 6;
    else if (num % 100 === 0)     score += 3;
    else if (num % 50 === 0)      score += 2;
    else if (num % 10 === 0)      score += 1;

    // Simple multiplier of a power of 10 (e.g., 2000000 = 2 * 10^6)
    const digits = s.replace(/0+$/, '');
    if (digits.length === 1 && trailingZeros >= 2) {
        score += 25; // single non-zero digit like 5000, 3000000
    } else if (digits.length === 2 && trailingZeros >= 3) {
        score += 15; // like 12000, 25000
    }

    // Repdigit bonus
    if (s.length >= 3 && new Set(s).size === 1) score += 20 + s.length * 3;

    // Palindrome bonus — extra for mountain patterns (12321)
    if (s === s.split('').reverse().join('') && s.length >= 3) {
        score += 10;
        const half = s.slice(0, Math.ceil(s.length / 2));
        let isMountain = true;
        for (let i = 1; i < half.length; i++) {
            if (parseInt(half[i]) <= parseInt(half[i - 1])) { isMountain = false; break; }
        }
        if (isMountain && s.length >= 5) score += 25;
    }

    // Fibonacci bonus
    if (FIBONACCI.includes(num)) score += 8;

    // Power of 2 — bigger bonus for large powers (2^20+ is "a binary million")
    if (POWERS_OF_TWO.includes(num)) {
        const exp = Math.round(Math.log2(num));
        score += exp >= 20 ? 50 : (exp >= 10 ? 25 : 12);
    }

    // Scientific constant — interesting but less "round"
    for (const constant of Object.values(SCIENTIFIC_CONSTANTS)) {
        if (constant.numbers.includes(num)) { score += 12; break; }
    }

    // Alternating pattern bonus (1212, 252525, 1515151515)
    if (s.length >= 4) {
        let alt = true;
        const d1 = s[0], d2 = s[1];
        if (d1 !== d2) {
            for (let i = 0; i < s.length; i++) {
                if (s[i] !== (i % 2 === 0 ? d1 : d2)) { alt = false; break; }
            }
        } else {
            alt = false;
        }
        if (alt) score += 5 + s.length * 3;
    }

    // Asian auspicious numbers bonus
    if (_classifyAsianLucky(num, s)) score += 15;
    if ([888, 8888, 9999, 5201314].includes(num)) score += 25;

    // Large bland rounds: trailing zeros inflate the score, but a number like
    // 1,150,000,000 is not actually round in any human sense. Penalise by mantissa.
    if (num >= 1000000 && num % 10 === 0) {
        const mantissa = s.replace(/0+$/, '');
        if (mantissa.length >= 3) score -= 80;
        else if (mantissa.length === 2 && mantissa[1] !== '5') score -= 40;
    }

    return score;
}

// ============================================================
// ADAPTIVE COHERENCE FILTER
// ============================================================
// Assigns a "niceness grade" (0-100) independent of roundnessScore.
// Used by the adaptive filter to decide what passes at each age.
// Young ages: only the nicest. Older ages: accept everything.

function nicenessGrade(num) {
    const s = String(num);

    // Tier 1 (90-100): universally impressive
    if (POWERS_OF_TEN.includes(num)) return 100;
    if (s.length >= 4 && new Set(s).size === 1) return 92; // 1111, 22222

    // Large round numbers (>=1M): niceness comes from how the number READS,
    // not from divisibility. "2 million" and "1.5 billion" are special;
    // "870 million" and "1,150 million" are not — even though both divide 1M.
    // Judged by significant digits (mantissa): 1 digit = clean, 2 digits
    // ending in 5 = a clean half, anything else = bland filler.
    // (Patterns are unaffected: numbers with trailing zeros can never be
    // repdigits, palindromes, alternating, or sequential.)
    if (num >= 1000000 && num % 10 === 0) {
        const mantissa = s.replace(/0+$/, '');
        if (mantissa.length === 1) return 95;                       // 2M, 900M, 3B
        if (mantissa.length === 2 && mantissa[1] === '5') return 72; // 1.5M, 2.5B, 750M
        if (mantissa.length === 2) return 45;                        // 87M, 1.1B — below adult threshold
        return 22;                                                   // 1,150M, 2,340M — junk
    }

    // Same principle one level down (10K–1M): "320,000" is fine but must rank
    // BELOW real patterns (19,191,919); "13,500" (3 sig digits) isn't worth showing.
    if (num >= 10000 && num % 10 === 0) {
        const mantissa = s.replace(/0+$/, '');
        if (mantissa.length === 1) return 90;                        // 20,000 / 500,000
        if (mantissa.length === 2 && mantissa[1] === '5') return 72; // 25,000 / 150,000
        if (mantissa.length === 2) return 65;                        // 320,000 / 13,000 — below patterns
        return 40;                                                   // 13,500 / 12,250 — junk
    }

    // Tier 2 (70-89): most people would appreciate
    if (num >= 100000 && num % 100000 === 0) return 85;
    if (POWERS_OF_TWO.includes(num) && Math.log2(num) >= 20) return 82;
    if (s.length >= 3 && new Set(s).size === 1) return 80; // 111, 222
    if (num >= 10000 && num % 10000 === 0) return 78;
    if (s.length >= 5 && s === s.split('').reverse().join('')) {
        const half = s.slice(0, Math.ceil(s.length / 2));
        let mtn = true;
        for (let i = 1; i < half.length; i++) if (parseInt(half[i]) <= parseInt(half[i - 1])) { mtn = false; break; }
        if (mtn) return 78; // mountain palindromes
        return 72;
    }
    if (num >= 1000 && num % 1000 === 0) return 72;
    if (s.length >= 5 && ('123456789'.includes(s) || '987654321'.includes(s))) return 72;

    // Tier 3 (50-69): interesting to curious people
    if (num >= 1000 && num % 500 === 0) return 65;
    if (POWERS_OF_TWO.includes(num)) return 62;
    if (FIBONACCI.includes(num) && num >= 1000) return 60;
    for (const constant of Object.values(SCIENTIFIC_CONSTANTS)) {
        if (constant.numbers.includes(num) && s.length >= 4) return 58;
    }
    if ([888, 8888, 9999, 5201314, 1314, 520, 168, 786, 108].includes(num)) return 55;
    if (s.length >= 4 && s === s.split('').reverse().join('')) return 52;
    // Long alternating patterns are visually striking (1919191919 > 19100000)
    if (s.length >= 10 && new Set(s).size === 2) return 85; // 10-digit alternating
    if (s.length >= 8 && new Set(s).size === 2) return 75;  // 8-digit alternating
    if (s.length >= 6 && new Set(s).size === 2) return 50;  // 6-digit alternating

    // Tier 4 (30-49): filler — something to show
    if (num % 250 === 0) return 42;
    if (num % 100 === 0) return 35;
    if (num % 50 === 0) return 32;
    if (FIBONACCI.includes(num)) return 30;

    // Tier 5 (10-29): scraping the barrel
    if (num % 10 === 0) return 20;
    if (s.length >= 4 && new Set(s).size === 2) return 15;
    if (s === s.split('').reverse().join('') && s.length >= 3) return 12;

    return 5;
}

// Adaptive filter: strict for young ages (many candidates), loose for older ages (few candidates).
// ageMonths: age of the person in months (used to set the threshold).
// Returns true if the number is "nice enough" to show at this age.
function passesAdaptiveFilter(num, ageMonths) {
    // Smooth linear decay: 80 at birth → 50 at age 40 (month 480), clamp at 50 after
    // Threshold 50 keeps only visually striking numbers: patterns, repdigits, palindromes,
    // multiples of 500+, powers, cultural numbers. Filters bland 100s/250s.
    const threshold = ageMonths >= 480 ? 50 : Math.round(80 - (30 * ageMonths / 480));
    return nicenessGrade(num) >= threshold;
}
