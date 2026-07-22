import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { getMateriais, removeMaterial } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { RARIDADES } from 'common/constants/constants';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useUniversos from 'hooks/useUniversos';
import { ordenarPorNome, ORDEM_ASC } from 'common/utils/ordenacao';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
import { MaterialCard } from './styles';

const Materiais = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: materiais,
    loading: loadingMateriais,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getMateriais, remove: removeMaterial });
  const { universos, loadingUniversos } = useUniversos();
  const loading = loadingMateriais || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroRaridade, setFiltroRaridade] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [ordenacao, setOrdenacao] = useState(ORDEM_ASC);
  const [materialVisualizando, setMaterialVisualizando] = useState(null);

  const materiaisFiltrados = useMemo(() => {
    const filtrados = materiais.filter(material => {
      const matchNome =
        !filtroNome ||
        material.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchRaridade =
        !filtroRaridade || material.raridade === filtroRaridade;
      const matchUniverso =
        !filtroUniverso || material.universo === filtroUniverso;
      return matchNome && matchRaridade && matchUniverso;
    });
    return ordenarPorNome(filtrados, ordenacao);
  }, [materiais, filtroNome, filtroRaridade, filtroUniverso, ordenacao]);

  return (
    <Box
      className="page-container"
      id="redungeon-materiais"
      data-page="materiais"
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
            Materiais
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie os materiais disponíveis na campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVO_MATERIAL)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Novo Material
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

          {materiaisFiltrados.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                💎
              </Typography>
              <Typography variant="body1">
                Nenhum material encontrado
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
              {materiaisFiltrados.map(material => (
                <MaterialCard key={material.id} elevation={0}>
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
                        onClick={() => setMaterialVisualizando(material)}
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': { color: 'var(--color-accent)' },
                        }}
                        aria-label={`Visualizar material ${material.nome}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canWrite(material.universo) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(ROUTE_PATHS.NOVO_MATERIAL, {
                              state: { material },
                            })
                          }
                          sx={{
                            color: 'var(--color-accent)',
                            '&:hover': {
                              color: 'var(--color-accent)',
                              opacity: 0.8,
                            },
                          }}
                          aria-label={`Editar material ${material.nome}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(material.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': { color: '#ef4444' },
                          }}
                          aria-label={`Remover material ${material.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {material.linkImagem && (
                    <Box
                      component="img"
                      src={material.linkImagem}
                      alt={material.nome}
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
                    {material.nome}
                  </Typography>

                  {(material.raridade || material.tipo) && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {[material.tipo, material.raridade]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  )}

                  {(material.valorMercado || material.quantidadeBase) && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      {material.valorMercado && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'var(--text-secondary)' }}
                        >
                          💰 {material.valorMercado}
                        </Typography>
                      )}
                      {material.quantidadeBase && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'var(--text-secondary)' }}
                        >
                          📦 {material.quantidadeBase}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {(material.pureza !== undefined ||
                    material.taxaDrop !== undefined) && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      {material.pureza !== undefined && (
                        <Box>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 0.3,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: 'var(--text-muted)' }}
                            >
                              Pureza
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'var(--color-accent)' }}
                            >
                              {material.pureza}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={material.pureza}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              background: 'var(--border-primary)',
                              '& .MuiLinearProgress-bar': {
                                background: 'var(--color-accent)',
                              },
                            }}
                          />
                        </Box>
                      )}
                      {material.taxaDrop !== undefined && (
                        <Box>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 0.3,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: 'var(--text-muted)' }}
                            >
                              Taxa de Drop
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'var(--color-accent)' }}
                            >
                              {material.taxaDrop}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={material.taxaDrop}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              background: 'var(--border-primary)',
                              '& .MuiLinearProgress-bar': {
                                background: '#a855f7',
                              },
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  )}

                  {material.descricao && (
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
                      {material.descricao}
                    </Typography>
                  )}
                </MaterialCard>
              ))}
            </Box>
          )}
        </>
      )}

      <EntityViewDialog
        open={Boolean(materialVisualizando)}
        onClose={() => setMaterialVisualizando(null)}
        titulo={materialVisualizando?.nome}
        subtitulo={
          materialVisualizando?.raridade &&
          [materialVisualizando.tipo, materialVisualizando.raridade]
            .filter(Boolean)
            .join(' · ')
        }
        imagem={materialVisualizando?.linkImagem}
        imagemSx={{ height: 'auto', maxHeight: 220 }}
        actions={
          canWrite(materialVisualizando?.universo) && (
            <Button
              variant="contained"
              onClick={() => {
                navigate(ROUTE_PATHS.NOVO_MATERIAL, {
                  state: { material: materialVisualizando },
                });
                setMaterialVisualizando(null);
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
        {(materialVisualizando?.valorMercado ||
          materialVisualizando?.quantidadeBase) && (
          <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
            {materialVisualizando.valorMercado && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--text-muted)',
                    display: 'block',
                    mb: 0.3,
                  }}
                >
                  Valor de Mercado
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                >
                  {materialVisualizando.valorMercado}
                </Typography>
              </Box>
            )}
            {materialVisualizando.quantidadeBase && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--text-muted)',
                    display: 'block',
                    mb: 0.3,
                  }}
                >
                  Quantidade Base
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                >
                  {materialVisualizando.quantidadeBase}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {(materialVisualizando?.pureza !== undefined ||
          materialVisualizando?.taxaDrop !== undefined) && (
          <Box
            sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}
          >
            <Divider sx={{ borderColor: 'var(--border-primary)' }} />
            {materialVisualizando.pureza !== undefined && (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}
                  >
                    Pureza
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--color-accent)', fontWeight: 700 }}
                  >
                    {materialVisualizando.pureza}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={materialVisualizando.pureza}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    background: 'var(--border-primary)',
                    '& .MuiLinearProgress-bar': {
                      background: 'var(--color-accent)',
                    },
                  }}
                />
              </Box>
            )}
            {materialVisualizando.taxaDrop !== undefined && (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}
                  >
                    Taxa de Drop
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: '#a855f7', fontWeight: 700 }}
                  >
                    {materialVisualizando.taxaDrop}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={materialVisualizando.taxaDrop}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    background: 'var(--border-primary)',
                    '& .MuiLinearProgress-bar': { background: '#a855f7' },
                  }}
                />
              </Box>
            )}
          </Box>
        )}

        {materialVisualizando?.descricao && (
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
              Descrição
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              {materialVisualizando.descricao}
            </Typography>
          </>
        )}

        {materialVisualizando?.propriedades && (
          <>
            <Divider
              sx={{ borderColor: 'var(--border-primary)', mt: 1.5, mb: 1.5 }}
            />
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
              Propriedades
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              {materialVisualizando.propriedades}
            </Typography>
          </>
        )}
      </EntityViewDialog>
    </Box>
  );
};

export default Materiais;
