import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Macros = () => {
  return (
    <Box className="page-container" id="redungeon-macros" data-page="macros">
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}
        >
          Macros
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          Configure atalhos e macros personalizadas.
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}>
        <Typography variant="h2" sx={{ mb: 1 }}>
          ⚙️
        </Typography>
        <Typography variant="body1">Nenhuma macro criada</Typography>
      </Box>
    </Box>
  );
};

export default Macros;
