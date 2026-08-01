import React, { useState, useMemo, useEffect } from 'react';
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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Fade from '@mui/material/Fade';
import { getRacas, removeRaca } from 'service/storage';
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
  RacaModalHeader,
  RacaModalHeroBadges,
  RacaModalBadge,
  RacaModalImage,
  RacaDescriptionPanel,
  RacaSectionTitle,
  RacaAttributeGrid,
  RacaAttributeCard,
  RacaAttributeLabel,
  RacaAttributeValue,
  RacaAbilityList,
  RacaAbilityCard,
  RacaAbilityHeader,
  RacaAbilityTitle,
  RacaAbilityLabel,
  RacaAbilityDescription,
  RacaAbilityMeta,
  RacaAbilityBadge,
  AbilityHeaderCore,
  AbilityBadge,
  AbilityStatsBar,
  AbilityStat,
  AbilityStatLabel,
  AbilityStatValue,
  AbilityTabNav,
  AbilityTabButton,
  AbilityContentArea,
  AbilityBonusItem,
} from './styles';

const ATRIBUTO_LABELS = {
  forca: 'Força',
  vitalidade: 'Vitalidade',
  agilidade: 'Agilidade',
  inteligencia: 'Inteligência',
  percepcao: 'Percepção',
  sorte: 'Sorte',
  limiteMaximoAtributo: 'Limite Máx.',
};

const ATRIBUTO_ORDEM = [
  'forca',
  'vitalidade',
  'agilidade',
  'inteligencia',
  'percepcao',
  'sorte',
  'limiteMaximoAtributo',
];

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
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [ordenacao, setOrdenacao] = useState(ORDEM_ASC);
  const [racaVisualizando, setRacaVisualizando] = useState(null);

  const racasFiltradas = useMemo(() => {
    const filtradas = racas.filter(raca => {
      const matchNome =
        !filtroNome ||
        raca.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchRaridade = !filtroRaridade || raca.raridade === filtroRaridade;
      const matchTipo =
        !filtroTipo || raca.tiposDisponiveis?.includes(filtroTipo);
      const matchUniverso = !filtroUniverso || raca.universo === filtroUniverso;
      return matchNome && matchRaridade && matchTipo && matchUniverso;
    });
    return ordenarPorNome(filtradas, ordenacao);
  }, [
    racas,
    filtroNome,
    filtroRaridade,
    filtroTipo,
    filtroUniverso,
    ordenacao,
  ]);

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
              {racasFiltradas.map(raca => {
                const universoNome =
                  universos.find(u => u.id === raca.universo)?.Nome ||
                  'Universo Desconhecido';

                return (
                  <RacaCard key={raca.id} elevation={0}>
                    <RacaImageFrame>
                      {raca.linkImagem && !/discordapp\.net\/attachments/.test(raca.linkImagem) && (
                        <Box
                          component="img"
                          className="raca-card-image"
                          src={raca.linkImagem}
                          alt={raca.nome}
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
                            onClick={() => setRacaVisualizando(raca)}
                            sx={{
                              color: 'var(--text-secondary)',
                              padding: '14px',
                              minWidth: '16px',
                              width: '16px',
                              height: '16px',
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
                                padding: '4px',
                                minWidth: '32px',
                                width: '32px',
                                height: '32px',
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
                                padding: '4px',
                                minWidth: '32px',
                                width: '32px',
                                height: '32px',
                                '&:hover': { color: '#ef4444' },
                              }}
                              aria-label={`Remover raça ${raca.nome}`}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </RacaActionBar>
                    </RacaImageFrame>

                    <RacaContent>
                      <RacaTitle variant="h6">{raca.nome}</RacaTitle>
                      <RacaSubtitle variant="caption">
                        {universoNome}
                      </RacaSubtitle>
                      {raca.descricao && (
                        <RacaDescription variant="body2">
                          {raca.descricao}
                        </RacaDescription>
                      )}
                      <RacaFooter>
                        <RacaMeta>
                          <RacaBadge>📖 {universoNome}</RacaBadge>
                          {raca.raridade && <RacaBadge>⭐ {raca.raridade}</RacaBadge>}
                          {raca.tiposDisponiveis?.length > 0 && (
                            <RacaBadge>🧬 {raca.tiposDisponiveis[0]}</RacaBadge>
                          )}
                        </RacaMeta>
                      </RacaFooter>
                    </RacaContent>
                  </RacaCard>
                );
              })}
            </Box>
          )}
        </>
      )}

      <EntityViewDialog
        open={Boolean(racaVisualizando)}
        onClose={() => setRacaVisualizando(null)}
      >
        <RacaModalHeader>
          <Typography
            variant="h4"
            sx={{
              color: 'var(--text-primary)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
            }}
          >
            {racaVisualizando?.nome}
          </Typography>

          {racaVisualizando?.linkImagem && !/discordapp\.net\/attachments/.test(racaVisualizando.linkImagem) && (
            <RacaModalImage>
              <img
                src={racaVisualizando.linkImagem}
                alt={racaVisualizando.nome}
                onError={e => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </RacaModalImage>
          )}

          <RacaModalHeroBadges>
            {racaVisualizando?.raridade && (
              <RacaModalBadge>⭐ {racaVisualizando.raridade}</RacaModalBadge>
            )}
            {racaVisualizando?.tiposDisponiveis?.[0] && (
              <RacaModalBadge>🧬 {racaVisualizando.tiposDisponiveis[0]}</RacaModalBadge>
            )}
          </RacaModalHeroBadges>
        </RacaModalHeader>

        {racaVisualizando?.descricao && (
          <RacaDescriptionPanel>
            <RacaSectionTitle>📖 História</RacaSectionTitle>
            <Typography
              variant="body2"
              sx={{ color: 'var(--text-secondary)', lineHeight: 1.85 }}
            >
              {racaVisualizando.descricao}
            </Typography>
          </RacaDescriptionPanel>
        )}

        {racaVisualizando?.atributosBasicos &&
          Object.values(racaVisualizando.atributosBasicos).some(v => v) && (
            <>
              <RacaSectionTitle>Atributos</RacaSectionTitle>
              <RacaAttributeGrid>
                {ATRIBUTO_ORDEM.filter(key => racaVisualizando.atributosBasicos?.[key])
                  .map(key => {
                    const value = racaVisualizando.atributosBasicos[key];
                    return (
                      <RacaAttributeCard
                        key={key}
                        sx={
                          key === 'limiteMaximoAtributo'
                            ? { gridColumn: '1 / -1', padding: '8px 10px' }
                            : undefined
                        }
                      >
                        <RacaAttributeLabel
                          sx={
                            key === 'limiteMaximoAtributo'
                              ? { fontSize: '0.62rem' }
                              : undefined
                          }
                        >
                          {ATRIBUTO_LABELS[key] ?? key}
                        </RacaAttributeLabel>
                        <RacaAttributeValue
                          sx={
                            key === 'limiteMaximoAtributo'
                              ? { fontSize: '1rem', marginTop: '6px' }
                              : undefined
                          }
                        >
                          {value}
                        </RacaAttributeValue>
                      </RacaAttributeCard>
                    );
                  })}
              </RacaAttributeGrid>
            </>
          )}

        {racaVisualizando?.habilidadesRaciais && (
          <>
            <RacaSectionTitle>Habilidades</RacaSectionTitle>

            <Box sx={{ mt: 1 }}>
              <AbilitiesTabs raca={racaVisualizando} />
            </Box>

            {/* Nota: os cards agora aparecem dentro das abas (AbilityCardView). */}
          </>
        )}
      </EntityViewDialog>
    </Box>
  );
};

/*
  AbilitiesTabs
  - UI-only component that shows two tabs: Básicas e Avançadas
  - Preserva exatamente o markup das habilidades
  - Usa transição Fade entre abas (200ms)
  - Reseta para a aba Básicas quando a raça muda
*/
function AbilitiesTabs({ raca }) {
  const [tab, setTab] = useState(0);

  useEffect(() => {
    setTab(0);
  }, [raca?.id]);

  const basicas = raca?.habilidadesRaciais?.habilidadesBasicas || [];
  const avancadas = raca?.habilidadesRaciais?.habilidadesAvancadas || [];

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{
            '& .MuiTabs-flexContainer': { gap: 1 },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '12px',
              padding: '6px 14px',
              minWidth: 160,
            },
            '& .MuiTab-root.Mui-selected': {
              background: 'linear-gradient(90deg, rgba(96,165,250,0.12), rgba(255,215,64,0.06))',
              color: 'white',
              boxShadow: '0 6px 18px rgba(0,0,0,0.28)',
              border: '1px solid rgba(96,165,250,0.16)',
            },
            '& .MuiTabs-indicator': { display: 'none' },
          }}
        >
          <Tab label={`Habilidades Básicas`} id="tab-basicas" aria-controls="tabpanel-basicas" />
          <Tab label={`Habilidades Avançadas`} id="tab-avancadas" aria-controls="tabpanel-avancadas" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Fade in={tab === 0} timeout={200} unmountOnExit>
          <div id="tabpanel-basicas" role="tabpanel" aria-labelledby="tab-basicas">
            {basicas.length > 0 ? (
              <RacaAbilityList>
                {basicas.map((hab, i) => (
                  <AbilityCardView key={`${hab.nome}-${i}`} hab={hab} />
                ))}
              </RacaAbilityList>
            ) : (
              <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                Nenhuma habilidade básica.
              </Typography>
            )}
          </div>
        </Fade>

        <Fade in={tab === 1} timeout={200} unmountOnExit>
          <div id="tabpanel-avancadas" role="tabpanel" aria-labelledby="tab-avancadas">
            {avancadas.length > 0 ? (
              <RacaAbilityList>
                {avancadas.map((hab, i) => (
                  <AbilityCardView key={`${hab.nome}-${i}`} hab={hab} />
                ))}
              </RacaAbilityList>
            ) : (
              <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                Nenhuma habilidade avançada.
              </Typography>
            )}
          </div>
        </Fade>
      </Box>
    </>
  );
}

/* AbilityCardView: visual-only, fixed layout premium card for each ability */
function AbilityCardView({ hab }) {
  const bonuses = (hab.bonus || []).filter(Boolean);

  return (
    <RacaAbilityCard>
      <RacaAbilityHeader>
        <div>
          <RacaAbilityTitle>{hab.nome}</RacaAbilityTitle>
          {hab.nucleo && <AbilityHeaderCore>{`Núcleo: ${hab.nucleo}`}</AbilityHeaderCore>}
        </div>
        <div>
          <AbilityBadge>{hab.tipo?.toUpperCase() || (hab.passiva ? 'PASSIVA' : 'ATIVA')}</AbilityBadge>
        </div>
      </RacaAbilityHeader>

      <AbilityStatsBar>
        <AbilityStat>
          <AbilityStatLabel>Recarga</AbilityStatLabel>
          <AbilityStatValue>{hab.recarga ?? 'N/D'}</AbilityStatValue>
        </AbilityStat>
        <AbilityStat>
          <AbilityStatLabel>Ação</AbilityStatLabel>
          <AbilityStatValue>{hab.acao ?? (hab.passiva ? 'Passiva' : '—')}</AbilityStatValue>
        </AbilityStat>
        <AbilityStat>
          <AbilityStatLabel>Duração</AbilityStatLabel>
          <AbilityStatValue>{hab.duracao ?? 'N/D'}</AbilityStatValue>
        </AbilityStat>
        <AbilityStat>
          <AbilityStatLabel>Alcance</AbilityStatLabel>
          <AbilityStatValue>{hab.alcance ?? 'N/D'}</AbilityStatValue>
        </AbilityStat>
        <AbilityStat>
          <AbilityStatLabel>Alvos</AbilityStatLabel>
          <AbilityStatValue>{hab.alvo ?? '—'}</AbilityStatValue>
        </AbilityStat>
        <AbilityStat>
          <AbilityStatLabel>Custo</AbilityStatLabel>
          <AbilityStatValue>{hab.custo ?? '—'}</AbilityStatValue>
        </AbilityStat>
      </AbilityStatsBar>

      <AbilityTabNav>
        <AbilityTabButton className="active">Descrição</AbilityTabButton>
      </AbilityTabNav>

      <AbilityContentArea>
        <Typography sx={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6 }}>{hab.descricao}</Typography>
        {bonuses.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {bonuses.map((b, idx) => (
              <AbilityBonusItem key={idx}>✓ {b}</AbilityBonusItem>
            ))}
          </Box>
        )}
      </AbilityContentArea>
    </RacaAbilityCard>
  );
}

export default Racas;
