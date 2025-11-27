import React from 'react';
import { Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const labelMap = {
  '': 'Home',
  about: 'About Us',
  history: 'History',
  contact: 'Contact',
  community: 'Community',
  gallery: 'Gallery',
  register: 'Register',
  donate: 'Donate',
  alumni: 'Alumni Directory',
  classes: 'Classes',
  'give-back': 'Give Back',
  network: 'Connect With Alumni',
  events: 'Events',
};

const BreadcrumbsNav = ({ extra = [] }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  const items = pathnames.map((segment, index) => {
    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
    const isLast = index === pathnames.length - 1 && extra.length === 0;
    const label = labelMap[segment] || segment;
    return isLast ? (
      <Typography key={to} color="text.primary">
        {label}
      </Typography>
    ) : (
      <MuiLink key={to} component={RouterLink} to={to} underline="hover" color="inherit">
        {label}
      </MuiLink>
    );
  });

  const base = location.pathname === '/' ? [
    <Typography key="home" color="text.primary">Home</Typography>,
  ] : [
    <MuiLink key="home" component={RouterLink} to="/" underline="hover" color="inherit">Home</MuiLink>,
    ...items,
  ];

  const trail = extra.length > 0 ? [
    ...base,
    ...extra.map((e, idx) => (
      idx === extra.length - 1 ? (
        <Typography key={e.label} color="text.primary">{e.label}</Typography>
      ) : (
        <MuiLink key={e.label} component={RouterLink} to={e.to} underline="hover" color="inherit">
          {e.label}
        </MuiLink>
      )
    )),
  ] : base;

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      {trail}
    </Breadcrumbs>
  );
};

export default BreadcrumbsNav;
