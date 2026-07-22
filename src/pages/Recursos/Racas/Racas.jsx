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
import { getRacas, removeRaca } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { RARIDADES } from 'common/constants/constants';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useUniversos from 'hooks/useUniversos';
import { ordenarPorNome, ORDEM_ASC } from 'common/utils/ordenacao';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
import { RacaCard } from './styles';

const ATRIBUTO_LABELS = {
  forca: 'Força',
  vitalidade: 'Vitalidade',
  agilidade: 'Agilidade',
  inteligencia: 'Inteligência',
  percepcao: 'Percepção',
  sorte: 'Sorte',
  limiteMaximoAtributo: 'Limite Máx.',
};

const HAB_META_FIELDS = [
  { key: 'alvo', label: 'Alvo' },
  { key: 'alcance', label: 'Alcance' },
  { key: 'custo', label: 'Custo' },
  { key: 'recarga', label: 'Recarga' },
  { key: 'duracao', label: 'Duração' },
  { key: 'dados', label: 'Dados' },
];

const Racas = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: racas,
    loading: loadingRacas,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getRacas, remove: removeRaca });
  const { universos, loadingUniversos } = useUniversos();
  const loading = loadingRacas || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroRaridade, setFiltroRaridade] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [ordenacao, setOrdenacao] = useState(ORDEM_ASC);
  const [racaVisualizando, setRacaVisualizando] = useState(null);

  const racasFiltradas = useMemo(() => {
    const filtradas = racas.filter(raca => {
      const matchNome =
        !filtroNome ||
        raca.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchRaridade = !filtroRaridade || raca.raridade === filtroRaridade;
      const matchUniverso = !filtroUniverso || raca.universo === filtroUniverso;
      return matchNome && matchRaridade && matchUniverso;
    });
    return ordenarPorNome(filtradas, ordenacao);
  }, [racas, filtroNome, filtroRaridade, filtroUniverso, ordenacao]);

  return (
    <Box className="page-container" id="redungeon-racas" data-page="racas">
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
            Raças
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as raças disponíveis na campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_RACA)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Raça
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

          {racasFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                🧝‍♂️
              </Typography>
              <Typography variant="body1">Nenhuma raça encontrada</Typography>
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
              {racasFiltradas.map(raca => (
                <RacaCard key={raca.id} elevation={0}>
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
                        onClick={() => setRacaVisualizando(raca)}
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': { color: 'var(--color-accent)' },
                        }}
                        aria-label={`Visualizar raça ${raca.nome}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canWrite(raca.universo) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(ROUTE_PATHS.NOVA_RACA, { state: { raca } })
                          }
                          sx={{
                            color: 'var(--color-accent)',
                            '&:hover': {
                              color: 'var(--color-accent)',
                              opacity: 0.8,
                            },
                          }}
                          aria-label={`Editar raça ${raca.nome}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(raca.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': { color: '#ef4444' },
                          }}
                          aria-label={`Remover raça ${raca.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {raca.linkImagem && (
                    <Box
                      component="img"
                      src={raca.linkImagem}
                      alt={raca.nome}
                      sx={{
                        width: '100%',
                        height: 180,
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
                    {raca.nome}
                  </Typography>
                  {raca.raridade && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {`${universos.find(u => u.id === raca.universo)?.Nome || 'Universo Desconhecido'} - ${raca.raridade}`}
                    </Typography>
                  )}
                  {raca.descricao && (
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
                      {raca.descricao}
                    </Typography>
                  )}
                </RacaCard>
              ))}
            </Box>
          )}
        </>
      )}

      <EntityViewDialog
        open={Boolean(racaVisualizando)}
        onClose={() => setRacaVisualizando(null)}
        titulo={racaVisualizando?.nome}
        subtitulo={
          racaVisualizando?.raridade &&
          `${universos.find(u => u.id === racaVisualizando?.universo)?.Nome || 'Universo Desconhecido'} — ${racaVisualizando.raridade}`
        }
        imagem={racaVisualizando?.linkImagem}
        descricao={racaVisualizando?.descricao}
      >
        {racaVisualizando?.atributosBasicos &&
          Object.values(racaVisualizando.atributosBasicos).some(v => v) && (
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
                Atributos Básicos
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                  gap: 1,
                  mb: 2,
                }}
              >
                {Object.entries(racaVisualizando.atributosBasicos).map(
                  ([key, value]) =>
                    value ? (
                      <Box
                        key={key}
                        sx={{
                          background: 'var(--bg-secondary)',
                          borderRadius: 1,
                          p: 1,
                          textAlign: 'center',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'var(--text-muted)',
                            display: 'block',
                          }}
                        >
                          {ATRIBUTO_LABELS[key] ?? key}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                          }}
                        >
                          {value}
                        </Typography>
                      </Box>
                    ) : null,
                )}
              </Box>
            </>
          )}
        {racaVisualizando?.habilidadesRaciais?.habilidadesBasicas?.length >
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
              Habilidades Básicas
            </Typography>
            {racaVisualizando.habilidadesRaciais.habilidadesBasicas.map(
              (hab, i) => (
                <Box
                  key={`${hab.nome}-${i}`}
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
                    {hab.nome}
                  </Typography>
                  {hab.descricao && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-secondary)',
                        display: 'block',
                        mb: 0.75,
                      }}
                    >
                      {hab.descricao}
                    </Typography>
                  )}
                  {hab.bonus?.filter(Boolean).length > 0 && (
                    <Box sx={{ mt: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'var(--text-muted)',
                          display: 'block',
                          fontSize: '0.65rem',
                          mb: 0.25,
                        }}
                      >
                        Bônus
                      </Typography>
                      {hab.bonus.filter(Boolean).map((b, bi) => (
                        <Typography
                          key={bi}
                          variant="caption"
                          sx={{
                            color: 'var(--color-accent)',
                            display: 'block',
                          }}
                        >
                          • {b}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              ),
            )}
          </>
        )}
        {racaVisualizando?.habilidadesRaciais?.habilidadesAvancadas?.length >
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
              Habilidades Avançadas
            </Typography>
            {racaVisualizando.habilidadesRaciais.habilidadesAvancadas.map(
              (hab, i) => (
                <Box
                  key={`${hab.nome}-${i}`}
                  sx={{
                    mb: 1,
                    p: 1.5,
                    background: 'var(--bg-secondary)',
                    borderRadius: 1,
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                    >
                      {hab.nome}
                    </Typography>
                    {hab.acao && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--color-accent)', fontWeight: 600 }}
                      >
                        {hab.acao}
                      </Typography>
                    )}
                  </Box>
                  {hab.descricao && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-secondary)',
                        display: 'block',
                        mb: 0.75,
                      }}
                    >
                      {hab.descricao}
                    </Typography>
                  )}
                  {HAB_META_FIELDS.filter(f => hab[f.key]).length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.75,
                        mt: 0.5,
                      }}
                    >
                      {HAB_META_FIELDS.filter(f => hab[f.key]).map(f => (
                        <Box
                          key={f.key}
                          sx={{
                            background: 'var(--bg-primary)',
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
                            {hab[f.key]}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  {hab.bonus?.filter(Boolean).length > 0 && (
                    <Box sx={{ mt: 0.75 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'var(--text-muted)',
                          display: 'block',
                          fontSize: '0.65rem',
                          mb: 0.25,
                        }}
                      >
                        Bônus
                      </Typography>
                      {hab.bonus.filter(Boolean).map((b, bi) => (
                        <Typography
                          key={bi}
                          variant="caption"
                          sx={{
                            color: 'var(--color-accent)',
                            display: 'block',
                          }}
                        >
                          • {b}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              ),
            )}
          </>
        )}
      </EntityViewDialog>
    </Box>
  );
};

export default Racas;
