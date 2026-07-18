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
import { getCardFlux, removeCardFlux, getUniversos } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { TIPOS_CARDFLUX, DECKS_CARDFLUX } from 'common/constants/constants';
import { CardFluxCard } from './styles';

const parseTags = tags =>
  (tags || '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

const META_FIELDS = [
  { key: 'deck', label: 'Deck' },
  { key: 'peso', label: 'Peso' },
  { key: 'cd', label: 'CD' },
  { key: 'intensidade', label: 'Intensidade' },
];

const NARRATIVA_FIELDS = [
  { key: 'descricaoGeral', label: 'Descrição Geral' },
  { key: 'comoApresentar', label: 'Como Apresentar' },
  { key: 'mecanicasDesafios', label: 'Mecânicas/Desafios' },
];

const RESULTADOS_FIELDS = [
  { key: 'seConseguirem', label: 'Se Conseguirem' },
  { key: 'seFalharem', label: 'Se Falharem' },
];

const CONSEQUENCIAS_FIELDS = [
  { key: 'recompensas', label: 'Recompensas' },
  { key: 'impactoMundo', label: 'Impacto no Mundo' },
  { key: 'ganchosNarrativos', label: 'Ganchos Narrativos' },
];

const CardFlux = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const [cardFlux, setCardFlux] = useState([]);
  const [universos, setUniversos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroDeck, setFiltroDeck] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [cardFluxVisualizando, setCardFluxVisualizando] = useState(null);

  useEffect(() => {
    Promise.all([getCardFlux(), getUniversos()])
      .then(([cardFluxData, universosData]) => {
        setCardFlux(cardFluxData);
        setUniversos(universosData);
      })
      .finally(() => setLoading(false));
  }, []);

  const cardFluxFiltrados = useMemo(() => {
    return cardFlux.filter(carta => {
      const matchNome =
        !filtroNome ||
        carta.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchTipo = !filtroTipo || carta.tipo === filtroTipo;
      const matchDeck = !filtroDeck || carta.deck === filtroDeck;
      const matchUniverso =
        !filtroUniverso || carta.universo === filtroUniverso;
      return matchNome && matchTipo && matchDeck && matchUniverso;
    });
  }, [cardFlux, filtroNome, filtroTipo, filtroDeck, filtroUniverso]);

  const handleRemove = async id => {
    await removeCardFlux(id);
    setCardFlux(prev => prev.filter(c => c.id !== id));
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
      sx: {
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        maxHeight: 320,
      },
    },
  };

  const labelSx = {
    color: 'var(--text-secondary)',
    '&.Mui-focused': { color: 'var(--color-accent)' },
  };

  return (
    <Box
      className="page-container"
      id="redungeon-cardflux"
      data-page="cardflux"
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
            CardFlux
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie os eventos e cartas narrativas da campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVO_CARDFLUX)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Novo CardFlux
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
                {TIPOS_CARDFLUX.map(t => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel sx={labelSx}>Deck</InputLabel>
              <Select
                label="Deck"
                value={filtroDeck}
                onChange={e => setFiltroDeck(e.target.value)}
                sx={selectSx}
                MenuProps={menuPropsSx}
              >
                <MenuItem value="">Todos</MenuItem>
                {DECKS_CARDFLUX.map(d => (
                  <MenuItem key={d} value={d}>
                    {d}
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

          {cardFluxFiltrados.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                🃏
              </Typography>
              <Typography variant="body1">
                Nenhum CardFlux encontrado
              </Typography>
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
              {cardFluxFiltrados.map(carta => (
                <CardFluxCard key={carta.id} elevation={0}>
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
                        onClick={() => setCardFluxVisualizando(carta)}
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': { color: 'var(--color-accent)' },
                        }}
                        aria-label={`Visualizar CardFlux ${carta.nome}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canWrite(carta.universo) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(ROUTE_PATHS.NOVO_CARDFLUX, {
                              state: { cardFlux: carta },
                            })
                          }
                          sx={{
                            color: 'var(--color-accent)',
                            '&:hover': {
                              color: 'var(--color-accent)',
                              opacity: 0.8,
                            },
                          }}
                          aria-label={`Editar CardFlux ${carta.nome}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(carta.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': { color: '#ef4444' },
                          }}
                          aria-label={`Remover CardFlux ${carta.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {carta.linkImagem && (
                    <Box
                      component="img"
                      src={carta.linkImagem}
                      alt={carta.nome}
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
                    {carta.nome}
                  </Typography>

                  {(carta.tipo || carta.raridade) && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {[carta.tipo, carta.raridade].filter(Boolean).join(' · ')}
                    </Typography>
                  )}

                  {META_FIELDS.filter(f => carta[f.key]).length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.75,
                        mb: 1,
                      }}
                    >
                      {META_FIELDS.filter(f => carta[f.key]).map(f => (
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
                            {carta[f.key]}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {parseTags(carta.tags).length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        mb: 1,
                      }}
                    >
                      {parseTags(carta.tags).map(tag => (
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

                  {carta.descricaoGeral && (
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
                      {carta.descricaoGeral}
                    </Typography>
                  )}
                </CardFluxCard>
              ))}
            </Box>
          )}
        </>
      )}

      {/* Dialog de detalhes */}
      <Dialog
        open={Boolean(cardFluxVisualizando)}
        onClose={() => setCardFluxVisualizando(null)}
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
          {cardFluxVisualizando?.nome}
          {(cardFluxVisualizando?.tipo || cardFluxVisualizando?.raridade) && (
            <Typography
              variant="caption"
              sx={{
                color: 'var(--color-accent)',
                display: 'block',
                fontWeight: 600,
              }}
            >
              {[cardFluxVisualizando.tipo, cardFluxVisualizando.raridade]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: 'var(--border-primary)' }}>
          {cardFluxVisualizando?.linkImagem && (
            <Box
              component="img"
              src={cardFluxVisualizando.linkImagem}
              alt={cardFluxVisualizando.nome}
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

          {META_FIELDS.filter(f => cardFluxVisualizando?.[f.key]).length >
            0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
              {META_FIELDS.filter(f => cardFluxVisualizando[f.key]).map(f => (
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
                    {cardFluxVisualizando[f.key]}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {parseTags(cardFluxVisualizando?.tags).length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
              {parseTags(cardFluxVisualizando.tags).map(tag => (
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

          {NARRATIVA_FIELDS.filter(f => cardFluxVisualizando?.[f.key]).length >
            0 && (
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
                Narrativa
              </Typography>
              {NARRATIVA_FIELDS.filter(f => cardFluxVisualizando[f.key]).map(
                f => (
                  <Box key={f.key} sx={{ mb: 1.25 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-muted)',
                        display: 'block',
                        fontSize: '0.7rem',
                      }}
                    >
                      {f.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--text-secondary)' }}
                    >
                      {cardFluxVisualizando[f.key]}
                    </Typography>
                  </Box>
                ),
              )}
            </>
          )}

          {RESULTADOS_FIELDS.filter(f => cardFluxVisualizando?.[f.key]).length >
            0 && (
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
                Resultados
              </Typography>
              {RESULTADOS_FIELDS.filter(f => cardFluxVisualizando[f.key]).map(
                f => (
                  <Box key={f.key} sx={{ mb: 1.25 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-muted)',
                        display: 'block',
                        fontSize: '0.7rem',
                      }}
                    >
                      {f.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--text-secondary)' }}
                    >
                      {cardFluxVisualizando[f.key]}
                    </Typography>
                  </Box>
                ),
              )}
            </>
          )}

          {CONSEQUENCIAS_FIELDS.filter(f => cardFluxVisualizando?.[f.key])
            .length > 0 && (
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
                Consequências
              </Typography>
              {CONSEQUENCIAS_FIELDS.filter(
                f => cardFluxVisualizando[f.key],
              ).map(f => (
                <Box key={f.key} sx={{ mb: 1.25 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'var(--text-muted)',
                      display: 'block',
                      fontSize: '0.7rem',
                    }}
                  >
                    {f.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--text-secondary)' }}
                  >
                    {cardFluxVisualizando[f.key]}
                  </Typography>
                </Box>
              ))}
            </>
          )}

          {cardFluxVisualizando?.encadeamentoAtivo && (
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
                Encadeamento de Eventos
              </Typography>
              <Box
                sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}
              >
                {cardFluxVisualizando.tipoAtivacao && (
                  <Box
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
                      Tipo de Ativação
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                    >
                      {cardFluxVisualizando.tipoAtivacao}
                    </Typography>
                  </Box>
                )}
                {cardFluxVisualizando.tipoAtivacao === 'Chance' && (
                  <Box
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
                      Porcentagem
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                    >
                      {cardFluxVisualizando.porcentagem}%
                    </Typography>
                  </Box>
                )}
              </Box>

              {cardFluxVisualizando.cartasVinculadas?.length > 0 && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'var(--text-muted)',
                      display: 'block',
                      fontSize: '0.7rem',
                      mb: 0.5,
                    }}
                  >
                    Cartas Vinculadas
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {cardFluxVisualizando.cartasVinculadas.map(c => (
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
                </Box>
              )}

              {cardFluxVisualizando.descricaoEncadeamento && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'var(--text-muted)',
                      display: 'block',
                      fontSize: '0.7rem',
                    }}
                  >
                    Descrição do Encadeamento
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--text-secondary)' }}
                  >
                    {cardFluxVisualizando.descricaoEncadeamento}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setCardFluxVisualizando(null)}
            sx={{ color: 'var(--text-muted)' }}
          >
            Fechar
          </Button>
          {canWrite(cardFluxVisualizando?.universo) && (
            <Button
              variant="contained"
              onClick={() => {
                navigate(ROUTE_PATHS.NOVO_CARDFLUX, {
                  state: { cardFlux: cardFluxVisualizando },
                });
                setCardFluxVisualizando(null);
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

export default CardFlux;
