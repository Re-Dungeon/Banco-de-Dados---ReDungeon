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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { getOrigens, removeOrigem, getUniversos } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { RARIDADES, TIPOS_ORIGEM } from 'common/constants/constants';
import { CAMPOS_POR_TIPO } from './utils';
import { OrigemCard } from './styles';

const parseTags = tags =>
  (tags || '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

const Origens = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const [origens, setOrigens] = useState([]);
  const [universos, setUniversos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroRaridade, setFiltroRaridade] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [origemVisualizando, setOrigemVisualizando] = useState(null);

  useEffect(() => {
    Promise.all([getOrigens(), getUniversos()])
      .then(([origensData, universosData]) => {
        setOrigens(origensData);
        setUniversos(universosData);
      })
      .finally(() => setLoading(false));
  }, []);

  const origensFiltradas = useMemo(() => {
    return origens.filter(origem => {
      const matchNome =
        !filtroNome ||
        origem.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchTipo = !filtroTipo || origem.tipo === filtroTipo;
      const matchRaridade =
        !filtroRaridade || origem.raridade === filtroRaridade;
      const matchUniverso =
        !filtroUniverso || origem.universo === filtroUniverso;
      return matchNome && matchTipo && matchRaridade && matchUniverso;
    });
  }, [origens, filtroNome, filtroTipo, filtroRaridade, filtroUniverso]);

  const handleRemove = async id => {
    await removeOrigem(id);
    setOrigens(prev => prev.filter(o => o.id !== id));
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      color: 'var(--text-primary)',
      '& fieldset': { borderColor: 'var(--border-primary)' },
      '&:hover fieldset': { borderColor: 'var(--border-hover)' },
      '&.Mui-focused fieldset': { borderColor: 'var(--color-accent)' },
    },
    '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-accent)' },
  };

  const selectSx = {
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
  };

  const menuPropsSx = {
    PaperProps: {
      sx: { background: 'var(--bg-card)', color: 'var(--text-primary)' },
    },
  };

  const labelSx = {
    color: 'var(--text-secondary)',
    '&.Mui-focused': { color: 'var(--color-accent)' },
  };

  return (
    <Box className="page-container" id="redungeon-origens" data-page="origens">
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
            Origens
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as origens, regiões e cenários da campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_ORIGEM)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Origem
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
              gridTemplateColumns: {
                xs: '1fr',
                sm: '2fr 1fr 1fr',
                md: '2fr 1fr 1fr 1fr',
              },
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
              sx={inputSx}
            />
            <FormControl size="small">
              <InputLabel sx={labelSx}>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
                sx={selectSx}
                MenuProps={menuPropsSx}
              >
                <MenuItem value="">Todos</MenuItem>
                {TIPOS_ORIGEM.map(t => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel sx={labelSx}>Raridade</InputLabel>
              <Select
                label="Raridade"
                value={filtroRaridade}
                onChange={e => setFiltroRaridade(e.target.value)}
                sx={selectSx}
                MenuProps={menuPropsSx}
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
              <InputLabel sx={labelSx}>Universo</InputLabel>
              <Select
                label="Universo"
                value={filtroUniverso}
                onChange={e => setFiltroUniverso(e.target.value)}
                sx={selectSx}
                MenuProps={menuPropsSx}
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

          {origensFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                🗺️
              </Typography>
              <Typography variant="body1">Nenhuma origem encontrada</Typography>
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
              {origensFiltradas.map(origem => (
                <OrigemCard key={origem.id} elevation={0}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 0.5,
                      mb: 1,
                    }}
                  >
                    <Tooltip title="Visualizar detalhes">
                      <IconButton
                        size="small"
                        onClick={() => setOrigemVisualizando(origem)}
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': { color: 'var(--color-accent)' },
                        }}
                        aria-label={`Visualizar origem ${origem.nome}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canWrite(origem.universo) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(ROUTE_PATHS.NOVA_ORIGEM, {
                              state: { origem },
                            })
                          }
                          sx={{
                            color: 'var(--color-accent)',
                            '&:hover': {
                              color: 'var(--color-accent)',
                              opacity: 0.8,
                            },
                          }}
                          aria-label={`Editar origem ${origem.nome}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(origem.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': { color: '#ef4444' },
                          }}
                          aria-label={`Remover origem ${origem.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {origem.linkImagem && (
                    <Box
                      component="img"
                      src={origem.linkImagem}
                      alt={origem.nome}
                      sx={{
                        width: '100%',
                        height: 160,
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
                    {origem.nome}
                  </Typography>

                  {(origem.tipo || origem.raridade) && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {[origem.tipo, origem.raridade]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  )}

                  {parseTags(origem.tags).length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        mb: 1,
                      }}
                    >
                      {parseTags(origem.tags).map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-primary)',
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  {origem.descricao && (
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
                      {origem.descricao}
                    </Typography>
                  )}
                </OrigemCard>
              ))}
            </Box>
          )}
        </>
      )}

      {/* Dialog de detalhes */}
      <Dialog
        open={Boolean(origemVisualizando)}
        onClose={() => setOrigemVisualizando(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{ color: 'var(--text-primary)', fontWeight: 700, pb: 1 }}
        >
          {origemVisualizando?.nome}
          {(origemVisualizando?.tipo || origemVisualizando?.raridade) && (
            <Typography
              variant="caption"
              sx={{
                color: 'var(--color-accent)',
                display: 'block',
                fontWeight: 600,
              }}
            >
              {[origemVisualizando.tipo, origemVisualizando.raridade]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: 'var(--border-primary)' }}>
          {origemVisualizando?.linkImagem && (
            <Box
              component="img"
              src={origemVisualizando.linkImagem}
              alt={origemVisualizando.nome}
              sx={{
                width: '100%',
                maxHeight: 220,
                borderRadius: 2,
                objectFit: 'cover',
                border: '1px solid var(--border-primary)',
                mb: 2,
              }}
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}

          {parseTags(origemVisualizando?.tags).length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
              {parseTags(origemVisualizando.tags).map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-primary)',
                  }}
                />
              ))}
            </Box>
          )}

          {origemVisualizando?.descricao && (
            <>
              <Typography
                variant="caption"
                sx={{
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  display: 'block',
                  mb: 0.5,
                }}
              >
                Descrição
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--text-secondary)', mb: 2 }}
              >
                {origemVisualizando.descricao}
              </Typography>
            </>
          )}

          {(CAMPOS_POR_TIPO[origemVisualizando?.tipo] || []).filter(
            f => origemVisualizando[f.key],
          ).length > 0 && (
            <>
              <Divider sx={{ borderColor: 'var(--border-primary)', mb: 1.5 }} />
              {(CAMPOS_POR_TIPO[origemVisualizando?.tipo] || [])
                .filter(f => origemVisualizando[f.key])
                .map(f => (
                  <Box key={f.key} sx={{ mb: 1.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        display: 'block',
                        mb: 0.25,
                      }}
                    >
                      {f.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--text-secondary)' }}
                    >
                      {origemVisualizando[f.key]}
                    </Typography>
                  </Box>
                ))}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setOrigemVisualizando(null)}
            sx={{ color: 'var(--text-muted)' }}
          >
            Fechar
          </Button>
          {canWrite(origemVisualizando?.universo) && (
            <Button
              variant="contained"
              onClick={() => {
                navigate(ROUTE_PATHS.NOVA_ORIGEM, {
                  state: { origem: origemVisualizando },
                });
                setOrigemVisualizando(null);
              }}
              sx={{
                background: 'var(--color-primary)',
                '&:hover': { background: '#5a2090' },
              }}
            >
              Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Origens;
