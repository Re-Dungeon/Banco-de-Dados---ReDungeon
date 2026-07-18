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
import { getArtes, removeArte, getUniversos } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { TIPOS_ARTE, CLASSIFICACOES_ARTE } from 'common/constants/constants';
import { ArteCard } from './styles';

const META_FIELDS = [
  { key: 'recarga', label: 'Recarga' },
  { key: 'acao', label: 'Ação' },
  { key: 'duracao', label: 'Duração' },
  { key: 'alcance', label: 'Alcance' },
  { key: 'alvos', label: 'Alvos' },
  { key: 'custo', label: 'Custo' },
  { key: 'dados', label: 'Dados' },
  { key: 'circuloMagico', label: 'Círculo Mágico' },
];

const Artes = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const [artes, setArtes] = useState([]);
  const [universos, setUniversos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroClassificacao, setFiltroClassificacao] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [arteVisualizando, setArteVisualizando] = useState(null);

  useEffect(() => {
    Promise.all([getArtes(), getUniversos()])
      .then(([artesData, universosData]) => {
        setArtes(artesData);
        setUniversos(universosData);
      })
      .finally(() => setLoading(false));
  }, []);

  const artesFiltradas = useMemo(() => {
    return artes.filter(arte => {
      const matchNome =
        !filtroNome ||
        arte.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchTipo = !filtroTipo || arte.tipo === filtroTipo;
      const matchClassificacao =
        !filtroClassificacao || arte.classificacao === filtroClassificacao;
      const matchUniverso = !filtroUniverso || arte.universo === filtroUniverso;
      return matchNome && matchTipo && matchClassificacao && matchUniverso;
    });
  }, [artes, filtroNome, filtroTipo, filtroClassificacao, filtroUniverso]);

  const handleRemove = async id => {
    await removeArte(id);
    setArtes(prev => prev.filter(a => a.id !== id));
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
    <Box className="page-container" id="redungeon-artes" data-page="artes">
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
            Artes
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as artes marciais e habilidades especiais da campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_ARTE)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Arte
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
                {TIPOS_ARTE.map(t => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel sx={labelSx}>Classificação</InputLabel>
              <Select
                label="Classificação"
                value={filtroClassificacao}
                onChange={e => setFiltroClassificacao(e.target.value)}
                sx={selectSx}
                MenuProps={menuPropsSx}
              >
                <MenuItem value="">Todas</MenuItem>
                {CLASSIFICACOES_ARTE.map(c => (
                  <MenuItem key={c} value={c}>
                    {c}
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

          {artesFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                🥋
              </Typography>
              <Typography variant="body1">Nenhuma arte encontrada</Typography>
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
              {artesFiltradas.map(arte => (
                <ArteCard key={arte.id} elevation={0}>
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
                        onClick={() => setArteVisualizando(arte)}
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': { color: 'var(--color-accent)' },
                        }}
                        aria-label={`Visualizar arte ${arte.nome}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canWrite(arte.universo) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(ROUTE_PATHS.NOVA_ARTE, {
                              state: { arte },
                            })
                          }
                          sx={{
                            color: 'var(--color-accent)',
                            '&:hover': {
                              color: 'var(--color-accent)',
                              opacity: 0.8,
                            },
                          }}
                          aria-label={`Editar arte ${arte.nome}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(arte.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': { color: '#ef4444' },
                          }}
                          aria-label={`Remover arte ${arte.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {arte.linkImagem && (
                    <Box
                      component="img"
                      src={arte.linkImagem}
                      alt={arte.nome}
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
                    {arte.nome}
                  </Typography>

                  {(arte.tipo || arte.classificacao) && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {[arte.tipo, arte.classificacao]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  )}

                  {META_FIELDS.filter(f => arte[f.key]).length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.75,
                        mb: 1,
                      }}
                    >
                      {META_FIELDS.filter(f => arte[f.key]).map(f => (
                        <Box
                          key={f.key}
                          sx={{
                            background: 'var(--bg-secondary)',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'var(--text-muted)',
                              display: 'block',
                              fontSize: '0.65rem',
                            }}
                          >
                            {f.label}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'var(--text-primary)',
                              fontWeight: 600,
                            }}
                          >
                            {arte[f.key]}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {arte.descricao && (
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
                      {arte.descricao}
                    </Typography>
                  )}

                  {arte.condicoesAplicadas?.length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        mt: 1,
                      }}
                    >
                      {arte.condicoesAplicadas.map(c => (
                        <Chip
                          key={c.id}
                          label={c.nome}
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
                </ArteCard>
              ))}
            </Box>
          )}
        </>
      )}

      {/* Dialog de detalhes */}
      <Dialog
        open={Boolean(arteVisualizando)}
        onClose={() => setArteVisualizando(null)}
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
          {arteVisualizando?.nome}
          {(arteVisualizando?.tipo || arteVisualizando?.classificacao) && (
            <Typography
              variant="caption"
              sx={{
                color: 'var(--color-accent)',
                display: 'block',
                fontWeight: 600,
              }}
            >
              {[arteVisualizando.tipo, arteVisualizando.classificacao]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: 'var(--border-primary)' }}>
          {arteVisualizando?.linkImagem && (
            <Box
              component="img"
              src={arteVisualizando.linkImagem}
              alt={arteVisualizando.nome}
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

          {META_FIELDS.filter(f => arteVisualizando?.[f.key]).length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
              {META_FIELDS.filter(f => arteVisualizando?.[f.key]).map(f => (
                <Box
                  key={f.key}
                  sx={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'var(--text-muted)',
                      display: 'block',
                      fontSize: '0.65rem',
                    }}
                  >
                    {f.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                  >
                    {arteVisualizando[f.key]}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {arteVisualizando?.descricao && (
            <>
              <Divider sx={{ borderColor: 'var(--border-primary)', mb: 1.5 }} />
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
                {arteVisualizando.descricao}
              </Typography>
            </>
          )}

          {arteVisualizando?.cantico && (
            <>
              <Divider sx={{ borderColor: 'var(--border-primary)', mb: 1.5 }} />
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
                Cântico
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'var(--text-secondary)',
                  mb: 2,
                  fontStyle: 'italic',
                }}
              >
                {arteVisualizando.cantico}
              </Typography>
            </>
          )}

          {arteVisualizando?.condicoesAplicadas?.length > 0 && (
            <>
              <Divider sx={{ borderColor: 'var(--border-primary)', mb: 1.5 }} />
              <Typography
                variant="caption"
                sx={{
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  display: 'block',
                  mb: 0.75,
                }}
              >
                Condições Aplicadas
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {arteVisualizando.condicoesAplicadas.map(c => (
                  <Chip
                    key={c.id}
                    label={c.nome}
                    size="small"
                    sx={{
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-primary)',
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setArteVisualizando(null)}
            sx={{ color: 'var(--text-muted)' }}
          >
            Fechar
          </Button>
          {canWrite(arteVisualizando?.universo) && (
            <Button
              variant="contained"
              onClick={() => {
                navigate(ROUTE_PATHS.NOVA_ARTE, {
                  state: { arte: arteVisualizando },
                });
                setArteVisualizando(null);
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

export default Artes;
