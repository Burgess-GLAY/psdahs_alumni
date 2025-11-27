const fs = require('fs');
const path = require('path');

/**
 * Generate SVG placeholder images for class groups
 * 
 * This script creates SVG placeholder images for each class group
 * from 2007 to 2024. These placeholders will be used until actual
 * class photos are uploaded.
 */

// Configuration
const OUTPUT_DIR = path.join(__dirname, '../../frontend/public/images/class-groups');
const PLACEHOLDERS_DIR = path.join(OUTPUT_DIR, 'placeholders');
const BANNERS_DIR = path.join(OUTPUT_DIR, 'banners');

// Ensure directories exist
const ensureDirectories = () => {
    [OUTPUT_DIR, PLACEHOLDERS_DIR, BANNERS_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });
};

// Color schemes for different years (rotating pattern)
const colorSchemes = [
    { bg: '#1e3a8a', text: '#ffffff', accent: '#3b82f6' }, // Blue
    { bg: '#7c2d12', text: '#ffffff', accent: '#ea580c' }, // Orange
    { bg: '#14532d', text: '#ffffff', accent: '#22c55e' }, // Green
    { bg: '#581c87', text: '#ffffff', accent: '#a855f7' }, // Purple
    { bg: '#831843', text: '#ffffff', accent: '#ec4899' }, // Pink
    { bg: '#0c4a6e', text: '#ffffff', accent: '#0ea5e9' }  // Cyan
];

/**
 * Generate SVG placeholder for a class group
 * @param {number} year - Graduation year
 * @param {string} type - 'cover' or 'banner'
 * @returns {string} SVG content
 */
const generateSVG = (year, type = 'cover') => {
    const nextYear = year + 1;
    const academicYear = `${year}/${nextYear.toString().slice(-2)}`;
    const className = `Class of ${academicYear}`;

    // Dimensions based on type
    const dimensions = type === 'banner'
        ? { width: 1200, height: 600 }
        : { width: 800, height: 400 };

    // Select color scheme based on year
    const colorIndex = (year - 2007) % colorSchemes.length;
    const colors = colorSchemes[colorIndex];

    // SVG template
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${dimensions.width}" height="${dimensions.height}" fill="${colors.bg}"/>
  
  <!-- Decorative pattern -->
  <defs>
    <pattern id="pattern-${year}" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="1" fill="${colors.accent}" opacity="0.1"/>
    </pattern>
  </defs>
  <rect width="${dimensions.width}" height="${dimensions.height}" fill="url(#pattern-${year})"/>
  
  <!-- Accent shapes -->
  <circle cx="${dimensions.width * 0.15}" cy="${dimensions.height * 0.2}" r="${dimensions.height * 0.3}" fill="${colors.accent}" opacity="0.1"/>
  <circle cx="${dimensions.width * 0.85}" cy="${dimensions.height * 0.8}" r="${dimensions.height * 0.25}" fill="${colors.accent}" opacity="0.1"/>
  
  <!-- School motto -->
  <text x="${dimensions.width / 2}" y="${dimensions.height * 0.35}" 
        font-family="Georgia, serif" font-size="${type === 'banner' ? '24' : '16'}" 
        fill="${colors.text}" opacity="0.7" text-anchor="middle" font-style="italic">
    Ad Altiora Tendo
  </text>
  
  <!-- Class name -->
  <text x="${dimensions.width / 2}" y="${dimensions.height * 0.5}" 
        font-family="Arial, sans-serif" font-size="${type === 'banner' ? '64' : '48'}" 
        font-weight="bold" fill="${colors.text}" text-anchor="middle">
    ${className}
  </text>
  
  <!-- Subtitle -->
  <text x="${dimensions.width / 2}" y="${dimensions.height * 0.65}" 
        font-family="Arial, sans-serif" font-size="${type === 'banner' ? '20' : '16'}" 
        fill="${colors.text}" opacity="0.8" text-anchor="middle">
    PSD AHS Alumni
  </text>
  
  <!-- Bottom decoration -->
  <line x1="0" y1="${dimensions.height - 4}" x2="${dimensions.width}" y2="${dimensions.height - 4}" 
        stroke="${colors.accent}" stroke-width="4"/>
</svg>`;
};

/**
 * Generate all placeholder images
 */
const generateAllPlaceholders = () => {
    console.log('Generating placeholder images for class groups...\n');

    let generated = 0;

    for (let year = 2007; year <= 2024; year++) {
        // Generate cover image (800x400)
        const coverSVG = generateSVG(year, 'cover');
        const coverPath = path.join(PLACEHOLDERS_DIR, `placeholder-${year}.svg`);
        fs.writeFileSync(coverPath, coverSVG);
        console.log(`✓ Generated cover: placeholder-${year}.svg`);

        // Generate banner image (1200x600)
        const bannerSVG = generateSVG(year, 'banner');
        const bannerPath = path.join(BANNERS_DIR, `banner-${year}.svg`);
        fs.writeFileSync(bannerPath, bannerSVG);
        console.log(`✓ Generated banner: banner-${year}.svg`);

        generated += 2;
    }

    console.log(`\n=== Generation Summary ===`);
    console.log(`Total images generated: ${generated}`);
    console.log(`Cover images: ${(generated / 2)}`);
    console.log(`Banner images: ${(generated / 2)}`);
    console.log(`\nPlaceholders saved to: ${PLACEHOLDERS_DIR}`);
    console.log(`Banners saved to: ${BANNERS_DIR}`);
};

/**
 * Generate a default placeholder for missing images
 */
const generateDefaultPlaceholder = () => {
    const defaultSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#1e3a8a"/>
  <text x="400" y="180" font-family="Arial, sans-serif" font-size="32" 
        fill="#ffffff" text-anchor="middle" opacity="0.7">
    PSD AHS Alumni
  </text>
  <text x="400" y="230" font-family="Arial, sans-serif" font-size="48" 
        font-weight="bold" fill="#ffffff" text-anchor="middle">
    Class Photo
  </text>
  <text x="400" y="270" font-family="Arial, sans-serif" font-size="20" 
        fill="#ffffff" text-anchor="middle" opacity="0.7">
    Coming Soon
  </text>
</svg>`;

    const defaultPath = path.join(OUTPUT_DIR, 'default-placeholder.svg');
    fs.writeFileSync(defaultPath, defaultSVG);
    console.log(`\n✓ Generated default placeholder: default-placeholder.svg`);
};

// Run the script
try {
    ensureDirectories();
    generateAllPlaceholders();
    generateDefaultPlaceholder();
    console.log('\n✅ All placeholder images generated successfully!');
} catch (error) {
    console.error('❌ Error generating placeholders:', error);
    process.exit(1);
}
