import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { getCardFlux, removeCardFlux } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { TIPOS_CARDFLUX, DECKS_CARDFLUX } from 'common/constants/constants';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useDeleteConfirmation from 'hooks/useDeleteConfirmation';
import useUniversos from 'hooks/useUniversos';
import { ordenarPorNome, ORDEM_ASC } from 'common/utils/ordenacao';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
import { CardFluxCard } from './styles';
import {
  RacaCard,
  RacaImageFrame,
  RacaImageOverlay,
  RacaActionBar,
  RacaContent,
  RacaTitle,
  RacaSubtitle,
  RacaDescription,
  RacaFooter,
} from '../Racas/styles';
import CardTokens from 'components/CardTokens/CardTokens';

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
  const {
    items: cardFlux,
    loading: loadingCardFlux,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getCardFlux, remove: removeCardFlux });
  const { universos, loadingUniversos } = useUniversos();
  const { confirmDelete, deleteConfirmationDialog } = useDeleteConfirmation();
  const loading = loadingCardFlux || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroDeck, setFiltroDeck] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [ordenacao, setOrdenacao] = useState(ORDEM_ASC);
  const [cardFluxVisualizando, setCardFluxVisualizando] = useState(null);

  const cardFluxFiltrados = useMemo(() => {
    const filtrados = cardFlux.filter(carta => {
      const matchNome =
        !filtroNome ||
        carta.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchTipo = !filtroTipo || carta.tipo === filtroTipo;
      const matchDeck = !filtroDeck || carta.deck === filtroDeck;
      const matchUniverso =
        !filtroUniverso || carta.universo === filtroUniverso;
      return matchNome && matchTipo && matchDeck && matchUniverso;
    });
    return ordenarPorNome(filtrados, ordenacao);
  }, [cardFlux, filtroNome, filtroTipo, filtroDeck, filtroUniverso, ordenacao]);

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
          <EntityFilters
            nomeValue={filtroNome}
            onNomeChange={setFiltroNome}
            extraFilters={[
              {
                label: 'Tipo',
                value: filtroTipo,
                onChange: setFiltroTipo,
                options: TIPOS_CARDFLUX,
                allLabel: 'Todos',
              },
              {
                label: 'Deck',
                value: filtroDeck,
                onChange: setFiltroDeck,
                options: DECKS_CARDFLUX,
                allLabel: 'Todos',
              },
            ]}
            universos={universos}
            universoValue={filtroUniverso}
            onUniversoChange={setFiltroUniverso}
            sortValue={ordenacao}
            onSortChange={setOrdenacao}
            sx={{
              gridTemplateColumns: {
                xs: '1fr',
                sm: '2fr 1fr 1fr 1fr',
                md: '2fr 1fr 1fr 1fr 1fr',
              },
            }}
            menuMaxHeight={320}
          />

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
                <RacaCard key={carta.id} elevation={0}>
                  <RacaImageFrame>
                    <RacaImageOverlay />
                    <RacaActionBar>
                      <Tooltip title="Visualizar detalhes">
                        <IconButton size="small" onClick={() => setCardFluxVisualizando(carta)} sx={{ color: 'var(--text-secondary)', padding: '14px', minWidth: '16px', width: '16px', height: '16px', '&:hover': { color: 'var(--color-accent)' } }} aria-label={`Visualizar CardFlux ${carta.nome}`}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {canWrite(carta.universo) && (
                        <>
                          <IconButton size="small" onClick={() => navigate(ROUTE_PATHS.NOVO_CARDFLUX, { state: { cardFlux: carta } })} sx={{ color: 'var(--color-accent)', padding: '4px', minWidth: '32px', width: '32px', height: '32px', '&:hover': { color: 'var(--color-accent)', opacity: 0.8 } }} aria-label={`Editar CardFlux ${carta.nome}`}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => confirmDelete(carta.nome, () => handleRemove(carta.id))} sx={{ color: '#ef4444', padding: '4px', minWidth: '32px', width: '32px', height: '32px', '&:hover': { color: '#ef4444' } }} aria-label={`Remover CardFlux ${carta.nome}`}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </RacaActionBar>

                    {carta.linkImagem && (
                      <Box component="img" className="raca-card-image" src={carta.linkImagem} alt={carta.nome} onError={e => { e.currentTarget.style.display = 'none'; }} />
                    )}
                  </RacaImageFrame>

                  <RacaContent>
                    <RacaTitle variant="h6">{carta.nome}</RacaTitle>

                    {(carta.tipo || carta.raridade) && <RacaSubtitle variant="caption">{[carta.tipo, carta.raridade].filter(Boolean).join(' · ')}</RacaSubtitle>}

                    {META_FIELDS.filter(f => carta[f.key]).length > 0 && (
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        {META_FIELDS.filter(f => carta[f.key]).map(f => (
                          <Box
                            key={f.key}
                            sx={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: 2,
                              px: 1.25,
                              py: 1,
                              minHeight: 58,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 0.5,
                              minWidth: 0,
                              textAlign: 'center',
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'var(--text-muted)',
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                flexShrink: 0,
                              }}
                            >
                              {f.label}
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: 'var(--text-primary)',
                                fontWeight: 700,
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {carta[f.key]}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {carta.descricaoGeral && <RacaDescription variant="body2">{carta.descricaoGeral}</RacaDescription>}

                    <RacaFooter>
                      <CardTokens
                        items={[
                          `📖 ${universos.find(u => u.id === carta.universo)?.Nome || 'Universo Desconhecido'}`,
                          ...parseTags(carta.tags).map(tag => `🏷️ ${tag}`),
                        ]}
                      />
                    </RacaFooter>
                  </RacaContent>
                </RacaCard>
              ))}
            </Box>
          )}
        </>
      )}

      <EntityViewDialog
        open={Boolean(cardFluxVisualizando)}
        onClose={() => setCardFluxVisualizando(null)}
        titulo={cardFluxVisualizando?.nome}
        subtitulo={
          (cardFluxVisualizando?.tipo || cardFluxVisualizando?.raridade) &&
          [cardFluxVisualizando.tipo, cardFluxVisualizando.raridade]
            .filter(Boolean)
            .join(' · ')
        }
        imagem={cardFluxVisualizando?.linkImagem}
        imagemSx={{ height: 'auto', maxHeight: 320 }}
        headerContent={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2.5,
              width: '100%',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                width: 4,
                height: 52,
                borderRadius: 999,
                background: 'linear-gradient(180deg, rgba(0, 217, 255, 0.6) 0%, rgba(111, 45, 168, 0.4) 100%)',
                boxShadow: '0 8px 24px rgba(0, 217, 255, 0.15)',
                flexShrink: 0,
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {cardFluxVisualizando?.tipo && (
                <Box
                  sx={{
                    px: 1,
                    py: 0.55,
                    borderRadius: 999,
                    background: 'rgba(0, 217, 255, 0.12)',
                    border: '1px solid rgba(0, 217, 255, 0.2)',
                    color: 'var(--color-accent)',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}
                >
                  {cardFluxVisualizando.tipo}
                </Box>
              )}
              {cardFluxVisualizando?.raridade && (
                <Box
                  sx={{
                    px: 1,
                    py: 0.55,
                    borderRadius: 999,
                    background: 'rgba(111, 45, 168, 0.16)',
                    border: '1px solid rgba(111, 45, 168, 0.26)',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}
                >
                  {cardFluxVisualizando.raridade}
                </Box>
              )}
            </Box>
            {parseTags(cardFluxVisualizando?.tags).length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.8,
                  justifyContent: 'flex-end',
                }}
              >
                {parseTags(cardFluxVisualizando.tags).map(tag => {
                  const tagColors = [
                    { bg: 'rgba(255, 99, 71, 0.28)', border: 'rgba(255, 99, 71, 0.5)', text: '#ff8a65' },
                    { bg: 'rgba(138, 43, 226, 0.28)', border: 'rgba(138, 43, 226, 0.5)', text: '#ba68c8' },
                    { bg: 'rgba(0, 191, 255, 0.28)', border: 'rgba(0, 191, 255, 0.5)', text: '#4dd0e1' },
                    { bg: 'rgba(76, 175, 80, 0.28)', border: 'rgba(76, 175, 80, 0.5)', text: '#81c784' },
                    { bg: 'rgba(255, 193, 7, 0.28)', border: 'rgba(255, 193, 7, 0.5)', text: '#ffd54f' },
                    { bg: 'rgba(233, 30, 99, 0.28)', border: 'rgba(233, 30, 99, 0.5)', text: '#f06292' },
                    { bg: 'rgba(63, 81, 181, 0.28)', border: 'rgba(63, 81, 181, 0.5)', text: '#7986cb' },
                    { bg: 'rgba(255, 152, 0, 0.28)', border: 'rgba(255, 152, 0, 0.5)', text: '#ffb74d' },
                  ];
                  
                  // Função simples de hash baseada no nome da tag para consistência
                  let hash = 0;
                  for (let i = 0; i < tag.length; i++) {
                    hash = ((hash << 5) - hash) + tag.charCodeAt(i);
                    hash = hash & hash; // Converte para 32-bit integer
                  }
                  const colorIndex = Math.abs(hash) % tagColors.length;
                  const color = tagColors[colorIndex];
                  
                  return (
                    <Box
                      key={tag}
                      sx={{
                        px: 0.95,
                        py: 0.55,
                        borderRadius: 999,
                        background: color.bg,
                        border: `1.5px solid ${color.border}`,
                        backdropFilter: 'blur(12px)',
                        color: color.text,
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tag}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        }
        heroContent={
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: 2,
              flexWrap: 'wrap',
              position: 'relative',
            }}
          >
            <Box sx={{ flex: 1, minWidth: 240 }}>
              <Typography
                variant="overline"
                sx={{
                  display: 'block',
                  color: 'rgba(255,255,255,0.74)',
                  letterSpacing: '0.22em',
                  mb: 0.7,
                }}
              >
                Evento Arcano
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  mb: 0.5,
                  lineHeight: 1.1,
                }}
              >
                {cardFluxVisualizando?.nome}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.78)', maxWidth: 560 }}
              >
                {cardFluxVisualizando?.tipo || 'Evento'} ·{' '}
                {cardFluxVisualizando?.raridade || 'Comum'}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(105px, 1fr))',
                gap: 1,
                minWidth: { xs: '100%', sm: 260 },
              }}
            >
              <Box
                sx={{
                  p: 1.1,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: 'rgba(255,255,255,0.68)',
                    fontSize: '0.64rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    mb: 0.35,
                  }}
                >
                  Deck
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  {cardFluxVisualizando?.deck || '—'}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.1,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: 'rgba(255,255,255,0.68)',
                    fontSize: '0.64rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    mb: 0.35,
                  }}
                >
                  Peso
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  {cardFluxVisualizando?.peso || '—'}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.1,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: 'rgba(255,255,255,0.68)',
                    fontSize: '0.64rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    mb: 0.35,
                  }}
                >
                  CD
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  {cardFluxVisualizando?.cd || '—'}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.1,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: 'rgba(255,255,255,0.68)',
                    fontSize: '0.64rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    mb: 0.35,
                  }}
                >
                  Intensidade
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  {cardFluxVisualizando?.intensidade || '—'}
                </Typography>
              </Box>
            </Box>
          </Box>
        }
        actions={
          canWrite(cardFluxVisualizando?.universo) && (
            <Button
              variant="contained"
              onClick={() => {
                navigate(ROUTE_PATHS.NOVO_CARDFLUX, {
                  state: { cardFlux: cardFluxVisualizando },
                });
                setCardFluxVisualizando(null);
              }}
              sx={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #5a2090 100%)',
                borderRadius: 2,
                boxShadow: '0 10px 24px rgba(111, 45, 168, 0.25)',
                textTransform: 'none',
                px: 2.2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7c32be 0%, #5a2090 100%)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Editar
            </Button>
          )
        }
      >

        {NARRATIVA_FIELDS.filter(f => cardFluxVisualizando?.[f.key]).length >
          0 && (
          <Box
            sx={{
              p: { xs: 1.8, md: 2.2 },
              borderRadius: 3,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.4 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 217, 255, 0.12)',
                  color: 'var(--color-accent)',
                }}
              >
                📖
              </Box>
              <Typography
                variant="h6"
                sx={{ color: 'var(--text-primary)', fontWeight: 700 }}
              >
                Narrativa
              </Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1.4 }} />
            <Box sx={{ display: 'grid', gap: 1 }}>
              {NARRATIVA_FIELDS.filter(f => cardFluxVisualizando[f.key]).map(
                f => (
                  <Box
                    key={f.key}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-muted)',
                        display: 'block',
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.16em',
                        mb: 0.35,
                      }}
                    >
                      {f.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
                    >
                      {cardFluxVisualizando[f.key]}
                    </Typography>
                  </Box>
                ),
              )}
            </Box>
          </Box>
        )}

        {RESULTADOS_FIELDS.filter(f => cardFluxVisualizando?.[f.key]).length >
          0 && (
          <Box
            sx={{
              p: { xs: 1.8, md: 2.2 },
              borderRadius: 3,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.4 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 217, 255, 0.12)',
                  color: 'var(--color-accent)',
                }}
              >
                ✨
              </Box>
              <Typography
                variant="h6"
                sx={{ color: 'var(--text-primary)', fontWeight: 700 }}
              >
                Resultados
              </Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1.4 }} />
            <Box
              sx={{
                display: 'grid',
                gap: 1.25,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              }}
            >
              {RESULTADOS_FIELDS.filter(f => cardFluxVisualizando[f.key]).map(
                f => (
                  <Box
                    key={f.key}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-muted)',
                        display: 'block',
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.16em',
                        mb: 0.35,
                      }}
                    >
                      {f.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
                    >
                      {cardFluxVisualizando[f.key]}
                    </Typography>
                  </Box>
                ),
              )}
            </Box>
          </Box>
        )}

        {CONSEQUENCIAS_FIELDS.filter(f => cardFluxVisualizando?.[f.key])
          .length > 0 && (
          <Box
            sx={{
              p: { xs: 1.8, md: 2.2 },
              borderRadius: 3,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.4 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(111, 45, 168, 0.16)',
                  color: 'var(--text-primary)',
                }}
              >
                ⚖️
              </Box>
              <Typography
                variant="h6"
                sx={{ color: 'var(--text-primary)', fontWeight: 700 }}
              >
                Consequências
              </Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1.4 }} />
            <Box sx={{ display: 'grid', gap: 1 }}>
              {CONSEQUENCIAS_FIELDS.filter(f => cardFluxVisualizando[f.key]).map(
                f => (
                  <Box
                    key={f.key}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-muted)',
                        display: 'block',
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.16em',
                        mb: 0.35,
                      }}
                    >
                      {f.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
                    >
                      {cardFluxVisualizando[f.key]}
                    </Typography>
                  </Box>
                ),
              )}
            </Box>
          </Box>
        )}

        {cardFluxVisualizando?.encadeamentoAtivo && (
          <Box
            sx={{
              p: { xs: 1.8, md: 2.2 },
              borderRadius: 3,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.4 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 217, 255, 0.12)',
                  color: 'var(--color-accent)',
                }}
              >
                🔗
              </Box>
              <Typography
                variant="h6"
                sx={{ color: 'var(--text-primary)', fontWeight: 700 }}
              >
                Encadeamento de Eventos
              </Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1.4 }} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 1.25,
              }}
            >
              {cardFluxVisualizando.tipoAtivacao && (
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'var(--text-muted)',
                      display: 'block',
                      fontSize: '0.65rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.16em',
                      mb: 0.35,
                    }}
                  >
                    Tipo de Ativação
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--text-primary)', fontWeight: 700 }}
                  >
                    {cardFluxVisualizando.tipoAtivacao}
                  </Typography>
                </Box>
              )}
              {cardFluxVisualizando.tipoAtivacao === 'Chance' && (
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'var(--text-muted)',
                      display: 'block',
                      fontSize: '0.65rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.16em',
                      mb: 0.35,
                    }}
                  >
                    Porcentagem
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--text-primary)', fontWeight: 700 }}
                  >
                    {cardFluxVisualizando.porcentagem}%
                  </Typography>
                </Box>
              )}
            </Box>

            {cardFluxVisualizando.cartasVinculadas?.length > 0 && (
              <Box sx={{ mt: 1.25 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--text-muted)',
                    display: 'block',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                    mb: 0.8,
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
                        px: 0.65,
                        py: 0.2,
                        height: 'auto',
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-secondary)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {cardFluxVisualizando.descricaoEncadeamento && (
              <Box sx={{ mt: 1.25 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--text-muted)',
                    display: 'block',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                    mb: 0.8,
                  }}
                >
                  Descrição do Encadeamento
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
                >
                  {cardFluxVisualizando.descricaoEncadeamento}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </EntityViewDialog>
      {deleteConfirmationDialog}
    </Box>
  );
};

export default CardFlux;
