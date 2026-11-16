import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
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
  CondicaoCard,
  CondicaoCardInner,
  CondicaoImageFrame,
  CondicaoCardBody,
  CondicaoHeaderRow,
  CondicaoTitle,
  CondicaoMetaRow,
  CondicaoMetaChip,
  CondicaoCardDescription,
  CondicaoActions,
  CondicaoActionButton,
} from './styles';
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
      className="page-container redungeon-condicoes-page"
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
                  sm: 'repeat(2, minmax(0, 1fr))',
                  xl: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              {condicoesFiltradas.map(condicao => {
                const condicaoUniversos = getCondicaoUniversos(condicao);

                return (
                  <CondicaoCard
                    key={condicao.id}
                    elevation={0}
                  >
                    <CondicaoCardInner>
                      <CondicaoImageFrame>
                        <EntityImage
                          src={condicao.linkImagem}
                          alt={condicao.nome}
                          width="100%"
                          height="100%"
                          objectFit="cover"
                          placeholderText="Sem imagem"
                          fallbackText="Imagem indisponível"
                          sx={{ borderRadius: 0, border: 'none' }}
                        />
                      </CondicaoImageFrame>

                      <CondicaoCardBody>
                        <CondicaoHeaderRow>
                          <CondicaoTitle variant="h6">{condicao.nome}</CondicaoTitle>
                          <UniverseCountBadge
                            universoIds={condicaoUniversos}
                            universos={universos}
                          />
                        </CondicaoHeaderRow>

                        {(condicao.raridade || condicao.duracao) && (
                          <CondicaoMetaRow>
                            {condicao.raridade && (
                              <CondicaoMetaChip>{condicao.raridade}</CondicaoMetaChip>
                            )}
                            {condicao.duracao && (
                              <CondicaoMetaChip>{condicao.duracao}</CondicaoMetaChip>
                            )}
                          </CondicaoMetaRow>
                        )}

                        {condicao.descricao && (
                          <CondicaoCardDescription variant="body2">
                            {condicao.descricao}
                          </CondicaoCardDescription>
                        )}

                        <CondicaoActions>
                          <Tooltip title="Visualizar detalhes">
                            <CondicaoActionButton
                              size="small"
                              onClick={() => setCondicaoVisualizando(condicao)}
                              aria-label={`Visualizar condição ${condicao.nome}`}
                              sx={{ color: 'var(--text-secondary)', '&:hover': { color: 'var(--color-accent)' } }}
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </CondicaoActionButton>
                          </Tooltip>

                          {canWrite(condicaoUniversos) && (
                            <>
                              <CondicaoActionButton
                                size="small"
                                onClick={() =>
                                  navigate(ROUTE_PATHS.NOVA_CONDICAO, {
                                    state: { condicao },
                                  })
                                }
                                aria-label={`Editar condição ${condicao.nome}`}
                                sx={{ color: 'var(--color-accent)', '&:hover': { color: 'var(--color-accent)' } }}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </CondicaoActionButton>
                              <CondicaoActionButton
                                size="small"
                                onClick={() =>
                                  confirmDelete(condicao.nome, () =>
                                    handleRemove(condicao.id),
                                  )
                                }
                                aria-label={`Remover condição ${condicao.nome}`}
                                sx={{ color: '#fca5a5', '&:hover': { color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.34) !important' } }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </CondicaoActionButton>
                            </>
                          )}
                        </CondicaoActions>
                      </CondicaoCardBody>
                    </CondicaoCardInner>
                  </CondicaoCard>
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
