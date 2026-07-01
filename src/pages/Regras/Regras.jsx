import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Regras = () => {
  return (
    <Box className="page-container" id="redungeon-regras" data-page="regras">
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}
        >
          Regras
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          Consulte e customize as regras do seu jogo.
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}>
        <Typography variant="h2" sx={{ mb: 1 }}>
          📋
        </Typography>
        <Typography variant="body1">Nenhuma regra definida</Typography>
      </Box>
    </Box>
  );
};

export default Regras;
