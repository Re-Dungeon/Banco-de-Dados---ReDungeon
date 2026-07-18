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
import { getReceitas, removeReceita, getUniversos } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { RARIDADES, CATEGORIAS_RECEITA } from 'common/constants/constants';
import { ReceitaCard } from './styles';

const Receitas = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const [receitas, setReceitas] = useState([]);
  const [universos, setUniversos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroRaridade, setFiltroRaridade] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [receitaVisualizando, setReceitaVisualizando] = useState(null);

  useEffect(() => {
    Promise.all([getReceitas(), getUniversos()])
      .then(([receitasData, universosData]) => {
        setReceitas(receitasData);
        setUniversos(universosData);
      })
      .finally(() => setLoading(false));
  }, []);

  const receitasFiltradas = useMemo(() => {
    return receitas.filter(receita => {
      const matchNome =
        !filtroNome ||
        receita.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchRaridade =
        !filtroRaridade || receita.raridade === filtroRaridade;
      const matchCategoria =
        !filtroCategoria || receita.categoria === filtroCategoria;
      const matchUniverso =
        !filtroUniverso || receita.universo === filtroUniverso;
      return matchNome && matchRaridade && matchCategoria && matchUniverso;
    });
  }, [receitas, filtroNome, filtroRaridade, filtroCategoria, filtroUniverso]);

  const handleRemove = async id => {
    await removeReceita(id);
    setReceitas(prev => prev.filter(r => r.id !== id));
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
    <Box
      className="page-container"
      id="redungeon-receitas"
      data-page="receitas"
    >
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
            Receitas
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as receitas disponíveis na campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_RECEITA)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Receita
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
              <InputLabel sx={labelSx}>Categoria</InputLabel>
              <Select
                label="Categoria"
                value={filtroCategoria}
                onChange={e => setFiltroCategoria(e.target.value)}
                sx={selectSx}
                MenuProps={menuPropsSx}
              >
                <MenuItem value="">Todas</MenuItem>
                {CATEGORIAS_RECEITA.map(c => (
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

          {receitasFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                📜
              </Typography>
              <Typography variant="body1">
                Nenhuma receita encontrada
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(auto-fill, minmax(300px, 1fr))',
                  md: 'repeat(auto-fill, minmax(340px, 1fr))',
                },
                gap: 2,
              }}
            >
              {receitasFiltradas.map(receita => (
                <ReceitaCard key={receita.id} elevation={0}>
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
                        onClick={() => setReceitaVisualizando(receita)}
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': { color: 'var(--color-accent)' },
                        }}
                        aria-label={`Visualizar receita ${receita.nome}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canWrite(receita.universo) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(ROUTE_PATHS.NOVA_RECEITA, {
                              state: { receita },
                            })
                          }
                          sx={{
                            color: 'var(--color-accent)',
                            '&:hover': {
                              color: 'var(--color-accent)',
                              opacity: 0.8,
                            },
                          }}
                          aria-label={`Editar receita ${receita.nome}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(receita.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': { color: '#ef4444' },
                          }}
                          aria-label={`Remover receita ${receita.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {receita.linkImagem && (
                    <Box
                      component="img"
                      src={receita.linkImagem}
                      alt={receita.nome}
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
                    {receita.nome}
                  </Typography>

                  {(receita.categoria || receita.raridade) && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {[receita.categoria, receita.raridade]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  )}

                  {(receita.valorCompra || receita.valorVenda) && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      {receita.valorCompra && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'var(--text-secondary)' }}
                        >
                          🛒 {receita.valorCompra}
                        </Typography>
                      )}
                      {receita.valorVenda && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'var(--text-secondary)' }}
                        >
                          💰 {receita.valorVenda}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {receita.materiais?.length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        mb: 1,
                      }}
                    >
                      {receita.materiais.map(m => (
                        <Chip
                          key={m.id}
                          label={m.nome}
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

                  {receita.descricao && (
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
                      {receita.descricao}
                    </Typography>
                  )}
                </ReceitaCard>
              ))}
            </Box>
          )}
        </>
      )}

      {/* Dialog de detalhes */}
      <Dialog
        open={Boolean(receitaVisualizando)}
        onClose={() => setReceitaVisualizando(null)}
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
          {receitaVisualizando?.nome}
          {(receitaVisualizando?.categoria ||
            receitaVisualizando?.raridade) && (
            <Typography
              variant="caption"
              sx={{
                color: 'var(--color-accent)',
                display: 'block',
                fontWeight: 600,
              }}
            >
              {[receitaVisualizando.categoria, receitaVisualizando.raridade]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: 'var(--border-primary)' }}>
          {receitaVisualizando?.linkImagem && (
            <Box
              component="img"
              src={receitaVisualizando.linkImagem}
              alt={receitaVisualizando.nome}
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

          {(receitaVisualizando?.valorCompra ||
            receitaVisualizando?.valorVenda) && (
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              {receitaVisualizando.valorCompra && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'var(--text-muted)',
                      display: 'block',
                      mb: 0.3,
                    }}
                  >
                    Valor de Compra
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                  >
                    {receitaVisualizando.valorCompra}
                  </Typography>
                </Box>
              )}
              {receitaVisualizando.valorVenda && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'var(--text-muted)',
                      display: 'block',
                      mb: 0.3,
                    }}
                  >
                    Valor de Venda
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                  >
                    {receitaVisualizando.valorVenda}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {receitaVisualizando?.materiais?.length > 0 && (
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
                Materiais
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                {receitaVisualizando.materiais.map(m => (
                  <Chip
                    key={m.id}
                    label={m.nome}
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

          {receitaVisualizando?.descricao && (
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
                sx={{ color: 'var(--text-secondary)' }}
              >
                {receitaVisualizando.descricao}
              </Typography>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setReceitaVisualizando(null)}
            sx={{ color: 'var(--text-muted)' }}
          >
            Fechar
          </Button>
          {canWrite(receitaVisualizando?.universo) && (
            <Button
              variant="contained"
              onClick={() => {
                navigate(ROUTE_PATHS.NOVA_RECEITA, {
                  state: { receita: receitaVisualizando },
                });
                setReceitaVisualizando(null);
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

export default Receitas;
