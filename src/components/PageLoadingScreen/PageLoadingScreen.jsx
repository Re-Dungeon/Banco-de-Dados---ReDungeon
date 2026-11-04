import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';

const PAGE_LOADING_GIF = 'https://i.imgur.com/fBSP9Dd.gif';

const PageLoadingScreen = ({ visible = true }) => (
  <Box
    role="status"
    aria-live="polite"
    aria-busy={visible}
    sx={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background:
        'radial-gradient(circle at center, rgba(13, 17, 31, 0.96) 0%, rgba(5, 8, 16, 0.99) 62%, rgba(2, 4, 8, 1) 100%)',
      opacity: visible ? 1 : 0,
      visibility: visible ? 'visible' : 'hidden',
      pointerEvents: visible ? 'auto' : 'none',
      transition: 'opacity 300ms ease, visibility 300ms ease',
      zIndex: 1400,
      px: 3,
      overflow: 'hidden',
      '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    }}
  >
    <Box
      component="img"
      src={PAGE_LOADING_GIF}
      alt="Carregando aplicação"
      sx={{
        width: { xs: '72vw', sm: '44vw', md: 220 },
        maxWidth: 220,
        height: 'auto',
        display: 'block',
        objectFit: 'contain',
        borderRadius: 2,
        userSelect: 'none',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 18px 42px rgba(111, 45, 168, 0.32))',
      }}
    />
  </Box>
);

PageLoadingScreen.propTypes = {
  visible: PropTypes.bool,
};

export default PageLoadingScreen;
