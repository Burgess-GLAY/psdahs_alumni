import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Divider,
} from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import HeroSection from '../../components/donation/HeroSection';
import DonationCategoriesSection from '../../components/donation/DonationCategoriesSection';
import DonationTypeSelector from '../../components/donation/DonationTypeSelector';
import AmountSelector from '../../components/donation/AmountSelector';
import DonorInformationForm from '../../components/donation/DonorInformationForm';
import PaymentMethodSelector from '../../components/donation/PaymentMethodSelector';
import DonorRecognitionForm from '../../components/donation/DonorRecognitionForm';
import ThankYouModal from '../../components/donation/ThankYouModal';
import ImpactStoriesSection from '../../components/donation/ImpactStoriesSection';
// import StripePaymentWrapper from '../../components/donation/StripePaymentWrapper';
import {
  setCategory,
  prefillDonorInfo,
  selectFormData,
  selectEffectiveAmount,
  selectIsSuccess,
  selectTransactionId,
  selectReceiptUrl,
  resetDonation,
} from '../../features/donation/donationSlice';

const DonationPage = () => {
  const dispatch = useDispatch();
  const [showThankYou, setShowThankYou] = useState(false);
  const [transactionData, setTransactionData] = useState(null);

  const user = useSelector((state) => state.auth?.user);
  const formData = useSelector((state) => state.donation?.formData || {
    type: 'one-time',
    frequency: null,
    amount: null,
    customAmount: '',
    category: 'all',
    donorInfo: {
      name: '',
      email: '',
      displayName: null,
      optInRecognition: false,
      optInUpdates: false
    },
    paymentMethod: 'card',
    showOnWall: false,
    displayOption: 'fullName',
    customDisplayName: ''
  });

  const methods = useForm({
    defaultValues: formData,
    mode: 'onChange',
  });

  const { watch, setValue, handleSubmit } = methods;
  const effectiveAmount = useSelector((state) => {
    if (!state.donation?.formData) return null;
    const { amount, customAmount } = state.donation.formData;
    if (amount !== null) return amount;
    if (customAmount) {
      const parsed = parseFloat(customAmount);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  });
  const isSuccess = useSelector((state) => state.donation?.success || false);
  const transactionId = useSelector((state) => state.donation?.transactionId || null);
  const receiptUrl = useSelector((state) => state.donation?.receiptUrl || null);

  // Pre-fill donor info if user is logged in
  useEffect(() => {
    if (user?.name || user?.email) {
      dispatch(prefillDonorInfo({
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user, dispatch]);

  // Show thank you modal when donation succeeds
  useEffect(() => {
    if (isSuccess && transactionId) {
      setTransactionData({
        amount: effectiveAmount,
        transactionId,
        receiptUrl,
        date: new Date().toISOString(),
        category: formData.category,
        type: formData.type,
      });
      setShowThankYou(true);
    }
  }, [isSuccess, transactionId, effectiveAmount, receiptUrl, formData]);

  const handleCategorySelect = (category) => {
    dispatch(setCategory(category));
  };

  const handleCloseThankYou = () => {
    setShowThankYou(false);
    setTransactionData(null);
    dispatch(resetDonation());
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'alumni-support':
        return 'Alumni Support';
      case 'scholarships':
        return 'Scholarships';
      case 'programs':
        return 'Programs';
      default:
        return 'All Categories';
    }
  };

  const onSubmit = (data) => {
    console.log('Form submitted:', data);
    // Handle form submission here
  };

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        {/* Hero Section */}
        <HeroSection />

        {/* Donation Categories */}
        <DonationCategoriesSection
          selectedCategory={formData.category}
          onCategorySelect={handleCategorySelect}
        />

        {/* Main Donation Form - Centered and Portable */}
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Grid container spacing={4} justifyContent="center">
            {/* Main Form - Vertical Layout */}
            <Grid item xs={12} md={10} lg={8}>
              <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
                  Make Your Donation
                </Typography>

                {/* Donation Type */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Donation Type
                  </Typography>
                  <DonationTypeSelector />
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Amount Selection */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Select Amount
                  </Typography>
                  <AmountSelector />
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Donor Information */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Your Information
                  </Typography>
                  <DonorInformationForm />
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Payment Method */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Payment Method
                  </Typography>
                  <PaymentMethodSelector
                    donationData={{
                      amount: effectiveAmount,
                      type: formData.type,
                      frequency: formData.frequency,
                      category: formData.category,
                      donorInfo: formData.donorInfo,
                    }}
                    onSuccess={(data) => {
                      setTransactionData(data);
                      setShowThankYou(true);
                    }}
                    onError={(error) => {
                      console.error('Payment error:', error);
                    }}
                  />

                  <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2, mt: 2 }}>
                    <Typography variant="h6" color="text.secondary">
                      Payment System Maintenance
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Our payment system is currently undergoing scheduled maintenance.
                      Please check back later or contact the alumni office for alternative donation methods.
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Donor Recognition */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Recognition Preferences
                  </Typography>
                  <DonorRecognitionForm />
                </Box>
              </Paper>
            </Grid>

            {/* Summary Sidebar - Optional, can be shown below on mobile */}
            <Grid item xs={12} md={10} lg={4}>
              {/* Donation Summary */}
              <Paper elevation={2} sx={{ p: 3, mb: 3, position: 'sticky', top: 20 }}>
                <Typography variant="h6" gutterBottom>
                  Donation Summary
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    One-Time
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    ${effectiveAmount || '0'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {getCategoryLabel(formData.category)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" color="text.secondary" display="block">
                  Your donation is tax-deductible. You'll receive a receipt via email.
                </Typography>
              </Paper>

              {/* Quick FAQ */}
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick FAQ
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Is my donation secure?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Yes, all transactions are encrypted and PCI compliant.
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Will I get a receipt?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Yes, you'll receive an email receipt immediately after your donation.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    How are payments processed securely?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Card payments are processed via Stripe with PCI DSS compliance. Mobile money and Orange Money use secure gateways.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        {/* Impact Stories */}
        <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
          <Container maxWidth="lg">
            <ImpactStoriesSection />
          </Container>
        </Box>


        {/* Thank You Modal */}
        <ThankYouModal
          open={showThankYou}
          onClose={handleCloseThankYou}
          donationData={transactionData}
        />
      </Box>
    </FormProvider>
  );
};

export default DonationPage;
