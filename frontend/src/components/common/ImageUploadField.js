import { useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

/**
 * ImageUploadField Component
 * 
 * A reusable image upload component with validation, preview, and error handling.
 * Validates file type and size, displays preview, and provides consistent error messages.
 * 
 * @param {string} id - Unique identifier for the input element
 * @param {string} label - Button label text (default: "Upload Image")
 * @param {function} onChange - Callback function when file is selected (receives file object)
 * @param {string} preview - URL or data URL for image preview
 * @param {string} helperText - Optional helper text to display below the button
 * @param {number} maxSizeMB - Maximum file size in MB (default: 5)
 * @param {string[]} acceptedFormats - Array of accepted MIME types (default: all images)
 * @param {boolean} disabled - Whether the upload is disabled
 * @param {boolean} fullWidth - Whether the button should be full width
 * @param {object} sx - Additional styling overrides
 */
const ImageUploadField = ({
    id,
    label = 'Upload Image',
    onChange,
    preview = null,
    helperText = '',
    maxSizeMB = 5,
    acceptedFormats = ['image/*'],
    disabled = false,
    fullWidth = true,
    sx = {}
}) => {
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        // Clear previous errors
        setError(null);

        // Validate file type
        const isValidType = acceptedFormats.some(format => {
            if (format === 'image/*') {
                return file.type.startsWith('image/');
            }
            return file.type === format;
        });

        if (!isValidType) {
            const formatList = acceptedFormats.join(', ');
            setError(`Please select a valid image file. Accepted formats: ${formatList}`);
            event.target.value = ''; // Reset input
            return;
        }

        // Validate file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            setError(`Image size must be less than ${maxSizeMB}MB`);
            event.target.value = ''; // Reset input
            return;
        }

        // Call the onChange callback with the valid file
        if (onChange) {
            onChange(file, event);
        }
    };

    return (
        <Box sx={{ width: '100%', ...sx }}>
            <input
                accept={acceptedFormats.join(',')}
                style={{ display: 'none' }}
                id={id}
                type="file"
                onChange={handleFileChange}
                disabled={disabled}
            />
            <label htmlFor={id}>
                <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    disabled={disabled}
                    fullWidth={fullWidth}
                >
                    {label}
                </Button>
            </label>

            {helperText && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {helperText}
                </Typography>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {preview && !error && (
                <Box
                    component="img"
                    src={preview}
                    alt="Preview"
                    sx={{
                        width: '100%',
                        maxHeight: 300,
                        objectFit: 'cover',
                        borderRadius: 1,
                        mt: 2,
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                />
            )}
        </Box>
    );
};

export default ImageUploadField;
