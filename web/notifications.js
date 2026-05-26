/**
 * HappyMoments — Push Notification System
 * Schedules local notifications for upcoming milestones.
 * Uses the Notification API + periodic checks via setTimeout.
 */

const NOTIF = (() => {
    const STORAGE_KEY = 'happymoments_notif_prefs';
    const CHECK_INTERVAL = 60 * 60 * 1000; // Check every hour
    let checkTimer = null;

    const defaults = {
        enabled: false,
        dayBefore: true,
        hourBefore: true,
        onDay: true,
    };

    function getPrefs() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? { ...defaults, ...JSON.parse(saved) } : { ...defaults };
        } catch { return { ...defaults }; }
    }

    function savePrefs(prefs) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }

    // Request permission
    async function requestPermission() {
        if (!('Notification' in window)) return false;
        if (Notification.permission === 'granted') return true;
        if (Notification.permission === 'denied') return false;
        const result = await Notification.requestPermission();
        return result === 'granted';
    }

    // Enable notifications
    async function enable() {
        const granted = await requestPermission();
        if (!granted) {
            showToast('Notification permission denied. Enable in browser settings.', 'error');
            return false;
        }
        const prefs = getPrefs();
        prefs.enabled = true;
        savePrefs(prefs);
        startChecking();
        showToast('Milestone reminders enabled!', 'success');
        return true;
    }

    function disable() {
        const prefs = getPrefs();
        prefs.enabled = false;
        savePrefs(prefs);
        stopChecking();
    }

    function isEnabled() {
        return getPrefs().enabled && ('Notification' in window) && Notification.permission === 'granted';
    }

    // Check for milestones that need notifications
    function checkMilestones() {
        if (!isEnabled()) return;

        const prefs = getPrefs();
        const now = new Date();
        const notified = getNotifiedSet();

        // Get all events from all sets
        let allEvents = [];
        if (typeof allSets !== 'undefined') {
            allSets.forEach(set => {
                (set.events || []).forEach(e => {
                    allEvents.push({
                        ...e,
                        date: e.date instanceof Date ? e.date : new Date(e.date),
                        setName: set.name
                    });
                });
            });
        }

        if (allEvents.length === 0) return;

        allEvents.forEach(event => {
            // Check upcoming birthdays/anniversaries
            const type = event.type || 'birthday';
            const eventDate = event.date;
            const thisYear = now.getFullYear();
            const nextDate = new Date(thisYear, eventDate.getMonth(), eventDate.getDate());
            if (nextDate < now) nextDate.setFullYear(thisYear + 1);

            const msUntil = nextDate.getTime() - now.getTime();
            const hoursUntil = msUntil / (60 * 60 * 1000);
            const age = nextDate.getFullYear() - eventDate.getFullYear();

            const notifId = `${event.id}_${nextDate.getFullYear()}`;

            // 1 day before (widened window for timer drift in background tabs)
            if (prefs.dayBefore && hoursUntil > 22 && hoursUntil <= 26 && !notified.has(notifId + '_1d')) {
                const title = type === 'birthday'
                    ? `🎂 ${event.name} turns ${age} tomorrow!`
                    : `🎉 ${age} years since ${event.name} tomorrow!`;
                sendNotification(title, `Get ready to celebrate this HappyMoment!`);
                markNotified(notifId + '_1d');
            }

            // 1 hour before (same day)
            if (prefs.hourBefore && hoursUntil > 0 && hoursUntil <= 1.5 && !notified.has(notifId + '_1h')) {
                const title = type === 'birthday'
                    ? `🎂 ${event.name} turns ${age} today!`
                    : `🎉 ${age} years since ${event.name} today!`;
                sendNotification(title, `Time to celebrate!`);
                markNotified(notifId + '_1h');
            }

            // On the day (morning check) — skip if hour-before already covers it
            if (prefs.onDay && hoursUntil > 1.5 && hoursUntil <= 14 && !notified.has(notifId + '_day')) {
                const isMorning = now.getHours() >= 7 && now.getHours() <= 10;
                if (isMorning) {
                    const title = type === 'birthday'
                        ? `🎂 Happy Birthday, ${event.name}! Turning ${age}!`
                        : `🎉 ${event.name} — ${age} year anniversary today!`;
                    sendNotification(title, `A beautiful number to celebrate.`);
                    markNotified(notifId + '_day');
                }
            }

            // Also check special number milestones coming in next 24h
            if (typeof findAllUpcomingMilestones === 'function' && typeof appSettings !== 'undefined') {
                const milestones = findAllUpcomingMilestones(eventDate, 5, 2, appSettings);
                milestones.forEach(m => {
                    if (typeof isVerySpecialNumber === 'function' && isVerySpecialNumber(m.value)) {
                        const mHours = m.timeUntil / (60 * 60 * 1000);
                        const mId = `${event.id}_${m.value}_${m.unit}`;

                        if (prefs.dayBefore && mHours > 23 && mHours <= 25 && !notified.has(mId)) {
                            sendNotification(
                                `${event.name}: ${m.value.toLocaleString()} ${m.unitName} tomorrow!`,
                                `A special number milestone is coming.`
                            );
                            markNotified(mId);
                        }
                    }
                });
            }
        });
    }

    function sendNotification(title, body) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        try {
            new Notification(title, {
                body: body,
                icon: './icons/icon-192.png',
                badge: './icons/icon-192.png',
                tag: 'happymoments-' + Date.now(),
            });
        } catch (e) {
            // Service worker notification fallback
            if (navigator.serviceWorker && navigator.serviceWorker.ready) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.showNotification(title, {
                        body: body,
                        icon: './icons/icon-192.png',
                        badge: './icons/icon-192.png',
                    });
                });
            }
        }
    }

    // Track which notifications have been sent
    function getNotifiedSet() {
        try {
            const stored = localStorage.getItem('happymoments_notified');
            return new Set(stored ? JSON.parse(stored) : []);
        } catch { return new Set(); }
    }

    function markNotified(id) {
        const set = getNotifiedSet();
        set.add(id);
        // Keep only recent entries (last 200)
        const arr = [...set].slice(-200);
        localStorage.setItem('happymoments_notified', JSON.stringify(arr));
    }

    // Periodic check
    function startChecking() {
        stopChecking();
        checkMilestones(); // Check immediately
        checkTimer = setInterval(checkMilestones, CHECK_INTERVAL);
    }

    function stopChecking() {
        if (checkTimer) { clearInterval(checkTimer); checkTimer = null; }
    }

    // Init — start checking if enabled
    function init() {
        if (isEnabled()) startChecking();
    }

    return {
        enable,
        disable,
        isEnabled,
        getPrefs,
        savePrefs,
        init,
        requestPermission,
        checkMilestones
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NOTIF };
}
