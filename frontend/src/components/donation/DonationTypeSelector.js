import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    Box,
    ToggleButton,
    ToggleButtonGroup,
    FormControl,
    FormLabel,
    MenuItem,
    Select,
    Typography,
    Paper,
} from '@mui/material';
import { setDonationType } from '../../features/donation/donationSlice';

/**
 * DonationTypeSelector Component
 * 
 * Recurring donations are disabled. Always sets one-time donation.
 * 
 * Requirements: 2.1, 2.2
 */
const DonationTypeSelector = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setDonationType('one-time'));
    }, [dispatch]);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
            }}
        >
            <FormControl component="fieldset" fullWidth>
                <FormLabel
                    component="legend"
                    sx={{
                        mb: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: 'text.primary',
                    }}
                >
                    Donation Type
                </FormLabel>
                <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="body1" fontWeight={600}>One-Time Donation</Typography>
                    <Typography variant="body2" color="text.secondary">Recurring donations are currently unavailable.</Typography>
                </Box>
            </FormControl>
        </Paper>
    );
};

export default DonationTypeSelector;
