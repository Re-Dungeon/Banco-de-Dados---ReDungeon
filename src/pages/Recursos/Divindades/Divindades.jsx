import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { getDivindades, removeDivindade } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useDeleteConfirmation from 'hooks/useDeleteConfirmation';
import useUniversos from 'hooks/useUniversos';
import { ordenarPorNome, ORDEM_ASC } from 'common/utils/ordenacao';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
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

const Divindades = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: divindades,
    loading: loadingDivindades,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getDivindades, remove: removeDivindade });
  const { universos, loadingUniversos } = useUniversos();
  const { confirmDelete, deleteConfirmationDialog } = useDeleteConfirmation();
  const loading = loadingDivindades || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [ordenacao, setOrdenacao] = useState(ORDEM_ASC);
  const [divindadeVisualizando, setDivindadeVisualizando] = useState(null);

  const divindadeUniversoNome = divindadeVisualizando
    ? universos.find(u => u.id === divindadeVisualizando.universo)?.Nome || ''
    : '';

  const divindadeMetaItems = [
    divindadeVisualizando?.universo &&
      `📖 ${divindadeUniversoNome || 'Universo Desconhecido'}`,
    divindadeVisualizando?.cor && `🎨 ${divindadeVisualizando.cor}`,
  ].filter(Boolean);

  const divindadeVisualizandoSubtitle = [
    divindadeUniversoNome,
    divindadeVisualizando?.cor,
  ]
    .filter(Boolean)
    .join(' · ');

  const divindadesFiltradas = useMemo(() => {
    const filtradas = divindades.filter(divindade => {
      const matchNome =
        !filtroNome ||
        divindade.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchUniverso =
        !filtroUniverso || divindade.universo === filtroUniverso;
      return matchNome && matchUniverso;
    });
    return ordenarPorNome(filtradas, ordenacao);
  }, [divindades, filtroNome, filtroUniverso, ordenacao]);

  return (
    <Box
      className="page-container"
      id="redungeon-divindades"
      data-page="divindades"
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
            Divindades
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as divindades e constelações da campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_DIVINDADE)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Divindade
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
            universos={universos}
            universoValue={filtroUniverso}
            onUniversoChange={setFiltroUniverso}
            sortValue={ordenacao}
            onSortChange={setOrdenacao}
          />

          {divindadesFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                🔱
              </Typography>
              <Typography variant="body1">
                Nenhuma divindade encontrada
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
              {divindadesFiltradas.map(divindade => (
                <RacaCard key={divindade.id} elevation={0}>
                  <RacaImageFrame>
                    <RacaImageOverlay />
                    <RacaActionBar>
                      <Tooltip title="Visualizar detalhes">
                        <IconButton size="small" onClick={() => setDivindadeVisualizando(divindade)} sx={{ color: 'var(--text-secondary)', padding: '14px', minWidth: '16px', width: '16px', height: '16px', '&:hover': { color: 'var(--color-accent)' } }} aria-label={`Visualizar divindade ${divindade.nome}`}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {canWrite(divindade.universo) && (
                        <>
                          <IconButton size="small" onClick={() => navigate(ROUTE_PATHS.NOVA_DIVINDADE, { state: { divindade } })} sx={{ color: 'var(--color-accent)', padding: '4px', minWidth: '32px', width: '32px', height: '32px', '&:hover': { color: 'var(--color-accent)', opacity: 0.8 } }} aria-label={`Editar divindade ${divindade.nome}`}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => confirmDelete(divindade.nome, () => handleRemove(divindade.id))} sx={{ color: '#ef4444', padding: '4px', minWidth: '32px', width: '32px', height: '32px', '&:hover': { color: '#ef4444' } }} aria-label={`Remover divindade ${divindade.nome}`}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </RacaActionBar>

                    {divindade.linkImagem && (
                      <Box component="img" className="raca-card-image" src={divindade.linkImagem} alt={divindade.nome} onError={e => { e.currentTarget.style.display = 'none'; }} />
                    )}
                  </RacaImageFrame>

                  <RacaContent>
                    <RacaTitle variant="h6">{divindade.nome}</RacaTitle>

                    {divindade.cor && (
                      <RacaSubtitle variant="caption">
                        <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', background: divindade.cor, border: '1px solid var(--border-primary)', display: 'inline-block', verticalAlign: 'middle', mr: 1 }} />
                        {divindade.cor}
                      </RacaSubtitle>
                    )}

                    {divindade.descricao && <RacaDescription variant="body2">{divindade.descricao}</RacaDescription>}

                    <RacaFooter>
                      <CardTokens
                        items={[`📖 ${universos.find(u => u.id === divindade.universo)?.Nome || 'Universo Desconhecido'}`]}
                      />
                    </RacaFooter>
                  </RacaContent>
                </RacaCard>
              ))}
            </Box>
          )}
        </>
      )}

      {deleteConfirmationDialog}

      <EntityViewDialog
        open={Boolean(divindadeVisualizando)}
        onClose={() => setDivindadeVisualizando(null)}
        titulo={divindadeVisualizando?.nome}
        subtitulo={divindadeVisualizandoSubtitle}
        imagem={divindadeVisualizando?.linkImagem}
        imagemSx={{ height: 400, maxHeight: 400, objectPosition: 'center' }}
        actions={
          canWrite(divindadeVisualizando?.universo) && (
            <Button
              variant="contained"
              onClick={() => {
                navigate(ROUTE_PATHS.NOVA_DIVINDADE, {
                  state: { divindade: divindadeVisualizando },
                });
                setDivindadeVisualizando(null);
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
        {divindadeMetaItems.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <CardTokens items={divindadeMetaItems} maxVisible={2} />
          </Box>
        )}

        {divindadeVisualizando?.descricao && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: 'var(--color-accent)',
                fontWeight: 700,
                mb: 0.75,
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontSize: '0.72rem',
              }}
            >
              Descrição
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'var(--text-secondary)', lineHeight: 1.85 }}
            >
              {divindadeVisualizando.descricao}
            </Typography>
          </Box>
        )}
      </EntityViewDialog>
      {deleteConfirmationDialog}
    </Box>
  );
};

export default Divindades;
