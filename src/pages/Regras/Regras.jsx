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
import { getRegras, removeRegra } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import {
  CATEGORIAS_REGRA,
  COMPLEXIDADES_REGRA,
} from 'common/constants/constants';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useUniversos from 'hooks/useUniversos';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
import { RegraCard } from './styles';

const CAMPOS_FUNCIONAMENTO = [
  { key: 'comoFunciona', label: 'Como Funciona' },
  { key: 'dadosUtilizados', label: 'Dados Utilizados' },
  { key: 'sucesso', label: 'Sucesso' },
  { key: 'falha', label: 'Falha' },
];

const CAMPOS_RESTRICOES = [
  { key: 'custo', label: 'Custo' },
  { key: 'limite', label: 'Limite' },
  { key: 'requisitos', label: 'Requisitos' },
];

const Regras = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: regras,
    loading: loadingRegras,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getRegras, remove: removeRegra });
  const { universos, loadingUniversos } = useUniversos();
  const loading = loadingRegras || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroComplexidade, setFiltroComplexidade] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [regraVisualizando, setRegraVisualizando] = useState(null);

  const regrasFiltradas = useMemo(() => {
    return regras.filter(regra => {
      const matchNome =
        !filtroNome ||
        regra.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchCategoria =
        !filtroCategoria || regra.categoria === filtroCategoria;
      const matchComplexidade =
        !filtroComplexidade || regra.complexidade === filtroComplexidade;
      const matchUniverso =
        !filtroUniverso || regra.universo === filtroUniverso;
      return matchNome && matchCategoria && matchComplexidade && matchUniverso;
    });
  }, [regras, filtroNome, filtroCategoria, filtroComplexidade, filtroUniverso]);

  return (
    <Box className="page-container" id="redungeon-regras" data-page="regras">
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
            Regras
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Consulte e customize as regras do seu jogo.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_REGRA)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Regra
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
                label: 'Categoria',
                value: filtroCategoria,
                onChange: setFiltroCategoria,
                options: CATEGORIAS_REGRA,
                allLabel: 'Todas',
              },
              {
                label: 'Complexidade',
                value: filtroComplexidade,
                onChange: setFiltroComplexidade,
                options: COMPLEXIDADES_REGRA,
                allLabel: 'Todas',
              },
            ]}
            universos={universos}
            universoValue={filtroUniverso}
            onUniversoChange={setFiltroUniverso}
            sx={{
              gridTemplateColumns: {
                xs: '1fr',
                sm: '2fr 1fr 1fr',
                md: '2fr 1fr 1fr 1fr',
              },
            }}
          />

          {regrasFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                📋
              </Typography>
              <Typography variant="body1">Nenhuma regra encontrada</Typography>
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
              {regrasFiltradas.map(regra => (
                <RegraCard key={regra.id} elevation={0}>
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
                        onClick={() => setRegraVisualizando(regra)}
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': { color: 'var(--color-accent)' },
                        }}
                        aria-label={`Visualizar regra ${regra.nome}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canWrite(regra.universo) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(ROUTE_PATHS.NOVA_REGRA, {
                              state: { regra },
                            })
                          }
                          sx={{
                            color: 'var(--color-accent)',
                            '&:hover': {
                              color: 'var(--color-accent)',
                              opacity: 0.8,
                            },
                          }}
                          aria-label={`Editar regra ${regra.nome}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(regra.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': { color: '#ef4444' },
                          }}
                          aria-label={`Remover regra ${regra.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {regra.linkImagem && (
                    <Box
                      component="img"
                      src={regra.linkImagem}
                      alt={regra.nome}
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
                    {regra.nome}
                  </Typography>

                  {(regra.categoria || regra.complexidade) && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'block',
                        mb: regra.tipo ? 0.25 : 1,
                      }}
                    >
                      {[regra.categoria, regra.complexidade]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  )}

                  {regra.tipo && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-muted)',
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {regra.tipo}
                    </Typography>
                  )}

                  {regra.descricaoCurta && (
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
                      {regra.descricaoCurta}
                    </Typography>
                  )}
                </RegraCard>
              ))}
            </Box>
          )}
        </>
      )}

      <EntityViewDialog
        open={Boolean(regraVisualizando)}
        onClose={() => setRegraVisualizando(null)}
        titulo={regraVisualizando?.nome}
        subtitulo={
          (regraVisualizando?.categoria || regraVisualizando?.complexidade) &&
          [regraVisualizando.categoria, regraVisualizando.complexidade]
            .filter(Boolean)
            .join(' · ')
        }
        imagem={regraVisualizando?.linkImagem}
        imagemSx={{ height: 'auto', maxHeight: 220 }}
        actions={
          canWrite(regraVisualizando?.universo) && (
            <Button
              variant="contained"
              onClick={() => {
                navigate(ROUTE_PATHS.NOVA_REGRA, {
                  state: { regra: regraVisualizando },
                });
                setRegraVisualizando(null);
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
        {regraVisualizando?.descricaoCurta && (
          <Typography
            variant="body2"
            sx={{
              color: 'var(--text-primary)',
              fontWeight: 600,
              mb: 2,
              fontStyle: 'italic',
            }}
          >
            {regraVisualizando.descricaoCurta}
          </Typography>
        )}

        {regraVisualizando?.explicacaoCompleta && (
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
              Explicação Completa
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'var(--text-secondary)', mb: 2 }}
            >
              {regraVisualizando.explicacaoCompleta}
            </Typography>
          </>
        )}

        {CAMPOS_FUNCIONAMENTO.filter(f => regraVisualizando?.[f.key]).length >
          0 && (
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
              Funcionamento
            </Typography>
            {CAMPOS_FUNCIONAMENTO.filter(f => regraVisualizando[f.key]).map(
              f => (
                <Box key={f.key} sx={{ mb: 1.25 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'var(--text-muted)',
                      display: 'block',
                      fontSize: '0.7rem',
                    }}
                  >
                    {f.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--text-secondary)' }}
                  >
                    {regraVisualizando[f.key]}
                  </Typography>
                </Box>
              ),
            )}
          </>
        )}

        {CAMPOS_RESTRICOES.filter(f => regraVisualizando?.[f.key]).length >
          0 && (
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
              Restrições
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.75,
                mb: 2,
              }}
            >
              {CAMPOS_RESTRICOES.filter(f => regraVisualizando[f.key]).map(
                f => (
                  <Box
                    key={f.key}
                    sx={{
                      background: 'var(--bg-secondary)',
                      borderRadius: 1,
                      px: 1,
                      py: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-muted)',
                        display: 'block',
                        fontSize: '0.65rem',
                      }}
                    >
                      {f.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                    >
                      {regraVisualizando[f.key]}
                    </Typography>
                  </Box>
                ),
              )}
            </Box>
          </>
        )}

        {regraVisualizando?.exemplo && (
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
              Exemplo
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}
            >
              {regraVisualizando.exemplo}
            </Typography>
          </>
        )}
      </EntityViewDialog>
    </Box>
  );
};

export default Regras;
