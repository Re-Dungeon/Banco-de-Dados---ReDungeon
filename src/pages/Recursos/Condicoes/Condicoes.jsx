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
import { getCondicoes, removeCondicao, getUniversos } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { RARIDADES } from 'common/constants/constants';
import { CondicaoCard } from './styles';

const Condicoes = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const [condicoes, setCondicoes] = useState([]);
  const [universos, setUniversos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroRaridade, setFiltroRaridade] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [condicaoVisualizando, setCondicaoVisualizando] = useState(null);

  useEffect(() => {
    Promise.all([getCondicoes(), getUniversos()])
      .then(([condicoesData, universosData]) => {
        setCondicoes(condicoesData);
        setUniversos(universosData);
      })
      .finally(() => setLoading(false));
  }, []);

  const condicoesFiltradas = useMemo(() => {
    return condicoes.filter(condicao => {
      const matchNome =
        !filtroNome ||
        condicao.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchRaridade =
        !filtroRaridade || condicao.raridade === filtroRaridade;
      const matchUniverso =
        !filtroUniverso || condicao.universo === filtroUniverso;
      return matchNome && matchRaridade && matchUniverso;
    });
  }, [condicoes, filtroNome, filtroRaridade, filtroUniverso]);

  const handleRemove = async id => {
    await removeCondicao(id);
    setCondicoes(prev => prev.filter(c => c.id !== id));
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
      id="redungeon-condicoes"
      data-page="condicoes"
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
            Condições
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as condições disponíveis na campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_CONDICAO)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Condição
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

          {condicoesFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                💫
              </Typography>
              <Typography variant="body1">
                Nenhuma condição encontrada
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
              {condicoesFiltradas.map(condicao => (
                <CondicaoCard key={condicao.id} elevation={0}>
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
                        onClick={() => setCondicaoVisualizando(condicao)}
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': { color: 'var(--color-accent)' },
                        }}
                        aria-label={`Visualizar condição ${condicao.nome}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canWrite(condicao.universo) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(ROUTE_PATHS.NOVA_CONDICAO, {
                              state: { condicao },
                            })
                          }
                          sx={{
                            color: 'var(--color-accent)',
                            '&:hover': {
                              color: 'var(--color-accent)',
                              opacity: 0.8,
                            },
                          }}
                          aria-label={`Editar condição ${condicao.nome}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(condicao.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': { color: '#ef4444' },
                          }}
                          aria-label={`Remover condição ${condicao.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {condicao.linkImagem && (
                    <Box
                      component="img"
                      src={condicao.linkImagem}
                      alt={condicao.nome}
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
                    {condicao.nome}
                  </Typography>

                  {(condicao.raridade || condicao.duracao) && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {[condicao.raridade, condicao.duracao]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  )}

                  {condicao.descricao && (
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
                      {condicao.descricao}
                    </Typography>
                  )}

                  {(condicao.efeitos?.filter(Boolean).length > 0 ||
                    condicao.interacoes?.filter(Boolean).length > 0) && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-muted)',
                        mt: 1,
                        display: 'block',
                      }}
                    >
                      {condicao.efeitos?.filter(Boolean).length > 0 &&
                        `${condicao.efeitos.filter(Boolean).length} efeito${condicao.efeitos.filter(Boolean).length !== 1 ? 's' : ''}`}
                      {condicao.efeitos?.filter(Boolean).length > 0 &&
                        condicao.interacoes?.filter(Boolean).length > 0 &&
                        ' · '}
                      {condicao.interacoes?.filter(Boolean).length > 0 &&
                        `${condicao.interacoes.filter(Boolean).length} interação${condicao.interacoes.filter(Boolean).length !== 1 ? 'ões' : ''}`}
                    </Typography>
                  )}
                </CondicaoCard>
              ))}
            </Box>
          )}
        </>
      )}

      <Dialog
        open={Boolean(condicaoVisualizando)}
        onClose={() => setCondicaoVisualizando(null)}
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
          {condicaoVisualizando?.nome}
          {(condicaoVisualizando?.raridade ||
            condicaoVisualizando?.duracao) && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'var(--color-accent)',
                fontWeight: 600,
                mt: 0.5,
              }}
            >
              {[condicaoVisualizando.raridade, condicaoVisualizando.duracao]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'var(--border-primary)' }}>
          {condicaoVisualizando?.linkImagem && (
            <Box
              component="img"
              src={condicaoVisualizando.linkImagem}
              alt={condicaoVisualizando.nome}
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

          {condicaoVisualizando?.descricao && (
            <>
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
                {condicaoVisualizando.descricao}
              </Typography>
            </>
          )}

          {condicaoVisualizando?.aplicacao && (
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
                Aplicação
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--text-secondary)', mb: 2 }}
              >
                {condicaoVisualizando.aplicacao}
              </Typography>
            </>
          )}

          {condicaoVisualizando?.efeitos?.filter(Boolean).length > 0 && (
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
                Efeitos
              </Typography>
              <Box sx={{ mb: 2 }}>
                {condicaoVisualizando.efeitos.filter(Boolean).map((e, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    sx={{ color: 'var(--text-secondary)', mb: 0.5 }}
                  >
                    • {e}
                  </Typography>
                ))}
              </Box>
            </>
          )}

          {condicaoVisualizando?.interacoes?.filter(Boolean).length > 0 && (
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
                Interações
              </Typography>
              <Box>
                {condicaoVisualizando.interacoes
                  .filter(Boolean)
                  .map((it, i) => (
                    <Typography
                      key={i}
                      variant="body2"
                      sx={{ color: 'var(--text-secondary)', mb: 0.5 }}
                    >
                      • {it}
                    </Typography>
                  ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setCondicaoVisualizando(null)}
            sx={{
              color: 'var(--text-secondary)',
              '&:hover': { color: 'var(--text-primary)' },
            }}
          >
            Fechar
          </Button>
          {canWrite(condicaoVisualizando?.universo) && (
            <Button
              variant="contained"
              onClick={() => {
                navigate(ROUTE_PATHS.NOVA_CONDICAO, {
                  state: { condicao: condicaoVisualizando },
                });
                setCondicaoVisualizando(null);
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

export default Condicoes;
