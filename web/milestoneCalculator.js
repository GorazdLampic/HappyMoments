/**
 * HappyMoments - Milestone Calculator (Web Version)
 * Extended with duration support and settings-aware calculations
 */

// Calculate age/duration in a specific time unit
function calculateAge(startDate, endDate, unit) {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate ? (endDate instanceof Date ? endDate : new Date(endDate)) : new Date();
    unit = unit || 'days';

    if (unit === 'months') {
        return calendarMonthsBetween(start, end);
    }
    if (unit === 'years') {
        return calendarYearsBetween(start, end);
    }

    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return 0;
    const unitConfig = TIME_UNITS[unit];
    return Math.floor(diffMs / unitConfig.msMultiplier);
}

// Calendar-accurate month count
function calendarMonthsBetween(start, end) {
    if (end < start) return 0;
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (end.getDate() < start.getDate()) months--;
    return Math.max(0, months);
}

// Calendar-accurate year count
function calendarYearsBetween(start, end) {
    if (end < start) return 0;
    let years = end.getFullYear() - start.getFullYear();
    const monthDiff = end.getMonth() - start.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < start.getDate())) years--;
    return Math.max(0, years);
}

// Calculate when a milestone will be reached
function calculateMilestoneDate(startDate, targetValue, unit) {
    const start = startDate instanceof Date ? startDate : new Date(startDate);

    if (unit === 'months') {
        return addCalendarMonths(start, targetValue);
    }
    if (unit === 'years') {
        return addCalendarMonths(start, targetValue * 12);
    }

    const unitConfig = TIME_UNITS[unit];
    const milestoneMs = start.getTime() + targetValue * unitConfig.msMultiplier;
    return new Date(milestoneMs);
}

// Add N calendar months to a date
function addCalendarMonths(date, months) {
    const result = new Date(date);
    const targetMonth = result.getMonth() + months;
    result.setMonth(targetMonth);
    // Handle end-of-month overflow (e.g., Jan 31 + 1 month = Feb 28, not Mar 3)
    if (result.getDate() !== date.getDate()) {
        result.setDate(0); // last day of previous month
    }
    return result;
}

// Get current age/duration in all time units
function getCurrentAgeStats(startDate, endDate) {
    endDate = endDate || new Date();
    const stats = {};

    for (const [unit, config] of Object.entries(TIME_UNITS)) {
        const age = calculateAge(startDate, endDate, unit);
        stats[unit] = {
            value: age,
            formatted: age.toLocaleString(),
            name: config.name,
            plural: config.plural
        };
    }

    return stats;
}

// Find all upcoming milestones (settings-aware, adaptive filter)
function findAllUpcomingMilestones(startDate, maxResults, maxDaysAhead, settings) {
    maxResults = maxResults || 50;
    maxDaysAhead = maxDaysAhead || 365;
    settings = settings || DEFAULT_SETTINGS;

    const now = new Date();
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const maxDateMs = now.getTime() + maxDaysAhead * 24 * 60 * 60 * 1000;
    const milestones = [];

    // Calculate age in months for the adaptive filter threshold
    const ageMonths = calendarMonthsBetween(start, now);

    for (const unit of Object.keys(TIME_UNITS)) {
        const unitConfig = TIME_UNITS[unit];
        const currentAge = calculateAge(startDate, now, unit);
        const relevantNumbers = getSpecialNumbersUpTo(unitConfig.maxReasonable, settings);

        for (const num of relevantNumbers) {
            if (num > currentAge) {
                // Adaptive coherence filter: strict for young ages, loose for older
                if (typeof passesAdaptiveFilter === 'function' && !passesAdaptiveFilter(num, ageMonths)) continue;

                const milestoneDate = calculateMilestoneDate(startDate, num, unit);

                if (milestoneDate.getTime() <= maxDateMs) {
                    const specialInfo = isSpecialNumber(num, settings);

                    milestones.push({
                        value: num,
                        unit: unit,
                        unitName: unitConfig.name,
                        date: milestoneDate,
                        type: specialInfo.type,
                        description: specialInfo.description,
                        timeUntil: milestoneDate.getTime() - now.getTime()
                    });
                }
            }
        }
    }

    return milestones
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, maxResults);
}

// Find "Big Milestones" — next power of 10 for key units, max 30 years ahead
// These are the viral hooks: "1 billion seconds", "1 million minutes", "100,000 hours"
function findBigMilestones(startDate, settings) {
    settings = settings || DEFAULT_SETTINGS;
    const now = new Date();
    const milestones = [];
    const bigUnits = ['seconds', 'minutes', 'hours', 'days'];
    const powersOf10 = [1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000, 10000000000];
    const maxMs = 1.5 * 365.25 * 24 * 60 * 60 * 1000; // 1.5 years max

    for (const unit of bigUnits) {
        const unitConfig = TIME_UNITS[unit];
        if (!unitConfig) continue;
        const currentAge = calculateAge(startDate, now, unit);

        for (const pow of powersOf10) {
            if (pow <= currentAge) continue;
            if (pow > unitConfig.maxReasonable) break;

            const milestoneDate = calculateMilestoneDate(startDate, pow, unit);
            if (milestoneDate <= now) continue;

            const timeUntil = milestoneDate.getTime() - now.getTime();
            // Skip if more than 30 years away
            if (timeUntil > maxMs) continue;
            const specialInfo = isSpecialNumber(pow, settings);

            milestones.push({
                value: pow,
                unit: unit,
                unitName: unitConfig.name,
                date: milestoneDate,
                type: specialInfo.type,
                description: specialInfo.description,
                timeUntil: timeUntil,
                isBigMilestone: true
            });
            break; // Only the next power of 10 per unit
        }
    }

    return milestones.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Find milestones for a fixed duration (between two dates)
function findDurationMilestones(startDate, endDate, maxResults, settings) {
    maxResults = maxResults || 50;
    settings = settings || DEFAULT_SETTINGS;

    const isOngoing = !endDate || endDate >= new Date();
    const effectiveEndDate = isOngoing ? new Date() : endDate;
    const now = new Date();

    const milestones = [];

    for (const unit of Object.keys(TIME_UNITS)) {
        const unitConfig = TIME_UNITS[unit];
        const currentDuration = calculateAge(startDate, effectiveEndDate, unit);
        const relevantNumbers = getSpecialNumbersUpTo(unitConfig.maxReasonable, settings);

        for (const num of relevantNumbers) {
            // Skip bland large numbers (e.g. "2.66 billion") — keep only nicely
            // readable values; matches the combined-milestone niceness filter.
            if (num >= 1000000 && typeof nicenessGrade === 'function' && nicenessGrade(num) < 50) continue;
            const milestoneDate = calculateMilestoneDate(startDate, num, unit);
            const specialInfo = isSpecialNumber(num, settings);

            // For ongoing durations, show upcoming milestones
            if (isOngoing && num > currentDuration) {
                milestones.push({
                    value: num,
                    unit: unit,
                    unitName: unitConfig.name,
                    date: milestoneDate,
                    type: specialInfo.type,
                    description: specialInfo.description,
                    timeUntil: milestoneDate.getTime() - now.getTime(),
                    isPast: false
                });
            }
            // For fixed durations, show past milestones within the range
            else if (!isOngoing && num <= currentDuration && milestoneDate >= startDate) {
                milestones.push({
                    value: num,
                    unit: unit,
                    unitName: unitConfig.name,
                    date: milestoneDate,
                    type: specialInfo.type,
                    description: specialInfo.description,
                    timeSince: now.getTime() - milestoneDate.getTime(),
                    isPast: true
                });
            }
        }
    }

    // Sort by date
    if (isOngoing) {
        return milestones
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, maxResults);
    } else {
        return milestones
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, maxResults);
    }
}

// Format time distance in short human-readable form
function formatTimeDistance(ms) {
    // Localized short unit abbreviations (reuse the existing unit_* keys);
    // falls back to English abbreviations outside the browser/runtime.
    const EN = { unit_sec: 'sec', unit_min: 'min', unit_hrs: 'hrs', unit_d: 'd', unit_w: 'w', unit_mo: 'mo', unit_y: 'y' };
    const u = k => (typeof I18N !== 'undefined' && I18N.t) ? I18N.t(k) : EN[k];
    const absMs = Math.abs(ms);

    if (absMs < 60 * 1000) {
        return '<1 ' + u('unit_min');
    }

    if (absMs < 60 * 60 * 1000) {
        const minutes = Math.floor(absMs / (60 * 1000));
        return `${minutes} ${u('unit_min')}`;
    }

    if (absMs < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(absMs / (60 * 60 * 1000));
        return `${hours}${u('unit_hrs')}`;
    }

    if (absMs < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(absMs / (24 * 60 * 60 * 1000));
        return `${days}${u('unit_d')}`;
    }

    if (absMs < 30 * 24 * 60 * 60 * 1000) {
        const weeks = Math.floor(absMs / (7 * 24 * 60 * 60 * 1000));
        const days = Math.floor((absMs % (7 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
        if (days > 0) {
            return `${weeks}${u('unit_w')} ${days}${u('unit_d')}`;
        }
        return `${weeks}${u('unit_w')}`;
    }

    const months = Math.floor(absMs / (30 * 24 * 60 * 60 * 1000));
    if (months < 12) {
        const weeks = Math.floor((absMs % (30 * 24 * 60 * 60 * 1000)) / (7 * 24 * 60 * 60 * 1000));
        if (weeks > 0 && months < 6) {
            return `${months}${u('unit_mo')} ${weeks}${u('unit_w')}`;
        }
        return `${months}${u('unit_mo')}`;
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
        return `${years}${u('unit_y')}`;
    }
    return `${years}${u('unit_y')} ${remainingMonths}${u('unit_mo')}`;
}

// Format date for display
function getAppLocale() {
    // Locale keys use underscores (pt_BR) but Intl APIs need BCP-47 tags (pt-BR)
    return (typeof I18N !== 'undefined') ? I18N.getLocale().replace('_', '-') : 'en';
}

function formatDate(date) {
    return date.toLocaleDateString(getAppLocale(), {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format date short (without time)
function formatDateShort(date) {
    return date.toLocaleDateString(getAppLocale(), {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// ============================================================
// COSMIC CYCLES — Planetary Return Milestones
// ============================================================
// These are astronomical facts: when a planet completes a full orbit
// since the person's birthday, it returns to (approximately) the same
// position it occupied at birth.

const PLANETARY_PERIODS = {
    moon:    { days: 27.322,   name: 'lunar return',    unitKey: 'lunar_return' },
    mercury: { days: 87.969,  name: 'Mercury return',  unitKey: 'mercury_return' },
    venus:   { days: 224.701, name: 'Venus return',    unitKey: 'venus_return' },
    mars:    { days: 686.971, name: 'Mars return',     unitKey: 'mars_return' },
    jupiter: { days: 4332.59, name: 'Jupiter return',  unitKey: 'jupiter_return' },
    saturn:  { days: 10759.22,name: 'Saturn return',   unitKey: 'saturn_return' },
    chiron:  { days: 18520,   name: 'Chiron return',   unitKey: 'chiron_return' }
};

// Which return numbers are "round enough" for fast planets
const FAST_PLANET_ROUND_RETURNS = {
    moon:    [500, 1000, 1500, 2000, 2500, 3000, 5000, 10000],
    mercury: [100, 200, 300, 500, 1000],
    venus:   [50, 100, 150, 200, 250, 500]
};

// Descriptions for notable returns
function getCosmicDescription(planet, returnNumber) {
    const key = planet + '_' + returnNumber;
    const descriptions = {
        saturn_1:  'First Saturn return \u2014 a major life transition',
        saturn_2:  'Second Saturn return \u2014 wisdom and mastery',
        saturn_3:  'Third Saturn return \u2014 legacy and reflection',
        jupiter_1: 'First Jupiter return \u2014 growth chapter begins',
        jupiter_2: 'Second Jupiter return \u2014 expanding horizons',
        jupiter_3: 'Third Jupiter return \u2014 finding purpose',
        jupiter_4: 'Fourth Jupiter return \u2014 deeper understanding',
        jupiter_5: 'Fifth Jupiter return \u2014 life in perspective',
        jupiter_6: 'Sixth Jupiter return \u2014 gathered wisdom',
        jupiter_7: 'Seventh Jupiter return \u2014 full circle',
        chiron_1:  'Chiron return \u2014 the wounded healer, wisdom milestone',
        mars_1:    'Mars return \u2014 energy renewal cycle'
    };

    if (descriptions[key]) return descriptions[key];

    // Generic descriptions
    const planetNames = {
        saturn: 'Saturn', jupiter: 'Jupiter', mars: 'Mars',
        chiron: 'Chiron', venus: 'Venus', mercury: 'Mercury', moon: 'Moon'
    };
    const pName = planetNames[planet] || planet;

    if (planet === 'mars') return 'Mars return \u2014 energy renewal cycle';
    if (planet === 'moon') return ordinal(returnNumber) + ' lunar return \u2014 Moon completes its orbit';
    if (planet === 'mercury') return ordinal(returnNumber) + ' Mercury return \u2014 Mercury completes its orbit';
    if (planet === 'venus') return ordinal(returnNumber) + ' Venus return \u2014 Venus completes its orbit';
    return ordinal(returnNumber) + ' ' + pName + ' return \u2014 ' + pName + ' completes its orbit';
}

function ordinal(n) {
    const s = ['th','st','nd','rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Find upcoming cosmic (planetary return) milestones for a given birthday.
 * Returns milestones in the same format as findBigMilestones.
 *
 * @param {Date|string} startDate - Birthday / start date
 * @returns {Array} Array of milestone objects with isCosmic flag
 */
function findCosmicMilestones(startDate) {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const now = new Date();
    const maxMs = 1.5 * 365.25 * 24 * 60 * 60 * 1000; // 1.5 years ahead
    const maxDate = new Date(now.getTime() + maxMs);
    const milestones = [];
    const dayMs = 24 * 60 * 60 * 1000;

    // Days since birth
    const daysSinceBirth = (now.getTime() - start.getTime()) / dayMs;
    if (daysSinceBirth < 0) return milestones; // future date

    for (const [planet, info] of Object.entries(PLANETARY_PERIODS)) {
        const periodDays = info.days;
        const isFast = !!FAST_PLANET_ROUND_RETURNS[planet];

        // Current return number (how many full orbits completed)
        const currentReturn = Math.floor(daysSinceBirth / periodDays);

        if (isFast) {
            // Fast planets: only show "round" return numbers
            const roundReturns = FAST_PLANET_ROUND_RETURNS[planet];
            for (const rn of roundReturns) {
                if (rn <= currentReturn) continue; // already passed
                const milestoneDate = new Date(start.getTime() + rn * periodDays * dayMs);
                if (milestoneDate <= now) continue;
                if (milestoneDate > maxDate) continue;

                milestones.push({
                    value: rn,
                    unit: info.unitKey,
                    unitName: info.name,
                    date: milestoneDate,
                    type: 'cosmic',
                    description: getCosmicDescription(planet, rn),
                    timeUntil: milestoneDate.getTime() - now.getTime(),
                    isCosmic: true,
                    planet: planet
                });
            }
        } else {
            // Slow planets (Mars, Jupiter, Saturn, Chiron): show ALL upcoming returns
            // Start from the next return after current
            const startReturn = currentReturn + 1;
            // Cap search at a reasonable number of returns
            const maxReturns = planet === 'mars' ? 3 : 5;
            for (let rn = startReturn; rn < startReturn + maxReturns; rn++) {
                const milestoneDate = new Date(start.getTime() + rn * periodDays * dayMs);
                if (milestoneDate <= now) continue;
                if (milestoneDate > maxDate) break; // ordered, so can break

                const isSaturnReturn = (planet === 'saturn');
                milestones.push({
                    value: rn,
                    unit: info.unitKey,
                    unitName: info.name,
                    date: milestoneDate,
                    type: 'cosmic',
                    description: getCosmicDescription(planet, rn),
                    timeUntil: milestoneDate.getTime() - now.getTime(),
                    isCosmic: true,
                    isSaturnReturn: isSaturnReturn,
                    isVerySpecialCosmic: isSaturnReturn || planet === 'chiron' || planet === 'jupiter',
                    planet: planet
                });
            }
        }
    }

    return milestones.sort((a, b) => a.date.getTime() - b.date.getTime());
}
