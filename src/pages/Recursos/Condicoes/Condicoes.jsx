import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { getCondicoes, removeCondicao } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { RARIDADES } from 'common/constants/constants';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useDeleteConfirmation from 'hooks/useDeleteConfirmation';
import useUniversos from 'hooks/useUniversos';
import { ordenarPorNome, ORDEM_ASC } from 'common/utils/ordenacao';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
import PageHeader from 'components/PageHeader/PageHeader';
import {
  RacaCard,
  RacaSubtitle,
  RacaDescription,
} from '../Racas/styles';
import EntityImage from 'components/EntityImage/EntityImage';
import { UniverseCountBadge } from 'components/CardTokens/CardTokens';
import { getCondicaoUniversos } from './utils';

const Condicoes = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: condicoes,
    loading: loadingCondicoes,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getCondicoes, remove: removeCondicao });
  const { universos, loadingUniversos } = useUniversos();
  const { confirmDelete, deleteConfirmationDialog } = useDeleteConfirmation();
  const loading = loadingCondicoes || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroRaridade, setFiltroRaridade] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [ordenacao, setOrdenacao] = useState(ORDEM_ASC);
  const [condicaoVisualizando, setCondicaoVisualizando] = useState(null);

  const condicoesFiltradas = useMemo(() => {
    const filtradas = condicoes.filter(condicao => {
      const matchNome =
        !filtroNome ||
        condicao.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchRaridade =
        !filtroRaridade || condicao.raridade === filtroRaridade;
      const matchUniverso =
        !filtroUniverso ||
        getCondicaoUniversos(condicao).includes(filtroUniverso);
      return matchNome && matchRaridade && matchUniverso;
    });
    return ordenarPorNome(filtradas, ordenacao);
  }, [condicoes, filtroNome, filtroRaridade, filtroUniverso, ordenacao]);

  return (
    <Box
      className="page-container"
      id="redungeon-condicoes"
      data-page="condicoes"
    >
      <PageHeader
        title="Condições"
        description="Gerencie as condições disponíveis na campanha."
        actions={
          canCreate() ? (
            <Button
              variant="contained"
              onClick={() => navigate(ROUTE_PATHS.NOVA_CONDICAO)}
              sx={{
                background: 'var(--color-primary)',
                '&:hover': { background: 'var(--color-primary-dark)' },
              }}
            >
              + Nova Condição
            </Button>
          ) : null
        }
      />

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
                label: 'Raridade',
                value: filtroRaridade,
                onChange: setFiltroRaridade,
                options: RARIDADES,
                allLabel: 'Todas',
              },
            ]}
            universos={universos}
            universoValue={filtroUniverso}
            onUniversoChange={setFiltroUniverso}
            sortValue={ordenacao}
            onSortChange={setOrdenacao}
          />

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
              {condicoesFiltradas.map(condicao => {
                const condicaoUniversos = getCondicaoUniversos(condicao);

                return (
                  <RacaCard
                    key={condicao.id}
                    elevation={0}
                    sx={{
                      minHeight: 0,
                      p: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'stretch' }}>
                      <Box
                        sx={{
                          position: 'relative',
                          width: 112,
                          minWidth: 112,
                          height: 112,
                          borderRadius: 3,
                          overflow: 'hidden',
                          border: '1px solid var(--border-primary)',
                          background:
                            'linear-gradient(145deg, rgba(15,23,42,0.96), rgba(10,14,24,0.9))',
                        }}
                      >
                        <EntityImage
                          src={condicao.linkImagem}
                          alt={condicao.nome}
                          width={112}
                          height={112}
                          objectFit="cover"
                          placeholderText="Sem imagem"
                          fallbackText="Imagem indisponível"
                          sx={{ borderRadius: 0, border: 'none' }}
                        />

                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            display: 'flex',
                            gap: 0.5,
                            zIndex: 2,
                            background: 'rgba(12, 18, 30, 0.72)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: 2,
                            p: 0.35,
                          }}
                        >
                          <Tooltip title="Visualizar detalhes">
                            <IconButton
                              size="small"
                              onClick={() => setCondicaoVisualizando(condicao)}
                              sx={{
                                color: 'var(--text-secondary)',
                                padding: '8px',
                                minWidth: '16px',
                                width: '16px',
                                height: '16px',
                                '&:hover': { color: 'var(--color-accent)' },
                              }}
                              aria-label={`Visualizar condição ${condicao.nome}`}
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {canWrite(condicaoUniversos) && (
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
                                  padding: '4px',
                                  minWidth: '24px',
                                  width: '24px',
                                  height: '24px',
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
                                onClick={() =>
                                  confirmDelete(condicao.nome, () =>
                                    handleRemove(condicao.id),
                                  )
                                }
                                sx={{
                                  color: '#ef4444',
                                  padding: '4px',
                                  minWidth: '24px',
                                  width: '24px',
                                  height: '24px',
                                  '&:hover': { color: '#ef4444' },
                                }}
                                aria-label={`Remover condição ${condicao.nome}`}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.9,
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            minWidth: 0,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              color: 'var(--text-primary)',
                              fontWeight: 700,
                              lineHeight: 1.2,
                              wordBreak: 'break-word',
                            }}
                          >
                            {condicao.nome}
                          </Typography>

                          <UniverseCountBadge
                            universoIds={condicaoUniversos}
                            universos={universos}
                          />
                        </Box>

                        {(condicao.raridade || condicao.duracao) && (
                          <RacaSubtitle variant="caption">
                            {[condicao.raridade, condicao.duracao]
                              .filter(Boolean)
                              .join(' · ')}
                          </RacaSubtitle>
                        )}

                        {condicao.descricao && (
                          <RacaDescription variant="body2">
                            {condicao.descricao}
                          </RacaDescription>
                        )}
                      </Box>
                    </Box>
                  </RacaCard>
                );
              })}
            </Box>
          )}
        </>
      )}

      <EntityViewDialog
        open={Boolean(condicaoVisualizando)}
        onClose={() => setCondicaoVisualizando(null)}
        titulo={condicaoVisualizando?.nome}
        subtitulo={
          (condicaoVisualizando?.raridade || condicaoVisualizando?.duracao) &&
          [condicaoVisualizando.raridade, condicaoVisualizando.duracao]
            .filter(Boolean)
            .join(' · ')
        }
        imagem={condicaoVisualizando?.linkImagem}
        imagemSx={{ height: 'auto', maxHeight: 220 }}
        descricao={condicaoVisualizando?.descricao}
        actions={
          canWrite(getCondicaoUniversos(condicaoVisualizando)) && (
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
                '&:hover': { background: 'var(--color-primary-dark)' },
              }}
            >
              Editar
            </Button>
          )
        }
      >
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
                  key={`${e}-${i}`}
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
              {condicaoVisualizando.interacoes.filter(Boolean).map((it, i) => (
                <Typography
                  key={`${it}-${i}`}
                  variant="body2"
                  sx={{ color: 'var(--text-secondary)', mb: 0.5 }}
                >
                  • {it}
                </Typography>
              ))}
            </Box>
          </>
        )}
      </EntityViewDialog>
      {deleteConfirmationDialog}
    </Box>
  );
};

export default Condicoes;
