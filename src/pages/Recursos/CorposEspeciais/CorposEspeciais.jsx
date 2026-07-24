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
import { getCorposEspeciais, removeCorpoEspecial } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useUniversos from 'hooks/useUniversos';
import { ordenarPorNome, ORDEM_ASC } from 'common/utils/ordenacao';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
import { CorpoEspecialCard } from './styles';

const CorposEspeciais = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: corposEspeciais,
    loading: loadingCorposEspeciais,
    remove: handleRemove,
  } = useEntityCRUD({
    getAll: getCorposEspeciais,
    remove: removeCorpoEspecial,
  });
  const { universos, loadingUniversos } = useUniversos();
  const loading = loadingCorposEspeciais || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [ordenacao, setOrdenacao] = useState(ORDEM_ASC);
  const [corpoEspecialVisualizando, setCorpoEspecialVisualizando] =
    useState(null);

  const corposEspeciaisFiltrados = useMemo(() => {
    const filtrados = corposEspeciais.filter(corpoEspecial => {
      const matchNome =
        !filtroNome ||
        corpoEspecial.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchUniverso =
        !filtroUniverso || corpoEspecial.universo === filtroUniverso;
      return matchNome && matchUniverso;
    });
    return ordenarPorNome(filtrados, ordenacao);
  }, [corposEspeciais, filtroNome, filtroUniverso, ordenacao]);

  return (
    <Box
      className="page-container"
      id="redungeon-corpos-especiais"
      data-page="corpos-especiais"
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
            Corpos Especiais
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie os corpos especiais disponíveis na campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVO_CORPO_ESPECIAL)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Novo Corpo Especial
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

          {corposEspeciaisFiltrados.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                🧍
              </Typography>
              <Typography variant="body1">
                Nenhum corpo especial encontrado
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
              {corposEspeciaisFiltrados.map(corpoEspecial => (
                <CorpoEspecialCard key={corpoEspecial.id} elevation={0}>
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
                        onClick={() =>
                          setCorpoEspecialVisualizando(corpoEspecial)
                        }
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': { color: 'var(--color-accent)' },
                        }}
                        aria-label={`Visualizar corpo especial ${corpoEspecial.nome}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canWrite(corpoEspecial.universo) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(ROUTE_PATHS.NOVO_CORPO_ESPECIAL, {
                              state: { corpoEspecial },
                            })
                          }
                          sx={{
                            color: 'var(--color-accent)',
                            '&:hover': {
                              color: 'var(--color-accent)',
                              opacity: 0.8,
                            },
                          }}
                          aria-label={`Editar corpo especial ${corpoEspecial.nome}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(corpoEspecial.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': { color: '#ef4444' },
                          }}
                          aria-label={`Remover corpo especial ${corpoEspecial.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {corpoEspecial.linkImagem && (
                    <Box
                      component="img"
                      src={corpoEspecial.linkImagem}
                      alt={corpoEspecial.nome}
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
                    {corpoEspecial.nome}
                  </Typography>

                  {corpoEspecial.universo && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {universos.find(u => u.id === corpoEspecial.universo)
                        ?.Nome || 'Universo Desconhecido'}
                    </Typography>
                  )}

                  {corpoEspecial.descricao && (
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
                      {corpoEspecial.descricao}
                    </Typography>
                  )}
                </CorpoEspecialCard>
              ))}
            </Box>
          )}
        </>
      )}

      <EntityViewDialog
        open={Boolean(corpoEspecialVisualizando)}
        onClose={() => setCorpoEspecialVisualizando(null)}
        titulo={corpoEspecialVisualizando?.nome}
        subtitulo={
          universos.find(u => u.id === corpoEspecialVisualizando?.universo)
            ?.Nome
        }
        imagem={corpoEspecialVisualizando?.linkImagem}
        descricao={corpoEspecialVisualizando?.descricao}
      >
        {corpoEspecialVisualizando?.bonus?.filter(Boolean).length > 0 && (
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
              Bônus
            </Typography>
            {corpoEspecialVisualizando.bonus.filter(Boolean).map((b, i) => (
              <Typography
                key={`${b}-${i}`}
                variant="body2"
                sx={{ color: 'var(--text-secondary)', mb: 0.5 }}
              >
                • {b}
              </Typography>
            ))}
          </>
        )}
      </EntityViewDialog>
    </Box>
  );
};

export default CorposEspeciais;
