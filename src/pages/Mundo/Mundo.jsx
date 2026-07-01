import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Mundo = () => {
  return (
    <Box className="page-container" id="redungeon-mundo" data-page="mundo">
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}
        >
          Mundo
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          Crie e configure seus mundos de fantasia.
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}>
        <Typography variant="h2" sx={{ mb: 1 }}>
          🌍
        </Typography>
        <Typography variant="body1">Nenhum mundo criado</Typography>
      </Box>
    </Box>
  );
};

export default Mundo;
