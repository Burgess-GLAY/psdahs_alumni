import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Box,
    Container,
    Grid,
    Typography,
    Link,
    IconButton,
    Divider,
    Button,
    useTheme,
} from '@mui/material';
import {
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    Instagram as InstagramIcon,
    LinkedIn as LinkedInIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { selectRole } from '../../features/auth/authSlice';
import { useAuthModalContext } from '../../contexts/AuthModalContext';

const Footer = () => {
    const theme = useTheme();
    const role = useSelector(selectRole);
    const { openLogin, openRegister } = useAuthModalContext();
    const isGuest = role === 'guest';

    const footerLinks = {
        quickLinks: [
            { text: 'Home', path: '/' },
            { text: 'About Us', path: '/about' },
            { text: 'Events', path: '/events' },
            { text: 'Contact', path: '/contact' },
        ],
        community: [
            { text: 'Alumni Directory', path: '/alumni', protected: true },
            { text: 'Class Groups', path: '/classes', protected: true },
            { text: 'Community', path: '/community', protected: true },
            { text: 'Gallery', path: '/gallery', protected: true },
        ],
        support: [
            { text: 'Donate Now', path: '/donate' },
            { text: 'Announcements', path: '/announcements', protected: true },
            { text: 'FAQs', path: '/contact#faqs' },
            { text: 'Privacy Policy', path: '/privacy' },
        ],
    };

    const socialLinks = [
        { icon: <FacebookIcon />, url: 'https://facebook.com', label: 'Facebook' },
        { icon: <TwitterIcon />, url: 'https://twitter.com', label: 'Twitter' },
        { icon: <InstagramIcon />, url: 'https://instagram.com', label: 'Instagram' },
        { icon: <LinkedInIcon />, url: 'https://linkedin.com', label: 'LinkedIn' },
    ];

    const contactInfo = [
        { icon: <EmailIcon fontSize="small" />, text: 'contact@psdahsalumni.com' },
        { icon: <PhoneIcon fontSize="small" />, text: '+1 (555) 123-4567' },
        { icon: <LocationIcon fontSize="small" />, text: '123 Alumni Street, City' },
    ];

    return (
        <Box
            component="footer"
            sx={{
                bgcolor: 'primary.main',
                color: 'white',
                pt: { xs: 4, sm: 6 },
                pb: 3,
                mt: 'auto',
                width: '100%',
            }}
        >
            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                <Grid container spacing={{ xs: 3, sm: 4 }}>
                    {/* About Section */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontWeight: 700, mb: 2 }}
                        >
                            PSDAHS Alumni
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                            Connecting generations of graduates, fostering lifelong relationships, and supporting our alma mater's legacy.
                        </Typography>
                        {isGuest && (
                            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="small"
                                    component={RouterLink}
                                    to="/register"
                                    fullWidth
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                    }}
                                >
                                    Join Community
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    component={RouterLink}
                                    to="/login"
                                    fullWidth
                                    sx={{
                                        textTransform: 'none',
                                        color: 'white',
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                    }}
                                >
                                    Sign In
                                </Button>
                            </Box>
                        )}
                    </Grid>

                    {/* Quick Links */}
                    <Grid item xs={6} sm={6} md={2}>
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}
                        >
                            Quick Links
                        </Typography>
                        <Box component="nav">
                            {footerLinks.quickLinks.map((link) => (
                                <Link
                                    key={link.text}
                                    component={RouterLink}
                                    to={link.path}
                                    sx={{
                                        display: 'block',
                                        color: 'white',
                                        textDecoration: 'none',
                                        mb: 1,
                                        opacity: 0.9,
                                        fontSize: '0.875rem',
                                        '&:hover': {
                                            opacity: 1,
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    {link.text}
                                </Link>
                            ))}
                        </Box>
                    </Grid>

                    {/* Community Links */}
                    <Grid item xs={6} sm={6} md={2}>
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}
                        >
                            Community
                        </Typography>
                        <Box component="nav">
                            {footerLinks.community.map((link) => (
                                <Link
                                    key={link.text}
                                    component={RouterLink}
                                    to={link.path}
                                    sx={{
                                        display: 'block',
                                        color: 'white',
                                        textDecoration: 'none',
                                        mb: 1,
                                        opacity: 0.9,
                                        fontSize: '0.875rem',
                                        '&:hover': {
                                            opacity: 1,
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    {link.text}
                                </Link>
                            ))}
                        </Box>
                    </Grid>

                    {/* Support Links */}
                    <Grid item xs={6} sm={6} md={2}>
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}
                        >
                            Support
                        </Typography>
                        <Box component="nav">
                            {footerLinks.support.map((link) => (
                                <Link
                                    key={link.text}
                                    component={RouterLink}
                                    to={link.path}
                                    sx={{
                                        display: 'block',
                                        color: 'white',
                                        textDecoration: 'none',
                                        mb: 1,
                                        opacity: 0.9,
                                        fontSize: '0.875rem',
                                        '&:hover': {
                                            opacity: 1,
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    {link.text}
                                </Link>
                            ))}
                        </Box>
                    </Grid>

                    {/* Contact Info */}
                    <Grid item xs={6} sm={6} md={3}>
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}
                        >
                            Contact Us
                        </Typography>
                        <Box>
                            {contactInfo.map((item, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        mb: 1.5,
                                        opacity: 0.9,
                                    }}
                                >
                                    <Box sx={{ mr: 1, mt: 0.3 }}>{item.icon}</Box>
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                        {item.text}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        {/* Social Links */}
                        <Box sx={{ mt: 2 }}>
                            <Typography
                                variant="subtitle2"
                                gutterBottom
                                sx={{ fontWeight: 600, mb: 1 }}
                            >
                                Follow Us
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {socialLinks.map((social) => (
                                    <IconButton
                                        key={social.label}
                                        component="a"
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        size="small"
                                        sx={{
                                            color: 'white',
                                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            },
                                        }}
                                        aria-label={social.label}
                                    >
                                        {social.icon}
                                    </IconButton>
                                ))}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

                {/* Bottom Bar */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            opacity: 0.8,
                            fontSize: '0.813rem',
                            textAlign: { xs: 'center', sm: 'left' },
                        }}
                    >
                        © {new Date().getFullYear()} PSDAHS Alumni Association. All rights reserved.
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{ opacity: 0.8, fontSize: '0.813rem' }}
                        >
                            Built with
                        </Typography>
                        <FavoriteIcon sx={{ fontSize: '1rem', color: '#ff4081' }} />
                        <Typography
                            variant="body2"
                            sx={{ opacity: 0.8, fontSize: '0.813rem' }}
                        >
                            by
                        </Typography>
                        <Link
                            href="https://burgess-glay.github.io/BurgTech/"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                color: 'white',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '0.813rem',
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            BurgTech
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
