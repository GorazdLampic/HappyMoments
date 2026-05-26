/**
 * HappyMoments — Authentication Module
 * Firebase Auth: Google, Apple, Email/Password
 *
 * SETUP: Replace firebaseConfig below with your Firebase project config.
 * Enable Google, Apple, and Email/Password providers in Firebase Console.
 */

// Firebase CDN imports (compat SDK for vanilla JS without bundler)
// These are loaded via <script> tags in index.html before this file

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCaaNKNWLXIjZBluPkxPC3i1s_MJn47NUg",
    authDomain: "happymoments-app.firebaseapp.com",
    projectId: "happymoments-app",
    storageBucket: "happymoments-app.firebasestorage.app",
    messagingSenderId: "767675751626",
    appId: "1:767675751626:web:311d04142956bca5dae833"
};

// ============================================================
// AUTH STATE
// ============================================================

const HM_AUTH = (() => {
    let currentUser = null;
    let authReady = false;
    let onAuthChangeCallbacks = [];

    function init() {
        if (typeof firebase === 'undefined') {
            console.warn('HappyMoments Auth: Firebase SDK not loaded');
            authReady = true;
            _notifyCallbacks(null);
            return;
        }

        // Initialize Firebase (only once)
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }

        // Listen for auth state changes
        firebase.auth().onAuthStateChanged(user => {
            currentUser = user;
            authReady = true;
            _notifyCallbacks(user);
        });
    }

    function onAuthChange(callback) {
        onAuthChangeCallbacks.push(callback);
        // If auth is already resolved, call immediately
        if (authReady) callback(currentUser);
    }

    function _notifyCallbacks(user) {
        onAuthChangeCallbacks.forEach(cb => {
            try { cb(user); } catch (e) { console.error('Auth callback error:', e); }
        });
    }

    // ============================================================
    // SIGN IN METHODS
    // ============================================================

    async function signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            const result = await firebase.auth().signInWithPopup(provider);
            return { success: true, user: result.user };
        } catch (error) {
            // On mobile, popup may be blocked — fall back to redirect
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                await firebase.auth().signInWithRedirect(provider);
                return { success: true, redirect: true };
            }
            return { success: false, error: _friendlyError(error) };
        }
    }

    async function signInWithApple() {
        const provider = new firebase.auth.OAuthProvider('apple.com');
        provider.addScope('email');
        provider.addScope('name');
        try {
            const result = await firebase.auth().signInWithPopup(provider);
            return { success: true, user: result.user };
        } catch (error) {
            if (error.code === 'auth/popup-blocked') {
                await firebase.auth().signInWithRedirect(provider);
                return { success: true, redirect: true };
            }
            return { success: false, error: _friendlyError(error) };
        }
    }

    async function signInWithEmail(email, password) {
        try {
            const result = await firebase.auth().signInWithEmailAndPassword(email, password);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: _friendlyError(error) };
        }
    }

    async function signUpWithEmail(email, password, displayName) {
        try {
            const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
            if (displayName) {
                await result.user.updateProfile({ displayName });
            }
            // Send verification email (non-blocking)
            result.user.sendEmailVerification().catch(() => {});
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: _friendlyError(error) };
        }
    }

    async function resetPassword(email) {
        try {
            await firebase.auth().sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            // Don't reveal if email exists or not (security)
            return { success: true };
        }
    }

    async function signOut() {
        try {
            await firebase.auth().signOut();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ============================================================
    // HELPERS
    // ============================================================

    function getUser() {
        return currentUser;
    }

    function isLoggedIn() {
        return !!currentUser;
    }

    async function getIdToken() {
        if (!currentUser) return null;
        return currentUser.getIdToken();
    }

    function getUserDisplayName() {
        if (!currentUser) return null;
        return currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
    }

    function getUserEmail() {
        return currentUser?.email || null;
    }

    function isEmailVerified() {
        return currentUser?.emailVerified || false;
    }

    function _friendlyError(error) {
        const map = {
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/invalid-credential': 'Invalid email or password.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password must be at least 6 characters.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Check your connection.',
            'auth/operation-not-allowed': 'This sign-in method is not enabled.',
        };
        return map[error.code] || error.message || 'Something went wrong.';
    }

    return {
        init,
        onAuthChange,
        signInWithGoogle,
        signInWithApple,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
        getUser,
        isLoggedIn,
        getIdToken,
        getUserDisplayName,
        getUserEmail,
        isEmailVerified
    };
})();
