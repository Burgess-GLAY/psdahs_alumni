import { Box, Typography, Divider } from '@mui/material';

/**
 * FormSection Component
 * 
 * A reusable component for creating consistent section headers in admin forms.
 * Provides a standardized layout with a title and divider.
 * 
 * @param {string} title - The section title to display
 * @param {React.ReactNode} children - The form fields to render within this section
 * @param {object} sx - Additional styling overrides
 */
const FormSection = ({ title, children, sx = {} }) => {
    return (
        <Box sx={{ width: '100%', ...sx }}>
            <Typography variant="h6" gutterBottom color="primary">
                {title}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {children}
        </Box>
    );
};

export default FormSection;
