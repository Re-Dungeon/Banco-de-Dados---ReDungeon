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
import { getOrigens, removeOrigem } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { RARIDADES, TIPOS_ORIGEM } from 'common/constants/constants';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useDeleteConfirmation from 'hooks/useDeleteConfirmation';
import useUniversos from 'hooks/useUniversos';
import { ordenarPorNome, ORDEM_ASC } from 'common/utils/ordenacao';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
import { CAMPOS_POR_TIPO } from './utils';
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

const Origens = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: origens,
    loading: loadingOrigens,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getOrigens, remove: removeOrigem });
  const { universos, loadingUniversos } = useUniversos();
  const { confirmDelete, deleteConfirmationDialog } = useDeleteConfirmation();
  const loading = loadingOrigens || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroRaridade, setFiltroRaridade] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [ordenacao, setOrdenacao] = useState(ORDEM_ASC);
  const [origemVisualizando, setOrigemVisualizando] = useState(null);

  const origensFiltradas = useMemo(() => {
    const filtradas = origens.filter(origem => {
      const matchNome =
        !filtroNome ||
        origem.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchTipo = !filtroTipo || origem.tipo === filtroTipo;
      const matchRaridade =
        !filtroRaridade || origem.raridade === filtroRaridade;
      const matchUniverso =
        !filtroUniverso || origem.universo === filtroUniverso;
      return matchNome && matchTipo && matchRaridade && matchUniverso;
    });
    return ordenarPorNome(filtradas, ordenacao);
  }, [
    origens,
    filtroNome,
    filtroTipo,
    filtroRaridade,
    filtroUniverso,
    ordenacao,
  ]);

  return (
    <Box className="page-container" id="redungeon-origens" data-page="origens">
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
            Origens
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as origens, regiões e cenários da campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_ORIGEM)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Origem
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
                options: TIPOS_ORIGEM,
                allLabel: 'Todos',
              },
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
            sx={{
              gridTemplateColumns: {
                xs: '1fr',
                sm: '2fr 1fr 1fr 1fr',
                md: '2fr 1fr 1fr 1fr 1fr',
              },
            }}
          />

          {origensFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                🗺️
              </Typography>
              <Typography variant="body1">Nenhuma origem encontrada</Typography>
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
              {origensFiltradas.map(origem => (
                <RacaCard key={origem.id} elevation={0}>
                  <RacaImageFrame>
                    <RacaImageOverlay />
                    <RacaActionBar>
                      <Tooltip title="Visualizar detalhes">
                        <IconButton
                          size="small"
                          onClick={() => setOrigemVisualizando(origem)}
                          sx={{ color: 'var(--text-secondary)', padding: '14px', minWidth: '16px', width: '16px', height: '16px', '&:hover': { color: 'var(--color-accent)' } }}
                          aria-label={`Visualizar origem ${origem.nome}`}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {canWrite(origem.universo) && (
                        <>
                          <IconButton size="small" onClick={() => navigate(ROUTE_PATHS.NOVA_ORIGEM, { state: { origem } })} sx={{ color: 'var(--color-accent)', padding: '4px', minWidth: '32px', width: '32px', height: '32px', '&:hover': { color: 'var(--color-accent)', opacity: 0.8 } }} aria-label={`Editar origem ${origem.nome}`}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => confirmDelete(origem.nome, () => handleRemove(origem.id))} sx={{ color: '#ef4444', padding: '4px', minWidth: '32px', width: '32px', height: '32px', '&:hover': { color: '#ef4444' } }} aria-label={`Remover origem ${origem.nome}`}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </RacaActionBar>

                    {origem.linkImagem && (
                      <Box component="img" className="raca-card-image" src={origem.linkImagem} alt={origem.nome} onError={e => { e.currentTarget.style.display = 'none'; }} />
                    )}
                  </RacaImageFrame>

                  <RacaContent>
                    <RacaTitle variant="h6">{origem.nome}</RacaTitle>

                    {(origem.tipo || origem.raridade) && (
                      <RacaSubtitle variant="caption">{[origem.tipo, origem.raridade].filter(Boolean).join(' · ')}</RacaSubtitle>
                    )}

                    {origem.descricao && <RacaDescription variant="body2">{origem.descricao}</RacaDescription>}

                    <RacaFooter>
                      <CardTokens
                        items={[
                          `📖 ${universos.find(u => u.id === origem.universo)?.Nome || 'Universo Desconhecido'}`,
                          ...parseTags(origem.tags).map(tag => `🏷️ ${tag}`),
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
        open={Boolean(origemVisualizando)}
        onClose={() => setOrigemVisualizando(null)}
        titulo={origemVisualizando?.nome}
        subtitulo={
          (origemVisualizando?.tipo || origemVisualizando?.raridade) &&
          [origemVisualizando.tipo, origemVisualizando.raridade]
            .filter(Boolean)
            .join(' · ')
        }
        imagem={origemVisualizando?.linkImagem}
        imagemSx={{ height: 'auto', maxHeight: 220 }}
        actions={
          canWrite(origemVisualizando?.universo) && (
            <Button
              variant="contained"
              onClick={() => {
                navigate(ROUTE_PATHS.NOVA_ORIGEM, {
                  state: { origem: origemVisualizando },
                });
                setOrigemVisualizando(null);
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
        {parseTags(origemVisualizando?.tags).length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
            {parseTags(origemVisualizando.tags).map(tag => (
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

        {origemVisualizando?.descricao && (
          <>
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
              sx={{ color: 'var(--text-secondary)', mb: 2 }}
            >
              {origemVisualizando.descricao}
            </Typography>
          </>
        )}

        {(CAMPOS_POR_TIPO[origemVisualizando?.tipo] || []).filter(
          f => origemVisualizando[f.key],
        ).length > 0 && (
          <>
            <Divider sx={{ borderColor: 'var(--border-primary)', mb: 1.5 }} />
            {(CAMPOS_POR_TIPO[origemVisualizando?.tipo] || [])
              .filter(f => origemVisualizando[f.key])
              .map(f => (
                <Box key={f.key} sx={{ mb: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      display: 'block',
                      mb: 0.25,
                    }}
                  >
                    {f.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--text-secondary)' }}
                  >
                    {origemVisualizando[f.key]}
                  </Typography>
                </Box>
              ))}
          </>
        )}

        {((origemVisualizando?.reputacao?.fama?.length || 0) > 0 ||
          (origemVisualizando?.reputacao?.terror?.length || 0) > 0) && (
          <>
            <Divider sx={{ borderColor: 'var(--border-primary)', mb: 1.5 }} />
            <Typography
              variant="caption"
              sx={{
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                display: 'block',
                mb: 1,
              }}
            >
              Reputação
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mb: 1,
              }}
            >
              {['fama', 'terror'].map(tipoReputacao => (
                <Box key={tipoReputacao}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      mb: 0.5,
                      textTransform: 'capitalize',
                    }}
                  >
                    {tipoReputacao}
                  </Typography>
                  {(origemVisualizando.reputacao?.[tipoReputacao] || [])
                    .length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--text-muted)' }}
                    >
                      Nenhuma entrada
                    </Typography>
                  ) : (
                    origemVisualizando.reputacao[tipoReputacao].map(
                      (item, idx) => (
                        <Box key={idx} sx={{ mb: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{ color: 'var(--color-accent)' }}
                          >
                            {item.quantidade}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: 'var(--text-secondary)' }}
                          >
                            {item.efeito}
                          </Typography>
                        </Box>
                      ),
                    )
                  )}
                </Box>
              ))}
            </Box>
          </>
        )}
      </EntityViewDialog>
      {deleteConfirmationDialog}
    </Box>
  );
};

export default Origens;
