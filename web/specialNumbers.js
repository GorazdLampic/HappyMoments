/**
 * HappyMoments - Special Numbers Definition (Web Version)
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

// Nice round numbers (multiples of 500, 1000, etc.)
const ROUND_NUMBERS = [
    // Hundreds
    500,
    // Thousands
    1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000,
    5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500,
    // Ten thousands
    10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000,
    60000, 70000, 75000, 80000, 90000,
    // Hundred thousands
    100000, 150000, 200000, 250000, 300000, 400000, 500000,
    600000, 700000, 750000, 800000, 900000,
    // Millions
    1000000, 1500000, 2000000, 2500000, 3000000, 4000000, 5000000,
    6000000, 7000000, 8000000, 9000000, 10000000,
    15000000, 20000000, 25000000, 30000000, 40000000, 50000000,
    75000000, 100000000,
    // Hundred millions
    100000000, 150000000, 200000000, 250000000, 300000000, 400000000, 500000000,
    600000000, 700000000, 750000000, 800000000, 900000000,
    // Billions (for combined seconds milestones!)
    1000000000, 1500000000, 2000000000, 2500000000, 3000000000,
    3500000000, 4000000000, 4500000000, 5000000000,
    6000000000, 7000000000, 7500000000, 8000000000, 9000000000, 10000000000,
    // Even larger for big combined milestones
    11000000000, 12000000000, 12500000000, 13000000000, 14000000000, 15000000000,
    20000000000, 25000000000, 30000000000, 50000000000, 100000000000
];

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

// Generate palindrome numbers - SELECTIVE VERSION
// Only includes interesting palindromes to avoid too frequent milestones
function generatePalindromes(maxDigits = 10) {
    const palindromes = new Set();

    // === SPECIAL MATHEMATICAL PALINDROMES ===

    // Mountain palindromes: ascending then descending (1234321, 123454321)
    palindromes.add(121);
    palindromes.add(12321);
    palindromes.add(1234321);
    palindromes.add(123454321);
    palindromes.add(12345654321);

    // Odd digits mountain: 1357531, 13579531
    palindromes.add(131);
    palindromes.add(13531);
    palindromes.add(1357531);
    palindromes.add(135797531);

    // Even digits mountain: 24642, 2468642
    palindromes.add(242);
    palindromes.add(24642);
    palindromes.add(2468642);

    // Powers of 2 style: 1248421, 12481
    palindromes.add(121);
    palindromes.add(1248421);
    palindromes.add(14841);

    // Fibonacci-style: 11235...
    palindromes.add(11211);
    palindromes.add(112358531211);

    // === REPDIGIT PALINDROMES (special subset) ===
    // These are inherently palindromes but we include some special ones
    [111, 1111, 11111, 111111, 1111111].forEach(n => palindromes.add(n));
    [777, 7777, 77777, 777777, 7777777].forEach(n => palindromes.add(n));

    // === ROUND PALINDROMES (with zeros) ===
    palindromes.add(101);
    palindromes.add(1001);
    palindromes.add(10001);
    palindromes.add(100001);
    palindromes.add(1000001);
    palindromes.add(10000001);
    palindromes.add(100000001);

    palindromes.add(10101);
    palindromes.add(101101);
    palindromes.add(1001001);
    palindromes.add(10011001);

    // === BINARY-STYLE PALINDROMES ===
    palindromes.add(10101);
    palindromes.add(1010101);
    palindromes.add(101010101);
    palindromes.add(11011);
    palindromes.add(110011);
    palindromes.add(1100011);

    // === PRIME-LIKE PALINDROMES (using prime digits 2,3,5,7) ===
    palindromes.add(232);
    palindromes.add(252);
    palindromes.add(272);
    palindromes.add(353);
    palindromes.add(373);
    palindromes.add(535);
    palindromes.add(575);
    palindromes.add(757);
    palindromes.add(2332);
    palindromes.add(2552);
    palindromes.add(2772);
    palindromes.add(3553);
    palindromes.add(3773);
    palindromes.add(5335);
    palindromes.add(5775);
    palindromes.add(7337);
    palindromes.add(7557);
    palindromes.add(23532);
    palindromes.add(25752);
    palindromes.add(27572);
    palindromes.add(35753);
    palindromes.add(37573);
    palindromes.add(57375);
    palindromes.add(75357);

    // === DOUBLE-DIGIT CORE PALINDROMES ===
    // Format: ABBA, ABCBA with nice patterns
    palindromes.add(1221);
    palindromes.add(2112);
    palindromes.add(3443);
    palindromes.add(4554);
    palindromes.add(5665);
    palindromes.add(6776);
    palindromes.add(7887);
    palindromes.add(8998);

    // === MILESTONE PALINDROMES (round-ish) ===
    palindromes.add(505);
    palindromes.add(5005);
    palindromes.add(50005);
    palindromes.add(500005);
    palindromes.add(5000005);

    palindromes.add(909);
    palindromes.add(9009);
    palindromes.add(90009);
    palindromes.add(900009);
    palindromes.add(9000009);

    // === DATE-LIKE PALINDROMES ===
    palindromes.add(12021); // Like 1-20-21
    palindromes.add(12121);
    palindromes.add(12221);
    palindromes.add(12321);
    palindromes.add(21012);
    palindromes.add(22022);
    palindromes.add(31013);

    // === LARGE SPECIAL PALINDROMES ===
    palindromes.add(1000001);
    palindromes.add(1234321);
    palindromes.add(1357531);
    palindromes.add(7654567);
    palindromes.add(9876789);
    palindromes.add(10000001);
    palindromes.add(12344321);
    palindromes.add(12345654321);
    palindromes.add(100000001);
    palindromes.add(123454321);
    palindromes.add(1000000001);

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

// Generate sequential numbers (123, 1234, 4321, etc.)
function generateSequentials() {
    const sequentials = [];

    // Ascending: 123, 1234, 12345...
    for (let length = 3; length <= 9; length++) {
        let num = '';
        for (let i = 1; i <= length; i++) num += i;
        sequentials.push(parseInt(num, 10));
    }

    // Descending: 987, 9876, 98765...
    for (let length = 3; length <= 9; length++) {
        let num = '';
        for (let i = 9; i >= 9 - length + 1; i--) num += i;
        sequentials.push(parseInt(num, 10));
    }

    // Partial sequences
    sequentials.push(234, 345, 456, 567, 678, 789);
    sequentials.push(2345, 3456, 4567, 5678, 6789);
    sequentials.push(876, 765, 654, 543, 432, 321);
    sequentials.push(8765, 7654, 6543, 5432, 4321);

    return [...new Set(sequentials)].sort((a, b) => a - b);
}

// Generate lucky digit patterns (numbers made only of specified digits)
function generateLuckyPatterns(luckyDigits, maxValue = 10000000000) {
    if (!luckyDigits || luckyDigits.length === 0) return [];

    const patterns = new Set();

    // Generate combinations of lucky digits
    function generate(current, depth) {
        if (current > maxValue || depth > 10) return;
        if (current > 0 && depth >= 2) {
            patterns.add(current);
        }
        for (const digit of luckyDigits) {
            generate(current * 10 + digit, depth + 1);
        }
    }

    for (const digit of luckyDigits) {
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
    luckyDigits: [7],
    patterns: {
        powers: true,
        repdigits: true,
        alternating: true,
        palindromes: true,
        sequential: true,
        scientific: true,
        lucky: false
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
        name: 'sec',
        plural: 'seconds',
        short: 's',
        msMultiplier: 1000,
        maxReasonable: 15000000000  // 15 billion for combined milestones (10B+)
    },
    minutes: {
        name: 'min',
        plural: 'minutes',
        short: 'min',
        msMultiplier: 60 * 1000,
        maxReasonable: 200000000  // 200 million for combined
    },
    hours: {
        name: 'hrs',
        plural: 'hours',
        short: 'h',
        msMultiplier: 60 * 60 * 1000,
        maxReasonable: 3000000  // 3 million for combined
    },
    days: {
        name: 'd',
        plural: 'days',
        short: 'd',
        msMultiplier: 24 * 60 * 60 * 1000,
        maxReasonable: 50000
    },
    weeks: {
        name: 'w',
        plural: 'weeks',
        short: 'w',
        msMultiplier: 7 * 24 * 60 * 60 * 1000,
        maxReasonable: 7000
    },
    months: {
        name: 'mo',
        plural: 'months',
        short: 'mo',
        msMultiplier: 30.44 * 24 * 60 * 60 * 1000,
        maxReasonable: 1500
    },
    years: {
        name: 'y',
        plural: 'years',
        short: 'y',
        msMultiplier: 365.25 * 24 * 60 * 60 * 1000,
        maxReasonable: 150
    }
};

// ============================================================
// DYNAMIC NUMBER GENERATION BASED ON SETTINGS
// ============================================================

function generateAllSpecialNumbers(settings) {
    settings = settings || DEFAULT_SETTINGS;
    const numbers = new Set();

    // Powers of 10
    if (settings.patterns.powers) {
        POWERS_OF_TEN.forEach(n => numbers.add(n));
        // Also add nice round numbers (5000, 2000, etc.)
        ROUND_NUMBERS.forEach(n => numbers.add(n));
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

    // Custom numbers
    if (settings.customNumbers && settings.customNumbers.length > 0) {
        settings.customNumbers.forEach(n => numbers.add(n));
    }

    return [...numbers].sort((a, b) => a - b);
}

// ============================================================
// NUMBER CLASSIFICATION
// ============================================================

function classifyNumber(num, settings) {
    settings = settings || DEFAULT_SETTINGS;
    const strNum = String(num);
    const types = [];

    // Power of 10
    if (POWERS_OF_TEN.includes(num)) {
        types.push({ type: 'power_of_10', description: `Power of 10` });
    }

    // Nice round number (multiple of 500 or 1000)
    if (ROUND_NUMBERS.includes(num) && !POWERS_OF_TEN.includes(num)) {
        if (num % 1000 === 0) {
            types.push({ type: 'round', description: `${(num/1000).toLocaleString()}k milestone` });
        } else {
            types.push({ type: 'round', description: `Round number` });
        }
    }

    // Repdigit
    if (strNum.length >= 2 && new Set(strNum).size === 1) {
        types.push({ type: 'repdigit', description: `All ${strNum[0]}s` });
    }

    // Palindrome
    if (strNum === strNum.split('').reverse().join('') && strNum.length >= 3) {
        types.push({ type: 'palindrome', description: `Palindrome` });
    }

    // Sequential ascending
    if ('123456789'.includes(strNum) && strNum.length >= 3) {
        types.push({ type: 'sequential', description: `Ascending sequence` });
    }

    // Sequential descending
    if ('987654321'.includes(strNum) && strNum.length >= 3) {
        types.push({ type: 'sequential', description: `Descending sequence` });
    }

    // Alternating pattern
    if (isAlternating(strNum) && strNum.length >= 4) {
        types.push({ type: 'alternating', description: `Alternating pattern` });
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
            types.push({ type: 'lucky', description: `Lucky digits` });
        }
    }

    // Custom number
    if (settings.customNumbers && settings.customNumbers.includes(num)) {
        types.push({ type: 'custom', description: `Your special number` });
    }

    if (types.length === 0) {
        types.push({ type: 'special', description: 'Special number' });
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

// Get special numbers up to a maximum value
function getSpecialNumbersUpTo(maxValue, settings) {
    const allNumbers = generateAllSpecialNumbers(settings);
    return allNumbers.filter(n => n <= maxValue);
}

// Check if a number is "special" (simplified version for backward compatibility)
function isSpecialNumber(num, settings) {
    const types = classifyNumber(num, settings);
    return {
        type: types[0].type,
        description: types.map(t => t.description).join(', ')
    };
}
