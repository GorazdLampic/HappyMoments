/**
 * Nice Numbers - Main Application
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
// Ordinal date formatting: "Sep 7th" or "Sep 7th, 2027" if different year
function formatMilestoneDate(date, options) {
    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;
    const day = date.getDate();
    // Ordinal suffix ("24th") is English-only — other locales get the plain day number
    const isEn = !locale || String(locale).toLowerCase().startsWith('en');
    const suffix = !isEn ? '' : (day >= 11 && day <= 13) ? 'th' : ['th','st','nd','rd','th','th','th','th','th','th'][day % 10];
    const month = date.toLocaleDateString(locale, { month: 'short' });
    const thisYear = new Date().getFullYear();
    const year = date.getFullYear();
    if (options && options.long) {
        // Abbreviated weekday/month so "date · countdown" fits one hero line
        const weekday = date.toLocaleDateString(locale, { weekday: 'short' });
        return year !== thisYear ? `${weekday}, ${month} ${day}${suffix}, ${year}` : `${weekday}, ${month} ${day}${suffix}`;
    }
    // Short form ALWAYS carries the year — rows show it on their own smaller line
    return `${month} ${day}${suffix}, ${year}`;
}

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

// Singular/plural for count-based UI strings — locale-aware via I18N
// (Slovenian: 1 dan / 2 dneva / 3 dnevi / 5 dni; Russian/Polish 3 forms; etc.)
function plural(n, word) {
    if (typeof I18N !== 'undefined' && I18N.plural) return I18N.plural(n, word);
    return n === 1 ? word : word + 's';
}

// Translated template: tt('wiz_added', {name: 'Nastja'}) -> "Nastja added!"
// Word order lives in the per-language template, never in code.
function tt(key, vars) {
    let s = (typeof I18N !== 'undefined' && I18N.t) ? I18N.t(key) : key;
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
}

// Localized display form of milestoneCalculator's English unitName ('days' →
// 'dni'/'Tage'/...). Display sites only — never use for unitName comparisons.
// Unknown units (cosmic names, 'x', '%') pass through unchanged.
function localizedUnit(count, unitName) {
    const map = { seconds: 'second', minutes: 'minute', hours: 'hour', days: 'day', weeks: 'week', months: 'month', years: 'year' };
    const noun = map[unitName];
    return noun && typeof I18N !== 'undefined' ? I18N.plural(count, noun) : unitName;
}

// Stored data keeps the canonical 'Me'; render sites show the localized label.
function displayPersonName(name) {
    return name === 'Me' ? tt('me_label') : name;
}

// "Show N more" / "Show less" expander lists — one named helper instead of
// fragile JS-inside-onclick-attribute strings. moreKey/lessKey override the
// default labels (e.g. 'wiz_more_arrow'/'wiz_less_arrow' pairs).
function _moreListLabel(count, noun, moreKey) {
    if (moreKey) return tt(moreKey, { count: count });
    if (noun) return tt('wiz_show_more_tpl', { count: count, noun: plural(count, noun) });
    return tt('wiz_show_more_short', { count: count });
}
function toggleMoreList(listId, btnId, count, noun, moreKey, lessKey) {
    const list = document.getElementById(listId);
    const btn = document.getElementById(btnId);
    if (!list || !btn) return;
    const isHidden = list.style.display === 'none';
    list.style.display = isHidden ? '' : 'none';
    btn.textContent = isHidden ? tt(lessKey || 'wiz_show_less') : _moreListLabel(count, noun, moreKey);
}
window.toggleMoreList = toggleMoreList;

// List rows: round giants read better (and shorter) as words — "850 million",
// "2.66 billion". Pattern numbers (44,444,444) keep their digits: the digits
// ARE the point. Heroes always keep full digits for the spectacle.
function formatMilestoneValue(value, locale) {
    if (value >= 1000000 && value % 100000 === 0) {
        if (value >= 1000000000) {
            const b = value / 1000000000;
            return (Number.isInteger(b) ? b : parseFloat(b.toFixed(2))).toLocaleString(locale) + ' ' + tt('num_billion');
        }
        const mm = value / 1000000;
        return (Number.isInteger(mm) ? mm : parseFloat(mm.toFixed(1))).toLocaleString(locale) + ' ' + tt('num_million');
    }
    return value.toLocaleString(locale);
}

// Auto-add a member once name + a complete valid date are entered —
// no need to tap "+ Add". Validation is silent (no error toasts mid-typing);
// a wrong-but-valid date can still be edited or removed in the member list.
function _dateFieldsComplete(prefix) {
    const dd = parseInt(document.getElementById(prefix + 'Day')?.value, 10);
    const mm = parseInt(document.getElementById(prefix + 'Month')?.value, 10);
    const yStr = String(document.getElementById(prefix + 'Year')?.value || '');
    if (yStr.length !== 4) return false;
    const y = parseInt(yStr, 10);
    if (!(dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12 && y >= 1900 && y <= new Date().getFullYear())) return false;
    return dd <= new Date(y, mm, 0).getDate();
}

function wizardGroupAutoAdd() {
    const name = document.getElementById('groupPersonField')?.value?.trim();
    if (name && _dateFieldsComplete('group')) wizardAddGroupMember();
}

function editorAutoAdd() {
    const name = document.getElementById('editorPersonField')?.value?.trim();
    if (name && _dateFieldsComplete('editor')) editorAddMember();
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
    moveSettingsIntoProfilePanel();
    upgradeLangFlags();

    // Set the locale BEFORE any dynamic render below, so a returning user never
    // sees a first-paint English flash on dynamically-built content (milestone
    // dates, "Show N more", the UPCOMING hint). Static data-i18n chrome was
    // always fixed by applyTranslations(), but dynamic rows are baked at render
    // time and need currentLocale set first.
    if (typeof I18N !== 'undefined') {
        I18N.init();
        initLangPicker();
    }

    // Date fields are now DD/MM/YYYY number inputs — no max needed

    const isNewUser = appData.events.length === 0 && !localStorage.getItem('hm_onboarded');
    const isReturningUser = appData.events.length > 0 || localStorage.getItem('hm_onboarded');

    if (isNewUser) {
        // New user: header STAYS visible during onboarding (brand + profile icon
        // from the first moment); only tabs + tab content are hidden
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
        // Show resume banner if onboarding was interrupted
        if (localStorage.getItem('hm_onboard_resume')) {
            setTimeout(() => showOnboardingResumeBanner(), 300);
        }
    }

    // #7 One-time gentle tip on a later visit: anniversaries are addable too.
    // Outside the branches + on a delay, because loadData() decrypts async — so
    // appData.events isn't populated yet at the synchronous returning-user check.
    // Non-annoying: shown once, only for a populated returning user (on the
    // dashboard, not onboarding) who has no special date yet.
    try {
        const launches = (parseInt(localStorage.getItem('hm_launches') || '0', 10) || 0) + 1;
        localStorage.setItem('hm_launches', String(launches));
        if (launches >= 2 && !localStorage.getItem('hm_anniv_tip')) {
            setTimeout(() => {
                if (!appData.events || !appData.events.length) return;
                if (onboardingSection && !onboardingSection.classList.contains('hidden')) return;
                const hasDateEvent = appData.events.some(e => /wedding|anniversar|poroka|obletnic|graduat|first day|we met|moved/i.test(e.name));
                if (hasDateEvent) return;
                localStorage.setItem('hm_anniv_tip', '1');
                showToast(tt('tip_anniversary'), 'info', 7000);
            }, 2500);
        }
    } catch (e) {}

    // Init notifications
    if (typeof NOTIF !== 'undefined') {
        NOTIF.init();
        loadNotifUI();
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
                <span class="deeplink-unit">${localizedUnit(m.value, m.unitName)}</span>
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
        nameInput.placeholder = tt('dash_your_name_ph');
        nameInput.scrollIntoView({ behavior: 'smooth' });
        nameInput.focus();
    }
    showToast(tt('toast_added_enter_yours', { name: name }), 'info', 5000);
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

// Real flag images — Windows browsers don't render flag emojis (show "GB" letters)
const LANG_FLAG_FILES = {
    en: 'gb', es: 'es', de: 'de', fr: 'fr', it: 'it', pt_BR: 'br', pt: 'pt',
    hr: 'hr', sl: 'si', nl: 'nl', pl: 'pl', ru: 'ru', zh: 'cn', hi: 'in',
    ar: 'sa', bn: 'bd', ja: 'jp', vi: 'vn', id: 'id', th: 'th', ko: 'kr'
};

function flagImgHtml(locale) {
    const f = LANG_FLAG_FILES[locale];
    return f ? `<img class="lang-flag-img" src="icons/flags/${f}.png" alt="">` : (LANG_FLAGS[locale] || '');
}

// Swap the emoji flags in the language picker for image flags (startup)
function upgradeLangFlags() {
    document.querySelectorAll('.lang-option').forEach(btn => {
        const m = (btn.getAttribute('onclick') || '').match(/selectLanguage\('([a-zA-Z_]+)'\)/);
        if (!m) return;
        const span = btn.querySelector('.lang-option-flag');
        if (span && LANG_FLAG_FILES[m[1]]) span.innerHTML = flagImgHtml(m[1]);
    });
    const flagEl = document.getElementById('langFlagDisplay');
    if (flagEl && typeof I18N !== 'undefined' && I18N.getLocale) {
        flagEl.innerHTML = flagImgHtml(I18N.getLocale());
    }
}

function initLangPicker() {
    // Just update the displayed flag/code to match current locale
    if (typeof I18N === 'undefined') return;
    const loc = I18N.getLocale();
    const flagEl = document.getElementById('langFlagDisplay');
    const codeEl = document.getElementById('langCodeDisplay');
    if (flagEl) flagEl.innerHTML = flagImgHtml(loc);
    if (codeEl) codeEl.textContent = loc.toUpperCase();
}

function selectLanguage(locale) {
    if (typeof I18N !== 'undefined') I18N.setLocale(locale);
    // Update button display
    const flagEl = document.getElementById('langFlagDisplay');
    const codeEl = document.getElementById('langCodeDisplay');
    if (flagEl) flagEl.innerHTML = flagImgHtml(locale);
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
        showToast(tt('toast_reminders_enabled'), 'success');
        // Hide the toggle row, show confirmation — keeps settings clean
        const toggleRow = document.getElementById('notifToggle')?.closest('.toggle-option');
        if (toggleRow) toggleRow.innerHTML = '<span style="color:var(--warning,#d4b876);font-size:0.85rem;">' + tt('toast_reminders_on') + '</span>';
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
            catch (e) { showToast(tt('toast_storage_full_data'), 'error'); }
        });
    } else {
        try { localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(dataObj)); }
        catch (e) { showToast(tt('toast_storage_full_data'), 'error'); }
    }

    // Re-schedule notifications whenever data changes
    if (typeof NOTIF !== 'undefined' && NOTIF.isEnabled()) {
        NOTIF.scheduleMilestoneNotifications();
    }
}

function saveSettings() {
    try { localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(appSettings)); }
    catch (e) { showToast(tt('toast_storage_full_settings'), 'error'); }
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {
    // startBtn now handled by wizard onclick="wizardDiscover()" — don't add duplicate listener

    // Enter (and the mobile keyboard's Go/Done/Next) acts like tapping the screen's
    // primary gold button. Inputs are standalone (no <form>), so Enter did nothing
    // before. Scoped to wizard steps, open modals, and the group editor — the places
    // with text entry — and only ever clicks the one visible primary button there.
    // Inputs that already have their own Enter handlers are excluded.
    const ENTER_SKIP_IDS = ['newEventName', 'newEventDate', 'calcNumber', 'customNumberInput', 'newSetName', 'newGroupField'];
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229) return; // ignore IME composition
        const t = e.target;
        if (!t || t.tagName !== 'INPUT' || t.type === 'checkbox' || t.type === 'radio') return;
        if (ENTER_SKIP_IDS.includes(t.id) || t.hasAttribute('data-no-enter-submit')) return;
        const scope = t.closest('.modal:not(.hidden)')
            || t.closest('#groupEditorOverlay:not(.hidden)')
            || t.closest('.wizard-step-active');
        if (!scope) return;
        const btn = [...scope.querySelectorAll('button.wizard-btn, button.btn-primary')]
            .find(b => b.offsetParent !== null && !b.disabled && !b.classList.contains('wizard-btn-secondary'));
        if (btn) { e.preventDefault(); btn.click(); }
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Events tab (elements may be hidden)
    if (addEventBtn) addEventBtn.addEventListener('click', handleAddEvent);
    if (newEventNameInput) newEventNameInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleAddEvent();
    });
    if (newEventDateInput) newEventDateInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleAddEvent();
    });

    // Edit modal
    if (saveEditBtn) saveEditBtn.addEventListener('click', handleSaveEdit);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);
    if (deleteEditBtn) deleteEditBtn.addEventListener('click', handleDeleteEdit);
    if (editModal) editModal.addEventListener('click', e => {
        if (e.target === editModal) closeEditModal();
    });

    // Combination settings
    document.querySelectorAll('[data-combo-type]').forEach(cb => {
        cb.addEventListener('change', handleComboTypeChange);
    });

    // Happy number types — auto-save on toggle (the old Save button is hidden,
    // so without this the checkboxes silently did nothing)
    document.querySelectorAll('[data-pattern], [data-constant]').forEach(cb => {
        cb.addEventListener('change', () => {
            handleSaveSettings();
            renderMilestonesTab();
        });
    });

    // Individual Milestones tab — every lookup guarded: a single missing element
    // here used to throw and silently kill ALL listener setup below (export,
    // import, settings, calendar) — found by the screenshot-tour page-error check
    if (refreshMilestonesBtn) refreshMilestonesBtn.addEventListener('click', renderMilestonesTab);
    if (copyShareBtn) copyShareBtn.addEventListener('click', handleCopyShare);
    if (whatsappShareBtn) whatsappShareBtn.addEventListener('click', handleWhatsAppShare);
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
    if (refreshCombinedBtn) refreshCombinedBtn.addEventListener('click', renderCombinedTab);
    if (copyCombinedShareBtn) copyCombinedShareBtn.addEventListener('click', handleCopyCombinedShare);
    if (whatsappCombinedShareBtn) whatsappCombinedShareBtn.addEventListener('click', handleWhatsAppCombinedShare);
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
    if (addCustomNumberBtn) addCustomNumberBtn.addEventListener('click', handleAddCustomNumber);
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', handleSaveSettings);
    if (resetBtn) resetBtn.addEventListener('click', handleReset);
    if (exportDataBtn) exportDataBtn.addEventListener('click', handleExportData);
    if (importDataInput) importDataInput.addEventListener('change', handleImportData);
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

    // Edit-tab "new group" field uses a plain (unclassed) button, so the global
    // Enter handler above can't find it — wire it directly.
    const newGroupFieldInput = document.getElementById('newGroupField');
    if (newGroupFieldInput) newGroupFieldInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleAddSetFromPeopleTab();
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
        moveSettingsIntoProfilePanel();
        if (typeof loadSettingsUI === 'function') loadSettingsUI();
        renderPremiumUI();
        renderCardDesignPicker();
        panel.classList.add('visible');
        panel.classList.remove('hidden');
        if (overlay) overlay.classList.remove('hidden');
    }
}

// Settings content lives in the profile panel — moved there ONCE, at startup,
// so it can never transiently appear inside the Edit tab
function moveSettingsIntoProfilePanel() {
    const body = document.getElementById('profilePanelBody');
    if (body && body.children.length === 0 && settingsTab) {
        while (settingsTab.firstChild) {
            body.appendChild(settingsTab.firstChild);
        }
        const langPicker = document.getElementById('langPicker');
        if (langPicker) {
            langPicker.classList.remove('hidden');
            body.insertBefore(langPicker, body.firstChild);
        }
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
    // "Manage" tab: people + groups ONLY — settings live in the profile panel,
    // never inline here (they used to show until the panel's first open moved them)
    else if (tabName === 'manage' || tabName === 'events') {
        milestonesTab.classList.add('hidden');
        combinedTab.classList.add('hidden');
        eventsTab.classList.remove('hidden');
        if (settingsTab) settingsTab.classList.add('hidden');
        const shareBar = document.getElementById('stickyShareBar');
        if (shareBar) shareBar.style.display = 'none';
        renderEventsTab();
        renderPeopleTabGroups();
        window.scrollTo(0, 0);
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
        // Show the group selector on Solo too, so the current circle is visible
        // and switchable without leaving this tab.
        renderGroupSubTabs('groupSubTabsMe', 'me');
    } else {
        if (meView) meView.style.display = 'none';
        if (groupView) groupView.style.display = '';
        if (toggleMe) toggleMe.classList.remove('active');
        if (toggleGroup) toggleGroup.classList.add('active');

        // Render group sub-tabs if 2+ groups
        renderGroupSubTabs();

        // Render content for current group
        const content = document.getElementById('groupMilestonesContent');
        const currentSet = allSets.find(s => s.id === currentSetId);
        const gName = currentSet ? currentSet.name : tt('wiz_my_group_ph');
        if (content) {
            // The sub-tabs row above always shows the active group name (with its own
            // edit pencil) now, so no separate name header is needed here.
            let headerHtml = '';
            if (typeof renderCombinedTab === 'function') {
                renderCombinedTab();
                const combinedContent = document.getElementById('combinedMilestonesContent');
                if (combinedContent && combinedContent.innerHTML.trim()) {
                    headerHtml += combinedContent.innerHTML;
                } else {
                    headerHtml += '<p style="text-align:center;padding:24px;color:var(--text-muted);font-style:italic;">' + tt('tog_add_two') + '</p>';
                }
            }
            // Invite anniversaries / special dates — the engine treats any date as a member,
            // so "Our wedding · 14 Jul 2007" produces combined milestones immediately
            const hasDateEvent = appData.events.some(e => /wedding|anniversar|poroka|obletnic|graduat|first day|we met|moved/i.test(e.name));
            if (appData.events.length >= 1 && !hasDateEvent) {
                headerHtml += `<div style="margin-top:16px;padding:14px;border-radius:10px;background:rgba(212,184,118,0.06);border:1px dashed rgba(212,184,118,0.3);text-align:center;">
                    <p style="color:var(--text);font-size:0.92rem;margin-bottom:4px;">${tt('tog_anniv_title')}</p>
                    <p style="color:var(--text-muted);font-size:0.88rem;margin-bottom:10px;">${tt('tog_anniv_body')}</p>
                    <button onclick="openGroupEditorWithDateHint()" style="padding:8px 20px;border-radius:8px;background:rgba(212,184,118,0.15);border:1px solid rgba(212,184,118,0.4);color:var(--warning,#d4b876);cursor:pointer;font-size:0.85rem;font-weight:600;">${tt('tog_add_special')}</button>
                </div>`;
            }

            content.innerHTML = headerHtml;
        }
    }
    _track('home_view_switched', { view });
}

// ============================================================
// GROUP SUB-TABS (Together tab) + GROUP EDITOR
// ============================================================

function renderGroupSubTabs(containerId, context) {
    // The same selector is rendered in both the Solo (context 'me') and Together
    // (context 'group') views so groups can be seen and switched from either tab.
    containerId = containerId || 'groupSubTabs';
    context = context || 'group';
    const container = document.getElementById(containerId);
    if (!container) return;
    // Always show the selector once at least one group exists — even with a
    // single group — so people discover that more circles are possible.
    if (allSets.length < 1) { container.style.display = 'none'; return; }
    container.style.display = 'flex';
    let html = allSets.map(set => {
        const isActive = set.id === currentSetId;
        // The active group carries the edit pencil right on its chip; tapping the
        // pencil opens the editor without re-triggering the (already-active) tab.
        const editPencil = isActive
            ? ` <span onclick="event.stopPropagation(); openGroupEditor('${set.id}')" title="Edit group" style="margin-left:5px;opacity:0.7;font-size:0.95em;">&#9998;</span>`
            : '';
        return `<button onclick="switchToGroupTab('${set.id}','${context}')" style="flex:1;padding:8px 12px;border:none;cursor:pointer;font-size:0.85rem;font-weight:${isActive ? '700' : '400'};color:${isActive ? 'var(--warning,#d4b876)' : 'var(--text-muted)'};background:${isActive ? 'rgba(212,184,118,0.12)' : 'transparent'};transition:all 0.2s;">${escapeHtml(set.name)}${editPencil}</button>`;
    }).join('');
    // With only one group, append a ghost "next group" slot — an empty, dashed
    // tab that invites the user to create a second circle. Tapping it builds it.
    if (allSets.length === 1) {
        html += `<button onclick="promptNewGroupFromTogether()" title="${escapeHtml(tt('tog_new_group'))}" style="flex:1;padding:8px 12px;border:none;border-left:1px dashed var(--border);cursor:pointer;font-size:0.85rem;font-weight:400;color:var(--text-muted);background:transparent;opacity:0.7;transition:all 0.2s;">${escapeHtml(tt('tog_new_group'))}</button>`;
    }
    container.innerHTML = html;
}

function switchToGroupTab(setId, context) {
    context = context || 'group';
    if (setId !== currentSetId) {
        saveData();
        currentSetId = setId;
        loadCurrentSet();
        selectedPersonIds = appData.events.map(e => e.id);
    }
    // Stay in whichever view the tap came from (Solo or Together).
    if (context === 'me') {
        switchHomeView('me');
        renderPersonFilter();
        renderMilestonesTab();
    } else {
        switchHomeView('group');
    }
}

function openGroupEditor(setId) {
    const overlay = document.getElementById('groupEditorOverlay');
    if (!overlay) return;

    // If a specific set is requested, switch to it first
    if (setId && setId !== currentSetId) {
        saveData();
        currentSetId = setId;
        loadCurrentSet();
    }

    const currentSet = allSets.find(s => s.id === currentSetId);
    if (!currentSet) return;

    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;

    let html = `
        <div style="margin-bottom:16px;">
            <label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:4px;">${tt('ed_group_name')}</label>
            <input type="text" id="editorGroupTitle" name="hm_f5" value="${escapeHtml(currentSet.name)}" readonly onfocus="this.removeAttribute('readonly')" style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid var(--border,#333);background:transparent;color:var(--text);font-family:var(--font-serif);font-size:1.2rem;font-weight:600;text-align:center;" autocomplete="off" data-lpignore="true" data-1p-ignore>
        </div>
        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">${tt('ed_members_hint')}</div>
    `;

    // Editable member list
    appData.events.forEach((e, i) => {
        const d = e.date instanceof Date ? e.date : new Date(e.date);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        html += `<div style="display:flex;align-items:center;gap:6px;padding:8px 10px;background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:6px;">
            <input type="text" value="${escapeHtml(displayPersonName(e.name))}" onchange="editorUpdateMember('${e.id}','name',this.value)" readonly onfocus="this.removeAttribute('readonly')" size="1" style="flex:1;min-width:0;padding:6px 8px;border-radius:6px;border:1px solid var(--border,#333);background:transparent;color:var(--text);font-family:var(--font-serif);font-size:1rem;" autocomplete="hm-no-fill" data-lpignore="true" data-1p-ignore>
            <input type="text" inputmode="numeric" value="${dd}" onchange="editorUpdateMemberDate('${e.id}','d',this.value)" maxlength="2" style="width:2.2em;padding:6px 1px;text-align:center;border-radius:6px;border:1px solid var(--border,#333);background:transparent;color:var(--text-muted);font-family:var(--font-mono);font-size:0.8rem;">
            <span style="color:var(--text-muted);font-size:0.8rem;">/</span>
            <input type="text" inputmode="numeric" value="${mm}" onchange="editorUpdateMemberDate('${e.id}','m',this.value)" maxlength="2" style="width:2.2em;padding:6px 1px;text-align:center;border-radius:6px;border:1px solid var(--border,#333);background:transparent;color:var(--text-muted);font-family:var(--font-mono);font-size:0.8rem;">
            <span style="color:var(--text-muted);font-size:0.8rem;">/</span>
            <input type="text" inputmode="numeric" value="${yyyy}" onchange="editorUpdateMemberDate('${e.id}','y',this.value)" maxlength="4" style="width:3.2em;padding:6px 1px;text-align:center;border-radius:6px;border:1px solid var(--border,#333);background:transparent;color:var(--text-muted);font-family:var(--font-mono);font-size:0.8rem;">
            <button onclick="editorRemoveMember('${e.id}')" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.1rem;padding:2px 6px;" title="${tt('ed_remove')}">&times;</button>
        </div>`;
    });

    // Add member form
    html += `
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border,#333);">
            <div style="display:flex;align-items:center;gap:6px;padding:6px 10px;">
                <input type="text" id="editorPersonField" name="hm_f4" placeholder="${tt('ed_person_ph')}" readonly onfocus="this.removeAttribute('readonly')" size="1" style="flex:1;min-width:0;padding:6px 8px;border-radius:6px;border:1px solid var(--border,#333);background:transparent;color:var(--text);font-family:var(--font-serif);font-size:1rem;" autocomplete="hm-no-fill" data-lpignore="true" data-1p-ignore>
                <input type="text" inputmode="numeric" pattern="[0-9]*" id="editorDay" placeholder="DD" maxlength="2" style="width:2.2em;padding:6px 1px;text-align:center;border-radius:6px;border:1px solid var(--border,#333);background:transparent;color:var(--text);font-family:var(--font-mono);font-size:0.8rem;" oninput="autoAdvance(this,'editorMonth',2)">
                <span style="color:var(--text-muted);font-size:0.8rem;">/</span>
                <input type="text" inputmode="numeric" pattern="[0-9]*" id="editorMonth" placeholder="MM" maxlength="2" style="width:2.2em;padding:6px 1px;text-align:center;border-radius:6px;border:1px solid var(--border,#333);background:transparent;color:var(--text);font-family:var(--font-mono);font-size:0.8rem;" oninput="autoAdvance(this,'editorYear',2)">
                <span style="color:var(--text-muted);font-size:0.8rem;">/</span>
                <input type="text" inputmode="numeric" pattern="[0-9]*" id="editorYear" placeholder="YYYY" maxlength="4" style="width:3.2em;padding:6px 1px;text-align:center;border-radius:6px;border:1px solid var(--border,#333);background:transparent;color:var(--text);font-family:var(--font-mono);font-size:0.8rem;" oninput="editorAutoAdd()">
                <span style="width:22px;"></span>
            </div>
            <button onclick="editorAddMember()" style="width:100%;margin-top:8px;padding:10px;border-radius:8px;background:rgba(212,184,118,0.12);border:1px solid rgba(212,184,118,0.25);color:var(--warning,#d4b876);font-weight:600;cursor:pointer;">${tt('ed_add_to', { group: escapeHtml(currentSet.name) })}</button>
        </div>
    `;

    // Delete group (if more than 1)
    if (allSets.length > 1) {
        html += `<button onclick="editorDeleteGroup()" style="display:block;margin:24px auto 0;padding:10px 20px;border-radius:8px;background:none;border:1px solid #c66;color:#c66;cursor:pointer;font-size:0.85rem;">${tt('ed_delete_group')}</button>`;
    }

    document.getElementById('groupEditorContent').innerHTML = html;
    overlay.classList.remove('hidden');
}

// Open the group editor primed for adding a special date (wedding, day you met...)
function openGroupEditorWithDateHint() {
    openGroupEditor(currentSetId);
    setTimeout(() => {
        const f = document.getElementById('editorPersonField');
        if (f) { f.placeholder = tt('tog_wedding_ph'); f.removeAttribute('readonly'); f.focus(); }
    }, 150);
}

function closeGroupEditor() {
    // Save any name change
    const nameInput = document.getElementById('editorGroupTitle');
    if (nameInput) {
        const newName = nameInput.value.trim();
        const currentSet = allSets.find(s => s.id === currentSetId);
        if (currentSet && newName && newName !== currentSet.name) {
            currentSet.name = newName;
            saveData();
        }
    }
    document.getElementById('groupEditorOverlay')?.classList.add('hidden');
    // Refresh whatever tab we're on
    selectedPersonIds = appData.events.map(e => e.id);
    renderPersonFilter();
    renderMilestonesTab();
    renderEventSetsList();
    renderPeopleTabGroups();
    updateSetSwitcher();
}

function editorAddMember() {
    const name = document.getElementById('editorPersonField')?.value?.trim();
    const dateStr = buildDateFromFields('editor');
    if (!name) { showToast(tt('toast_enter_name'), 'error'); return; }
    if (!dateStr) { showToast(tt('toast_enter_date'), 'error'); return; }
    if (!validateDateFields(dateStr)) return;
    const date = parseLocalDate(dateStr);

    if (!appData.events.some(e => e.name === name && e.date.getTime() === date.getTime())) {
        const newEvent = {
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
    showToast(tt('toast_added', { name: name }), 'success');
    openGroupEditor(); // Re-render
}

function editorUpdateMember(eventId, field, value) {
    const ev = appData.events.find(e => e.id === eventId);
    if (!ev) return;
    if (field === 'name' && value.trim()) {
        let v = value.trim();
        // The self-row is stored canonically as 'Me'. Its input is seeded with
        // the localized label (displayPersonName → "Jaz"/"Ich"); if the user
        // focuses and blurs without a real change, that label would be written
        // back and clobber 'Me', breaking === 'Me' logic (self-row delete-guard,
        // combined skip-self → double-counting). Keep 'Me' when the localized
        // label comes back unchanged. A genuine rename still goes through.
        if (ev.name === 'Me' && typeof tt === 'function' && v === tt('me_label')) v = 'Me';
        ev.name = v;
        saveData();
    }
}

function editorUpdateMemberDate(eventId, part, value) {
    const ev = appData.events.find(e => e.id === eventId);
    if (!ev) return;
    const d = ev.date instanceof Date ? ev.date : new Date(ev.date);
    const v = parseInt(value, 10);
    if (isNaN(v)) return;
    if (part === 'd' && v >= 1 && v <= 31) d.setDate(v);
    else if (part === 'm' && v >= 1 && v <= 12) d.setMonth(v - 1);
    else if (part === 'y' && v >= 1900 && v <= 2100) d.setFullYear(v);
    ev.date = d;
    saveData();
}

function editorRemoveMember(eventId) {
    appData.events = appData.events.filter(e => e.id !== eventId);
    // Clean up connections
    Object.keys(appData.connections).forEach(key => {
        if (key.includes(eventId)) delete appData.connections[key];
    });
    saveData();
    openGroupEditor(); // Re-render
}

function editorDeleteGroup() {
    if (allSets.length <= 1) { showToast(tt('toast_cannot_delete_last_group'), 'error'); return; }
    const currentSet = allSets.find(s => s.id === currentSetId);
    if (!confirm(tt('ed_delete_group_confirm', { name: currentSet ? currentSet.name : '' }))) return;
    allSets = allSets.filter(s => s.id !== currentSetId);
    currentSetId = allSets[0].id;
    loadCurrentSet();
    saveData();
    closeGroupEditor();
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
                ${escapeHtml(displayPersonName(e.name))}
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
            milestonesTitleEl.textContent = tt('dash_person_milestones', { name: person.name });
        }
    } else {
        const names = selectedPersonIds.map(id => {
            const person = appData.events.find(e => e.id === id);
            return person ? person.name : '';
        }).filter(n => n).join(' + ');
        milestonesTitleEl.textContent = tt('dash_names_combined', { names: names });
    }
}

// ============================================================
// MILESTONE CALCULATOR
// ============================================================

function calculateMilestone() {
    const number = parseInt(calcNumberInput.value, 10);
    const unit = calcUnitSelect.value;

    if (isNaN(number) || number <= 0) {
        showToast(tt('toast_enter_valid_number'), 'error');
        return;
    }

    // Determine which person(s) to calculate for
    const eventsToCalc = selectedPersonIds.length > 0
        ? appData.events.filter(e => selectedPersonIds.includes(e.id))
        : appData.events;

    if (eventsToCalc.length === 0) {
        showToast(tt('toast_no_events_calc'), 'error');
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
        const statusText = result.isPast ? tt('time_ago', { time: timeAgo }) : tt('wiz_in_time', { time: timeAgo });
        const titleText = result.isPast ? tt('calc_you_reached') : tt('calc_you_will_reach');

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
        showToast(tt('toast_enter_valid_year'), 'error');
        return false;
    }
    if (m < 1 || m > 12) {
        showToast(tt('toast_month_range'), 'error');
        return false;
    }
    // Check day-in-month (including leap years)
    const maxDay = new Date(y, m, 0).getDate();
    if (d < 1 || d > maxDay) {
        showToast(tt('toast_day_range', { max: maxDay, month: m }), 'error');
        return false;
    }
    // Future date warning
    const date = new Date(y, m - 1, d);
    if (date > new Date()) {
        showToast(tt('toast_future_date'), 'info', 4000);
    }
    return true;
}

// ============================================================
// Helper: render a tappable milestone row — click selects it for sharing
let _wizardSelectedRow = null;
let _wizardSelectedMsg = '';

// Bold north-east arrow \u2014 the app-wide "share" mark
function _shareArrowSvg(size) {
    const s = size || 15;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="18" x2="18" y2="6"/><polyline points="9 6 18 6 18 15"/></svg>';
}

// Visible share chip for hero milestones
function wizardHeroShareChip(shareText) {
    const safeMsg = shareText.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    return `<button class="hero-share-chip" onclick="event.stopPropagation();wizardSelectMsRow('','${safeMsg}')">${tt('wiz_share')} ${_shareArrowSvg(15)}</button>`;
}

function wizardMilestoneRow(displayText, dateStr, personName, extraClass) {
    const shareText = (personName ? personName + ': ' : '') + displayText + ' ' + tt('share_on') + ' ' + dateStr + ' \u2014 nicenumbers.app';
    const safeMsg = shareText.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    // Tapping a row shares it directly. During onboarding the affordance is
    // labelled ("Share" + arrow) to teach the gesture; the dashboard uses the
    // arrow alone once the user has learned it.
    // Two tight lines: value + share on top, full date (with year) below in
    // smaller text — fits any phone width without clipping
    return `<div class="wizard-milestone-row ${extraClass || ''}" onclick="wizardSelectMsRow('','${safeMsg}')" style="cursor:pointer;">
        <div class="wms-main">
            <span class="wizard-milestone-value">${displayText}</span>
            <span class="row-share">${tt('wiz_share')} ${_shareArrowSvg(14)}</span>
        </div>
        <div class="wizard-milestone-date">${dateStr}</div>
    </div>`;
}

// Row tapped -> straight to the native share sheet.
// (Kept the old two-arg signature \u2014 the 8.2 hero onclick also calls this.)
function wizardSelectMsRow(rowId, msg) {
    showSharePreview(msg);
}


// Helper: ensure clean wizard state (hide all non-wizard content)
function _wizardEnsureClean() {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    // Legacy floating share bubble — remove if a stale one is still around
    const bubble = document.getElementById('wizardShareBubble');
    if (bubble) bubble.remove();
    const profilePanel = document.getElementById('profilePanel');
    if (profilePanel) profilePanel.classList.add('hidden');
    const footer = document.querySelector('.app-footer');
    if (footer) footer.style.display = 'none';
    onboardingSection.classList.remove('hidden');
    tabNav.classList.add('hidden');
}

// ONBOARDING WIZARD (9-screen team flow)
// ============================================================

function wizardNext(step) {
    // Auto-accept consent on first wizard interaction
    if (!localStorage.getItem('happymoments_consent')) acceptConsent();

    // Auto-trigger combined milestone rendering when reaching Screen 7
    // Navigate, scroll to top, ensure settings hidden
    _lastWizardStep = step;
    _wizardEnsureClean();
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

// #6 Intro age-stats: a light "so far you've lived ..." line on the Me reveal —
// seconds + hours only (people get the idea), in the same understated style as
// the rest of the reveal, ending with a reassurance that the best numbers come
// not just from your own life but from the ones you share with others.
// Unit labels reuse the localized plural tables; only the two wrapper lines
// fall back to English until translated.
function renderAgeStatsStrip(date) {
    if (typeof getCurrentAgeStats !== 'function') return '';
    const stats = getCurrentAgeStats(date);
    if (!stats.seconds || !stats.hours) return '';
    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;
    const row = (val, unit) => `<div class="age-stats-line"><span class="age-stats-num">${val.toLocaleString(locale)}</span> <span class="age-stats-unit">${unit}</span></div>`;
    return `<div class="age-stats-strip">
            <div class="age-stats-intro">${tt('age_intro_lived')}</div>
            ${row(stats.seconds.value, localizedUnit(stats.seconds.value, 'seconds'))}
            ${row(stats.hours.value, localizedUnit(stats.hours.value, 'hours'))}
            <div class="age-stats-more">${tt('age_more_coming')}</div>
        </div>`;
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
        ? findAllUpcomingMilestones(date, 30, 730, appSettings || {}) : [];
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
            // Engine niceness: patterns (19191919) outrank bland rounds (320,000)
            if (!m.isCosmic && typeof nicenessGrade === 'function') score += nicenessGrade(m.value);
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

        const dateDisplay = formatMilestoneDate(m.date, { long: true });
        const countdown = typeof formatTimeDistance === 'function' ? formatTimeDistance(m.timeUntil) : '';

        // Emotional framing for countdown (Spotify Wrapped style)
        const daysAway = Math.ceil(m.timeUntil / (24*60*60*1000));
        let countdownText = '';
        if (m.timeUntil <= 0) {
            const daysPast = Math.abs(daysAway);
            countdownText = daysPast <= 1 ? tt('wiz_was_yesterday') : tt('wiz_passed_ago', { time: countdown });
        } else if (daysAway <= 1) {
            countdownText = tt('wiz_today_excl');
        } else if (daysAway <= 7) {
            countdownText = tt('wiz_this_week');
        } else if (daysAway <= 30) {
            countdownText = tt('wiz_coming_days', { count: daysAway, noun: plural(daysAway, 'day') });
        } else {
            countdownText = tt('wiz_in_time', { time: countdown });
        }

        // Build reveal HTML — clean, spacious, large type
        const heroShareMsg = name + ': ' + (m.isCosmic ? (m.description || m.unitName) : (m.value.toLocaleString() + ' ' + localizedUnit(m.value, m.unitName))) + ' on ' + formatMilestoneDate(m.date) + ' — nicenumbers.app';
        // Age-stats hook only on the "Me" reveal (Step 2), not friend reveals.
        const ageStripHtml = revealElId === 'wizardReveal' ? renderAgeStatsStrip(date) : '';
        if (m.isCosmic) {
            // Cosmic: show description as text (no animated number)
            revealEl.innerHTML = `
                <div class="wizard-reveal-number-wrap">
                    <div class="wizard-reveal-number" id="${revealElId}Number" style="font-size:1.4rem;">${escapeHtml(m.description)}</div>
                </div>
                <div class="hero-meta">
                    <div class="hero-meta-text">
                        <div class="wizard-reveal-date">${dateDisplay} &middot; <span class="wizard-reveal-countdown">${countdownText}</span></div>
                    </div>
                    ${wizardHeroShareChip(heroShareMsg)}
                </div>
                ${ageStripHtml}
            `;
        } else {
            revealEl.innerHTML = `
                <div class="wizard-reveal-number-wrap">
                    <div class="wizard-reveal-sparkle"></div>
                    <div class="wizard-reveal-number-line">
                        <span class="wizard-reveal-number" id="${revealElId}Number">0</span>
                        <span class="wizard-reveal-unit">${escapeHtml(localizedUnit(m.value, m.unitName))}</span>
                    </div>
                </div>
                <div class="hero-meta">
                    <div class="hero-meta-text">
                        <div class="wizard-reveal-date">${dateDisplay} &middot; <span class="wizard-reveal-countdown">${countdownText}</span></div>
                    </div>
                    ${wizardHeroShareChip(heroShareMsg)}
                </div>
                ${ageStripHtml}
            `;
        }

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

        // Start counter animation (skip for cosmic — already shows text)
        const numberEl = document.getElementById(revealElId + 'Number');
        if (numberEl && !m.isCosmic) {
            const targetValue = m.value;
            const duration = targetValue >= 1000000 ? 2000 : targetValue >= 10000 ? 1700 : 1500;
            setTimeout(() => {
                animateCounter(numberEl, targetValue, duration, () => {
                    if (step) {
                        step.classList.remove('reveal-counting');
                        step.classList.add('reveal-done');
                    }
                    // Reveal milestone list below hero (if exists)
                    const moreList = document.getElementById('friendMoreList');
                    if (moreList) setTimeout(() => { moreList.style.opacity = '1'; }, 1500);
                });
            }, 300);
        } else if (step) {
            // Cosmic: immediately show as done
            setTimeout(() => {
                step.classList.remove('reveal-counting');
                step.classList.add('reveal-done');
                const moreList = document.getElementById('friendMoreList');
                if (moreList) setTimeout(() => { moreList.style.opacity = '1'; }, 300);
            }, 500);
        }
    }
    return true;
}

// --- v5 Onboarding: Screen 1 → 2 (enter date → show billion reveal) ---
function wizardDiscoverV5() {
    _wizardEnsureClean();
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
    _lastWizardStep = 2;
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
    // If the hero reveal was cosmic, include it in the list so user sees it again
    const heroMs = window._wizardMilestone;
    const heroCosmic = heroMs && heroMs.isCosmic;
    let upcoming = milestones.filter(m => m.timeUntil > 0 && (!m.isCosmic || (heroCosmic && m.value === heroMs.value && m.unit === heroMs.unit)));
    // Don't repeat the non-cosmic hero (already shown as the big number on Screen 2)
    if (heroMs && !heroCosmic) upcoming = upcoming.filter(m => !(m.value === heroMs.value && m.unit === heroMs.unit));
    // Fallback: if nothing, include all upcoming
    if (upcoming.length === 0) upcoming = milestones.filter(m => m.timeUntil > 0);
    const count = upcoming.length;
    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;

    function renderMsRow(m) {
        const dateStr = formatMilestoneDate(m.date);
        const displayText = m.isCosmic ? (m.description || m.unitName) : (formatMilestoneValue(m.value, locale) + ' ' + localizedUnit(m.value, m.unitName));
        const isBig = !m.isCosmic && (m.isBigMilestone || m.isSaturnReturn || (m.value >= 10000 && m.value % 10000 === 0));
        return wizardMilestoneRow((isBig ? '\u2605 ' : '') + displayText, dateStr, tt('me_label'), isBig ? 'wizard-milestone-star' : '');
    }

    const TOP = 2;
    let topHtml = '';
    upcoming.slice(0, TOP).forEach(m => { topHtml += renderMsRow(m); });
    let moreHtml = '';
    upcoming.slice(TOP).forEach(m => { moreHtml += renderMsRow(m); });

    const heading = count > 0 ? tt('wiz_upcoming_title') : tt('wiz_calculating');
    el.innerHTML = `
        <h2 class="wizard-question">${heading}</h2>
        <div class="wizard-milestone-list">${topHtml}</div>
        ${moreHtml ? `<div id="wizMoreMs3" style="display:none;" class="wizard-milestone-list">${moreHtml}</div>
        <div id="wizMoreToggle3" style="cursor:pointer;color:var(--warning,#d4b876);padding:10px;text-align:center;font-size:0.85rem;" onclick="toggleMoreList('wizMoreMs3','wizMoreToggle3',${count - TOP},'milestone')">${_moreListLabel(count - TOP, 'milestone')}</div>` : ''}
    `;

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    document.getElementById('wizardStep3')?.classList.add('wizard-step-active');
    _lastWizardStep = 3;
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
    const upcoming = ms.filter(m => m.timeUntil > 0 && !m.isCosmic).sort((a, b) => a.timeUntil - b.timeUntil).slice(0, 6);

    let html = `<h2 class="wizard-question">${tt('wiz_their_milestones', { name: escapeHtml(friendEvent.name) })}</h2>`;
    html += '<div class="wizard-milestone-list">';
    upcoming.forEach(m => {
        const displayText = m.isCosmic ? (m.description || m.unitName) : (formatMilestoneValue(m.value, locale) + ' ' + localizedUnit(m.value, m.unitName));
        const dateStr = formatMilestoneDate(m.date);
        const isBig = !m.isCosmic && (m.isBigMilestone || m.isSaturnReturn || (m.value >= 10000 && m.value % 10000 === 0));
        html += wizardMilestoneRow((isBig ? '\u2605 ' : '') + displayText, dateStr, friendEvent.name, isBig ? 'wizard-milestone-star' : '');
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
            <p style="font-size:1rem;color:var(--text);text-align:center;font-style:italic;margin-bottom:8px;">${tt('wiz_together_label', { names: escapeHtml(namesStr) })}</p>
            <div class="wizard-reveal-number-wrap">
                <div class="wizard-reveal-number-line">
                    <span class="wizard-reveal-number" style="font-size:2.5rem;">${bestTarget.toLocaleString(locale)}</span>
                    <span class="wizard-reveal-unit">${tt('wiz_days_combined')}</span>
                </div>
            </div>
            <div class="hero-meta">
                <div class="hero-meta-text">
                    <div class="wizard-reveal-date">${dateDisplay} &middot; <span class="wizard-reveal-countdown">${tt('wiz_in_time', { time: bestDist.toLocaleString(locale) + ' ' + plural(bestDist, 'day') })}</span></div>
                </div>
                ${wizardHeroShareChip(namesStr + ': ' + bestTarget.toLocaleString(locale) + ' days combined on ' + dateDisplay + ' — nicenumbers.app')}
            </div>
        `;
    } else {
        el.innerHTML = `
            <h2 class="wizard-question">${tt('wiz_ms_ready')}</h2>
            <p style="color:var(--text-muted);text-align:center;font-style:italic;font-size:1.1rem;">${tt('wiz_add_more_combined')}</p>
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
                if (btn) { btn.textContent = '\u2713 ' + tt('toast_reminders_enabled'); btn.disabled = true; }
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
    const nameInput = document.getElementById('friendNameField');
    const showBtn = document.getElementById('wizardShowTheirBtn');
    // Child/Friend: always ask for actual name
    if (role === 'Child' || role === 'Friend') {
        if (nameInput) {
            nameInput.classList.remove('hidden');
            nameInput.value = '';
            nameInput.placeholder = role === 'Child' ? tt('wiz_child_name_ph') : tt('wiz_friend_name_ph');
            setTimeout(() => nameInput.focus(), 200);
        }
        if (showBtn) showBtn.textContent = tt('wiz_show_milestone');
    } else {
        if (nameInput) { nameInput.value = role; nameInput.classList.add('hidden'); }
        if (showBtn) showBtn.textContent = tt('wiz_show_role_ms', { name: role });
        const dayField = document.getElementById('friendDay');
        if (dayField) setTimeout(() => dayField.focus(), 200);
    }
}

function wizardSelectOther() {
    // Deselect all chips
    document.querySelectorAll('.wizard-role-chip').forEach(c => c.classList.remove('selected'));
    document.querySelector('.wizard-role-other')?.classList.add('selected');
    // Show and focus the text input
    const nameInput = document.getElementById('friendNameField');
    if (nameInput) { nameInput.classList.remove('hidden'); nameInput.value = ''; setTimeout(() => nameInput.focus(), 200); }
}

// --- Screen 3 → 4: Discover friend's milestone ---
function wizardDiscoverFriend() {
    const _t = (typeof I18N !== 'undefined' && I18N.t) ? I18N.t : (k => k);
    const name = document.getElementById('friendNameField')?.value?.trim();
    const dateStr = buildDateFromFields('friend');

    if (!name) {
        showToast(tt('toast_tap_role_or_name'), 'error');
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
            const displayText = friendM.isCosmic
                ? (friendM.description || friendM.unitName)
                : (friendM.value.toLocaleString() + ' ' + localizedUnit(friendM.value, friendM.unitName));
            const dateOpts = { month: 'long', day: 'numeric', year: 'numeric' };
            const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;
            const dateStr2 = friendM.date.toLocaleDateString(locale, dateOpts);
            shareMsg = `Did you know you reach ${displayText} on ${dateStr2}? That\u2019s worth celebrating! \ud83c\udf89 nicenumbers.app`;
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
    if (shareBtn) shareBtn.textContent = isRole ? tt('wiz_send_to_your', { name: name.toLowerCase() }) : tt('wiz_send_to', { name: name });

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
            navigator.share({ title: 'Nice Numbers', text: message }).catch(() => {});
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
    showSharePreview(message, friendName);
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
        showToast(tt('toast_tap_role_or_name'), 'error');
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
            navigator.share({ title: 'Nice Numbers for ' + name, text: message })
                .then(() => wizardNext(9))
                .catch(() => wizardNext(9));
        } else {
            navigator.clipboard.writeText(message).then(() => {
                showToast(tt('toast_copied_send', { name: name }), 'success');
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
        showToast(tt('toast_tap_role_or_name'), 'error');
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
    showToast(tt('toast_added_team', { name: name }), 'success');
    wizardShowCombined(true);
}

// ============================================================
// v2 ONBOARDING: organic flow (screens 4-8)
// Me → one person → combined → name group → add more → group reveal
// ============================================================

let _wizardGroupMembers = [];
let _wizardRevealedIds = new Set(); // Track which events had milestones revealed during onboarding

// --- Screen 4→5: Discover friend, show hero + milestones on one screen ---
function wizardDiscoverFriendV2() {
    _wizardEnsureClean();
    const _t = (typeof I18N !== 'undefined' && I18N.t) ? I18N.t : (k => k);
    const name = document.getElementById('friendNameField')?.value?.trim();
    const dateStr = buildDateFromFields('friend');

    console.log('[wizardDiscoverFriendV2] name:', name, 'dateStr:', dateStr);

    if (!name) { showToast(tt('toast_enter_name_first'), 'error'); return; }
    if (!dateStr) { showToast(tt('toast_enter_valid_date'), 'error'); return; }

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
        .sort((a, b) => a.timeUntil - b.timeUntil).slice(0, 8);
    if (upcoming.length === 0) upcoming = ms.filter(m => m.timeUntil > 0).slice(0, 8);

    // Don't repeat the hero (already shown as the big number above)
    const fHero = window._wizardFriendMilestone;
    if (fHero) upcoming = upcoming.filter(m => !(m.value === fHero.value && m.unit === fHero.unit));

    const moreEl = document.getElementById('wizardFriendMore');
    if (moreEl && upcoming.length > 0) {
        const TOP5 = 2;
        // Hidden initially — revealed after counter animation finishes
        let html = '<div id="friendMoreList" style="margin-top:12px;border-top:1px solid var(--border,#333);padding-top:10px;opacity:0;transition:opacity 0.5s ease;">';
        html += `<div style="font-size:0.75rem;color:var(--warning,#d4b876);text-transform:uppercase;letter-spacing:0.08em;padding:4px 0 6px;font-weight:600;">${tt('wiz_more_milestones')}</div>`;
        upcoming.slice(0, TOP5).forEach(m => {
            const displayText = m.isCosmic ? (m.description || m.unitName) : (formatMilestoneValue(m.value, locale) + ' ' + localizedUnit(m.value, m.unitName));
            const ds = formatMilestoneDate(m.date);
            html += wizardMilestoneRow(displayText, ds, name);
        });
        if (upcoming.length > TOP5) {
            html += `<div id="friendMoreExtra" style="display:none;">`;
            upcoming.slice(TOP5).forEach(m => {
                const displayText = m.isCosmic ? (m.description || m.unitName) : (formatMilestoneValue(m.value, locale) + ' ' + localizedUnit(m.value, m.unitName));
                const ds = formatMilestoneDate(m.date);
                html += wizardMilestoneRow(displayText, ds, name);
            });
            html += `</div>`;
            html += `<div id="friendMoreToggle" style="cursor:pointer;color:var(--warning,#d4b876);padding:8px;text-align:center;font-size:0.88rem;" onclick="toggleMoreList('friendMoreExtra','friendMoreToggle',${upcoming.length - TOP5})">${_moreListLabel(upcoming.length - TOP5)}</div>`;
        }
        html += '</div>';
        moreEl.innerHTML = html;
    }

    // Mark this person as "already revealed" so Screen 8 doesn't repeat them
    if (friendEvent) _wizardRevealedIds.add(friendEvent.id);

    window._wizardFriendName = name;
    // Big share button removed — milestone rows share directly per row

    _track('onboard_add_person', { event_count: appData.events.length });

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    document.getElementById('wizardStep5')?.classList.add('wizard-step-active');
    _lastWizardStep = 5;
    window.scrollTo(0, 0);
    onboardingSection.classList.remove('hidden');
    tabNav.classList.add('hidden');
}

// --- Screen 6: Combined milestone + name your group ---
function wizardShowCombinedAndName() {
    _wizardEnsureClean();
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
    const namesStr = names.join(' and ');

    // Use the REAL milestone algorithm for combined milestones
    const combinedMs = typeof findSumMilestonesForEvents === 'function'
        ? findSumMilestonesForEvents(appData.events, 20, 1825, appSettings || {}) : [];
    // Filter to non-cosmic, sort by proximity, pick best
    // Sort by date (nearest first) — show what's coming soon across all units
    const goodMs = combinedMs.filter(m => !m.isCosmic && m.timeUntil > 0)
        .sort((a, b) => a.timeUntil - b.timeUntil);

    // Pick the most impressive milestone within 6 months as hero
    const heroPool = goodMs.filter(m => m.timeUntil < 180 * 24*60*60*1000);
    let hero = heroPool[0]; // default: nearest
    heroPool.forEach(m => {
        const v = String(m.value);
        let score = 0;
        if (new Set(v).size === 1 && v.length >= 4) score += 80; // repdigit 4+ digits
        if (v === v.split('').reverse().join('') && v.length >= 5) score += 50; // long palindrome
        if (m.value >= 1000000 && m.value % 1000000 === 0) score += 60; // round million
        if (m.value >= 10000 && m.value % 10000 === 0) score += 40; // round 10k
        if (!hero || score > (hero._hscore || 0)) { m._hscore = score; hero = m; }
    });
    if (!hero && goodMs.length > 0) hero = goodMs[0];

    let bestTarget, bestDist, targetDate, dateDisplay;
    if (hero) {
        bestTarget = hero.value;
        bestDist = Math.ceil(hero.timeUntil / (24*60*60*1000));
        targetDate = hero.date;
        dateDisplay = formatMilestoneDate(hero.date, { long: true });
    } else {
        // Fallback to simple round number
        const candidates = [1000, 5000, 10000, 25000, 50000, 100000];
        bestTarget = 0; bestDist = Infinity;
        candidates.forEach(step => {
            const target = Math.ceil(totalDays / step) * step;
            const dist = target - totalDays;
            if (dist > 0 && dist < bestDist) { bestDist = dist; bestTarget = target; }
        });
        targetDate = new Date(now.getTime() + bestDist * 24 * 60 * 60 * 1000);
        dateDisplay = formatMilestoneDate(targetDate, { long: true });
    }

    // Auto-suggest group name based on role
    const FAMILY_ROLES = ['Mom', 'Dad', 'Partner', 'Sister', 'Brother', 'Child'];
    const lastPerson = appData.events[appData.events.length - 1];
    const suggestedName = lastPerson && FAMILY_ROLES.includes(lastPerson.name) ? tt('wiz_group_family')
        : (lastPerson && lastPerson.name === 'Friend' ? tt('wiz_group_friends') : tt('wiz_my_group_ph'));

    // Build more combined milestones — show 3, rest expandable
    const shown = new Set([hero ? hero.value + '_' + hero.unit : '']);
    const combinedList = [];
    goodMs.forEach(m => {
        const key = m.value + '_' + m.unit;
        if (shown.has(key)) return;
        shown.add(key);
        combinedList.push(m);
    });
    const TOP6 = 2;
    let moreCombinedHtml = '';
    combinedList.slice(0, TOP6).forEach(m => {
        const displayText = formatMilestoneValue(m.value, locale) + ' ' + localizedUnit(m.value, m.unitName || m.unit);
        moreCombinedHtml += wizardMilestoneRow(displayText, formatMilestoneDate(m.date), namesStr);
    });
    let extraCombinedHtml = '';
    combinedList.slice(TOP6).forEach(m => {
        const displayText = formatMilestoneValue(m.value, locale) + ' ' + localizedUnit(m.value, m.unitName || m.unit);
        extraCombinedHtml += wizardMilestoneRow(displayText, formatMilestoneDate(m.date), namesStr);
    });

    el.innerHTML = `
        <p style="font-size:1rem;color:var(--text);text-align:center;margin-bottom:8px;">${tt('wiz_dates_only_share', { name: escapeHtml(namesStr.replace(/^Me and |^You and /i, '')) })}</p>
        <div class="wizard-reveal-number-wrap">
            <div class="wizard-reveal-number-line">
                <span class="wizard-reveal-number" style="font-size:2.5rem;">${bestTarget.toLocaleString(locale)}</span>
                <span class="wizard-reveal-unit">${tt('wiz_units_combined', { unit: hero ? localizedUnit(bestTarget, hero.unitName || hero.unit) : localizedUnit(2, 'days') })}</span>
            </div>
        </div>
        <div class="hero-meta">
            <div class="hero-meta-text">
                <div class="wizard-reveal-date">${dateDisplay} &middot; <span class="wizard-reveal-countdown">${tt('wiz_in_time', { time: bestDist.toLocaleString(locale) + ' ' + plural(bestDist, 'day') })}</span></div>
            </div>
            ${wizardHeroShareChip(namesStr + ': ' + bestTarget.toLocaleString(locale) + ' ' + (hero ? localizedUnit(bestTarget, hero.unitName || hero.unit) : localizedUnit(2, 'days')) + ' combined on ' + dateDisplay + ' — nicenumbers.app')}
        </div>
        ${moreCombinedHtml ? `<div style="margin-top:14px;border-top:1px solid var(--border,#333);padding-top:10px;"><div style="font-size:0.75rem;color:var(--warning);text-transform:uppercase;letter-spacing:0.08em;padding:4px 0 6px;font-weight:600;">${tt('wiz_more_together')}</div><div class="wizard-milestone-list">${moreCombinedHtml}</div>${extraCombinedHtml ? `<div id="wizCombExtra6" style="display:none;" class="wizard-milestone-list">${extraCombinedHtml}</div><div id="wizCombToggle6" style="cursor:pointer;color:var(--warning,#d4b876);padding:8px;text-align:center;font-size:0.88rem;" onclick="toggleMoreList('wizCombExtra6','wizCombToggle6',${combinedList.length - TOP6})">${_moreListLabel(combinedList.length - TOP6)}</div>` : ''}</div>` : ''}
        <div style="border-top:1px solid var(--border,#333);margin-top:14px;padding-top:12px;">
            <div style="font-size:0.8rem;color:var(--warning,#d4b876);text-transform:uppercase;letter-spacing:0.08em;font-weight:600;margin-bottom:6px;">${tt('wiz_name_first_group')}</div>
            <input type="text" id="groupTitleInput" name="hm_f6" class="wizard-input" value="" placeholder="${escapeHtml(suggestedName)}" readonly onfocus="this.removeAttribute('readonly');if(!this.value)this.value='${escapeHtml(suggestedName)}';this.select();" style="text-align:center;font-size:1.1rem;background:transparent;border:1.5px solid rgba(212,184,118,0.55);color:var(--text);padding:10px;border-radius:8px;width:100%;" autocomplete="off" data-lpignore="true" data-1p-ignore>
        </div>
    `;

    const addMoreBtn = document.getElementById('wizardAddMoreBtn6');
    if (addMoreBtn) {
        addMoreBtn.textContent = tt('wiz_add_more_btn', { group: suggestedName });
        addMoreBtn.style.fontSize = '1.05rem';
    }

    _track('onboard_combined_reveal', { event_count: appData.events.length });

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    const step6El = document.getElementById('wizardStep6');
    step6El?.classList.add('wizard-step-active');
    step6El?.classList.remove('wizard-step-top'); // tall content — keep centered layout
    _lastWizardStep = 6;
    window.scrollTo(0, 0);
}

// --- Screen 7: Group builder (Me + Person 2 pre-filled) ---
function wizardGoToGroupBuilder() {
    _wizardEnsureClean();
    const groupName = document.getElementById('groupTitleInput')?.value?.trim() || tt('wiz_group_family');

    // Rename the current set
    const currentSet = allSets.find(s => s.id === currentSetId);
    if (currentSet) currentSet.name = groupName;
    saveData();

    const title = document.getElementById('groupBuilderTitle');
    if (title) title.value = groupName;

    // Pre-fill member list with existing events
    _wizardGroupMembers = [...appData.events];
    wizardRenderGroupMembers();

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    document.getElementById('wizardStep7')?.classList.add('wizard-step-active');
    _lastWizardStep = 7;
    window.scrollTo(0, 0);
}

function wizardRenderGroupMembers() {
    const el = document.getElementById('groupMembers');
    if (!el) return;
    let html = '';
    _wizardGroupMembers.forEach(m => {
        const d = m.date instanceof Date ? m.date : new Date(m.date);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        // Editable rows \u2014 name and date can be corrected in place
        html += `<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:6px;">
            <input type="text" value="${escapeHtml(displayPersonName(m.name))}" onchange="wizardEditMember('${m.id}','name',this.value)" autocomplete="hm-no-fill" data-lpignore="true" data-1p-ignore readonly style="flex:1;min-width:0;padding:5px 8px;border-radius:6px;border:1px solid transparent;background:transparent;color:var(--text);font-size:0.95rem;" onfocus="this.removeAttribute('readonly');this.style.borderColor='var(--border,#444)'" onblur="this.style.borderColor='transparent'">
            <input type="text" inputmode="numeric" value="${dd}" onchange="wizardEditMemberDate('${m.id}','d',this.value)" maxlength="2" style="width:2em;padding:5px 2px;text-align:center;border-radius:6px;border:1px solid transparent;background:transparent;color:var(--text-muted);font-size:0.88rem;" onfocus="this.style.borderColor='var(--border,#444)'" onblur="this.style.borderColor='transparent'">
            <span style="color:var(--text-muted);font-size:0.8rem;">/</span>
            <input type="text" inputmode="numeric" value="${mm}" onchange="wizardEditMemberDate('${m.id}','m',this.value)" maxlength="2" style="width:2em;padding:5px 2px;text-align:center;border-radius:6px;border:1px solid transparent;background:transparent;color:var(--text-muted);font-size:0.88rem;" onfocus="this.style.borderColor='var(--border,#444)'" onblur="this.style.borderColor='transparent'">
            <span style="color:var(--text-muted);font-size:0.8rem;">/</span>
            <input type="text" inputmode="numeric" value="${yyyy}" onchange="wizardEditMemberDate('${m.id}','y',this.value)" maxlength="4" style="width:3em;padding:5px 2px;text-align:center;border-radius:6px;border:1px solid transparent;background:transparent;color:var(--text-muted);font-size:0.88rem;" onfocus="this.style.borderColor='var(--border,#444)'" onblur="this.style.borderColor='transparent'">
            ${m.name !== 'Me' ? `<button onclick="wizardRemoveMember('${m.id}')" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.05rem;padding:2px 5px;" title="${tt('ed_remove')}">&times;</button>` : '<span style="width:22px;"></span>'}
        </div>`;
    });
    el.innerHTML = html;

    // Show continue button when 3+ members (Me + 2 others)
    const btn = document.getElementById('groupContinueBtn');
    // Show continue once there are 2+ members (Me + at least 1 other)
    if (btn) btn.style.display = _wizardGroupMembers.length >= 2 ? '' : 'none';
}

// Group title edited in place \u2014 rename the current set
function wizardGroupTitleChanged(value) {
    const name = (value || '').trim();
    if (!name) return;
    const currentSet = allSets.find(s => s.id === currentSetId);
    if (currentSet) { currentSet.name = name; saveData(); }
}

// Inline edits in the group builder reuse the group-editor update logic
function wizardEditMember(eventId, field, value) {
    editorUpdateMember(eventId, field, value);
}

function wizardEditMemberDate(eventId, part, value) {
    editorUpdateMemberDate(eventId, part, value);
}

function wizardRemoveMember(eventId) {
    _wizardGroupMembers = _wizardGroupMembers.filter(m => m.id !== eventId);
    const idx = appData.events.findIndex(e => e.id === eventId);
    if (idx >= 0) { appData.events.splice(idx, 1); saveData(); }
    wizardRenderGroupMembers();
}

function wizardSelectRoleGroup(btn, role) {
    document.querySelectorAll('#wizardRoleChipsGroup .wizard-role-chip').forEach(c => c.classList.remove('selected'));
    btn.classList.add('selected');
    const nameInput = document.getElementById('groupPersonField');
    if (role === 'Child' || role === 'Friend') {
        if (nameInput) {
            nameInput.classList.remove('hidden');
            nameInput.value = '';
            nameInput.placeholder = role === 'Child' ? tt('wiz_child_name_ph') : tt('wiz_friend_name_ph');
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
    const nameInput = document.getElementById('groupPersonField');
    if (nameInput) { nameInput.classList.remove('hidden'); nameInput.value = ''; setTimeout(() => nameInput.focus(), 200); }
}

function wizardAddGroupMember() {
    const _t = (typeof I18N !== 'undefined' && I18N.t) ? I18N.t : (k => k);
    const name = document.getElementById('groupPersonField')?.value?.trim();
    const dateStr = buildDateFromFields('group');

    if (!name) { showToast(tt('toast_tap_role_or_name'), 'error'); return; }
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
    const nameInput = document.getElementById('groupPersonField');
    if (nameInput) { nameInput.value = ''; nameInput.focus(); }
    ['Day', 'Month', 'Year'].forEach(f => {
        const el = document.getElementById('group' + f);
        if (el) el.value = '';
    });

    showToast(tt('toast_added', { name: name }), 'success');
    _track('onboard_add_group_member', { event_count: appData.events.length });

    // Scroll form into view so next entry is immediately visible
    const form = document.getElementById('groupAddForm');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// --- Screen 8: Two-phase group reveal ---
// Phase 1: Individual milestones per member ("reach out to each person")
// Phase 2: Combined team milestones ("celebrate together")

function wizardShowGroupReveal() {
    _wizardEnsureClean();
    const el = document.getElementById('wizardGroupReveal');
    if (!el) return;

    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;
    const groupName = document.getElementById('groupBuilderTitle')?.value?.trim() || tt('wiz_group_family');

    // Phase 1: Individual milestones — only for NEW members (not already revealed)
    // 1 member: show 3 milestones + expand. 2+ members: show 1 each + expand per person.
    let individualHtml = '';
    let newMemberCount = 0;
    const newMembers = appData.events.filter(e => e.name !== 'Me' && !_wizardRevealedIds.has(e.id));

    function _sortMs(ms) {
        // Niceness grade drives ranking — patterns above bland rounds
        const g = (m) => (typeof nicenessGrade === 'function' ? nicenessGrade(m.value) : 0)
            + (m.isBigMilestone ? 15 : 0)
            + Math.max(0, 30 - m.timeUntil / (24*60*60*1000) * 0.08);
        return ms.filter(m => m.timeUntil > 0 && !m.isCosmic).sort((a, b) => g(b) - g(a));
    }

    newMembers.forEach(e => {
        const d = e.date instanceof Date ? e.date : new Date(e.date);
        const ms = typeof findAllUpcomingMilestones === 'function'
            ? findAllUpcomingMilestones(d, 20, 730, appSettings || {}) : [];
        const sorted = _sortMs(ms);
        if (sorted.length === 0) return;

        if (newMembers.length === 1) {
            // Single new member: show 2 milestones + expand the rest
            const top = sorted.slice(0, 2);
            const rest = sorted.slice(2);
            top.forEach(m => {
                const val = formatMilestoneValue(m.value, locale);
                const unit = localizedUnit(m.value, m.unitName || m.unit || '');
                individualHtml += wizardMilestoneRow(escapeHtml(e.name) + ': ' + val + ' ' + unit, formatMilestoneDate(m.date), e.name);
            });
            if (rest.length > 0) {
                const uid = 'phase1more_' + e.id.replace(/[^a-z0-9]/gi, '');
                individualHtml += `<div id="${uid}" style="display:none;">`;
                rest.forEach(m => {
                    const val = formatMilestoneValue(m.value, locale);
                    const unit = localizedUnit(m.value, m.unitName || m.unit || '');
                    individualHtml += wizardMilestoneRow(escapeHtml(e.name) + ': ' + val + ' ' + unit, formatMilestoneDate(m.date), e.name);
                });
                individualHtml += `</div>`;
                individualHtml += `<div id="${uid}t" style="cursor:pointer;color:var(--warning,#d4b876);padding:8px;text-align:center;font-size:0.88rem;" onclick="toggleMoreList('${uid}','${uid}t',${rest.length})">${_moreListLabel(rest.length)}</div>`;
            }
        } else {
            // Multiple new members: show 1 best each + expand per person
            const best = sorted[0];
            const val = formatMilestoneValue(best.value, locale);
            const unit = localizedUnit(best.value, best.unitName || best.unit || '');
            individualHtml += wizardMilestoneRow(escapeHtml(e.name) + ': ' + val + ' ' + unit, formatMilestoneDate(best.date), e.name);
            if (sorted.length > 1) {
                const uid = 'phase1more_' + e.id.replace(/[^a-z0-9]/gi, '');
                individualHtml += `<div id="${uid}" style="display:none;">`;
                sorted.slice(1, 8).forEach(m => {
                    const val2 = formatMilestoneValue(m.value, locale);
                    const unit2 = localizedUnit(m.value, m.unitName || m.unit || '');
                    individualHtml += wizardMilestoneRow(escapeHtml(e.name) + ': ' + val2 + ' ' + unit2, formatMilestoneDate(m.date), e.name);
                });
                individualHtml += `</div>`;
                individualHtml += `<div id="${uid}t" style="cursor:pointer;color:var(--warning,#d4b876);padding:6px;text-align:center;font-size:0.88rem;" onclick="toggleMoreList('${uid}','${uid}t',0,null,'wiz_more_arrow','wiz_less_arrow')">${tt('wiz_more_arrow')}</div>`;
            }
        }
        newMemberCount++;
    });

    // If no new members to show, skip Phase 1 → go straight to Phase 2
    if (newMemberCount === 0) {
        wizardShowTeamMilestones();
        return;
    }

    el.innerHTML = `
        <h2 class="wizard-question" style="font-size:1.4rem;line-height:1.4;margin-top:0;margin-bottom:var(--space-md);">${tt('wiz_imagine_face')}</h2>
        <div class="wizard-milestone-list">${individualHtml}</div>
    `;

    _track('onboard_group_reveal_individual', { members: newMemberCount });

    // Update buttons: Phase 1 forward action = combined milestones, always primary (gold)
    const shareBtn8 = document.getElementById('wizardShareBtn8');
    if (shareBtn8) {
        shareBtn8.classList.add('wizard-btn');
        shareBtn8.classList.remove('wizard-btn-secondary');
        shareBtn8.textContent = tt('wiz_your_combined');
        shareBtn8.onclick = function() { wizardShowTeamMilestones(); };
    }

    // Hide "Who else?" and dashboard during Phase 1 — too early; they appear in Phase 2
    const createAnotherBtn = document.getElementById('wizardCreateAnotherBtn8');
    if (createAnotherBtn) createAnotherBtn.style.display = 'none';
    const dashboardBtn8P1 = document.getElementById('wizardDashboardBtn8');
    if (dashboardBtn8P1) dashboardBtn8P1.style.display = 'none';

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    const step8El = document.getElementById('wizardStep8');
    step8El?.classList.add('wizard-step-active');
    step8El?.classList.add('wizard-step-top'); // top-align: short content, avoid big gap above
    _lastWizardStep = 8;
    window.scrollTo(0, 0);
}

// --- Screen 8 Phase 2: Team combined milestones ---
function wizardShowTeamMilestones() {
    const el = document.getElementById('wizardGroupReveal');
    if (!el) return;

    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;
    const groupName = document.getElementById('groupBuilderTitle')?.value?.trim() || tt('wiz_group_family');

    const combinedMs = typeof findSumMilestonesForEvents === 'function'
        ? findSumMilestonesForEvents(appData.events, 20, 1825, appSettings || {}) : [];
    const goodMs = combinedMs.filter(m => !m.isCosmic && m.timeUntil > 0)
        .sort((a, b) => {
            let sa = 0, sb = 0;
            const va = String(a.value), vb = String(b.value);
            // Repdigits (e.g. 888888) — highest aesthetic value
            if (new Set(va).size === 1) sa += 80;
            if (new Set(vb).size === 1) sb += 80;
            // Palindromes (e.g. 12321)
            if (va === va.split('').reverse().join('') && new Set(va).size > 1) sa += 60;
            if (vb === vb.split('').reverse().join('') && new Set(vb).size > 1) sb += 60;
            // Round thousands — only reward if compact (<=6 digits)
            if (a.value >= 1000 && a.value % 1000 === 0 && va.length <= 6) sa += 40;
            if (b.value >= 1000 && b.value % 1000 === 0 && vb.length <= 6) sb += 40;
            // Aesthetic penalty: numbers with >50% zero digits look ugly (e.g. 3190000000)
            const zerosA = (va.match(/0/g) || []).length;
            const zerosB = (vb.match(/0/g) || []).length;
            if (va.length > 6 && zerosA / va.length > 0.5) sa -= 40;
            if (vb.length > 6 && zerosB / vb.length > 0.5) sb -= 40;
            // Proximity bonus (within 60 days)
            sa += Math.max(0, 60 - a.timeUntil / (24*60*60*1000) * 0.03);
            sb += Math.max(0, 60 - b.timeUntil / (24*60*60*1000) * 0.03);
            return sb - sa;
        });

    const hero = goodMs[0];
    // Skip hero from the list (it's shown as the big number above); dedupe; 3 visible + expandable rest
    const rows = [];
    const shown = new Set([hero ? hero.value + '_' + hero.unit : '']);
    goodMs.forEach(m => {
        const key = m.value + '_' + m.unit;
        if (rows.length >= 8 || shown.has(key)) return;
        shown.add(key);
        rows.push(m);
    });
    let combinedHtml = '';
    rows.slice(0, 2).forEach(m => {
        const dt = formatMilestoneValue(m.value, locale) + ' ' + localizedUnit(m.value, m.unitName || m.unit);
        combinedHtml += wizardMilestoneRow(dt, formatMilestoneDate(m.date), groupName);
    });
    let combinedExtraHtml = '';
    rows.slice(2).forEach(m => {
        const dt = formatMilestoneValue(m.value, locale) + ' ' + localizedUnit(m.value, m.unitName || m.unit);
        combinedExtraHtml += wizardMilestoneRow(dt, formatMilestoneDate(m.date), groupName);
    });

    el.innerHTML = `
        <h2 class="wizard-question" style="font-size:1.4rem;line-height:1.35;margin-top:0;margin-bottom:var(--space-sm);">${tt('wiz_belong_all')}</h2>
        ${hero ? `
            <div style="cursor:pointer;" onclick="wizardSelectMsRow('heroTeam','${(groupName + ': ' + hero.value.toLocaleString(locale) + ' ' + localizedUnit(hero.value, hero.unitName || hero.unit) + ' combined on ' + formatMilestoneDate(hero.date) + ' \\u2014 nicenumbers.app').replace(/'/g, "\\'")    }')">
            <div class="wizard-reveal-number-wrap">
                <div class="wizard-reveal-number-line">
                    <span class="wizard-reveal-number" style="font-size:2rem;margin:6px 0 2px;">${hero.value.toLocaleString(locale)}</span>
                    <span class="wizard-reveal-unit" style="font-size:1.3rem;">${tt('wiz_units_combined', { unit: localizedUnit(hero.value, hero.unitName || hero.unit) })}</span>
                </div>
            </div>
            <div class="hero-meta">
                <div class="hero-meta-text">
                    <div class="wizard-reveal-date" style="font-size:1.05rem;margin-bottom:0;">${formatMilestoneDate(hero.date, { long: true })} &middot; <span class="wizard-reveal-countdown" style="font-size:1.05rem;">${tt('wiz_in_time', { time: Math.ceil(hero.timeUntil / (24*60*60*1000)).toLocaleString(locale) + ' ' + plural(Math.ceil(hero.timeUntil / (24*60*60*1000)), 'day') })}</span></div>
                </div>
                <button class="hero-share-chip">${tt('wiz_share')} ${_shareArrowSvg(15)}</button>
            </div>
            </div>
        ` : ''}
        ${combinedHtml ? `<div style="margin-top:10px;border-top:1px solid var(--border,#333);padding-top:8px;"><div class="wizard-milestone-list">${combinedHtml}</div>${combinedExtraHtml ? `<div id="wizTeamExtra8" style="display:none;" class="wizard-milestone-list">${combinedExtraHtml}</div><div id="wizTeamToggle8" style="cursor:pointer;color:var(--warning,#d4b876);padding:6px;text-align:center;font-size:0.88rem;" onclick="toggleMoreList('wizTeamExtra8','wizTeamToggle8',${rows.length - 3})">${_moreListLabel(rows.length - 3)}</div>` : ''}</div>` : ''}
    `;

    // Restore buttons for Phase 2 \u2014 the forward action is ALWAYS the single
    // primary (gold) button; no post-share class swapping (removed: it left
    // inverted button styles on every later visit to this screen)
    // Stage-dependent CTA stack (one template, journey-aware):
    // first group  -> the job is converting one group into two: primary = add another group
    // later groups -> the job is handing over to the app: primary = dashboard.
    // Milestones are shared per-row now; the big share button is gone.
    const shareBtn8 = document.getElementById('wizardShareBtn8');
    const isFirstGroup = allSets.length <= 1;
    if (shareBtn8) {
        shareBtn8.classList.add('wizard-btn');
        shareBtn8.classList.remove('wizard-btn-secondary');
        if (isFirstGroup) {
            shareBtn8.innerHTML = tt('wiz_who_else') + '<span style="display:block;font-weight:400;margin-top:2px;white-space:nowrap;font-size:1.05rem;">' + tt('wiz_who_else_sub') + '</span>';
            shareBtn8.onclick = function() { wizardCreateAnotherGroup(); };
        } else {
            shareBtn8.innerHTML = tt('wiz_go_dashboard') + '<span style="display:block;font-weight:400;margin-top:2px;white-space:nowrap;font-size:1.05rem;">' + tt('wiz_explore_tabs') + '</span>';
            shareBtn8.onclick = function() { wizardFinish(); };
        }
    }

    // "One more group" only AFTER the first group (the primary covers it before)
    const createAnotherBtn = document.getElementById('wizardCreateAnotherBtn8');
    if (createAnotherBtn) {
        if (isFirstGroup) {
            createAnotherBtn.style.display = 'none';
        } else {
            createAnotherBtn.style.display = '';
            createAnotherBtn.classList.add('wizard-btn-secondary');
            createAnotherBtn.classList.remove('wizard-btn');
            createAnotherBtn.textContent = tt('wiz_one_more_group');
        }
    }
    // Quiet dashboard exit on the FIRST pass only — the door is never locked,
    // but it doesn't compete with the primary. Later passes have it as primary.
    const dashboardBtn8 = document.getElementById('wizardDashboardBtn8');
    if (dashboardBtn8) {
        if (isFirstGroup) {
            dashboardBtn8.style.display = '';
            dashboardBtn8.classList.add('wizard-btn-secondary');
            dashboardBtn8.classList.remove('wizard-btn');
            dashboardBtn8.innerHTML = tt('wiz_go_dashboard') + '<span style="display:block;font-weight:400;margin-top:2px;white-space:nowrap;font-size:0.88rem;opacity:0.85;">' + tt('wiz_explore_tabs') + '</span>';
        } else {
            dashboardBtn8.style.display = 'none';
        }
    }

    _track('onboard_group_reveal_combined', { members: appData.events.length });
    window.scrollTo(0, 0);
}

// --- Screen 9: Share screen — show each person's best milestone with share buttons ---
function wizardBuildShareScreen() {
    _wizardEnsureClean();
    const el = document.getElementById('wizardShareScreen');
    if (!el) return;

    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;
    let html = '<h2 class="wizard-question" style="font-size:1.4rem;margin-top:0;margin-bottom:var(--space-md);">Tell your people — each has a milestone worth sharing</h2>';

    // For each person (skip "Me"), find their best upcoming milestones
    appData.events.forEach(e => {
        if (e.name === 'Me') return;
        const d = e.date instanceof Date ? e.date : new Date(e.date);
        const ms = typeof findAllUpcomingMilestones === 'function'
            ? findAllUpcomingMilestones(d, 8, 365, appSettings || {}) : [];
        const sorted = ms.filter(m => m.timeUntil > 0 && !m.isCosmic)
            .sort((a, b) => {
                let sa = 0, sb = 0;
                if (a.value >= 1000 && a.value % 1000 === 0) sa += 100;
                if (b.value >= 1000 && b.value % 1000 === 0) sb += 100;
                if (a.isBigMilestone) sa += 80;
                if (b.isBigMilestone) sb += 80;
                sa += Math.max(0, 50 - a.timeUntil / (24*60*60*1000) * 0.15);
                sb += Math.max(0, 50 - b.timeUntil / (24*60*60*1000) * 0.15);
                return sb - sa;
            });
        let best = sorted[0];
        if (!best && ms.length > 0) best = ms.filter(m => m.timeUntil > 0)[0];
        if (best) {
            const val = formatMilestoneValue(best.value, locale);
            const unit = localizedUnit(best.value, best.unitName || best.unit || '');
            const ds = formatMilestoneDate(best.date);
            const shareText = 'Did you know you turn ' + val + ' ' + unit + ' on ' + ds + '? nicenumbers.app';
            const uid = 'share9more_' + e.id.replace(/[^a-z0-9]/gi, '');
            // More milestones for this person — each row shareable
            let moreRows = '';
            sorted.slice(1, 4).forEach(m => {
                const v2 = formatMilestoneValue(m.value, locale);
                const u2 = localizedUnit(m.value, m.unitName || m.unit || '');
                const ds2 = formatMilestoneDate(m.date);
                const st2 = 'Did you know you turn ' + v2 + ' ' + u2 + ' on ' + ds2 + '? nicenumbers.app';
                moreRows += `<div onclick="wizardShareForPerson('${e.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}', '${st2.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}')" style="display:flex;justify-content:space-between;gap:8px;padding:6px 4px;border-top:1px solid rgba(255,255,255,0.06);cursor:pointer;">
                    <span style="color:var(--text);font-size:0.85rem;">${v2} ${u2}</span>
                    <span style="color:var(--text-muted);font-size:0.8rem;">${ds2}</span>
                </div>`;
            });
            html += `<div style="padding:10px 12px;background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:8px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                    <span style="color:var(--text);font-weight:600;">${escapeHtml(e.name)}</span>
                    <span style="color:var(--text-muted);font-size:0.8rem;">${val} ${unit} &middot; ${ds}</span>
                </div>
                <button class="wizard-btn-secondary" onclick="wizardShareForPerson('${e.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}', '${shareText.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}')" style="padding:10px 12px;font-size:0.95rem;width:100%;margin-top:0;">${tt('wiz_share_with', { name: escapeHtml(e.name) })}</button>
                ${moreRows ? `<div id="${uid}" style="display:none;margin-top:6px;">${moreRows}</div>
                <div id="${uid}t" style="cursor:pointer;color:var(--warning,#d4b876);padding:5px;text-align:center;font-size:0.88rem;" onclick="toggleMoreList('${uid}','${uid}t',0,null,'wiz_more_ms_arrow','wiz_less_arrow')">${tt('wiz_more_ms_arrow')}</div>` : ''}
            </div>`;
        }
    });

    if (appData.events.length <= 1) {
        html += '<p style="color:var(--text-muted);text-align:center;font-style:italic;">' + tt('wiz_add_people_share') + '</p>';
    }

    el.innerHTML = html;

    // Hide "Add another group" button if user already created one during onboarding
    const addGroupBtn9 = document.getElementById('wizardAddGroupBtn9');
    if (addGroupBtn9) {
        addGroupBtn9.style.display = allSets.length >= 2 ? 'none' : '';
    }

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    const step9El = document.getElementById('wizardStep9');
    step9El?.classList.add('wizard-step-active');
    step9El?.classList.add('wizard-step-top');
    _lastWizardStep = 9;
    window.scrollTo(0, 0);
}

function wizardShareForPerson(name, message) {
    showSharePreview(message, name);
    _track('onboard_share_person', { name: name });
}

function wizardShareGroup() {
    const groupName = document.getElementById('groupBuilderTitle')?.value?.trim() || tt('wiz_group_family');
    const message = 'Our ' + groupName + ' group has amazing milestones coming! Discover yours at nicenumbers.app';
    showSharePreview(message, groupName);
    _track('onboard_share_group');
}

function wizardCreateAnotherGroup() {
    // Ask for group name via the combined screen (Screen 6) repurposed
    const el = document.getElementById('wizardCombinedAndName');
    if (!el) return;

    // Age-appropriate examples for creating a second group
    const meEvent = allSets[0] ? (allSets[0].events.find(e => e.name === 'Me') || allSets[0].events[0]) : null;
    const userAge = meEvent ? Math.floor((Date.now() - new Date(meEvent.date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 30;

    // Examples about OTHER people (third person) \u2014 they illustrate, not address the user
    let groupExamples;
    if (userAge <= 20) {
        // School / class context
        groupExamples = [
            tt('wiz_ex_school_1'),
            tt('wiz_ex_school_2'),
            tt('wiz_ex_school_3')
        ];
    } else if (userAge <= 25) {
        // University / early career
        groupExamples = [
            tt('wiz_ex_uni_1'),
            tt('wiz_ex_uni_2'),
            tt('wiz_ex_uni_3')
        ];
    } else {
        // Office / adult life
        groupExamples = [
            tt('wiz_ex_office_1'),
            tt('wiz_ex_office_2'),
            tt('wiz_ex_office_3')
        ];
    }
    const groupExample = groupExamples[Math.floor(Math.random() * groupExamples.length)];

    el.innerHTML = `
        <p style="color:var(--text);text-align:center;font-size:1rem;font-style:italic;margin-bottom:16px;line-height:1.5;">${groupExample}</p>
        <div style="font-size:0.8rem;color:var(--warning,#d4b876);text-transform:uppercase;letter-spacing:0.08em;font-weight:600;margin-bottom:6px;">${tt('wiz_name_new_team')}</div>
        <input type="text" id="groupTitleInput" name="hm_f7" class="wizard-input" value="" placeholder="${tt('wiz_group_friends')}" readonly onfocus="this.removeAttribute('readonly');if(!this.value)this.value='${tt('wiz_group_friends').replace(/'/g, "\\'")}';this.select();" style="text-align:center;font-size:1.1rem;background:transparent;border:1.5px solid rgba(212,184,118,0.55);color:var(--text);padding:10px;border-radius:8px;width:100%;" autocomplete="off" data-lpignore="true" data-1p-ignore>
    `;

    // Update buttons for "create another group" context
    const addMoreBtn = document.getElementById('wizardAddMoreBtn6');
    if (addMoreBtn) {
        addMoreBtn.textContent = tt('wiz_add_people_combined');
        addMoreBtn.style.fontSize = '1.05rem';
        addMoreBtn.onclick = function() { wizardCreateGroupAndBuild(); };
    }
    // Hide "Explore milestones now" — it's a leak in this context
    const exploreBtn = addMoreBtn?.nextElementSibling;
    if (exploreBtn && exploreBtn.textContent.includes('Explore')) exploreBtn.style.display = 'none';

    // Fix back button: should go to Screen 8 (where "Create another group" was), not Screen 5
    const backBtn = document.querySelector('#wizardStep6 .wizard-back');
    if (backBtn) backBtn.setAttribute('onclick', 'wizardNext(8)');

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    const step6El = document.getElementById('wizardStep6');
    step6El?.classList.add('wizard-step-active');
    step6El?.classList.add('wizard-step-top'); // short content — avoid big gap above
    _lastWizardStep = 6;
    window.scrollTo(0, 0);
}

function wizardCreateGroupAndBuild() {
    const groupName = document.getElementById('groupTitleInput')?.value?.trim() || tt('wiz_group_friends');
    _wizardRevealedIds = new Set(); // Reset for new group context
    saveData();

    // Get "Me" from the first set (consistent with other paths)
    const firstSet = allSets[0];
    const meEvent = firstSet ? (firstSet.events.find(e => e.name === 'Me') || firstSet.events[0]) : null;

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
    saveData();

    // Show group builder with the new group
    const title = document.getElementById('groupBuilderTitle');
    if (title) title.value = groupName;
    _wizardGroupMembers = [...appData.events];
    wizardRenderGroupMembers();

    // Clear the form fields
    const nameInput = document.getElementById('groupPersonField');
    if (nameInput) nameInput.value = '';
    ['groupDay', 'groupMonth', 'groupYear'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('wizard-step-active'));
    document.getElementById('wizardStep7')?.classList.add('wizard-step-active');
    _lastWizardStep = 7;
    window.scrollTo(0, 0);
}

function wizardFinish() {
    // Dismiss wizard, show the normal dashboard
    onboardingSection.classList.add('hidden');
    tabNav.classList.remove('hidden');
    const header = document.getElementById('appHeader');
    if (header) header.style.display = '';
    const footer = document.querySelector('.app-footer');
    if (footer) footer.style.display = '';

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

    // Track onboarding progress — if user exits early, show resume banner
    const onboardStep = _lastWizardStep || 4;
    if (onboardStep < 8) {
        localStorage.setItem('hm_onboard_resume', String(onboardStep + 1));
        showOnboardingResumeBanner();
    }
    localStorage.setItem('hm_onboarded', '1');
}

// Track which step we're on for resume
let _lastWizardStep = 0;

function showOnboardingResumeBanner() {
    const resumeStep = localStorage.getItem('hm_onboard_resume');
    if (!resumeStep) return;
    const existing = document.getElementById('onboardResumeBanner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'onboardResumeBanner';
    banner.style.cssText = 'padding:12px 16px;background:rgba(212,184,118,0.1);border:1px solid rgba(212,184,118,0.3);border-radius:8px;margin:8px 12px;display:flex;align-items:center;gap:10px;cursor:pointer;';
    banner.innerHTML = `
        <span style="flex:1;color:var(--text);font-size:0.9rem;">${tt('dash_resume_setup')}</span>
        <span style="color:var(--warning);font-weight:600;font-size:0.85rem;">${tt('dash_resume_continue')}</span>
    `;
    banner.onclick = function() {
        banner.remove();
        localStorage.removeItem('hm_onboard_resume');
        // Re-enter onboarding at the saved step
        onboardingSection.classList.remove('hidden');
        tabNav.classList.add('hidden');
        wizardNext(parseInt(resumeStep, 10));
    };

    const app = document.getElementById('app') || document.body;
    const firstTab = document.getElementById('milestonesTab');
    if (firstTab) firstTab.insertBefore(banner, firstTab.firstChild);
}

function handleStart() {
    const name = birthNameInput.value.trim();
    const dateStr = birthDateInput.value || buildDateFromFields('birth');

    if (!name || !dateStr) {
        showToast(tt('toast_enter_name_date'), 'error');
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
        eventsListEl.innerHTML = '<p class="empty-text">' + tt('ev_none_yet') + '</p>';
        return;
    }

    eventsListEl.innerHTML = appData.events.map(e => {
        const type = e.type || 'birthday';
        const typeIcon = getEventTypeIcon(type);
        const dateObj = e.date instanceof Date ? e.date : new Date(e.date);
        const dateStr = dateObj.toLocaleDateString(getAppLocale(), { day: 'numeric', month: 'short', year: 'numeric' });
        const typeLabel = type === 'birthday' ? tt('type_birthday') : type === 'beginning' ? tt('ev_type_event') : tt('type_milestone');

        return `
            <div class="event-item compact" onclick="openEditModal('${e.id}')" title="${tt('ev_tap_to_edit')}">
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
        showToast(tt('toast_enter_event_name_date'), 'error');
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
    showToast(tt('toast_added', { name: name }), 'success');
    _track('event_added', { event_count: appData.events.length });

    // After adding 2nd person, suggest Team tab (one-time)
    if (appData.events.length === 2 && !localStorage.getItem('hm_team_hint_shown')) {
        localStorage.setItem('hm_team_hint_shown', '1');
        setTimeout(() => {
            showToast(tt('toast_two_people_hint'), 'info', 5000);
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
        showToast(tt('toast_enter_event_name_date'), 'error');
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

    if (!confirm(tt('ev_delete_confirm'))) return;

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
        combinedMilestonesContentEl.innerHTML = '<p class="empty-text">' + tt('tog_add_two_events') + '</p>';
        return;
    }

    // Check team view limit for free users
    if (!checkTeamViewLimit()) {
        _track('premium_gate_hit', { reason: 'team_view_limit' });
        combinedMilestonesContentEl.innerHTML = `
            <div class="premium-gate-overlay">
                <p>${tt('prem_gate_used_views', { count: FREE_TEAM_VIEWS })}</p>
                <p>${tt('prem_gate_upgrade_for')}</p>
                <button class="btn-primary" onclick="showUpgradePrompt('team')" style="margin-top: 12px;">${tt('prem_gate_upgrade_btn')}</button>
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
        combinedMilestonesContentEl.innerHTML = '<p class="empty-text">' + tt('tog_enable_connections') + '</p>';
        return;
    }

    allCombinedMilestonesFlat = [];
    _combinedShareList = [];

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
        combinedMilestonesContentEl.innerHTML = '<p class="empty-text">' + tt('tog_no_connected') + '</p>';
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
                    <h4>${tt('tog_ratios_title')}</h4>
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
                    <h4>${tt('tog_time_comparisons')}</h4>
                    <div class="combined-milestones-list">
                        ${renderCombinedMilestonesList(allDurationMilestones.slice(0, 25), 'duration')}
                    </div>
                </div>
            `;
        }
    }

    if (html === '') {
        html = '<p class="empty-text">' + tt('tog_no_combined') + '</p>';
    }

    // Show views remaining for free users
    if (!isPremium()) {
        const remaining = FREE_TEAM_VIEWS - getTeamViewCount();
        if (remaining > 0 && remaining <= 3) {
            html += `<p class="team-views-hint">${tt(remaining === 1 ? 'tog_views_remaining_one' : 'tog_views_remaining_many', { count: remaining })}</p>`;
        }
    }

    combinedMilestonesContentEl.innerHTML = html;

    // Sort combined milestones by date for sharing
    allCombinedMilestonesFlat.sort((a, b) => a.date.getTime() - b.date.getTime());
    updateCombinedSharePreview();
    } catch (err) {
        console.error('Combined tab error:', err);
        combinedMilestonesContentEl.innerHTML = '<p class="empty-text">' + tt('tog_error_loading') + '</p>';
    }
}

function renderCombinedMilestonesList(milestones, type, eventNames = '') {
    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;
    const gName = (allSets.find(s => s.id === currentSetId) || {}).name || 'Together';
    // Rows share directly on tap — same model as everywhere else in the app
    return milestones.slice(0, 20).map((m, idx) => {
        const isVerySpecial = isVerySpecialNumber(m.value);
        const timeUntilStr = formatTimeDistance(m.timeUntil);
        const dateStr = formatDateWithTime(m.date);
        const displayVal = formatMilestoneValue(m.value, locale);
        const shareText = gName + ': ' + displayVal + ' ' + localizedUnit(m.value, m.unitName) + ' combined on ' + formatMilestoneDate(m.date) + ' — nicenumbers.app';
        const safeMsg = shareText.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');

        // Show contributing events if available
        const contributingEvents = m.contributingEvents || [];
        const eventsHtml = contributingEvents.length > 0
            ? `<div class="cmi-contributors">${contributingEvents.map(e => `<span class="contributor-tag">${e}</span>`).join('')}</div>`
            : '';

        // Register in the stable per-render list so the tap shares the RIGHT
        // combined milestone (image card + text), not a stale index.
        const gIdx = _combinedShareList.push(m) - 1;
        return `
            <div class="combined-milestone-item ${isVerySpecial ? 'very-special' : ''}"
                 onclick="shareCombinedMilestone(${gIdx})" style="cursor:pointer;">
                <div class="cmi-main">
                    <span class="cmi-value">${displayVal}</span>
                    <span class="cmi-unit">${localizedUnit(m.value, m.unitName)}</span>
                    <span class="row-share cmi-share">${tt('wiz_share')} ${_shareArrowSvg(14)}</span>
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
    // Large repdigits
    if (num >= 1000 && isRepdigit(num)) return true;
    // Large numbers must read cleanly: "2 million", "1.5 billion" —
    // not "1,150 million" (divisibility alone is not niceness)
    if (num >= 1000000) {
        const mantissa = String(num).replace(/0+$/, '');
        return mantissa.length === 1 || (mantissa.length === 2 && mantissa[1] === '5');
    }
    // Round thousands
    if (num >= 1000 && num % 1000 === 0) return true;
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
        connectionMatrixEl.innerHTML = '<p class="empty-text">' + tt('tog_matrix_two') + '</p>';
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
            return tmpl2.replace('{name}', name).replace('{value}', value).replace('{unit}', localizedUnit(milestone.value, unit));
        case 'beginning':
        case 'milestone':
        default:
            const tmpl3 = _t('since') || '{value} {unit} since {name}';
            return tmpl3.replace('{name}', name).replace('{value}', value).replace('{unit}', localizedUnit(milestone.value, unit));
    }
}

// Get wording for combined milestones based on event types
function getCombinedMilestoneWording(events) {
    const types = events.map(e => e.type || 'birthday');
    const allBirthdays = types.every(t => t === 'birthday');
    const hasBirthdays = types.some(t => t === 'birthday');
    const names = events.map(e => escapeHtml(e.name));

    if (allBirthdays) {
        return { prefix: tt('tog_prefix_together_we_are'), verb: 'reach', names };
    } else if (hasBirthdays) {
        return { prefix: tt('tog_prefix_combined_journey'), verb: 'totals', names };
    } else {
        return { prefix: tt('tog_prefix_total_time'), verb: 'reaches', names };
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
let _homeMilestones = [];   // Stable list backing the home rows' share/gift taps (see renderHomeScreen)
let allCombinedMilestonesFlat = []; // Store for sharing (combined)
let _combinedShareList = [];        // Stable per-render list backing Together-row taps
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
        displayUnit = localizedUnit(hero.value, hero.unitName);
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
                <span class="hero-person">${escapeHtml(displayPersonName(hero.eventName))}</span>
                <span class="hero-separator">&mdash;</span>
                <span class="hero-date">${dateStr}</span>
                <span class="hero-separator">&mdash;</span>
                <span class="hero-countdown">${timeUntilStr}</span>
            </div>
            <div class="hero-actions">
                <button class="hero-share-btn" onclick="heroShare()">${tt('wiz_share')}</button>
                <button class="hero-remind-btn" onclick="heroRemind()">${tt('dash_remind_me')}</button>
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
    shareMilestone(m);
    _track('hero_share', { value: m.value, unit: m.unit });
}

function heroRemind() {
    if (typeof NOTIF !== 'undefined' && !NOTIF.isEnabled()) {
        NOTIF.enable().then(ok => {
            if (ok) {
                showToast(tt('toast_reminders_before_ms'), 'success');
                _track('hero_remind_enabled');
            }
        });
    } else {
        showToast(tt('toast_reminder_set'), 'success');
        _track('hero_remind');
    }
}

// ── HOME SCREEN: Time-chunked view ──
function renderHomeScreen() {
    const listEl = document.getElementById('timeChunkedList');
    const togetherEl = document.getElementById('togetherSection');
    if (!listEl) return;

    if (appData.events.length === 0) {
        listEl.innerHTML = `<p class="empty-text" style="padding:32px;text-align:center;font-style:italic;color:var(--text-muted);">${tt('dash_enter_birthday')}</p>`;
        if (togetherEl) togetherEl.style.display = 'none';
        allMilestonesFlat = [];
        return;
    }

    // Gather milestones for selected people (respects person filter)
    const filteredEvents = selectedPersonIds && selectedPersonIds.length > 0
        ? appData.events.filter(e => selectedPersonIds.includes(e.id))
        : appData.events;
    let all = [];
    const now = new Date();
    filteredEvents.forEach(e => {
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
        // #3 Also surface general nice numbers reached in the last 7 days
        // (repdigits, palindromes, rounds the upcoming-only finder misses) —
        // a great reason to ping the person.
        if (typeof findRecentMilestones === 'function') {
            findRecentMilestones(e.date, 7, appSettings).forEach(r => {
                if (all.some(m => m.eventId === e.id && m.value === r.value && m.unit === r.unit)) return;
                r.eventName = e.name; r.eventId = e.id; r.recentlyPassed = true;
                all.push(r);
            });
        }
    });

    // Sort: recently passed first (by recency), then future (by proximity)
    all.sort((a, b) => {
        if (a.recentlyPassed && !b.recentlyPassed) return -1;
        if (!a.recentlyPassed && b.recentlyPassed) return 1;
        if (a.recentlyPassed && b.recentlyPassed) return b.timeUntil - a.timeUntil; // most recent first
        return a.timeUntil - b.timeUntil;
    });
    allMilestonesFlat = all;
    // Stable copy for the home rows' share/gift actions. allMilestonesFlat gets
    // rebuilt in a different order by renderPersonColumns/renderMostSpecialMilestones,
    // which would make the rows' indices point at the WRONG milestone — so the
    // row actions read from this dedicated array instead.
    _homeMilestones = all;

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
                displayText = formatMilestoneValue(m.value, locale) + ' ' + localizedUnit(m.value, m.unitName);
            }
            const dateOpts = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
            let dateStr;
            if (m.recentlyPassed) {
                const daysAgo = Math.round(Math.abs(m.timeUntil) / (24*60*60*1000));
                dateStr = daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo}d ago`;
                dateStr += ' · ' + tt('dash_recent_ping');
            } else {
                dateStr = m.date.toLocaleDateString(locale, dateOpts);
            }
            const isSpecial = !m.isCosmic && (m.isBigMilestone || (m.value >= 10000 && m.value % 10000 === 0));
            const mIdx = all.indexOf(m);
            html += `<div class="time-chunk-item" onclick="homeShareMilestone(${mIdx})" id="tcItem${mIdx}" style="cursor:pointer;">
                <div class="tc-main">
                    <div class="tc-left">
                        <span class="tc-value ${isSpecial ? 'starred' : ''}" style="white-space:nowrap;">${isSpecial ? '\u2605 ' : ''}${displayText}</span>
                        <span class="tc-person">${escapeHtml(displayPersonName(m.eventName))}</span>
                    </div>
                    <span class="row-gift" title="${tt('gp_send_title')}" onclick="event.stopPropagation(); openGiftPicker(${mIdx})" style="cursor:pointer;opacity:0.5;margin-right:8px;font-size:1em;">&#127873;</span><span class="row-share tc-share" title="Share">${_shareArrowSvg(15)}</span>
                </div>
                <div class="tc-date">${dateStr}</div>
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

    // Show top 3 milestones, then expandable rest
    // Merge all into one sorted list (recently passed first, then by proximity)
    const merged = [...recentlyPassed, ...future].filter(m => {
        if (m.isCosmic) { _globalCosmicShown++; return _globalCosmicShown <= 1; }
        return true;
    });

    let html = '';
    if (merged.length === 0) {
        html = `<p class="empty-text" style="padding:24px;text-align:center;font-style:italic;color:var(--text-muted);">${tt('dash_add_unlock')}</p>`;
    } else {
        // Render individual milestone item
        function renderItem(m, idx) {
            let displayText;
            if (m.isCosmic) {
                displayText = m.description || m.unitName;
            } else {
                displayText = formatMilestoneValue(m.value, locale) + ' ' + localizedUnit(m.value, m.unitName);
            }
            const dateOpts = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
            let dateStr;
            if (m.recentlyPassed) {
                const daysAgo = Math.round(Math.abs(m.timeUntil) / (24*60*60*1000));
                dateStr = daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo}d ago`;
                dateStr += ' · ' + tt('dash_recent_ping');
            } else {
                dateStr = m.date.toLocaleDateString(locale, dateOpts);
            }
            const isSpecial = !m.isCosmic && (m.isBigMilestone || (m.value >= 10000 && m.value % 10000 === 0));
            const mIdx = all.indexOf(m);
            return `<div class="time-chunk-item" onclick="homeShareMilestone(${mIdx})" id="tcItem${mIdx}" style="cursor:pointer;">
                <div class="tc-main">
                    <div class="tc-left">
                        <span class="tc-value ${isSpecial ? 'starred' : ''}" style="white-space:nowrap;">${isSpecial ? '\u2605 ' : ''}${displayText}</span>
                        <span class="tc-person">${escapeHtml(displayPersonName(m.eventName))}</span>
                    </div>
                    <span class="row-gift" title="${tt('gp_send_title')}" onclick="event.stopPropagation(); openGiftPicker(${mIdx})" style="cursor:pointer;opacity:0.5;margin-right:8px;font-size:1em;">&#127873;</span><span class="row-share tc-share" title="Share">${_shareArrowSvg(15)}</span>
                </div>
                <div class="tc-date">${dateStr}</div>
            </div>`;
        }

        // One milestone per person (their nearest), rest behind "Show more".
        // Solo single-person view keeps the top 3 so the list doesn't feel empty.
        let top;
        if (filteredEvents.length >= 2) {
            const seen = new Set();
            top = merged.filter(m => {
                if (seen.has(m.eventId)) return false;
                seen.add(m.eventId);
                return true;
            });
        } else {
            top = merged.slice(0, 2);
        }
        const rest = merged.filter(m => !top.includes(m));

        html += `<div class="time-chunk-label">${tt('dash_upcoming_tap')}</div>`;
        top.forEach((m, i) => { html += renderItem(m, i); });

        if (rest.length > 0) {
            html += `<div id="moreMs" style="display:none;">`;
            rest.forEach((m, i) => { html += renderItem(m, top.length + i); });
            html += `</div>`;
            html += `<div id="moreMsToggle" style="cursor:pointer;color:var(--warning,#d4b876);padding:12px;text-align:center;font-size:0.85rem;" onclick="toggleMoreMilestones()">${tt('wiz_show_more_tpl', { count: rest.length, noun: plural(rest.length, 'milestone') })}</div>`;
        }
    }
    listEl.innerHTML = html;

    // Together teaser removed from Solo — the Together tab covers it.
    if (togetherEl) togetherEl.style.display = 'none';

    // "+ Add more people" only while the list is nearly empty; afterwards the Edit tab covers it
    const addPrompt = document.getElementById('homeAddPrompt');
    if (addPrompt) addPrompt.style.display = appData.events.length <= 1 ? '' : 'none';
}

function toggleMoreMilestones() {
    const more = document.getElementById('moreMs');
    const btn = document.getElementById('moreMsToggle');
    if (!more || !btn) return;
    const isHidden = more.style.display === 'none';
    more.style.display = isHidden ? '' : 'none';
    if (isHidden) {
        btn.textContent = tt('wiz_show_less');
    } else {
        // Restore "Show X more" text
        const count = more.querySelectorAll('.time-chunk-item').length;
        btn.textContent = tt('wiz_show_more_tpl', { count: count, noun: plural(count, 'milestone') });
    }
}

// Sticky share bar — select milestone, show at bottom, share on tap
let _selectedMilestoneIdx = -1;

function selectMilestoneForBar(idx) {
    const m = allMilestonesFlat[idx];
    if (!m) return;
    _selectedMilestoneIdx = idx;

    // Highlight the selected row
    document.querySelectorAll('.time-chunk-item').forEach(el => el.classList.remove('tc-selected'));
    const row = document.getElementById('tcItem' + idx);
    if (row) row.classList.add('tc-selected');

    // Show active state in share bar
    const barEmpty = document.getElementById('shareBarEmpty');
    const barActive = document.getElementById('shareBarActive');
    const barText = document.getElementById('shareBarText');
    const barPerson = document.getElementById('shareBarPerson');
    if (barEmpty) barEmpty.style.display = 'none';
    if (barActive) barActive.style.display = '';
    if (barText && barPerson) {
        const displayText = m.isCosmic ? (m.description || m.unitName) : (m.value.toLocaleString() + ' ' + localizedUnit(m.value, m.unitName));
        barText.textContent = displayText;
        barPerson.textContent = displayPersonName(m.eventName) + ' \u2014 ' + formatMilestoneDate(m.date);
    }
}

function deselectMilestone() {
    _selectedMilestoneIdx = -1;
    document.querySelectorAll('.time-chunk-item').forEach(el => el.classList.remove('tc-selected'));
    const barEmpty = document.getElementById('shareBarEmpty');
    const barActive = document.getElementById('shareBarActive');
    if (barEmpty) barEmpty.style.display = '';
    if (barActive) barActive.style.display = 'none';
}

function shareSelectedMilestone() {
    if (_selectedMilestoneIdx < 0) return;
    homeShareMilestone(_selectedMilestoneIdx);
}

// Share from time-chunked list
// Unified share: sends the milestone's image CARD (in the user's selected
// design) + the text message via the Web Share API — so the card designs
// actually reach people. Falls back to a text-only share, then copy+download.
async function shareMilestone(m, textOverride) {
    if (!m) return;
    const text = textOverride || (typeof generateShareMessage === 'function' ? generateShareMessage(m) : '');
    // 1) Image card + text
    if (navigator.share && navigator.canShare && typeof generateMilestoneCard === 'function') {
        try {
            const canvas = generateMilestoneCard(m, {}); // getCardTheme() applies the chosen design
            const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
            const file = new File([blob], 'nicenumbers.png', { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({ title: 'Nice Numbers', text, files: [file] });
                _track('share_card', { value: m.value, unit: m.unitName });
                return;
            }
        } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    // 2) Text-only share (link stays clickable)
    if (navigator.share) {
        try { await navigator.share({ title: 'Nice Numbers', text }); return; }
        catch (e) { if (e && e.name === 'AbortError') return; }
    }
    // 3) Last resort: copy the text and download the card so nothing is lost
    try { await navigator.clipboard.writeText(text); } catch (e) {}
    if (typeof downloadMilestoneCard === 'function') { try { downloadMilestoneCard(m); } catch (e) {} }
    showToast(tt('toast_copied'), 'success');
}
window.shareMilestone = shareMilestone;

// Share a Together/combined milestone: image card (labelled with the group) + text.
function shareCombinedMilestone(idx) {
    const m = _combinedShareList[idx];
    if (!m) return;
    // Combined milestones carry no eventName, so label the card with the people.
    const names = (m.contributingEvents || []).map(n => displayPersonName(n)).join(' + ');
    const groupName = (allSets.find(s => s.id === currentSetId) || {}).name || 'Together';
    const cardM = Object.assign({}, m, { eventName: names || groupName });
    const text = (typeof generateCombinedShareMessage === 'function') ? generateCombinedShareMessage(m) : undefined;
    shareMilestone(cardM, text);
}
window.shareCombinedMilestone = shareCombinedMilestone;

// Contextual gift entry: pick a physical keepsake printed with THIS milestone.
function openGiftPicker(idx) {
    const m = _homeMilestones[idx] || allMilestonesFlat[idx];
    if (!m || typeof getGiftSuggestions !== 'function') return;
    let val, unit;
    if (m.isCosmic) {
        const ord = (typeof ordinal === 'function') ? ordinal(m.value) : m.value;
        val = (m.value === 1 ? '' : ord + ' ') + (m.unitName || '');
        unit = '';
    } else {
        val = m.value.toLocaleString();
        unit = (typeof localizedUnit === 'function') ? localizedUnit(m.value, m.unitName) : (m.unitName || '');
    }
    const isSelf = m.eventName === 'Me';
    const name = isSelf ? '' : displayPersonName(m.eventName || '');
    const nameEsc = escapeHtml(name);
    const suggestions = getGiftSuggestions(m) || [];
    const cards = suggestions.map(p => {
        const tagline = (p.tagline || '')
            .replace(/\{value\}/g, val).replace(/\{unit\}/g, escapeHtml(unit)).replace(/\{name\}/g, nameEsc)
            .replace(/  +/g, ' ').replace(/ ([,.!?])/g, '$1').trim();
        // Start the gift's printed name blank for self (so they type a real name).
        const safeName = isSelf ? '' : (m.eventName || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const media = p.photo
            ? `<div class="gift-photo"><img src="${p.photo}" alt="" loading="lazy" style="width:56px;height:56px;object-fit:cover;border-radius:8px;background:#fff;"></div>`
            : `<div class="gift-icon">${p.icon}</div>`;
        return `<div class="gift-product-card" onclick="var g=document.getElementById('giftPickerModal'); if(g) g.remove(); openGiftOrder('${p.id}', ${m.value}, '${escapeHtml(m.unitName || '')}', '${safeName}')">
            ${media}
            <div class="gift-info">
                <div class="gift-name">${escapeHtml(p.name)}</div>
                <div class="gift-tagline">${tagline}</div>
                <div class="gift-price">${p.currency} ${p.price.toFixed(2)} &middot; ${tt('gp_ship')}</div>
            </div>
        </div>`;
    }).join('');
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'giftPickerModal';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `<div class="modal-content">
        <h3>&#127873; ${tt('gp_title')}</h3>
        <p class="auth-subtitle">${tt('gp_sub', { value: `<strong>${val}${unit ? ' ' + escapeHtml(unit) : ''}</strong>` })}</p>
        <div class="gift-products">${cards}</div>
        <button class="auth-skip" onclick="document.getElementById('giftPickerModal').remove()">${tt('gp_later')}</button>
    </div>`;
    document.body.appendChild(modal);
    if (typeof _track === 'function') _track('gift_picker_opened', { value: m.value, unit: m.unitName });
}
window.openGiftPicker = openGiftPicker;

function homeShareMilestone(idx) {
    const m = _homeMilestones[idx] || allMilestonesFlat[idx];
    if (!m) return;
    shareMilestone(m);
    _track('home_share', { value: m.value, unit: m.unit, person: m.eventName });
}

function showSharePreview(message, recipientName) {
    // Direct native share — show app picker immediately
    navigator.clipboard.writeText(message).catch(() => {});
    if (navigator.share) {
        navigator.share({ title: 'Nice Numbers', text: message }).catch(() => {});
    } else {
        showToast(tt('toast_copied'), 'success');
    }
}

function renderMilestonesTab() {
    // Render the new Home screen — no single hero, all milestones equal
    renderHomeScreen();

    // Hero card hidden — milestones from all people shown equally in the list
    const heroEl = document.getElementById('heroMilestone');
    if (heroEl) heroEl.style.display = 'none';

    // Sticky share bar removed — milestones share directly per row (tap = share)

    // Legacy: keep old columns for compatibility but don't show
    if (appData.events.length === 0) {
        return;
    }

    // NOTE: allMilestonesFlat is already set by renderHomeScreen() — do NOT reset it here

    // "Today" highlight removed — the explanations text cluttered the dashboard;
    // milestones in the list are tappable and that is the share path.
    const todayBox = document.getElementById('todayHighlight');
    if (todayBox) todayBox.style.display = 'none';

    // Hero card disabled — all milestones shown equally in the time-chunked list
    // renderHeroMilestone();

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
                            <div class="miv-person">${escapeHtml(displayPersonName(m.eventName))}</div>
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
                            <div class="miv-unit">${localizedUnit(m.value, m.unitName)}</div>
                        </div>
                        <div class="miv-right">
                            <div class="miv-person">${escapeHtml(displayPersonName(m.eventName))}</div>
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
                            <div class="cm-line1"><span class="cm-num">${m.value.toLocaleString()}</span> <span class="cm-unit">${localizedUnit(m.value, m.unitName)}</span>${marker ? `<span class="cm-marker">${marker}</span>` : ''}<button class="quick-share-btn" onclick="event.stopPropagation(); quickShare(${m.globalIdx})" title="Share">&#8599;</button></div>
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
                    <div class="miv-unit">${localizedUnit(m.value, m.unitName)}</div>
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
                        <div class="miv-unit">${localizedUnit(m.value, m.unitName)}</div>
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
                    <span class="cm-unit">${localizedUnit(m.value, m.unitName)}</span>
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

        for (const num of relevantNumbers) {
            // Combined milestones have no single "age" to filter by, so apply a
            // fixed niceness bar at every magnitude (single-person paths use the
            // age-adaptive filter instead). Drops bland numbers like 465 (grade 5),
            // 1,050 (32), 32,250 (40); keeps clean rounds (32,000=65), 1,024 (62),
            // repdigits/palindromes (1,111=92), powers, and constants (31,415=58).
            if (typeof nicenessGrade === 'function' && nicenessGrade(num) < 50) continue;
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

    // Large repdigits (11111111, 222222222, 1111111111, etc.)
    if (str.length >= 6 && new Set(str).size === 1) return true;

    // Large round numbers (>=1M) must read cleanly: 1 significant digit
    // ("2 million", "300 million", "1 billion") or a clean half ("1.5 billion",
    // "2.5 million", "750 million"). Divisibility alone — 1,150M, 87M — is not nice.
    if (num >= 1000000 && num % 10 === 0) {
        const mantissa = str.replace(/0+$/, '');
        if (mantissa.length === 1) return true;
        if (mantissa.length === 2 && mantissa[1] === '5') return true;
    }

    // Half million (500k)
    if (num === 500000) return true;

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
        sharePreviewEl.innerHTML = '<p class="empty-text small">' + tt('share_no_ms_yet') + '</p>';
        return;
    }

    // Default to first (nearest) milestone if none selected
    const idx = selectedMilestone !== null ? selectedMilestone : 0;
    const m = allMilestonesFlat[idx];

    if (!m) {
        sharePreviewEl.innerHTML = '<p class="empty-text small">' + tt('share_select_ms') + '</p>';
        return;
    }

    const message = generateShareMessage(m);
    // Make nicenumbers.app URLs clickable in the preview
    const messageHtml = message.replace(
        /(happymoments\.app\/?[^\s]*)/g,
        '<a href="https://$1" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline;">$1</a>'
    );
    const hintCount = parseInt(localStorage.getItem('hm_share_hint_count') || '0');
    const hintHtml = hintCount < 3 ? '<p class="share-hint">' + tt('share_click_hint') + '</p>' : '';
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
    const name = displayPersonName(m.eventName) || 'someone special';
    // For cosmic milestones, format value+unit as a single label
    let val, unit, why;
    if (m.isCosmic) {
        const cosmicOrd = typeof ordinal === 'function' ? ordinal(m.value) : m.value;
        val = (m.value === 1 ? '' : cosmicOrd + ' ') + m.unitName;
        unit = '';
        why = m.description || 'a cosmic cycle milestone';
    } else {
        val = m.value.toLocaleString();
        unit = localizedUnit(m.value, m.unitName);
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
        .replace(/\{why\}/g, why)
        // Cosmic milestones have unit='' — collapse the gap the empty slot leaves
        .replace(/  +/g, ' ').replace(/ ([,.!?])/g, '$1');

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

const APP_SHARE_LINK_DEFAULT = '\n\nDiscover your special numbers \u2192 https://nicenumbers.app';

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
            return linkText.replace('https://nicenumbers.app', `https://nicenumbers.app/?${params.toString()}`);
        }
    }
    return linkText;
}

// Generate deep link URL for a specific event
function getDeepLinkUrl(event) {
    if (!event) return 'https://nicenumbers.app';
    const dateStr = event.date instanceof Date
        ? event.date.toISOString().split('T')[0]
        : String(event.date).split('T')[0];
    const locale = (typeof getAppLocale === 'function') ? getAppLocale().split('-')[0] : 'en';
    const params = new URLSearchParams({ n: event.name, d: dateStr, hl: locale });
    return `https://nicenumbers.app/?${params.toString()}`;
}

function generateChallengeMessage(m) {
    if (!m) return null;
    const val = m.value.toLocaleString();
    const unit = m.unitName || '';
    const dateStr = m.date.toLocaleDateString(getAppLocale(), { month: 'long', day: 'numeric', year: 'numeric' });
    const name = m.eventName || '';

    const link = 'https://nicenumbers.app';
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
    if (!m) { showToast(tt('toast_select_milestone_first'), 'info'); return; }

    const message = generateChallengeMessage(m);
    if (navigator.share) {
        navigator.share({ title: 'Nice Numbers', text: message }).catch(() => {});
    } else {
        navigator.clipboard.writeText(message).then(() => {
            showToast(tt('wizard_copied_share'), 'success');
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
    const link = m ? getDeepLinkUrl(appData.events.find(e => e.id === m.eventId) || appData.events[0]) : 'https://nicenumbers.app';

    let message;
    if (m) {
        const val = m.value.toLocaleString();
        const unit = m.unitName || '';
        const dateStr = m.date.toLocaleDateString(getAppLocale(), { month: 'long', day: 'numeric', year: 'numeric' });
        // First person for the user's own milestone ("Me will be…" reads wrong).
        if (m.eventName === 'Me') {
            message = `Fun discovery: I'll be ${val} ${unit} on ${dateStr}! Who else wants to find their special numbers? ${link}`;
        } else {
            const name = displayPersonName(m.eventName || '');
            message = `Fun discovery: ${name} will be ${val} ${unit} on ${dateStr}! Who else wants to find their special numbers? ${link}`;
        }
    } else {
        message = `I just found some fun number milestones — want to discover yours? Enter your birthday and see what comes up! ${link}`;
    }

    if (navigator.share) {
        navigator.share({ title: 'Nice Numbers', text: message }).catch(() => {});
    } else {
        navigator.clipboard.writeText(message).then(() => {
            showToast(tt('toast_copied_group'), 'success');
        }).catch(() => {});
    }
    _track('group_challenge', { locale });
}

function quickShare(idx) {
    const m = allMilestonesFlat[idx];
    if (!m) return;
    const message = generateShareMessage(m);
    if (navigator.share) {
        navigator.share({ title: 'Nice Numbers', text: message }).catch(() => {});
    } else {
        navigator.clipboard.writeText(message).then(() => {
            showToast(tt('toast_copied'), 'success');
        }).catch(() => {});
    }
    _track('quick_share', { value: m.value, unit: m.unit });
    promptShareApp();
}

function shareAppLink() {
    const text = 'Discover when you turn 1 billion seconds, 10,000 days, or hit a special number milestone. Track milestones for everyone you care about!\n\nhttps://nicenumbers.app';
    if (navigator.share) {
        navigator.share({ title: 'Nice Numbers', text }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showToast(tt('toast_link_copied'), 'success');
        }).catch(() => {
            showToast(tt('toast_share_link'), 'info', 5000);
        });
    }
    _track('share_app', { source: 'settings' });
}

function submitFeedback() {
    const text = document.getElementById('feedbackText')?.value?.trim();
    if (!text) {
        showToast(tt('toast_write_first'), 'info');
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
    showToast(tt('toast_feedback_thanks'), 'success');
}

let _shareAppPromptCount = 0;
function promptShareApp() {
    _shareAppPromptCount++;
    // Show after every 2nd share action, max 3 times per session
    if (_shareAppPromptCount % 2 !== 0) return;
    if (_shareAppPromptCount > 6) return;

    setTimeout(() => {
        showToast(tt('toast_invite_hint'), 'info', 4000);
    }, 1500);
}

// First-person share phrasing for the user's OWN ("Me") milestones — the
// third-person templates read wrong there ("Me reaches their 200th Mercury
// return"). Uses a "milestone: {value}" construction so it works for both
// cosmic ("200th Mercury return") and normal ("25,000 days") without needing
// verb/possessive agreement. EN + SL localized; other locales fall back to EN
// (localized self-phrasing is a known i18n follow-up).
const SELF_SHARE_I18N = {
    en: [
        "On {date} I hit a milestone: {value}! 🎉 Worth celebrating.",
        "Just {countdown} to go — my next milestone: {value}! 🎉",
        "Coming up on {date}: {value}! 🎉 A number worth celebrating."
    ],
    sl: [
        "Na dan {date} dosežem mejnik: {value}! 🎉 Vredno praznovanja.",
        "Še {countdown} do mojega mejnika: {value}! 🎉",
        "{date} me čaka: {value}! 🎉 Številka, vredna praznovanja."
    ]
};

function generateSelfShareMessage(m) {
    const dateStr = m.date.toLocaleDateString(getAppLocale(), { weekday: 'long', month: 'long', day: 'numeric' });
    const countdown = formatTimeDistance(m.timeUntil);
    let value;
    if (m.isCosmic) {
        const ord = typeof ordinal === 'function' ? ordinal(m.value) : m.value;
        value = (m.value === 1 ? '' : ord + ' ') + m.unitName;
    } else {
        value = m.value.toLocaleString() + ' ' + localizedUnit(m.value, m.unitName);
    }
    const lang = (getAppLocale() || 'en').split('-')[0].split('_')[0];
    const tpls = SELF_SHARE_I18N[lang] || SELF_SHARE_I18N.en;
    const tpl = tpls[Math.abs(m.value | 0) % tpls.length];
    return tpl
        .replace(/\{value\}/g, value)
        .replace(/\{date\}/g, dateStr)
        .replace(/\{countdown\}/g, countdown)
        .replace(/  +/g, ' ').replace(/ ([,.!?])/g, '$1').trim();
}

function generateShareMessage(m) {
    // The user's own milestones read wrong in third-person templates.
    if (m.eventName === 'Me') {
        return generateSelfShareMessage(m) + getAppShareLink(m);
    }
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
        copyShareBtn.textContent = tt('share_copied_btn');
        showToast(tt('toast_copied'), 'success');
        setTimeout(() => {
            copyShareBtn.textContent = tt('share_copy_message');
        }, 2000);
        promptShareApp();
    }).catch(() => {
        showToast(tt('toast_copy_failed'), 'error');
    });
}

function handleNativeShare() {
    const idx = selectedMilestone !== null ? selectedMilestone : 0;
    const m = allMilestonesFlat[idx];
    if (!m) return;
    shareMilestone(m);
}

function handleNativeCombinedShare() {
    const idx = selectedCombinedMilestone !== null ? selectedCombinedMilestone : 0;
    const m = allCombinedMilestonesFlat[idx];
    if (!m) return;
    shareMilestone(m, generateCombinedShareMessage(m));
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
    const subject = encodeURIComponent(tt('share_email_subject'));
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
        combinedSharePreviewEl.innerHTML = '<p class="empty-text small">' + tt('share_no_combined_yet') + '</p>';
        return;
    }

    const idx = selectedCombinedMilestone !== null ? selectedCombinedMilestone : 0;
    const m = allCombinedMilestonesFlat[idx];

    if (!m) {
        combinedSharePreviewEl.innerHTML = '<p class="empty-text small">' + tt('share_select_ms') + '</p>';
        return;
    }

    const message = generateCombinedShareMessage(m);
    // Make nicenumbers.app URLs clickable in the preview
    const messageHtml = message.replace(
        /(happymoments\.app\/?[^\s]*)/g,
        '<a href="https://$1" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline;">$1</a>'
    );
    combinedSharePreviewEl.innerHTML = `
        <div class="share-message-preview">
            <p>${messageHtml}</p>
        </div>
        <p class="share-hint">${tt('share_click_hint_combined')}</p>
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
        copyCombinedShareBtn.textContent = tt('share_copied_btn');
        showToast(tt('toast_copied'), 'success');
        setTimeout(() => {
            copyCombinedShareBtn.textContent = tt('share_copy_message');
        }, 2000);
    }).catch(() => {
        showToast(tt('toast_copy_failed'), 'error');
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
    const subject = encodeURIComponent(tt('share_email_subject'));
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
        : `Nice Numbers: ${milestone.value.toLocaleString()} ${localizedUnit(milestone.value, milestone.unitName)}` +
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
    if (!ev) { showToast(tt('toast_select_milestone_first'), 'error'); return; }

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
    if (!ev) { showToast(tt('toast_select_milestone_first'), 'error'); return; }

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
    if (!ev) { showToast(tt('toast_select_milestone_first'), 'error'); return; }

    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Nice Numbers//EN',
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
    showToast(tt('toast_calendar_downloaded'), 'success');
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
        customNumbersListEl.innerHTML = '<p class="empty-text small">' + tt('no_custom_numbers') + '</p>';
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
        showToast(tt('toast_enter_valid_number'), 'error');
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

    showToast(tt('toast_settings_saved'), 'success');
}

function handleReset() {
    if (!confirm(tt('reset_confirm'))) return;

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
    showToast(tt('toast_data_exported'), 'success');
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
                showToast(tt('toast_invalid_backup'), 'error');
                return;
            }

            if (!confirm(tt('import_confirm'))) {
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
                showToast(tt('toast_invalid_backup'), 'error');
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

            showToast(tt('toast_data_imported'), 'success');
        } catch (err) {
            showToast(tt('toast_import_error', { error: err.message }), 'error');
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
    options += '<option value="__new__">' + tt('ed_new_group_option') + '</option>';
    currentSetSelect.innerHTML = options;

    // Hide the set switcher — simplified UI, sets managed in People tab
    setSwitcher.classList.add('hidden');

    // Update sets list in settings
    renderEventSetsList();
}

function renderEventSetsHTML() {
    if (allSets.length === 0) return '<p class="empty-text small">' + tt('ed_no_groups') + '</p>';
    const locale = typeof getAppLocale === 'function' ? getAppLocale() : undefined;
    return allSets.map(set => {
        const isCurrent = set.id === currentSetId;

        // Member list
        let membersHtml = '';
        set.events.forEach(e => {
            const d = typeof e.date === 'string' ? new Date(e.date) : e.date;
            const ds = d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
            membersHtml += `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:0.88rem;">
                <span style="color:var(--text);flex:1;">${escapeHtml(displayPersonName(e.name))}</span>
                <span style="color:var(--text-muted);">${ds}</span>
            </div>`;
        });

        return `
            <div class="event-set-item ${isCurrent ? 'current' : ''}" onclick="openGroupEditor('${set.id}')" style="padding:12px;margin-bottom:10px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid ${isCurrent ? 'var(--warning,#d4b876)' : 'var(--border,#333)'};cursor:pointer;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                    <strong style="flex:1;font-size:1rem;color:var(--text);">${escapeHtml(set.name)}</strong>
                    ${isCurrent ? '<span style="color:var(--warning);font-size:0.65rem;font-weight:700;padding:2px 8px;border:1px solid var(--warning);border-radius:10px;">' + tt('ed_active_badge') + '</span>' : '<span style="color:var(--text-muted);font-size:0.7rem;">' + tt('ed_tap_to_edit') + '</span>'}
                    <span style="color:var(--text-muted);font-size:1rem;">&#9998;</span>
                </div>
                <div style="padding-left:4px;">${membersHtml}</div>
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
            <h3>${tt('ed_rename_group')}</h3>
            <div class="form-group">
                <label>${tt('ed_group_name')}</label>
                <input type="text" id="renameInput" value="${escapeHtml(set.name)}" class="checkout-email-input" style="font-size: 1rem;">
            </div>
            <div class="modal-buttons">
                <button class="btn-primary" onclick="confirmRename('${setId}')">${tt('save')}</button>
                <button class="btn-secondary" onclick="document.getElementById('renameModal').remove()">${tt('cancel')}</button>
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
            showToast(tt('toast_group_renamed', { name: newName }), 'success');
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
        const name = prompt(tt('ed_new_group_prompt'));
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
            showToast(tt('toast_group_created', { name: name.trim() }), 'success');
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
        showToast(tt('toast_switched_group', { name: set.name }), 'info');
    }
}

function handleAddSet() {
    if (!checkGroupLimit()) return;
    const name = newSetNameInput.value.trim();
    if (!name) {
        showToast(tt('toast_enter_set_name'), 'error');
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

function promptNewGroupFromTogether() {
    const name = prompt(tt('ed_new_group_prompt'));
    if (!name || !name.trim()) return;

    // Auto-add "Me" from first set
    const firstSet = allSets[0];
    const meEvent = firstSet ? firstSet.events.find(e => e.name === 'Me') || firstSet.events[0] : null;
    const meClone = meEvent ? {
        id: 'event_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        name: meEvent.name, type: meEvent.type, date: new Date(meEvent.date)
    } : null;

    const newSet = { id: 'set_' + Date.now(), name: name.trim(), events: meClone ? [meClone] : [], connections: {}, comboTypes: { sum: true, ratio: true, duration: true } };
    allSets.push(newSet);
    currentSetId = newSet.id;
    loadCurrentSet();
    saveData();
    renderEventSetsList();
    renderPeopleTabGroups();
    updateSetSwitcher();
    _track('new_group_from_together');
    openGroupEditor(newSet.id);
}

function handleAddSetFromPeopleTab() {
    const input = document.getElementById('newGroupField');
    const name = input ? input.value.trim() : '';
    if (!name) { showToast(tt('toast_enter_group_name'), 'error'); return; }

    // Auto-add "Me" from first set
    const firstSet = allSets[0];
    const meEvent = firstSet ? firstSet.events.find(e => e.name === 'Me') || firstSet.events[0] : null;
    const meClone = meEvent ? {
        id: 'event_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        name: meEvent.name, type: meEvent.type, date: new Date(meEvent.date)
    } : null;

    const newSet = { id: 'set_' + Date.now(), name: name, events: meClone ? [meClone] : [], connections: {}, comboTypes: { sum: true, ratio: true, duration: true } };
    allSets.push(newSet);
    input.value = '';
    currentSetId = newSet.id;
    loadCurrentSet();
    saveData();
    renderEventSetsList();
    renderPeopleTabGroups();
    updateSetSwitcher();
    // Immediately open editor for the new group
    openGroupEditor(newSet.id);
}

function renderPeopleTabGroups() {
    const el = document.getElementById('eventSetsList2');
    if (!el) return;
    // Reuse the same rendering as the settings groups list
    el.innerHTML = renderEventSetsHTML();
}

function deleteSet(setId) {
    if (allSets.length <= 1) {
        showToast(tt('toast_cannot_delete_last_set'), 'error');
        return;
    }

    const set = allSets.find(s => s.id === setId);
    if (!confirm(tt('ed_delete_set_confirm', { name: set.name }))) {
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
window.switchToGroupTab = switchToGroupTab;
window.promptNewGroupFromTogether = promptNewGroupFromTogether;
window.openGroupEditor = openGroupEditor;
window.closeGroupEditor = closeGroupEditor;
window.editorAddMember = editorAddMember;
window.editorUpdateMember = editorUpdateMember;
window.editorUpdateMemberDate = editorUpdateMemberDate;
window.editorRemoveMember = editorRemoveMember;
window.editorDeleteGroup = editorDeleteGroup;
window.wizardSelectMsRow = wizardSelectMsRow;
window.selectMilestoneForBar = selectMilestoneForBar;
window.toggleMoreMilestones = toggleMoreMilestones;
window.wizardShowTeamMilestones = wizardShowTeamMilestones;
window.deselectMilestone = deselectMilestone;
window.shareSelectedMilestone = shareSelectedMilestone;
// ============================================================
// AUTHENTICATION UI
// ============================================================

function openAuthModal() {
    // Ensure Firebase is initialized (safety net — CDN scripts may load late)
    if (typeof HM_AUTH !== 'undefined') HM_AUTH.init();
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('hidden');
        showAuthView('signin');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('hidden');
    // Also close the profile panel behind it
    const panel = document.getElementById('profilePanel');
    const overlay = document.getElementById('profileOverlay');
    if (panel) panel.classList.remove('visible');
    if (overlay) overlay.classList.add('hidden');
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
        showToast(tt('auth_signed_in'), 'success');
    } else {
        showAuthError('authError', result.error);
    }
}

async function handleAppleSignIn() {
    if (typeof HM_AUTH === 'undefined') return;
    const result = await HM_AUTH.signInWithApple();
    if (result.success) {
        closeAuthModal();
        showToast(tt('auth_signed_in'), 'success');
    } else {
        showAuthError('authError', result.error);
    }
}

async function handleFacebookSignIn() {
    if (typeof HM_AUTH === 'undefined') return;
    const result = await HM_AUTH.signInWithFacebook();
    if (result.success) {
        closeAuthModal();
        showToast(tt('auth_signed_in'), 'success');
    } else {
        showAuthError('authError', result.error);
    }
}

async function handlePhoneSend() {
    if (typeof HM_AUTH === 'undefined') return;
    const phone = document.getElementById('authPhone')?.value?.trim();
    if (!phone || !phone.startsWith('+')) {
        showAuthError('phoneError', tt('auth_enter_phone'));
        return;
    }
    const btn = document.getElementById('phoneSignInBtn');
    if (btn) { btn.disabled = true; btn.textContent = tt('auth_loading'); }
    const result = await HM_AUTH.sendPhoneCode(phone);
    if (result.success && result.needsCaptcha) {
        // reCAPTCHA widget shown — user solves it, then code sends automatically
        if (btn) btn.classList.add('hidden');
    } else if (!result.success) {
        showAuthError('phoneError', result.error);
        if (btn) { btn.disabled = false; btn.textContent = tt('auth_send_code'); }
    }
}

async function handlePhoneVerify() {
    if (typeof HM_AUTH === 'undefined') return;
    const code = document.getElementById('authPhoneCode')?.value?.trim();
    if (!code || code.length < 6) {
        showAuthError('phoneError', tt('auth_enter_code'));
        return;
    }
    const result = await HM_AUTH.verifyPhoneCode(code);
    if (result.success) {
        closeAuthModal();
        showToast(tt('auth_signed_in'), 'success');
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
        showAuthError('authError', tt('auth_enter_email_password'));
        return;
    }
    const result = await HM_AUTH.signInWithEmail(email, password);
    if (result.success) {
        closeAuthModal();
        showToast(tt('auth_signed_in'), 'success');
    } else {
        // Provide helpful guidance based on the error
        let hint = result.error;
        if (hint && (hint.includes('Invalid') || hint.includes('No account') || hint.includes('Incorrect'))) {
            hint = tt('auth_no_account_hint');
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
        showAuthError('signupError', tt('auth_enter_name'));
        return;
    }
    if (!email || !password) {
        showAuthError('signupError', tt('auth_enter_email_password_signup'));
        return;
    }
    if (password.length < 8) {
        showAuthError('signupError', tt('auth_password_length'));
        return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        showAuthError('signupError', tt('auth_password_complexity'));
        return;
    }
    if (password !== confirmPassword) {
        showAuthError('signupError', tt('auth_passwords_no_match'));
        return;
    }
    const result = await HM_AUTH.signUpWithEmail(email, password, name);
    if (result.success) {
        closeAuthModal();
        showToast(tt('auth_account_created'), 'success');
    } else {
        showAuthError('signupError', result.error);
    }
}

async function handlePasswordReset() {
    const email = document.getElementById('resetEmail')?.value?.trim();
    if (!email) {
        showAuthError('resetMessage', tt('auth_enter_email'));
        return;
    }
    await HM_AUTH.resetPassword(email);
    const el = document.getElementById('resetMessage');
    if (el) {
        el.textContent = tt('auth_reset_sent');
        el.className = 'auth-error success';
        el.classList.remove('hidden');
    }
}

async function handleSignOut() {
    if (typeof HM_AUTH === 'undefined') return;
    await HM_AUTH.signOut();
    showToast(tt('auth_signed_out'), 'success');
}

async function handleDeleteAccount() {
    if (typeof HM_AUTH === 'undefined' || !HM_AUTH.isLoggedIn()) return;

    // Double confirmation
    const name = HM_AUTH.getUserDisplayName() || 'your account';
    if (!confirm(tt('auth_delete_confirm_1', { name: name }))) return;
    if (!confirm(tt('auth_delete_confirm_2'))) return;

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
        showToast(tt('auth_account_deleted'), 'success');
    } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
            showToast(tt('auth_recent_login'), 'error', 5000);
        } else {
            showToast(tt('auth_delete_failed'), 'error');
        }
    }
}

async function resendVerification() {
    const user = HM_AUTH.getUser();
    if (user) {
        try {
            await user.sendEmailVerification();
            showToast(tt('auth_verification_sent'), 'success');
        } catch (e) {
            showToast(tt('auth_wait_retry'), 'error');
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
            const premActive = isPrem && parseInt(isPrem) * 1000 > Date.now();
            if (premActive) {
                statusEl.textContent = tt('prem_status_premium');
                statusEl.className = 'account-status premium';
            } else {
                statusEl.textContent = tt('prem_status_free');
                statusEl.className = 'account-status free';
            }
            // Show the upgrade box only for signed-in, non-premium users.
            const upgradeBox = document.getElementById('accountUpgradeBox');
            if (upgradeBox) upgradeBox.style.display = premActive ? 'none' : '';
        }
        // Email verification disabled for now
        if (verifyEl) verifyEl.classList.add('hidden');

        // Show the avatar (initials only) in the header — the full name + email
        // live in the profile panel. Hide the generic profile icon so the two
        // don't overlap each other or the centered tagline.
        if (userBadge) {
            const initials = (displayName || '?').split(' ').map(w => w[0]).join('').slice(0, 2);
            userBadge.innerHTML = `<span class="user-avatar" title="${escapeHtml(displayName)}">${escapeHtml(initials)}</span>`;
            userBadge.classList.remove('hidden');
            userBadge.onclick = () => switchTab('settings');
        }
        const profileBtnIn = document.getElementById('profileBtn');
        if (profileBtnIn) profileBtnIn.classList.add('hidden');
    } else {
        if (loggedOut) loggedOut.classList.remove('hidden');
        if (loggedIn) loggedIn.classList.add('hidden');

        // Signed out: show the generic profile icon, hide the avatar badge
        if (userBadge) {
            userBadge.classList.add('hidden');
            userBadge.innerHTML = '';
        }
        const profileBtnOut = document.getElementById('profileBtn');
        if (profileBtnOut) profileBtnOut.classList.remove('hidden');
    }
}

// Auth UI — must be on window for onclick handlers in HTML
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.showAuthView = showAuthView;
window.handleGoogleSignIn = handleGoogleSignIn;
window.handleAppleSignIn = handleAppleSignIn;
window.handleFacebookSignIn = handleFacebookSignIn;
window.handlePhoneSend = handlePhoneSend;
window.handlePhoneVerify = handlePhoneVerify;
window.handleEmailSignIn = handleEmailSignIn;
window.handleEmailSignUp = handleEmailSignUp;
window.handlePasswordReset = handlePasswordReset;
window.togglePasswordVisibility = togglePasswordVisibility;
window.resendVerification = resendVerification;
window.toggleProfilePanel = toggleProfilePanel;
window.handleSignOut = handleSignOut;
window.handleDeleteAccount = handleDeleteAccount;
window.handleAddSetFromPeopleTab = handleAddSetFromPeopleTab;
window.selectLanguage = selectLanguage;
window.acceptDeepLink = acceptDeepLink;
window.confirmRename = confirmRename;
window.handleUpgrade = handleUpgrade;
window.heroRemind = heroRemind;
window.heroShare = heroShare;
window.quickShare = quickShare;
window.saveDisplayName = saveDisplayName;
window.showUpgradePrompt = showUpgradePrompt;
window.toggleColumnExpand = toggleColumnExpand;
window.wizardDiscover = wizardDiscover;
window.wizardShareForPerson = wizardShareForPerson;

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
    banner.onclick = () => { handleUpgrade(); };
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
                <h3>${tt('auth_nickname_title')}</h3>
                <p class="auth-subtitle">${tt('auth_nickname_subtitle')}</p>
                <div class="auth-form">
                    <input type="text" id="namePromptInput" placeholder="${tt('auth_nickname_ph')}" value="${escapeHtml(suggestion)}" class="auth-input" autocomplete="name">
                    <button class="btn-primary auth-submit" onclick="saveDisplayName()">${tt('save')}</button>
                </div>
                <button class="auth-skip" onclick="document.getElementById('namePromptModal').remove()">${tt('auth_skip')}</button>
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
            showToast(tt('auth_welcome', { name: name }), 'success');
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

    const reasons = {
        people: tt('prem_reason_people', { count: FREE_PEOPLE_LIMIT }),
        groups: tt('prem_reason_groups'),
        team: tt('prem_reason_team', { count: FREE_TEAM_VIEWS }),
        default: tt('prem_reason_default')
    };
    const subtitle = reasons[reason] || reasons.default;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'upgradeModal';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `
        <div class="modal-content auth-modal">
            <h3>${tt('prem_modal_title')}</h3>
            <p class="auth-subtitle">${subtitle}</p>
            <div style="margin: 16px 0; padding: 16px; background: var(--bg-elevated); border-radius: var(--radius-sm);">
                <div style="font-size: var(--font-size-2xl); color: var(--warning); margin-bottom: 12px;">&euro;1.49<span style="font-size: var(--font-size-sm); color: var(--text-secondary);"> ${tt('prem_per_year')}</span></div>
                <ul style="text-align: left; font-size: var(--font-size-sm); color: var(--text-secondary); list-style: none; padding: 0;">
                    <li>&#10003; ${tt('prem_feat_unlimited')}</li>
                    <li>&#10003; ${tt('prem_feat_views')}</li>
                    <li>&#10003; ${tt('prem_feat_no_banners')}</li>
                    <li>&#10003; ${tt('prem_feat_clean_cards')}</li>
                    <li>&#10003; ${tt('prem_feat_support')}</li>
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

    _track('checkout_started', { product: 'premium' });

    try {
        // Account-less: go straight to Stripe. Stripe collects the email itself
        // (for the receipt + restore) — no sign-in required.
        const res = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'premium' })
        });
        const data = await res.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            showToast(tt('prem_payment_not_configured'), 'info');
        }
    } catch (err) {
        showToast(tt('prem_payment_not_configured'), 'info');
    }
}

// Render the premium section of the profile from local state (no account).
function renderPremiumUI() {
    const until = parseInt(localStorage.getItem('happymoments_premium_until') || '0', 10);
    const active = until && until * 1000 > Date.now();
    const statusEl = document.getElementById('accountPremiumStatus');
    if (statusEl) {
        // When premium, the richer "You're Premium" block below shows instead.
        statusEl.textContent = active ? '' : tt('prem_status_free');
        statusEl.className = 'account-status ' + (active ? 'premium' : 'free');
        statusEl.style.display = active ? 'none' : '';
    }
    const box = document.getElementById('accountUpgradeBox');
    if (box) box.style.display = active ? 'none' : '';
    const activeEl = document.getElementById('accountPremiumActive');
    if (activeEl) activeEl.style.display = active ? '' : 'none';
    if (active) { const b = document.getElementById('premiumBanner'); if (b) b.remove(); }
}
// Back-compat alias — older call sites used this name.
function checkPremiumStatus() { renderPremiumUI(); }

// ── Premium perk: choose the share-card design ──
const CARD_DESIGN_KEYS = { dark:'cd_n_classic', ocean:'cd_n_ocean', sunset:'cd_n_sunset', goldfoil:'cd_n_gold', rose:'cd_n_rose', ivory:'cd_n_ivory' };

function renderCardDesignPicker() {
    const el = document.getElementById('cardDesignSwatches');
    if (!el || typeof CARD_CONFIG === 'undefined') return;
    const prem = (typeof isPremium === 'function') && isPremium();
    const selected = (typeof getCardTheme === 'function') ? getCardTheme() : 'dark';
    const order = ['dark', 'ocean', 'sunset', 'goldfoil', 'rose', 'ivory'];
    el.innerHTML = order.map(t => {
        const th = CARD_CONFIG.themes[t];
        if (!th) return '';
        const locked = (t !== 'dark') && !prem;
        const isSel = t === selected;
        const grad = `linear-gradient(135deg, ${th.bgGradient[0]}, ${th.bgGradient[1]})`;
        const ring = isSel ? 'var(--warning,#d4b876)' : 'rgba(255,255,255,0.12)';
        return `<div onclick="selectCardDesign('${t}')" style="cursor:pointer;text-align:center;">
            <div style="width:54px;height:54px;border-radius:11px;background:${grad};border:2px solid ${ring};position:relative;box-shadow:0 1px 4px rgba(0,0,0,0.3);">
                <span style="position:absolute;bottom:6px;right:7px;width:12px;height:12px;border-radius:50%;background:${th.accent};"></span>
                ${locked ? `<span class="design-lock" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.42);border-radius:9px;font-size:0.95rem;">&#128274;</span>` : ''}
                ${isSel ? `<span style="position:absolute;top:2px;left:6px;color:var(--warning,#d4b876);font-size:0.85rem;">&#10003;</span>` : ''}
            </div>
            <div style="font-size:0.7rem;color:${isSel ? 'var(--warning,#d4b876)' : 'var(--text-muted)'};margin-top:4px;">${tt(CARD_DESIGN_KEYS[t] || 'cd_n_classic')}</div>
        </div>`;
    }).join('');
    const hint = document.getElementById('cardDesignHint');
    if (hint) hint.textContent = prem ? tt('cd_hint_prem') : tt('cd_hint_free');
}

function selectCardDesign(t) {
    const prem = (typeof isPremium === 'function') && isPremium();
    if (t !== 'dark' && !prem) { showUpgradePrompt('cards'); return; }
    localStorage.setItem('happymoments_card_theme', t);
    renderCardDesignPicker();
    showToast(tt('cd_updated'), 'success');
}
window.renderCardDesignPicker = renderCardDesignPicker;
window.selectCardDesign = selectCardDesign;

// Restore a previous purchase on a new device / after reinstall, by email.
async function restorePurchase() {
    const email = (prompt(tt('prem2_restore_prompt')) || '').trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    try {
        const res = await fetch('/api/premium-status?email=' + encodeURIComponent(email));
        const data = await res.json();
        if (data.premium && data.premium_until) {
            localStorage.setItem('happymoments_premium_until', String(data.premium_until));
            localStorage.setItem('happymoments_premium_email', email);
            renderPremiumUI();
            showToast(tt('prem2_restore_ok'), 'success');
        } else {
            showToast(tt('prem2_restore_none'), 'info');
        }
    } catch {
        showToast(tt('prem_payment_not_configured'), 'info');
    }
}

async function checkPremiumReturn() {
    const params = new URLSearchParams(window.location.search);
    const co = params.get('checkout');
    if (co === 'premium_success') {
        _track('payment_complete', { product: 'premium' });
        const sessionId = params.get('session_id');
        window.history.replaceState({}, '', window.location.pathname);
        if (sessionId) {
            try {
                // Verify with the backend that the session was actually paid
                // (server checks Stripe directly — can't be faked), then activate.
                const res = await fetch('/api/premium-status?session_id=' + encodeURIComponent(sessionId));
                const data = await res.json();
                if (data.premium && data.premium_until) {
                    localStorage.setItem('happymoments_premium_until', String(data.premium_until));
                    if (data.email) localStorage.setItem('happymoments_premium_email', data.email);
                    renderPremiumUI();
                }
            } catch {}
        }
        showToast(tt('prem_welcome'), 'success');
    } else if (co === 'premium_cancelled') {
        _track('payment_cancelled', { product: 'premium' });
        showToast(tt('prem_cancelled'), 'info');
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
    showToast(tt('prem_happy_click'), 'success', 2500);
}

function updateHappyCounter() {
    const count = parseInt(localStorage.getItem('hm_happy_count') || '0', 10);
    const el = document.getElementById('happyCount');
    if (el) {
        el.textContent = count > 0 ? tt(count === 1 ? 'prem_happy_count_one' : 'prem_happy_count_many', { count: count }) : '';
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

    // Account-less: no sign-in. Render premium state from local storage and
    // verify any just-completed purchase (via ?checkout=premium_success&session_id).
    renderPremiumUI();
    checkPremiumReturn();

    // Close auth modal on backdrop click
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.addEventListener('click', e => {
            if (e.target === authModal) closeAuthModal();
        });
    }
});
