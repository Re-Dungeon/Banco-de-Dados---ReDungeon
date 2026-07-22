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
import useUniversos from 'hooks/useUniversos';
import { ordenarPorNome, ORDEM_ASC } from 'common/utils/ordenacao';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
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
  const {
    items: cardFlux,
    loading: loadingCardFlux,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getCardFlux, remove: removeCardFlux });
  const { universos, loadingUniversos } = useUniversos();
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
        imagemSx={{ height: 'auto', maxHeight: 220 }}
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
                background: 'var(--color-primary)',
                '&:hover': { background: '#5a2090' },
              }}
            >
              Editar
            </Button>
          )
        }
      >
        {META_FIELDS.filter(f => cardFluxVisualizando?.[f.key]).length > 0 && (
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
            {CONSEQUENCIAS_FIELDS.filter(f => cardFluxVisualizando[f.key]).map(
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
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
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
      </EntityViewDialog>
    </Box>
  );
};

export default CardFlux;
