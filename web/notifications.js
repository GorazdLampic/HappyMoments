/**
 * HappyMoments — Push Notification System
 * Schedules local notifications for upcoming milestones.
 *
 * Two strategies:
 * 1. Capacitor (Android) — uses @capacitor/local-notifications to schedule
 *    exact alarms that fire even when the app is closed.
 * 2. PWA / Web — uses the Notification API with periodic in-app checks
 *    (setInterval). Only fires while tab is open, but the service worker
 *    fallback lets showNotification work from background.
 *
 * `scheduleMilestoneNotifications()` is the main entry point — called on
 * every app open and after data changes. It is idempotent: cancels old
 * scheduled notifications and re-schedules based on current data.
 */

const NOTIF = (() => {
    const STORAGE_KEY = 'happymoments_notif_prefs';
    const SCHEDULED_KEY = 'happymoments_scheduled_ids';
    const CHECK_INTERVAL = 60 * 60 * 1000; // Check every hour (web fallback)
    const MAX_NOTIFICATIONS = 20; // Cap to avoid flooding the OS tray
    const SCHEDULE_HORIZON_DAYS = 30; // Look 30 days ahead for scheduling
    let checkTimer = null;

    const defaults = {
        enabled: false,
        dayBefore: true,
        hourBefore: true,
        onDay: true,
    };

    // ------------------------------------------------------------------
    // Preferences
    // ------------------------------------------------------------------

    function getPrefs() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? { ...defaults, ...JSON.parse(saved) } : { ...defaults };
        } catch { return { ...defaults }; }
    }

    function savePrefs(prefs) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }

    // ------------------------------------------------------------------
    // Capacitor detection
    // ------------------------------------------------------------------

    function isCapacitor() {
        return typeof window !== 'undefined' &&
               window.Capacitor &&
               window.Capacitor.isNativePlatform &&
               window.Capacitor.isNativePlatform();
    }

    function getCapLocalNotif() {
        // Capacitor v6 registers plugins on window.Capacitor.Plugins
        if (isCapacitor() && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
            return window.Capacitor.Plugins.LocalNotifications;
        }
        return null;
    }

    // ------------------------------------------------------------------
    // Permission
    // ------------------------------------------------------------------

    async function requestPermission() {
        // Capacitor path
        const capNotif = getCapLocalNotif();
        if (capNotif) {
            try {
                const result = await capNotif.requestPermissions();
                return result.display === 'granted';
            } catch (e) {
                console.warn('Capacitor requestPermissions failed', e);
                return false;
            }
        }
        // Web path
        if (!('Notification' in window)) return false;
        if (Notification.permission === 'granted') return true;
        if (Notification.permission === 'denied') return false;
        const result = await Notification.requestPermission();
        return result === 'granted';
    }

    // ------------------------------------------------------------------
    // Enable / Disable
    // ------------------------------------------------------------------

    async function enable() {
        const granted = await requestPermission();
        if (!granted) {
            if (typeof showToast === 'function') {
                showToast('Notification permission denied. Enable in browser/app settings.', 'error');
            }
            return false;
        }
        const prefs = getPrefs();
        prefs.enabled = true;
        savePrefs(prefs);
        startChecking();
        scheduleMilestoneNotifications(); // schedule right away
        if (typeof showToast === 'function') {
            showToast('Milestone reminders enabled!', 'success');
        }
        return true;
    }

    function disable() {
        const prefs = getPrefs();
        prefs.enabled = false;
        savePrefs(prefs);
        stopChecking();
        cancelAllScheduled();
    }

    function isEnabled() {
        const prefs = getPrefs();
        if (!prefs.enabled) return false;
        // Capacitor: trust the prefs flag (permission checked at enable time)
        if (isCapacitor()) return true;
        // Web: also verify browser permission
        return ('Notification' in window) && Notification.permission === 'granted';
    }

    // ------------------------------------------------------------------
    // Gather all events across all sets
    // ------------------------------------------------------------------

    function getAllEvents() {
        let events = [];
        if (typeof allSets !== 'undefined' && Array.isArray(allSets)) {
            allSets.forEach(set => {
                (set.events || []).forEach(e => {
                    events.push({
                        ...e,
                        date: e.date instanceof Date ? e.date : new Date(e.date),
                        setName: set.name
                    });
                });
            });
        }
        return events;
    }

    // ------------------------------------------------------------------
    // Build the list of notifications to schedule
    // ------------------------------------------------------------------

    function buildNotificationList() {
        const prefs = getPrefs();
        const now = new Date();
        const events = getAllEvents();
        if (events.length === 0) return [];

        const candidates = [];

        events.forEach(event => {
            const eventDate = event.date;
            const name = event.name || 'Someone';
            const type = event.type || 'birthday';

            // ---- A) Birthday/Anniversary annual occurrence ----
            const thisYear = now.getFullYear();
            const nextDate = new Date(thisYear, eventDate.getMonth(), eventDate.getDate(), 9, 0, 0);
            if (nextDate <= now) nextDate.setFullYear(thisYear + 1);

            const msUntilAnnual = nextDate.getTime() - now.getTime();
            const daysUntilAnnual = msUntilAnnual / (24 * 60 * 60 * 1000);

            if (daysUntilAnnual <= SCHEDULE_HORIZON_DAYS) {
                const age = nextDate.getFullYear() - eventDate.getFullYear();
                const dateStr = nextDate.toISOString().slice(0, 10);

                if (prefs.dayBefore) {
                    const fireAt = new Date(nextDate.getTime() - 24 * 60 * 60 * 1000);
                    fireAt.setHours(9, 0, 0, 0);
                    if (fireAt > now) {
                        const title = type === 'birthday'
                            ? `${name} turns ${age} tomorrow!`
                            : `${age} years since ${name} tomorrow!`;
                        candidates.push({
                            id: stableId(`${event.id}_annual_${dateStr}_1d`),
                            title: title,
                            body: 'Plan something special for this HappyMoment!',
                            at: fireAt,
                            sortKey: fireAt.getTime(),
                        });
                    }
                }
                if (prefs.hourBefore) {
                    const fireAt = new Date(nextDate.getTime() - 60 * 60 * 1000);
                    if (fireAt > now) {
                        const title = type === 'birthday'
                            ? `${name} turns ${age} in 1 hour!`
                            : `${age}-year anniversary of ${name} in 1 hour!`;
                        candidates.push({
                            id: stableId(`${event.id}_annual_${dateStr}_1h`),
                            title: title,
                            body: 'Time to celebrate!',
                            at: fireAt,
                            sortKey: fireAt.getTime(),
                        });
                    }
                }
                if (prefs.onDay) {
                    const fireAt = new Date(nextDate);
                    fireAt.setHours(9, 0, 0, 0);
                    if (fireAt > now) {
                        const title = type === 'birthday'
                            ? `Happy Birthday, ${name}! Turning ${age}!`
                            : `${name} -- ${age}-year anniversary today!`;
                        candidates.push({
                            id: stableId(`${event.id}_annual_${dateStr}_day`),
                            title: title,
                            body: 'A beautiful number to celebrate.',
                            at: fireAt,
                            sortKey: fireAt.getTime(),
                        });
                    }
                }
            }

            // ---- B) Number milestones (the core feature) ----
            if (typeof findAllUpcomingMilestones === 'function' && typeof appSettings !== 'undefined') {
                // Get upcoming milestones within our horizon
                const milestones = findAllUpcomingMilestones(eventDate, 10, SCHEDULE_HORIZON_DAYS, appSettings);

                // Also add big milestones (1 billion seconds, etc.) even if further out
                if (typeof findBigMilestones === 'function') {
                    const bigOnes = findBigMilestones(eventDate, appSettings);
                    bigOnes.forEach(bm => {
                        const daysAway = bm.timeUntil / (24 * 60 * 60 * 1000);
                        if (daysAway <= SCHEDULE_HORIZON_DAYS && !milestones.some(m => m.value === bm.value && m.unit === bm.unit)) {
                            milestones.push(bm);
                        }
                    });
                }

                // Filter to "very special" numbers to avoid noise
                const special = milestones.filter(m => {
                    if (typeof isVerySpecialNumber === 'function') return isVerySpecialNumber(m.value);
                    return m.value >= 1000 && m.value % 1000 === 0;
                });

                // Take up to 5 per person
                special.slice(0, 5).forEach(m => {
                    const milestoneDate = m.date instanceof Date ? m.date : new Date(m.date);
                    const valueStr = m.value.toLocaleString();
                    const unitLabel = m.unitName || m.unit;
                    const dateStr = milestoneDate.toISOString().slice(0, 10);

                    if (prefs.dayBefore) {
                        const fireAt = new Date(milestoneDate.getTime() - 24 * 60 * 60 * 1000);
                        fireAt.setHours(9, 0, 0, 0);
                        if (fireAt > now) {
                            candidates.push({
                                id: stableId(`${event.id}_m_${m.value}_${m.unit}_1d`),
                                title: `${name} reaches ${valueStr} ${unitLabel} tomorrow!`,
                                body: 'A special number milestone is coming. Plan something!',
                                at: fireAt,
                                sortKey: fireAt.getTime(),
                            });
                        }
                    }
                    if (prefs.hourBefore) {
                        const fireAt = new Date(milestoneDate.getTime() - 60 * 60 * 1000);
                        if (fireAt > now) {
                            candidates.push({
                                id: stableId(`${event.id}_m_${m.value}_${m.unit}_1h`),
                                title: `${name} is about to hit ${valueStr} ${unitLabel}!`,
                                body: 'Just 1 hour to go -- get ready to celebrate!',
                                at: fireAt,
                                sortKey: fireAt.getTime(),
                            });
                        }
                    }
                    if (prefs.onDay) {
                        const fireAt = new Date(milestoneDate);
                        fireAt.setHours(9, 0, 0, 0);
                        if (fireAt > now) {
                            candidates.push({
                                id: stableId(`${event.id}_m_${m.value}_${m.unit}_day`),
                                title: `Today is the day! ${name} is ${valueStr} ${unitLabel} old!`,
                                body: 'Share this moment!',
                                at: fireAt,
                                sortKey: fireAt.getTime(),
                            });
                        }
                    }
                });
            }
        });

        // Sort by fire time, cap to MAX_NOTIFICATIONS
        candidates.sort((a, b) => a.sortKey - b.sortKey);
        return candidates.slice(0, MAX_NOTIFICATIONS);
    }

    // Stable numeric ID from string (Capacitor requires numeric IDs)
    function stableId(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
        }
        // Ensure positive and within 32-bit int range
        return Math.abs(hash) % 2147483647 || 1;
    }

    // ------------------------------------------------------------------
    // Schedule / Cancel — Capacitor path
    // ------------------------------------------------------------------

    async function scheduleCapacitor(notifications) {
        const capNotif = getCapLocalNotif();
        if (!capNotif || notifications.length === 0) return;

        const items = notifications.map(n => ({
            id: n.id,
            title: n.title,
            body: n.body,
            schedule: { at: n.at },
            sound: 'default',
            smallIcon: 'ic_stat_icon',
            iconColor: '#d4b876',
        }));

        try {
            await capNotif.schedule({ notifications: items });
            console.log(`NOTIF: Scheduled ${items.length} Capacitor notifications`);
        } catch (e) {
            console.error('NOTIF: Capacitor schedule failed', e);
        }
    }

    async function cancelCapacitor(ids) {
        const capNotif = getCapLocalNotif();
        if (!capNotif || ids.length === 0) return;
        try {
            await capNotif.cancel({ notifications: ids.map(id => ({ id })) });
        } catch (e) {
            console.warn('NOTIF: Capacitor cancel failed', e);
        }
    }

    // ------------------------------------------------------------------
    // Schedule / Cancel — Web/PWA path (uses setInterval + immediate send)
    // ------------------------------------------------------------------

    // For the web path, we track scheduled timeouts so we can cancel them
    let webTimeouts = [];

    function scheduleWeb(notifications) {
        // Clear existing timeouts
        webTimeouts.forEach(t => clearTimeout(t));
        webTimeouts = [];

        const now = Date.now();
        const notified = getNotifiedSet();

        notifications.forEach(n => {
            const delay = n.at.getTime() - now;
            const notifKey = `web_${n.id}`;

            if (delay <= 0) {
                // Already past — send immediately if not already sent
                if (!notified.has(notifKey)) {
                    sendWebNotification(n.title, n.body);
                    markNotified(notifKey);
                }
                return;
            }

            // setTimeout max is ~24.8 days (2^31 ms). Our horizon is 30 days,
            // so in rare edge cases delay > 2^31. Cap and rely on re-schedule.
            if (delay > 2147483647) return;

            const tid = setTimeout(() => {
                if (!isEnabled()) return;
                const freshNotified = getNotifiedSet();
                if (freshNotified.has(notifKey)) return;
                sendWebNotification(n.title, n.body);
                markNotified(notifKey);
            }, delay);

            webTimeouts.push(tid);
        });

        console.log(`NOTIF: Scheduled ${notifications.length} web notifications (${webTimeouts.length} timeouts)`);
    }

    function sendWebNotification(title, body) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        try {
            new Notification(title, {
                body: body,
                icon: './icons/icon-192.png',
                badge: './icons/icon-192.png',
                tag: 'happymoments-' + Date.now(),
            });
        } catch (e) {
            // Service worker notification fallback (required on Android Chrome PWA)
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

    // ------------------------------------------------------------------
    // Stored scheduled IDs — for cancel-and-reschedule idempotency
    // ------------------------------------------------------------------

    function getStoredIds() {
        try {
            const raw = localStorage.getItem(SCHEDULED_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    }

    function storeIds(ids) {
        localStorage.setItem(SCHEDULED_KEY, JSON.stringify(ids));
    }

    // ------------------------------------------------------------------
    // Cancel all previously scheduled
    // ------------------------------------------------------------------

    async function cancelAllScheduled() {
        const oldIds = getStoredIds();

        if (isCapacitor() && oldIds.length > 0) {
            await cancelCapacitor(oldIds);
        }

        // Clear web timeouts
        webTimeouts.forEach(t => clearTimeout(t));
        webTimeouts = [];

        storeIds([]);
    }

    // ------------------------------------------------------------------
    // MAIN: scheduleMilestoneNotifications()
    // ------------------------------------------------------------------

    async function scheduleMilestoneNotifications() {
        if (!isEnabled()) return;

        // 1. Cancel old scheduled notifications
        await cancelAllScheduled();

        // 2. Build fresh list
        const notifications = buildNotificationList();
        if (notifications.length === 0) return;

        // 3. Store IDs for future cancellation
        storeIds(notifications.map(n => n.id));

        // 4. Schedule using the appropriate platform
        if (isCapacitor()) {
            await scheduleCapacitor(notifications);
        } else {
            scheduleWeb(notifications);
        }
    }

    // ------------------------------------------------------------------
    // Legacy: checkMilestones() — hourly in-app check (web fallback)
    //
    // This catches milestones that arrive while the tab is open.
    // On Capacitor, scheduled alarms handle this, so this is a no-op.
    // ------------------------------------------------------------------

    function checkMilestones() {
        if (!isEnabled()) return;
        if (isCapacitor()) return; // Capacitor handles via OS alarms

        const prefs = getPrefs();
        const now = new Date();
        const notified = getNotifiedSet();
        const events = getAllEvents();
        if (events.length === 0) return;

        events.forEach(event => {
            const eventDate = event.date;
            const name = event.name || 'Someone';
            const type = event.type || 'birthday';

            // --- Annual birthday/anniversary check ---
            const thisYear = now.getFullYear();
            const nextDate = new Date(thisYear, eventDate.getMonth(), eventDate.getDate());
            if (nextDate < now) nextDate.setFullYear(thisYear + 1);

            const msUntil = nextDate.getTime() - now.getTime();
            const hoursUntil = msUntil / (60 * 60 * 1000);
            const age = nextDate.getFullYear() - eventDate.getFullYear();
            const notifId = `${event.id}_${nextDate.getFullYear()}`;

            if (prefs.dayBefore && hoursUntil > 22 && hoursUntil <= 26 && !notified.has(notifId + '_1d')) {
                const title = type === 'birthday'
                    ? `${name} turns ${age} tomorrow!`
                    : `${age} years since ${name} tomorrow!`;
                sendWebNotification(title, 'Get ready to celebrate this HappyMoment!');
                markNotified(notifId + '_1d');
            }

            if (prefs.hourBefore && hoursUntil > 0 && hoursUntil <= 1.5 && !notified.has(notifId + '_1h')) {
                const title = type === 'birthday'
                    ? `${name} turns ${age} today!`
                    : `${age} years since ${name} today!`;
                sendWebNotification(title, 'Time to celebrate!');
                markNotified(notifId + '_1h');
            }

            if (prefs.onDay && hoursUntil > 1.5 && hoursUntil <= 14 && !notified.has(notifId + '_day')) {
                const isMorning = now.getHours() >= 7 && now.getHours() <= 10;
                if (isMorning) {
                    const title = type === 'birthday'
                        ? `Happy Birthday, ${name}! Turning ${age}!`
                        : `${name} -- ${age}-year anniversary today!`;
                    sendWebNotification(title, 'A beautiful number to celebrate.');
                    markNotified(notifId + '_day');
                }
            }

            // --- Number milestone check (within 2 days for live detection) ---
            if (typeof findAllUpcomingMilestones === 'function' && typeof appSettings !== 'undefined') {
                const milestones = findAllUpcomingMilestones(eventDate, 10, 2, appSettings);
                const special = milestones.filter(m =>
                    typeof isVerySpecialNumber === 'function' && isVerySpecialNumber(m.value)
                );

                special.forEach(m => {
                    const mHours = m.timeUntil / (60 * 60 * 1000);
                    const mId = `${event.id}_${m.value}_${m.unit}`;

                    if (prefs.dayBefore && mHours > 22 && mHours <= 26 && !notified.has(mId + '_1d')) {
                        sendWebNotification(
                            `${name}: ${m.value.toLocaleString()} ${m.unitName} tomorrow!`,
                            'A special number milestone is coming.'
                        );
                        markNotified(mId + '_1d');
                    }
                    if (prefs.hourBefore && mHours > 0 && mHours <= 1.5 && !notified.has(mId + '_1h')) {
                        sendWebNotification(
                            `${name} is about to hit ${m.value.toLocaleString()} ${m.unitName}!`,
                            'Just minutes to go!'
                        );
                        markNotified(mId + '_1h');
                    }
                    if (prefs.onDay && mHours > 1.5 && mHours <= 14 && !notified.has(mId + '_day')) {
                        const isMorning = now.getHours() >= 7 && now.getHours() <= 10;
                        if (isMorning) {
                            sendWebNotification(
                                `Today! ${name} is ${m.value.toLocaleString()} ${m.unitName} old!`,
                                'Share this moment!'
                            );
                            markNotified(mId + '_day');
                        }
                    }
                });
            }
        });
    }

    // ------------------------------------------------------------------
    // De-duplication: track sent notifications
    // ------------------------------------------------------------------

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

    // ------------------------------------------------------------------
    // Periodic check (web only)
    // ------------------------------------------------------------------

    function startChecking() {
        stopChecking();
        checkMilestones(); // Check immediately
        checkTimer = setInterval(checkMilestones, CHECK_INTERVAL);
    }

    function stopChecking() {
        if (checkTimer) { clearInterval(checkTimer); checkTimer = null; }
    }

    // ------------------------------------------------------------------
    // Init — called on app start
    // ------------------------------------------------------------------

    function init() {
        if (isEnabled()) {
            startChecking();
            scheduleMilestoneNotifications();
        }
    }

    // ------------------------------------------------------------------
    // Public API
    // ------------------------------------------------------------------

    return {
        enable,
        disable,
        isEnabled,
        getPrefs,
        savePrefs,
        init,
        requestPermission,
        checkMilestones,
        scheduleMilestoneNotifications,
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NOTIF };
}
