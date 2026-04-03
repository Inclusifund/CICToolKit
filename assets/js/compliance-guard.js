/**
 * InclusiFund Compliance Guard
 * Centralized logic for checking compliance onboarding status.
 * Usage:
 *  - await ComplianceGuard.checkCompliance(userId); // returns boolean
 *  - await ComplianceGuard.requireCompliance(userId, returnUrl); // redirects if false
 */

window.ComplianceGuard = (function () {
    const CONVEX_URL = "https://terrific-bloodhound-927.convex.cloud";
    let client = null;

    function getClient() {
        if (!client && window.convex) {
            client = new window.convex.ConvexClient(CONVEX_URL);
        }
        return client;
    }

    /**
     * Check if a user has completed compliance onboarding.
     * @param {string} userId - The user's email/ID.
     * @returns {Promise<boolean>}
     */
    async function checkCompliance(userId) {
        const convex = getClient();
        if (!convex || !userId) return false;

        try {
            // Query returns null if no record, or the record object if found
            const record = await convex.query("compliance:getComplianceData", { userId });
            return !!record;
        } catch (e) {
            console.error("ComplianceGuard: Error checking status", e);
            return false; // Fail safe (assume not compliant if error, or maybe true? User said "gating")
            // Safest to assume false so they don't see broken calendar
        }
    }

    /**
     * Enforce compliance. Redirects to onboarding if not compliant.
     * @param {string} userId 
     * @param {string} [currentUrl] - URL to return to after onboarding
     */
    async function requireCompliance(userId, currentUrl) {
        const isCompliant = await checkCompliance(userId);
        if (!isCompliant) {
            console.log("ComplianceGuard: User not compliant. Redirecting to onboarding.");
            const target = `compliance-onboarding?returnTo=${encodeURIComponent(currentUrl || window.location.href)}`;
            window.location.href = target;
            return false;
        }
        return true;
    }

    return {
        checkCompliance,
        requireCompliance
    };
})();
