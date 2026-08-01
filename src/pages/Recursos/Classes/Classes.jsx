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
import { getClasses, removeClasse } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { RARIDADES, TIPOS_PERSONAGEM } from 'common/constants/constants';
import useEntityCRUD from 'hooks/useEntityCRUD';
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
  RacaMeta,
  RacaBadge,
} from '../Racas/styles';

const ATRIBUTO_LABELS = {
  forca: 'Força',
  vitalidade: 'Vitalidade',
  agilidade: 'Agilidade',
  inteligencia: 'Inteligência',
  percepcao: 'Percepção',
};

const HAB_META_FIELDS = [
  { key: 'alvo', label: 'Alvo' },
  { key: 'alcance', label: 'Alcance' },
  { key: 'custo', label: 'Custo' },
  { key: 'recarga', label: 'Recarga' },
  { key: 'duracao', label: 'Duração' },
  { key: 'dados', label: 'Dados' },
];

const Classes = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: classes,
    loading: loadingClasses,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getClasses, remove: removeClasse });
  const { universos, loadingUniversos } = useUniversos();
  const loading = loadingClasses || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroRaridade, setFiltroRaridade] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [ordenacao, setOrdenacao] = useState(ORDEM_ASC);
  const [classeVisualizando, setClasseVisualizando] = useState(null);

  const classesFiltradas = useMemo(() => {
    const filtradas = classes.filter(classe => {
      const matchNome =
        !filtroNome ||
        classe.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchRaridade =
        !filtroRaridade || classe.raridade === filtroRaridade;
      const matchTipo =
        !filtroTipo || classe.tiposDisponiveis?.includes(filtroTipo);
      const matchUniverso =
        !filtroUniverso || classe.universo === filtroUniverso;
      return matchNome && matchRaridade && matchTipo && matchUniverso;
    });
    return ordenarPorNome(filtradas, ordenacao);
  }, [
    classes,
    filtroNome,
    filtroRaridade,
    filtroTipo,
    filtroUniverso,
    ordenacao,
  ]);

  return (
    <Box className="page-container" id="redungeon-classes" data-page="classes">
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
            Classes
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as classes disponíveis na campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_CLASSE)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Classe
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
              {
                label: 'Tipo',
                value: filtroTipo,
                onChange: setFiltroTipo,
                options: TIPOS_PERSONAGEM,
                allLabel: 'Todos',
              },
            ]}
            universos={universos}
            universoValue={filtroUniverso}
            onUniversoChange={setFiltroUniverso}
            sortValue={ordenacao}
            onSortChange={setOrdenacao}
          />

          {classesFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                ⚔️
              </Typography>
              <Typography variant="body1">Nenhuma classe encontrada</Typography>
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
              {classesFiltradas.map(classe => (
                <RacaCard key={classe.id} elevation={0}>
                  <RacaImageFrame>
                    {classe.linkImagem && !/discordapp\.net\/attachments/.test(classe.linkImagem) && (
                      <Box
                        component="img"
                        className="raca-card-image"
                        src={classe.linkImagem}
                        alt={classe.nome}
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
                          onClick={() => setClasseVisualizando(classe)}
                          sx={{
                            color: 'var(--text-secondary)',
                            padding: '14px',
                            minWidth: '16px',
                            width: '16px',
                            height: '16px',
                            '&:hover': { color: 'var(--color-accent)' },
                          }}
                          aria-label={`Visualizar classe ${classe.nome}`}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {canWrite(classe.universo) && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(ROUTE_PATHS.NOVA_CLASSE, { state: { classe } })
                            }
                            sx={{
                              color: 'var(--color-accent)',
                              padding: '4px',
                              minWidth: '32px',
                              width: '32px',
                              height: '32px',
                              '&:hover': { color: 'var(--color-accent)', opacity: 0.8 },
                            }}
                            aria-label={`Editar classe ${classe.nome}`}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleRemove(classe.id)}
                            sx={{ color: '#ef4444', padding: '4px', minWidth: '32px', width: '32px', height: '32px', '&:hover': { color: '#ef4444' } }}
                            aria-label={`Remover classe ${classe.nome}`}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </RacaActionBar>
                  </RacaImageFrame>

                  <RacaContent>
                    <RacaTitle variant="h6">{classe.nome}</RacaTitle>
                    {classe.raridade && (
                      <RacaSubtitle variant="caption">
                        {`${universos.find(u => u.id === classe.universo)?.Nome || 'Universo Desconhecido'} - ${classe.raridade}`}
                      </RacaSubtitle>
                    )}

                    {classe.descricao && <RacaDescription variant="body2">{classe.descricao}</RacaDescription>}

                    <RacaFooter>
                      <RacaMeta>
                        <RacaBadge>📖 {universos.find(u => u.id === classe.universo)?.Nome || 'Universo Desconhecido'}</RacaBadge>
                        {classe.raridade && <RacaBadge>⭐ {classe.raridade}</RacaBadge>}
                        {classe.tiposDisponiveis?.length > 0 && <RacaBadge>🧬 {classe.tiposDisponiveis[0]}</RacaBadge>}
                      </RacaMeta>
                    </RacaFooter>
                  </RacaContent>
                </RacaCard>
              ))}
            </Box>
          )}
        </>
      )}

      <EntityViewDialog
        open={Boolean(classeVisualizando)}
        onClose={() => setClasseVisualizando(null)}
        titulo={classeVisualizando?.nome}
        subtitulo={
          classeVisualizando?.raridade &&
          `${universos.find(u => u.id === classeVisualizando?.universo)?.Nome || 'Universo Desconhecido'} — ${classeVisualizando.raridade}`
        }
        imagem={classeVisualizando?.linkImagem}
        descricao={classeVisualizando?.descricao}
      >
        {classeVisualizando?.atributosBasicos &&
          Object.values(classeVisualizando.atributosBasicos).some(v => v) && (
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
                {Object.entries(classeVisualizando.atributosBasicos).map(
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
        {classeVisualizando?.habilidadesBasicas?.length > 0 && (
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
            {classeVisualizando.habilidadesBasicas.map((hab, i) => (
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
            ))}
          </>
        )}
        {classeVisualizando?.habilidadesAvancadas?.length > 0 && (
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
            {classeVisualizando.habilidadesAvancadas.map((hab, i) => (
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
            ))}
          </>
        )}
      </EntityViewDialog>
    </Box>
  );
};

export default Classes;
