/**
 * Nice Numbers — Reminder System
 * Schedules local notifications before the NICEST upcoming milestones.
 *
 * Design (v2, build 110):
 * - Touchpoints: a MONTH, a WEEK, and a DAY before a milestone. No same-day, no
 *   hourly — this is daily content, and a nudge only helps with lead time.
 * - Only the nicest numbers qualify (nicenessGrade cutoff), across the user
 *   themselves (weighted a little higher), everyone on their list, and team
 *   combinations.
 * - Throttled to at most 2 notifications per calendar month so reminders stay
 *   rare and special.
 *
 * Two delivery strategies:
 * 1. Capacitor (Android) — @capacitor/local-notifications schedules exact alarms
 *    that fire even when the app is closed.
 * 2. PWA / Web — setTimeout while the tab is open (+ service-worker fallback).
 *
 * `scheduleMilestoneNotifications()` is the entry point — idempotent: cancels
 * old scheduled notifications and re-schedules from current data.
 */

const NOTIF = (() => {
    const STORAGE_KEY = 'happymoments_notif_prefs';
    const SCHEDULED_KEY = 'happymoments_scheduled_ids';
    const CHECK_INTERVAL = 60 * 60 * 1000; // web-only: refresh the schedule hourly
    const MAX_NOTIFICATIONS = 12;          // hard cap on total scheduled items
    let checkTimer = null;

    const defaults = {
        enabled: false,
    };

    // Reminder touchpoints BEFORE a milestone. Order matters only for labels.
    const OFFSETS = [
        { key: '1mo', days: 30, lead: 'a month' },  // time to plan
        { key: '1w',  days: 7,  lead: 'a week' },    // time to buy a gift
        { key: '1d',  days: 1,  lead: 'tomorrow' },  // time to send a card / call
    ];
    const TOP_TIER_CUTOFF = 72;  // only genuinely nice numbers (nicenessGrade 0-100)
    const ME_WEIGHT = 1.2;       // the user's own milestones rank a little higher
    const MAX_PER_MONTH = 2;     // never more than 2 reminders in a calendar month
    const HORIZON_DAYS = 40;     // far enough to schedule the month-before touchpoint
    const DAY_MS = 24 * 60 * 60 * 1000;

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
        if (isCapacitor() && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
            return window.Capacitor.Plugins.LocalNotifications;
        }
        return null;
    }

    // ------------------------------------------------------------------
    // Permission
    // ------------------------------------------------------------------

    async function requestPermission() {
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
        scheduleMilestoneNotifications();
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
        if (isCapacitor()) return true;
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
    // Helpers for the new nicest-milestone selection
    // ------------------------------------------------------------------

    function fireTimeAt(milestoneDate, offsetDays) {
        const at = new Date(milestoneDate.getTime() - offsetDays * DAY_MS);
        at.setHours(9, 0, 0, 0); // morning-of, local time
        return at;
    }

    // Plain "123456 minutes" label for the notification text.
    function niceLabel(value, unitName) {
        const num = (typeof formatMilestoneValuePlain === 'function')
            ? formatMilestoneValuePlain(value) : String(value);
        const unit = (typeof localizedUnit === 'function')
            ? localizedUnit(value, unitName) : (unitName || '');
        return (num + ' ' + unit).trim();
    }

    // ------------------------------------------------------------------
    // Build the list of notifications to schedule
    // ------------------------------------------------------------------

    function buildNotificationList() {
        if (!isEnabled()) return [];
        const now = new Date();
        const events = getAllEvents();
        if (events.length === 0) return [];
        const settings = (typeof appSettings !== 'undefined') ? appSettings : undefined;

        // 1) Collect candidate milestones (self + others + combinations), each
        //    scored by mathematical niceness with a small boost for "Me".
        const candidates = []; // { score, name, milestone }

        function consider(milestone, name, isMe) {
            if (!milestone || typeof milestone.value !== 'number') return;
            // Cosmic: only the Saturn return is special enough to remind about.
            if (milestone.isCosmic && !milestone.isSaturnReturn) return;
            const grade = milestone.isSaturnReturn ? 90
                : ((typeof nicenessGrade === 'function') ? nicenessGrade(milestone.value) : 0);
            if (grade < TOP_TIER_CUTOFF) return;

            let mDate = milestone.date instanceof Date ? milestone.date
                : (milestone.date ? new Date(milestone.date) : null);
            if ((!mDate || isNaN(mDate)) && typeof milestone.timeUntil === 'number') {
                mDate = new Date(now.getTime() + milestone.timeUntil);
            }
            if (!mDate || isNaN(mDate) || !(mDate > now)) return;
            if ((mDate.getTime() - now.getTime()) / DAY_MS > HORIZON_DAYS) return;

            candidates.push({
                score: grade * (isMe ? ME_WEIGHT : 1),
                name: name,
                milestone: { ...milestone, date: mDate }
            });
        }

        // Self + everyone on the list
        events.forEach(event => {
            const isMe = event.name === 'Me';
            const name = (typeof displayPersonName === 'function')
                ? displayPersonName(event.name) : (event.name || 'Someone');
            if (typeof findAllUpcomingMilestones === 'function') {
                (findAllUpcomingMilestones(event.date, 20, HORIZON_DAYS, settings) || [])
                    .forEach(m => consider(m, name, isMe));
            }
            if (typeof findBigMilestones === 'function') {
                (findBigMilestones(event.date, settings) || []).forEach(bm => {
                    if (bm.timeUntil / DAY_MS <= HORIZON_DAYS) consider(bm, name, isMe);
                });
            }
            if (typeof findCosmicMilestones === 'function') {
                (findCosmicMilestones(event.date) || []).forEach(cm => {
                    if (cm.timeUntil / DAY_MS <= HORIZON_DAYS) consider(cm, name, isMe);
                });
            }
        });

        // Combinations of team members
        if (events.length >= 2 && typeof suggestCombinations === 'function'
            && typeof findCombinationMilestones === 'function') {
            try {
                (suggestCombinations(events) || []).slice(0, 8).forEach(combo => {
                    const label = combo.label || combo.name || 'Your team';
                    (findCombinationMilestones(combo, events, 10, HORIZON_DAYS, settings) || [])
                        .forEach(m => consider(m, label, false));
                });
            } catch (e) { /* combinations are best-effort */ }
        }

        if (candidates.length === 0) return [];

        // 2) De-dup by (name, value, unit); keep the highest score.
        const seen = new Map();
        candidates.forEach(c => {
            const key = c.name + '|' + c.milestone.value + '|' + (c.milestone.unitName || c.milestone.unit);
            if (!seen.has(key) || seen.get(key).score < c.score) seen.set(key, c);
        });
        const ranked = [...seen.values()].sort((a, b) => b.score - a.score);

        // 3) Greedily schedule the highest-scored milestones, capping each calendar
        //    month at MAX_PER_MONTH notifications so reminders stay rare. A
        //    milestone's touchpoints are added all-or-nothing to keep them coherent.
        const monthCount = {};
        const chosen = [];
        for (const c of ranked) {
            const m = c.milestone;
            const points = [];
            OFFSETS.forEach(off => {
                const at = fireTimeAt(m.date, off.days);
                if (at > now) points.push({ off, at });
            });
            if (points.length === 0) continue;

            const trial = { ...monthCount };
            let ok = true;
            points.forEach(p => {
                const mk = p.at.getFullYear() + '-' + p.at.getMonth();
                trial[mk] = (trial[mk] || 0) + 1;
                if (trial[mk] > MAX_PER_MONTH) ok = false;
            });
            if (!ok) continue;
            Object.assign(monthCount, trial);

            const label = niceLabel(m.value, m.unitName || m.unit);
            points.forEach(p => {
                const when = p.off.key === '1d' ? 'tomorrow' : ('in ' + p.off.lead);
                const title = m.isCosmic
                    ? (c.name + ': ' + (m.description || 'a rare milestone') + ' ' + when)
                    : (c.name + ' reaches ' + label + ' ' + when);
                const body = p.off.key === '1mo' ? 'A special number is coming up — time to plan.'
                    : p.off.key === '1w' ? 'One week to go — a good moment for a gift.'
                    : 'Tomorrow! Send a card, call, or share it.';
                chosen.push({
                    id: stableId(c.name + '_' + m.value + '_' + (m.unitName || m.unit) + '_' + p.off.key),
                    title: title,
                    body: body,
                    at: p.at,
                    sortKey: p.at.getTime(),
                });
            });
            if (chosen.length >= MAX_NOTIFICATIONS) break;
        }

        chosen.sort((a, b) => a.sortKey - b.sortKey);
        return chosen.slice(0, MAX_NOTIFICATIONS);
    }

    // Stable numeric ID from string (Capacitor requires numeric IDs)
    function stableId(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
        }
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
    // Schedule / Cancel — Web/PWA path (setTimeout)
    // ------------------------------------------------------------------

    let webTimeouts = [];

    function scheduleWeb(notifications) {
        webTimeouts.forEach(t => clearTimeout(t));
        webTimeouts = [];

        const now = Date.now();
        const notified = getNotifiedSet();

        notifications.forEach(n => {
            const delay = n.at.getTime() - now;
            const notifKey = `web_${n.id}`;

            if (delay <= 0) {
                if (!notified.has(notifKey)) {
                    sendWebNotification(n.title, n.body);
                    markNotified(notifKey);
                }
                return;
            }
            // setTimeout max is ~24.8 days (2^31 ms). Longer delays are re-armed
            // on the next hourly refresh / app open.
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

    async function cancelAllScheduled() {
        const oldIds = getStoredIds();
        if (isCapacitor() && oldIds.length > 0) {
            await cancelCapacitor(oldIds);
        }
        webTimeouts.forEach(t => clearTimeout(t));
        webTimeouts = [];
        storeIds([]);
    }

    // ------------------------------------------------------------------
    // MAIN: scheduleMilestoneNotifications()
    // ------------------------------------------------------------------

    async function scheduleMilestoneNotifications() {
        if (!isEnabled()) return;
        await cancelAllScheduled();
        const notifications = buildNotificationList();
        if (notifications.length === 0) return;
        storeIds(notifications.map(n => n.id));
        if (isCapacitor()) {
            await scheduleCapacitor(notifications);
        } else {
            scheduleWeb(notifications);
        }
    }

    // ------------------------------------------------------------------
    // Web-only periodic refresh: re-arm the schedule so newly-eligible
    // milestones (and long delays beyond setTimeout's ceiling) get picked up.
    // On Capacitor the OS alarms handle firing, so this is a no-op there.
    // ------------------------------------------------------------------

    function checkMilestones() {
        if (!isEnabled()) return;
        if (isCapacitor()) return;
        scheduleMilestoneNotifications();
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
        const arr = [...set].slice(-200);
        localStorage.setItem('happymoments_notified', JSON.stringify(arr));
    }

    // ------------------------------------------------------------------
    // Periodic check (web only)
    // ------------------------------------------------------------------

    function startChecking() {
        stopChecking();
        checkMilestones();
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
