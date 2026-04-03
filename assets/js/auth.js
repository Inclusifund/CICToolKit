/**
 * InclusiFund Authentication Module
 * Centralized session management with security hardening
 * 
 * Security improvements:
 * - Session expiration enforcement
 * - Proper logout cleanup
 * - Auth redirect logic
 * - XSS prevention helpers
 */

const InclusiFundAuth = (function () {
    'use strict';

    // Configuration
    const CONFIG = {
        SESSION_KEY: 'inclusifund_user',
        SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
        LOGIN_URL: 'https://tools.inclusifund.co.uk/log-in/user-account'
    };

    /**
     * Check if user session is valid
     * @returns {Object|null} User object if valid, null otherwise
     */
    function checkSession() {
        const raw = localStorage.getItem(CONFIG.SESSION_KEY);

        if (!raw) {
            return null;
        }

        try {
            const user = JSON.parse(raw);

            // Check for session expiration
            if (!user.expiresAt || Date.now() >= user.expiresAt) {
                clearSession();
                return null;
            }

            return user;
        } catch (e) {
            console.error('Error parsing user session:', e);
            clearSession();
            return null;
        }
    }

    /**
     * Require authentication - redirect to login if not authenticated
     * @returns {Object|null} User object if authenticated
     */
    function requireAuth() {
        const user = checkSession();

        if (!user) {
            redirectToLogin();
            return null;
        }

        return user;
    }

    /**
     * Check if user is authenticated without redirecting
     * @returns {boolean}
     */
    function isAuthenticated() {
        return checkSession() !== null;
    }

    /**
     * Set user session with expiration
     * @param {Object} userData - User data to store
     */
    function setSession(userData) {
        const sessionData = {
            ...userData,
            expiresAt: Date.now() + CONFIG.SESSION_TIMEOUT
        };

        localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(sessionData));
    }

    /**
     * Clear user session
     */
    function clearSession() {
        localStorage.removeItem(CONFIG.SESSION_KEY);
        sessionStorage.clear();
    }

    /**
     * Logout user and redirect to login
     */
    function logout() {
        clearSession();
        redirectToLogin();
    }

    /**
     * Redirect to login page
     */
    function redirectToLogin() {
        window.location.href = CONFIG.LOGIN_URL;
    }

    /**
     * Get user initials for avatar
     * @param {Object} user - User object
     * @returns {string} User initials
     */
    function getUserInitials(user) {
        if (!user) return 'IF';

        const firstName = user.first_name || user.name || 'U';
        const lastName = user.last_name || '';
        const initials = (firstName[0] + (lastName[0] || '')).toUpperCase();

        return initials || 'IF';
    }

    /**
     * Safely set text content (XSS prevention)
     * @param {HTMLElement} element - Target element
     * @param {string} text - Text to set
     */
    function safeSetText(element, text) {
        if (!element) return;
        element.textContent = text;
    }

    /**
     * Safely set HTML content with sanitization
     * WARNING: Only use when absolutely necessary. Prefer safeSetText.
     * @param {HTMLElement} element - Target element
     * @param {string} html - HTML to set
     */
    function safeSetHTML(element, html) {
        if (!element) return;

        // Basic sanitization - remove script tags and event handlers
        const sanitized = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/javascript:/gi, '');

        element.innerHTML = sanitized;
    }

    /**
     * Populate user profile in UI
     * @param {Object} user - User object
     * @param {Object} elements - Object with element IDs
     */
    function populateUserProfile(user, elements = {}) {
        if (!user) return;

        const {
            nameId = 'user-name',
            emailId = 'user-email',
            avatarId = 'user-avatar'
        } = elements;

        // Set user name
        const nameEl = document.getElementById(nameId);
        if (nameEl) {
            const displayName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
            safeSetText(nameEl, displayName);
        }

        // Set user email
        const emailEl = document.getElementById(emailId);
        if (emailEl) {
            safeSetText(emailEl, user.email || '');
        }

        // Set user avatar initials
        const avatarEl = document.getElementById(avatarId);
        if (avatarEl) {
            safeSetText(avatarEl, getUserInitials(user));
        }
    }

    /**
     * Setup logout button
     * @param {string} buttonId - ID of logout button
     */
    function setupLogoutButton(buttonId = 'logout-btn') {
        const logoutBtn = document.getElementById(buttonId);

        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                logout();
            });
        }
    }

    // Public API
    return {
        checkSession,
        requireAuth,
        isAuthenticated,
        setSession,
        clearSession,
        logout,
        redirectToLogin,
        getUserInitials,
        safeSetText,
        safeSetHTML,
        populateUserProfile,
        setupLogoutButton,
        CONFIG
    };
})();

// Make available globally
window.InclusiFundAuth = InclusiFundAuth;
