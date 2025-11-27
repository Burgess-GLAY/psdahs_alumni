import React, { useState, useEffect } from 'react';
import { CardMedia, Box } from '@mui/material';
import { BrokenImage } from '@mui/icons-material';
import { getImageUrl, getFallbackImage } from '../../utils/imageUtils';

/**
 * SafeImage Component
 * Wraps MUI CardMedia with automatic image URL handling and error fallback
 */
const SafeImage = ({
    src,
    alt = 'Image',
    fallbackType = 'default',
    component = 'img',
    onError,
    sx = {},
    ...props
}) => {
    const [imageError, setImageError] = useState(false);

    // Get the full image URL
    const [imageSrc, setImageSrc] = useState('');

    useEffect(() => {
        if (imageError) {
            setImageSrc(getFallbackImage(fallbackType));
        } else if (src) {
            // If src is already a full URL or starts with /, use it as is
            if (src.startsWith('http') || src.startsWith('/')) {
                setImageSrc(src);
            } else {
                // Otherwise, use the getImageUrl function
                setImageSrc(getImageUrl(src));
            }
        } else {
            setImageSrc(getFallbackImage(fallbackType));
        }
    }, [src, imageError, fallbackType]);

    const handleImageError = (e) => {
        console.error('Image failed to load:', e.target.src);
        setImageError(true);
        if (onError) {
            onError(e);
        }
    };

    // If image failed and no fallback, show broken image icon
    if (imageError && !getFallbackImage(fallbackType)) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.200',
                    color: 'grey.500',
                    ...sx
                }}
            >
                <BrokenImage sx={{ fontSize: 48 }} />
            </Box>
        );
    }

    return (
        <CardMedia
            component={component}
            src={component === 'img' ? imageSrc : undefined}
            image={component !== 'img' ? imageSrc : undefined}
            alt={alt}
            onError={handleImageError}
            sx={{
                ...sx,
                objectFit: 'cover',
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                maxHeight: '100%'
            }}
            {...props}
        />
    );
};

export default SafeImage;
