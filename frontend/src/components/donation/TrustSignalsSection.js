import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Link,
  useTheme,
  useMediaQuery,
  Divider,
  Paper
} from '@mui/material';
import {
  Lock as LockIcon,
  Security as SecurityIcon,
  Receipt as ReceiptIcon,
  VerifiedUser as VerifiedUserIcon,
  Policy as PolicyIcon,
  GppGood as GppGoodIcon,
} from '@mui/icons-material';

const TrustSignalsSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const trustItems = [
    {
      icon: <LockIcon color="primary" fontSize="large" />,
      title: 'Secure Donations',
      description: 'All transactions are encrypted and secure',
      link: '/security',
      linkText: 'Learn more about our security'
    },
    {
      icon: <SecurityIcon color="primary" fontSize="large" />,
      title: 'PCI Compliant',
      description: 'We meet all Payment Card Industry security standards',
      link: '/pci-compliance',
      linkText: 'View compliance details'
    },
    {
      icon: <VerifiedUserIcon color="primary" fontSize="large" />,
      title: 'Verified Nonprofit',
      description: '501(c)(3) tax-exempt organization',
      link: '/about',
      linkText: 'About our organization'
    },
    {
      icon: <ReceiptIcon color="primary" fontSize="large" />,
      title: 'Tax-Deductible',
      description: 'Your donation is tax-deductible to the extent allowed by law',
      link: '/tax-info',
      linkText: 'Tax information'
    },
    {
      icon: <PolicyIcon color="primary" fontSize="large" />,
      title: 'Privacy Protected',
      description: 'We respect your privacy and protect your information',
      link: '/privacy',
      linkText: 'Read our privacy policy'
    },
    {
      icon: <GppGoodIcon color="primary" fontSize="large" />,
      title: 'Financial Transparency',
      description: 'View our annual reports and financial statements',
      link: '/financials',
      linkText: 'View financial reports'
    }
  ];

  const paymentMethods = [
    { name: 'Visa', icon: '/images/payments/visa.png' },
    { name: 'Mastercard', icon: '/images/payments/mastercard.png' },
    { name: 'American Express', icon: '/images/payments/amex.png' },
    { name: 'Discover', icon: '/images/payments/discover.png' },
    { name: 'PayPal', icon: '/images/payments/paypal.png' },
  ];

  return (
    <Box sx={{ my: 6 }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Your Donation is Secure
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" paragraph sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
        We take your security and privacy seriously. Your information is protected by industry-standard encryption and security measures.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {trustItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                '&:hover': {
                  boxShadow: 2,
                  borderColor: 'primary.main',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <Box sx={{ color: 'primary.main', mb: 2 }}>
                {item.icon}
              </Box>
              <Typography variant="h6" component="h3" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {item.description}
              </Typography>
              <Link 
                href={item.link} 
                color="primary" 
                variant="body2"
                sx={{ mt: 'auto', fontWeight: 500 }}
              >
                {item.linkText} →
              </Link>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 6 }} />

      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          We Accept
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            gap: 3,
            mt: 3,
            '& img': {
              height: 30,
              width: 'auto',
              opacity: 0.8,
              transition: 'opacity 0.2s ease-in-out',
              '&:hover': {
                opacity: 1,
              }
            }
          }}
        >
          {paymentMethods.map((method, index) => (
            <Box 
              key={index}
              component="img"
              src={method.icon}
              alt={method.name}
              title={method.name}
              sx={{
                height: 30,
                width: 'auto',
                filter: 'grayscale(100%)',
                opacity: 0.7,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  filter: 'grayscale(0%)',
                  opacity: 1,
                }
              }}
            />
          ))}
        </Box>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          backgroundColor: theme.palette.grey[50],
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          mt: 4
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" align="center">
          PSD AHS Alumni Association is a 501(c)(3) nonprofit organization. 
          Our EIN is 12-3456789. 
          Your donation is tax-deductible as allowed by law. 
          No goods or services were provided in exchange for your contribution.
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Link href="/privacy" color="text.secondary" variant="body2">
            Privacy Policy
          </Link>
          <Link href="/terms" color="text.secondary" variant="body2">
            Terms of Service
          </Link>
          <Link href="/financials" color="text.secondary" variant="body2">
            Financial Reports
          </Link>
          <Link href="/contact" color="text.secondary" variant="body2">
            Contact Us
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default TrustSignalsSection;
