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
import useUniversos from 'hooks/useUniversos';
import { ordenarPorNome, ORDEM_ASC } from 'common/utils/ordenacao';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
import { CondicaoCard } from './styles';
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
            Condições
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as condições disponíveis na campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_CONDICAO)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Condição
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
              {condicoesFiltradas.map(condicao => (
                <CondicaoCard key={condicao.id} elevation={0}>
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
                        onClick={() => setCondicaoVisualizando(condicao)}
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': { color: 'var(--color-accent)' },
                        }}
                        aria-label={`Visualizar condição ${condicao.nome}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canWrite(getCondicaoUniversos(condicao)) && (
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
                          onClick={() => handleRemove(condicao.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': { color: '#ef4444' },
                          }}
                          aria-label={`Remover condição ${condicao.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {condicao.linkImagem && (
                    <Box
                      component="img"
                      src={condicao.linkImagem}
                      alt={condicao.nome}
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
                    {condicao.nome}
                  </Typography>

                  {(condicao.raridade || condicao.duracao) && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {[condicao.raridade, condicao.duracao]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  )}

                  {condicao.descricao && (
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
                      {condicao.descricao}
                    </Typography>
                  )}

                  {(condicao.efeitos?.filter(Boolean).length > 0 ||
                    condicao.interacoes?.filter(Boolean).length > 0) && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-muted)',
                        mt: 1,
                        display: 'block',
                      }}
                    >
                      {condicao.efeitos?.filter(Boolean).length > 0 &&
                        `${condicao.efeitos.filter(Boolean).length} efeito${condicao.efeitos.filter(Boolean).length !== 1 ? 's' : ''}`}
                      {condicao.efeitos?.filter(Boolean).length > 0 &&
                        condicao.interacoes?.filter(Boolean).length > 0 &&
                        ' · '}
                      {condicao.interacoes?.filter(Boolean).length > 0 &&
                        `${condicao.interacoes.filter(Boolean).length} interação${condicao.interacoes.filter(Boolean).length !== 1 ? 'ões' : ''}`}
                    </Typography>
                  )}
                </CondicaoCard>
              ))}
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
                '&:hover': { background: '#5a2090' },
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
    </Box>
  );
};

export default Condicoes;
