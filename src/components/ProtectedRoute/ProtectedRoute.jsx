import React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useAuth } from 'context/AuthContext';

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          height: '100%',
        }}
      >
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          height: '100%',
          gap: 2,
          color: 'var(--text-muted)',
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '3rem', lineHeight: 1 }}>
          🔐
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}
        >
          Acesso Restrito
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'var(--text-muted)',
            textAlign: 'center',
            maxWidth: 280,
          }}
        >
          Faça login clicando no botão de usuário na barra lateral para acessar
          o conteúdo.
        </Typography>
      </Box>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
