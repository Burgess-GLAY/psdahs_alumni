const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Image Service for Class Group Photos
 * Handles upload, optimization, and management of class photos
 */

/**
 * Upload and optimize a class photo
 * @param {Object} file - File object from multer or file path
 * @param {number} graduationYear - Graduation year for the class
 * @returns {Promise<Object>} Upload result with URLs
 */
const uploadClassPhoto = async (file, graduationYear) => {
    try {
        // Validate file
        if (!file) {
            throw new Error('No file provided');
        }

        // Validate graduation year
        if (!graduationYear || graduationYear < 2007 || graduationYear > 2025) {
            throw new Error('Invalid graduation year');
        }

        const filePath = file.path || file;

        // Validate file format
        const validFormats = ['jpg', 'jpeg', 'png', 'webp'];
        const fileExt = path.extname(filePath).toLowerCase().slice(1);

        if (!validFormats.includes(fileExt)) {
            throw new Error(`Invalid file format. Supported formats: ${validFormats.join(', ')}`);
        }

        // Upload to Cloudinary with transformations
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            folder: 'class-photos',
            public_id: `class-${graduationYear}`,
            overwrite: true,
            resource_type: 'image',
            transformation: [
                {
                    width: 1200,
                    height: 600,
                    crop: 'fill',
                    gravity: 'center',
                    quality: 'auto:good',
                    fetch_format: 'auto'
                }
            ],
            eager: [
                {
                    width: 800,
                    height: 400,
                    crop: 'fill',
                    gravity: 'center',
                    quality: 'auto:good',
                    fetch_format: 'auto'
                },
                {
                    width: 400,
                    height: 200,
                    crop: 'fill',
                    gravity: 'center',
                    quality: 'auto:good',
                    fetch_format: 'auto'
                }
            ],
            eager_async: false
        });

        // Return URLs for different sizes
        return {
            success: true,
            urls: {
                full: uploadResult.secure_url,
                display: uploadResult.eager && uploadResult.eager[0] ? uploadResult.eager[0].secure_url : uploadResult.secure_url,
                thumbnail: uploadResult.eager && uploadResult.eager[1] ? uploadResult.eager[1].secure_url : uploadResult.secure_url
            },
            publicId: uploadResult.public_id,
            format: uploadResult.format,
            width: uploadResult.width,
            height: uploadResult.height,
            bytes: uploadResult.bytes
        };

    } catch (error) {
        console.error('Error uploading class photo:', error);
        throw error;
    }
};

/**
 * Optimize an existing image file before upload
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to save optimized image
 * @returns {Promise<Object>} Optimization result
 */
const optimizeImage = async (inputPath, outputPath) => {
    try {
        const metadata = await sharp(inputPath).metadata();

        // Optimize image
        await sharp(inputPath)
            .resize(1200, 600, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({
                quality: 80,
                progressive: true
            })
            .toFile(outputPath);

        const stats = await fs.stat(outputPath);

        return {
            success: true,
            originalSize: metadata.size,
            optimizedSize: stats.size,
            reduction: ((metadata.size - stats.size) / metadata.size * 100).toFixed(2) + '%',
            dimensions: {
                width: 1200,
                height: 600
            }
        };

    } catch (error) {
        console.error('Error optimizing image:', error);
        throw error;
    }
};

/**
 * Delete a class photo from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<boolean>} Success status
 */
const deleteClassPhoto = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error('Error deleting class photo:', error);
        return false;
    }
};

/**
 * Get class photo URL by graduation year
 * @param {number} graduationYear - Graduation year
 * @returns {string} Cloudinary URL
 */
const getClassPhotoUrl = (graduationYear) => {
    const publicId = `class-photos/class-${graduationYear}`;
    return cloudinary.url(publicId, {
        transformation: [
            {
                width: 800,
                height: 400,
                crop: 'fill',
                gravity: 'center',
                quality: 'auto:good',
                fetch_format: 'auto'
            }
        ]
    });
};

/**
 * Validate image file
 * @param {Object} file - File object
 * @returns {Object} Validation result
 */
const validateImageFile = (file) => {
    const maxSize = 2 * 1024 * 1024; // 2MB
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!file) {
        return {
            valid: false,
            error: 'No file provided'
        };
    }

    if (!validMimeTypes.includes(file.mimetype)) {
        return {
            valid: false,
            error: `Invalid file type. Supported types: ${validMimeTypes.join(', ')}`
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File size exceeds maximum of ${maxSize / 1024 / 1024}MB`
        };
    }

    return {
        valid: true
    };
};

module.exports = {
    uploadClassPhoto,
    optimizeImage,
    deleteClassPhoto,
    getClassPhotoUrl,
    validateImageFile
};
