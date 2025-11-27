import React, { useState } from 'react';
import { Box, TextField, Button, Alert, Typography } from '@mui/material';
import { analyticsService } from '../../services/analyticsService';

const OrangeMoneyPayment = ({ donationData, onSuccess, onError }) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!/^[0-9]{8,}$/.test(phone)) {
        throw new Error('Enter a valid Orange Money number');
      }
      analyticsService.trackCustomEvent('payment_initiated', { method: 'orange_money' });
      // Placeholder: integrate with backend Orange Money API
      await new Promise((r) => setTimeout(r, 800));
      analyticsService.trackCustomEvent('payment_success', { method: 'orange_money' });
      onSuccess?.({ transactionId: `OM-${Date.now()}` });
    } catch (e) {
      setError(e.message);
      analyticsService.trackError(e, { method: 'orange_money' });
      onError?.(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>How it works</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Enter your Orange Money number. You will receive a prompt to approve the payment.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField label="Orange Money Number" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth sx={{ mb: 2 }} />
      <Button variant="contained" color="primary" onClick={handlePay} disabled={loading}>
        {loading ? 'Processing…' : 'Pay with Orange Money'}
      </Button>
    </Box>
  );
};

export default OrangeMoneyPayment;
