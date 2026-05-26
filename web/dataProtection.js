/**
 * HappyMoments — Data Protection Layer
 * Encrypts personal data in localStorage using AES-GCM via Web Crypto API.
 * Falls back to base64 obfuscation if crypto not available.
 */

const DATA_PROTECTION = (() => {
    const KEY_NAME = 'happymoments_dk';
    const ENCRYPTED_PREFIX = 'enc:';

    // Generate or retrieve a device-bound encryption key
    async function getKey() {
        const stored = sessionStorage.getItem(KEY_NAME);
        if (stored) {
            const raw = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
            return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
        }

        // Check if we have a persisted key in localStorage (base64)
        const persisted = localStorage.getItem(KEY_NAME);
        if (persisted) {
            sessionStorage.setItem(KEY_NAME, persisted);
            const raw = Uint8Array.from(atob(persisted), c => c.charCodeAt(0));
            return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
        }

        // Generate new key
        const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
        const exported = await crypto.subtle.exportKey('raw', key);
        const b64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
        localStorage.setItem(KEY_NAME, b64);
        sessionStorage.setItem(KEY_NAME, b64);
        return key;
    }

    async function encrypt(plaintext) {
        if (!crypto.subtle) return ENCRYPTED_PREFIX + btoa(unescape(encodeURIComponent(plaintext)));

        try {
            const key = await getKey();
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encoded = new TextEncoder().encode(plaintext);
            const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

            // Combine iv + ciphertext into a single base64 string
            const combined = new Uint8Array(iv.length + ciphertext.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(ciphertext), iv.length);

            // Chunked conversion to avoid call stack overflow with large data
            let binaryStr = '';
            for (let i = 0; i < combined.length; i++) binaryStr += String.fromCharCode(combined[i]);
            return ENCRYPTED_PREFIX + btoa(binaryStr);
        } catch (e) {
            console.warn('Encryption failed, using obfuscation:', e.message);
            return ENCRYPTED_PREFIX + btoa(unescape(encodeURIComponent(plaintext)));
        }
    }

    async function decrypt(data) {
        if (!data || !data.startsWith(ENCRYPTED_PREFIX)) return data;

        const payload = data.slice(ENCRYPTED_PREFIX.length);

        if (!crypto.subtle) {
            try { return decodeURIComponent(escape(atob(payload))); } catch { return data; }
        }

        try {
            const key = await getKey();
            const combined = Uint8Array.from(atob(payload), c => c.charCodeAt(0));
            const iv = combined.slice(0, 12);
            const ciphertext = combined.slice(12);

            const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
            return new TextDecoder().decode(decrypted);
        } catch (e) {
            // Fallback: maybe it was base64 obfuscated, not AES encrypted
            try { return decodeURIComponent(escape(atob(payload))); } catch { return data; }
        }
    }

    // Secure save: encrypt then store
    async function saveSecure(key, value) {
        const json = JSON.stringify(value);
        const encrypted = await encrypt(json);
        localStorage.setItem(key, encrypted);
    }

    // Secure load: load then decrypt
    async function loadSecure(key) {
        const stored = localStorage.getItem(key);
        if (!stored) return null;

        // If not encrypted (legacy data), return as-is parsed
        if (!stored.startsWith(ENCRYPTED_PREFIX)) {
            try { return JSON.parse(stored); } catch { return null; }
        }

        const decrypted = await decrypt(stored);
        try { return JSON.parse(decrypted); } catch { return null; }
    }

    // Securely delete all app data
    function deleteAllData() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('happyMoments') || key.startsWith('happymoments'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        sessionStorage.removeItem(KEY_NAME);
    }

    // Sanitize: strip any PII from console logs
    function sanitizeForLog(obj) {
        if (!obj) return obj;
        const sanitized = JSON.parse(JSON.stringify(obj));
        if (sanitized.sets) {
            sanitized.sets.forEach(set => {
                if (set.events) {
                    set.events.forEach(e => {
                        e.name = e.name ? '***' : '';
                        e.notes = e.notes ? '***' : '';
                    });
                }
            });
        }
        return sanitized;
    }

    return {
        encrypt,
        decrypt,
        saveSecure,
        loadSecure,
        deleteAllData,
        sanitizeForLog,
        isAvailable: () => !!crypto.subtle
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DATA_PROTECTION };
}
