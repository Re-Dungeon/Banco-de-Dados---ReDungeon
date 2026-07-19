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
import useUniversos from 'hooks/useUniversos';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
import { DivindadeCard } from './styles';

const Divindades = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: divindades,
    loading: loadingDivindades,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getDivindades, remove: removeDivindade });
  const { universos, loadingUniversos } = useUniversos();
  const loading = loadingDivindades || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [divindadeVisualizando, setDivindadeVisualizando] = useState(null);

  const divindadesFiltradas = useMemo(() => {
    return divindades.filter(divindade => {
      const matchNome =
        !filtroNome ||
        divindade.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchUniverso =
        !filtroUniverso || divindade.universo === filtroUniverso;
      return matchNome && matchUniverso;
    });
  }, [divindades, filtroNome, filtroUniverso]);

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
                <DivindadeCard key={divindade.id} elevation={0}>
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
                        onClick={() => setDivindadeVisualizando(divindade)}
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': { color: 'var(--color-accent)' },
                        }}
                        aria-label={`Visualizar divindade ${divindade.nome}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canWrite(divindade.universo) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(ROUTE_PATHS.NOVA_DIVINDADE, {
                              state: { divindade },
                            })
                          }
                          sx={{
                            color: 'var(--color-accent)',
                            '&:hover': {
                              color: 'var(--color-accent)',
                              opacity: 0.8,
                            },
                          }}
                          aria-label={`Editar divindade ${divindade.nome}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(divindade.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': { color: '#ef4444' },
                          }}
                          aria-label={`Remover divindade ${divindade.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {divindade.linkImagem && (
                    <Box
                      component="img"
                      src={divindade.linkImagem}
                      alt={divindade.nome}
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
                    {divindade.nome}
                  </Typography>

                  {divindade.descricao && (
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
                      {divindade.descricao}
                    </Typography>
                  )}
                </DivindadeCard>
              ))}
            </Box>
          )}
        </>
      )}

      <EntityViewDialog
        open={Boolean(divindadeVisualizando)}
        onClose={() => setDivindadeVisualizando(null)}
        titulo={divindadeVisualizando?.nome}
        imagem={divindadeVisualizando?.linkImagem}
        imagemSx={{ height: 'auto', maxHeight: 220 }}
        descricao={divindadeVisualizando?.descricao}
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
      />
    </Box>
  );
};

export default Divindades;
