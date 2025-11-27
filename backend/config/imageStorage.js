const path = require('path');
const fs = require('fs');

/**
 * Image Storage Configuration for Class Photos
 * 
 * This configuration defines storage paths, allowed formats,
 * size limits, and optimization settings for class group photos.
 */

const imageStorageConfig = {
    // Base paths for image storage
    paths: {
        // Public directory for serving images
        publicDir: path.join(__dirname, '../../frontend/public'),

        // Class groups images directory
        classGroups: '/images/class-groups',

        // Placeholder images directory
        placeholders: '/images/class-groups/placeholders',

        // Banners directory
        banners: '/images/class-groups/banners',

        // Thumbnails directory
        thumbnails: '/images/class-groups/thumbnails'
    },

    // Allowed image formats
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],

    // MIME types
    allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ],

    // Size limits (in bytes)
    maxFileSize: 5 * 1024 * 1024, // 5MB

    // Image dimensions for class photos
    dimensions: {
        // Cover image (for cards)
        cover: {
            width: 800,
            height: 400,
            aspectRatio: '2:1'
        },

        // Banner image (for detail pages)
        banner: {
            width: 1200,
            height: 600,
            aspectRatio: '2:1'
        },

        // Thumbnail (for lists)
        thumbnail: {
            width: 400,
            height: 200,
            aspectRatio: '2:1'
        }
    },

    // Image optimization settings
    optimization: {
        quality: 80, // JPEG/WebP quality (0-100)
        progressive: true, // Progressive JPEG
        compressionLevel: 6, // PNG compression (0-9)
        stripMetadata: true // Remove EXIF data
    },

    // Placeholder configuration
    placeholder: {
        backgroundColor: '#1e3a8a', // PSD blue
        textColor: '#ffffff',
        fontSize: 48,
        fontFamily: 'Arial, sans-serif',
        text: 'Class of {year}'
    },

    // CDN configuration (for future use)
    cdn: {
        enabled: false,
        baseUrl: process.env.CDN_BASE_URL || '',
        provider: process.env.CDN_PROVIDER || 'local' // 'local', 'cloudinary', 's3', etc.
    },

    // Cloud storage configuration (for future use)
    cloudStorage: {
        provider: process.env.CLOUD_STORAGE_PROVIDER || 'local', // 'local', 'cloudinary', 's3'

        // Cloudinary config
        cloudinary: {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
            apiKey: process.env.CLOUDINARY_API_KEY || '',
            apiSecret: process.env.CLOUDINARY_API_SECRET || '',
            folder: 'psdahs-alumni/class-groups'
        },

        // AWS S3 config
        s3: {
            bucket: process.env.AWS_S3_BUCKET || '',
            region: process.env.AWS_REGION || 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            folder: 'class-groups'
        }
    }
};

/**
 * Get the full file system path for a given image path
 * @param {string} imagePath - Relative image path (e.g., '/images/class-groups/class-2020.jpg')
 * @returns {string} Full file system path
 */
const getFullPath = (imagePath) => {
    return path.join(imageStorageConfig.paths.publicDir, imagePath);
};

/**
 * Get the URL path for serving an image
 * @param {string} imagePath - Relative image path
 * @returns {string} URL path for serving the image
 */
const getImageUrl = (imagePath) => {
    if (imageStorageConfig.cdn.enabled) {
        return `${imageStorageConfig.cdn.baseUrl}${imagePath}`;
    }
    return imagePath;
};

/**
 * Ensure required directories exist
 */
const ensureDirectories = () => {
    const dirs = [
        path.join(imageStorageConfig.paths.publicDir, imageStorageConfig.paths.classGroups),
        path.join(imageStorageConfig.paths.publicDir, imageStorageConfig.paths.placeholders),
        path.join(imageStorageConfig.paths.publicDir, imageStorageConfig.paths.banners),
        path.join(imageStorageConfig.paths.publicDir, imageStorageConfig.paths.thumbnails)
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });
};

/**
 * Validate image file
 * @param {Object} file - File object with mimetype and size
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
const validateImage = (file) => {
    if (!file) {
        return { valid: false, error: 'No file provided' };
    }

    // Check MIME type
    if (!imageStorageConfig.allowedMimeTypes.includes(file.mimetype)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed types: ${imageStorageConfig.allowedFormats.join(', ')}`
        };
    }

    // Check file size
    if (file.size > imageStorageConfig.maxFileSize) {
        const maxSizeMB = imageStorageConfig.maxFileSize / (1024 * 1024);
        return {
            valid: false,
            error: `File too large. Maximum size: ${maxSizeMB}MB`
        };
    }

    return { valid: true };
};

module.exports = {
    imageStorageConfig,
    getFullPath,
    getImageUrl,
    ensureDirectories,
    validateImage
};
