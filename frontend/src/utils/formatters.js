/**
 * Utility functions for formatting data display
 */

/**
 * Format member count for display
 * Handles edge cases like zero members and large numbers
 * @param {number} count - The member count
 * @returns {string} Formatted member count string
 */
export const formatMemberCount = (count) => {
    const num = Number(count) || 0;

    // Handle zero members
    if (num === 0) {
        return '0 members';
    }

    // Handle single member
    if (num === 1) {
        return '1 member';
    }

    // Handle large numbers (1000+)
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M members`;
    }

    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K members`;
    }

    // Handle normal numbers
    return `${num} members`;
};

/**
 * Format count for display (generic)
 * @param {number} count - The count
 * @param {string} singular - Singular form (e.g., 'post')
 * @param {string} plural - Plural form (e.g., 'posts')
 * @returns {string} Formatted count string
 */
export const formatCount = (count, singular, plural) => {
    const num = Number(count) || 0;

    if (num === 0) {
        return `0 ${plural}`;
    }

    if (num === 1) {
        return `1 ${singular}`;
    }

    // Handle large numbers
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M ${plural}`;
    }

    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K ${plural}`;
    }

    return `${num} ${plural}`;
};

/**
 * Format number with commas for readability
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
    const number = Number(num) || 0;
    return number.toLocaleString();
};

/**
 * Get member count badge color based on count
 * @param {number} count - The member count
 * @returns {string} Color indicator
 */
export const getMemberCountColor = (count) => {
    const num = Number(count) || 0;

    if (num === 0) return 'default';
    if (num < 10) return 'warning';
    if (num < 50) return 'info';
    return 'success';
};

export default {
    formatMemberCount,
    formatCount,
    formatNumber,
    getMemberCountColor
};
