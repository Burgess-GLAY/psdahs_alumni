/**
 * Image Utilities
 * Helper functions for handling image URLs across the application
 */

const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

/**
 * Get the full URL for an image
 * Handles both relative paths and absolute URLs
 * @param {string} imagePath - The image path from the API
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) {
        return '';
    }

    // If it's already a full URL (http/https), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // If it's a relative path, prepend the API base URL
    if (imagePath.startsWith('/')) {
        return `${API_BASE_URL}${imagePath}`;
    }

    // If it doesn't start with /, add it
    return `${API_BASE_URL}/${imagePath}`;
};

/**
 * Get a fallback image URL
 * @param {string} type - Type of fallback (announcement, profile, class-group, etc.)
 * @returns {string} Fallback image URL
 */
export const getFallbackImage = (type = 'default') => {
    const fallbacks = {
        announcement: '/images/default-announcement.jpg',
        profile: '/images/default-profile.jpg',
        'class-group': '/images/class-groups/default-class-bg.jpg',
        default: '/images/default-image.jpg'
    };

    return fallbacks[type] || fallbacks.default;
};

/**
 * Check if an image URL is valid and accessible
 * @param {string} imageUrl - The image URL to check
 * @returns {Promise<boolean>} True if image is accessible
 */
export const isImageAccessible = async (imageUrl) => {
    try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
};

/**
 * Preload an image
 * @param {string} imageUrl - The image URL to preload
 * @returns {Promise<void>}
 */
export const preloadImage = (imageUrl) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
        img.src = imageUrl;
    });
};

export default {
    getImageUrl,
    getFallbackImage,
    isImageAccessible,
    preloadImage
};
