# Image Storage Configuration for Class Groups

This document describes the image storage infrastructure for class group photos in the PSD AHS Alumni Platform.

## Overview

The image storage system manages class photos for all graduating classes from 2007/2008 to 2024/2025. It includes:

- Configuration for local and cloud storage
- Image validation and optimization settings
- Placeholder image generation
- Support for multiple image sizes (cover, banner, thumbnail)

## Directory Structure

```
frontend/public/images/class-groups/
├── placeholders/          # SVG placeholder images
│   ├── placeholder-2007.svg
│   ├── placeholder-2008.svg
│   └── ...
├── banners/              # Banner images (1200x600)
│   ├── banner-2007.svg
│   ├── banner-2008.svg
│   └── ...
├── thumbnails/           # Thumbnail images (400x200)
└── default-placeholder.svg
```

## Image Specifications

### Cover Images (for cards)
- **Dimensions**: 800x400px
- **Aspect Ratio**: 2:1
- **Format**: JPEG, PNG, or WebP
- **Max Size**: 5MB
- **Quality**: 80%

### Banner Images (for detail pages)
- **Dimensions**: 1200x600px
- **Aspect Ratio**: 2:1
- **Format**: JPEG, PNG, or WebP
- **Max Size**: 5MB
- **Quality**: 80%

### Thumbnails (for lists)
- **Dimensions**: 400x200px
- **Aspect Ratio**: 2:1
- **Format**: JPEG, PNG, or WebP
- **Quality**: 80%

## Configuration File

The main configuration is in `backend/config/imageStorage.js`:

```javascript
const { imageStorageConfig } = require('./config/imageStorage');
```

### Key Configuration Options

- **paths**: Directory paths for different image types
- **allowedFormats**: Supported image formats (jpg, jpeg, png, webp)
- **maxFileSize**: Maximum upload size (5MB)
- **dimensions**: Size specifications for each image type
- **optimization**: Image processing settings
- **cdn**: CDN configuration (for future use)
- **cloudStorage**: Cloud storage providers (Cloudinary, S3)

## Placeholder Images

Placeholder images are automatically generated SVG files that display:
- Class name (e.g., "Class of 2020/21")
- School motto ("Ad Altiora Tendo")
- Color-coded by year (rotating color scheme)
- Decorative patterns and accents

### Generating Placeholders

Run the placeholder generation script:

```bash
node backend/scripts/generatePlaceholders.js
```

This creates:
- 18 cover placeholders (800x400px)
- 18 banner placeholders (1200x600px)
- 1 default placeholder

## Usage in Code

### Import Configuration

```javascript
const { 
  imageStorageConfig, 
  getFullPath, 
  getImageUrl, 
  validateImage,
  ensureDirectories 
} = require('../config/imageStorage');
```

### Validate Image Upload

```javascript
const validation = validateImage(file);
if (!validation.valid) {
  return res.status(400).json({ error: validation.error });
}
```

### Get Image URL

```javascript
const imageUrl = getImageUrl('/images/class-groups/class-2020.jpg');
// Returns: '/images/class-groups/class-2020.jpg' (local)
// Or: 'https://cdn.example.com/images/class-groups/class-2020.jpg' (CDN)
```

### Ensure Directories Exist

```javascript
ensureDirectories(); // Creates all required directories
```

## Cloud Storage Integration

### Cloudinary Setup

1. Set environment variables:
```env
CLOUD_STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

2. Images will be automatically uploaded to Cloudinary folder: `psdahs-alumni/class-groups`

### AWS S3 Setup

1. Set environment variables:
```env
CLOUD_STORAGE_PROVIDER=s3
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

2. Images will be uploaded to S3 folder: `class-groups`

## CDN Configuration

To enable CDN for faster image delivery:

```env
CDN_ENABLED=true
CDN_BASE_URL=https://cdn.example.com
CDN_PROVIDER=cloudinary
```

## Image Upload Flow

1. **Validation**: Check file type, size, and format
2. **Processing**: Resize and optimize image
3. **Storage**: Save to local or cloud storage
4. **Database**: Update ClassGroup model with image URL
5. **Response**: Return image URL to client

## Optimization Settings

Images are automatically optimized with:
- **Quality**: 80% (good balance of quality and size)
- **Progressive JPEG**: Enabled for faster loading
- **Metadata Stripping**: Remove EXIF data for privacy
- **Compression**: Level 6 for PNG files

## Security Considerations

- File type validation (only images allowed)
- File size limits (5MB max)
- Sanitized file names
- Secure storage paths
- CORS configuration for CDN

## Future Enhancements

- [ ] Automatic image resizing on upload
- [ ] WebP conversion for better compression
- [ ] Lazy loading implementation
- [ ] Image caching strategy
- [ ] Batch upload for multiple classes
- [ ] Image moderation/approval workflow
- [ ] Watermarking for copyright protection

## Troubleshooting

### Images Not Loading

1. Check if directories exist:
```bash
ls -la frontend/public/images/class-groups/
```

2. Verify file permissions:
```bash
chmod -R 755 frontend/public/images/class-groups/
```

3. Check image paths in database:
```javascript
ClassGroup.find({}, 'name coverImage bannerImage')
```

### Placeholder Generation Fails

1. Ensure Node.js has write permissions
2. Check if parent directories exist
3. Run with elevated permissions if needed

### Upload Fails

1. Check file size (must be < 5MB)
2. Verify file format (jpg, jpeg, png, webp only)
3. Check disk space availability
4. Verify cloud storage credentials (if using)

## Support

For issues or questions about image storage:
- Check logs in `backend/logs/`
- Review configuration in `backend/config/imageStorage.js`
- Contact the development team
