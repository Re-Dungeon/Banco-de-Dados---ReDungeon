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
import { getVeiasAstrais, removeVeiaAstral } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { DIVINDADES_VEIAS_ASTRAIS } from 'common/constants/constants';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useUniversos from 'hooks/useUniversos';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
import { VeiaAstralCard } from './styles';

const VeiasAstrais = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: veiasAstrais,
    loading: loadingVeiasAstrais,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getVeiasAstrais, remove: removeVeiaAstral });
  const { universos, loadingUniversos } = useUniversos();
  const loading = loadingVeiasAstrais || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroDivindade, setFiltroDivindade] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [veiaAstralVisualizando, setVeiaAstralVisualizando] = useState(null);

  const veiasAstraisFiltradas = useMemo(() => {
    return veiasAstrais.filter(veiaAstral => {
      const matchNome =
        !filtroNome ||
        veiaAstral.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchDivindade =
        !filtroDivindade || veiaAstral.divindade === filtroDivindade;
      const matchUniverso =
        !filtroUniverso || veiaAstral.universo === filtroUniverso;
      return matchNome && matchDivindade && matchUniverso;
    });
  }, [veiasAstrais, filtroNome, filtroDivindade, filtroUniverso]);

  return (
    <Box
      className="page-container"
      id="redungeon-veias-astrais"
      data-page="veias-astrais"
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
            Veias Astrais
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as veias astrais concedidas pelas divindades e
            constelações.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_VEIA_ASTRAL)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Veia Astral
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
                label: 'Divindade/Constelação',
                value: filtroDivindade,
                onChange: setFiltroDivindade,
                options: DIVINDADES_VEIAS_ASTRAIS,
                allLabel: 'Todas',
              },
            ]}
            universos={universos}
            universoValue={filtroUniverso}
            onUniversoChange={setFiltroUniverso}
          />

          {veiasAstraisFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                🌌
              </Typography>
              <Typography variant="body1">
                Nenhuma veia astral encontrada
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
              {veiasAstraisFiltradas.map(veiaAstral => (
                <VeiaAstralCard key={veiaAstral.id} elevation={0}>
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
                        onClick={() => setVeiaAstralVisualizando(veiaAstral)}
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': { color: 'var(--color-accent)' },
                        }}
                        aria-label={`Visualizar veia astral ${veiaAstral.nome}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canWrite(veiaAstral.universo) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(ROUTE_PATHS.NOVA_VEIA_ASTRAL, {
                              state: { veiaAstral },
                            })
                          }
                          sx={{
                            color: 'var(--color-accent)',
                            '&:hover': {
                              color: 'var(--color-accent)',
                              opacity: 0.8,
                            },
                          }}
                          aria-label={`Editar veia astral ${veiaAstral.nome}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(veiaAstral.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': { color: '#ef4444' },
                          }}
                          aria-label={`Remover veia astral ${veiaAstral.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {veiaAstral.linkImagem && (
                    <Box
                      component="img"
                      src={veiaAstral.linkImagem}
                      alt={veiaAstral.nome}
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
                    {veiaAstral.nome}
                  </Typography>

                  {(veiaAstral.divindade || veiaAstral.nivel) && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {[
                        veiaAstral.divindade,
                        veiaAstral.nivel ? `Nível ${veiaAstral.nivel}` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  )}

                  {veiaAstral.custo && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-secondary)',
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      💠 {veiaAstral.custo}
                    </Typography>
                  )}

                  {veiaAstral.descricao && (
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
                      {veiaAstral.descricao}
                    </Typography>
                  )}
                </VeiaAstralCard>
              ))}
            </Box>
          )}
        </>
      )}

      <EntityViewDialog
        open={Boolean(veiaAstralVisualizando)}
        onClose={() => setVeiaAstralVisualizando(null)}
        titulo={veiaAstralVisualizando?.nome}
        subtitulo={
          (veiaAstralVisualizando?.divindade ||
            veiaAstralVisualizando?.nivel) &&
          [
            veiaAstralVisualizando.divindade,
            veiaAstralVisualizando.nivel
              ? `Nível ${veiaAstralVisualizando.nivel}`
              : null,
          ]
            .filter(Boolean)
            .join(' · ')
        }
        imagem={veiaAstralVisualizando?.linkImagem}
        imagemSx={{ height: 'auto', maxHeight: 220 }}
        actions={
          canWrite(veiaAstralVisualizando?.universo) && (
            <Button
              variant="contained"
              onClick={() => {
                navigate(ROUTE_PATHS.NOVA_VEIA_ASTRAL, {
                  state: { veiaAstral: veiaAstralVisualizando },
                });
                setVeiaAstralVisualizando(null);
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
        {veiaAstralVisualizando?.custo && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--text-muted)',
                display: 'block',
                mb: 0.3,
              }}
            >
              Custo
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
            >
              {veiaAstralVisualizando.custo}
            </Typography>
          </Box>
        )}

        {veiaAstralVisualizando?.descricao && (
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
              {veiaAstralVisualizando.descricao}
            </Typography>
          </>
        )}

        {veiaAstralVisualizando?.aprimoramento && (
          <>
            <Divider sx={{ borderColor: 'var(--border-primary)', mb: 1.5 }} />
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
              Aprimoramento
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              {veiaAstralVisualizando.aprimoramento}
            </Typography>
          </>
        )}
      </EntityViewDialog>
    </Box>
  );
};

export default VeiasAstrais;
