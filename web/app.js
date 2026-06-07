/**
 * HappyMoments - Main Application
 * Simplified with matrix connections, column-based milestones
 */

// ============================================================
// HTML SANITIZATION
// ============================================================
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ============================================================
// STORAGE KEYS (separate settings)
// ============================================================
const STORAGE_KEY_DATA = 'happyMomentsData';
const STORAGE_KEY_SETTINGS = 'happyMomentsSettings';

// Parse YYYY-MM-DD as local midnight (not UTC)
function parseLocalDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

// Auto-advance: when user types enough digits, move to next field
function autoAdvance(field, nextFieldId, maxLen) {
    // Strip non-digits
    field.value = field.value.replace(/[^0-9]/g, '');
    const val = parseInt(field.value, 10);
    const maxVal = parseInt(field.max, 10);

    // Advance on length >= maxLen, OR on unambiguous single digits:
    // Day field (max=31): val >= 4 means 4-9 (can't be 40+)
    // Month field (max=12): val >= 2 means 2-9 (can't be 20+)
    let shouldAdvance = field.value.length >= maxLen;
    if (!shouldAdvance && maxLen === 2 && val > 0) {
        if (maxVal === 31 && val >= 4) shouldAdvance = true;
        if (maxVal === 12 && val >= 2) shouldAdvance = true;
    }

    if (shouldAdvance) {
        const next = document.getElementById(nextFieldId);
        if (next) next.focus();
    }
    syncDateFields(field);
}

// Read DD/MM/YYYY fields and write ISO to the hidden date input
function syncDateFields(anyField) {
    // Find the parent .date-fields container
    const container = anyField.closest('.date-fields');
    if (!container) return;
    const fields = container.querySelectorAll('.date-field');
    if (fields.length < 3) return;

    const dd = parseInt(fields[0].value, 10);
    const mm = parseInt(fields[1].value, 10);
    const yyyy = parseInt(fields[2].value, 10);

    // Find the hidden input (next sibling of container)
    const hidden = container.nextElementSibling;
    if (!hidden || hidden.type !== 'hidden') return;

    if (dd >= 1 && mm >= 1 && mm <= 12 && yyyy >= 1900 && yyyy <= 2100) {
        // Validate day-in-month (prevents Feb 30, Apr 31, etc.)
        const maxDay = new Date(yyyy, mm, 0).getDate();
        if (dd <= maxDay) {
            hidden.value = `${yyyy}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
        }
    }
}

// Build ISO date string directly from DD/MM/YYYY fields
function buildDateFromFields(prefix) {
    const dd = document.getElementById(prefix + 'Day');
    const mm = document.getElementById(prefix + 'Month');
    const yy = document.getElementById(prefix + 'Year');
    if (!dd || !mm || !yy) return '';
    const d = parseInt(dd.value, 10);
    const m = parseInt(mm.value, 10);
    const y = parseInt(yy.value, 10);
    if (d >= 1 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
        const maxDay = new Date(y, m, 0).getDate();
        if (d <= maxDay) {
            return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        }
    }
    return '';
}

// Set date fields from an ISO string (for edit modal)
function setDateFields(prefix, isoDate) {
    if (!isoDate) return;
    const parts = isoDate.split('-');
    if (parts.length < 3) return;
    const dayEl = document.getElementById(prefix + 'Day');
    const monthEl = document.getElementById(prefix + 'Month');
    const yearEl = document.getElementById(prefix + 'Year');
    if (dayEl) dayEl.value = parseInt(parts[2], 10);
    if (monthEl) monthEl.value = parseInt(parts[1], 10);
    if (yearEl) yearEl.value = parseInt(parts[0], 10);
}

// ============================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================

function showToast(message, type = 'info', duration = 3000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================================================
// DOM ELEMENTS
// ============================================================

const onboardingSection = document.getElementById('onboarding');
const tabNav = document.getElementById('tabNav');
const eventsTab = document.getElementById('eventsTab');
const milestonesTab = document.getElementById('milestonesTab');
const combinedTab = document.getElementById('combinedTab');
const settingsTab = document.getElementById('settingsTab');

// Onboarding
const birthNameInput = document.getElementById('birthName');
const birthDateInput = document.getElementById('birthDate');
const startBtn = document.getElementById('startBtn');

// Events tab
const eventsListEl = document.getElementById('eventsList');
const newEventNameInput = document.getElementById('newEventName');
const newEventTypeSelect = document.getElementById('newEventType');
const newEventDateInput = document.getElementById('newEventDate');
const addEventBtn = document.getElementById('addEventBtn');

// Edit modal
const editModal = document.getElementById('editModal');
const editEventNameInput = document.getElementById('editEventName');
const editEventTypeSelect = document.getElementById('editEventType');
const editEventDateInput = document.getElementById('editEventDate');
const editEventNotesInput = document.getElementById('editEventNotes');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const deleteEditBtn = document.getElementById('deleteEditBtn');

// Combined tab
const combinedMilestonesContentEl = document.getElementById('combinedMilestonesContent');
const refreshCombinedBtn = document.getElementById('refreshCombinedBtn');
const combinedSharePreviewEl = document.getElementById('combinedSharePreview');
const copyCombinedShareBtn = document.getElementById('copyCombinedShareBtn');
const whatsappCombinedShareBtn = document.getElementById('whatsappCombinedShareBtn');
const viberCombinedShareBtn = document.getElementById('viberCombinedShareBtn');
const emailCombinedShareBtn = document.getElementById('emailCombinedShareBtn');

// Settings - connection matrix
const connectionMatrixEl = document.getElementById('connectionMatrix');

// Milestones tab
const milestonesColumnsEl = document.getElementById('milestonesColumns');
const refreshMilestonesBtn = document.getElementById('refreshMilestonesBtn');
const sharePreviewEl = document.getElementById('sharePreview');
const copyShareBtn = document.getElementById('copyShareBtn');
const whatsappShareBtn = document.getElementById('whatsappShareBtn');
const viberShareBtn = document.getElementById('viberShareBtn');
const emailShareBtn = document.getElementById('emailShareBtn');
const personFilterEl = document.getElementById('personFilter');
const milestonesTitleEl = document.getElementById('milestonesTitle');

// Milestone Calculator (removed from UI but kept references safe)
const calcNumberInput = document.getElementById('calcNumber');
const calcUnitSelect = document.getElementById('calcUnit');
const calcBtn = document.getElementById('calcBtn');
const calcResultEl = document.getElementById('calcResult');

// Settings tab
const customNumbersListEl = document.getElementById('customNumbersList');
const customNumberInput = document.getElementById('customNumberInput');
const addCustomNumberBtn = document.getElementById('addCustomNumberBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const resetBtn = document.getElementById('resetBtn');
const exportDataBtn = document.getElementById('exportDataBtn');
const importDataInput = document.getElementById('importDataInput');
const darkModeToggle = document.getElementById('darkModeToggle');

// Event Sets (Advanced)
const setSwitcher = document.getElementById('setSwitcher');
const currentSetSelect = document.getElementById('currentSetSelect');
const renameCurrentSetBtn = document.getElementById('renameCurrentSetBtn');
const eventSetsListEl = document.getElementById('eventSetsList');
const newSetNameInput = document.getElementById('newSetName');
const addSetBtn = document.getElementById('addSetBtn');

// ============================================================
// APP STATE
// ============================================================

// Multi-set data structure
let allSets = []; // Array of { id, name, events, connections, comboTypes }
let currentSetId = null;

// Current set's data (shortcut reference)
let appData = {
    events: [],
    connections: {},
    comboTypes: { sum: true, ratio: true, duration: true }
};

let appSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

let editingEventId = null;
let selectedMilestone = null; // For sharing
let selectedPersonIds = []; // For person filter
let _mostSpecialMode = false; // When true, show only very special milestones across all people

// ============================================================
// INITIALIZATION
// ============================================================

function init() {
    // ?reset in URL clears all data and shows fresh onboarding
    if (window.location.search.includes('reset')) {
        localStorage.clear();
        sessionStorage.clear();

        // Unregister ALL service workers and clear ALL caches, then reload
        Promise.all([
            navigator.serviceWorker ? navigator.serviceWorker.getRegistrations().then(regs =>
                Promise.all(regs.map(r => r.unregister()))
            ) : Promise.resolve(),
            window.caches ? caches.keys().then(keys =>
                Promise.all(keys.map(k => caches.delete(k)))
            ) : Promise.resolve()
        ]).finally(() => {
            // Force reload from network (bypass any remaining cache)
            window.location.replace(window.location.pathname);
        });
        return; // Stop init — page will reload after cleanup
    }

    loadDarkMode();
    loadData();
    loadSettings();
    setupEventListeners();

    // Date fields are now DD/MM/YYYY number inputs — no max needed

    const isNewUser = appData.events.length === 0 && !localStorage.getItem('hm_onboarded');
    const isReturningUser = appData.events.length > 0 || localStorage.getItem('hm_onboarded');

    if (isNewUser) {
        // New user: hide header + tabs + all tab content, show onboarding wizard
        const header = document.getElementById('appHeader');
        if (header) header.style.display = 'none';
        tabNav.classList.add('hidden');
        document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
        const profilePanel = document.getElementById('profilePanel');
        if (profilePanel) profilePanel.classList.add('hidden');
    } else if (isReturningUser) {
        // Returning user: show everything, hide onboarding
        const header = document.getElementById('appHeader');
        if (header) header.style.display = '';
        tabNav.classList.remove('hidden');
        onboardingSection.classList.add('hidden');
        checkConsent();
        // Render the dashboard
        selectedPersonIds = appData.events.map(e => e.id);
        renderMilestonesTab();
        switchTab('me');
    }

    // Init notifications
    if (typeof NOTIF !== 'undefined') {
        NOTIF.init();
        loadNotifUI();
    }

    // Initialize i18n
    if (typeof I18N !== 'undefined') {
        I18N.init();
        initLangPicker();
    }

    // Check for Stripe checkout return
    if (typeof checkCheckoutResult === 'function') checkCheckoutResult();

    // Handle deep links — show shared person's milestones
    handleDeepLink();

    // Enable pinch zoom on Android WebView
    if (document.querySelector('meta[name="viewport"]')) {
        document.querySelector('meta[name="viewport"]').content =
            'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    }
}

function handleDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('n');
    const dateStr = params.get('d');
    const lang = params.get('hl');

    if (!name || !dateStr) return;

    // Set language if provided
    if (lang && typeof I18N !== 'undefined') {
        I18N.setLocale(lang);
    }

    // Parse date
    const date = parseLocalDate(dateStr);
    if (!date || isNaN(date.getTime())) return;

    // Check if this person is already in the data
    const existing = appData.events.find(e => e.name === name);
    if (existing) {
        // Already tracked — just show their milestones
        window.history.replaceState({}, '', window.location.pathname);
        return;
    }

    // Track deep link open
    _track('deeplink_opened', { name: name, lang: lang || null });

    // Show a "guest preview" with CTA to add themselves
    showDeepLinkPreview(name, date);

    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
}

const DEEPLINK_TEXT = {
    shared_with_you: { en: 'Someone shared these special moments with you.', pt: 'Algu\u00e9m compartilhou esses momentos especiais com voc\u00ea.', hi: 'किसी ने ये विशेष पल आपके साथ साझा किए।', zh: '有人与你分享了这些特别的时刻。', ja: '特別な瞬間があなたと共有されました。', es: 'Alguien comparti\u00f3 estos momentos especiales contigo.', de: 'Jemand hat diese besonderen Momente mit dir geteilt.', fr: 'Quelqu\'un a partag\u00e9 ces moments sp\u00e9ciaux avec vous.', it: 'Qualcuno ha condiviso questi momenti speciali con te.', sl: 'Nekdo je s tabo delil te posebne trenutke.', ko: '누군가 특별한 순간을 공유했습니다.', th: 'มีคนแชร์ช่วงเวลาพิเศษเหล่านี้กับคุณ' },
    whens_yours: { en: 'When\'s <strong>YOUR</strong> special number?', pt: 'Qual \u00e9 o <strong>SEU</strong> n\u00famero especial?', hi: '<strong>आपका</strong> विशेष नंबर कब है?', zh: '<strong>你的</strong>特别数字是什么时候？', ja: '<strong>あなたの</strong>特別な数字は？', es: '\u00bfCu\u00e1l es <strong>TU</strong> n\u00famero especial?', de: 'Wann ist <strong>DEINE</strong> besondere Zahl?', fr: 'Quel est <strong>VOTRE</strong> num\u00e9ro sp\u00e9cial\u00a0?', it: 'Qual \u00e8 il <strong>TUO</strong> numero speciale?', sl: 'Kdaj je <strong>TVOJA</strong> posebna \u0161tevilka?', ko: '<strong>당신의</strong> 특별한 숫자는?', th: 'ตัวเลขพิเศษของ<strong>คุณ</strong>คืออะไร?' },
    discover_mine: { en: 'Discover My Milestones', pt: 'Descobrir Meus Marcos', hi: 'मेरे माइलस्टोन खोजें', zh: '发现我的里程碑', ja: '私のマイルストーンを発見', es: 'Descubrir Mis Hitos', de: 'Meine Meilensteine entdecken', fr: 'D\u00e9couvrir Mes Jalons', it: 'Scopri i Miei Traguardi', sl: 'Odkrij moje mejnike', ko: '내 마일스톤 발견', th: 'ค้นพบเหตุการณ์สำคัญของฉัน' },
    just_browsing: { en: 'Just browsing', pt: 'S\u00f3 olhando', hi: 'बस देख रहा हूँ', zh: '随便看看', ja: 'ちょっと見てるだけ', es: 'Solo mirando', de: 'Nur schauen', fr: 'Je regarde', it: 'Sto solo guardando', sl: 'Samo gledam', ko: '그냥 구경', th: 'แค่ดูเฉยๆ' },
};
function _dlText(key) {
    const locale = (typeof getAppLocale === 'function') ? getAppLocale().split('-')[0] : 'en';
    const baseLang = locale.split('_')[0];
    const entry = DEEPLINK_TEXT[key];
    return (entry && (entry[locale] || entry[baseLang])) || (entry && entry.en) || key;
}

function showDeepLinkPreview(name, date) {
    // Calculate milestones for the shared person
    const milestones = typeof findAllUpcomingMilestones === 'function'
        ? findAllUpcomingMilestones(date, 10, 365, appSettings || {})
        : [];

    // Add big milestones
    if (typeof findBigMilestones === 'function') {
        const bigOnes = findBigMilestones(date, appSettings || {});
        bigOnes.forEach(bm => {
            if (!milestones.some(m => m.value === bm.value && m.unit === bm.unit)) {
                milestones.push(bm);
            }
        });
    }

    // Add cosmic milestones (planetary returns)
    if (typeof findCosmicMilestones === 'function') {
        const cosmicOnes = findCosmicMilestones(date);
        cosmicOnes.forEach(cm => {
            if (!milestones.some(m => m.unit === cm.unit && m.value === cm.value)) {
                milestones.push(cm);
            }
        });
    }

    milestones.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Build preview HTML
    let milestonesHtml = '';
    milestones.slice(0, 6).forEach(m => {
        const timeStr = typeof formatTimeDistance === 'function' ? formatTimeDistance(m.timeUntil) : '';
        const dateStr = m.date.toLocaleDateString(typeof getAppLocale === 'function' ? getAppLocale() : 'en', { month: 'long', day: 'numeric', year: 'numeric' });
        milestonesHtml += `
            <div class="deeplink-milestone">
                <span class="deeplink-value">${m.value.toLocaleString()}</span>
                <span class="deeplink-unit">${m.unitName}</span>
                <span class="deeplink-date">${dateStr} &middot; ${timeStr}</span>
            </div>
        `;
    });

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'deepLinkModal';
    modal.innerHTML = `
        <div class="modal-content deeplink-modal">
            <h3>${escapeHtml(name)}</h3>
            <p class="auth-subtitle">${_dlText('shared_with_you')}</p>
            <div class="deeplink-milestones">${milestonesHtml}</div>
            <div class="deeplink-cta">
                <p>${_dlText('whens_yours')}</p>
                <button class="btn-primary" onclick="acceptDeepLink('${escapeHtml(name)}', '${date.toISOString().split('T')[0]}'); document.getElementById('deepLinkModal').remove();" style="width:100%;">${_dlText('discover_mine')}</button>
            </div>
            <button class="auth-skip" onclick="document.getElementById('deepLinkModal').remove()">${_dlText('just_browsing')}</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function acceptDeepLink(name, dateStr) {
    // Add the shared person to user's data
    const date = parseLocalDate(dateStr);
    if (date && !appData.events.find(e => e.name === name)) {
        appData.events.push({
            id: 'event_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            name: name,
            type: 'birthday',
            date: date
        });
        saveData();
    }

    // Scroll to onboarding or focus the name input for THEIR birthday
    const nameInput = document.getElementById('newEventName');
    if (nameInput) {
        nameInput.value = '';
        nameInput.placeholder = 'Your name or another date...';
        nameInput.scrollIntoView({ behavior: 'smooth' });
        nameInput.focus();
    }
    showToast(`${name} added! Now enter YOUR birthday to see your milestones.`, 'info', 5000);
    _track('deeplink_accepted', { name: name });

    // Refresh views
    renderEventsTab();
    renderPersonFilter();
    renderMilestonesTab();
}

// Consent banner
function checkConsent() {
    if (!localStorage.getItem('happymoments_consent')) {
        const banner = document.getElementById('consentBanner');
        if (banner) banner.classList.remove('hidden');
    }
}

function acceptConsent() {
    localStorage.setItem('happymoments_consent', 'true');
    const banner = document.getElementById('consentBanner');
    if (banner) banner.classList.add('hidden');
}

// Language picker with flags
const LANG_FLAGS = {
    en: '🇬🇧', es: '🇪🇸', de: '🇩🇪', pt: '🇵🇹', it: '🇮🇹',
    fr: '🇫🇷', hr: '🇭🇷', sl: '🇸🇮', nl: '🇳🇱', pl: '🇵🇱',
    ru: '🇷🇺', zh: '🇨🇳', hi: '🇮🇳', ar: '🇸🇦', bn: '🇧🇩', ja: '🇯🇵',
    vi: '🇻🇳', id: '🇮🇩'
};

function initLangPicker() {
    // Just update the displayed flag/code to match current locale
    if (typeof I18N === 'undefined') return;
    const loc = I18N.getLocale();
    const flagEl = document.getElementById('langFlagDisplay');
    const codeEl = document.getElementById('langCodeDisplay');
    if (flagEl) flagEl.textContent = LANG_FLAGS[loc] || '';
    if (codeEl) codeEl.textContent = loc.toUpperCase();
}

function selectLanguage(locale) {
    if (typeof I18N !== 'undefined') I18N.setLocale(locale);
    // Update button display
    const flagEl = document.getElementById('langFlagDisplay');
    const codeEl = document.getElementById('langCodeDisplay');
    if (flagEl) flagEl.textContent = LANG_FLAGS[locale] || '';
    if (codeEl) codeEl.textContent = locale.toUpperCase();
    // Close dropdown
    const drop = document.getElementById('langDropFallback');
    if (drop) drop.style.display = 'none';
}

// Close lang dropdown when clicking outside
document.addEventListener('click', function(e) {
    const picker = document.getElementById('langPicker');
    const drop = document.getElementById('langDropFallback');
    if (drop && picker && !picker.contains(e.target)) {
        drop.style.display = 'none';
    }
});

// Notification UI
function loadNotifUI() {
    if (typeof NOTIF === 'undefined') return;
    const toggle = document.getElementById('notifToggle');
    const options = document.getElementById('notifOptions');
    if (!toggle || !options) return;

    const prefs = NOTIF.getPrefs();
    toggle.checked = NOTIF.isEnabled();
    options.style.display = NOTIF.isEnabled() ? 'block' : 'none';

    const dayEl = document.getElementById('notifDay');
    const hourEl = document.getElementById('notifHour');
    const onDayEl = document.getElementById('notifOnDay');
    if (dayEl) dayEl.checked = prefs.dayBefore;
    if (hourEl) hourEl.checked = prefs.hourBefore;
    if (onDayEl) onDayEl.checked = prefs.onDay;
}

async function toggleNotifications(enabled) {
    if (typeof NOTIF === 'undefined') return;
    if (enabled) {
        await NOTIF.enable();
        _track('notifications_enabled', {});
    } else {
        NOTIF.disable();
        _track('notifications_disabled', {});
    }
    loadNotifUI();
}

function updateNotifPrefs() {
    if (typeof NOTIF === 'undefined') return;
    const prefs = NOTIF.getPrefs();
    const dayEl = document.getElementById('notifDay');
    const hourEl = document.getElementById('notifHour');
    const onDayEl = document.getElementById('notifOnDay');
    if (dayEl) prefs.dayBefore = dayEl.checked;
    if (hourEl) prefs.hourBefore = hourEl.checked;
    if (onDayEl) prefs.onDay = onDayEl.checked;
    NOTIF.savePrefs(prefs);
    // Re-schedule with updated preferences
    if (NOTIF.isEnabled()) {
        NOTIF.scheduleMilestoneNotifications();
    }
}

function loadDarkMode() {
    let saved = localStorage.getItem('happymoments_theme');
    if (!saved) {
        // Auto-detect system preference for first-time users
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            saved = 'light';
        } else {
            saved = 'dark';
        }
    }
    setAppTheme(saved, true);
}

function setAppTheme(theme, skipSave) {
    if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    if (!skipSave) localStorage.setItem('happymoments_theme', theme);

    // Update button states
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme-val') === theme);
    });

    // Keep legacy darkModeToggle in sync if it exists
    if (darkModeToggle) darkModeToggle.checked = (theme === 'dark');
}

function handleDarkModeToggle() {
    setAppTheme(darkModeToggle.checked ? 'dark' : 'light');
}

function loadData() {
    // Try encrypted load first, then plain JSON fallback
    const saved = localStorage.getItem(STORAGE_KEY_DATA);
    if (!saved) { loadComboTypesUI(); return; }

    if (saved.startsWith('enc:') && typeof DATA_PROTECTION !== 'undefined') {
        DATA_PROTECTION.loadSecure(STORAGE_KEY_DATA).then(data => {
            if (data) applyLoadedData(data);
            loadComboTypesUI();
        }).catch(() => {
            applyLoadedDataFromRaw(saved);
            loadComboTypesUI();
        });
    } else {
        applyLoadedDataFromRaw(saved);
        loadComboTypesUI();
    }
}

function applyLoadedDataFromRaw(saved) {
    try {
        const data = JSON.parse(saved);
        applyLoadedData(data);
    } catch (e) {
        console.error('Failed to parse saved data');
    }
}

function applyLoadedData(data) {
    if (!data) return;

    if (data.sets && Array.isArray(data.sets)) {
        allSets = data.sets.map(set => ({
            ...set,
            events: (set.events || []).map(e => ({ ...e, date: new Date(e.date) }))
        }));
        currentSetId = data.currentSetId || (allSets.length > 0 ? allSets[0].id : null);
    } else {
        const events = (data.events || []).map(e => ({ ...e, date: new Date(e.date) }));
        let connections = data.connections || {};

        if (!data.connections && data.groups && data.groups.length > 0) {
            connections = {};
            data.groups.forEach(g => {
                Object.assign(connections, g.connections || {});
            });
        }

        if (events.length > 0) {
            allSets = [{
                id: 'set_default',
                name: 'My Dates',
                events: events,
                connections: connections,
                comboTypes: data.comboTypes || { sum: true, ratio: true, duration: true }
            }];
            currentSetId = 'set_default';
        }
    }

    loadCurrentSet();
    if (appData.events.length > 0) {
        showDashboard();
    }
}

function loadCurrentSet() {
    const currentSet = allSets.find(s => s.id === currentSetId);
    if (currentSet) {
        appData.events = currentSet.events || [];
        appData.connections = currentSet.connections || {};
        appData.comboTypes = currentSet.comboTypes || { sum: true, ratio: true, duration: true };

        // Ensure the set also has these properties saved
        if (!currentSet.connections) currentSet.connections = {};
        if (!currentSet.events) currentSet.events = [];
    } else {
        appData.events = [];
        appData.connections = {};
        appData.comboTypes = { sum: true, ratio: true, duration: true };
    }
    updateSetSwitcher();
}

function loadSettings() {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
        let settings;
        try {
            settings = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse saved settings:', e);
            return;
        }
        appSettings = { ...DEFAULT_SETTINGS, ...settings };
        appSettings.patterns = { ...DEFAULT_SETTINGS.patterns, ...(settings.patterns || {}) };
        appSettings.constants = { ...DEFAULT_SETTINGS.constants, ...(settings.constants || {}) };
        appSettings.luckyDigits = settings.luckyDigits || DEFAULT_SETTINGS.luckyDigits;
        appSettings.customNumbers = settings.customNumbers || [];
    }
    loadSettingsUI();
}

function saveData() {
    // Update current set in allSets
    const currentSetIndex = allSets.findIndex(s => s.id === currentSetId);
    if (currentSetIndex >= 0) {
        allSets[currentSetIndex] = {
            ...allSets[currentSetIndex],
            events: appData.events || [],
            connections: appData.connections || {},
            comboTypes: appData.comboTypes || { sum: true, ratio: true, duration: true }
        };
    }

    // Prepare data object
    const dataObj = {
        sets: allSets.map(set => ({
            ...set,
            events: (set.events || []).map(e => ({
                ...e,
                date: e.date instanceof Date ? e.date.toISOString() : e.date
            })),
            connections: set.connections || {},
            comboTypes: set.comboTypes || { sum: true, ratio: true, duration: true }
        })),
        currentSetId: currentSetId
    };

    // Save encrypted if available, with sync fallback
    if (typeof DATA_PROTECTION !== 'undefined' && DATA_PROTECTION.isAvailable()) {
        DATA_PROTECTION.saveSecure(STORAGE_KEY_DATA, dataObj).catch(() => {
            try { localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(dataObj)); }
            catch (e) { showToast('Storage full — cannot save data.', 'error'); }
        });
    } else {
        try { localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(dataObj)); }
        catch (e) { showToast('Storage full — cannot save data.', 'error'); }
    }

    // Re-schedule notifications whenever data changes
    if (typeof NOTIF !== 'undefined' && NOTIF.isEnabled()) {
        NOTIF.scheduleMilestoneNotifications();
    }
}

function saveSettings() {
    try { localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(appSettings)); }
    catch (e) { showToast('Storage full — cannot save settings.', 'error'); }
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {
    // startBtn now handled by wizard onclick="wizardDiscover()" — don't add duplicate listener

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Events tab
    addEventBtn.addEventListener('click', handleAddEvent);
    newEventNameInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleAddEvent();
    });
    newEventDateInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleAddEvent();
    });

    // Edit modal
    saveEditBtn.addEventListener('click', handleSaveEdit);
    cancelEditBtn.addEventListener('click', closeEditModal);
    deleteEditBtn.addEventListener('click', handleDeleteEdit);
    editModal.addEventListener('click', e => {
        if (e.target === editModal) closeEditModal();
    });

    // Combination settings
    document.querySelectorAll('[data-combo-type]').forEach(cb => {
        cb.addEventListener('change', handleComboTypeChange);
    });

    // Individual Milestones tab
    refreshMilestonesBtn.addEventListener('click', renderMilestonesTab);
    copyShareBtn.addEventListener('click', handleCopyShare);
    whatsappShareBtn.addEventListener('click', handleWhatsAppShare);
    if (viberShareBtn) viberShareBtn.addEventListener('click', handleViberShare);
    if (emailShareBtn) emailShareBtn.addEventListener('click', handleEmailShare);

    // Native share (Web Share API)
    const nativeShareBtn = document.getElementById('nativeShareBtn');
    const nativeCombinedShareBtn = document.getElementById('nativeCombinedShareBtn');
    if (navigator.share) {
        if (nativeShareBtn) { nativeShareBtn.classList.remove('hidden'); nativeShareBtn.addEventListener('click', handleNativeShare); }
        if (nativeCombinedShareBtn) { nativeCombinedShareBtn.classList.remove('hidden'); nativeCombinedShareBtn.addEventListener('click', handleNativeCombinedShare); }
    }

    // Calendar buttons — Individual
    const googleCalBtn = document.getElementById('googleCalBtn');
    const outlookCalBtn = document.getElementById('outlookCalBtn');
    const icsCalBtn = document.getElementById('icsCalBtn');
    if (googleCalBtn) googleCalBtn.addEventListener('click', handleGoogleCal);
    if (outlookCalBtn) outlookCalBtn.addEventListener('click', handleOutlookCal);
    if (icsCalBtn) icsCalBtn.addEventListener('click', handleIcsCal);

    // Milestone Calculator (only if elements exist)
    if (calcBtn) calcBtn.addEventListener('click', calculateMilestone);
    if (calcNumberInput) calcNumberInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') calculateMilestone();
    });

    // Combined Milestones tab
    refreshCombinedBtn.addEventListener('click', renderCombinedTab);
    copyCombinedShareBtn.addEventListener('click', handleCopyCombinedShare);
    whatsappCombinedShareBtn.addEventListener('click', handleWhatsAppCombinedShare);
    if (viberCombinedShareBtn) viberCombinedShareBtn.addEventListener('click', handleViberCombinedShare);
    if (emailCombinedShareBtn) emailCombinedShareBtn.addEventListener('click', handleEmailCombinedShare);

    // Calendar buttons — Combined
    const googleCalCombinedBtn = document.getElementById('googleCalCombinedBtn');
    const outlookCalCombinedBtn = document.getElementById('outlookCalCombinedBtn');
    const icsCalCombinedBtn = document.getElementById('icsCalCombinedBtn');
    if (googleCalCombinedBtn) googleCalCombinedBtn.addEventListener('click', handleGoogleCalCombined);
    if (outlookCalCombinedBtn) outlookCalCombinedBtn.addEventListener('click', handleOutlookCalCombined);
    if (icsCalCombinedBtn) icsCalCombinedBtn.addEventListener('click', handleIcsCalCombined);

    // Settings
    addCustomNumberBtn.addEventListener('click', handleAddCustomNumber);
    saveSettingsBtn.addEventListener('click', handleSaveSettings);
    resetBtn.addEventListener('click', handleReset);
    exportDataBtn.addEventListener('click', handleExportData);
    importDataInput.addEventListener('change', handleImportData);
    if (darkModeToggle) darkModeToggle.addEventListener('change', handleDarkModeToggle);

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => addCustomNumber(parseInt(btn.dataset.number, 10)));
    });

    if (customNumberInput) customNumberInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleAddCustomNumber();
    });

    // Event Sets (Advanced)
    if (currentSetSelect) currentSetSelect.addEventListener('change', handleSwitchSet);
    if (addSetBtn) addSetBtn.addEventListener('click', handleAddSet);
    if (newSetNameInput) newSetNameInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleAddSet();
    });

    // Rename current set button
    if (renameCurrentSetBtn) {
        renameCurrentSetBtn.addEventListener('click', () => {
            if (currentSetId) {
                renameSet(currentSetId);
            }
        });
    }
}

// ============================================================
// TAB NAVIGATION
// ============================================================

// ── Profile Panel ──
function toggleProfilePanel() {
    const panel = document.getElementById('profilePanel');
    const overlay = document.getElementById('profileOverlay');
    if (!panel) return;

    const isOpen = panel.classList.contains('visible');
    if (isOpen) {
        panel.classList.remove('visible');
        if (overlay) overlay.classList.add('hidden');
    } else {
        // Move settings content into profile panel on first open
        const body = document.getElementById('profilePanelBody');
        if (body && body.children.length === 0 && settingsTab) {
            // Move all cards from settings tab into profile panel
            while (settingsTab.firstChild) {
                body.appendChild(settingsTab.firstChild);
            }
            // Add lang picker into panel
            const langPicker = document.getElementById('langPicker');
            if (langPicker) {
                langPicker.classList.remove('hidden');
                body.insertBefore(langPicker, body.firstChild);
            }
        }
        panel.classList.add('visible');
        panel.classList.remove('hidden');
        if (overlay) overlay.classList.remove('hidden');
    }
}

function switchTab(tabName) {
    _track('tab_switched', { tab: tabName });
    // Update bottom tab buttons
    document.querySelectorAll('.tab-btn-bottom').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    // Legacy top tabs (if any remain)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Clear selection state
    selectedMilestone = null;
    selectedCombinedMilestone = null;
    if (sharePreviewEl) sharePreviewEl.textContent = '';
    if (combinedSharePreviewEl) combinedSharePreviewEl.textContent = '';

    // "Me" tab: individual milestones
    if (tabName === 'me' || tabName === 'milestones') {
        milestonesTab.classList.remove('hidden');
        combinedTab.classList.add('hidden');
        eventsTab.classList.add('hidden');
        if (settingsTab) settingsTab.classList.add('hidden');
        switchHomeView('me');
        renderPersonFilter();
        renderMilestonesTab();
    }
    // "Together" tab: group/combined milestones
    else if (tabName === 'together' || tabName === 'combined') {
        milestonesTab.classList.remove('hidden');
        combinedTab.classList.add('hidden');
        eventsTab.classList.add('hidden');
        if (settingsTab) settingsTab.classList.add('hidden');
        switchHomeView('group');
        renderMilestonesTab();
    }
    // "Manage" tab: people, groups, settings
    else if (tabName === 'manage' || tabName === 'events') {
        milestonesTab.classList.add('hidden');
        combinedTab.classList.add('hidden');
        eventsTab.classList.remove('hidden');
        if (settingsTab) settingsTab.classList.remove('hidden');
        renderEventsTab();
        renderPeopleTabGroups();
        if (typeof loadSettingsUI === 'function') loadSettingsUI();
    }
    // Legacy: settings-only
    else if (tabName === 'settings') {
        milestonesTab.classList.add('hidden');
        combinedTab.classList.add('hidden');
        eventsTab.classList.add('hidden');
        if (settingsTab) settingsTab.classList.remove('hidden');
        if (typeof loadSettingsUI === 'function') loadSettingsUI();
    }

    // Show first-visit tab hint
}

// ── Home sub-toggle: Me / Group ──
function switchHomeView(view) {
    const meView = document.getElementById('homeViewMe');
    const groupView = document.getElementById('homeViewGroup');
    const toggleMe = document.getElementById('toggleMe');
    const toggleGroup = document.getElementById('toggleGroup');

    if (view === 'me') {
        if (meView) meView.style.display = '';
        if (groupView) groupView.style.display = 'none';
        if (toggleMe) toggleMe.classList.add('active');
        if (toggleGroup) toggleGroup.classList.remove('active');
    } else {
        if (meView) meView.style.display = 'none';
        if (groupView) groupView.style.display = '';
        if (toggleMe) toggleMe.classList.remove('active');
        if (toggleGroup) toggleGroup.classList.add('active');
        // Render combined milestones into the group view
        const content = document.getElementById('groupMilestonesContent');
        if (content && typeof renderCombinedTab === 'function') {
            // Trigger combined tab render — it populates combinedMilestonesContent
            renderCombinedTab();
            // Move the content into group view
            const combinedContent = document.getElementById('combinedMilestonesContent');
            if (combinedContent) {
                content.innerHTML = combinedContent.innerHTML;
            }
        }
        if (content && content.innerHTML.trim() === '') {
            content.innerHTML = '<p style="text-align:center;padding:32px;color:var(--text-muted);font-style:italic;">Add 2 or more people to discover combined milestones.</p>';
        }
    }
    _track('home_view_switched', { view });
}

// ============================================================
// PERSON FILTER (Multi-select)
// ============================================================

function renderPersonFilter() {
    if (appData.events.length === 0) {
        personFilterEl.classList.add('hidden');
        return;
    }
    // Show person filter for returning users so they can filter by person
    personFilterEl.style.display = '';

    personFilterEl.classList.remove('hidden');

    // Default to all people selected
    if (selectedPersonIds.length === 0 && !_mostSpecialMode) {
        selectedPersonIds = appData.events.map(e => e.id);
    }

    let html = '<div class="person-buttons">';

    // Individual person buttons only — no All, no Best
    appData.events.forEach(e => {
        const isActive = selectedPersonIds.includes(e.id) && !_mostSpecialMode;
        html += `
            <button class="person-filter-btn ${isActive ? 'active' : ''}"
                    onclick="togglePerson('${e.id}')">
                ${escapeHtml(e.name)}
            </button>
        `;
    });

    html += '</div>';
    personFilterEl.innerHTML = html;
}

function selectMostSpecial() {
    _mostSpecialMode = !_mostSpecialMode; // toggle
    if (_mostSpecialMode) {
        selectedPersonIds = [];
        milestonesTitleEl.textContent = (typeof I18N!=='undefined') ? I18N.t('highlights') : 'Highlights';
    } else {
        selectedPersonIds = appData.events.map(e => e.id);
        milestonesTitleEl.textContent = (typeof I18N!=='undefined') ? I18N.t('upcoming_milestones') : 'Upcoming Milestones';
    }
    const btn = document.getElementById('highlightsBtn');
    if (btn) btn.classList.toggle('active', _mostSpecialMode);
    renderPersonFilter();
    renderMilestonesTab();
}

function selectAllPeople() {
    _mostSpecialMode = false;
    selectedPersonIds = appData.events.map(e => e.id);
    const btn = document.getElementById('highlightsBtn');
    if (btn) btn.classList.remove('active');
    renderPersonFilter();
    renderMilestonesTab();
    milestonesTitleEl.textContent = (typeof I18N!=='undefined') ? I18N.t('upcoming_milestones') : 'Upcoming Milestones';
}

function switchToSetFromFilter(setId) {
    if (setId === currentSetId) return;
    currentSetId = setId;
    loadCurrentSet();
    _mostSpecialMode = false;
    selectedPersonIds = appData.events.map(e => e.id);
    updateSetSwitcher();
    renderPersonFilter();
    renderMilestonesTab();
    milestonesTitleEl.textContent = (typeof I18N!=='undefined') ? I18N.t('upcoming_milestones') : 'Upcoming Milestones';
}

function togglePerson(personId) {
    _mostSpecialMode = false;

    const index = selectedPersonIds.indexOf(personId);

    if (index === -1) {
        // Add to selection
        selectedPersonIds.push(personId);
    } else {
        // Remove from selection
        selectedPersonIds.splice(index, 1);
        // If none left, select all
        if (selectedPersonIds.length === 0) {
            selectedPersonIds = appData.events.map(e => e.id);
        }
    }

    renderPersonFilter();
    renderMilestonesTab();

    // Update title based on selection
    if (selectedPersonIds.length === appData.events.length) {
        milestonesTitleEl.textContent = (typeof I18N!=='undefined') ? I18N.t('upcoming_milestones') : 'Upcoming Milestones';
    } else if (selectedPersonIds.length === 1) {
        const person = appData.events.find(e => e.id === selectedPersonIds[0]);
        if (person) {
            milestonesTitleEl.textContent = `${person.name}'s Milestones`;
        }
    } else {
        const names = selectedPersonIds.map(id => {
            const person = appData.events.find(e => e.id === id);
            return person ? person.name : '';
        }).filter(n => n).join(' + ');
        milestonesTitleEl.textContent = `${names} Combined`;
    }
}

// ============================================================
// MILESTONE CALCULATOR
// ============================================================

function calculateMilestone() {
    const number = parseInt(calcNumberInput.value, 10);
    const unit = calcUnitSelect.value;

    if (isNaN(number) || number <= 0) {
        showToast('Please enter a valid positive number', 'error');
        return;
    }

    // Determine which person(s) to calculate for
    const eventsToCalc = selectedPersonIds.length > 0
        ? appData.events.filter(e => selectedPersonIds.includes(e.id))
        : appData.events;

    if (eventsToCalc.length === 0) {
        showToast('No events to calculate for. Add an event first.', 'error');
        return;
    }

    // Calculate for each person
    const results = [];
    const now = new Date();

    eventsToCalc.forEach(event => {
        const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
        const unitConfig = TIME_UNITS[unit];

        // Calculate when they reach this milestone
        const msToAdd = number * unitConfig.msMultiplier;
        const milestoneDate = new Date(eventDate.getTime() + msToAdd);

        const isPast = milestoneDate < now;
        const timeDiff = Math.abs(milestoneDate.getTime() - now.getTime());

        results.push({
            event: event,
            milestoneDate: milestoneDate,
            isPast: isPast,
            timeDiff: timeDiff
        });
    });

    // Display results
    displayCalcResults(results, number, unit);
}

function displayCalcResults(results, number, unit) {
    const unitConfig = TIME_UNITS[unit];
    const formattedNumber = number.toLocaleString();

    let html = '';

    results.forEach(result => {
        const dateStr = result.milestoneDate.toLocaleDateString(getAppLocale(), {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const timeStr = result.milestoneDate.toLocaleTimeString(getAppLocale(), {
            hour: '2-digit',
            minute: '2-digit'
        });

        const timeAgo = formatTimeDistance(result.timeDiff);
        const statusClass = result.isPast ? 'past' : 'future';
        const statusText = result.isPast ? `${timeAgo} ago` : `in ${timeAgo}`;
        const titleText = result.isPast ? 'You reached' : 'You will reach';

        html += `
            <div class="calc-result-item ${statusClass}">
                <div class="calc-result-title">${titleText}</div>
                <div class="calc-result-value">${formattedNumber} ${unitConfig.plural}</div>
                <div class="calc-result-date">${dateStr}</div>
                <div class="calc-result-time">${timeStr}</div>
                <div class="calc-result-ago">${statusText}</div>
                ${results.length > 1 ? `<div class="calc-result-person">${escapeHtml(result.event.name)}</div>` : ''}
            </div>
        `;
    });

    calcResultEl.innerHTML = html;
    calcResultEl.classList.remove('hidden');

    // Scroll to result
    calcResultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================================
// ONBOARDING
// ============================================================

function validateDateFields(dateStr) {
    if (!dateStr) return false;
    const parts = dateStr.split('-').map(Number);
    if (parts.length < 3) return false;
    const [y, m, d] = parts;

    // Check ranges
    if (y < 1900 || y > new Date().getFullYear()) {
        showToast('Please enter a valid year', 'error');
        return false;
    }
    if (m < 1 || m > 12) {
        showToast('Month must be 1-12', 'error');
        return false;
    }
    // Check day-in-month (including leap years)
    const maxDay = new Date(y, m, 0).getDate();
    if (d < 1 || d > maxDay) {
        showToast(`Day must be 1-${maxDay} for month ${m}`, 'error');
        return false;
    }
    // Future date warning
    const date = new Date(y, m - 1, d);
    if (date > new Date()) {
        showToast('This date is in the future — milestones work best with past dates', 'info', 4000);
    }
    return true;
}

// ============================================================
// ONBOARDING WIZARD (9-screen team flow)
// ============================================================

function wizardNext(step) {
    // Auto-accept consent on first wizard interaction
    if (!localStorage.getItem('happymoments_consent')) acceptConsent();

    // Auto-trigger combined milestone rendering when reaching Screen 7
    // Navigate, scroll to top
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    const nextStep = document.getElementById('wizardStep' + step);
    if (nextStep) {
        nextStep.classList.add('wizard-step-active');
        window.scrollTo(0, 0);
        const input = nextStep.querySelector('input:not([type="hidden"])');
        if (input) setTimeout(() => { input.focus(); input.select(); }, 300);
    }
}

// wizardRunDemo is no longer needed — screen 1 is a static hook
function wizardRunDemo() { /* no-op for backward compatibility */ }

// --- Screen 2: Preference selection ---
function wizardSelectPreference(btn) {
    document.querySelectorAll('#wizardPreferenceOptions .wizard-option').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function wizardTogglePreference(btn) {
    btn.classList.toggle('selected');
}

function wizardSavePreference() {
    const selected = document.querySelectorAll('#wizardPreferenceOptions .wizard-option.selected');
    const prefs = Array.from(selected).map(b => b.dataset.pref);
    const prefList = prefs.length > 0 ? prefs : ['math','palindromes','round','lucky','sacred','cosmic'];
    try { localStorage.setItem('hm_preferred_patterns', JSON.stringify(prefList)); } catch(e) {}

    // Apply wizard preferences to the actual appSettings.patterns
    // Map wizard categories to appSettings pattern keys
    const hasMath = prefList.includes('math');
    const hasPalindromes = prefList.includes('palindromes');
    const hasRound = prefList.includes('round');
    const hasLucky = prefList.includes('lucky');

    appSettings.patterns.scientific = hasMath;
    appSettings.patterns.fibonacci = hasMath;
    appSettings.patterns.powers2 = hasMath;
    appSettings.patterns.palindromes = hasPalindromes;
    appSettings.patterns.powers = hasRound;
    appSettings.patterns.repdigits = hasRound;
    appSettings.patterns.sequential = hasRound;
    appSettings.patterns.alternating = hasRound;
    appSettings.patterns.lucky = hasLucky;

    // Save the settings so they persist
    saveSettings();
}

// --- Screen 3: Who first? ---
function wizardChooseWho(type) {
    const _t = (typeof I18N !== 'undefined' && I18N.t) ? I18N.t : (k => k);
    const nameInput = document.getElementById('birthName');
    if (type === 'self') {
        if (nameInput) nameInput.value = _t('wizard_my_birthday');
        document.getElementById('wizardNameTitle').textContent = _t('wizard_name_self');
    } else {
        if (nameInput) nameInput.value = '';
        document.getElementById('wizardNameTitle').textContent = _t('wizard_name_other');
    }
    wizardNext(4);
}

// --- Screen 4: Name next ---
function wizardNameNext() {
    const _t = (typeof I18N !== 'undefined' && I18N.t) ? I18N.t : (k => k);
    const name = document.getElementById('birthName')?.value?.trim();
    if (!name) {
        showToast(_t('wizard_please_enter_name'), 'error');
        return;
    }
    // Update date screen title with the name
    const dateTitle = document.getElementById('wizardDateTitle');
    if (dateTitle) {
        const template = _t('wizard_date_title');
        dateTitle.textContent = template.replace('{name}', name);
    }
    wizardNext(5);
}

/**
 * Animate a number counting up from 0 to targetValue over duration ms.
 * Uses requestAnimationFrame for smooth 60fps and ease-out timing.
 * Formats with locale separators throughout the animation.
 * @param {HTMLElement} element - DOM element to update textContent
 * @param {number} targetValue - Final number to reach
 * @param {number} duration - Animation duration in ms
 * @param {Function} [onComplete] - Callback when counting finishes
 */
function animateCounter(element, targetValue, duration, onComplete) {
    const startTime = performance.now();
    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const currentValue = Math.round(easedProgress * targetValue);

        element.textContent = currentValue.toLocaleString(locale);

        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            // Ensure final value is exact
            element.textContent = targetValue.toLocaleString(locale);
            if (typeof onComplete === 'function') onComplete();
        }
    }

    requestAnimationFrame(tick);
}

// --- Shared helper: create event, calculate milestones, render reveal ---
function _wizardCreateAndReveal(name, dateStr, revealElId, revealStepId) {
    if (!validateDateFields(dateStr)) return false;
    const date = parseLocalDate(dateStr);

    // Create default set if none exists
    if (allSets.length === 0) {
        allSets.push({
            id: 'set_default', name: 'My Dates', events: [],
            connections: {}, comboTypes: { sum: true, ratio: true, duration: true }
        });
        currentSetId = 'set_default';
        loadCurrentSet();
    }

    // Only add if not already there (prevent duplicates)
    if (!appData.events.some(e => e.name === name && e.date.getTime() === date.getTime())) {
        appData.events.push({
            id: 'event_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            name: name, type: 'birthday', date: date
        });
        saveData();
    }

    // Calculate milestones for the reveal
    selectedPersonIds = appData.events.map(e => e.id);
    allMilestonesFlat = [];
    const milestones = typeof findAllUpcomingMilestones === 'function'
        ? findAllUpcomingMilestones(date, 20, 365, appSettings || {}) : [];
    if (typeof findBigMilestones === 'function') {
        const big = findBigMilestones(date, appSettings || {});
        big.forEach(b => { if (!milestones.some(m => m.value === b.value && m.unit === b.unit)) milestones.push(b); });
    }
    if (typeof findCosmicMilestones === 'function') {
        const cosmic = findCosmicMilestones(date);
        cosmic.forEach(c => { if (!milestones.some(m => m.unit === c.unit && m.value === c.value)) milestones.push(c); });
    }
    milestones.forEach(m => { m.eventName = name; m.eventId = appData.events[appData.events.length - 1].id; });
    milestones.sort((a, b) => a.date.getTime() - b.date.getTime());
    allMilestonesFlat = milestones;

    // Find the best milestone for the reveal — prefer universally understood numbers
    const revealEl = document.getElementById(revealElId);
    if (revealEl && milestones.length > 0) {
        let best = milestones[0];
        let bestScore = 0;
        milestones.forEach(m => {
            let score = 0;
            const s = String(m.value);
            const daysAway = m.timeUntil / (24*60*60*1000);

            // STRONGLY prefer universally clear milestones for first reveal
            if (m.isBirthday) score += 150; // upcoming birthday — everyone understands
            if (m.isBigMilestone) score += 120; // billion seconds, 10K days — wow factor
            if (m.value >= 1000 && m.value % 1000 === 0) score += 100; // round thousands
            if (s.length >= 3 && new Set(s).size === 1) score += 90; // repdigit (11111)
            if (m.isCosmic && m.isSaturnReturn) score += 60; // Saturn return — interesting but not dominant
            if (m.isCosmic && m.isVerySpecialCosmic) score += 20; // Jupiter/Chiron — low priority
            if (m.isCosmic && !m.isSaturnReturn && !m.isVerySpecialCosmic) score += 5; // Mercury/Mars/etc — very low

            // DEPRIORITIZE obscure patterns for onboarding reveal
            if (m.type === 'fibonacci') score += 10; // low — people don't know 2584
            if (m.type === 'power_of_2') score += 15; // low — 4096 is not obvious
            if (m.type === 'scientific') score += 10; // low — Pi×10000 is niche
            if (m.type === 'palindrome') score += 40; // medium — people can see 12321

            // Proximity bonus (closer = better)
            score += Math.max(0, 80 - daysAway * 0.22);

            if (score > bestScore) { bestScore = score; best = m; }
        });
        const m = best;

        const dateDisplay = m.date.toLocaleDateString(getAppLocale(), {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        });
        const countdown = typeof formatTimeDistance === 'function' ? formatTimeDistance(m.timeUntil) : '';

        // Emotional framing for countdown (Spotify Wrapped style)
        const daysAway = Math.ceil(m.timeUntil / (24*60*60*1000));
        let countdownText = '';
        if (m.timeUntil <= 0) {
            const daysPast = Math.abs(daysAway);
            countdownText = daysPast <= 1 ? 'That was yesterday!' : `You passed this ${countdown} ago`;
        } else if (daysAway <= 1) {
            countdownText = 'That\u2019s today!';
        } else if (daysAway <= 7) {
            countdownText = `That\u2019s this week!`;
        } else if (daysAway <= 30) {
            countdownText = `Coming in just ${daysAway} days`;
        } else {
            countdownText = `${countdown} from now`;
        }

        // Build reveal HTML — clean, spacious, large type
        revealEl.innerHTML = `
            <div class="wizard-reveal-number-wrap">
                <div class="wizard-reveal-sparkle"></div>
                <div class="wizard-reveal-number" id="${revealElId}Number">0</div>
            </div>
            <div class="wizard-reveal-unit">${m.isCosmic ? escapeHtml(m.description) : escapeHtml(m.unitName)}</div>
            <div class="wizard-reveal-date">${dateDisplay}</div>
            <div class="wizard-reveal-countdown">${countdownText}</div>
        `;

        // Store for sharing (keyed so we can have both user and friend)
        if (revealElId === 'wizardReveal') {
            window._wizardMilestone = m;
        } else if (revealElId === 'wizardPerson3Reveal') {
            window._wizardPerson3Milestone = m;
            window._wizardPerson3Name = name;
        } else {
            window._wizardFriendMilestone = m;
            window._wizardFriendName = name;
        }

        // Apply stagger class to hide supporting elements initially
        const step = document.getElementById(revealStepId);
        if (step) {
            step.classList.add('reveal-stagger', 'reveal-counting');
            step.classList.remove('reveal-done');
        }

        // Start counter animation after a brief pause for the step transition
        const numberEl = document.getElementById(revealElId + 'Number');
        if (numberEl) {
            const targetValue = m.value;
            const duration = targetValue >= 1000000 ? 2000 : targetValue >= 10000 ? 1700 : 1500;
            setTimeout(() => {
                animateCounter(numberEl, targetValue, duration, () => {
                    if (step) {
                        step.classList.remove('reveal-counting');
                        step.classList.add('reveal-done');
                    }
                });
            }, 300);
        }
    }
    return true;
}

// --- v5 Onboarding: Screen 1 → 2 (enter date → show billion reveal) ---
function wizardDiscoverV5() {
    const _t = (typeof I18N !== 'undefined' && I18N.t) ? I18N.t : (k => k);
    const name = document.getElementById('birthName')?.value?.trim() || 'Me';
    const dateStr = buildDateFromFields('birth');

    if (!dateStr) {
        showToast(_t('wizard_please_enter_date') || 'Please enter a date', 'error');
        return;
    }

    // Auto-accept consent
    if (!localStorage.getItem('happymoments_consent')) acceptConsent();

    const ok = _wizardCreateAndReveal(name, dateStr, 'wizardReveal', 'wizardStep2');
    if (!ok) return;

    _track('onboard_date_entered', { event_count: appData.events.length });

    // Show reveal (screen 2)
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    document.getElementById('wizardStep2')?.classList.add('wizard-step-active');
    window.scrollTo(0, 0);

    onboardingSection.classList.remove('hidden');
    tabNav.classList.add('hidden');
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
}

// --- v7 Onboarding: Screen 2 → 3 (show more of MY milestones) ---
function wizardShowMyMore() {
    _track('onboard_my_more');
    const el = document.getElementById('wizardMyMore');
    if (!el) return;

    const milestones = allMilestonesFlat || [];
    let upcoming = milestones.filter(m => m.timeUntil > 0 && !m.isCosmic);
    // Fallback: if no non-cosmic milestones, include all upcoming
    if (upcoming.length === 0) upcoming = milestones.filter(m => m.timeUntil > 0);
    const count = upcoming.length;
    upcoming = upcoming.slice(0, 4);
    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;

    let listHtml = '';
    upcoming.forEach(m => {
        const dateStr = m.date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
        const val = m.value.toLocaleString(locale);
        const unit = m.isCosmic ? (m.description || m.unitName) : m.unitName;
        const isBig = m.isBigMilestone || m.isSaturnReturn || (m.value >= 10000 && m.value % 10000 === 0);
        listHtml += `<div class="wizard-milestone-row ${isBig ? 'wizard-milestone-star' : ''}">
            <span class="wizard-milestone-value" style="white-space:nowrap;">${isBig ? '\u2605 ' : ''}${val} ${unit}</span>
            <span class="wizard-milestone-date">${dateStr}</span>
        </div>`;
    });

    const moreCount = Math.max(0, count - 4);
    const heading = count > 0 ? `You have ${count} milestones coming` : 'Your milestones are being calculated';
    el.innerHTML = `
        <h2 class="wizard-question">${heading}</h2>
        <div class="wizard-milestone-list">${listHtml}</div>
        ${moreCount > 0 ? `<p class="wizard-more-hint">...and ${moreCount} more</p>` : ''}
    `;

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    document.getElementById('wizardStep3')?.classList.add('wizard-step-active');
    window.scrollTo(0, 0);
}

// --- v7 Onboarding: Screen 5 → 6 (show THEIR milestones) ---
function wizardShowTheirMore() {
    _track('onboard_their_more');
    const el = document.getElementById('wizardTheirMore');
    if (!el) return;

    // Get milestones for the friend (last added person)
    const friendEvent = appData.events[appData.events.length - 1];
    if (!friendEvent) { wizardNext(7); return; }

    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;
    const ms = typeof findAllUpcomingMilestones === 'function'
        ? findAllUpcomingMilestones(friendEvent.date, 20, 730, appSettings) : [];
    if (typeof findBigMilestones === 'function') {
        findBigMilestones(friendEvent.date, appSettings).forEach(b => {
            if (!ms.some(m => m.value === b.value && m.unit === b.unit)) ms.push(b);
        });
    }
    if (typeof findCosmicMilestones === 'function') {
        findCosmicMilestones(friendEvent.date).forEach(c => {
            if (!ms.some(m => m.unit === c.unit && m.value === c.value)) ms.push(c);
        });
    }
    const upcoming = ms.filter(m => m.timeUntil > 0 && !m.isCosmic).sort((a, b) => a.timeUntil - b.timeUntil).slice(0, 4);

    let html = `<h2 class="wizard-question">${escapeHtml(friendEvent.name)}'s milestones</h2>`;
    html += '<div class="wizard-milestone-list">';
    upcoming.forEach(m => {
        const val = m.value.toLocaleString(locale);
        const unit = m.isCosmic ? (m.description || m.unitName) : m.unitName;
        const dateStr = m.date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
        const isBig = m.isBigMilestone || m.isSaturnReturn || (m.value >= 10000 && m.value % 10000 === 0);
        html += `<div class="wizard-milestone-row ${isBig ? 'wizard-milestone-star' : ''}">
            <span class="wizard-milestone-value" style="white-space:nowrap;">${isBig ? '\u2605 ' : ''}${val} ${unit}</span>
            <span class="wizard-milestone-date">${dateStr}</span>
        </div>`;
    });
    html += '</div>';
    el.innerHTML = html;

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    document.getElementById('wizardStep6')?.classList.add('wizard-step-active');
}

// --- v7 Onboarding: Screen 7 (combined milestone + dashboard landing) ---
function wizardShowCombined(isRefresh) {
    const el = document.getElementById('wizardCombined');
    if (!el) return;

    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;
    const now = new Date();

    if (appData.events.length >= 2) {
        let totalDays = 0;
        const names = [];
        appData.events.forEach(e => {
            totalDays += Math.floor((now.getTime() - new Date(e.date).getTime()) / (24*60*60*1000));
            names.push(e.name);
        });
        // Find the closest nice round number (try 1000, 5000, 10000 increments)
        const candidates = [1000, 2500, 5000, 10000, 25000, 50000, 100000];
        let bestTarget = 0, bestDist = Infinity;
        candidates.forEach(step => {
            const target = Math.ceil(totalDays / step) * step;
            const dist = target - totalDays;
            if (dist > 0 && dist < bestDist) { bestDist = dist; bestTarget = target; }
        });
        const namesStr = names.join(' + ');
        const targetDate = new Date(now.getTime() + bestDist * 24 * 60 * 60 * 1000);
        const dateDisplay = targetDate.toLocaleDateString(locale, {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        });

        el.innerHTML = `
            <p style="font-size:1rem;color:var(--text);text-align:center;font-style:italic;margin-bottom:8px;">${escapeHtml(namesStr)} together</p>
            <div class="wizard-reveal-number-wrap">
                <div class="wizard-reveal-number" style="font-size:2.2rem;">${bestTarget.toLocaleString(locale)}</div>
            </div>
            <div class="wizard-reveal-unit">days combined</div>
            <div class="wizard-reveal-date">${dateDisplay}</div>
            <div class="wizard-reveal-countdown">in ${bestDist.toLocaleString(locale)} days</div>
        `;
    } else {
        el.innerHTML = `
            <h2 class="wizard-question">Your milestones are ready!</h2>
            <p style="color:var(--text-muted);text-align:center;font-style:italic;font-size:1.1rem;">Add more people to discover combined milestones.</p>
        `;
    }

    if (!isRefresh) _track('onboard_complete', { event_count: appData.events.length });

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    document.getElementById('wizardStep9')?.classList.add('wizard-step-active');
}

// Legacy alias
function wizardGoToSummary() { wizardShowCombined(); }

// --- v5 Onboarding: Enable reminders from summary ---
function wizardEnableReminders() {
    if (typeof NOTIF !== 'undefined') {
        NOTIF.enable().then(ok => {
            if (ok) {
                _track('onboard_reminders_enabled');
                const btn = document.getElementById('wizardReminderBtn');
                if (btn) { btn.textContent = '\u2713 Reminders enabled!'; btn.disabled = true; }
            }
        });
    }
}

// --- Legacy: wizardDiscover still works (for deep links, reset wizard etc.) ---
function wizardDiscover() {
    wizardDiscoverV5();
}

// --- Role chip selection (Screen 3) ---
function wizardSelectRole(btn, role) {
    document.querySelectorAll('.wizard-role-chip').forEach(c => c.classList.remove('selected'));
    btn.classList.add('selected');
    const nameInput = document.getElementById('friendName');
    const showBtn = document.getElementById('wizardShowTheirBtn');
    // Child/Friend: always ask for actual name
    if (role === 'Child' || role === 'Friend') {
        if (nameInput) {
            nameInput.classList.remove('hidden');
            nameInput.value = '';
            nameInput.placeholder = role === 'Child' ? "Child\u2019s name" : "Friend\u2019s name";
            setTimeout(() => nameInput.focus(), 200);
        }
        if (showBtn) showBtn.textContent = 'Show milestone';
    } else {
        if (nameInput) { nameInput.value = role; nameInput.classList.add('hidden'); }
        if (showBtn) showBtn.textContent = `Show ${role}\u2019s milestone`;
        const dayField = document.getElementById('friendDay');
        if (dayField) setTimeout(() => dayField.focus(), 200);
    }
}

function wizardSelectOther() {
    // Deselect all chips
    document.querySelectorAll('.wizard-role-chip').forEach(c => c.classList.remove('selected'));
    document.querySelector('.wizard-role-other')?.classList.add('selected');
    // Show and focus the text input
    const nameInput = document.getElementById('friendName');
    if (nameInput) { nameInput.classList.remove('hidden'); nameInput.value = ''; setTimeout(() => nameInput.focus(), 200); }
}

// --- Screen 3 → 4: Discover friend's milestone ---
function wizardDiscoverFriend() {
    const _t = (typeof I18N !== 'undefined' && I18N.t) ? I18N.t : (k => k);
    const name = document.getElementById('friendName')?.value?.trim();
    const dateStr = buildDateFromFields('friend');

    if (!name) {
        showToast('Tap a role or enter a name', 'error');
        return;
    }
    if (!dateStr) {
        showToast(_t('wizard_please_enter_date') || 'Please enter a date', 'error');
        return;
    }

    const ok = _wizardCreateAndReveal(name, dateStr, 'wizardFriendReveal', 'wizardStep5');
    if (!ok) return;

    // Build share preview message — adjust for role-based names
    const ROLE_NAMES = ['Mom', 'Dad', 'Partner', 'Sister', 'Brother', 'Friend', 'Child'];
    const isRole = ROLE_NAMES.includes(name);
    const friendM = window._wizardFriendMilestone;
    if (friendM) {
        let shareMsg;
        if (isRole) {
            // For roles: "Did you know you turn exactly 20,000 days onJune 18th?"
            const val = friendM.value.toLocaleString();
            const unit = friendM.isCosmic ? (friendM.description || friendM.unitName) : friendM.unitName;
            const dateOpts = { month: 'long', day: 'numeric', year: 'numeric' };
            const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;
            const dateStr2 = friendM.date.toLocaleDateString(locale, dateOpts);
            shareMsg = `Did you know you turn exactly ${val} ${unit} on ${dateStr2}? That\u2019s worth celebrating! \ud83c\udf89 happymoments.app`;
        } else {
            shareMsg = typeof generateShareMessage === 'function' ? generateShareMessage(friendM) : '';
        }
        const previewEl = document.getElementById('wizardSharePreview');
        if (previewEl && shareMsg) {
            previewEl.innerHTML = `<p class="wizard-share-preview-text">\u201c${escapeHtml(shareMsg)}\u201d</p>`;
        }
        // Store the custom message for sharing
        window._wizardFriendShareMsg = shareMsg;
    }

    // Update share button text
    const shareBtn = document.getElementById('wizardShareFriendBtn');
    if (shareBtn) shareBtn.textContent = isRole ? 'Send to your ' + name.toLowerCase() + ' \u2192' : 'Send to ' + name + ' \u2192';

    _track('onboard_add_person', { event_count: appData.events.length });

    // Show friend reveal (screen 5)
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    document.getElementById('wizardStep5')?.classList.add('wizard-step-active');
    window.scrollTo(0, 0);

    onboardingSection.classList.remove('hidden');
    tabNav.classList.add('hidden');
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
}

// --- Screen 6: Share own milestone (kept for backward compat) ---
function wizardShare() {
    const _t = (typeof I18N !== 'undefined' && I18N.t) ? I18N.t : (k => k);
    const m = window._wizardMilestone;
    if (m) {
        const message = typeof generateShareMessage === 'function' ? generateShareMessage(m) : '';
        if (navigator.share) {
            navigator.share({ title: 'HappyMoment', text: message }).catch(() => {});
        } else {
            navigator.clipboard.writeText(message).then(() => {
                showToast(_t('wizard_copied_share'), 'success');
            }).catch(() => {});
        }
        _track('wizard_share', { value: m.value, unit: m.unit });
    }
}

// --- Screen 5: Share friend's milestone, then go to summary ---
function wizardShareFriend() {
    const m = window._wizardFriendMilestone;
    if (!m) return;
    const friendName = window._wizardFriendName || 'your friend';
    const message = window._wizardFriendShareMsg || (typeof generateShareMessage === 'function' ? generateShareMessage(m) : '');
    if (navigator.share) {
        navigator.share({ title: 'HappyMoment for ' + friendName, text: message }).catch(() => {});
    } else {
        navigator.clipboard.writeText(message).then(() => {
            showToast('Copied! Send it to ' + friendName, 'success');
        }).catch(() => {});
    }
    _track('onboard_share_initiated', { value: m.value, unit: m.unit });
    // Stay on current screen — user taps Continue when ready
}

function wizardAddAnother() {
    // Go back to screen 4 for another person
    document.getElementById('birthName').value = '';
    ['birthDay', 'birthMonth', 'birthYear'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    wizardNext(4);
}

// --- Screen 7: Add Person 3 (role chips + date) ---
function wizardSelectRole3(btn, role) {
    document.querySelectorAll('#wizardRoleChips3 .wizard-role-chip').forEach(c => c.classList.remove('selected'));
    btn.classList.add('selected');
    const nameInput = document.getElementById('person3Name');
    if (nameInput) { nameInput.value = role; nameInput.classList.add('hidden'); }
    const dayField = document.getElementById('person3Day');
    if (dayField) setTimeout(() => dayField.focus(), 200);
}

function wizardSelectOther3() {
    document.querySelectorAll('#wizardRoleChips3 .wizard-role-chip').forEach(c => c.classList.remove('selected'));
    document.querySelector('#wizardRoleChips3 .wizard-role-other')?.classList.add('selected');
    const nameInput = document.getElementById('person3Name');
    if (nameInput) { nameInput.classList.remove('hidden'); nameInput.value = ''; setTimeout(() => nameInput.focus(), 200); }
}

function wizardDiscoverPerson3() {
    const _t = (typeof I18N !== 'undefined' && I18N.t) ? I18N.t : (k => k);
    const name = document.getElementById('person3Name')?.value?.trim();
    const dateStr = buildDateFromFields('person3');

    if (!name) {
        showToast('Tap a role or enter a name', 'error');
        return;
    }
    if (!dateStr) {
        showToast(_t('wizard_please_enter_date') || 'Please enter a date', 'error');
        return;
    }

    const ok = _wizardCreateAndReveal(name, dateStr, 'wizardPerson3Reveal', 'wizardStep8');
    if (!ok) return;

    _track('onboard_add_person3', { event_count: appData.events.length });

    // Show Person 3 reveal (screen 8)
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    document.getElementById('wizardStep8')?.classList.add('wizard-step-active');

    onboardingSection.classList.remove('hidden');
    tabNav.classList.add('hidden');
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
}

function wizardSharePerson3() {
    const m = window._wizardPerson3Milestone;
    if (m) {
        const name = window._wizardPerson3Name || 'your friend';
        const message = typeof generateShareMessage === 'function' ? generateShareMessage(m) : '';
        if (navigator.share) {
            navigator.share({ title: 'HappyMoment for ' + name, text: message })
                .then(() => wizardNext(9))
                .catch(() => wizardNext(9));
        } else {
            navigator.clipboard.writeText(message).then(() => {
                showToast('Copied! Send it to ' + name, 'success');
                setTimeout(() => wizardNext(9), 1500);
            }).catch(() => wizardNext(9));
        }
        _track('onboard_share_person3', { value: m.value, unit: m.unit });
    } else {
        wizardNext(9);
    }
}

// --- Screen 9: Optional Person 4 (inline on combined screen) ---
function wizardShowPerson4Form() {
    const section = document.getElementById('wizardPerson4Section');
    const btn = document.getElementById('wizardAddMoreBtn');
    if (section) section.style.display = '';
    if (btn) btn.style.display = 'none';
    const dayField = document.getElementById('person4Day');
    if (dayField) setTimeout(() => dayField.focus(), 300);
}

function wizardSelectRole4(btn, role) {
    document.querySelectorAll('#wizardRoleChips4 .wizard-role-chip').forEach(c => c.classList.remove('selected'));
    btn.classList.add('selected');
    const nameInput = document.getElementById('person4Name');
    if (nameInput) { nameInput.value = role; nameInput.classList.add('hidden'); }
    const dayField = document.getElementById('person4Day');
    if (dayField) setTimeout(() => dayField.focus(), 200);
}

function wizardSelectOther4() {
    document.querySelectorAll('#wizardRoleChips4 .wizard-role-chip').forEach(c => c.classList.remove('selected'));
    document.querySelector('#wizardRoleChips4 .wizard-role-other')?.classList.add('selected');
    const nameInput = document.getElementById('person4Name');
    if (nameInput) { nameInput.classList.remove('hidden'); nameInput.value = ''; setTimeout(() => nameInput.focus(), 200); }
}

function wizardAddPerson4() {
    const _t = (typeof I18N !== 'undefined' && I18N.t) ? I18N.t : (k => k);
    const name = document.getElementById('person4Name')?.value?.trim();
    const dateStr = buildDateFromFields('person4');

    if (!name) {
        showToast('Tap a role or enter a name', 'error');
        return;
    }
    if (!dateStr) {
        showToast(_t('wizard_please_enter_date') || 'Please enter a date', 'error');
        return;
    }
    if (!validateDateFields(dateStr)) return;
    const date = parseLocalDate(dateStr);

    // Add to events (prevent duplicates)
    if (!appData.events.some(e => e.name === name && e.date.getTime() === date.getTime())) {
        appData.events.push({
            id: 'event_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            name: name, type: 'birthday', date: date
        });
        saveData();
    }

    _track('onboard_add_person4', { event_count: appData.events.length });

    // Hide the form, refresh combined milestone display
    document.getElementById('wizardPerson4Section').style.display = 'none';
    showToast(name + ' added to your team!', 'success');
    wizardShowCombined(true);
}

// ============================================================
// v2 ONBOARDING: organic flow (screens 4-8)
// Me → one person → combined → name group → add more → group reveal
// ============================================================

let _wizardGroupMembers = [];

// --- Screen 4→5: Discover friend, show hero + milestones on one screen ---
function wizardDiscoverFriendV2() {
    const _t = (typeof I18N !== 'undefined' && I18N.t) ? I18N.t : (k => k);
    const name = document.getElementById('friendName')?.value?.trim();
    const dateStr = buildDateFromFields('friend');

    if (!name) { showToast('Tap a role or enter a name', 'error'); return; }
    if (!dateStr) { showToast(_t('wizard_please_enter_date') || 'Please enter a date', 'error'); return; }

    // Create event and show hero reveal
    const ok = _wizardCreateAndReveal(name, dateStr, 'wizardFriendHero', 'wizardStep5');
    if (!ok) return;

    // Also render milestones list below the hero
    const friendEvent = appData.events[appData.events.length - 1];
    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;
    const ms = typeof findAllUpcomingMilestones === 'function'
        ? findAllUpcomingMilestones(friendEvent.date, 20, 730, appSettings) : [];
    if (typeof findBigMilestones === 'function') {
        findBigMilestones(friendEvent.date, appSettings).forEach(b => {
            if (!ms.some(m => m.value === b.value && m.unit === b.unit)) ms.push(b);
        });
    }
    let upcoming = ms.filter(m => m.timeUntil > 0 && !m.isCosmic)
        .sort((a, b) => a.timeUntil - b.timeUntil).slice(0, 3);
    if (upcoming.length === 0) upcoming = ms.filter(m => m.timeUntil > 0).slice(0, 3);

    const moreEl = document.getElementById('wizardFriendMore');
    if (moreEl && upcoming.length > 0) {
        let html = '<div style="margin-top:12px;border-top:1px solid var(--border,#333);padding-top:10px;">';
        html += '<div style="font-size:0.75rem;color:var(--warning,#d4b876);text-transform:uppercase;letter-spacing:0.08em;padding:4px 0 6px;font-weight:600;">More milestones</div>';
        upcoming.forEach(m => {
            const val = m.value.toLocaleString(locale);
            const unit = m.isCosmic ? (m.description || m.unitName) : m.unitName;
            const ds = m.date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
            html += `<div class="wizard-milestone-row">
                <span class="wizard-milestone-value" style="white-space:nowrap;">${val} ${unit}</span>
                <span class="wizard-milestone-date">${ds}</span>
            </div>`;
        });
        html += '</div>';
        moreEl.innerHTML = html;
    }

    window._wizardFriendName = name;
    const shareBtn = document.getElementById('wizardShareFriendBtn');
    if (shareBtn) shareBtn.textContent = 'Share a milestone with ' + name;

    _track('onboard_add_person', { event_count: appData.events.length });

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    document.getElementById('wizardStep5')?.classList.add('wizard-step-active');
    window.scrollTo(0, 0);
    onboardingSection.classList.remove('hidden');
    tabNav.classList.add('hidden');
}

// --- Screen 6: Combined milestone + name your group ---
function wizardShowCombinedAndName() {
    const el = document.getElementById('wizardCombinedAndName');
    if (!el) return;

    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;
    const now = new Date();

    let totalDays = 0;
    const names = [];
    appData.events.forEach(e => {
        totalDays += Math.floor((now.getTime() - new Date(e.date).getTime()) / (24*60*60*1000));
        names.push(e.name);
    });

    const candidates = [1000, 2500, 5000, 10000, 25000, 50000, 100000];
    let bestTarget = 0, bestDist = Infinity;
    candidates.forEach(step => {
        const target = Math.ceil(totalDays / step) * step;
        const dist = target - totalDays;
        if (dist > 0 && dist < bestDist) { bestDist = dist; bestTarget = target; }
    });

    const targetDate = new Date(now.getTime() + bestDist * 24 * 60 * 60 * 1000);
    const dateDisplay = targetDate.toLocaleDateString(locale, {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
    const namesStr = names.join(' and ');

    // Auto-suggest group name based on role
    const FAMILY_ROLES = ['Mom', 'Dad', 'Partner', 'Sister', 'Brother', 'Child'];
    const lastPerson = appData.events[appData.events.length - 1];
    const suggestedName = lastPerson && FAMILY_ROLES.includes(lastPerson.name) ? 'Family'
        : (lastPerson && lastPerson.name === 'Friend' ? 'Friends' : 'My Group');

    el.innerHTML = `
        <p style="font-size:1rem;color:var(--text);text-align:center;font-style:italic;margin-bottom:8px;">${escapeHtml(namesStr)} together</p>
        <div class="wizard-reveal-number-wrap">
            <div class="wizard-reveal-number" style="font-size:2.2rem;">${bestTarget.toLocaleString(locale)}</div>
        </div>
        <div class="wizard-reveal-unit">days combined</div>
        <div class="wizard-reveal-date">${dateDisplay}</div>
        <div class="wizard-reveal-countdown">in ${bestDist.toLocaleString(locale)} days</div>
        <div style="border-top:1px solid var(--border,#333);margin-top:16px;padding-top:12px;">
            <p style="color:var(--text-muted);text-align:center;font-size:0.85rem;margin-bottom:8px;">Name your first group</p>
            <input type="text" id="groupName" class="wizard-input" value="${escapeHtml(suggestedName)}" placeholder="e.g. Family, Friends, Team" style="text-align:center;font-size:1.1rem;background:transparent;border:1px solid var(--border,#333);color:var(--text);padding:10px;border-radius:8px;width:100%;" autocomplete="off">
        </div>
    `;

    const addMoreBtn = document.getElementById('wizardAddMoreBtn6');
    if (addMoreBtn) addMoreBtn.textContent = 'Add more people to ' + suggestedName + ' \u2192';

    _track('onboard_combined_reveal', { event_count: appData.events.length });

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    document.getElementById('wizardStep6')?.classList.add('wizard-step-active');
    window.scrollTo(0, 0);
}

// --- Screen 7: Group builder (Me + Person 2 pre-filled) ---
function wizardGoToGroupBuilder() {
    const groupName = document.getElementById('groupName')?.value?.trim() || 'Family';

    // Rename the current set
    const currentSet = allSets.find(s => s.id === currentSetId);
    if (currentSet) currentSet.name = groupName;
    saveData();

    const title = document.getElementById('groupBuilderTitle');
    if (title) title.textContent = groupName;

    // Pre-fill member list with existing events
    _wizardGroupMembers = [...appData.events];
    wizardRenderGroupMembers();

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    document.getElementById('wizardStep7')?.classList.add('wizard-step-active');
    window.scrollTo(0, 0);
}

function wizardRenderGroupMembers() {
    const el = document.getElementById('groupMembers');
    if (!el) return;
    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;
    let html = '';
    _wizardGroupMembers.forEach(m => {
        const d = m.date instanceof Date ? m.date : new Date(m.date);
        const dateStr = d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
        html += `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:6px;">
            <span style="color:var(--warning,#d4b876);">\u2713</span>
            <span style="flex:1;color:var(--text);">${escapeHtml(m.name)}</span>
            <span style="color:var(--text-muted);font-size:0.85rem;">${dateStr}</span>
        </div>`;
    });
    el.innerHTML = html;

    // Show continue button when 3+ members (Me + 2 others)
    const btn = document.getElementById('groupContinueBtn');
    if (btn) btn.style.display = _wizardGroupMembers.length >= 3 ? '' : 'none';
}

function wizardSelectRoleGroup(btn, role) {
    document.querySelectorAll('#wizardRoleChipsGroup .wizard-role-chip').forEach(c => c.classList.remove('selected'));
    btn.classList.add('selected');
    const nameInput = document.getElementById('groupPersonName');
    if (role === 'Child' || role === 'Friend') {
        if (nameInput) {
            nameInput.classList.remove('hidden');
            nameInput.value = '';
            nameInput.placeholder = role === 'Child' ? "Child\u2019s name" : "Friend\u2019s name";
            setTimeout(() => nameInput.focus(), 200);
        }
    } else {
        if (nameInput) { nameInput.value = role; nameInput.classList.add('hidden'); }
        const dayField = document.getElementById('groupDay');
        if (dayField) setTimeout(() => dayField.focus(), 200);
    }
}

function wizardSelectOtherGroup() {
    document.querySelectorAll('#wizardRoleChipsGroup .wizard-role-chip').forEach(c => c.classList.remove('selected'));
    document.querySelector('#wizardRoleChipsGroup .wizard-role-other')?.classList.add('selected');
    const nameInput = document.getElementById('groupPersonName');
    if (nameInput) { nameInput.classList.remove('hidden'); nameInput.value = ''; setTimeout(() => nameInput.focus(), 200); }
}

function wizardAddGroupMember() {
    const _t = (typeof I18N !== 'undefined' && I18N.t) ? I18N.t : (k => k);
    const name = document.getElementById('groupPersonName')?.value?.trim();
    const dateStr = buildDateFromFields('group');

    if (!name) { showToast('Tap a role or enter a name', 'error'); return; }
    if (!dateStr) { showToast(_t('wizard_please_enter_date') || 'Please enter a date', 'error'); return; }
    if (!validateDateFields(dateStr)) return;
    const date = parseLocalDate(dateStr);

    let newEvent;
    const existing = appData.events.find(e => e.name === name && e.date.getTime() === date.getTime());
    if (existing) {
        newEvent = existing;
    } else {
        newEvent = {
            id: 'event_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            name: name, type: 'birthday', date: date
        };
        appData.events.push(newEvent);
        appData.events.forEach(e => {
            if (e.id !== newEvent.id) {
                const key = typeof getConnectionKey === 'function' ? getConnectionKey(e.id, newEvent.id) : '';
                if (key) appData.connections[key] = true;
            }
        });
        saveData();
    }

    if (!_wizardGroupMembers.some(m => m.id === newEvent.id)) {
        _wizardGroupMembers.push(newEvent);
    }
    wizardRenderGroupMembers();

    // Clear form for next entry — keep name field visible
    const nameInput = document.getElementById('groupPersonName');
    if (nameInput) { nameInput.value = ''; nameInput.focus(); }
    ['Day', 'Month', 'Year'].forEach(f => {
        const el = document.getElementById('group' + f);
        if (el) el.value = '';
    });

    showToast(name + ' added!', 'success');
    _track('onboard_add_group_member', { event_count: appData.events.length });
}

// --- Screen 8: Group combined milestone reveal ---
function wizardShowGroupReveal() {
    const el = document.getElementById('wizardGroupReveal');
    if (!el) return;

    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;
    const now = new Date();
    const groupName = document.getElementById('groupBuilderTitle')?.textContent || 'Family';

    let totalDays = 0;
    appData.events.forEach(e => {
        totalDays += Math.floor((now.getTime() - new Date(e.date).getTime()) / (24*60*60*1000));
    });

    const candidates = [1000, 2500, 5000, 10000, 25000, 50000, 100000];
    let bestTarget = 0, bestDist = Infinity;
    candidates.forEach(step => {
        const target = Math.ceil(totalDays / step) * step;
        const dist = target - totalDays;
        if (dist > 0 && dist < bestDist) { bestDist = dist; bestTarget = target; }
    });

    const targetDate = new Date(now.getTime() + bestDist * 24 * 60 * 60 * 1000);
    const dateDisplay = targetDate.toLocaleDateString(locale, {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    el.innerHTML = `
        <p style="font-size:1.1rem;color:var(--text);text-align:center;margin-bottom:4px;font-weight:600;">${escapeHtml(groupName)}</p>
        <div class="wizard-reveal-number-wrap">
            <div class="wizard-reveal-number" style="font-size:2.2rem;">${bestTarget.toLocaleString(locale)}</div>
        </div>
        <div class="wizard-reveal-unit">days combined</div>
        <div class="wizard-reveal-date">${dateDisplay}</div>
        <div class="wizard-reveal-countdown">in ${bestDist.toLocaleString(locale)} days</div>
    `;

    _track('onboard_group_reveal', { members: appData.events.length });

    // Update share button with group name
    const shareBtn8 = document.getElementById('wizardShareBtn8');
    if (shareBtn8) shareBtn8.textContent = 'Share ' + groupName + ' milestones \u2192';

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    document.getElementById('wizardStep8')?.classList.add('wizard-step-active');
    window.scrollTo(0, 0);
}

// --- Screen 9: Share screen — show each person's best milestone with share buttons ---
function wizardBuildShareScreen() {
    const el = document.getElementById('wizardShareScreen');
    if (!el) return;

    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;
    let html = '<h2 class="wizard-question">Tell your people</h2>';
    html += '<p style="color:var(--text-muted);text-align:center;font-size:0.9rem;margin-bottom:16px;">Each person has a milestone worth sharing</p>';

    // For each person (skip "Me"), find their best upcoming milestone
    appData.events.forEach(e => {
        if (e.name === 'Me') return;
        const d = e.date instanceof Date ? e.date : new Date(e.date);
        const ms = typeof findAllUpcomingMilestones === 'function'
            ? findAllUpcomingMilestones(d, 5, 365, appSettings || {}) : [];
        let best = ms.filter(m => m.timeUntil > 0 && !m.isCosmic)
            .sort((a, b) => {
                let sa = 0, sb = 0;
                if (a.value >= 1000 && a.value % 1000 === 0) sa += 100;
                if (b.value >= 1000 && b.value % 1000 === 0) sb += 100;
                if (a.isBigMilestone) sa += 80;
                if (b.isBigMilestone) sb += 80;
                sa += Math.max(0, 50 - a.timeUntil / (24*60*60*1000) * 0.15);
                sb += Math.max(0, 50 - b.timeUntil / (24*60*60*1000) * 0.15);
                return sb - sa;
            })[0];
        if (!best && ms.length > 0) best = ms.filter(m => m.timeUntil > 0)[0];
        if (best) {
            const val = best.value.toLocaleString(locale);
            const unit = best.unitName || best.unit || '';
            const ds = best.date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
            const shareText = 'Did you know you turn ' + val + ' ' + unit + ' on ' + ds + '? happymoments.app';
            html += `<div style="padding:12px;background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:10px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <span style="color:var(--text);font-weight:600;">${escapeHtml(e.name)}</span>
                    <span style="color:var(--text-muted);font-size:0.8rem;">${val} ${unit} &middot; ${ds}</span>
                </div>
                <div style="color:var(--text-muted);font-size:0.8rem;font-style:italic;padding:6px 10px;border-left:2px solid var(--warning,#d4b876);margin-bottom:8px;">${escapeHtml(shareText)}</div>
                <button class="wizard-btn-secondary" onclick="wizardShareForPerson('${escapeHtml(e.name)}', '${shareText.replace(/'/g, "\\'")}')" style="padding:6px 12px;font-size:0.8rem;width:100%;">Share with ${escapeHtml(e.name)}</button>
            </div>`;
        }
    });

    if (appData.events.length <= 1) {
        html += '<p style="color:var(--text-muted);text-align:center;font-style:italic;">Add people to share their milestones!</p>';
    }

    el.innerHTML = html;

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    document.getElementById('wizardStep9')?.classList.add('wizard-step-active');
    window.scrollTo(0, 0);
}

function wizardShareForPerson(name, message) {
    if (navigator.share) {
        navigator.share({ title: 'HappyMoment for ' + name, text: message }).catch(() => {});
    } else {
        navigator.clipboard.writeText(message).then(() => {
            showToast('Copied! Send it to ' + name, 'success');
        }).catch(() => {});
    }
    _track('onboard_share_person', { name: name });
}

function wizardShareGroup() {
    const groupName = document.getElementById('groupBuilderTitle')?.textContent || 'Family';
    const message = 'Our ' + groupName + ' group has amazing milestones coming! Discover yours at happymoments.app';
    if (navigator.share) {
        navigator.share({ title: 'HappyMoments \u2014 ' + groupName, text: message }).catch(() => {});
    } else {
        navigator.clipboard.writeText(message).then(() => showToast('Copied!', 'success')).catch(() => {});
    }
    _track('onboard_share_group');
}

function wizardCreateAnotherGroup() {
    // Ask for group name via the combined screen (Screen 6) repurposed
    const el = document.getElementById('wizardCombinedAndName');
    if (!el) return;

    el.innerHTML = `
        <h2 class="wizard-question">Create another group</h2>
        <p style="color:var(--text-muted);text-align:center;font-size:0.9rem;margin-bottom:16px;">A group for friends, colleagues, or another circle</p>
        <div style="margin-top:12px;">
            <p style="color:var(--text-muted);text-align:center;font-size:0.85rem;margin-bottom:8px;">Name your new group</p>
            <input type="text" id="groupName" class="wizard-input" value="Friends" placeholder="e.g. Friends, Work, Neighbours" style="text-align:center;font-size:1.1rem;background:transparent;border:1px solid var(--border,#333);color:var(--text);padding:10px;border-radius:8px;width:100%;" autocomplete="off">
        </div>
    `;

    // Update button to go to group builder
    const addMoreBtn = document.getElementById('wizardAddMoreBtn6');
    if (addMoreBtn) {
        addMoreBtn.textContent = 'Add people to this group \u2192';
        addMoreBtn.onclick = function() { wizardCreateGroupAndBuild(); };
    }

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    document.getElementById('wizardStep6')?.classList.add('wizard-step-active');
    window.scrollTo(0, 0);
}

function wizardCreateGroupAndBuild() {
    const groupName = document.getElementById('groupName')?.value?.trim() || 'Friends';
    saveData();

    // Get "Me" from the first set
    const firstSet = allSets[0];
    const meEvent = firstSet ? firstSet.events[0] : null;

    const newSetId = 'set_' + Date.now();
    const meClone = meEvent ? {
        id: 'event_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        name: meEvent.name, type: meEvent.type, date: new Date(meEvent.date)
    } : null;

    allSets.push({
        id: newSetId, name: groupName,
        events: meClone ? [meClone] : [],
        connections: {},
        comboTypes: { sum: true, ratio: true, duration: true }
    });
    currentSetId = newSetId;
    loadCurrentSet();

    // Show group builder with the new group
    const title = document.getElementById('groupBuilderTitle');
    if (title) title.textContent = groupName;
    _wizardGroupMembers = [...appData.events];
    wizardRenderGroupMembers();

    // Clear the form fields
    const nameInput = document.getElementById('groupPersonName');
    if (nameInput) nameInput.value = '';
    ['groupDay', 'groupMonth', 'groupYear'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    document.getElementById('wizardStep7')?.classList.add('wizard-step-active');
    window.scrollTo(0, 0);
}

function wizardFinish() {
    // Dismiss wizard, show the normal dashboard
    onboardingSection.classList.add('hidden');
    tabNav.classList.remove('hidden');
    const header = document.getElementById('appHeader');
    if (header) header.style.display = '';

    // Switch to first set (primary group) for dashboard landing
    if (allSets.length > 1 && currentSetId !== allSets[0].id) {
        saveData();
        currentSetId = allSets[0].id;
        loadCurrentSet();
    }

    updateSetSwitcher();
    selectedPersonIds = appData.events.map(e => e.id);
    renderPersonFilter();
    renderMilestonesTab();
    switchTab('me');
    window.scrollTo(0, 0);
    localStorage.setItem('hm_onboarded', '1');
}

function handleStart() {
    const name = birthNameInput.value.trim();
    const dateStr = birthDateInput.value || buildDateFromFields('birth');

    if (!name || !dateStr) {
        showToast('Please enter name and date', 'error');
        return;
    }
    if (!validateDateFields(dateStr)) return;

    const date = parseLocalDate(dateStr);

    // Create default set if none exists
    if (allSets.length === 0) {
        allSets.push({
            id: 'set_default',
            name: 'My Dates',
            events: [],
            connections: {},
            comboTypes: { sum: true, ratio: true, duration: true }
        });
        currentSetId = 'set_default';
        loadCurrentSet();
    }

    const newEvent = {
        id: 'event_' + Date.now(),
        name: name,
        date: date,
        type: 'birthday' // Default to birthday for onboarding
    };

    appData.events.push(newEvent);
    saveData();
    showDashboard();
}

function showDashboard() {
    _track('onboard_complete', { event_count: appData.events.length });
    onboardingSection.classList.add('hidden');
    tabNav.classList.remove('hidden');
    updateSetSwitcher();
    // Default to Milestones tab with all people as columns
    milestonesTab.classList.remove('hidden');
    fillAllConnections();
    // Scroll to top so user sees the milestones
    window.scrollTo({ top: 0, behavior: 'smooth' });
    _mostSpecialMode = false;
    selectedPersonIds = appData.events.map(e => e.id);
    renderPersonFilter();
    renderMilestonesTab();
}

// ============================================================
// EVENTS TAB
// ============================================================

function renderEventsTab() {
    renderEventsList();
}

function renderEventsList() {
    if (appData.events.length === 0) {
        eventsListEl.innerHTML = '<p class="empty-text">No events yet. Add your first date below!</p>';
        return;
    }

    eventsListEl.innerHTML = appData.events.map(e => {
        const type = e.type || 'birthday';
        const typeIcon = getEventTypeIcon(type);
        const dateObj = e.date instanceof Date ? e.date : new Date(e.date);
        const dateStr = dateObj.toLocaleDateString(getAppLocale(), { day: 'numeric', month: 'short', year: 'numeric' });
        const typeLabel = type === 'birthday' ? 'Birthday' : type === 'beginning' ? 'Event' : 'Milestone';

        return `
            <div class="event-item compact" onclick="openEditModal('${e.id}')" title="Tap to edit">
                <div class="event-item-main">
                    <span class="event-type-icon">${typeIcon}</span>
                    <span class="event-name">${escapeHtml(e.name)}</span>
                </div>
                <div class="event-item-details">
                    <span class="event-date-display">${dateStr}</span>
                    <span class="event-type-label">${typeLabel}</span>
                    <span class="event-edit-icon">&#9998;</span>
                </div>
            </div>
        `;
    }).join('');
}

// Get icon/emoji for event type
function getEventTypeIcon(type) {
    switch (type) {
        case 'birthday': return '&#127874;'; // cake
        case 'beginning': return '&#128279;'; // link/connection
        case 'milestone': return '&#9733;'; // star
        default: return '&#128197;'; // calendar
    }
}

let _addingEvent = false;
function handleAddEvent() {
    if (_addingEvent) return;
    _addingEvent = true;

    const name = newEventNameInput.value.trim();
    const type = newEventTypeSelect.value;
    const dateStr = newEventDateInput.value || buildDateFromFields('newEvent');

    if (!name || !dateStr) {
        showToast('Please enter event name and date', 'error');
        _addingEvent = false;
        return;
    }
    if (!checkEventLimit()) { _addingEvent = false; return; }
    if (!validateDateFields(dateStr)) { _addingEvent = false; return; }

    const date = parseLocalDate(dateStr);

    // Optional: precise time
    const hourEl = document.getElementById('newEventHour');
    const minEl = document.getElementById('newEventMinute');
    const hour = hourEl ? parseInt(hourEl.value) : NaN;
    const minute = minEl ? parseInt(minEl.value) : NaN;
    if (!isNaN(hour) && hour >= 0 && hour <= 23) {
        date.setHours(hour);
        if (!isNaN(minute) && minute >= 0 && minute <= 59) {
            date.setMinutes(minute);
        }
    }

    const newEvent = {
        id: 'event_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        name: name,
        type: type,
        date: date,
        hasTime: !isNaN(hour)
    };

    appData.events.push(newEvent);

    // Ensure connections object exists
    if (!appData.connections) {
        appData.connections = {};
    }

    // Auto-connect with all existing events
    appData.events.forEach(e => {
        if (e.id !== newEvent.id) {
            const key = getConnectionKey(e.id, newEvent.id);
            appData.connections[key] = true;
        }
    });

    saveData();

    // Clear form
    newEventNameInput.value = '';
    newEventTypeSelect.value = 'birthday';
    newEventDateInput.value = '';
    ['newEventDay', 'newEventMonth', 'newEventYear'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });

    // Auto-activate the new person in the Personal tab filter
    if (!selectedPersonIds.includes(newEvent.id)) {
        selectedPersonIds.push(newEvent.id);
    }

    renderEventsTab();
    renderPersonFilter();
    renderMilestonesTab();
    renderConnectionMatrix();
    showToast(`${name} added!`, 'success');
    _track('event_added', { event_count: appData.events.length });

    // After adding 2nd person, suggest Team tab (one-time)
    if (appData.events.length === 2 && !localStorage.getItem('hm_team_hint_shown')) {
        localStorage.setItem('hm_team_hint_shown', '1');
        setTimeout(() => {
            showToast('You have 2 people now! Check the Team tab to see combined milestones.', 'info', 5000);
        }, 1500);
    }

    // Focus name input for adding next person
    if (newEventNameInput) newEventNameInput.focus();
    _addingEvent = false;
}

// ============================================================
// EDIT EVENT MODAL
// ============================================================

function openEditModal(eventId) {
    const event = appData.events.find(e => e.id === eventId);
    if (!event) return;

    editingEventId = eventId;
    editEventNameInput.value = event.name;
    editEventTypeSelect.value = event.type || 'birthday';
    const dateObj = event.date instanceof Date ? event.date : new Date(event.date);
    const isoDate = (!isNaN(dateObj.getTime())) ? dateObj.toISOString().split('T')[0] : '';
    editEventDateInput.value = isoDate;
    setDateFields('editEvent', isoDate);
    editEventNotesInput.value = event.notes || '';

    editModal.classList.remove('hidden');
}

function closeEditModal() {
    editModal.classList.add('hidden');
    editingEventId = null;
}

function handleSaveEdit() {
    if (!editingEventId) return;

    const name = editEventNameInput.value.trim();
    const type = editEventTypeSelect.value;
    const dateStr = editEventDateInput.value || buildDateFromFields('editEvent');

    if (!name || !dateStr) {
        showToast('Please enter event name and date', 'error');
        return;
    }
    if (!validateDateFields(dateStr)) return;

    const date = parseLocalDate(dateStr);

    const event = appData.events.find(e => e.id === editingEventId);
    if (event) {
        event.name = name;
        event.type = type;
        event.date = parseLocalDate(dateStr);
        event.notes = editEventNotesInput.value.trim();

        saveData();
        renderEventsTab();
    }

    closeEditModal();
}

function handleDeleteEdit() {
    if (!editingEventId) return;

    if (!confirm('Delete this event?')) return;

    appData.events = appData.events.filter(e => e.id !== editingEventId);

    // Clean up selectedPersonIds
    selectedPersonIds = selectedPersonIds.filter(id => id !== editingEventId);

    // Clean up connections involving this event
    const newConnections = {};
    for (const key of Object.keys(appData.connections)) {
        if (!key.includes(editingEventId)) {
            newConnections[key] = appData.connections[key];
        }
    }
    appData.connections = newConnections;

    saveData();
    renderEventsTab();
    renderConnectionMatrix();
    closeEditModal();
}

// ============================================================
// COMBINED MILESTONES TAB
// ============================================================

function renderCombinedTab() {
    try {
    if (appData.events.length < 2) {
        combinedMilestonesContentEl.innerHTML = '<p class="empty-text">Add at least 2 events to see combined milestones.</p>';
        return;
    }

    // Check team view limit for free users
    if (!checkTeamViewLimit()) {
        _track('premium_gate_hit', { reason: 'team_view_limit' });
        combinedMilestonesContentEl.innerHTML = `
            <div class="premium-gate-overlay">
                <p>You've used your ${FREE_TEAM_VIEWS} free Team views.</p>
                <p>Upgrade to Premium for unlimited access.</p>
                <button class="btn-primary" onclick="showUpgradePrompt('team')" style="margin-top: 12px;">Upgrade &mdash; &euro;1.49/year</button>
            </div>`;
        return;
    }

    // Ensure connections object exists
    if (!appData.connections) {
        appData.connections = {};
    }

    // Auto-fill any missing connections
    const eventIds = appData.events.map(e => e.id);
    let connectionsAdded = false;
    for (let i = 0; i < eventIds.length; i++) {
        for (let j = i + 1; j < eventIds.length; j++) {
            const key = getConnectionKey(eventIds[i], eventIds[j]);
            if (appData.connections[key] === undefined) {
                appData.connections[key] = true;
                connectionsAdded = true;
            }
        }
    }
    if (connectionsAdded) {
        saveData();
    }

    // Ensure comboTypes exists with defaults - force all enabled if any missing
    if (!appData.comboTypes || appData.comboTypes.sum === undefined) {
        appData.comboTypes = { sum: true, ratio: true, duration: true };
        saveData();
    }

    // Check if any connections exist
    const activeKeys = Object.keys(appData.connections).filter(k => appData.connections[k]);
    if (activeKeys.length === 0) {
        combinedMilestonesContentEl.innerHTML = '<p class="empty-text">Enable event connections in Settings to see combined milestones.</p>';
        return;
    }

    allCombinedMilestonesFlat = [];

    // Extended time period: 5 years = 1825 days (for big combined milestones like 2 billion seconds)
    const maxDaysAhead = 1825;

    // Get connected events by checking which event IDs appear in active connection keys
    const connectedIds = new Set();
    const allEventIds = appData.events.map(e => e.id);

    activeKeys.forEach(key => {
        // Use parseConnectionKey for exact ID extraction (avoids substring false matches)
        const ids = parseConnectionKey(key);
        if (ids) {
            ids.forEach(id => { if (allEventIds.includes(id)) connectedIds.add(id); });
        }
    });
    const connectedEvents = appData.events.filter(e => connectedIds.has(e.id));

    if (connectedEvents.length < 2) {
        combinedMilestonesContentEl.innerHTML = '<p class="empty-text">No connected events found.</p>';
        return;
    }

    const eventNames = connectedEvents.map(e => escapeHtml(e.name)).join(' + ');
    let html = '';

    // Sum milestones
    if (appData.comboTypes.sum) {
        const wording = getCombinedMilestoneWording(connectedEvents);
        const sumMilestones = findSumMilestonesForEvents(connectedEvents, 50, maxDaysAhead, appSettings);

        if (sumMilestones.length > 0) {
            sumMilestones.forEach(m => {
                m.eventName = 'Combined Sum';
                m.eventId = 'combined_sum';
                m.comboDescription = getHappySumDescription(m.value, m.unit, wording);
            });
            allCombinedMilestonesFlat = allCombinedMilestonesFlat.concat(sumMilestones);

            html += `
                <div class="combined-subsection">
                    <h4>${wording.prefix}</h4>
                    <div class="combined-milestones-list">
                        ${renderCombinedMilestonesList(sumMilestones, 'sum', eventNames)}
                    </div>
                </div>
            `;
        }
    }

    // Ratio/Relationship milestones
    if (appData.comboTypes.ratio) {
        let allRatioMilestones = [];

        for (let i = 0; i < connectedEvents.length; i++) {
            for (let j = i + 1; j < connectedEvents.length; j++) {
                const key = getConnectionKey(connectedEvents[i].id, connectedEvents[j].id);
                if (!appData.connections[key]) continue;

                const pairMilestones = findRelationshipMilestones(
                    connectedEvents[i],
                    connectedEvents[j],
                    20,
                    maxDaysAhead
                );
                allRatioMilestones = allRatioMilestones.concat(pairMilestones);
            }
        }

        if (allRatioMilestones.length > 0) {
            allRatioMilestones.sort((a, b) => a.date.getTime() - b.date.getTime());
            allRatioMilestones.forEach(m => {
                m.eventName = 'Ratio';
                m.eventId = 'combined_ratio';
            });
            allCombinedMilestonesFlat = allCombinedMilestonesFlat.concat(allRatioMilestones.slice(0, 25));

            html += `
                <div class="combined-subsection">
                    <h4>Relationships & Ratios</h4>
                    <div class="combined-milestones-list">
                        ${renderCombinedMilestonesList(allRatioMilestones.slice(0, 25), 'ratio')}
                    </div>
                </div>
            `;
        }
    }

    // Gap milestones
    if (appData.comboTypes.duration) {
        let allDurationMilestones = [];

        for (let i = 0; i < connectedEvents.length; i++) {
            for (let j = i + 1; j < connectedEvents.length; j++) {
                const key = getConnectionKey(connectedEvents[i].id, connectedEvents[j].id);
                if (!appData.connections[key]) continue;

                const durationMilestones = findGapMilestones(
                    connectedEvents[i],
                    connectedEvents[j],
                    20,
                    maxDaysAhead,
                    appSettings
                );
                allDurationMilestones = allDurationMilestones.concat(durationMilestones);
            }
        }

        if (allDurationMilestones.length > 0) {
            allDurationMilestones.sort((a, b) => a.date.getTime() - b.date.getTime());
            allDurationMilestones.forEach(m => {
                m.eventName = 'Gap';
                m.eventId = 'combined_duration';
            });
            allCombinedMilestonesFlat = allCombinedMilestonesFlat.concat(allDurationMilestones.slice(0, 25));

            html += `
                <div class="combined-subsection">
                    <h4>Time Comparisons</h4>
                    <div class="combined-milestones-list">
                        ${renderCombinedMilestonesList(allDurationMilestones.slice(0, 25), 'duration')}
                    </div>
                </div>
            `;
        }
    }

    if (html === '') {
        html = '<p class="empty-text">No combined milestones found. Check connections in Settings.</p>';
    }

    // Show views remaining for free users
    if (!isPremium()) {
        const remaining = FREE_TEAM_VIEWS - getTeamViewCount();
        if (remaining > 0 && remaining <= 3) {
            html += `<p class="team-views-hint">${remaining} free view${remaining === 1 ? '' : 's'} remaining</p>`;
        }
    }

    combinedMilestonesContentEl.innerHTML = html;

    // Sort combined milestones by date for sharing
    allCombinedMilestonesFlat.sort((a, b) => a.date.getTime() - b.date.getTime());
    updateCombinedSharePreview();
    } catch (err) {
        console.error('Combined tab error:', err);
        combinedMilestonesContentEl.innerHTML = '<p class="empty-text">Error loading combined milestones. Check console for details.</p>';
    }
}

function renderCombinedMilestonesList(milestones, type, eventNames = '') {
    // Show all milestones without extra filtering for combined view
    return milestones.slice(0, 20).map((m, idx) => {
        const isVerySpecial = isVerySpecialNumber(m.value);
        const globalIdx = allCombinedMilestonesFlat.indexOf(m);
        const timeUntilStr = formatTimeDistance(m.timeUntil);
        const dateStr = formatDateWithTime(m.date);

        // Show contributing events if available
        const contributingEvents = m.contributingEvents || [];
        const eventsHtml = contributingEvents.length > 0
            ? `<div class="cmi-contributors">${contributingEvents.map(e => `<span class="contributor-tag">${e}</span>`).join('')}</div>`
            : '';

        return `
            <div class="combined-milestone-item ${isVerySpecial ? 'very-special' : ''} ${selectedCombinedMilestone === globalIdx ? 'selected-for-share' : ''}"
                 onclick="selectCombinedMilestoneForShare(${globalIdx})">
                <div class="cmi-main">
                    <span class="cmi-value">${m.value.toLocaleString()}</span>
                    <span class="cmi-unit">${m.unitName}</span>
                </div>
                <div class="cmi-desc">${m.comboDescription || m.description || ''}</div>
                ${eventsHtml}
                <div class="cmi-when-compact">${dateStr} (${timeUntilStr})</div>
            </div>
        `;
    }).join('');
}

// Find relationship milestones between two events
// Only shows unique milestones - no duplicates between ratio and percentage views
function findRelationshipMilestones(event1, event2, maxResults, maxDaysAhead) {
    const milestones = [];
    const now = new Date();
    const maxDateMs = now.getTime() + maxDaysAhead * 24 * 60 * 60 * 1000;

    // Ensure dates are Date objects
    const date1 = event1.date instanceof Date ? event1.date : new Date(event1.date);
    const date2 = event2.date instanceof Date ? event2.date : new Date(event2.date);

    // Determine which event is older (earlier date)
    const older = date1 < date2 ? { ...event1, date: date1 } : { ...event2, date: date2 };
    const younger = date1 < date2 ? { ...event2, date: date2 } : { ...event1, date: date1 };

    const olderAgeMs = now.getTime() - older.date.getTime();
    const youngerAgeMs = now.getTime() - younger.date.getTime();
    const gapMs = younger.date.getTime() - older.date.getTime();

    if (youngerAgeMs <= 0 || olderAgeMs <= 0) return milestones;

    const dayMs = 24 * 60 * 60 * 1000;
    const olderIsBirthday = (older.type || 'birthday') === 'birthday';
    const youngerIsBirthday = (younger.type || 'birthday') === 'birthday';

    // Calculate current ratio
    const currentRatio = olderAgeMs / youngerAgeMs;

    // HAPPY RATIO MILESTONES - with celebratory messages!
    // Only include distinct ratios (no duplicates with percentages)
    // 2x = 50%, 1.5x = 66%, 1.33x = 75%, 1.25x = 80% - so we skip those percentages
    const ratioMilestones = [
        { ratio: 10, happy: `WOW! ${older.name} is 10x ${younger.name}'s age - what a journey together!` },
        { ratio: 7, happy: `Lucky 7! ${older.name} is exactly 7x ${younger.name}'s age!` },
        { ratio: 5, happy: `High five! ${older.name} is 5x ${younger.name}'s age - celebrate!` },
        { ratio: 4, happy: `${older.name} is 4x ${younger.name}'s age - four times the fun!` },
        { ratio: 3, happy: `Triple time! ${older.name} is exactly 3x ${younger.name}'s age!` },
        { ratio: 2.5, happy: `${older.name} is 2.5x ${younger.name}'s age - halfway to triple!` },
        { ratio: 2, happy: `HALF A LIFETIME! ${younger.name} has been in ${older.name}'s life for half of it!` },
        { ratio: 1.5, happy: `${younger.name} has shared TWO-THIRDS of ${older.name}'s life journey!` },
        { ratio: 1.33, happy: `THREE-QUARTERS together! ${younger.name} has been ${Math.round(75)}% of ${older.name}'s life!` },
        { ratio: 1.25, happy: `${younger.name} has been in ${older.name}'s life for 80% of it - amazing bond!` },
        { ratio: 1.2, happy: `Five-sixths of a lifetime! ${younger.name} has shared 83% of ${older.name}'s journey!` },
        { ratio: 1.1, happy: `Almost equals! ${younger.name} is catching up - 91% of ${older.name}'s lifetime together!` },
    ];

    for (const { ratio, happy } of ratioMilestones) {
        if (ratio >= currentRatio || ratio <= 1) continue;

        const t = (ratio * youngerAgeMs - olderAgeMs) / (1 - ratio);

        if (t > 0 && t < maxDaysAhead * dayMs) {
            const milestoneDate = new Date(now.getTime() + t);

            // Use happy message for birthdays, simpler for other event types
            let desc = happy;
            if (!olderIsBirthday || !youngerIsBirthday) {
                const pct = Math.round((1 / ratio) * 100);
                desc = `${older.name} is ${ratio}x as long as ${younger.name} (${pct}% overlap)`;
            }

            milestones.push({
                value: ratio,
                unit: 'ratio',
                unitName: 'x',
                date: milestoneDate,
                type: 'ratio',
                comboDescription: desc,
                contributingEvents: [older.name, younger.name],
                timeUntil: milestoneDate.getTime() - now.getTime()
            });
        }
    }

    // UNIQUE PERCENTAGE MILESTONES - only ones not covered by ratios above
    // Skipping: 50% (=2x), 66% (=1.5x), 75% (=1.33x), 80% (=1.25x), 83% (=1.2x), 91% (=1.1x)
    if (olderIsBirthday) {
        const uniquePercentages = [
            { pct: 25, happy: `Quarter century together! ${younger.name} has shared 25% of ${older.name}'s life!` },
            { pct: 33, happy: `A third of a lifetime! ${younger.name} has been there for 33% of ${older.name}'s journey!` },
            { pct: 40, happy: `${younger.name} hits 40% of ${older.name}'s life - growing stronger together!` },
            { pct: 60, happy: `Majority milestone! ${younger.name} has been in ${older.name}'s life for over half - 60%!` },
            { pct: 90, happy: `Almost always! ${younger.name} has been there for 90% of ${older.name}'s life!` },
        ];

        for (const { pct, happy } of uniquePercentages) {
            const factor = pct / 100;
            const t = (factor * olderAgeMs - youngerAgeMs) / (1 - factor);

            if (t > 0 && t < maxDaysAhead * dayMs) {
                const milestoneDate = new Date(now.getTime() + t);
                milestones.push({
                    value: pct,
                    unit: 'percent',
                    unitName: '%',
                    date: milestoneDate,
                    type: 'percentage',
                    comboDescription: happy,
                    contributingEvents: [older.name, younger.name],
                    timeUntil: milestoneDate.getTime() - now.getTime()
                });
            }
        }
    }

    return milestones.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, maxResults);
}

// Find gap/duration milestones between two events (TRUE COMBINATIONS ONLY)
function findGapMilestones(event1, event2, maxResults, maxDaysAhead, settings) {
    const milestones = [];
    const now = new Date();
    const maxDateMs = now.getTime() + maxDaysAhead * 24 * 60 * 60 * 1000;

    // Ensure dates are Date objects
    const date1 = event1.date instanceof Date ? event1.date : new Date(event1.date);
    const date2 = event2.date instanceof Date ? event2.date : new Date(event2.date);

    // The gap between the two events
    const older = date1 < date2 ? { ...event1, date: date1 } : { ...event2, date: date2 };
    const younger = date1 < date2 ? { ...event2, date: date2 } : { ...event1, date: date1 };

    const gapMs = younger.date.getTime() - older.date.getTime();
    const youngerAgeMs = now.getTime() - younger.date.getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    // Only show TRUE combinations - multiples of the gap between events
    // "Time since younger event = Nx the gap before them"
    // More multiples for more milestones
    const multiples = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20];

    for (const mult of multiples) {
        // When youngerAgeMs + t = mult * gapMs
        const targetMs = mult * gapMs;
        if (targetMs > youngerAgeMs) {
            const t = targetMs - youngerAgeMs;
            if (t > 0 && t < maxDaysAhead * dayMs) {
                const milestoneDate = new Date(now.getTime() + t);
                const gapDesc = formatDurationApprox(gapMs);
                const happyDesc = getHappyGapDescription(older.name, younger.name, mult, gapDesc);
                milestones.push({
                    value: mult,
                    unit: 'multiple',
                    unitName: 'x',
                    date: milestoneDate,
                    type: 'gap_multiple',
                    comboDescription: happyDesc,
                    contributingEvents: [older.name, younger.name],
                    timeUntil: milestoneDate.getTime() - now.getTime()
                });
            }
        }
    }

    // Also add: when time since younger equals the gap (equals milestone)
    if (gapMs > youngerAgeMs) {
        const t = gapMs - youngerAgeMs;
        if (t > 0 && t < maxDaysAhead * dayMs) {
            const milestoneDate = new Date(now.getTime() + t);
            const gapDesc = formatDurationApprox(gapMs);
            milestones.push({
                value: 1,
                unit: 'equals',
                unitName: '=',
                date: milestoneDate,
                type: 'gap_equals',
                comboDescription: `🎯 The gap before ${younger.name} (${gapDesc}) is now matched by life with them!`,
                contributingEvents: [older.name, younger.name],
                timeUntil: milestoneDate.getTime() - now.getTime()
            });
        }
    }

    return milestones.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, maxResults);
}

// Check if a number is "strictly" special (more selective for combined milestones)
function isStrictSpecialNumber(num) {
    // Powers of 10
    if (isPowerOf10(num)) return true;
    // Round thousands
    if (num >= 1000 && num % 1000 === 0) return true;
    // Large repdigits
    if (num >= 1000 && isRepdigit(num)) return true;
    // Round hundreds over 500
    if (num >= 500 && num % 500 === 0) return true;
    return false;
}

// Format duration approximately
function formatDurationApprox(ms) {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    if (days < 30) return `${days} days`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    if (remMonths === 0) return `${years} years`;
    return `${years}y ${remMonths}m`;
}

function fillAllConnections() {
    // Ensure connections object exists
    if (!appData.connections) {
        appData.connections = {};
    }

    // Enable all connections by default
    const eventIds = appData.events.map(e => e.id);
    for (let i = 0; i < eventIds.length; i++) {
        for (let j = i + 1; j < eventIds.length; j++) {
            const key = getConnectionKey(eventIds[i], eventIds[j]);
            if (appData.connections[key] === undefined) {
                appData.connections[key] = true;
            }
        }
    }
    saveData();
}

function renderConnectionMatrix() {
    if (!connectionMatrixEl) return;
    const events = appData.events;

    if (events.length < 2) {
        connectionMatrixEl.innerHTML = '<p class="empty-text">Add at least 2 events to see the matrix.</p>';
        return;
    }

    let html = '<table class="matrix-table">';

    // Header row
    html += '<tr><th></th>';
    for (const e of events) {
        html += `<th class="matrix-header" title="${escapeHtml(e.name)}">${escapeHtml(getShortName(e.name))}</th>`;
    }
    html += '</tr>';

    // Data rows
    for (let i = 0; i < events.length; i++) {
        html += `<tr><th class="matrix-row-header" title="${escapeHtml(events[i].name)}">${escapeHtml(getShortName(events[i].name))}</th>`;
        for (let j = 0; j < events.length; j++) {
            if (i === j) {
                html += `<td class="matrix-cell matrix-diagonal">-</td>`;
            } else if (i < j) {
                const key = getConnectionKey(events[i].id, events[j].id);
                const isActive = appData.connections[key];
                html += `<td class="matrix-cell ${isActive ? 'active' : ''}" onclick="toggleConnection('${events[i].id}', '${events[j].id}')">
                    ${isActive ? '&#10003;' : ''}
                </td>`;
            } else {
                const key = getConnectionKey(events[j].id, events[i].id);
                const isActive = appData.connections[key];
                html += `<td class="matrix-cell matrix-mirror ${isActive ? 'active-mirror' : ''}">${isActive ? '&#10003;' : ''}</td>`;
            }
        }
        html += '</tr>';
    }

    html += '</table>';
    connectionMatrixEl.innerHTML = html;
}

function getShortName(name) {
    if (name.length <= 10) return name;
    return name.substring(0, 8) + '...';
}

function getConnectionKey(id1, id2) {
    return id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
}

// Parse connection key to extract event IDs
// Key format: "event_{ts}_{rand}_event_{ts}_{rand}" (full IDs joined with _)
function parseConnectionKey(key) {
    // Event IDs have the format: event_{timestamp}_{random_alphanum}
    // Match full event IDs including the random alphanumeric suffix
    const eventIdPattern = /event_\d+_[a-z0-9]+/g;
    const matches = key.match(eventIdPattern);
    if (matches && matches.length === 2) {
        return matches;
    }
    // Fallback: try the known event IDs to find which two are in this key
    if (typeof appData !== 'undefined' && appData.events) {
        const ids = appData.events.map(e => e.id).filter(id => key.includes(id));
        if (ids.length === 2) return ids;
    }
    return null;
}

function toggleConnection(id1, id2) {
    const key = getConnectionKey(id1, id2);
    appData.connections[key] = !appData.connections[key];
    saveData();
    renderConnectionMatrix();
}

function loadComboTypesUI() {
    document.querySelectorAll('[data-combo-type]').forEach(cb => {
        cb.checked = appData.comboTypes[cb.dataset.comboType] || false;
    });
}

function handleComboTypeChange() {
    document.querySelectorAll('[data-combo-type]').forEach(cb => {
        appData.comboTypes[cb.dataset.comboType] = cb.checked;
    });
    saveData();
}

// ============================================================
// EVENT TYPE HELPERS
// ============================================================

// Get appropriate wording for milestone based on event type
function getEventMilestoneDescription(event, milestone) {
    // Cosmic milestones carry their own description
    if (milestone.isCosmic) {
        const name = escapeHtml(event.name);
        const cosmicOrd = typeof ordinal === 'function' ? ordinal(milestone.value) : milestone.value;
        const label = (milestone.value === 1 ? '' : cosmicOrd + ' ') + milestone.unitName;
        return `${name}'s ${label}`;
    }

    const type = event.type || 'birthday';
    const value = milestone.value.toLocaleString();
    const unit = milestone.unitName;
    const name = escapeHtml(event.name);
    const _t = (typeof I18N !== 'undefined') ? I18N.t : (k) => null;

    switch (type) {
        case 'birthday':
            if (unit === 'years' || unit === 'y') {
                const tmpl = _t('turns_age') || '{name} turns {value}!';
                return tmpl.replace('{name}', name).replace('{value}', value);
            }
            const tmpl2 = _t('is_old') || '{name} turns {value} {unit}';
            return tmpl2.replace('{name}', name).replace('{value}', value).replace('{unit}', unit);
        case 'beginning':
        case 'milestone':
        default:
            const tmpl3 = _t('since') || '{value} {unit} since {name}';
            return tmpl3.replace('{name}', name).replace('{value}', value).replace('{unit}', unit);
    }
}

// Get wording for combined milestones based on event types
function getCombinedMilestoneWording(events) {
    const types = events.map(e => e.type || 'birthday');
    const allBirthdays = types.every(t => t === 'birthday');
    const hasBirthdays = types.some(t => t === 'birthday');
    const names = events.map(e => escapeHtml(e.name));

    if (allBirthdays) {
        return { prefix: 'Together we are', verb: 'reach', names };
    } else if (hasBirthdays) {
        return { prefix: 'Our combined journey', verb: 'totals', names };
    } else {
        return { prefix: 'Total time together', verb: 'reaches', names };
    }
}

// Generate happy description for combined sum milestones
function getHappySumDescription(value, unit, wording) {
    const unitConfig = TIME_UNITS[unit];
    const formattedValue = value.toLocaleString();
    const namesStr = wording.names ? wording.names.join(' + ') : 'us';

    // Check for special number patterns
    const isRepdigit = /^(\d)\1+$/.test(String(value));
    const isPalindrome = String(value) === String(value).split('').reverse().join('');

    // Special celebratory messages for milestone numbers
    if (unit === 'seconds') {
        if (value >= 10000000000) {
            const billions = value / 1000000000;
            return `🚀 INCREDIBLE! ${namesStr} = ${billions} BILLION seconds combined! Mind-blowing!`;
        }
        if (value >= 1000000000) {
            const billions = value / 1000000000;
            return `🎉 WOW! ${namesStr} = ${billions} BILLION seconds! Party time!`;
        }
        if (value >= 100000000) {
            const millions = Math.round(value / 1000000);
            return `✨ ${namesStr} = ${millions} million seconds together!`;
        }
        if (isRepdigit && value >= 111111111) {
            return `🎯 MAGIC NUMBER! ${namesStr} = ${formattedValue} seconds - all ${String(value)[0]}s!`;
        }
    }

    if (unit === 'minutes') {
        if (value >= 100000000) {
            const millions = Math.round(value / 1000000);
            return `⏰ ${namesStr} = ${millions} million minutes! Epic!`;
        }
        if (value >= 10000000) {
            const millions = Math.round(value / 1000000);
            return `🎊 ${namesStr} = ${millions} million minutes combined!`;
        }
    }

    if (unit === 'hours') {
        if (value >= 1000000) {
            return `🌟 ${namesStr} = 1 MILLION+ hours! Legendary!`;
        }
        if (value >= 100000) {
            return `⭐ ${namesStr} = ${formattedValue} hours of life combined!`;
        }
    }

    if (unit === 'years') {
        if (value >= 200) {
            return `🏆 DOUBLE CENTURY! ${namesStr} = ${formattedValue} years! Incredible journey!`;
        }
        if (value >= 100) {
            return `🎂 CENTURY! ${namesStr} = ${formattedValue} years combined! Celebrate!`;
        }
        if (value >= 50) {
            return `🥳 Half-century! ${namesStr} = ${formattedValue} years! Keep going!`;
        }
    }

    if (unit === 'days') {
        if (value >= 100000) {
            return `📅 WOW! ${namesStr} = ${formattedValue} days - that's a LOT of sunrises!`;
        }
        if (value >= 50000) {
            return `🌅 ${namesStr} = ${formattedValue} days of combined memories!`;
        }
        if (value >= 10000) {
            return `☀️ ${namesStr} = ${formattedValue} days together! Amazing!`;
        }
    }

    if (unit === 'weeks') {
        if (value >= 10000) {
            return `📆 ${namesStr} = ${formattedValue} weeks - tens of thousands of weekends!`;
        }
        if (value >= 5000) {
            return `🗓️ ${namesStr} = ${formattedValue} weeks combined! So many memories!`;
        }
        if (value >= 1000) {
            return `✨ ${namesStr} = ${formattedValue} weeks - thousands of weekends of joy!`;
        }
    }

    // Special patterns
    if (isRepdigit && value >= 1111) {
        return `🎯 ${namesStr} = ${formattedValue} ${unitConfig.plural} - all ${String(value)[0]}s! Lucky!`;
    }
    if (isPalindrome && value >= 10001) {
        return `🪞 ${namesStr} = ${formattedValue} ${unitConfig.plural} - palindrome magic!`;
    }

    // Default happy message
    return `🌟 ${namesStr} = ${formattedValue} ${unitConfig.plural}! Celebrate!`;
}

// Generate happy description for gap/duration milestones
function getHappyGapDescription(olderName, youngerName, multiple, gapDesc) {
    if (multiple === 0.5) {
        return `⏳ Half the wait! Time with ${youngerName} reaches half of the ${gapDesc} gap!`;
    }
    if (multiple === 1) {
        return `🎯 MATCHED! Time with ${youngerName} now equals the ${gapDesc} that came before!`;
    }
    if (multiple === 1.5) {
        return `✨ Time with ${youngerName} is now 1.5x the original ${gapDesc} gap!`;
    }
    if (multiple === 2) {
        return `🎉 DOUBLE TIME! Life with ${youngerName} is now TWICE the ${gapDesc} gap before!`;
    }
    if (multiple === 3) {
        return `🌟 TRIPLE! Time with ${youngerName} is 3x the ${gapDesc} gap - amazing journey!`;
    }
    if (multiple === 4) {
        return `💫 QUADRUPLE! ${youngerName} has been around 4x longer than the ${gapDesc} wait!`;
    }
    if (multiple === 5) {
        return `🏆 FIVE TIMES! The ${gapDesc} gap is now dwarfed by ${multiple}x that time with ${youngerName}!`;
    }
    if (multiple >= 10) {
        return `🚀 WOW! ${multiple}x the original ${gapDesc} gap - ${youngerName} has been here so long!`;
    }
    // Default for other multiples
    return `⭐ ${multiple}x milestone! Time with ${youngerName} is now ${multiple}x the ${gapDesc} gap!`;
}

// ============================================================
// MILESTONES TAB - COLUMN LAYOUT
// ============================================================

let allMilestonesFlat = []; // Store for sharing (individual)
let allCombinedMilestonesFlat = []; // Store for sharing (combined)
let selectedCombinedMilestone = null;

function getTodayHighlight() {
    const now = new Date();
    const highlights = [];
    appData.events.forEach(event => {
        const d = event.date instanceof Date ? event.date : new Date(event.date);
        const type = event.type || 'birthday';
        // Check today's numbers
        const units = ['days', 'weeks', 'months'];
        units.forEach(unit => {
            const age = calculateAge(d, now, unit);
            if (age > 0) {
                const info = isSpecialNumber(age, appSettings);
                if (info.type !== 'special') {
                    highlights.push({ name: event.name, value: age, unit: TIME_UNITS[unit].name, why: info.description });
                }
            }
        });
    });
    return highlights.slice(0, 3);
}

function findHeroMilestone() {
    // Gather candidates from all relevant events
    const events = _mostSpecialMode
        ? appData.events
        : appData.events.filter(e => selectedPersonIds.includes(e.id));
    if (events.length === 0) return null;

    let candidates = [];
    const now = new Date();

    events.forEach(e => {
        // Yearly milestones (birthdays/anniversaries within 60 days)
        const yearly = getUpcomingYearlyMilestones(e, 60);
        yearly.forEach(m => {
            m.eventName = m.eventName || e.name;
            m.eventId = m.eventId || e.id;
            m.eventType = m.eventType || e.type || 'birthday';
            m.fullDescription = m.fullDescription || getEventMilestoneDescription(e, m);
        });
        candidates = candidates.concat(yearly);

        // Special number milestones — look further ahead for hero
        const milestones = findAllUpcomingMilestones(e.date, 50, 730, appSettings);

        // Big milestones (billion seconds, etc.)
        if (typeof findBigMilestones === 'function') {
            const bigOnes = findBigMilestones(e.date, appSettings);
            bigOnes.forEach(bm => {
                if (!milestones.some(m => m.value === bm.value && m.unit === bm.unit)) {
                    milestones.push(bm);
                }
            });
        }

        // Cosmic milestones (planetary returns)
        if (typeof findCosmicMilestones === 'function') {
            const cosmicOnes = findCosmicMilestones(e.date);
            cosmicOnes.forEach(cm => {
                if (!milestones.some(m => m.unit === cm.unit && m.value === cm.value)) {
                    milestones.push(cm);
                }
            });
        }

        milestones.forEach(m => {
            m.eventName = e.name;
            m.eventId = e.id;
            m.eventType = e.type || 'birthday';
            m.fullDescription = getEventMilestoneDescription(e, m);
        });
        candidates = candidates.concat(milestones);
    });

    if (candidates.length === 0) return null;

    // Score each candidate for "hero-worthiness"
    candidates.forEach(m => {
        const daysAway = m.timeUntil / (24 * 60 * 60 * 1000);

        // Roundness component (0-200+)
        let rScore = m.isBirthday ? 40 : (m.isCosmic ? 0 : roundnessScore(m.value));

        // Big milestone bonus
        if (m.isBigMilestone) rScore += 80;

        // Cosmic milestone bonus (Saturn return = very important)
        if (m.isCosmic) {
            rScore += m.isSaturnReturn ? 60 : (m.isVerySpecialCosmic ? 20 : 5);
        }

        // Very special bonus
        if (!m.isBirthday && !m.isCosmic && isVerySpecialNumber(m.value)) rScore += 30;

        // Proximity bonus: within 30 days = max bonus, decays over 365 days
        let pScore;
        if (daysAway <= 30) {
            pScore = 100 - daysAway * 1.5; // 100 at 0 days, 55 at 30 days
        } else if (daysAway <= 365) {
            pScore = 55 * Math.max(0, 1 - (daysAway - 30) / 335);
        } else {
            pScore = 0;
        }

        // Birthday proximity super-bonus (imminent birthdays are exciting)
        if (m.isBirthday && daysAway <= 14) {
            pScore += 50;
        }

        m._heroScore = rScore * 0.6 + pScore * 0.4;
    });

    // Pick the winner
    candidates.sort((a, b) => b._heroScore - a._heroScore);
    return candidates[0];
}

function renderHeroMilestone() {
    const heroEl = document.getElementById('heroMilestone');
    if (!heroEl) return;

    const hero = findHeroMilestone();
    // Only show hero if it's genuinely impressive (not weak alternating patterns etc.)
    if (!hero || (!isVerySpecialNumber(hero.value) && !hero.isCosmic)) {
        heroEl.style.display = 'none';
        return;
    }

    const daysAway = Math.ceil(hero.timeUntil / (24 * 60 * 60 * 1000));
    const dateStr = formatDateWithTime(hero.date);
    const timeUntilStr = formatTimeDistance(hero.timeUntil);

    // Build the display value
    let displayValue, displayUnit;
    if (hero.isBirthday) {
        displayValue = hero.description; // e.g. "Turns 30"
        displayUnit = hero.unitName;     // "birthday" or "anniversary"
    } else if (hero.isCosmic) {
        const cosmicOrdinal = typeof ordinal === 'function' ? ordinal(hero.value) : hero.value;
        displayValue = (hero.value === 1 ? '' : cosmicOrdinal + ' ') + hero.unitName;
        displayUnit = '';
    } else {
        displayValue = hero.value.toLocaleString();
        displayUnit = hero.unitName;
    }

    // Build a human-readable sentence
    let sentence;
    if (hero.isBirthday) {
        sentence = `${hero.eventName} ${hero.description.toLowerCase()}`;
    } else if (hero.isCosmic) {
        sentence = `${hero.eventName}'s ${displayValue}`;
    } else {
        sentence = `${hero.eventName} turns ${displayValue} ${displayUnit}`;
    }

    const heroClasses = hero.isCosmic ? 'hero-milestone-inner cosmic-hero' + (hero.isSaturnReturn ? ' saturn-return' : '') : 'hero-milestone-inner';
    heroEl.innerHTML = `
        <div class="${heroClasses}">
            <div class="hero-value-row">
                ${hero.isCosmic ? '<span class="hero-cosmic-icon">\u2731</span>' : ''}
                <span class="hero-value">${hero.isBirthday ? hero.description : displayValue}</span>
                ${!hero.isBirthday && !hero.isCosmic ? `<span class="hero-unit">${displayUnit}</span>` : ''}
            </div>
            ${hero.isCosmic && hero.description ? `<div class="hero-cosmic-desc">${hero.description}</div>` : ''}
            <div class="hero-details">
                <span class="hero-person">${escapeHtml(hero.eventName)}</span>
                <span class="hero-separator">&mdash;</span>
                <span class="hero-date">${dateStr}</span>
                <span class="hero-separator">&mdash;</span>
                <span class="hero-countdown">${timeUntilStr}</span>
            </div>
            <div class="hero-actions">
                <button class="hero-share-btn" onclick="heroShare()">Share</button>
                <button class="hero-remind-btn" onclick="heroRemind()">Remind me</button>
            </div>
        </div>
    `;
    heroEl.style.display = 'block';

    // Store reference for sharing
    heroEl._heroMilestone = hero;
}

function heroShare() {
    const heroEl = document.getElementById('heroMilestone');
    if (!heroEl || !heroEl._heroMilestone) return;
    const m = heroEl._heroMilestone;
    const message = typeof generateShareMessage === 'function' ? generateShareMessage(m) : '';
    if (navigator.share) {
        navigator.share({ title: 'HappyMoment', text: message }).catch(() => {});
    } else {
        navigator.clipboard.writeText(message).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(() => {});
    }
    _track('hero_share', { value: m.value, unit: m.unit });
}

function heroRemind() {
    if (typeof NOTIF !== 'undefined' && !NOTIF.isEnabled()) {
        NOTIF.enable().then(ok => {
            if (ok) {
                showToast('Reminders enabled! We\u2019ll notify you before this milestone.', 'success');
                _track('hero_remind_enabled');
            }
        });
    } else {
        showToast('Reminder set! We\u2019ll notify you the day before.', 'success');
        _track('hero_remind');
    }
}

// ── HOME SCREEN: Time-chunked view ──
function renderHomeScreen() {
    const listEl = document.getElementById('timeChunkedList');
    const togetherEl = document.getElementById('togetherSection');
    if (!listEl) return;

    if (appData.events.length === 0) {
        listEl.innerHTML = '<p class="empty-text" style="padding:32px;text-align:center;font-style:italic;color:var(--text-muted);">Enter a birthday to discover hidden milestones.</p>';
        if (togetherEl) togetherEl.style.display = 'none';
        return;
    }

    // Gather all milestones across all people
    let all = [];
    const now = new Date();
    appData.events.forEach(e => {
        const milestones = typeof findAllUpcomingMilestones === 'function'
            ? findAllUpcomingMilestones(e.date, 30, 365, appSettings) : [];
        if (typeof findBigMilestones === 'function') {
            findBigMilestones(e.date, appSettings).forEach(b => {
                if (!milestones.some(m => m.value === b.value && m.unit === b.unit)) milestones.push(b);
            });
        }
        if (typeof findCosmicMilestones === 'function') {
            findCosmicMilestones(e.date).forEach(c => {
                if (!milestones.some(m => m.unit === c.unit && m.value === c.value)) milestones.push(c);
            });
        }
        milestones.forEach(m => { m.eventName = e.name; m.eventId = e.id; });
        // Include future milestones
        all = all.concat(milestones.filter(m => m.timeUntil > 0));
        // Include recently passed milestones (≤7 days ago, or ≤30 days for very impressive)
        milestones.filter(m => m.timeUntil <= 0 && m.timeUntil > -30 * 24*60*60*1000).forEach(m => {
            const daysAgo = Math.abs(m.timeUntil) / (24*60*60*1000);
            const isVeryImpressive = m.isBigMilestone || (m.value >= 10000 && m.value % 10000 === 0) ||
                (String(m.value).length >= 8 && new Set(String(m.value)).size <= 2);
            if (daysAgo <= 7 || (isVeryImpressive && daysAgo <= 30)) {
                m.recentlyPassed = true;
                all.push(m);
            }
        });
    });

    // Sort: recently passed first (by recency), then future (by proximity)
    all.sort((a, b) => {
        if (a.recentlyPassed && !b.recentlyPassed) return -1;
        if (!a.recentlyPassed && b.recentlyPassed) return 1;
        if (a.recentlyPassed && b.recentlyPassed) return b.timeUntil - a.timeUntil; // most recent first
        return a.timeUntil - b.timeUntil;
    });
    allMilestonesFlat = all;

    // Chunk by time
    const recentlyPassed = all.filter(m => m.recentlyPassed);
    const future = all.filter(m => !m.recentlyPassed);
    const week = [], month = [], later = [];
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const monthMs = 30 * 24 * 60 * 60 * 1000;
    future.forEach(m => {
        if (m.timeUntil <= weekMs) week.push(m);
        else if (m.timeUntil <= monthMs) month.push(m);
        else later.push(m);
    });

    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;
    const thisYear = new Date().getFullYear();
    let _globalCosmicShown = 0; // max 1 cosmic across ALL chunks
    function renderChunk(label, items, maxShow) {
        if (items.length === 0) return '';
        maxShow = maxShow || 7;
        // Cosmic milestones never first — sort non-cosmic before cosmic, then by proximity
        const sorted = [...items].sort((a, b) => {
            if (a.isCosmic && !b.isCosmic) return 1;
            if (!a.isCosmic && b.isCosmic) return -1;
            return a.timeUntil - b.timeUntil;
        });
        // Max 1 cosmic across entire list
        const filtered = sorted.filter(m => {
            if (m.isCosmic) { _globalCosmicShown++; return _globalCosmicShown <= 1; }
            return true;
        });
        let html = `<div class="time-chunk-label">${label}</div>`;
        filtered.slice(0, maxShow).forEach((m, i) => {
            // For cosmic: show description only (avoids "200 200th Mercury return")
            let displayText;
            if (m.isCosmic) {
                displayText = m.description || m.unitName;
            } else {
                displayText = m.value.toLocaleString(locale) + ' ' + m.unitName;
            }
            const mYear = m.date.getFullYear();
            const showYear = mYear !== thisYear;
            const dateOpts = showYear
                ? { month: 'short', day: 'numeric', year: 'numeric' }
                : { weekday: 'short', month: 'short', day: 'numeric' };
            let dateStr;
            if (m.recentlyPassed) {
                const daysAgo = Math.round(Math.abs(m.timeUntil) / (24*60*60*1000));
                dateStr = daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo}d ago`;
            } else {
                dateStr = m.date.toLocaleDateString(locale, dateOpts);
            }
            const isSpecial = !m.isCosmic && (m.isBigMilestone || (m.value >= 10000 && m.value % 10000 === 0));
            html += `<div class="time-chunk-item">
                <div class="tc-left">
                    <span class="tc-value ${isSpecial ? 'starred' : ''}" style="white-space:nowrap;">${isSpecial ? '\u2605 ' : ''}${displayText}</span>
                    <span class="tc-person">${escapeHtml(m.eventName)}</span>
                </div>
                <span class="tc-date">${dateStr}</span>
                <button class="tc-share-btn" onclick="event.stopPropagation();homeShareMilestone(${all.indexOf(m)})">Share</button>
            </div>`;
        });
        if (items.length > maxShow) {
            html += `<div class="time-chunk-more">...and ${items.length - maxShow} more</div>`;
        }
        return html;
    }

    // Split "Later" into this year vs next year
    const laterThisYear = later.filter(m => m.date.getFullYear() === thisYear);
    const nextYear = later.filter(m => m.date.getFullYear() > thisYear);

    let html = '';
    // Recently passed milestones (you just missed these!)
    if (recentlyPassed.length > 0) {
        html += renderChunk('Just passed', recentlyPassed, 3);
    }
    html += renderChunk('This week', week, 3);
    html += renderChunk('This month', month, 3);
    html += renderChunk(laterThisYear.length > 0 ? 'Later this year' : 'Coming up', laterThisYear, 3);
    if (nextYear.length > 0) {
        html += renderChunk('Next year', nextYear, 3);
    }

    if (html === '') {
        html = '<p class="empty-text" style="padding:24px;text-align:center;font-style:italic;color:var(--text-muted);">Your next milestone is coming. Add more people to find milestones sooner!</p>';
    }
    listEl.innerHTML = html;

    // Together section
    if (togetherEl && appData.events.length >= 2) {
        togetherEl.style.display = '';
        const contentEl = document.getElementById('togetherContent');
        if (contentEl) {
            // Calculate combined age
            let totalDays = 0;
            appData.events.forEach(e => {
                totalDays += Math.floor((now.getTime() - new Date(e.date).getTime()) / (24*60*60*1000));
            });
            // Find closest nice round number
            const cands = [1000, 2500, 5000, 10000, 25000, 50000, 100000];
            let bestT = 0, bestD = Infinity;
            cands.forEach(s => { const t = Math.ceil(totalDays / s) * s; const d = t - totalDays; if (d > 0 && d < bestD) { bestD = d; bestT = t; } });
            contentEl.innerHTML = `<p class="together-teaser">
                <strong>${bestT.toLocaleString(locale)} days</strong> together in ${bestD.toLocaleString(locale)} days</p>`;
        }
    } else if (togetherEl) {
        togetherEl.style.display = 'none';
    }
}

// Share from time-chunked list
function homeShareMilestone(idx) {
    const m = allMilestonesFlat[idx];
    if (!m) return;
    const message = typeof generateShareMessage === 'function' ? generateShareMessage(m) : `${m.eventName}: ${m.value.toLocaleString()} ${m.unitName}`;
    if (navigator.share) {
        navigator.share({ title: 'HappyMoment', text: message }).catch(() => {});
    } else {
        navigator.clipboard.writeText(message).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(() => {});
    }
    _track('home_share', { value: m.value, unit: m.unit, person: m.eventName });
}

function renderMilestonesTab() {
    // Render the new Home screen — no single hero, all milestones equal
    renderHomeScreen();

    // Hero card hidden — milestones from all people shown equally in the list
    const heroEl = document.getElementById('heroMilestone');
    if (heroEl) heroEl.style.display = 'none';

    // Legacy: keep old columns for compatibility but don't show
    if (appData.events.length === 0) {
        return;
    }

    // NOTE: allMilestonesFlat is already set by renderHomeScreen() — do NOT reset it here

    // Show "Today" highlight — personal milestones + history facts
    const todayBox = document.getElementById('todayHighlight');
    if (todayBox) {
        const today = getTodayHighlight();
        let todayHtml = '';

        // Personal milestones today
        if (today.length > 0) {
            todayHtml += today.map(t =>
                `<span class="today-item">${escapeHtml(t.name)}: <strong>${t.value.toLocaleString()}</strong> ${escapeHtml(t.unit)} (${escapeHtml(t.why)})</span>`
            ).join(' · ');
        }

        // History fact of the day — only show if years/days ago is a "nice" number
        if (typeof getTodayHistoryFacts === 'function') {
            const facts = getTodayHistoryFacts();
            // Filter to only show facts where yearsAgo or daysAgo is special
            const niceFact = facts.find(f => {
                const y = f.yearsAgo;
                const d = f.daysAgo;
                // Nice years: multiples of 25, or round decade
                if (y > 0 && (y % 25 === 0 || y % 50 === 0 || y % 100 === 0)) return true;
                // Nice days: repdigit, palindrome, round, power of 10
                const ds = String(d);
                if (d >= 10000 && d % 10000 === 0) return true;
                if (ds.length >= 4 && new Set(ds).size === 1) return true;
                if (ds.length >= 5 && ds === ds.split('').reverse().join('')) return true;
                if (typeof isVerySpecialNumber === 'function' && isVerySpecialNumber(d)) return true;
                return false;
            });
            if (niceFact) {
                const historyHtml = `<div class="today-history">
                    <span class="today-history-badge">${niceFact.yearsAgo} years ago today</span>
                    <span class="today-history-event">${escapeHtml(niceFact.event)}</span>
                    <span class="today-history-number">${escapeHtml(niceFact.numberFact)}</span>
                </div>`;
                todayHtml += historyHtml;
            }
        }

        if (todayHtml) {
            todayBox.innerHTML = todayHtml;
            todayBox.style.display = 'block';
        } else {
            todayBox.style.display = 'none';
        }
    }

    // Render hero milestone card above the list
    renderHeroMilestone();

    if (_mostSpecialMode) {
        renderMostSpecialMilestones();
    } else {
        renderPersonColumns();
    }

    // Update share preview
    updateSharePreview();
}

function renderMostSpecialMilestones() {
    allMilestonesFlat = [];

    // Get milestones for all events but only keep very special ones
    appData.events.forEach(e => {
        // Include upcoming birthday/anniversary only if within 30 days
        const yearlyMilestones = getUpcomingYearlyMilestones(e, 30);
        allMilestonesFlat = allMilestonesFlat.concat(yearlyMilestones);

        const milestones = findAllUpcomingMilestones(e.date, 50, 730, appSettings); // Look further ahead

        // Add "Big Milestones" (billion seconds, etc.) — always visible
        if (typeof findBigMilestones === 'function') {
            const bigOnes = findBigMilestones(e.date, appSettings);
            bigOnes.forEach(bm => {
                if (!milestones.some(m => m.value === bm.value && m.unit === bm.unit)) {
                    milestones.push(bm);
                }
            });
        }

        // Add cosmic milestones (planetary returns)
        if (typeof findCosmicMilestones === 'function') {
            const cosmicOnes = findCosmicMilestones(e.date);
            cosmicOnes.forEach(cm => {
                if (!milestones.some(m => m.unit === cm.unit && m.value === cm.value)) {
                    milestones.push(cm);
                }
            });
        }

        milestones.forEach(m => {
            m.eventName = e.name;
            m.eventId = e.id;
            m.eventType = e.type || 'birthday';
            m.fullDescription = getEventMilestoneDescription(e, m);
        });
        // Only add very special milestones (including cosmic)
        const verySpecial = milestones.filter(m => isVerySpecialNumber(m.value) || m.isBigMilestone || m.isCosmic);
        allMilestonesFlat = allMilestonesFlat.concat(verySpecial);
    });

    // Sort by date
    allMilestonesFlat.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Render
    let html = '<div class="milestones-vertical-list">';

    if (allMilestonesFlat.length === 0) {
        html += '<p class="empty-text">No special milestones found in the next 2 years.</p>';
    } else {
        allMilestonesFlat.slice(0, 30).forEach((m, idx) => {
            const timeUntilStr = formatTimeDistance(m.timeUntil);
            const dateStr = formatDateWithTime(m.date);

            if (m.isCosmic) {
                const cosmicLabel = (m.value === 1 ? '' : (typeof ordinal === 'function' ? ordinal(m.value) : m.value) + ' ') + m.unitName;
                html += `
                    <div class="milestone-item-vertical very-special cosmic-milestone ${m.isSaturnReturn ? 'saturn-return' : ''} ${selectedMilestone === idx ? 'selected-for-share' : ''}"
                         onclick="selectMilestoneForShare(${idx})">
                        <div class="miv-left">
                            <div class="miv-value"><span class="cm-cosmic-icon">\u2731</span> ${cosmicLabel}</div>
                        </div>
                        <div class="miv-right">
                            <div class="miv-person">${m.eventName}</div>
                            <div class="miv-when">${dateStr}</div>
                            <div class="miv-countdown">${timeUntilStr}</div>
                            <div class="miv-cosmic-desc">${m.description}</div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="milestone-item-vertical very-special ${selectedMilestone === idx ? 'selected-for-share' : ''}"
                         onclick="selectMilestoneForShare(${idx})">
                        <div class="miv-left">
                            <div class="miv-value">${m.value.toLocaleString()}</div>
                            <div class="miv-unit">${m.unitName}</div>
                        </div>
                        <div class="miv-right">
                            <div class="miv-person">${m.eventName}</div>
                            <div class="miv-when">${dateStr}</div>
                            <div class="miv-countdown">${timeUntilStr}</div>
                        </div>
                    </div>
                `;
            }
        });
    }

    html += '</div>';
    milestonesColumnsEl.innerHTML = html;
}

// Get the next upcoming birthday/anniversary IF it's within maxDays (default 30)
function getUpcomingYearlyMilestones(event, maxDays) {
    maxDays = maxDays || 30;
    const now = new Date();
    const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
    const type = event.type || 'birthday';
    const thisYear = now.getFullYear();
    const eventMonth = eventDate.getMonth();
    const eventDay = eventDate.getDate();

    // Check this year, then next year
    for (let offset = 0; offset <= 1; offset++) {
        const candidateYear = thisYear + offset;
        let nextDate = new Date(candidateYear, eventMonth, eventDay);

        // Handle Feb 29 for non-leap years
        if (eventMonth === 1 && eventDay === 29 && nextDate.getMonth() !== 1) {
            nextDate = new Date(candidateYear, 1, 28);
        }

        if (nextDate <= now) continue;

        const timeUntil = nextDate.getTime() - now.getTime();
        const daysUntil = timeUntil / (24 * 60 * 60 * 1000);
        if (daysUntil > maxDays) return [];

        const age = candidateYear - eventDate.getFullYear();
        if (age <= 0) continue;

        const _t = (typeof I18N !== 'undefined') ? I18N.t : (k) => null;
        const turnsLabel = _t('turns') || 'Turns';
        const label = type === 'birthday' ? `${turnsLabel} ${age}` : `${age}y`;

        let fullDesc;
        if (type === 'birthday') {
            const tmpl = _t('turns_age') || '{name} turns {value}!';
            fullDesc = '🎂 ' + tmpl.replace('{name}', event.name).replace('{value}', age);
        } else {
            const tmpl = _t('years_since') || '{value} years since {name}!';
            fullDesc = '🎉 ' + tmpl.replace('{name}', event.name).replace('{value}', age);
        }

        return [{
            value: age,
            unit: 'birthday',
            unitName: type === 'birthday' ? 'birthday' : 'anniversary',
            date: nextDate,
            type: 'yearly',
            description: label,
            timeUntil: timeUntil,
            eventName: event.name,
            eventId: event.id,
            eventType: type,
            fullDescription: fullDesc,
            isBirthday: true
        }];
    }

    return [];
}

function renderPersonColumns() {
    allMilestonesFlat = [];

    const selectedEvents = appData.events.filter(e => selectedPersonIds.includes(e.id));
    if (selectedEvents.length === 0) return;

    const DEFAULT_SHOW = 7;

    // Build columns for each selected person
    let html = '<div class="columns-container">';

    let globalIdx = 0;

    selectedEvents.forEach((event, eventIdx) => {
        // Get yearly milestones (birthdays/anniversaries) — always shown first
        const yearlyMilestones = getUpcomingYearlyMilestones(event, 30);

        // Get special number milestones
        const milestones = findAllUpcomingMilestones(event.date, 20, 365, appSettings);

        // Add "Big Milestones" (billion seconds, etc.) — no time horizon limit
        if (typeof findBigMilestones === 'function') {
            const bigOnes = findBigMilestones(event.date, appSettings);
            bigOnes.forEach(bm => {
                // Only add if not already in the list
                if (!milestones.some(m => m.value === bm.value && m.unit === bm.unit)) {
                    milestones.push(bm);
                }
            });
        }

        // Add cosmic milestones (planetary returns)
        if (typeof findCosmicMilestones === 'function') {
            const cosmicOnes = findCosmicMilestones(event.date);
            cosmicOnes.forEach(cm => {
                if (!milestones.some(m => m.unit === cm.unit && m.value === cm.value)) {
                    milestones.push(cm);
                }
            });
        }

        // Score and sort by combined roundness + proximity
        milestones.forEach(m => {
            // Cosmic milestones get a fixed score (not based on roundnessScore of small return numbers)
            const rScore = m.isCosmic
                ? (m.isSaturnReturn ? 60 : (m.isVerySpecialCosmic ? 20 : 5))
                : roundnessScore(m.value);
            const daysAway = m.timeUntil / (24 * 60 * 60 * 1000);
            // Proximity score: closer = higher (max ~100 for today, ~0 for 365d away)
            const pScore = Math.max(0, 100 - daysAway * 0.27);
            m._score = rScore * 0.5 + pScore * 0.5;
        });
        milestones.sort((a, b) => b._score - a._score);

        // Apply filtering
        const filtered = filterNearbyMilestones(milestones);

        // Combine: birthdays first, then scored special numbers
        const allForPerson = [...yearlyMilestones, ...filtered];

        allForPerson.forEach(m => {
            m.eventName = m.eventName || event.name;
            m.eventId = m.eventId || event.id;
            m.eventType = m.eventType || event.type || 'birthday';
            m.fullDescription = m.fullDescription || getEventMilestoneDescription(event, m);
            m.globalIdx = globalIdx;
            allMilestonesFlat.push(m);
            globalIdx++;
        });

        html += `<div class="milestone-column">`;
        html += `<div class="column-header">${escapeHtml(event.name)}</div>`;
        html += `<div class="column-milestones" id="col-milestones-${eventIdx}">`;

        // Collect footnotes for this column
        const footnotes = [];
        const footnoteMap = {};

        if (allForPerson.length === 0) {
            html += '<p class="empty-text">No milestones found.</p>';
        } else {
            allForPerson.forEach((m, i) => {
                const hiddenClass = i >= DEFAULT_SHOW ? 'column-milestone-hidden' : '';
                const selected = selectedMilestone === m.globalIdx ? 'selected-for-share' : '';
                const timeUntilStr = formatTimeDistance(m.timeUntil);
                const dateStr = formatDateShort(m.date);

                if (m.isBirthday) {
                    html += `
                        <div class="column-milestone birthday-milestone ${hiddenClass} ${selected}"
                             onclick="selectMilestoneForShare(${m.globalIdx})">
                            <div class="cm-line1"><span class="cm-num">${m.description}</span><button class="quick-share-btn" onclick="event.stopPropagation(); quickShare(${m.globalIdx})" title="Share">&#8599;</button></div>
                            <div class="cm-line2"><span class="cm-alt-a">${timeUntilStr} · ${dateStr}</span></div>
                        </div>
                    `;
                } else if (m.isCosmic) {
                    // Cosmic milestone — planetary return
                    const cosmicSpecial = m.isVerySpecialCosmic || m.isSaturnReturn;
                    const cosmicLabel = (m.value === 1 ? '' : ordinal(m.value) + ' ') + m.unitName;
                    html += `
                        <div class="column-milestone cosmic-milestone ${cosmicSpecial ? 'very-special' : ''} ${m.isSaturnReturn ? 'saturn-return' : ''} ${hiddenClass} ${selected}"
                             onclick="selectMilestoneForShare(${m.globalIdx})">
                            <div class="cm-line1"><span class="cm-cosmic-icon">\u2731</span> <span class="cm-num">${cosmicLabel}</span><button class="quick-share-btn" onclick="event.stopPropagation(); quickShare(${m.globalIdx})" title="Share">&#8599;</button></div>
                            <div class="cm-line2">
                                <span class="cm-alt-a">${timeUntilStr} · ${dateStr}</span>
                                <span class="cm-alt-b cm-cosmic-desc">${m.description}</span>
                            </div>
                        </div>
                    `;
                } else {
                    const isVerySpecial = isVerySpecialNumber(m.value);
                    const why = classifyNumber(m.value, appSettings);
                    const whyText = why.length > 0 ? why[0].description : '';

                    // Only explain non-obvious patterns (Fibonacci, 2^n, scientific)
                    const whyType = why.length > 0 ? why[0].type : '';
                    const needsExplanation = ['fibonacci', 'power_of_2', 'scientific'].includes(whyType);

                    let marker = '';
                    let showAlt = '';
                    if (needsExplanation && whyText) {
                        if (!footnoteMap[whyText]) {
                            footnotes.push(whyText);
                            footnoteMap[whyText] = footnotes.length;
                        }
                        marker = '*'.repeat(Math.min(footnoteMap[whyText], 3));
                        showAlt = whyText;
                    }

                    html += `
                        <div class="column-milestone ${isVerySpecial ? 'very-special' : ''} ${m.isBigMilestone ? 'big-milestone' : ''} ${hiddenClass} ${selected}"
                             onclick="selectMilestoneForShare(${m.globalIdx})">
                            <div class="cm-line1"><span class="cm-num">${m.value.toLocaleString()}</span> <span class="cm-unit">${m.unitName}</span>${marker ? `<span class="cm-marker">${marker}</span>` : ''}<button class="quick-share-btn" onclick="event.stopPropagation(); quickShare(${m.globalIdx})" title="Share">&#8599;</button></div>
                            <div class="cm-line2">
                                <span class="cm-alt-a">${timeUntilStr} · ${dateStr}</span>
                                ${showAlt ? `<span class="cm-alt-b">${showAlt}</span>` : ''}
                            </div>
                        </div>
                    `;
                }
            });

            // Show more button
            if (allForPerson.length > DEFAULT_SHOW) {
                const moreCount = allForPerson.length - DEFAULT_SHOW;
                html += `
                    <button class="btn-show-more" onclick="toggleColumnExpand(${eventIdx}, this)">
                        ${moreCount} ${(typeof I18N!=='undefined') ? I18N.t('beyond_horizon') : 'beyond the horizon...'}
                    </button>
                `;
            }

            // Footnotes legend
            if (footnotes.length > 0) {
                html += '<div class="cm-footnotes">';
                footnotes.forEach((fn, idx) => {
                    html += `<div class="cm-footnote">${'*'.repeat(Math.min(idx + 1, 3))} ${fn}</div>`;
                });
                html += '</div>';
            }
        }

        html += '</div></div>';
    });

    html += '</div>';
    milestonesColumnsEl.innerHTML = html;
}

function toggleColumnExpand(eventIdx, btn) {
    const col = document.getElementById('col-milestones-' + eventIdx);
    if (!col) return;
    const hidden = col.querySelectorAll('.column-milestone-hidden');
    if (hidden.length > 0) {
        hidden.forEach(el => el.classList.remove('column-milestone-hidden'));
        btn.textContent = (typeof I18N!=='undefined') ? I18N.t('closer_view') : 'closer view';
    } else {
        const items = col.querySelectorAll('.column-milestone');
        items.forEach((el, i) => { if (i >= 7) el.classList.add('column-milestone-hidden'); });
        btn.textContent = `${items.length - 7} ${(typeof I18N!=='undefined') ? I18N.t('beyond_horizon') : 'beyond the horizon...'}`;
    }
}

function renderSinglePersonMilestones() {
    allMilestonesFlat = [];

    const event = appData.events.find(e => e.id === selectedPersonIds[0]);
    if (!event) return;

    const milestones = findAllUpcomingMilestones(event.date, 30, 365, appSettings);
    milestones.sort((a, b) => a.date.getTime() - b.date.getTime());
    milestones.forEach(m => {
        m.eventName = event.name;
        m.eventId = event.id;
        m.eventType = event.type || 'birthday';
        m.fullDescription = getEventMilestoneDescription(event, m);
    });
    allMilestonesFlat = milestones;

    // Apply filtering
    const filteredMilestones = filterNearbyMilestones(allMilestonesFlat);

    let html = '<div class="milestones-vertical-list">';

    filteredMilestones.slice(0, 30).forEach((m, idx) => {
        const isVerySpecial = isVerySpecialNumber(m.value);
        const timeUntilStr = formatTimeDistance(m.timeUntil);
        const dateStr = formatDateWithTime(m.date);

        html += `
            <div class="milestone-item-vertical ${isVerySpecial ? 'very-special' : ''} ${selectedMilestone === idx ? 'selected-for-share' : ''}"
                 onclick="selectMilestoneForShare(${idx})">
                <div class="miv-left">
                    <div class="miv-value">${m.value.toLocaleString()}</div>
                    <div class="miv-unit">${m.unitName}</div>
                </div>
                <div class="miv-right">
                    <div class="miv-when">${dateStr}</div>
                    <div class="miv-countdown">${timeUntilStr}</div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    milestonesColumnsEl.innerHTML = html;
}

function renderCombinedPersonMilestones() {
    allMilestonesFlat = [];

    // Get the selected events
    const selectedEvents = appData.events.filter(e => selectedPersonIds.includes(e.id));

    if (selectedEvents.length < 2) return;

    // Get combined sum milestones (like the Combined tab)
    const names = selectedEvents.map(e => e.name).join(' + ');
    const wording = getCombinedMilestoneWording(selectedEvents);

    // Find sum milestones - look 5 years ahead for big numbers
    const sumMilestones = findSumMilestonesForEvents(selectedEvents, 50, 1825, appSettings);

    sumMilestones.forEach(m => {
        m.eventName = names;
        m.eventId = 'combined';
        m.comboDescription = getHappySumDescription(m.value, m.unit, wording);
    });

    allMilestonesFlat = sumMilestones;

    // Sort by date
    allMilestonesFlat.sort((a, b) => a.date.getTime() - b.date.getTime());

    let html = '<div class="milestones-vertical-list">';

    if (allMilestonesFlat.length === 0) {
        html += '<p class="empty-text">No combined milestones found.</p>';
    } else {
        allMilestonesFlat.slice(0, 30).forEach((m, idx) => {
            const isVerySpecial = isVerySpecialNumber(m.value);
            const timeUntilStr = formatTimeDistance(m.timeUntil);
            const dateStr = formatDateWithTime(m.date);

            html += `
                <div class="milestone-item-vertical combined ${isVerySpecial ? 'very-special' : ''} ${selectedMilestone === idx ? 'selected-for-share' : ''}"
                     onclick="selectMilestoneForShare(${idx})">
                    <div class="miv-left">
                        <div class="miv-value">${m.value.toLocaleString()}</div>
                        <div class="miv-unit">${m.unitName}</div>
                    </div>
                    <div class="miv-right">
                        <div class="miv-combo-desc">${m.comboDescription || ''}</div>
                        <div class="miv-when">${dateStr}</div>
                        <div class="miv-countdown">${timeUntilStr}</div>
                    </div>
                </div>
            `;
        });
    }

    html += '</div>';
    milestonesColumnsEl.innerHTML = html;
}

// Filter nearby milestones if a very special one is close
function filterNearbyMilestones(milestones) {
    if (!milestones || milestones.length === 0) return milestones;

    // Special unit types that shouldn't be filtered by proximity
    const specialUnits = ['ratio', 'percent', 'multiple', 'halflife', 'crossover', 'double', 'gap_multiple',
        'lunar_return', 'mercury_return', 'venus_return', 'mars_return',
        'jupiter_return', 'saturn_return', 'chiron_return'];

    // Group milestones by unit
    const byUnit = {};
    milestones.forEach(m => {
        if (!byUnit[m.unit]) byUnit[m.unit] = [];
        byUnit[m.unit].push(m);
    });

    const filtered = [];

    for (const unit of Object.keys(byUnit)) {
        const unitMilestones = byUnit[unit];

        // For special unit types, keep all (these are already selective)
        if (specialUnits.includes(unit)) {
            filtered.push(...unitMilestones);
            continue;
        }

        // Find very special numbers in this unit
        const verySpecialValues = unitMilestones
            .filter(m => isVerySpecialNumber(m.value))
            .map(m => m.value);

        for (const m of unitMilestones) {
            const isVerySpecial = isVerySpecialNumber(m.value);

            if (isVerySpecial) {
                // Always keep very special milestones
                filtered.push(m);
            } else {
                // Check if this milestone is too close to a very special one
                let tooClose = false;
                for (const specialVal of verySpecialValues) {
                    const threshold = getFilterThreshold(specialVal, unit);
                    if (Math.abs(m.value - specialVal) <= threshold) {
                        tooClose = true;
                        break;
                    }
                }
                if (!tooClose) {
                    filtered.push(m);
                }
            }
        }
    }

    // Re-sort by date
    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Get the threshold for filtering nearby milestones based on the special number's magnitude
function getFilterThreshold(specialValue, unit) {
    // For round thousands, filter out numbers within ~2% of the value
    if (specialValue >= 10000) return Math.ceil(specialValue * 0.015);
    if (specialValue >= 1000) return Math.ceil(specialValue * 0.02);
    return 50; // For smaller numbers, filter within 50
}

function renderColumnMilestones(milestones, eventId) {
    if (!milestones || milestones.length === 0) {
        return '<p class="empty-text small">No upcoming milestones</p>';
    }

    // Apply filtering to remove nearby milestones around very special ones
    const filteredMilestones = filterNearbyMilestones(milestones);

    return filteredMilestones.slice(0, 15).map((m, idx) => {
        const isVerySpecial = isVerySpecialNumber(m.value);
        const globalIdx = allMilestonesFlat.findIndex(fm =>
            fm.value === m.value && fm.unit === m.unit && fm.eventId === eventId
        );

        // Format date and time together nicely
        const timeUntilStr = formatTimeDistance(m.timeUntil);
        const dateStr = formatDateWithTime(m.date);

        return `
            <div class="column-milestone ${isVerySpecial ? 'very-special' : ''} ${selectedMilestone === globalIdx ? 'selected-for-share' : ''}"
                 onclick="selectMilestoneForShare(${globalIdx})">
                <div class="cm-main">
                    <span class="cm-value">${m.value.toLocaleString()}</span>
                    <span class="cm-unit">${m.unitName}</span>
                </div>
                <div class="cm-when-compact">${dateStr} (${timeUntilStr})</div>
            </div>
        `;
    }).join('');
}

// Format date compactly
function formatDateWithTime(date) {
    const now = new Date();
    const daysDiff = Math.floor((date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    // Always show year for clarity
    if (daysDiff <= 7) {
        return date.toLocaleDateString(getAppLocale(), {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    return date.toLocaleDateString(getAppLocale(), {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function isVerySpecialNumber(num) {
    // Special values for ratios, percentages, etc.
    if (num === 50) return true; // 50% is special
    if (num === 2 || num === 3 || num === 5 || num === 10) return true; // Nice round multiples
    // Round thousands (1000, 2000, 5000, etc.)
    if (num >= 1000 && num % 1000 === 0) return true;
    // Powers of 10
    if (num >= 1000 && isPowerOf10(num)) return true;
    // Large repdigits
    if (num >= 10000 && isRepdigit(num)) return true;
    // Million+
    if (num >= 1000000) return true;
    // Asian auspicious — triple+ 8s, key codes
    if ([888, 8888, 9999, 1314, 5201314].includes(num)) return true;
    return false;
}

function isPowerOf10(num) {
    if (num < 10) return false;
    while (num >= 10) {
        if (num % 10 !== 0) return false;
        num = num / 10;
    }
    return num === 1;
}

function isRepdigit(num) {
    const str = String(num);
    return str.length >= 3 && new Set(str).size === 1;
}

function formatDateCompact(date) {
    return date.toLocaleDateString(getAppLocale(), { month: 'short', day: 'numeric' });
}

function findSumMilestonesForEvents(events, maxResults, maxDaysAhead, settings) {
    const milestones = [];
    const now = new Date();
    const maxDateMs = now.getTime() + maxDaysAhead * 24 * 60 * 60 * 1000;
    const numEvents = events.length;
    const eventNames = events.map(e => escapeHtml(e.name)).join(' + ');

    // Check ALL time units including seconds, minutes, hours for big combined numbers!
    for (const unit of ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years']) {
        const unitConfig = TIME_UNITS[unit];
        // Ensure dates are Date objects
        const currentSum = events.reduce((sum, e) => {
            const eventDate = e.date instanceof Date ? e.date : new Date(e.date);
            return sum + calculateAge(eventDate, now, unit);
        }, 0);

        // For combined milestones, look for bigger numbers (multiply by numEvents)
        const maxForUnit = unitConfig.maxReasonable * numEvents;
        const relevantNumbers = getSpecialNumbersUpTo(maxForUnit, settings);

        // Use ALL special numbers - no extra filtering!
        for (const num of relevantNumbers) {
            if (num > currentSum) {
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
                        description: specialInfo.description,
                        comboDescription: `Together: ${num.toLocaleString()} ${unitConfig.plural}!`,
                        contributingEvents: events.map(e => e.name),
                        timeUntil: milestoneDate.getTime() - now.getTime()
                    });
                }
            }
        }
    }

    return milestones.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, maxResults);
}

// Check if a number is special enough for combined milestones
function isCombinedSpecialNumber(num, unit) {
    const str = String(num);

    // Big round billions (1B, 2B, 3B, etc.)
    if (num >= 1000000000 && num % 1000000000 === 0) return true;

    // Hundred millions (100M, 200M, 500M, etc.)
    if (num >= 100000000 && num % 100000000 === 0) return true;

    // Quarter and half billions (250M, 500M, 750M, 1.5B, 2.5B, etc.)
    if (num >= 250000000 && num % 250000000 === 0) return true;

    // Large repdigits (11111111, 222222222, 1111111111, etc.)
    if (str.length >= 8 && new Set(str).size === 1) return true;
    if (str.length >= 6 && new Set(str).size === 1) return true;

    // Large round millions (1M, 2M, 5M, 10M, etc.)
    if (num >= 1000000 && num % 1000000 === 0) return true;

    // Half millions (500k, 1.5M, 2.5M, etc.)
    if (num >= 500000 && num % 500000 === 0) return true;

    // For smaller units (days, weeks, months, years), be more selective
    if (unit === 'years' || unit === 'months') {
        // Round hundreds for years/months
        if (num >= 100 && num % 100 === 0) return true;
        if (num >= 50 && num % 50 === 0) return true;
        // Round tens for smaller combined values
        if (num >= 25 && num % 25 === 0) return true;
        // Special repdigits (11, 22, 33, 111, 222, etc.)
        if (str.length >= 2 && new Set(str).size === 1) return true;
    }

    if (unit === 'weeks' || unit === 'days') {
        // Round thousands
        if (num >= 1000 && num % 1000 === 0) return true;
        if (num >= 500 && num % 500 === 0 && num >= 1000) return true;
        // Nice repdigits (1111, 2222, 5555, etc.)
        if (str.length >= 4 && new Set(str).size === 1) return true;
        // Smaller repdigits (111, 222, 333)
        if (str.length >= 3 && new Set(str).size === 1) return true;
    }

    if (unit === 'hours') {
        // Round thousands and ten thousands for hours
        if (num >= 1000 && num % 1000 === 0) return true;
        if (num >= 10000 && num % 10000 === 0) return true;
        if (num >= 50000 && num % 50000 === 0) return true;
        // Repdigits
        if (str.length >= 4 && new Set(str).size === 1) return true;
    }

    if (unit === 'minutes') {
        // Round ten thousands and hundred thousands for minutes
        if (num >= 10000 && num % 10000 === 0) return true;
        if (num >= 100000 && num % 100000 === 0) return true;
        if (num >= 500000 && num % 500000 === 0) return true;
        // Repdigits
        if (str.length >= 5 && new Set(str).size === 1) return true;
        if (str.length >= 4 && new Set(str).size === 1) return true;
    }

    if (unit === 'seconds') {
        // Big round numbers for seconds
        if (num >= 1000000 && num % 1000000 === 0) return true;
        if (num >= 10000000 && num % 10000000 === 0) return true;
        if (num >= 50000000 && num % 50000000 === 0) return true;
        // Big repdigits
        if (str.length >= 7 && new Set(str).size === 1) return true;
    }

    // Large palindromes (1234321, 12321, etc.)
    if (str.length >= 6 && str === str.split('').reverse().join('')) return true;

    // Smaller palindromes for combined
    if (str.length >= 5 && str === str.split('').reverse().join('')) return true;

    // Powers of 10
    if (isPowerOf10(num) && num >= 1000) return true;

    return false;
}

// ============================================================
// SHARE FUNCTIONALITY
// ============================================================

function selectMilestoneForShare(idx) {
    selectedMilestone = idx;

    // Increment share hint counter (hint shown until 3 selections)
    const hintCount = parseInt(localStorage.getItem('hm_share_hint_count') || '0');
    localStorage.setItem('hm_share_hint_count', String(hintCount + 1));

    updateSharePreview();
    const m = allMilestonesFlat[idx];
    // Update gift suggestions and card preview
    if (typeof renderGiftSuggestions === 'function') renderGiftSuggestions(m);
    if (typeof renderCardPreview === 'function') renderCardPreview(m, 'cardPreview');
    renderMilestonesTab();

    // Add selection pulse animation to the newly selected element
    requestAnimationFrame(() => {
        const selectedEl = document.querySelector('.column-milestone.selected-for-share');
        if (selectedEl) {
            selectedEl.classList.remove('selected-for-share-anim');
            // Force reflow to restart animation
            void selectedEl.offsetWidth;
            selectedEl.classList.add('selected-for-share-anim');
        }
    });

    // Auto-scroll to share section
    const shareCard = document.querySelector('.share-card-priority');
    if (shareCard) setTimeout(() => shareCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
}

function updateSharePreview() {
    if (allMilestonesFlat.length === 0) {
        sharePreviewEl.innerHTML = '<p class="empty-text small">No milestones to share yet.</p>';
        return;
    }

    // Default to first (nearest) milestone if none selected
    const idx = selectedMilestone !== null ? selectedMilestone : 0;
    const m = allMilestonesFlat[idx];

    if (!m) {
        sharePreviewEl.innerHTML = '<p class="empty-text small">Select a milestone to share.</p>';
        return;
    }

    const message = generateShareMessage(m);
    // Make happymoments.app URLs clickable in the preview
    const messageHtml = message.replace(
        /(happymoments\.app\/?[^\s]*)/g,
        '<a href="https://$1" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline;">$1</a>'
    );
    const hintCount = parseInt(localStorage.getItem('hm_share_hint_count') || '0');
    const hintHtml = hintCount < 3 ? '<p class="share-hint">Click any milestone above to select it for sharing</p>' : '';
    sharePreviewEl.innerHTML = `
        <div class="share-message-preview">
            <p>${messageHtml}</p>
        </div>
        ${hintHtml}
    `;

    // Also show/hide the static share hint in the card
    const shareHintEl = document.getElementById('shareHint');
    if (shareHintEl) {
        shareHintEl.style.display = hintCount < 3 ? '' : 'none';
    }
}

function pickShareTemplate(category) {
    if (typeof SHARE_MESSAGES === 'undefined') return null;

    // Try locale-specific messages first
    // Handle both hyphen (pt-BR) and underscore (pt_BR) locale formats
    const rawLocale = getAppLocale();
    const locale = rawLocale.split('-')[0]; // 'pt-BR' -> 'pt'
    const baseLang = locale.split('_')[0]; // 'pt_BR' -> 'pt'
    if (locale !== 'en' && typeof SHARE_MESSAGES_I18N !== 'undefined') {
        const localeMessages = SHARE_MESSAGES_I18N[locale] || SHARE_MESSAGES_I18N[baseLang];
        if (localeMessages) {
            const templates = localeMessages[category] || localeMessages.generic || [];
            if (templates.length > 0) {
                return templates[Math.floor(Math.random() * templates.length)];
            }
        }
    }

    // Fall back to English
    const templates = SHARE_MESSAGES[category] || SHARE_MESSAGES.generic || [];
    if (templates.length === 0) return null;
    return templates[Math.floor(Math.random() * templates.length)];
}

function fillShareTemplate(template, m) {
    const dateStr = m.date.toLocaleDateString(getAppLocale(), { weekday: 'long', month: 'long', day: 'numeric' });
    const countdown = formatTimeDistance(m.timeUntil);
    const name = m.eventName || 'someone special';
    // For cosmic milestones, format value+unit as a single label
    let val, unit, why;
    if (m.isCosmic) {
        const cosmicOrd = typeof ordinal === 'function' ? ordinal(m.value) : m.value;
        val = (m.value === 1 ? '' : cosmicOrd + ' ') + m.unitName;
        unit = '';
        why = m.description || 'a cosmic cycle milestone';
    } else {
        val = m.value.toLocaleString();
        unit = m.unitName;
        why = m.description || m.type || 'special';
    }

    // If template uses {value} but not {unit}, combine them so unit is never lost
    const valueWithUnit = (unit && !template.includes('{unit}')) ? `${val} ${unit}` : val;

    let filled = template
        .replace(/\{name\}/g, name)
        .replace(/\{value\}/g, valueWithUnit)
        .replace(/\{unit\}/g, unit)
        .replace(/\{date\}/g, dateStr)
        .replace(/\{countdown\}/g, countdown)
        .replace(/\{why\}/g, why);

    // Ensure the message communicates WHEN it will happen
    // If template doesn't mention date/countdown, append it
    if (!template.includes('{date}') && !template.includes('{countdown}')) {
        const locale = getAppLocale().split('-')[0];
        const baseLang = locale.split('_')[0];
        const fallbackTpl = (typeof SHARE_DATE_FALLBACK_I18N !== 'undefined' && (SHARE_DATE_FALLBACK_I18N[locale] || SHARE_DATE_FALLBACK_I18N[baseLang]))
            ? (SHARE_DATE_FALLBACK_I18N[locale] || SHARE_DATE_FALLBACK_I18N[baseLang])
            : ' On {date} \u2014 {countdown} from now!';
        filled += fallbackTpl.replace(/\{date\}/g, dateStr).replace(/\{countdown\}/g, countdown);
    }

    return filled;
}

function getShareCategory(m) {
    if (m.isBirthday) return 'birthday';
    if (m.isCosmic) return 'cosmic';
    if (m.eventId === 'combined_sum' || m.eventName === 'Combined Sum') return 'combined';
    if (m.eventId === 'combined_ratio' || m.type === 'ratio') return 'ratio';
    // Map milestone type to message category
    const typeMap = {
        'power_of_10': 'round', 'round': 'round',
        'repdigit': 'repdigit', 'palindrome': 'palindrome',
        'fibonacci': 'fibonacci', 'power_of_2': 'power_of_2',
        'scientific': 'scientific', 'sequential': 'sequential',
        'alternating': 'alternating',
        'cosmic': 'cosmic'
    };
    return typeMap[m.type] || 'generic';
}

const APP_SHARE_LINK_DEFAULT = '\n\nDiscover your special numbers \u2192 https://happymoments.app';

function getAppShareLink(milestone) {
    const locale = getAppLocale().split('-')[0];
    const baseLang = locale.split('_')[0];
    let linkText;
    if (typeof APP_SHARE_LINK_I18N !== 'undefined' && (APP_SHARE_LINK_I18N[locale] || APP_SHARE_LINK_I18N[baseLang])) {
        linkText = APP_SHARE_LINK_I18N[locale] || APP_SHARE_LINK_I18N[baseLang];
    } else {
        linkText = APP_SHARE_LINK_DEFAULT;
    }

    // Generate personalized deep link if milestone has event info
    if (milestone && milestone.eventName && milestone.eventId) {
        const event = appData.events.find(e => e.id === milestone.eventId);
        if (event && event.date) {
            const dateStr = event.date instanceof Date
                ? event.date.toISOString().split('T')[0]
                : String(event.date).split('T')[0];
            const params = new URLSearchParams({
                n: event.name,
                d: dateStr,
                hl: locale
            });
            return linkText.replace('https://happymoments.app', `https://happymoments.app/?${params.toString()}`);
        }
    }
    return linkText;
}

// Generate deep link URL for a specific event
function getDeepLinkUrl(event) {
    if (!event) return 'https://happymoments.app';
    const dateStr = event.date instanceof Date
        ? event.date.toISOString().split('T')[0]
        : String(event.date).split('T')[0];
    const locale = (typeof getAppLocale === 'function') ? getAppLocale().split('-')[0] : 'en';
    const params = new URLSearchParams({ n: event.name, d: dateStr, hl: locale });
    return `https://happymoments.app/?${params.toString()}`;
}

function generateChallengeMessage(m) {
    if (!m) return null;
    const val = m.value.toLocaleString();
    const unit = m.unitName || '';
    const dateStr = m.date.toLocaleDateString(getAppLocale(), { month: 'long', day: 'numeric', year: 'numeric' });
    const name = m.eventName || '';

    const link = 'https://happymoments.app';
    const templates = [
        `I just discovered something fun — ${name} will be ${val} ${unit} on${dateStr}! Have you checked YOUR special numbers? ${link}`,
        `Fun fact: ${name} hits ${val} ${unit} on ${dateStr}! Want to find your own special number milestones? ${link}`,
        `${val} ${unit} — that's ${name}'s next milestone on ${dateStr}! Curious about yours? ${link}`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
}

function handleChallengeFriends() {
    const idx = selectedMilestone !== null ? selectedMilestone : 0;
    const m = allMilestonesFlat[idx];
    if (!m) { showToast('Select a milestone first', 'info'); return; }

    const message = generateChallengeMessage(m);
    if (navigator.share) {
        navigator.share({ title: 'HappyMoments', text: message }).catch(() => {});
    } else {
        navigator.clipboard.writeText(message).then(() => {
            showToast('Copied! Share it with your friends.', 'success');
        }).catch(() => {
            showToast(message, 'info', 8000);
        });
    }
    _track('challenge_share', { value: m.value, unit: m.unit });
}

function handleChallengeGroup() {
    // Get user's own milestone to use as social proof
    const idx = selectedMilestone !== null ? selectedMilestone : 0;
    const m = allMilestonesFlat[idx];

    const locale = (typeof getAppLocale === 'function') ? getAppLocale().split('-')[0] : 'en';
    const link = m ? getDeepLinkUrl(appData.events.find(e => e.id === m.eventId) || appData.events[0]) : 'https://happymoments.app';

    let message;
    if (m) {
        const val = m.value.toLocaleString();
        const unit = m.unitName || '';
        const name = m.eventName || '';
        const dateStr = m.date.toLocaleDateString(getAppLocale(), { month: 'long', day: 'numeric', year: 'numeric' });
        message = `Fun discovery: ${name} will be ${val} ${unit} on ${dateStr}! Who else wants to find their special numbers? ${link}`;
    } else {
        message = `I just found some fun number milestones — want to discover yours? Enter your birthday and see what comes up! ${link}`;
    }

    if (navigator.share) {
        navigator.share({ title: 'HappyMoments', text: message }).catch(() => {});
    } else {
        navigator.clipboard.writeText(message).then(() => {
            showToast('Copied! Share it with your group.', 'success');
        }).catch(() => {});
    }
    _track('group_challenge', { locale });
}

function quickShare(idx) {
    const m = allMilestonesFlat[idx];
    if (!m) return;
    const message = generateShareMessage(m);
    if (navigator.share) {
        navigator.share({ title: 'HappyMoment', text: message }).catch(() => {});
    } else {
        navigator.clipboard.writeText(message).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(() => {});
    }
    _track('quick_share', { value: m.value, unit: m.unit });
    promptShareApp();
}

function shareAppLink() {
    const text = 'Discover when you turn 1 billion seconds, 10,000 days, or hit a special number milestone. Track milestones for everyone you care about!\n\nhttps://happymoments.app';
    if (navigator.share) {
        navigator.share({ title: 'HappyMoments', text }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Link copied! Share it with your friends.', 'success');
        }).catch(() => {
            showToast('Share this link: https://happymoments.app', 'info', 5000);
        });
    }
    _track('share_app', { source: 'settings' });
}

function submitFeedback() {
    const text = document.getElementById('feedbackText')?.value?.trim();
    if (!text) {
        showToast('Please write something first.', 'info');
        return;
    }
    // Send feedback as analytics event (stored in D1)
    _track('user_feedback', {
        text: text.substring(0, 500),
        locale: typeof getAppLocale === 'function' ? getAppLocale() : 'en',
        events: appData.events.length,
        user: (typeof HM_AUTH !== 'undefined' && HM_AUTH.isLoggedIn()) ? HM_AUTH.getUserEmail() : 'anonymous'
    });
    document.getElementById('feedbackText').value = '';
    showToast('Thank you! Your feedback helps us improve.', 'success');
}

let _shareAppPromptCount = 0;
function promptShareApp() {
    _shareAppPromptCount++;
    // Show after every 2nd share action, max 3 times per session
    if (_shareAppPromptCount % 2 !== 0) return;
    if (_shareAppPromptCount > 6) return;

    setTimeout(() => {
        showToast('Know someone who\u2019d love this? The app link is included in your message!', 'info', 4000);
    }, 1500);
}

function generateShareMessage(m) {
    const category = getShareCategory(m);
    const template = pickShareTemplate(category);

    let msg;
    if (template) {
        msg = fillShareTemplate(template, m);
    } else {
        // Fallback if no templates loaded
        const dateStr = m.date.toLocaleDateString(getAppLocale(), { weekday: 'long', month: 'long', day: 'numeric' });
        const countdown = formatTimeDistance(m.timeUntil);
        const val = m.value.toLocaleString();

        if (m.isBirthday) {
            msg = m.fullDescription.replace(/[🎂🎉]\s*/g, '') + ` on ${dateStr} (${countdown} from now)!`;
        } else {
            msg = `${m.eventName} will be ${val} ${m.unitName} on${dateStr} — just ${countdown} away!`;
        }
    }
    return msg + getAppShareLink(m);
}

function handleCopyShare() {
    const idx = selectedMilestone !== null ? selectedMilestone : 0;
    const m = allMilestonesFlat[idx];
    if (!m) return;

    const message = generateShareMessage(m);
    navigator.clipboard.writeText(message).then(() => {
        copyShareBtn.textContent = 'Copied!';
        showToast('Copied to clipboard!', 'success');
        setTimeout(() => {
            copyShareBtn.textContent = 'Copy Message';
        }, 2000);
        promptShareApp();
    }).catch(() => {
        showToast('Could not copy. Please select the text manually.', 'error');
    });
}

function handleNativeShare() {
    const idx = selectedMilestone !== null ? selectedMilestone : 0;
    const m = allMilestonesFlat[idx];
    if (!m) return;
    const message = generateShareMessage(m);
    navigator.share({ title: 'HappyMoment', text: message }).catch(() => {});
}

function handleNativeCombinedShare() {
    const idx = selectedCombinedMilestone !== null ? selectedCombinedMilestone : 0;
    const m = allCombinedMilestonesFlat[idx];
    if (!m) return;
    const message = generateCombinedShareMessage(m);
    navigator.share({ title: 'HappyMoment', text: message }).catch(() => {});
}

function handleWhatsAppShare() {
    const idx = selectedMilestone !== null ? selectedMilestone : 0;
    const m = allMilestonesFlat[idx];
    if (!m) return;

    const message = generateShareMessage(m);
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    _track('share_whatsapp', { value: m.value, unit: m.unitName });
    promptShareApp();
}

function handleViberShare() {
    const idx = selectedMilestone !== null ? selectedMilestone : 0;
    const m = allMilestonesFlat[idx];
    if (!m) return;

    const message = generateShareMessage(m);
    const encoded = encodeURIComponent(message);
    window.open(`viber://forward?text=${encoded}`, '_blank');
    _track('share_viber', { value: m.value, unit: m.unitName });
}

function handleEmailShare() {
    const idx = selectedMilestone !== null ? selectedMilestone : 0;
    const m = allMilestonesFlat[idx];
    if (!m) return;

    const message = generateShareMessage(m);
    const subject = encodeURIComponent('A special moment to celebrate!');
    const body = encodeURIComponent(message);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    _track('share_email', { value: m.value, unit: m.unitName });
}

// Combined milestone sharing
function selectCombinedMilestoneForShare(idx) {
    selectedCombinedMilestone = idx;
    updateCombinedSharePreview();
    renderCombinedTab();
}

function updateCombinedSharePreview() {
    if (allCombinedMilestonesFlat.length === 0) {
        combinedSharePreviewEl.innerHTML = '<p class="empty-text small">No combined milestones to share yet.</p>';
        return;
    }

    const idx = selectedCombinedMilestone !== null ? selectedCombinedMilestone : 0;
    const m = allCombinedMilestonesFlat[idx];

    if (!m) {
        combinedSharePreviewEl.innerHTML = '<p class="empty-text small">Select a milestone to share.</p>';
        return;
    }

    const message = generateCombinedShareMessage(m);
    // Make happymoments.app URLs clickable in the preview
    const messageHtml = message.replace(
        /(happymoments\.app\/?[^\s]*)/g,
        '<a href="https://$1" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline;">$1</a>'
    );
    combinedSharePreviewEl.innerHTML = `
        <div class="share-message-preview">
            <p>${messageHtml}</p>
        </div>
        <p class="share-hint">Click any combined milestone above to select it for sharing</p>
    `;
}

function generateCombinedShareMessage(m) {
    const dateStr = m.date.toLocaleDateString(getAppLocale(), {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const description = m.comboDescription || m.description || `${m.value.toLocaleString()} ${m.unitName}`;

    return `Hey! I discovered something amazing - ${description} on ${dateStr}! That's ${formatTimeDistance(m.timeUntil)} from now. Let's celebrate this special moment together!` + getAppShareLink(m);
}

function handleCopyCombinedShare() {
    const idx = selectedCombinedMilestone !== null ? selectedCombinedMilestone : 0;
    const m = allCombinedMilestonesFlat[idx];
    if (!m) return;

    const message = generateCombinedShareMessage(m);
    navigator.clipboard.writeText(message).then(() => {
        copyCombinedShareBtn.textContent = 'Copied!';
        showToast('Copied to clipboard!', 'success');
        setTimeout(() => {
            copyCombinedShareBtn.textContent = 'Copy Message';
        }, 2000);
    }).catch(() => {
        showToast('Could not copy. Please select the text manually.', 'error');
    });
}

function handleWhatsAppCombinedShare() {
    const idx = selectedCombinedMilestone !== null ? selectedCombinedMilestone : 0;
    const m = allCombinedMilestonesFlat[idx];
    if (!m) return;

    const message = generateCombinedShareMessage(m);
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    _track('share_whatsapp', { type: 'combined', value: m.value, unit: m.unitName });
}

function handleViberCombinedShare() {
    const idx = selectedCombinedMilestone !== null ? selectedCombinedMilestone : 0;
    const m = allCombinedMilestonesFlat[idx];
    if (!m) return;

    const message = generateCombinedShareMessage(m);
    const encoded = encodeURIComponent(message);
    window.open(`viber://forward?text=${encoded}`, '_blank');
    _track('share_viber', { type: 'combined', value: m.value, unit: m.unitName });
}

function handleEmailCombinedShare() {
    const idx = selectedCombinedMilestone !== null ? selectedCombinedMilestone : 0;
    const m = allCombinedMilestonesFlat[idx];
    if (!m) return;

    const message = generateCombinedShareMessage(m);
    const subject = encodeURIComponent('A special moment to celebrate!');
    const body = encodeURIComponent(message);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    _track('share_email', { type: 'combined', value: m.value, unit: m.unitName });
}

// ============================================================
// CALENDAR EXPORT
// ============================================================

function getCalendarEventDetails(milestone) {
    if (!milestone) return null;

    const d = milestone.date;
    const title = milestone.isBirthday
        ? milestone.fullDescription.replace(/[🎂🎉]\s*/g, '')
        : `HappyMoment: ${milestone.value.toLocaleString()} ${milestone.unitName}` +
          (milestone.eventName ? ` — ${milestone.eventName}` : '');

    const description = milestone.fullDescription || generateShareMessage(milestone);

    // Format as all-day event date string: YYYYMMDD
    const pad = n => String(n).padStart(2, '0');
    const startDate = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);
    const endDate = `${nextDay.getFullYear()}${pad(nextDay.getMonth() + 1)}${pad(nextDay.getDate())}`;

    return { title, description, startDate, endDate };
}

function openGoogleCalendar(milestone) {
    const ev = getCalendarEventDetails(milestone);
    if (!ev) { showToast('Select a milestone first', 'error'); return; }

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: ev.title,
        dates: `${ev.startDate}/${ev.endDate}`,
        details: ev.description
    });
    window.open(`https://calendar.google.com/calendar/render?${params}`, '_blank');
}

function openOutlookCalendar(milestone) {
    const ev = getCalendarEventDetails(milestone);
    if (!ev) { showToast('Select a milestone first', 'error'); return; }

    const d = milestone.date;
    const iso = d.toISOString().split('T')[0];
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);
    const isoEnd = nextDay.toISOString().split('T')[0];

    const params = new URLSearchParams({
        path: '/calendar/action/compose',
        rru: 'addevent',
        subject: ev.title,
        startdt: iso,
        enddt: isoEnd,
        body: ev.description,
        allday: 'true'
    });
    window.open(`https://outlook.live.com/calendar/0/action/compose?${params}`, '_blank');
}

function downloadIcsFile(milestone) {
    const ev = getCalendarEventDetails(milestone);
    if (!ev) { showToast('Select a milestone first', 'error'); return; }

    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//HappyMoments//EN',
        'BEGIN:VEVENT',
        `DTSTART;VALUE=DATE:${ev.startDate}`,
        `DTEND;VALUE=DATE:${ev.endDate}`,
        `DTSTAMP:${stamp}`,
        `UID:happymoments-${ev.startDate}-${Date.now()}@app`,
        `SUMMARY:${ev.title}`,
        `DESCRIPTION:${ev.description.replace(/\n/g, '\\n')}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'happymoment.ics';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Calendar file downloaded', 'success');
}

// Individual milestone calendar handlers
function handleGoogleCal() {
    const idx = selectedMilestone !== null ? selectedMilestone : 0;
    openGoogleCalendar(allMilestonesFlat[idx]);
}
function handleOutlookCal() {
    const idx = selectedMilestone !== null ? selectedMilestone : 0;
    openOutlookCalendar(allMilestonesFlat[idx]);
}
function handleIcsCal() {
    const idx = selectedMilestone !== null ? selectedMilestone : 0;
    downloadIcsFile(allMilestonesFlat[idx]);
}

// Combined milestone calendar handlers
function handleGoogleCalCombined() {
    const idx = selectedCombinedMilestone !== null ? selectedCombinedMilestone : 0;
    openGoogleCalendar(allCombinedMilestonesFlat[idx]);
}
function handleOutlookCalCombined() {
    const idx = selectedCombinedMilestone !== null ? selectedCombinedMilestone : 0;
    openOutlookCalendar(allCombinedMilestonesFlat[idx]);
}
function handleIcsCalCombined() {
    const idx = selectedCombinedMilestone !== null ? selectedCombinedMilestone : 0;
    downloadIcsFile(allCombinedMilestonesFlat[idx]);
}

// ============================================================
// SETTINGS TAB
// ============================================================

function loadSettingsUI() {
    document.querySelectorAll('[data-digit]').forEach(input => {
        const digit = parseInt(input.dataset.digit, 10);
        input.checked = appSettings.luckyDigits.includes(digit);
    });

    document.querySelectorAll('[data-pattern]').forEach(input => {
        input.checked = appSettings.patterns[input.dataset.pattern] || false;
    });

    document.querySelectorAll('[data-constant]').forEach(input => {
        input.checked = appSettings.constants[input.dataset.constant] || false;
    });

    renderCustomNumbers();
}

function renderCustomNumbers() {
    if (appSettings.customNumbers.length === 0) {
        customNumbersListEl.innerHTML = '<p class="empty-text small">No custom numbers.</p>';
        return;
    }

    customNumbersListEl.innerHTML = appSettings.customNumbers.map(num => `
        <span class="custom-number-tag">
            ${num.toLocaleString()}
            <button onclick="removeCustomNumber(${num})">x</button>
        </span>
    `).join('');
}

function handleAddCustomNumber() {
    const value = parseInt(customNumberInput.value, 10);
    if (isNaN(value) || value <= 0) {
        showToast('Please enter a valid positive number', 'error');
        return;
    }
    addCustomNumber(value);
    customNumberInput.value = '';
}

function addCustomNumber(num) {
    if (!appSettings.customNumbers.includes(num)) {
        appSettings.customNumbers.push(num);
        appSettings.customNumbers.sort((a, b) => a - b);
        saveSettings();
        renderCustomNumbers();
    }
}

function removeCustomNumber(num) {
    appSettings.customNumbers = appSettings.customNumbers.filter(n => n !== num);
    saveSettings();
    renderCustomNumbers();
}

function handleSaveSettings() {
    appSettings.luckyDigits = [];
    document.querySelectorAll('[data-digit]:checked').forEach(input => {
        appSettings.luckyDigits.push(parseInt(input.dataset.digit, 10));
    });

    document.querySelectorAll('[data-pattern]').forEach(input => {
        appSettings.patterns[input.dataset.pattern] = input.checked;
    });

    document.querySelectorAll('[data-constant]').forEach(input => {
        appSettings.constants[input.dataset.constant] = input.checked;
    });

    saveSettings();

    // Invalidate special numbers cache
    if (typeof _specialNumbersCache !== 'undefined') {
        _specialNumbersCache = null;
        _specialNumbersCacheKey = null;
    }

    showToast('Settings saved!', 'success');
}

function handleReset() {
    if (!confirm('Delete all data and settings?')) return;

    localStorage.removeItem(STORAGE_KEY_DATA);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);

    // Reset all sets
    allSets = [];
    currentSetId = null;

    appData = {
        events: [],
        connections: {},
        comboTypes: { sum: true, ratio: true, duration: true }
    };
    appSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

    birthNameInput.value = '';
    birthDateInput.value = '';
    ['birthDay', 'birthMonth', 'birthYear'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });

    tabNav.classList.add('hidden');
    setSwitcher.classList.add('hidden');
    eventsTab.classList.add('hidden');
    combinedTab.classList.add('hidden');
    milestonesTab.classList.add('hidden');
    if (settingsTab) settingsTab.classList.add('hidden');
    onboardingSection.classList.remove('hidden');

    // Reset wizard to screen 1
    localStorage.removeItem('hm_onboarded');
    wizardNext(1);

    loadSettingsUI();
}

function handleExportData() {
    const exportData = {
        version: 2,
        exportDate: new Date().toISOString(),
        sets: allSets.map(set => ({
            ...set,
            events: set.events.map(e => ({
                ...e,
                date: (e.date instanceof Date && !isNaN(e.date)) ? e.date.toISOString() : String(e.date || '')
            }))
        })),
        currentSetId: currentSetId,
        appSettings: appSettings
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `happymoments-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
}

function handleImportData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);

            // Basic structure validation
            if (!importedData || typeof importedData !== 'object') {
                showToast('Invalid backup file format', 'error');
                return;
            }

            if (!confirm('This will replace all your current data. Continue?')) {
                return;
            }

            // Validate and sanitize individual events
            function validateEvent(e) {
                if (!e || typeof e !== 'object') return null;
                if (!e.name || typeof e.name !== 'string') return null;
                const d = new Date(e.date);
                if (isNaN(d.getTime())) return null;
                return { ...e, id: e.id || ('event_' + Date.now() + '_' + Math.random().toString(36).slice(2,7)), date: d };
            }

            // Check if new multi-set format (version 2)
            if (importedData.sets && Array.isArray(importedData.sets)) {
                allSets = importedData.sets.map(set => ({
                    ...set,
                    events: (set.events || []).map(validateEvent).filter(Boolean)
                }));
                currentSetId = importedData.currentSetId || (allSets.length > 0 ? allSets[0].id : null);
            }
            // Old format (version 1 or earlier)
            else if (importedData.appData && importedData.appData.events) {
                const events = importedData.appData.events.map(validateEvent).filter(Boolean);
                allSets = [{
                    id: 'set_imported',
                    name: 'Imported Data',
                    events: events,
                    connections: importedData.appData.connections || {},
                    comboTypes: importedData.appData.comboTypes || { sum: true, ratio: true, duration: true }
                }];
                currentSetId = 'set_imported';
            } else {
                showToast('Invalid backup file format', 'error');
                return;
            }

            loadCurrentSet();

            if (importedData.appSettings) {
                appSettings = importedData.appSettings;
            }

            // Save to localStorage
            saveData();
            saveSettings();

            // Refresh UI
            loadSettingsUI();
            updateSetSwitcher();
            renderEventsTab();
            renderMilestonesTab();
            renderCombinedTab();

            if (appData.events.length > 0) {
                showDashboard();
            }

            showToast('Data imported successfully!', 'success');
        } catch (err) {
            showToast('Error importing data: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);

    // Reset input so same file can be imported again
    e.target.value = '';
}

// ============================================================
// EVENT SETS MANAGEMENT (ADVANCED)
// ============================================================

function updateSetSwitcher() {
    // Update the dropdown - always show it, include "+ New Group" option
    let options = allSets.map(set =>
        `<option value="${set.id}" ${set.id === currentSetId ? 'selected' : ''}>${set.name}</option>`
    ).join('');
    options += '<option value="__new__">+ New Group</option>';
    currentSetSelect.innerHTML = options;

    // Hide the set switcher — simplified UI, sets managed in People tab
    setSwitcher.classList.add('hidden');

    // Update sets list in settings
    renderEventSetsList();
}

function renderEventSetsHTML() {
    if (allSets.length === 0) return '<p class="empty-text small">No groups yet.</p>';
    return allSets.map(set => {
        const isCurrent = set.id === currentSetId;
        const eventCount = set.events.length;
        return `
            <div class="event-set-item ${isCurrent ? 'current' : ''}">
                <div class="event-set-info">
                    <strong>${set.name}${isCurrent ? ' (active)' : ''}</strong>
                    <span class="event-set-count">${eventCount} date${eventCount !== 1 ? 's' : ''}</span>
                </div>
                <div class="event-set-actions">
                    <button class="btn-small btn-edit" onclick="renameSet('${set.id}')">Edit</button>
                    ${!isCurrent ? `<button class="btn-small" onclick="switchToSet('${set.id}')">Switch</button>` : ''}
                    ${allSets.length > 1 ? `<button class="btn-danger-small" onclick="deleteSet('${set.id}')">x</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function renderEventSetsList() {
    if (eventSetsListEl) eventSetsListEl.innerHTML = renderEventSetsHTML();
    renderPeopleTabGroups();
}

function renameSet(setId) {
    const set = allSets.find(s => s.id === setId);
    if (!set) return;

    // Use a modal instead of prompt() — works better on mobile
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'renameModal';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Rename Group</h3>
            <div class="form-group">
                <label>Group name</label>
                <input type="text" id="renameInput" value="${escapeHtml(set.name)}" class="checkout-email-input" style="font-size: 1rem;">
            </div>
            <div class="modal-buttons">
                <button class="btn-primary" onclick="confirmRename('${setId}')">Save</button>
                <button class="btn-secondary" onclick="document.getElementById('renameModal').remove()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => {
        const inp = document.getElementById('renameInput');
        if (inp) { inp.focus(); inp.select(); }
    }, 100);
}

function confirmRename(setId) {
    const inp = document.getElementById('renameInput');
    if (!inp) return;
    const newName = inp.value.trim();
    if (newName) {
        const set = allSets.find(s => s.id === setId);
        if (set) {
            set.name = newName;
            saveData();
            renderEventSetsList();
            renderPeopleTabGroups();
            updateSetSwitcher();
            showToast(`Group renamed to "${newName}"`, 'success');
        }
    }
    const modal = document.getElementById('renameModal');
    if (modal) modal.remove();
    // Navigate to Data tab so user can add members
    switchTab('events');
    setTimeout(() => {
        const nameInput = document.getElementById('newEventName');
        if (nameInput) nameInput.scrollIntoView({ behavior: 'smooth' });
    }, 200);
}

function handleSwitchSet() {
    const newSetId = currentSetSelect.value;
    if (newSetId === '__new__') {
        if (!checkGroupLimit()) return;
        // Prompt for new group name
        const name = prompt('Name for the new group:');
        if (name && name.trim()) {
            const newSet = {
                id: 'set_' + Date.now(),
                name: name.trim(),
                events: [],
                connections: {},
                comboTypes: { sum: true, ratio: true, duration: true }
            };
            allSets.push(newSet);
            // Switch to the new group FIRST, then save
            currentSetId = newSet.id;
            loadCurrentSet();
            saveData();
            updateSetSwitcher();
            selectedPersonIds = [];
            renderEventsTab();
            renderPersonFilter();
            renderMilestonesTab();
            showToast('Group "' + name.trim() + '" created. Add people to this group.', 'success');
        } else {
            // Reset dropdown to current
            currentSetSelect.value = currentSetId;
        }
        return;
    }
    if (newSetId !== currentSetId) {
        switchToSet(newSetId);
    }
}

function switchToSet(setId) {
    // Save current set before switching
    saveData();

    currentSetId = setId;
    loadCurrentSet();

    // Default to all people in the group
    _mostSpecialMode = false;
    selectedPersonIds = appData.events.map(e => e.id);

    // Ensure connections are filled for any missing pairs
    fillAllConnections();

    // Refresh all views
    renderEventsTab();
    renderPersonFilter();
    renderMilestonesTab();
    renderCombinedTab();
    renderConnectionMatrix();
    loadComboTypesUI();
    renderEventSetsList();

    // Show toast with group name
    const set = allSets.find(s => s.id === setId);
    if (set) {
        showToast(`Switched to group: ${set.name}`, 'info');
    }
}

function handleAddSet() {
    if (!checkGroupLimit()) return;
    const name = newSetNameInput.value.trim();
    if (!name) {
        showToast('Please enter a name for the new set', 'error');
        return;
    }

    // Create new set
    const newSet = {
        id: 'set_' + Date.now(),
        name: name,
        events: [],
        connections: {},
        comboTypes: { sum: true, ratio: true, duration: true }
    };

    allSets.push(newSet);
    newSetNameInput.value = '';

    // Switch to new set
    currentSetId = newSet.id;
    loadCurrentSet();
    saveData();

    // Show onboarding for new set if no events
    if (appData.events.length === 0) {
        onboardingSection.classList.remove('hidden');
        tabNav.classList.add('hidden');
        milestonesTab.classList.add('hidden');
        combinedTab.classList.add('hidden');
        eventsTab.classList.add('hidden');
        if (settingsTab) settingsTab.classList.add('hidden');
        wizardNext(1);
    }

    renderEventSetsList();
    updateSetSwitcher();
}

function handleAddSetFromPeopleTab() {
    const input = document.getElementById('newSetName2');
    const name = input ? input.value.trim() : '';
    if (!name) { showToast('Please enter a group name', 'error'); return; }
    const newSet = { id: 'set_' + Date.now(), name: name, events: [], connections: {}, comboTypes: { sum: true, ratio: true, duration: true } };
    allSets.push(newSet);
    input.value = '';
    currentSetId = newSet.id;
    loadCurrentSet();
    saveData();
    renderEventSetsList();
    renderPeopleTabGroups();
    updateSetSwitcher();
    showToast(`Group "${name}" created`, 'success');
}

function renderPeopleTabGroups() {
    const el = document.getElementById('eventSetsList2');
    if (!el) return;
    // Reuse the same rendering as the settings groups list
    el.innerHTML = renderEventSetsHTML();
}

function deleteSet(setId) {
    if (allSets.length <= 1) {
        showToast('Cannot delete the last set', 'error');
        return;
    }

    const set = allSets.find(s => s.id === setId);
    if (!confirm(`Delete "${set.name}" and all its events?`)) {
        return;
    }

    allSets = allSets.filter(s => s.id !== setId);

    // If deleting current set, switch to first available
    if (currentSetId === setId) {
        currentSetId = allSets[0].id;
        loadCurrentSet();
    }

    saveData();
    renderEventSetsList();
    updateSetSwitcher();

    // Refresh views
    renderEventsTab();
    renderMilestonesTab();
    renderCombinedTab();
}

// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.openEditModal = openEditModal;
window.toggleConnection = toggleConnection;
window.removeCustomNumber = removeCustomNumber;
window.selectMilestoneForShare = selectMilestoneForShare;
window.selectCombinedMilestoneForShare = selectCombinedMilestoneForShare;
window.switchToSet = switchToSet;
window.deleteSet = deleteSet;
window.renameSet = renameSet;
window.togglePerson = togglePerson;
window.selectMostSpecial = selectMostSpecial;

// ============================================================
// AUTHENTICATION UI
// ============================================================

function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('hidden');
        showAuthView('signin');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('hidden');
    // Clear form fields
    ['authEmail', 'authPassword', 'signupName', 'signupEmail', 'signupPassword', 'resetEmail'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    // Hide errors
    ['authError', 'signupError', 'resetMessage'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
}

function showAuthView(view) {
    ['authSignIn', 'authSignUp', 'authReset'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const viewMap = { signin: 'authSignIn', signup: 'authSignUp', reset: 'authReset' };
    const el = document.getElementById(viewMap[view]);
    if (el) el.classList.remove('hidden');
}

async function handleGoogleSignIn() {
    if (typeof HM_AUTH === 'undefined') return;
    const result = await HM_AUTH.signInWithGoogle();
    if (result.success) {
        closeAuthModal();
        showToast('Signed in!', 'success');
    } else {
        showAuthError('authError', result.error);
    }
}

async function handleAppleSignIn() {
    if (typeof HM_AUTH === 'undefined') return;
    const result = await HM_AUTH.signInWithApple();
    if (result.success) {
        closeAuthModal();
        showToast('Signed in!', 'success');
    } else {
        showAuthError('authError', result.error);
    }
}

async function handleFacebookSignIn() {
    if (typeof HM_AUTH === 'undefined') return;
    const result = await HM_AUTH.signInWithFacebook();
    if (result.success) {
        closeAuthModal();
        showToast('Signed in!', 'success');
    } else {
        showAuthError('authError', result.error);
    }
}

async function handlePhoneSend() {
    if (typeof HM_AUTH === 'undefined') return;
    const phone = document.getElementById('authPhone')?.value?.trim();
    if (!phone || !phone.startsWith('+')) {
        showAuthError('phoneError', 'Enter phone with country code (e.g. +386 40...)');
        return;
    }
    const btn = document.getElementById('phoneSignInBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Loading...'; }
    const result = await HM_AUTH.sendPhoneCode(phone);
    if (result.success && result.needsCaptcha) {
        // reCAPTCHA widget shown — user solves it, then code sends automatically
        if (btn) btn.classList.add('hidden');
    } else if (!result.success) {
        showAuthError('phoneError', result.error);
        if (btn) { btn.disabled = false; btn.textContent = 'Send Verification Code'; }
    }
}

async function handlePhoneVerify() {
    if (typeof HM_AUTH === 'undefined') return;
    const code = document.getElementById('authPhoneCode')?.value?.trim();
    if (!code || code.length < 6) {
        showAuthError('phoneError', 'Enter the 6-digit code.');
        return;
    }
    const result = await HM_AUTH.verifyPhoneCode(code);
    if (result.success) {
        closeAuthModal();
        showToast('Signed in!', 'success');
    } else {
        showAuthError('phoneError', result.error);
    }
}

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        btn.style.opacity = '1';
    } else {
        input.type = 'password';
        btn.style.opacity = '0.6';
    }
}

async function handleEmailSignIn() {
    const email = document.getElementById('authEmail')?.value?.trim();
    const password = document.getElementById('authPassword')?.value;
    if (!email || !password) {
        showAuthError('authError', 'Please enter both email and password.');
        return;
    }
    const result = await HM_AUTH.signInWithEmail(email, password);
    if (result.success) {
        closeAuthModal();
        showToast('Signed in!', 'success');
    } else {
        // Provide helpful guidance based on the error
        let hint = result.error;
        if (hint && (hint.includes('Invalid') || hint.includes('No account') || hint.includes('Incorrect'))) {
            hint = 'No account found with this email and password. You can:\n'
                 + '- Check your spelling and try again\n'
                 + '- Use "Create account" to make a new one\n'
                 + '- Use "Continue with Google" if you signed up with Google';
        }
        showAuthError('authError', hint);
    }
}

async function handleEmailSignUp() {
    const name = document.getElementById('signupName')?.value?.trim();
    const email = document.getElementById('signupEmail')?.value?.trim();
    const password = document.getElementById('signupPassword')?.value;
    const confirmPassword = document.getElementById('signupPasswordConfirm')?.value;
    if (!name) {
        showAuthError('signupError', 'Please enter your name.');
        return;
    }
    if (!email || !password) {
        showAuthError('signupError', 'Please enter email and password.');
        return;
    }
    if (password.length < 8) {
        showAuthError('signupError', 'Password must be at least 8 characters.');
        return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        showAuthError('signupError', 'Password needs at least one uppercase letter and one number.');
        return;
    }
    if (password !== confirmPassword) {
        showAuthError('signupError', 'Passwords do not match.');
        return;
    }
    const result = await HM_AUTH.signUpWithEmail(email, password, name);
    if (result.success) {
        closeAuthModal();
        showToast('Account created! Welcome to HappyMoments.', 'success');
    } else {
        showAuthError('signupError', result.error);
    }
}

async function handlePasswordReset() {
    const email = document.getElementById('resetEmail')?.value?.trim();
    if (!email) {
        showAuthError('resetMessage', 'Please enter your email.');
        return;
    }
    await HM_AUTH.resetPassword(email);
    const el = document.getElementById('resetMessage');
    if (el) {
        el.textContent = 'If an account exists, a reset link has been sent.';
        el.className = 'auth-error success';
        el.classList.remove('hidden');
    }
}

async function handleSignOut() {
    if (typeof HM_AUTH === 'undefined') return;
    await HM_AUTH.signOut();
    showToast('Signed out.', 'success');
}

async function handleDeleteAccount() {
    if (typeof HM_AUTH === 'undefined' || !HM_AUTH.isLoggedIn()) return;

    // Double confirmation
    const name = HM_AUTH.getUserDisplayName() || 'your account';
    if (!confirm(`Delete ${name}? This will permanently remove your account and all cloud data. Local data on this device will remain.`)) return;
    if (!confirm('Are you absolutely sure? This cannot be undone.')) return;

    try {
        const user = HM_AUTH.getUser();
        // Delete from our backend first
        try {
            const token = await HM_AUTH.getIdToken();
            await fetch('/api/user', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch {}
        // Delete from Firebase
        await user.delete();
        // Clear local premium status
        localStorage.removeItem('happymoments_premium_until');
        _track('account_deleted', {});
        showToast('Account deleted.', 'success');
    } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
            showToast('For security, please sign out and sign back in, then try deleting again.', 'error', 5000);
        } else {
            showToast('Could not delete account. Try signing out and back in first.', 'error');
        }
    }
}

async function resendVerification() {
    const user = HM_AUTH.getUser();
    if (user) {
        try {
            await user.sendEmailVerification();
            showToast('Verification email sent!', 'success');
        } catch (e) {
            showToast('Please wait before requesting again.', 'error');
        }
    }
}

function showAuthError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        // Support multiline messages
        el.innerHTML = escapeHtml(message).replace(/\n/g, '<br>');
        el.className = 'auth-error';
        el.classList.remove('hidden');
    }
}

function updateAccountUI(user) {
    const loggedOut = document.getElementById('accountLoggedOut');
    const loggedIn = document.getElementById('accountLoggedIn');
    const userBadge = document.getElementById('userBadge');

    if (user) {
        if (loggedOut) loggedOut.classList.add('hidden');
        if (loggedIn) loggedIn.classList.remove('hidden');

        const displayName = HM_AUTH.getUserDisplayName();
        const nameEl = document.getElementById('accountDisplayName');
        const emailEl = document.getElementById('accountEmailDisplay');
        const statusEl = document.getElementById('accountPremiumStatus');
        const verifyEl = document.getElementById('accountVerifyBanner');

        if (nameEl) nameEl.textContent = displayName;
        if (emailEl) emailEl.textContent = HM_AUTH.getUserEmail() || '';
        if (statusEl) {
            const isPrem = localStorage.getItem('happymoments_premium_until');
            if (isPrem && parseInt(isPrem) * 1000 > Date.now()) {
                statusEl.textContent = 'Premium';
                statusEl.className = 'account-status premium';
            } else {
                statusEl.textContent = 'Free';
                statusEl.className = 'account-status free';
            }
        }
        // Email verification disabled for now
        if (verifyEl) verifyEl.classList.add('hidden');

        // Show user badge in header
        if (userBadge) {
            const initials = (displayName || '?').split(' ').map(w => w[0]).join('').slice(0, 2);
            userBadge.innerHTML = `<span class="user-avatar">${escapeHtml(initials)}</span><span>${escapeHtml(displayName)}</span>`;
            userBadge.classList.remove('hidden');
            userBadge.onclick = () => switchTab('settings');
        }
    } else {
        if (loggedOut) loggedOut.classList.remove('hidden');
        if (loggedIn) loggedIn.classList.add('hidden');

        // Hide user badge
        if (userBadge) {
            userBadge.classList.add('hidden');
            userBadge.innerHTML = '';
        }
    }
}

// ============================================================
// PREMIUM GATE
// ============================================================

const FREE_PEOPLE_LIMIT = 100;
const FREE_TEAM_VIEWS = 100;

function isPremium() {
    const until = localStorage.getItem('happymoments_premium_until');
    return until && parseInt(until) * 1000 > Date.now();
}

function getTeamViewCount() {
    return parseInt(localStorage.getItem('hm_team_views') || '0');
}

function incrementTeamView() {
    const count = getTeamViewCount() + 1;
    localStorage.setItem('hm_team_views', String(count));
    return count;
}

function checkEventLimit() {
    if (isPremium()) return true;
    if (appData.events.length >= FREE_PEOPLE_LIMIT) {
        showUpgradePrompt('people');
        return false;
    }
    return true;
}

function checkGroupLimit() {
    if (isPremium()) return true;
    if (allSets.length >= 3) {
        showUpgradePrompt('groups');
        return false;
    }
    return true;
}

function checkTeamViewLimit() {
    if (isPremium()) return true;
    const views = getTeamViewCount();
    if (views >= FREE_TEAM_VIEWS) {
        return false;
    }
    incrementTeamView();
    return true;
}

// Upgrade text with i18n fallback
const UPGRADE_TEXT = {
    go_premium: { en: 'Go Premium', pt: 'Seja Premium', hi: 'प्रीमियम लें', zh: '升级高级版', ja: 'プレミアムへ', es: 'Hazte Premium', ko: '프리미엄', th: 'อัพเกรด' },
    clean_experience: { en: 'clean cards, no banners', pt: 'sem an\u00fancios, cart\u00f5es limpos', hi: 'विज्ञापन-मुक्त', zh: '无广告，干净卡片', ja: '広告なし', es: 'sin anuncios', ko: '광고 없음', th: 'ไม่มีโฆษณา' },
    upgrade_now: { en: 'Upgrade Now', pt: 'Atualizar Agora', hi: 'अभी अपग्रेड करें', zh: '立即升级', ja: '今すぐアップグレード', es: 'Mejorar Ahora', ko: '지금 업그레이드', th: 'อัพเกรดเลย' },
    maybe_later: { en: 'Maybe later', pt: 'Talvez depois', hi: 'बाद में', zh: '以后再说', ja: 'あとで', es: 'Quiz\u00e1s luego', ko: '나중에', th: 'ไว้ทีหลัง' },
    unlimited: { en: 'Unlimited people & groups', pt: 'Pessoas e grupos ilimitados', hi: 'असीमित लोग और समूह', zh: '无限人数和群组', ja: '無制限の人数とグループ', es: 'Personas y grupos ilimitados', ko: '무제한 인원 및 그룹', th: 'ไม่จำกัดคนและกลุ่ม' },
};
function _ut(key) {
    const locale = (typeof getAppLocale === 'function') ? getAppLocale().split('-')[0] : 'en';
    const baseLang = locale.split('_')[0];
    const entry = UPGRADE_TEXT[key];
    return (entry && (entry[locale] || entry[baseLang])) || (entry && entry.en) || key;
}

function showPremiumBanner() {
    if (isPremium()) return;
    if (sessionStorage.getItem('hm_banner_dismissed')) return;
    // Don't show during onboarding
    if (appData.events.length === 0) return;

    const banner = document.createElement('div');
    banner.className = 'premium-banner';
    banner.id = 'premiumBanner';
    banner.innerHTML = `
        <span class="premium-banner-star">&#9733;</span>
        <span class="premium-banner-text">${_ut('go_premium')}</span>
        <span class="premium-banner-price">&euro;1.49/year</span>
        <span class="premium-banner-text">&mdash; ${_ut('clean_experience')}</span>
    `;
    banner.onclick = () => {
        if (typeof HM_AUTH !== 'undefined' && !HM_AUTH.isLoggedIn()) {
            openAuthModal();
        } else {
            handleUpgrade();
        }
    };
    document.body.appendChild(banner);
}

function promptForDisplayName(user) {
    // Only prompt once per session
    if (sessionStorage.getItem('hm_name_prompted')) return;
    sessionStorage.setItem('hm_name_prompted', '1');

    // Try to get a suggestion from email
    const emailHint = user.email ? user.email.split('@')[0].replace(/[._]/g, ' ') : '';
    const suggestion = emailHint.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    setTimeout(() => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'namePromptModal';
        modal.innerHTML = `
            <div class="modal-content auth-modal">
                <h3>Choose a nickname</h3>
                <p class="auth-subtitle">How would you like to be called?</p>
                <div class="auth-form">
                    <input type="text" id="namePromptInput" placeholder="Your nickname" value="${escapeHtml(suggestion)}" class="auth-input" autocomplete="name">
                    <button class="btn-primary auth-submit" onclick="saveDisplayName()">Save</button>
                </div>
                <button class="auth-skip" onclick="document.getElementById('namePromptModal').remove()">Skip</button>
            </div>
        `;
        document.body.appendChild(modal);
        const input = document.getElementById('namePromptInput');
        if (input) { input.focus(); input.select(); }
    }, 500);
}

async function saveDisplayName() {
    const name = document.getElementById('namePromptInput')?.value?.trim();
    if (!name) return;
    try {
        const user = HM_AUTH.getUser();
        if (user) {
            await user.updateProfile({ displayName: name });
            updateAccountUI(user);
            showToast(`Welcome, ${name}!`, 'success');
        }
    } catch {}
    const modal = document.getElementById('namePromptModal');
    if (modal) modal.remove();
}

function dismissPremiumBanner() {
    const banner = document.getElementById('premiumBanner');
    if (banner) banner.remove();
    sessionStorage.setItem('hm_banner_dismissed', '1');
}

function showUpgradePrompt(reason) {
    _track('premium_gate_hit', { reason: reason });
    if (typeof HM_AUTH !== 'undefined' && !HM_AUTH.isLoggedIn()) {
        openAuthModal();
        return;
    }

    const reasons = {
        people: `You've reached the free limit of ${FREE_PEOPLE_LIMIT} people.`,
        groups: 'Free accounts include 3 groups.',
        team: `You've used your ${FREE_TEAM_VIEWS} free Team tab views.`,
        default: 'Unlock the full HappyMoments experience.'
    };
    const subtitle = reasons[reason] || reasons.default;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'upgradeModal';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `
        <div class="modal-content auth-modal">
            <h3>HappyMoments Premium</h3>
            <p class="auth-subtitle">${subtitle}</p>
            <div style="margin: 16px 0; padding: 16px; background: var(--bg-elevated); border-radius: var(--radius-sm);">
                <div style="font-size: var(--font-size-2xl); color: var(--warning); margin-bottom: 12px;">&euro;1.49<span style="font-size: var(--font-size-sm); color: var(--text-secondary);"> / year</span></div>
                <ul style="text-align: left; font-size: var(--font-size-sm); color: var(--text-secondary); list-style: none; padding: 0;">
                    <li>&#10003; Unlimited people &amp; groups</li>
                    <li>&#10003; Unlimited Team tab views</li>
                    <li>&#10003; No gift banners &mdash; clean milestone view</li>
                    <li>&#10003; Clean image cards &mdash; no watermark</li>
                    <li>&#10003; Support an independent developer</li>
                </ul>
            </div>
            <button class="btn-primary" onclick="handleUpgrade()" style="width:100%;">${_ut('upgrade_now')}</button>
            <button class="auth-skip" onclick="document.getElementById('upgradeModal').remove()">${_ut('maybe_later')}</button>
        </div>
    `;
    document.body.appendChild(modal);
}

async function handleUpgrade() {
    const modal = document.getElementById('upgradeModal');
    if (modal) modal.remove();

    if (!HM_AUTH.isLoggedIn()) {
        openAuthModal();
        return;
    }

    _track('checkout_started', { product: 'premium' });

    try {
        const token = await HM_AUTH.getIdToken();
        const res = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                type: 'premium',
                uid: HM_AUTH.getUser().uid,
                email: HM_AUTH.getUserEmail()
            })
        });
        const data = await res.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            showToast('Payment is not yet configured. Coming soon!', 'info');
        }
    } catch (err) {
        showToast('Payment is not yet configured. Coming soon!', 'info');
    }
}

async function checkPremiumStatus() {
    if (!HM_AUTH.isLoggedIn()) return;
    try {
        const token = await HM_AUTH.getIdToken();
        const body = {};
        // Include UTM attribution on registration
        if (typeof HM_ANALYTICS !== 'undefined') {
            const utm = HM_ANALYTICS.getUtm();
            if (utm) body.utm = utm;
        }
        const res = await fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.premium_until) {
            localStorage.setItem('happymoments_premium_until', data.premium_until);
        } else {
            localStorage.removeItem('happymoments_premium_until');
        }
        updateAccountUI(HM_AUTH.getUser());
    } catch {
        // Backend not available — use cached status
    }
}

function checkPremiumReturn() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'premium_success') {
        _track('payment_complete', { product: 'premium' });
        showToast('Welcome to Premium! Thank you!', 'success');
        // Re-check status from backend
        setTimeout(checkPremiumStatus, 2000);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('checkout') === 'premium_cancelled') {
        _track('payment_cancelled', { product: 'premium' });
        showToast('Upgrade cancelled.', 'info');
        window.history.replaceState({}, '', window.location.pathname);
    }
}

// ============================================================
// ANALYTICS TRACKING
// ============================================================

function _track(action, data) {
    if (typeof HM_ANALYTICS !== 'undefined') HM_ANALYTICS.track(action, data);
}

// ============================================================
// HAPPINESS BUTTON
// ============================================================

function handleHappyClick() {
    // Limit to 1 click per session
    if (sessionStorage.getItem('hm_happy_clicked')) return;
    sessionStorage.setItem('hm_happy_clicked', '1');

    // Track analytics event
    _track('happy_click', {});

    // Increment local counter
    const count = parseInt(localStorage.getItem('hm_happy_count') || '0', 10) + 1;
    localStorage.setItem('hm_happy_count', String(count));

    // Update displayed count
    updateHappyCounter();

    // Pulse animation on button
    const btn = document.getElementById('happyBtn');
    if (btn) {
        btn.classList.add('happy-pulse');
        btn.disabled = true;
    }

    // Show toast
    showToast('You made someone happy!', 'success', 2500);
}

function updateHappyCounter() {
    const count = parseInt(localStorage.getItem('hm_happy_count') || '0', 10);
    const el = document.getElementById('happyCount');
    if (el) {
        el.textContent = count > 0 ? count + ' happy moment' + (count !== 1 ? 's' : '') + ' shared' : '';
    }

    // Reflect session guard: disable button if already clicked this session
    if (sessionStorage.getItem('hm_happy_clicked')) {
        const btn = document.getElementById('happyBtn');
        if (btn) {
            btn.disabled = true;
            btn.classList.add('happy-pulse');
        }
    }
}

// ============================================================
// START APP
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    init();

    // Screen 1 is now a static hook — no demo animation needed

    // Initialize happiness counter
    updateHappyCounter();

    // Track page view (includes UTM data if present via analytics.js)
    _track('page_view', { page: 'app', referrer: document.referrer || null });

    // Show premium banner for free users
    showPremiumBanner();

    // Clean UTM params from URL (after analytics captured them)
    if (window.location.search.includes('utm_')) {
        const url = new URL(window.location);
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(k => url.searchParams.delete(k));
        window.history.replaceState({}, '', url.pathname + (url.search || ''));
    }

    // Initialize auth (non-blocking — app works without it)
    if (typeof HM_AUTH !== 'undefined') {
        HM_AUTH.init();
        HM_AUTH.onAuthChange(user => {
            updateAccountUI(user);
            if (user) {
                checkPremiumStatus();
                _track('auth_signed_in', { method: user.providerData?.[0]?.providerId || 'unknown' });
                // If user has no display name (phone sign-in), ask for it
                if (!user.displayName) {
                    promptForDisplayName(user);
                }
            }
        });
    }

    // Check for premium checkout return
    checkPremiumReturn();

    // Close auth modal on backdrop click
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.addEventListener('click', e => {
            if (e.target === authModal) closeAuthModal();
        });
    }
});
