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
import { getArtes, removeArte } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { TIPOS_ARTE, CLASSIFICACOES_ARTE } from 'common/constants/constants';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useUniversos from 'hooks/useUniversos';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
import { ArteCard } from './styles';

const META_FIELDS = [
  { key: 'recarga', label: 'Recarga' },
  { key: 'acao', label: 'Ação' },
  { key: 'duracao', label: 'Duração' },
  { key: 'alcance', label: 'Alcance' },
  { key: 'alvos', label: 'Alvos' },
  { key: 'custo', label: 'Custo' },
  { key: 'dados', label: 'Dados' },
  { key: 'circuloMagico', label: 'Círculo Mágico' },
];

const Artes = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: artes,
    loading: loadingArtes,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getArtes, remove: removeArte });
  const { universos, loadingUniversos } = useUniversos();
  const loading = loadingArtes || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroClassificacao, setFiltroClassificacao] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [arteVisualizando, setArteVisualizando] = useState(null);

  const artesFiltradas = useMemo(() => {
    return artes.filter(arte => {
      const matchNome =
        !filtroNome ||
        arte.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchTipo = !filtroTipo || arte.tipo === filtroTipo;
      const matchClassificacao =
        !filtroClassificacao || arte.classificacao === filtroClassificacao;
      const matchUniverso = !filtroUniverso || arte.universo === filtroUniverso;
      return matchNome && matchTipo && matchClassificacao && matchUniverso;
    });
  }, [artes, filtroNome, filtroTipo, filtroClassificacao, filtroUniverso]);

  return (
    <Box className="page-container" id="redungeon-artes" data-page="artes">
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
            Artes
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as artes marciais e habilidades especiais da campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_ARTE)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Arte
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
                options: TIPOS_ARTE,
                allLabel: 'Todos',
              },
              {
                label: 'Classificação',
                value: filtroClassificacao,
                onChange: setFiltroClassificacao,
                options: CLASSIFICACOES_ARTE,
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

          {artesFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                🥋
              </Typography>
              <Typography variant="body1">Nenhuma arte encontrada</Typography>
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
              {artesFiltradas.map(arte => (
                <ArteCard key={arte.id} elevation={0}>
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
                        onClick={() => setArteVisualizando(arte)}
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': { color: 'var(--color-accent)' },
                        }}
                        aria-label={`Visualizar arte ${arte.nome}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canWrite(arte.universo) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(ROUTE_PATHS.NOVA_ARTE, {
                              state: { arte },
                            })
                          }
                          sx={{
                            color: 'var(--color-accent)',
                            '&:hover': {
                              color: 'var(--color-accent)',
                              opacity: 0.8,
                            },
                          }}
                          aria-label={`Editar arte ${arte.nome}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(arte.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': { color: '#ef4444' },
                          }}
                          aria-label={`Remover arte ${arte.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {arte.linkImagem && (
                    <Box
                      component="img"
                      src={arte.linkImagem}
                      alt={arte.nome}
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
                    {arte.nome}
                  </Typography>

                  {(arte.tipo || arte.classificacao) && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {[arte.tipo, arte.classificacao]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  )}

                  {META_FIELDS.filter(f => arte[f.key]).length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.75,
                        mb: 1,
                      }}
                    >
                      {META_FIELDS.filter(f => arte[f.key]).map(f => (
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
                            variant="caption"
                            sx={{
                              color: 'var(--text-primary)',
                              fontWeight: 600,
                            }}
                          >
                            {arte[f.key]}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {arte.descricao && (
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
                      {arte.descricao}
                    </Typography>
                  )}

                  {arte.condicoesAplicadas?.length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        mt: 1,
                      }}
                    >
                      {arte.condicoesAplicadas.map(c => (
                        <Chip
                          key={c.id}
                          label={c.nome}
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
                </ArteCard>
              ))}
            </Box>
          )}
        </>
      )}

      <EntityViewDialog
        open={Boolean(arteVisualizando)}
        onClose={() => setArteVisualizando(null)}
        titulo={arteVisualizando?.nome}
        subtitulo={
          (arteVisualizando?.tipo || arteVisualizando?.classificacao) &&
          [arteVisualizando.tipo, arteVisualizando.classificacao]
            .filter(Boolean)
            .join(' · ')
        }
        imagem={arteVisualizando?.linkImagem}
        imagemSx={{ height: 'auto', maxHeight: 220 }}
        actions={
          canWrite(arteVisualizando?.universo) && (
            <Button
              variant="contained"
              onClick={() => {
                navigate(ROUTE_PATHS.NOVA_ARTE, {
                  state: { arte: arteVisualizando },
                });
                setArteVisualizando(null);
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
        {META_FIELDS.filter(f => arteVisualizando?.[f.key]).length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
            {META_FIELDS.filter(f => arteVisualizando?.[f.key]).map(f => (
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
                  {arteVisualizando[f.key]}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {arteVisualizando?.descricao && (
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
            <Typography
              variant="body2"
              sx={{ color: 'var(--text-secondary)', mb: 2 }}
            >
              {arteVisualizando.descricao}
            </Typography>
          </>
        )}

        {arteVisualizando?.cantico && (
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
              Cântico
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--text-secondary)',
                mb: 2,
                fontStyle: 'italic',
              }}
            >
              {arteVisualizando.cantico}
            </Typography>
          </>
        )}

        {arteVisualizando?.condicoesAplicadas?.length > 0 && (
          <>
            <Divider sx={{ borderColor: 'var(--border-primary)', mb: 1.5 }} />
            <Typography
              variant="caption"
              sx={{
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                display: 'block',
                mb: 0.75,
              }}
            >
              Condições Aplicadas
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {arteVisualizando.condicoesAplicadas.map(c => (
                <Chip
                  key={c.id}
                  label={c.nome}
                  size="small"
                  sx={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-primary)',
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </EntityViewDialog>
    </Box>
  );
};

export default Artes;
