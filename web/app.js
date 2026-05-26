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
    if (field.value.length >= maxLen) {
        const next = document.getElementById(nextFieldId);
        if (next) next.focus();
    }
    // Sync to hidden date field
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
    loadDarkMode();
    loadData();
    loadSettings();
    setupEventListeners();

    // Date fields are now DD/MM/YYYY number inputs — no max needed

    checkConsent();

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
    } else {
        NOTIF.disable();
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
}

function loadDarkMode() {
    const saved = localStorage.getItem('happymoments_theme') || 'dark';
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
}

function saveSettings() {
    try { localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(appSettings)); }
    catch (e) { showToast('Storage full — cannot save settings.', 'error'); }
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {
    startBtn.addEventListener('click', handleStart);

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

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    milestonesTab.classList.toggle('hidden', tabName !== 'milestones');
    combinedTab.classList.toggle('hidden', tabName !== 'combined');
    eventsTab.classList.toggle('hidden', tabName !== 'events');
    if (settingsTab) settingsTab.classList.toggle('hidden', tabName !== 'settings');

    // Clear selection state on tab switch
    selectedMilestone = null;
    selectedCombinedMilestone = null;
    if (sharePreviewEl) sharePreviewEl.textContent = '';
    if (combinedSharePreviewEl) combinedSharePreviewEl.textContent = '';

    if (tabName === 'milestones') {
        renderPersonFilter();
        renderMilestonesTab();
    }
    else if (tabName === 'combined') renderCombinedTab();
    else if (tabName === 'events') {
        renderEventsTab();
        renderPeopleTabGroups();
    }
    else if (tabName === 'settings') {
        loadSettingsUI();
    }
}

// ============================================================
// PERSON FILTER (Multi-select)
// ============================================================

function renderPersonFilter() {
    if (appData.events.length === 0) {
        personFilterEl.classList.add('hidden');
        return;
    }

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
    if (!validateDateFields(dateStr)) { _addingEvent = false; return; }

    const date = parseLocalDate(dateStr);

    const newEvent = {
        id: 'event_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        name: name,
        type: type,
        date: date
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

    renderEventsTab();
    renderConnectionMatrix();
    showToast(`${name} added!`, 'success');
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
    if (appData.events.length < 2) {
        combinedMilestonesContentEl.innerHTML = '<p class="empty-text">Add at least 2 events to see combined milestones.</p>';
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

    combinedMilestonesContentEl.innerHTML = html;

    // Sort combined milestones by date for sharing
    allCombinedMilestonesFlat.sort((a, b) => a.date.getTime() - b.date.getTime());
    updateCombinedSharePreview();
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
// Key format: "event_123456789_event_987654321"
function parseConnectionKey(key) {
    const eventIdPattern = /event_\d+/g;
    const matches = key.match(eventIdPattern);
    if (matches && matches.length === 2) {
        return matches;
    }
    // Fallback: try splitting and reconstructing
    const parts = key.split('_');
    if (parts.length === 4 && parts[0] === 'event' && parts[2] === 'event') {
        return [`event_${parts[1]}`, `event_${parts[3]}`];
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
            const tmpl2 = _t('is_old') || '{name} will be {value} {unit} old';
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

function renderMilestonesTab() {
    if (appData.events.length === 0) {
        milestonesColumnsEl.innerHTML = '<p class="empty-text">Add events first.</p>';
        personFilterEl.classList.add('hidden');
        return;
    }

    allMilestonesFlat = [];

    // Show "Today" highlight if anything special
    const todayBox = document.getElementById('todayHighlight');
    if (todayBox) {
        const today = getTodayHighlight();
        if (today.length > 0) {
            todayBox.innerHTML = today.map(t =>
                `<span class="today-item">${t.name}: <strong>${t.value.toLocaleString()}</strong> ${t.unit} (${t.why})</span>`
            ).join(' · ');
            todayBox.style.display = 'block';
        } else {
            todayBox.style.display = 'none';
        }
    }

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
        milestones.forEach(m => {
            m.eventName = e.name;
            m.eventId = e.id;
            m.eventType = e.type || 'birthday';
            m.fullDescription = getEventMilestoneDescription(e, m);
        });
        // Only add very special milestones
        const verySpecial = milestones.filter(m => isVerySpecialNumber(m.value));
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

        // Score and sort by combined roundness + proximity
        milestones.forEach(m => {
            const rScore = roundnessScore(m.value);
            const daysAway = m.timeUntil / (24 * 60 * 60 * 1000);
            // Proximity score: closer = higher (max ~100 for today, ~0 for 365d away)
            const pScore = Math.max(0, 100 - daysAway * 0.27);
            m._score = rScore * 0.7 + pScore * 0.3;
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
                            <div class="cm-line1"><span class="cm-num">${m.description}</span></div>
                            <div class="cm-line2"><span class="cm-alt-a">${timeUntilStr} · ${dateStr}</span></div>
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
                        <div class="column-milestone ${isVerySpecial ? 'very-special' : ''} ${hiddenClass} ${selected}"
                             onclick="selectMilestoneForShare(${m.globalIdx})">
                            <div class="cm-line1"><span class="cm-num">${m.value.toLocaleString()}</span> <span class="cm-unit">${m.unitName}</span>${marker ? `<span class="cm-marker">${marker}</span>` : ''}</div>
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
    const specialUnits = ['ratio', 'percent', 'multiple', 'halflife', 'crossover', 'double', 'gap_multiple'];

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

    // For dates within a week, show day name
    if (daysDiff <= 7) {
        return date.toLocaleDateString(getAppLocale(), {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    // For dates within a year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString(getAppLocale(), {
            month: 'short',
            day: 'numeric'
        });
    }

    // For future years, include year
    return date.toLocaleDateString(getAppLocale(), {
        month: 'short',
        day: 'numeric',
        year: '2-digit'
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
    updateSharePreview();
    const m = allMilestonesFlat[idx];
    // Update gift suggestions and card preview
    if (typeof renderGiftSuggestions === 'function') renderGiftSuggestions(m);
    if (typeof renderCardPreview === 'function') renderCardPreview(m, 'cardPreview');
    renderMilestonesTab();
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
    sharePreviewEl.innerHTML = `
        <div class="share-message-preview">
            <p>${message}</p>
        </div>
        <p class="share-hint">Click any milestone above to select it for sharing</p>
    `;
}

function pickShareTemplate(category) {
    if (typeof SHARE_MESSAGES === 'undefined') return null;
    const templates = SHARE_MESSAGES[category] || SHARE_MESSAGES.generic || [];
    if (templates.length === 0) return null;
    return templates[Math.floor(Math.random() * templates.length)];
}

function fillShareTemplate(template, m) {
    const dateStr = m.date.toLocaleDateString(getAppLocale(), { weekday: 'long', month: 'long', day: 'numeric' });
    const countdown = formatTimeDistance(m.timeUntil);
    const val = m.value.toLocaleString();
    const unit = m.unitName;
    const name = m.eventName || 'someone special';
    const why = m.description || m.type || 'special';

    let filled = template
        .replace(/\{name\}/g, name)
        .replace(/\{value\}/g, val)
        .replace(/\{unit\}/g, unit)
        .replace(/\{date\}/g, dateStr)
        .replace(/\{countdown\}/g, countdown)
        .replace(/\{why\}/g, why);

    // Ensure the message communicates WHEN it will happen
    // If template doesn't mention date/countdown, append it
    if (!template.includes('{date}') && !template.includes('{countdown}')) {
        filled += ` On ${dateStr} — ${countdown} from now!`;
    }

    return filled;
}

function getShareCategory(m) {
    if (m.isBirthday) return 'birthday';
    if (m.eventId === 'combined_sum' || m.eventName === 'Combined Sum') return 'combined';
    if (m.eventId === 'combined_ratio' || m.type === 'ratio') return 'ratio';
    // Map milestone type to message category
    const typeMap = {
        'power_of_10': 'round', 'round': 'round',
        'repdigit': 'repdigit', 'palindrome': 'palindrome',
        'fibonacci': 'fibonacci', 'power_of_2': 'power_of_2',
        'scientific': 'scientific', 'sequential': 'sequential',
        'alternating': 'alternating'
    };
    return typeMap[m.type] || 'generic';
}

function generateShareMessage(m) {
    const category = getShareCategory(m);
    const template = pickShareTemplate(category);

    if (template) {
        return fillShareTemplate(template, m);
    }

    // Fallback if no templates loaded
    const dateStr = m.date.toLocaleDateString(getAppLocale(), { weekday: 'long', month: 'long', day: 'numeric' });
    const countdown = formatTimeDistance(m.timeUntil);
    const val = m.value.toLocaleString();

    if (m.isBirthday) {
        return m.fullDescription.replace(/[🎂🎉]\s*/g, '') + ` on ${dateStr} (${countdown} from now)!`;
    }
    return `${m.eventName} will be ${val} ${m.unitName} old on ${dateStr} — just ${countdown} away!`;
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
}

function handleViberShare() {
    const idx = selectedMilestone !== null ? selectedMilestone : 0;
    const m = allMilestonesFlat[idx];
    if (!m) return;

    const message = generateShareMessage(m);
    const encoded = encodeURIComponent(message);
    window.open(`viber://forward?text=${encoded}`, '_blank');
}

function handleEmailShare() {
    const idx = selectedMilestone !== null ? selectedMilestone : 0;
    const m = allMilestonesFlat[idx];
    if (!m) return;

    const message = generateShareMessage(m);
    const subject = encodeURIComponent('A special moment to celebrate!');
    const body = encodeURIComponent(message);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
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
    combinedSharePreviewEl.innerHTML = `
        <div class="share-message-preview">
            <p>${message}</p>
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

    return `Hey! I discovered something amazing - ${description} on ${dateStr}! That's ${formatTimeDistance(m.timeUntil)} from now. Let's celebrate this special moment together!`;
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
}

function handleViberCombinedShare() {
    const idx = selectedCombinedMilestone !== null ? selectedCombinedMilestone : 0;
    const m = allCombinedMilestonesFlat[idx];
    if (!m) return;

    const message = generateCombinedShareMessage(m);
    const encoded = encodeURIComponent(message);
    window.open(`viber://forward?text=${encoded}`, '_blank');
}

function handleEmailCombinedShare() {
    const idx = selectedCombinedMilestone !== null ? selectedCombinedMilestone : 0;
    const m = allCombinedMilestonesFlat[idx];
    if (!m) return;

    const message = generateCombinedShareMessage(m);
    const subject = encodeURIComponent('A special moment to celebrate!');
    const body = encodeURIComponent(message);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
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

    birthNameInput.value = 'My Birthday';
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

    // Always show the switcher
    setSwitcher.classList.remove('hidden');

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
            saveData();
            switchToSet(newSet.id);
            updateSetSwitcher();
            showToast('Group "' + name.trim() + '" created', 'success');
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
}

function handleAddSet() {
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
// START APP
// ============================================================

document.addEventListener('DOMContentLoaded', init);
