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

// Find all upcoming milestones (settings-aware)
function findAllUpcomingMilestones(startDate, maxResults, maxDaysAhead, settings) {
    maxResults = maxResults || 50;
    maxDaysAhead = maxDaysAhead || 365;
    settings = settings || DEFAULT_SETTINGS;

    const now = new Date();
    const maxDateMs = now.getTime() + maxDaysAhead * 24 * 60 * 60 * 1000;
    const milestones = [];

    for (const unit of Object.keys(TIME_UNITS)) {
        const unitConfig = TIME_UNITS[unit];
        const currentAge = calculateAge(startDate, now, unit);
        const relevantNumbers = getSpecialNumbersUpTo(unitConfig.maxReasonable, settings);

        for (const num of relevantNumbers) {
            if (num > currentAge) {
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
    const absMs = Math.abs(ms);

    if (absMs < 60 * 1000) {
        return '<1 min';
    }

    if (absMs < 60 * 60 * 1000) {
        const minutes = Math.floor(absMs / (60 * 1000));
        return `${minutes} min`;
    }

    if (absMs < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(absMs / (60 * 60 * 1000));
        return `${hours}h`;
    }

    if (absMs < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(absMs / (24 * 60 * 60 * 1000));
        return `${days}d`;
    }

    if (absMs < 30 * 24 * 60 * 60 * 1000) {
        const weeks = Math.floor(absMs / (7 * 24 * 60 * 60 * 1000));
        const days = Math.floor((absMs % (7 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
        if (days > 0) {
            return `${weeks}w ${days}d`;
        }
        return `${weeks}w`;
    }

    const months = Math.floor(absMs / (30 * 24 * 60 * 60 * 1000));
    if (months < 12) {
        const weeks = Math.floor((absMs % (30 * 24 * 60 * 60 * 1000)) / (7 * 24 * 60 * 60 * 1000));
        if (weeks > 0 && months < 6) {
            return `${months}mo ${weeks}w`;
        }
        return `${months}mo`;
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
        return `${years}y`;
    }
    return `${years}y ${remainingMonths}mo`;
}

// Format date for display
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format date short (without time)
function formatDateShort(date) {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
