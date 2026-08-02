import React, { useMemo, useState } from 'react';
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
import { getReinosCultivo, removeReinoCultivo } from 'service/storage';
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

const ReinosCultivo = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: reinosCultivo,
    loading: loadingReinosCultivo,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getReinosCultivo, remove: removeReinoCultivo });
  const { universos, loadingUniversos } = useUniversos();
  const { confirmDelete, deleteConfirmationDialog } = useDeleteConfirmation();
  const loading = loadingReinosCultivo || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroSubUniverso, setFiltroSubUniverso] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [ordenacao, setOrdenacao] = useState(ORDEM_ASC);
  const [reinoCultivoVisualizando, setReinoCultivoVisualizando] =
    useState(null);

  const nomePorReinoId = useMemo(
    () => Object.fromEntries(reinosCultivo.map(r => [r.id, r.nome])),
    [reinosCultivo],
  );
  const getReinoAnteriorNome = reinoCultivo =>
    nomePorReinoId[reinoCultivo?.reinoAnterior] || '';
  const getUniversoNome = reinoCultivo =>
    universos.find(u => u.id === reinoCultivo?.universo)?.Nome ||
    'Universo Desconhecido';
  const opcoesSubUniverso = useMemo(
    () => [...new Set(reinosCultivo.map(r => r.subUniverso).filter(Boolean))],
    [reinosCultivo],
  );

  const reinosCultivoFiltrados = useMemo(() => {
    const filtrados = reinosCultivo.filter(reinoCultivo => {
      const matchNome =
        !filtroNome ||
        reinoCultivo.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchSubUniverso =
        !filtroSubUniverso || reinoCultivo.subUniverso === filtroSubUniverso;
      const matchUniverso =
        !filtroUniverso || reinoCultivo.universo === filtroUniverso;
      return matchNome && matchSubUniverso && matchUniverso;
    });
    return ordenarPorNome(filtrados, ordenacao);
  }, [reinosCultivo, filtroNome, filtroSubUniverso, filtroUniverso, ordenacao]);

  return (
    <Box
      className="page-container"
      id="redungeon-reinos-cultivo"
      data-page="reinos-cultivo"
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
            Reinos de Cultivo
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie os reinos de cultivo disponíveis na campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVO_REINO_CULTIVO)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Novo Reino de Cultivo
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
                label: 'Subuniverso',
                value: filtroSubUniverso,
                onChange: setFiltroSubUniverso,
                options: opcoesSubUniverso,
                allLabel: 'Todos',
              },
            ]}
            universos={universos}
            universoValue={filtroUniverso}
            onUniversoChange={setFiltroUniverso}
            sortValue={ordenacao}
            onSortChange={setOrdenacao}
          />

          {reinosCultivoFiltrados.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                🌀
              </Typography>
              <Typography variant="body1">
                Nenhum reino de cultivo encontrado
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
              {reinosCultivoFiltrados.map(reinoCultivo => (
                <RacaCard key={reinoCultivo.id} elevation={0}>
                  <RacaImageFrame>
                    {reinoCultivo.linkImagem && (
                      <Box
                        component="img"
                        className="raca-card-image"
                        src={reinoCultivo.linkImagem}
                        alt={reinoCultivo.nome}
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}

                    <RacaImageOverlay />

                    <RacaActionBar>
                      <Tooltip title="Visualizar detalhes">
                        <IconButton
                          size="small"
                          onClick={() => setReinoCultivoVisualizando(reinoCultivo)}
                          sx={{
                            color: 'var(--text-secondary)',
                            padding: '14px',
                            minWidth: '16px',
                            width: '16px',
                            height: '16px',
                            '&:hover': { color: 'var(--color-accent)' },
                          }}
                          aria-label={`Visualizar reino de cultivo ${reinoCultivo.nome}`}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {canWrite(reinoCultivo.universo) && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(ROUTE_PATHS.NOVO_REINO_CULTIVO, {
                                state: { reinoCultivo },
                              })
                            }
                            sx={{
                              color: 'var(--color-accent)',
                              padding: '4px',
                              minWidth: '32px',
                              width: '32px',
                              height: '32px',
                              '&:hover': { color: 'var(--color-accent)', opacity: 0.8 },
                            }}
                            aria-label={`Editar reino de cultivo ${reinoCultivo.nome}`}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => confirmDelete(reinoCultivo.nome, () => handleRemove(reinoCultivo.id))}
                            sx={{ color: '#ef4444', padding: '4px', minWidth: '32px', width: '32px', height: '32px', '&:hover': { color: '#ef4444' } }}
                            aria-label={`Remover reino de cultivo ${reinoCultivo.nome}`}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </RacaActionBar>
                  </RacaImageFrame>

                  <RacaContent>
                    <RacaTitle variant="h6">{reinoCultivo.nome}</RacaTitle>

                    <RacaSubtitle variant="caption">
                      {[getUniversoNome(reinoCultivo), reinoCultivo.subUniverso].filter(Boolean).join(' · ')}
                    </RacaSubtitle>

                    {(reinoCultivo.quantidadeSubReinos || reinoCultivo.experienciaPorSubReino) && (
                      <RacaDescription
                        variant="caption"
                        sx={{
                          color: 'var(--text-secondary)',
                          display: 'block',
                          mb: 0.5,
                          minHeight: 'auto',
                          lineHeight: 1.4,
                        }}
                      >
                        {[ 
                          reinoCultivo.quantidadeSubReinos ? `${reinoCultivo.quantidadeSubReinos} sub-reinos` : null,
                          reinoCultivo.experienciaPorSubReino ? `${reinoCultivo.experienciaPorSubReino} XP/sub-reino` : null,
                        ].filter(Boolean).join(' · ')}
                      </RacaDescription>
                    )}

                    {reinoCultivo.descricao && (
                      <RacaDescription variant="body2" sx={{ mt: 0.001 }}>
                        {reinoCultivo.descricao}
                      </RacaDescription>
                    )}

                    <RacaFooter>
                      <CardTokens
                        items={[
                          `📖 ${getUniversoNome(reinoCultivo)}`,
                          ...(reinoCultivo.subUniverso ? [`🌱 ${reinoCultivo.subUniverso}`] : []),
                          ...(reinoCultivo.reinoAnterior ? [`🔗 ${getReinoAnteriorNome(reinoCultivo)}`] : []),
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
        open={Boolean(reinoCultivoVisualizando)}
        onClose={() => setReinoCultivoVisualizando(null)}
        titulo={reinoCultivoVisualizando?.nome}
        subtitulo={
          reinoCultivoVisualizando &&
          [
            getUniversoNome(reinoCultivoVisualizando),
            reinoCultivoVisualizando.subUniverso,
          ]
            .filter(Boolean)
            .join(' · ')
        }
        imagem={reinoCultivoVisualizando?.linkImagem}
        imagemSx={{ height: 'auto', maxHeight: 220 }}
        descricao={reinoCultivoVisualizando?.descricao}
        actions={
          canWrite(reinoCultivoVisualizando?.universo) && (
            <Button
              variant="contained"
              onClick={() => {
                navigate(ROUTE_PATHS.NOVO_REINO_CULTIVO, {
                  state: { reinoCultivo: reinoCultivoVisualizando },
                });
                setReinoCultivoVisualizando(null);
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
        {(reinoCultivoVisualizando?.quantidadeSubReinos ||
          reinoCultivoVisualizando?.experienciaPorSubReino) && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 1,
              mb: 2,
            }}
          >
            {reinoCultivoVisualizando?.quantidadeSubReinos && (
              <Box
                sx={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 1,
                  p: 1,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: 'var(--text-muted)', display: 'block' }}
                >
                  Sub-Reinos
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                >
                  {reinoCultivoVisualizando.quantidadeSubReinos}
                </Typography>
              </Box>
            )}
            {reinoCultivoVisualizando?.experienciaPorSubReino && (
              <Box
                sx={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 1,
                  p: 1,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: 'var(--text-muted)', display: 'block' }}
                >
                  Exp. por Sub-Reino
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                >
                  {reinoCultivoVisualizando.experienciaPorSubReino}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {reinoCultivoVisualizando?.reinoAnterior && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--text-muted)',
                display: 'block',
                mb: 0.3,
              }}
            >
              Reino Anterior
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
            >
              {getReinoAnteriorNome(reinoCultivoVisualizando)}
            </Typography>
          </Box>
        )}
      </EntityViewDialog>
      {deleteConfirmationDialog}
    </Box>
  );
};

export default ReinosCultivo;
