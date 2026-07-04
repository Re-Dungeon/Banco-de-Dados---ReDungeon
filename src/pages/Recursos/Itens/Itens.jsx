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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { getItens, removeIten, getUniversos } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { RARIDADES } from 'common/constants/constants';
import { TIPOS_ITEM } from './utils';
import { ItemCard } from './styles';

const Itens = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const [itens, setItens] = useState([]);
  const [universos, setUniversos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroQualidade, setFiltroQualidade] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [itemVisualizando, setItemVisualizando] = useState(null);

  useEffect(() => {
    Promise.all([getItens(), getUniversos()])
      .then(([itensData, universosData]) => {
        setItens(itensData);
        setUniversos(universosData);
      })
      .finally(() => setLoading(false));
  }, []);

  const itensFiltrados = useMemo(() => {
    return itens.filter(item => {
      const matchNome =
        !filtroNome ||
        item.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchQualidade =
        !filtroQualidade || item.qualidade === filtroQualidade;
      const matchTipo = !filtroTipo || item.tipo === filtroTipo;
      const matchUniverso = !filtroUniverso || item.universo === filtroUniverso;
      return matchNome && matchQualidade && matchTipo && matchUniverso;
    });
  }, [itens, filtroNome, filtroQualidade, filtroTipo, filtroUniverso]);

  const handleRemove = async id => {
    await removeIten(id);
    setItens(prev => prev.filter(i => i.id !== id));
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

  const inputLabelSx = {
    color: 'var(--text-secondary)',
    '&.Mui-focused': { color: 'var(--color-accent)' },
  };

  return (
    <Box className="page-container" id="redungeon-itens" data-page="itens">
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
            Itens
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie os itens disponíveis na campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVO_ITEM)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Novo Item
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
              gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr 1fr' },
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
              <InputLabel sx={inputLabelSx}>Qualidade</InputLabel>
              <Select
                label="Qualidade"
                value={filtroQualidade}
                onChange={e => setFiltroQualidade(e.target.value)}
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
              <InputLabel sx={inputLabelSx}>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
                sx={selectSx}
                MenuProps={menuPropsSx}
              >
                <MenuItem value="">Todos</MenuItem>
                {TIPOS_ITEM.map(t => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel sx={inputLabelSx}>Universo</InputLabel>
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

          {itensFiltrados.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                ⚔️
              </Typography>
              <Typography variant="body1">Nenhum item encontrado</Typography>
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
              {itensFiltrados.map(item => (
                <ItemCard key={item.id} elevation={0}>
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
                        onClick={() => setItemVisualizando(item)}
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': { color: 'var(--color-accent)' },
                        }}
                        aria-label={`Visualizar item ${item.nome}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canWrite(item.universo) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(ROUTE_PATHS.NOVO_ITEM, {
                              state: { item },
                            })
                          }
                          sx={{
                            color: 'var(--color-accent)',
                            '&:hover': {
                              color: 'var(--color-accent)',
                              opacity: 0.8,
                            },
                          }}
                          aria-label={`Editar item ${item.nome}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(item.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': { color: '#ef4444' },
                          }}
                          aria-label={`Remover item ${item.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {item.linkImagem && (
                    <Box
                      component="img"
                      src={item.linkImagem}
                      alt={item.nome}
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
                    {item.nome}
                  </Typography>
                  {(item.qualidade || item.tipo) && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      {[
                        universos.find(u => u.id === item.universo)?.Nome,
                        item.tipo,
                        item.qualidade,
                      ]
                        .filter(Boolean)
                        .join(' — ')}
                    </Typography>
                  )}
                  {(item.nivelAtual !== '' || item.nivelMaximo !== '') && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-muted)',
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      Nível{' '}
                      {[item.nivelAtual, item.nivelMaximo]
                        .filter(v => v !== '' && v !== null && v !== undefined)
                        .join(' / ')}
                    </Typography>
                  )}
                  {item.descricao && (
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
                      {item.descricao}
                    </Typography>
                  )}
                </ItemCard>
              ))}
            </Box>
          )}
        </>
      )}

      {/* Dialog de detalhes */}
      <Dialog
        open={Boolean(itemVisualizando)}
        onClose={() => setItemVisualizando(null)}
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
          {itemVisualizando?.nome}
          {(itemVisualizando?.qualidade || itemVisualizando?.tipo) && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'var(--color-accent)',
                fontWeight: 600,
                mt: 0.5,
              }}
            >
              {[
                universos.find(u => u.id === itemVisualizando?.universo)?.Nome,
                itemVisualizando?.tipo,
                itemVisualizando?.qualidade,
              ]
                .filter(Boolean)
                .join(' — ')}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'var(--border-primary)' }}>
          {itemVisualizando?.linkImagem && (
            <Box
              component="img"
              src={itemVisualizando.linkImagem}
              alt={itemVisualizando.nome}
              sx={{
                width: '100%',
                height: 200,
                borderRadius: 2,
                objectFit: 'cover',
                display: 'block',
                border: '1px solid var(--border-primary)',
                mb: 2,
              }}
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}

          {/* Atributos */}
          {[
            { label: 'Nível Atual', value: itemVisualizando?.nivelAtual },
            { label: 'Nível Máximo', value: itemVisualizando?.nivelMaximo },
            { label: 'Dados', value: itemVisualizando?.dados },
            { label: 'Extra', value: itemVisualizando?.extra },
          ].some(
            f => f.value !== '' && f.value !== null && f.value !== undefined,
          ) && (
            <>
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'var(--color-accent)',
                  fontWeight: 700,
                  mb: 1,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontSize: '0.72rem',
                }}
              >
                Atributos
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: 1,
                  mb: 2,
                }}
              >
                {[
                  { label: 'Nível Atual', value: itemVisualizando?.nivelAtual },
                  {
                    label: 'Nível Máximo',
                    value: itemVisualizando?.nivelMaximo,
                  },
                  { label: 'Dados', value: itemVisualizando?.dados },
                  { label: 'Extra', value: itemVisualizando?.extra },
                ]
                  .filter(
                    f =>
                      f.value !== '' &&
                      f.value !== null &&
                      f.value !== undefined,
                  )
                  .map(f => (
                    <Box
                      key={f.label}
                      sx={{
                        background: 'var(--bg-secondary)',
                        borderRadius: 1,
                        p: 1,
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--text-muted)', display: 'block' }}
                      >
                        {f.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                      >
                        {f.value}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </>
          )}

          {itemVisualizando?.descricao && (
            <>
              <Divider sx={{ borderColor: 'var(--border-primary)', mb: 1.5 }} />
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'var(--color-accent)',
                  fontWeight: 700,
                  mb: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontSize: '0.72rem',
                }}
              >
                Descrição
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--text-secondary)', mb: 2 }}
              >
                {itemVisualizando.descricao}
              </Typography>
            </>
          )}

          {itemVisualizando?.habilidadesEspeciais?.length > 0 && (
            <>
              <Divider sx={{ borderColor: 'var(--border-primary)', mb: 1.5 }} />
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'var(--color-accent)',
                  fontWeight: 700,
                  mb: 1,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontSize: '0.72rem',
                }}
              >
                Habilidades Especiais
              </Typography>
              {itemVisualizando.habilidadesEspeciais.map((hab, i) => (
                <Box
                  key={i}
                  sx={{
                    mb: 1,
                    p: 1.5,
                    background: 'var(--bg-secondary)',
                    borderRadius: 1,
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    {hab.nome}
                  </Typography>
                  {hab.descricao && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'var(--text-secondary)', display: 'block' }}
                    >
                      {hab.descricao}
                    </Typography>
                  )}
                </Box>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setItemVisualizando(null)}
            sx={{
              color: 'var(--text-secondary)',
              '&:hover': { color: 'var(--text-primary)' },
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Itens;
