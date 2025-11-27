import React from 'react';
import { Avatar } from '@mui/material';
import { getImageUrl } from '../../utils/imageUtils';

/**
 * SafeAvatar Component
 * Wraps MUI Avatar with automatic image URL handling
 * Ensures images are properly loaded from the correct path
 */
const SafeAvatar = ({ src, alt, children, ...props }) => {
    // Get the full image URL if src is provided
    const imageSrc = src ? getImageUrl(src) : undefined;

    return (
        <Avatar src={imageSrc} alt={alt} {...props}>
            {children}
        </Avatar>
    );
};

export default SafeAvatar;
