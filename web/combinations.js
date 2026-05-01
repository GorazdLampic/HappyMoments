/**
 * HappyMoments - Combinations Calculator
 * Handles multi-event combinations: sums, differences, ratios, balance points
 */

// ============================================================
// COMBINATION CALCULATIONS
// ============================================================

/**
 * Calculate the current value of a combination
 * @param {object} combination - The combination definition
 * @param {object[]} events - All events
 * @param {string} unit - Time unit
 * @returns {number} Current value
 */
function calculateCombinationValue(combination, events, unit) {
    const now = new Date();

    switch (combination.type) {
        case 'sum':
            return calculateSum(combination.eventIds, events, unit, now);

        case 'difference':
            return calculateDifference(combination.eventIds, events, unit, now);

        case 'ratio':
            return calculateRatio(combination.eventIds, events, unit, now);

        case 'balance':
            return calculateBalanceDiff(combination.groupA, combination.groupB, events, unit, now);

        case 'duration':
            return calculateDurationBetween(combination.eventIds, events, unit);

        default:
            return 0;
    }
}

/**
 * Sum of ages for multiple events
 */
function calculateSum(eventIds, events, unit, date) {
    date = date || new Date();
    let sum = 0;

    for (const id of eventIds) {
        const event = events.find(e => e.id === id);
        if (event) {
            sum += calculateAge(new Date(event.date), date, unit);
        }
    }

    return sum;
}

/**
 * Difference between two events (first minus second)
 */
function calculateDifference(eventIds, events, unit, date) {
    if (eventIds.length < 2) return 0;

    date = date || new Date();
    const event1 = events.find(e => e.id === eventIds[0]);
    const event2 = events.find(e => e.id === eventIds[1]);

    if (!event1 || !event2) return 0;

    const age1 = calculateAge(new Date(event1.date), date, unit);
    const age2 = calculateAge(new Date(event2.date), date, unit);

    return age1 - age2;
}

/**
 * Ratio between two events (first divided by second)
 */
function calculateRatio(eventIds, events, unit, date) {
    if (eventIds.length < 2) return 0;

    date = date || new Date();
    const event1 = events.find(e => e.id === eventIds[0]);
    const event2 = events.find(e => e.id === eventIds[1]);

    if (!event1 || !event2) return 0;

    const age1 = calculateAge(new Date(event1.date), date, unit);
    const age2 = calculateAge(new Date(event2.date), date, unit);

    if (age2 === 0) return Infinity;
    return age1 / age2;
}

/**
 * Calculate difference between two groups (for balance point)
 * Returns groupA_sum - groupB_sum
 */
function calculateBalanceDiff(groupA, groupB, events, unit, date) {
    date = date || new Date();
    const sumA = calculateSum(groupA, events, unit, date);
    const sumB = calculateSum(groupB, events, unit, date);
    return sumA - sumB;
}

/**
 * Duration between earliest and latest event
 */
function calculateDurationBetween(eventIds, events, unit) {
    const selectedEvents = eventIds
        .map(id => events.find(e => e.id === id))
        .filter(e => e)
        .map(e => new Date(e.date).getTime());

    if (selectedEvents.length < 2) return 0;

    const earliest = Math.min(...selectedEvents);
    const latest = Math.max(...selectedEvents);

    const diffMs = latest - earliest;
    const unitConfig = TIME_UNITS[unit];
    return Math.floor(diffMs / unitConfig.msMultiplier);
}

// ============================================================
// COMBINATION STATS
// ============================================================

/**
 * Get stats for a combination across all time units
 */
function getCombinationStats(combination, events) {
    const stats = {};

    for (const [unit, config] of Object.entries(TIME_UNITS)) {
        const value = calculateCombinationValue(combination, events, unit);
        stats[unit] = {
            value: value,
            formatted: formatCombinationValue(value, combination.type),
            name: config.name,
            plural: config.plural
        };
    }

    return stats;
}

/**
 * Format a combination value based on type
 */
function formatCombinationValue(value, type) {
    if (type === 'ratio') {
        return value.toFixed(3);
    }
    return Math.floor(value).toLocaleString();
}

// ============================================================
// FIND MILESTONES FOR COMBINATIONS
// ============================================================

/**
 * Find upcoming milestones for a SUM combination
 */
function findSumMilestones(combination, events, maxResults, maxDaysAhead, settings) {
    maxResults = maxResults || 30;
    maxDaysAhead = maxDaysAhead || 365;
    settings = settings || DEFAULT_SETTINGS;

    const milestones = [];
    const now = new Date();
    const maxDateMs = now.getTime() + maxDaysAhead * 24 * 60 * 60 * 1000;

    // Number of events in the sum
    const numEvents = combination.eventIds.length;
    if (numEvents === 0) return [];

    for (const unit of Object.keys(TIME_UNITS)) {
        const unitConfig = TIME_UNITS[unit];
        const currentSum = calculateSum(combination.eventIds, events, unit, now);
        const relevantNumbers = getSpecialNumbersUpTo(unitConfig.maxReasonable * numEvents, settings);

        for (const num of relevantNumbers) {
            if (num > currentSum) {
                // For sum, combined age increases by numEvents per unit of time
                const unitsNeeded = (num - currentSum) / numEvents;
                const msNeeded = unitsNeeded * unitConfig.msMultiplier;
                const milestoneDate = new Date(now.getTime() + msNeeded);

                if (milestoneDate.getTime() <= maxDateMs) {
                    const specialInfo = isSpecialNumber(num, settings);

                    milestones.push({
                        value: num,
                        unit: unit,
                        unitName: unitConfig.name,
                        date: milestoneDate,
                        type: specialInfo.type,
                        description: `Combined: ${specialInfo.description}`,
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

/**
 * Find upcoming milestones for a DIFFERENCE combination
 */
function findDifferenceMilestones(combination, events, maxResults, maxDaysAhead, settings) {
    maxResults = maxResults || 30;
    maxDaysAhead = maxDaysAhead || 365;
    settings = settings || DEFAULT_SETTINGS;

    const milestones = [];
    const now = new Date();

    // Difference is constant over time (both ages increase equally)
    // So we just show the current difference as a "static" milestone
    for (const unit of Object.keys(TIME_UNITS)) {
        const unitConfig = TIME_UNITS[unit];
        const currentDiff = calculateDifference(combination.eventIds, events, unit, now);

        if (currentDiff > 0) {
            const specialInfo = isSpecialNumber(Math.floor(currentDiff), settings);
            if (specialInfo.type !== 'special') {
                milestones.push({
                    value: Math.floor(currentDiff),
                    unit: unit,
                    unitName: unitConfig.name,
                    date: now,
                    type: specialInfo.type,
                    description: `Age difference: ${specialInfo.description}`,
                    timeUntil: 0,
                    isStatic: true
                });
            }
        }
    }

    return milestones.slice(0, maxResults);
}

/**
 * Find when ratio reaches interesting values (2, 3, 1.5, etc.)
 */
function findRatioMilestones(combination, events, maxResults, maxDaysAhead, settings) {
    maxResults = maxResults || 20;
    maxDaysAhead = maxDaysAhead || 365 * 5; // Look further ahead for ratio milestones

    const milestones = [];
    const now = new Date();

    if (combination.eventIds.length < 2) return [];

    const event1 = events.find(e => e.id === combination.eventIds[0]);
    const event2 = events.find(e => e.id === combination.eventIds[1]);

    if (!event1 || !event2) return [];

    const date1 = new Date(event1.date);
    const date2 = new Date(event2.date);

    // Target ratios to look for
    const targetRatios = [2, 3, 4, 5, 1.5, 2.5, 3.5];

    for (const unit of ['days', 'years']) {
        const unitConfig = TIME_UNITS[unit];

        for (const targetRatio of targetRatios) {
            // Solve: age1(t) / age2(t) = targetRatio
            // (age1_now + x) / (age2_now + x) = targetRatio
            // age1_now + x = targetRatio * age2_now + targetRatio * x
            // x - targetRatio * x = targetRatio * age2_now - age1_now
            // x * (1 - targetRatio) = targetRatio * age2_now - age1_now
            // x = (targetRatio * age2_now - age1_now) / (1 - targetRatio)

            const age1Now = calculateAge(date1, now, unit);
            const age2Now = calculateAge(date2, now, unit);

            if (targetRatio === 1) continue; // Division by zero

            const x = (targetRatio * age2Now - age1Now) / (1 - targetRatio);

            if (x > 0) {
                const msNeeded = x * unitConfig.msMultiplier;
                const milestoneDate = new Date(now.getTime() + msNeeded);

                if (milestoneDate.getTime() <= now.getTime() + maxDaysAhead * 24 * 60 * 60 * 1000) {
                    milestones.push({
                        value: targetRatio,
                        unit: unit,
                        unitName: unitConfig.name,
                        date: milestoneDate,
                        type: 'ratio',
                        description: `${event1.name} will be ${targetRatio}x ${event2.name}'s age`,
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

/**
 * Find when balance point is reached (sum of group A = sum of group B)
 */
function findBalanceMilestones(combination, events, maxResults, maxDaysAhead, settings) {
    maxResults = maxResults || 20;
    maxDaysAhead = maxDaysAhead || 365 * 10;

    const milestones = [];
    const now = new Date();

    if (!combination.groupA || !combination.groupB) return [];

    const numA = combination.groupA.length;
    const numB = combination.groupB.length;

    if (numA === 0 || numB === 0) return [];

    for (const unit of ['days', 'weeks', 'years']) {
        const unitConfig = TIME_UNITS[unit];

        const sumA = calculateSum(combination.groupA, events, unit, now);
        const sumB = calculateSum(combination.groupB, events, unit, now);

        // Group A increases by numA per unit, Group B by numB per unit
        // Find when sumA + numA * x = sumB + numB * x
        // x * (numA - numB) = sumB - sumA
        // x = (sumB - sumA) / (numA - numB)

        if (numA === numB) {
            // Same growth rate - they never cross (unless already equal)
            if (sumA === sumB) {
                milestones.push({
                    value: sumA,
                    unit: unit,
                    unitName: unitConfig.name,
                    date: now,
                    type: 'balance',
                    description: `Groups are balanced at ${sumA.toLocaleString()} ${unitConfig.plural}!`,
                    timeUntil: 0,
                    isBalance: true
                });
            }
            continue;
        }

        const x = (sumB - sumA) / (numA - numB);

        if (x > 0) {
            const msNeeded = x * unitConfig.msMultiplier;
            const milestoneDate = new Date(now.getTime() + msNeeded);

            if (milestoneDate.getTime() <= now.getTime() + maxDaysAhead * 24 * 60 * 60 * 1000) {
                const balanceValue = sumA + numA * x;

                milestones.push({
                    value: Math.round(balanceValue),
                    unit: unit,
                    unitName: unitConfig.name,
                    date: milestoneDate,
                    type: 'balance',
                    description: `Balance point: both groups at ${Math.round(balanceValue).toLocaleString()} ${unitConfig.plural}`,
                    timeUntil: milestoneDate.getTime() - now.getTime(),
                    isBalance: true
                });
            }
        }
    }

    return milestones
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, maxResults);
}

/**
 * Find milestones for duration between events
 */
function findDurationBetweenMilestones(combination, events, maxResults, settings) {
    // Duration is static - just check if current value is special
    const milestones = [];

    for (const unit of Object.keys(TIME_UNITS)) {
        const duration = calculateDurationBetween(combination.eventIds, events, unit);

        if (duration > 0) {
            const specialInfo = isSpecialNumber(duration, settings);
            const unitConfig = TIME_UNITS[unit];

            milestones.push({
                value: duration,
                unit: unit,
                unitName: unitConfig.name,
                date: new Date(),
                type: specialInfo.type,
                description: `Duration: ${specialInfo.description}`,
                timeUntil: 0,
                isStatic: true
            });
        }
    }

    return milestones.slice(0, maxResults || 20);
}

/**
 * Main function to find milestones for any combination type
 */
function findCombinationMilestones(combination, events, maxResults, maxDaysAhead, settings) {
    switch (combination.type) {
        case 'sum':
            return findSumMilestones(combination, events, maxResults, maxDaysAhead, settings);

        case 'difference':
            return findDifferenceMilestones(combination, events, maxResults, maxDaysAhead, settings);

        case 'ratio':
            return findRatioMilestones(combination, events, maxResults, maxDaysAhead, settings);

        case 'balance':
            return findBalanceMilestones(combination, events, maxResults, maxDaysAhead, settings);

        case 'duration':
            return findDurationBetweenMilestones(combination, events, maxResults, settings);

        default:
            return [];
    }
}

// ============================================================
// INTERESTING FINDINGS
// ============================================================

/**
 * Find interesting correlations for a combination
 */
function findInterestingFindings(combination, events, settings) {
    const findings = [];
    const now = new Date();

    if (combination.type === 'sum') {
        // Check for upcoming round number milestones
        const yearsSum = calculateSum(combination.eventIds, events, 'years', now);
        const nextRound = Math.ceil(yearsSum / 10) * 10;
        const numEvents = combination.eventIds.length;

        if (nextRound > yearsSum && nextRound <= yearsSum + 10) {
            const yearsNeeded = (nextRound - yearsSum) / numEvents;
            const daysNeeded = yearsNeeded * 365.25;

            if (daysNeeded < 365) {
                findings.push({
                    text: `Combined age will reach ${nextRound} years in about ${Math.ceil(daysNeeded)} days!`,
                    type: 'milestone'
                });
            }
        }

        // Check if combined seconds is approaching a billion
        const secondsSum = calculateSum(combination.eventIds, events, 'seconds', now);
        const nextBillion = Math.ceil(secondsSum / 1000000000) * 1000000000;
        if (nextBillion - secondsSum < 100000000 * numEvents) { // Within ~3 years
            const secondsNeeded = (nextBillion - secondsSum) / numEvents;
            const daysNeeded = secondsNeeded / 86400;

            findings.push({
                text: `Combined age will reach ${(nextBillion / 1000000000).toFixed(0)} billion seconds in about ${Math.ceil(daysNeeded)} days!`,
                type: 'milestone'
            });
        }
    }

    if (combination.type === 'ratio') {
        const ratio = calculateRatio(combination.eventIds, events, 'years', now);

        if (ratio > 1.9 && ratio < 2.1) {
            findings.push({
                text: `The first person is almost exactly twice as old as the second!`,
                type: 'interesting'
            });
        }

        if (Math.abs(ratio - Math.round(ratio)) < 0.05 && ratio > 1) {
            findings.push({
                text: `Age ratio is very close to exactly ${Math.round(ratio)}:1`,
                type: 'interesting'
            });
        }
    }

    if (combination.type === 'balance') {
        const diff = calculateBalanceDiff(combination.groupA, combination.groupB, events, 'years', now);

        if (Math.abs(diff) < 1) {
            findings.push({
                text: `The groups are almost perfectly balanced in age!`,
                type: 'balance'
            });
        }
    }

    return findings;
}

// ============================================================
// SUGGESTED COMBINATIONS
// ============================================================

/**
 * Generate suggested combinations based on events
 */
function suggestCombinations(events) {
    const suggestions = [];

    // If there are multiple births, suggest family total age
    const births = events.filter(e => e.type === 'birth');
    if (births.length >= 2) {
        suggestions.push({
            name: 'Family Total Age',
            type: 'sum',
            eventIds: births.map(e => e.id),
            description: `Track the combined age of ${births.length} family members`
        });
    }

    // If there's a parent and child (determined by age difference > 18 years)
    if (births.length >= 2) {
        const sortedByAge = [...births].sort((a, b) => new Date(a.date) - new Date(b.date));

        for (let i = 0; i < sortedByAge.length - 1; i++) {
            const older = sortedByAge[i];
            const younger = sortedByAge[sortedByAge.length - 1];

            const ageDiff = calculateAge(new Date(older.date), new Date(younger.date), 'years');

            if (ageDiff >= 18) {
                suggestions.push({
                    name: `${older.person || older.name} vs ${younger.person || younger.name} Ratio`,
                    type: 'ratio',
                    eventIds: [older.id, younger.id],
                    description: 'Track when one becomes 2x, 3x the age of the other'
                });
            }
        }
    }

    // If there are kids and parents, suggest balance point
    if (births.length >= 3) {
        const sortedByAge = [...births].sort((a, b) => new Date(a.date) - new Date(b.date));
        const potentialParents = sortedByAge.slice(0, 2);
        const potentialKids = sortedByAge.slice(2);

        if (potentialKids.length > 0) {
            suggestions.push({
                name: 'Parents vs Kids Balance',
                type: 'balance',
                groupA: potentialParents.map(e => e.id),
                groupB: potentialKids.map(e => e.id),
                description: 'Find when kids\' combined age equals parents\' combined age'
            });
        }
    }

    return suggestions;
}

// ============================================================
// EXPORT FOR USE IN APP
// ============================================================

window.calculateCombinationValue = calculateCombinationValue;
window.getCombinationStats = getCombinationStats;
window.findCombinationMilestones = findCombinationMilestones;
window.findInterestingFindings = findInterestingFindings;
window.suggestCombinations = suggestCombinations;
window.calculateSum = calculateSum;
window.calculateDifference = calculateDifference;
window.calculateRatio = calculateRatio;
window.calculateBalanceDiff = calculateBalanceDiff;
