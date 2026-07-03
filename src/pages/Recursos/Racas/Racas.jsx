import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { getRacas, removeRaca, getUniversos } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { RARIDADES } from 'common/constants/constants';
import { RacaCard } from './styles';

const Racas = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const [racas, setRacas] = useState([]);
  const [universos, setUniversos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroRaridade, setFiltroRaridade] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');

  useEffect(() => {
    Promise.all([getRacas(), getUniversos()])
      .then(([racasData, universosData]) => {
        setRacas(racasData);
        setUniversos(universosData);
      })
      .finally(() => setLoading(false));
  }, []);

  const racasFiltradas = useMemo(() => {
    return racas.filter(raca => {
      const matchNome =
        !filtroNome ||
        raca.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchRaridade = !filtroRaridade || raca.raridade === filtroRaridade;
      const matchUniverso = !filtroUniverso || raca.universo === filtroUniverso;
      return matchNome && matchRaridade && matchUniverso;
    });
  }, [racas, filtroNome, filtroRaridade, filtroUniverso]);

  const handleRemove = async id => {
    await removeRaca(id);
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
        {canCreate() && (
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
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: 'var(--color-accent)' }} />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' },
              gap: 2,
              mb: 3,
            }}
          >
            <TextField
              label="Buscar por nome"
              size="small"
              value={filtroNome}
              onChange={e => setFiltroNome(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'var(--text-primary)',
                  '& fieldset': { borderColor: 'var(--border-primary)' },
                  '&:hover fieldset': { borderColor: 'var(--border-hover)' },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--color-accent)',
                  },
                },
                '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'var(--color-accent)',
                },
              }}
            />
            <FormControl size="small">
              <InputLabel
                sx={{
                  color: 'var(--text-secondary)',
                  '&.Mui-focused': { color: 'var(--color-accent)' },
                }}
              >
                Raridade
              </InputLabel>
              <Select
                label="Raridade"
                value={filtroRaridade}
                onChange={e => setFiltroRaridade(e.target.value)}
                sx={{
                  color: 'var(--text-primary)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--border-primary)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--border-hover)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--color-accent)',
                  },
                  '& .MuiSvgIcon-root': { color: 'var(--text-secondary)' },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                    },
                  },
                }}
              >
                <MenuItem value="">Todas</MenuItem>
                {RARIDADES.map(r => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel
                sx={{
                  color: 'var(--text-secondary)',
                  '&.Mui-focused': { color: 'var(--color-accent)' },
                }}
              >
                Universo
              </InputLabel>
              <Select
                label="Universo"
                value={filtroUniverso}
                onChange={e => setFiltroUniverso(e.target.value)}
                sx={{
                  color: 'var(--text-primary)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--border-primary)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--border-hover)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--color-accent)',
                  },
                  '& .MuiSvgIcon-root': { color: 'var(--text-secondary)' },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                    },
                  },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {universos.map(u => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.Nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {racasFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                🧝‍♂️
              </Typography>
              <Typography variant="body1">Nenhuma raça encontrada</Typography>
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
              {racasFiltradas.map(raca => (
                <RacaCard key={raca.id} elevation={0}>
                  {canWrite(raca.universo) && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 0.5,
                        mb: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(ROUTE_PATHS.NOVA_RACA, { state: { raca } })
                        }
                        sx={{
                          color: 'var(--color-accent)',
                          '&:hover': {
                            color: 'var(--color-accent)',
                            opacity: 0.8,
                          },
                        }}
                        aria-label={`Editar raça ${raca.nome}`}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleRemove(raca.id)}
                        sx={{
                          color: '#ef4444',
                          '&:hover': { color: '#ef4444' },
                        }}
                        aria-label={`Remover raça ${raca.nome}`}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                  {raca.linkImagem && (
                    <Box
                      component="img"
                      src={raca.linkImagem}
                      alt={raca.nome}
                      sx={{
                        width: '100%',
                        height: 180,
                        borderRadius: 2,
                        objectFit: 'cover',
                        display: 'block',
                        border: '1px solid var(--border-primary)',
                        mb: 1.5,
                      }}
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
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
                      sx={{
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {raca.raridade}
                    </Typography>
                  )}
                  {raca.descricao && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'var(--text-secondary)',
                        mt: 0.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {raca.descricao}
                    </Typography>
                  )}
                </RacaCard>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Racas;
