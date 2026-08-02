import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
// removed unused IconButton
import CircularProgress from '@mui/material/CircularProgress';
// Divider, Tooltip and Chip imports removed (not used anymore)
// removed unused icons
import { getArtes, removeArte } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { TIPOS_ARTE, CLASSIFICACOES_ARTE } from 'common/constants/constants';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useDeleteConfirmation from 'hooks/useDeleteConfirmation';
import useUniversos from 'hooks/useUniversos';
import { ordenarPorNome, ORDEM_ASC } from 'common/utils/ordenacao';
import EntityFilters from 'components/EntityFilters/EntityFilters';
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
  const {
    items: artes,
    loading: loadingArtes,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getArtes, remove: removeArte });
  const { universos, loadingUniversos } = useUniversos();
  const { confirmDelete, deleteConfirmationDialog } = useDeleteConfirmation();
  const loading = loadingArtes || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroClassificacao, setFiltroClassificacao] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [ordenacao, setOrdenacao] = useState(ORDEM_ASC);
  const [activeTabById, setActiveTabById] = useState({});

  const artesFiltradas = useMemo(() => {
    const filtradas = artes.filter(arte => {
      const matchNome =
        !filtroNome ||
        arte.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchTipo = !filtroTipo || arte.tipo === filtroTipo;
      const matchClassificacao =
        !filtroClassificacao || arte.classificacao === filtroClassificacao;
      const matchUniverso = !filtroUniverso || arte.universo === filtroUniverso;
      return matchNome && matchTipo && matchClassificacao && matchUniverso;
    });
    return ordenarPorNome(filtradas, ordenacao);
  }, [
    artes,
    filtroNome,
    filtroTipo,
    filtroClassificacao,
    filtroUniverso,
    ordenacao,
  ]);

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
          <EntityFilters
            nomeValue={filtroNome}
            onNomeChange={setFiltroNome}
            extraFilters={[
              {
                label: 'Tipo',
                value: filtroTipo,
                onChange: setFiltroTipo,
                options: TIPOS_ARTE,
                allLabel: 'Todos',
              },
              {
                label: 'Classificação',
                value: filtroClassificacao,
                onChange: setFiltroClassificacao,
                options: CLASSIFICACOES_ARTE,
                allLabel: 'Todas',
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
          />

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
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                },
                gap: '18px',
              }}
            >
              {artesFiltradas.map(arte => (
                <ArteCard key={arte.id} elevation={0}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateRows: 'auto 96px 44px 140px auto',
                      gap: 1,
                      minHeight: 520,
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        minHeight: 56,
                      }}
                    >
                      {arte.linkImagem && (
                        <Box
                          component="img"
                          src={arte.linkImagem}
                          alt={arte.nome}
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 3,
                            objectFit: 'cover',
                            border: '1px solid rgba(91,124,250,0.24)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
                          }}
                          onError={e => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: 'var(--text-primary)',
                            fontWeight: 700,
                            lineHeight: 1.1,
                            mb: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {arte.nome}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            minHeight: 28,
                            overflowX: 'auto',
                            alignItems: 'center',
                            '&::-webkit-scrollbar': {
                              height: '6px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              background: 'rgba(255,255,255,0.12)',
                              borderRadius: '999px',
                            },
                          }}
                        >
                          {[
                            arte.nucleo ? `Núcleo: ${arte.nucleo}` : null,
                            arte.tipo,
                            arte.classificacao,
                          ]
                            .filter(Boolean)
                            .map((tag, index) => (
                              <Box
                                key={index}
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  px: 1.2,
                                  py: 0.45,
                                  borderRadius: '999px',
                                  background: 'rgba(91,124,250,0.12)',
                                  border: '1px solid rgba(91,124,250,0.24)',
                                  color: '#f3f4f6',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.08em',
                                  fontSize: '0.7rem',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {tag}
                              </Box>
                            ))}
                        </Box>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: 'repeat(6, minmax(140px, 1fr))',
                          md: 'repeat(6, minmax(0, 1fr))',
                        },
                        gap: 1,
                        minHeight: 96,
                      }}
                    >
                      {META_FIELDS.slice(0, 6).map(f => (
                        <Box
                          key={f.key}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 0.5,
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '14px',
                            p: 1,
                            minHeight: 96,
                            height: '100%',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              fontSize: '10px',
                              letterSpacing: '0.12em',
                              textAlign: 'center',
                            }}
                          >
                            {f.label}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: 'var(--text-primary)',
                              fontWeight: 700,
                              fontSize: '13px',
                              textAlign: 'center',
                            }}
                          >
                            {arte[f.key] || '–'}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                      }}
                    >
                      {['descricao', 'cantico', 'condicoes'].map(tabKey => {
                        const label =
                          tabKey === 'descricao'
                            ? 'Descrição'
                            : tabKey === 'cantico'
                            ? 'Cântico'
                            : 'Condições';
                        const active =
                          (activeTabById && activeTabById[arte.id]) || 'descricao';
                        const isActive = active === tabKey;
                        return (
                          <Box
                            key={tabKey}
                            onClick={() =>
                              setActiveTabById(prev => ({ ...prev, [arte.id]: tabKey }))
                            }
                            sx={{
                              cursor: 'pointer',
                              px: 1.75,
                              py: 0.75,
                              borderRadius: '999px',
                              background: isActive
                                ? 'rgba(91,124,250,0.18)'
                                : 'rgba(255,255,255,0.03)',
                              border: isActive
                                ? '1px solid rgba(91,124,250,0.28)'
                                : '1px solid rgba(255,255,255,0.08)',
                              color: isActive ? '#f3f4f6' : 'var(--text-secondary)',
                              fontSize: '0.75rem',
                              fontWeight: isActive ? 700 : 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.12em',
                              minWidth: 100,
                              textAlign: 'center',
                              transition: 'all 160ms ease',
                              '&:hover': { transform: 'translateY(-2px)' },
                            }}
                          >
                            {label}
                          </Box>
                        );
                      })}
                    </Box>

                    <Box
                      sx={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '14px',
                        p: 2,
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                        lineHeight: 1.6,
                        overflowY: 'auto',
                        height: '100%',
                        minHeight: 0,
                      }}
                    >
                      {(() => {
                        const active =
                          (activeTabById && activeTabById[arte.id]) || 'descricao';
                        if (active === 'descricao') {
                          return (
                            <Typography
                              variant="body2"
                              sx={{ whiteSpace: 'pre-wrap' }}
                            >
                              {arte.descricao || '–'}
                            </Typography>
                          );
                        }

                        if (active === 'cantico') {
                          return (
                            <Typography
                              variant="body2"
                              sx={{ whiteSpace: 'pre-wrap' }}
                            >
                              {arte.cantico || 'Esta arte não possui cântico.'}
                            </Typography>
                          );
                        }

                        // Condições tab
                        const conds = arte.condicoesAplicadas || [];
                        if (conds.length === 0) {
                          return (
                            <Box
                              sx={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-muted)',
                              }}
                            >
                              Nenhuma condição vinculada a esta arte.
                            </Box>
                          );
                        }

                        return (
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: {
                                xs: 'repeat(2, 1fr)',
                                sm: 'repeat(3, 1fr)',
                                md: 'repeat(4, 1fr)',
                              },
                              gap: 1,
                              alignItems: 'start',
                            }}
                          >
                            {conds.map(c => (
                              <Box
                                key={c.id || c.nome}
                                sx={{
                                  width: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  padding: '6px',
                                  borderRadius: 8,
                                  border: '1px solid rgba(255,255,255,0.04)',
                                  background: 'transparent',
                                  transition: 'transform 200ms ease, box-shadow 200ms ease',
                                  '&:hover': {
                                    transform: 'scale(1.04)',
                                    boxShadow: '0 6px 18px rgba(0,0,0,0.45), 0 0 10px rgba(91,124,250,0.06)',
                                  },
                                }}
                              >
                                {c.linkImagem ? (
                                  <Box
                                    component="img"
                                    src={c.linkImagem}
                                    alt={c.nome}
                                    sx={{
                                      width: 64,
                                      height: 64,
                                      borderRadius: 6,
                                      objectFit: 'cover',
                                    }}
                                    onError={e => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      width: 64,
                                      height: 64,
                                      borderRadius: 6,
                                      background: 'rgba(255,255,255,0.02)',
                                    }}
                                  />
                                )}

                                <Typography
                                  variant="body2"
                                  sx={{
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    lineHeight: 1.05,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    width: '100%',
                                  }}
                                >
                                  {c.nome}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        );
                      })()}
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        alignItems: 'center',
                        minHeight: 72,
                      }}
                    >
                      {canWrite(arte.universo) && (
                        <Button
                          onClick={() =>
                            navigate(ROUTE_PATHS.NOVA_ARTE, {
                              state: { arte },
                            })
                          }
                          aria-label={`Editar arte ${arte.nome}`}
                          sx={{
                            color: '#f3f4f6',
                            border: '1px solid rgba(255,255,255,0.14)',
                            background: 'rgba(255,255,255,0.04)',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 2,
                            py: 0.9,
                            minWidth: 116,
                            '&:hover': {
                              background: 'rgba(255,255,255,0.08)',
                            },
                          }}
                        >
                          Editar
                        </Button>
                      )}
                      {canWrite(arte.universo) && (
                        <Button
                          onClick={() => confirmDelete(arte.nome, () => handleRemove(arte.id))}
                          aria-label={`Remover arte ${arte.nome}`}
                          sx={{
                            color: '#ff6b6b',
                            border: '1px solid rgba(255,107,107,0.22)',
                            background: 'rgba(255,107,107,0.08)',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 2,
                            py: 0.9,
                            minWidth: 116,
                            '&:hover': {
                              background: 'rgba(255,107,107,0.14)',
                            },
                          }}
                        >
                          Remover
                        </Button>
                      )}
                    </Box>
                  </Box>
                </ArteCard>
              ))}
            </Box>
          )}
        </>
      )}

      {deleteConfirmationDialog}
    </Box>
  );
};

export default Artes;
