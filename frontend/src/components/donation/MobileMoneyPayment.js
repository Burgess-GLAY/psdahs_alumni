import React, { useState } from 'react';
import { Box, TextField, Button, Alert, Typography } from '@mui/material';
import { analyticsService } from '../../services/analyticsService';

const MobileMoneyPayment = ({ donationData, onSuccess, onError }) => {
  const [phone, setPhone] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!/^[0-9]{8,}$/.test(phone)) {
        throw new Error('Enter a valid mobile number');
      }
      analyticsService.trackCustomEvent('payment_initiated', { method: 'liberia_mobile_money' });
      // Placeholder: integrate with backend Mobile Money API
      await new Promise((r) => setTimeout(r, 800));
      analyticsService.trackCustomEvent('payment_success', { method: 'liberia_mobile_money' });
      onSuccess?.({ transactionId: `MM-${Date.now()}` });
    } catch (e) {
      setError(e.message);
      analyticsService.trackError(e, { method: 'liberia_mobile_money' });
      onError?.(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>How it works</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Enter your Mobile Money number. You will receive a prompt to approve the payment.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField label="Mobile Number" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth sx={{ mb: 2 }} />
      <TextField label="Reference (optional)" value={reference} onChange={(e) => setReference(e.target.value)} fullWidth sx={{ mb: 2 }} />
      <Button variant="contained" color="primary" onClick={handlePay} disabled={loading}>
        {loading ? 'Processing…' : 'Pay with Mobile Money'}
      </Button>
    </Box>
  );
};

export default MobileMoneyPayment;
