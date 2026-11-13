import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import { APP_VERSION, INFO_ITEMS } from './constants';

const Sobre = () => {
  return (
    <Box className="page-container" id="redungeon-sobre" data-page="sobre">
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}
        >
          Sobre
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          Re:Dungeon — Banco de dados de campanha para RPG de mesa
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          maxWidth: 480,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h3">🎲</Typography>
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: 'var(--text-primary)',
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              Re:Dungeon
            </Typography>
            <Chip
              label={`V${APP_VERSION}`}
              color="primary"
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{ color: 'var(--text-secondary)', mb: 2 }}
        >
          Sistema para organizar Raças, Classes, Itens, Materiais, Regras,
          Artes, Origens, Receitas, Condições, Veias Astrais, CardFlux e
          demais recursos da sua campanha em um único painel.
        </Typography>

        <Divider sx={{ mb: 2, borderColor: 'var(--border-primary)' }} />

        {INFO_ITEMS.map(item => (
          <Box
            key={item.label}
            sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
          >
            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
              {item.label}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'var(--text-primary)', fontWeight: 500 }}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
};

export default Sobre;
