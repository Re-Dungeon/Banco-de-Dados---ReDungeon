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
import { getAptidoes, removeAptidao } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useUniversos from 'hooks/useUniversos';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
import { AptidaoCard } from './styles';

const Aptidoes = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: aptidoes,
    loading: loadingAptidoes,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getAptidoes, remove: removeAptidao });
  const { universos, loadingUniversos } = useUniversos();
  const loading = loadingAptidoes || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [aptidaoVisualizando, setAptidaoVisualizando] = useState(null);

  const aptidoesFiltradas = useMemo(() => {
    return aptidoes.filter(aptidao => {
      const matchNome =
        !filtroNome ||
        aptidao.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchUniverso =
        !filtroUniverso || aptidao.universo === filtroUniverso;
      return matchNome && matchUniverso;
    });
  }, [aptidoes, filtroNome, filtroUniverso]);

  return (
    <Box
      className="page-container"
      id="redungeon-aptidoes"
      data-page="aptidoes"
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
            Aptidões
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as aptidões disponíveis na campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_APTIDAO)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Aptidão
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

          {aptidoesFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                🎯
              </Typography>
              <Typography variant="body1">
                Nenhuma aptidão encontrada
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
              {aptidoesFiltradas.map(aptidao => (
                <AptidaoCard key={aptidao.id} elevation={0}>
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
                        onClick={() => setAptidaoVisualizando(aptidao)}
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': { color: 'var(--color-accent)' },
                        }}
                        aria-label={`Visualizar aptidão ${aptidao.nome}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canWrite(aptidao.universo) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(ROUTE_PATHS.NOVA_APTIDAO, {
                              state: { aptidao },
                            })
                          }
                          sx={{
                            color: 'var(--color-accent)',
                            '&:hover': {
                              color: 'var(--color-accent)',
                              opacity: 0.8,
                            },
                          }}
                          aria-label={`Editar aptidão ${aptidao.nome}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(aptidao.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': { color: '#ef4444' },
                          }}
                          aria-label={`Remover aptidão ${aptidao.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {aptidao.linkImagem && (
                    <Box
                      component="img"
                      src={aptidao.linkImagem}
                      alt={aptidao.nome}
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
                    {aptidao.nome}
                  </Typography>

                  {aptidao.nivelMaximo && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {`${universos.find(u => u.id === aptidao.universo)?.Nome || 'Universo Desconhecido'} — Nível Máx. ${aptidao.nivelMaximo}`}
                    </Typography>
                  )}
                </AptidaoCard>
              ))}
            </Box>
          )}
        </>
      )}

      <EntityViewDialog
        open={Boolean(aptidaoVisualizando)}
        onClose={() => setAptidaoVisualizando(null)}
        titulo={aptidaoVisualizando?.nome}
        subtitulo={
          aptidaoVisualizando?.nivelMaximo &&
          `${universos.find(u => u.id === aptidaoVisualizando?.universo)?.Nome || 'Universo Desconhecido'} — Nível Máx. ${aptidaoVisualizando.nivelMaximo}`
        }
        imagem={aptidaoVisualizando?.linkImagem}
      >
        {aptidaoVisualizando?.progressaoNiveis?.length > 0 && (
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
              Progressão de Níveis
            </Typography>
            {aptidaoVisualizando.progressaoNiveis.map((nivelItem, i) => {
              const bonusPreenchidos = (nivelItem.bonus || []).filter(
                b => b.descricaoCurta || b.descricaoCompleta,
              );
              if (bonusPreenchidos.length === 0) return null;
              return (
                <Box
                  key={i}
                  sx={{
                    mb: 1,
                    p: 1.5,
                    background: 'var(--bg-secondary)',
                    borderRadius: 1,
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    Nível {nivelItem.nivel ?? i + 1}
                  </Typography>
                  {bonusPreenchidos.map((b, bi) => (
                    <Box key={bi} sx={{ mb: 0.75 }}>
                      {b.descricaoCurta && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'var(--color-accent)',
                            fontWeight: 600,
                            display: 'block',
                          }}
                        >
                          • {b.descricaoCurta}
                        </Typography>
                      )}
                      {b.descricaoCompleta && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'var(--text-secondary)',
                            display: 'block',
                          }}
                        >
                          {b.descricaoCompleta}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              );
            })}
          </>
        )}
      </EntityViewDialog>
    </Box>
  );
};

export default Aptidoes;
