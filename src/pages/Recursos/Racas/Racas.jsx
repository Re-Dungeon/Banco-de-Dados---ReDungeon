import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { getRacas, removeRaca } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { RacaCard } from './styles';

const Racas = () => {
  const navigate = useNavigate();
  const [racas, setRacas] = useState(() => getRacas());

  const handleRemove = id => {
    removeRaca(id);
    setRacas(prev => prev.filter(r => r.id !== id));
  };

  return (
    <Box className="page-container" id="redungeon-racas" data-page="racas">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}
          >
            Raças
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as raças disponíveis na campanha.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate(ROUTE_PATHS.NOVA_RACA)}
          sx={{
            background: 'var(--color-primary)',
            '&:hover': { background: '#5a2090' },
          }}
        >
          + Nova Raça
        </Button>
      </Box>

      {racas.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}>
          <Typography variant="h2" sx={{ mb: 1 }}>
            🧝‍♂️
          </Typography>
          <Typography variant="body1">Nenhuma raça cadastrada</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fill, minmax(320px, 1fr))',
              md: 'repeat(auto-fill, minmax(360px, 1fr))',
            },
            gap: 2,
          }}
        >
          {racas.map(raca => (
            <RacaCard key={raca.id} elevation={0}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    minWidth: 0,
                  }}
                >
                  {raca.linkImagem && (
                    <Box
                      component="img"
                      src={raca.linkImagem}
                      alt={raca.nome}
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: 2,
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid var(--border-primary)',
                      }}
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        lineHeight: 1.2,
                      }}
                    >
                      {raca.nome}
                    </Typography>
                    {raca.raridade && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--color-accent)', fontWeight: 600 }}
                      >
                        {raca.raridade}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleRemove(raca.id)}
                  sx={{
                    color: '#ef4444',
                    flexShrink: 0,
                    '&:hover': { color: '#ef4444' },
                  }}
                  aria-label={`Remover raça ${raca.nome}`}
                >
                  Apagar
                </IconButton>
              </Box>
              {raca.descricao && (
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--text-secondary)', mt: 1.5 }}
                >
                  {raca.descricao}
                </Typography>
              )}
            </RacaCard>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Racas;
