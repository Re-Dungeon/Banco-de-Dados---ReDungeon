import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Fade from '@mui/material/Fade';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { getClasses, removeClasse } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { RARIDADES, TIPOS_PERSONAGEM } from 'common/constants/constants';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useDeleteConfirmation from 'hooks/useDeleteConfirmation';
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
} from '../Racas/styles';
import CardTokens from 'components/CardTokens/CardTokens';

const ATRIBUTO_LABELS = {
  forca: 'Força',
  vitalidade: 'Vitalidade',
  agilidade: 'Agilidade',
  inteligencia: 'Inteligência',
  percepcao: 'Percepção',
};

const Classes = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: classes,
    loading: loadingClasses,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getClasses, remove: removeClasse });
  const { universos, loadingUniversos } = useUniversos();
  const { confirmDelete, deleteConfirmationDialog } = useDeleteConfirmation();
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
                            onClick={() => confirmDelete(classe.nome, () => handleRemove(classe.id))}
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
                      <CardTokens
                        items={[
                          `📖 ${universos.find(u => u.id === classe.universo)?.Nome || 'Universo Desconhecido'}`,
                          ...(classe.raridade ? [`⭐ ${classe.raridade}`] : []),
                          ...(classe.tiposDisponiveis?.length > 0 ? [`🧬 ${classe.tiposDisponiveis[0]}`] : []),
                        ]}
                      />
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
            {classeVisualizando?.nome}
          </Typography>

          {classeVisualizando?.linkImagem &&
            !/discordapp\.net\/attachments/.test(classeVisualizando.linkImagem) && (
              <RacaModalImage>
                <img
                  src={classeVisualizando.linkImagem}
                  alt={classeVisualizando.nome}
                  onError={e => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </RacaModalImage>
            )}

          <RacaModalHeroBadges>
            {classeVisualizando?.raridade && (
              <RacaModalBadge>⭐ {classeVisualizando.raridade}</RacaModalBadge>
            )}
            {classeVisualizando?.tiposDisponiveis?.[0] && (
              <RacaModalBadge>🧬 {classeVisualizando.tiposDisponiveis[0]}</RacaModalBadge>
            )}
          </RacaModalHeroBadges>
        </RacaModalHeader>

        {classeVisualizando?.descricao && (
          <RacaDescriptionPanel>
            <RacaSectionTitle>📖 Descrição</RacaSectionTitle>
            <Typography
              variant="body2"
              sx={{ color: 'var(--text-secondary)', lineHeight: 1.85 }}
            >
              {classeVisualizando.descricao}
            </Typography>
          </RacaDescriptionPanel>
        )}

        {classeVisualizando?.atributosBasicos &&
          Object.values(classeVisualizando.atributosBasicos).some(v => v) && (
            <>
              <RacaSectionTitle>Atributos</RacaSectionTitle>
              <RacaAttributeGrid
                sx={{
                  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                  '@media (max-width: 900px)': {
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  },
                  '@media (max-width: 600px)': {
                    gridTemplateColumns: '1fr',
                  },
                }}
              >
                {Object.entries(classeVisualizando.atributosBasicos).map(
                  ([key, value]) =>
                    value ? (
                      <RacaAttributeCard key={key}>
                        <RacaAttributeLabel>
                          {ATRIBUTO_LABELS[key] ?? key}
                        </RacaAttributeLabel>
                        <RacaAttributeValue>{value}</RacaAttributeValue>
                      </RacaAttributeCard>
                    ) : null,
                )}
              </RacaAttributeGrid>
            </>
          )}

        {(classeVisualizando?.habilidadesBasicas?.length > 0 ||
          classeVisualizando?.habilidadesAvancadas?.length > 0) && (
          <>
            <RacaSectionTitle>Habilidades</RacaSectionTitle>
            <Box sx={{ mt: 1 }}>
                <ClassesAbilitiesTabs
                  key={classeVisualizando?.id ?? 'classe'}
                  classe={classeVisualizando}
                />
              </Box>
            </>
          )}
      </EntityViewDialog>
      {deleteConfirmationDialog}
    </Box>
  );
};

function ClassesAbilitiesTabs({ classe }) {
  const [tab, setTab] = useState(0);
  const basicas = classe?.habilidadesBasicas || [];
  const avancadas = classe?.habilidadesAvancadas || [];

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Tabs
          value={tab}
          onChange={(event, value) => setTab(value)}
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
          <Tab label="Habilidades Básicas" id="tab-basicas" aria-controls="tabpanel-basicas" />
          <Tab label="Habilidades Avançadas" id="tab-avancadas" aria-controls="tabpanel-avancadas" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Fade in={tab === 0} timeout={200} unmountOnExit>
          <div role="tabpanel" id="tabpanel-basicas" aria-labelledby="tab-basicas">
            {basicas.length > 0 ? (
              <RacaAbilityList>
                {basicas.map((hab, index) => (
                  <AbilityCardView key={`${hab.nome}-${index}`} hab={hab} />
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
          <div role="tabpanel" id="tabpanel-avancadas" aria-labelledby="tab-avancadas">
            {avancadas.length > 0 ? (
              <RacaAbilityList>
                {avancadas.map((hab, index) => (
                  <AbilityCardView key={`${hab.nome}-${index}`} hab={hab} />
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
        <Typography sx={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6 }}>
          {hab.descricao}
        </Typography>
        {bonuses.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {bonuses.map((bonus, idx) => (
              <AbilityBonusItem key={idx}>✓ {bonus}</AbilityBonusItem>
            ))}
          </Box>
        )}
      </AbilityContentArea>
    </RacaAbilityCard>
  );
}

ClassesAbilitiesTabs.propTypes = {
  classe: PropTypes.shape({
    id: PropTypes.string,
    habilidadesBasicas: PropTypes.arrayOf(PropTypes.object),
    habilidadesAvancadas: PropTypes.arrayOf(PropTypes.object),
  }),
};

AbilityCardView.propTypes = {
  hab: PropTypes.shape({
    bonus: PropTypes.arrayOf(PropTypes.string),
    nome: PropTypes.string,
    nucleo: PropTypes.string,
    tipo: PropTypes.string,
    passiva: PropTypes.bool,
    recarga: PropTypes.string,
    acao: PropTypes.string,
    duracao: PropTypes.string,
    alcance: PropTypes.string,
    alvo: PropTypes.string,
    custo: PropTypes.string,
    descricao: PropTypes.string,
  }).isRequired,
};

export default Classes;
