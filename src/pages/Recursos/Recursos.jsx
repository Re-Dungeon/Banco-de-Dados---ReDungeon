import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import SportsMartialArtsOutlinedIcon from '@mui/icons-material/SportsMartialArtsOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import LocalFloristOutlinedIcon from '@mui/icons-material/LocalFloristOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import AgricultureOutlinedIcon from '@mui/icons-material/AgricultureOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import {
  getAptidoes,
  getArtes,
  getCardFlux,
  getClasses,
  getCondicoes,
  getCorposEspeciais,
  getDivindades,
  getItens,
  getMateriais,
  getOrigens,
  getRacas,
  getReceitas,
  getRegras,
  getReinosCultivo,
  getTricksterCoinBeneficios,
  getVeiasAstrais,
} from 'service/storage';

const CATEGORY_DEFINITIONS = [
  {
    key: 'racas',
    label: 'Raças',
    description: 'Povos, linhagens e ancestrais do mundo.',
    path: ROUTE_PATHS.RACAS,
    getter: getRacas,
    icon: GroupsOutlinedIcon,
    group: 'personagens',
  },
  {
    key: 'classes',
    label: 'Classes',
    description: 'Arquétipos de personagem e especialização.',
    path: ROUTE_PATHS.CLASSES,
    getter: getClasses,
    icon: SportsMartialArtsOutlinedIcon,
    group: 'personagens',
  },
  {
    key: 'aptidoes',
    label: 'Aptidões',
    description: 'Talentos, habilidades e atributos fundamentais.',
    path: ROUTE_PATHS.APTIDOES,
    getter: getAptidoes,
    icon: AutoAwesomeOutlinedIcon,
    group: 'personagens',
  },
  {
    key: 'corpos-especiais',
    label: 'Corpos Especiais',
    description: 'Formas, mutações e ressonâncias corporais.',
    path: ROUTE_PATHS.CORPOS_ESPECIAIS,
    getter: getCorposEspeciais,
    icon: AccessibilityNewOutlinedIcon,
    group: 'personagens',
  },
  {
    key: 'origens',
    label: 'Origens',
    description: 'Histórias e raízes que moldam a identidade.',
    path: ROUTE_PATHS.ORIGENS,
    getter: getOrigens,
    icon: TravelExploreOutlinedIcon,
    group: 'personagens',
  },
  {
    key: 'divindades',
    label: 'Divindades',
    description: 'Entidades divinas, cultos e pactos.',
    path: ROUTE_PATHS.DIVINDADES,
    getter: getDivindades,
    icon: LocalFloristOutlinedIcon,
    group: 'personagens',
  },
  {
    key: 'artes',
    label: 'Artes',
    description: 'Conhecimentos, técnicas e práticas de poder.',
    path: ROUTE_PATHS.ARTES,
    getter: getArtes,
    icon: PaletteOutlinedIcon,
    group: 'evolucao',
  },
  {
    key: 'veias-astrais',
    label: 'Veias Astrais',
    description: 'Linhas energéticas e traços cósmicos.',
    path: ROUTE_PATHS.VEIAS_ASTRAIS,
    getter: getVeiasAstrais,
    icon: AutoFixHighOutlinedIcon,
    group: 'evolucao',
  },
  {
    key: 'reinos-cultivo',
    label: 'Reinos de Cultivo',
    description: 'Territórios produtivos e ecossistemas especiais.',
    path: ROUTE_PATHS.REINOS_CULTIVO,
    getter: getReinosCultivo,
    icon: AgricultureOutlinedIcon,
    group: 'evolucao',
  },
  {
    key: 'condicoes',
    label: 'Condições',
    description: 'Status, efeitos e penalidades do combate.',
    path: ROUTE_PATHS.CONDICOES,
    getter: getCondicoes,
    icon: GavelOutlinedIcon,
    group: 'combate',
  },
  {
    key: 'materiais',
    label: 'Materiais',
    description: 'Base de criação e recursos de crafting.',
    path: ROUTE_PATHS.MATERIAIS,
    getter: getMateriais,
    icon: Inventory2OutlinedIcon,
    group: 'inventario',
  },
  {
    key: 'itens',
    label: 'Itens',
    description: 'Equipamentos, objetos e componentes úteis.',
    path: ROUTE_PATHS.ITENS,
    getter: getItens,
    icon: ConstructionOutlinedIcon,
    group: 'inventario',
  },
  {
    key: 'receitas',
    label: 'Receitas',
    description: 'Receitas e processos de montagens e criação.',
    path: ROUTE_PATHS.RECEITAS,
    getter: getReceitas,
    icon: ReceiptLongOutlinedIcon,
    group: 'inventario',
  },
  {
    key: 'cardflux',
    label: 'CardFlux',
    description: 'Cartas, fluxos e sistemas de engajamento.',
    path: ROUTE_PATHS.CARDFLUX,
    getter: getCardFlux,
    icon: CreditCardOutlinedIcon,
    group: 'sistemas',
  },
  {
    key: 'trickster-coin',
    label: 'Trickster Coin',
    description: 'Benefícios, vantagens e itens da moeda do sistema.',
    path: ROUTE_PATHS.TRICKSTER_COIN,
    getter: getTricksterCoinBeneficios,
    icon: MonetizationOnOutlinedIcon,
    group: 'sistemas',
  },
  {
    key: 'regras',
    label: 'Regras',
    description: 'Sistema, mecânicas e diretrizes do universo.',
    path: ROUTE_PATHS.REGRAS,
    getter: getRegras,
    icon: DescriptionOutlinedIcon,
    group: 'outros',
  },
];

const DASHBOARD_GROUPS = [
  { id: 'personagens', title: 'Personagens e Identidade' },
  { id: 'evolucao', title: 'Evolução e Progressão' },
  { id: 'combate', title: 'Combate' },
  { id: 'inventario', title: 'Inventário e Criação' },
  { id: 'sistemas', title: 'Sistemas Especiais' },
  { id: 'outros', title: 'Outros' },
];

const summaryCardSx = {
  flex: 1,
  minWidth: 0,
  borderRadius: 3,
  border: '1px solid rgba(148, 163, 184, 0.18)',
  background:
    'linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(10, 15, 27, 0.84))',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  p: 2,
};

const Recursos = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState(() =>
    CATEGORY_DEFINITIONS.map(category => ({
      ...category,
      count: 0,
      status: 'loading',
      error: null,
    })),
  );

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      const results = await Promise.all(
        CATEGORY_DEFINITIONS.map(async category => {
          try {
            const items = await category.getter();
            return {
              ...category,
              count: Array.isArray(items) ? items.length : 0,
              status: 'success',
              error: null,
            };
          } catch (error) {
            return {
              ...category,
              count: 0,
              status: 'error',
              error,
            };
          }
        }),
      );

      if (active) {
        setCategories(results);
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, [currentUser]);

  const summary = useMemo(() => {
    const total = categories.reduce(
      (sum, category) => sum + (category.status === 'success' ? category.count : 0),
      0,
    );
    const available = categories.length;
    const registered = categories.filter(
      category => category.status === 'success' && category.count > 0,
    ).length;

    return { total, available, registered };
  }, [categories]);

  const groupedCategories = useMemo(
    () =>
      DASHBOARD_GROUPS.map(group => ({
        ...group,
        items: categories.filter(category => category.group === group.id),
      })),
    [categories],
  );

  const isLoading = categories.some(category => category.status === 'loading');

  return (
    <Box
      className="page-container"
      id="redungeon-recursos"
      data-page="recursos"
      sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{ color: 'var(--text-primary)', fontWeight: 800, mb: 0.75 }}
        >
          Recursos
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          Dashboard do banco de dados e acesso rápido às coleções do mundo.
        </Typography>
      </Box>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ width: '100%' }}
      >
        {[
          { label: 'Total de registros', value: summary.total },
          { label: 'Categorias disponíveis', value: summary.available },
          { label: 'Categorias cadastradas', value: summary.registered },
        ].map(item => (
          <Box key={item.label} sx={summaryCardSx}>
            <Typography
              variant="overline"
              sx={{
                display: 'block',
                color: 'var(--text-muted)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                mb: 1.5,
              }}
            >
              {item.label}
            </Typography>
            {isLoading ? (
              <Skeleton
                variant="text"
                width="42%"
                height={44}
                sx={{ bgcolor: 'rgba(148, 163, 184, 0.12)' }}
              />
            ) : (
              <Typography
                variant="h3"
                sx={{
                  color: 'var(--text-primary)',
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {item.value}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {groupedCategories.map(group => (
          <Box key={group.id}>
            <Typography
              variant="overline"
              sx={{
                display: 'block',
                color: 'var(--text-accent, #9ad7ff)',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                mb: 1.5,
              }}
            >
              {group.title}
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              {group.items.map(category => {
                const Icon = category.icon;
                const isLoading = category.status === 'loading';
                const isError = category.status === 'error';

                return (
                  <Card
                    key={category.key}
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      border: '1px solid rgba(148, 163, 184, 0.17)',
                      background:
                        'linear-gradient(180deg, rgba(14, 22, 34, 0.96), rgba(10, 17, 30, 0.88))',
                      overflow: 'hidden',
                      transition: 'all 180ms ease',
                      '&:hover': {
                        borderColor: 'rgba(96, 165, 250, 0.6)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 40px rgba(14, 165, 233, 0.12)',
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => navigate(category.path)}
                      aria-label={`Abrir ${category.label}`}
                      sx={{
                        p: 2.25,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        gap: 1.5,
                        color: 'inherit',
                        '&:hover': {
                          background: 'rgba(148, 163, 184, 0.03)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 2.5,
                            display: 'grid',
                            placeItems: 'center',
                            background:
                              'linear-gradient(135deg, rgba(111,45,168,0.35), rgba(0,217,255,0.18))',
                            border: '1px solid rgba(96, 165, 250, 0.32)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                            color: 'var(--color-accent)',
                            transition: 'transform 180ms ease',
                            '.MuiCardActionArea-root:hover &': {
                              transform: 'scale(1.05)',
                            },
                          }}
                        >
                          <Icon fontSize="medium" />
                        </Box>
                        <Chip
                          label={
                            isLoading
                              ? 'Carregando'
                              : isError
                                ? 'Falha'
                                : category.count === 0
                                  ? 'Vazio'
                                  : 'Abrir'
                          }
                          size="small"
                          sx={{
                            borderRadius: 999,
                            background:
                              isLoading
                                ? 'rgba(148,163,184,0.12)'
                                : isError
                                  ? 'rgba(239,68,68,0.16)'
                                  : category.count === 0
                                    ? 'rgba(15,23,42,0.65)'
                                    : 'rgba(34,197,94,0.14)',
                            color: isError ? '#fca5a5' : 'var(--text-primary)',
                            border: '1px solid rgba(148,163,184,0.16)',
                            fontWeight: 700,
                            letterSpacing: '0.03em',
                          }}
                        />
                      </Box>

                      {isLoading ? (
                        <>
                          <Skeleton
                            variant="text"
                            width="60%"
                            height={30}
                            sx={{ bgcolor: 'rgba(148, 163, 184, 0.12)' }}
                          />
                          <Skeleton
                            variant="text"
                            width="100%"
                            height={24}
                            sx={{ bgcolor: 'rgba(148, 163, 184, 0.12)' }}
                          />
                          <Skeleton
                            variant="text"
                            width="44%"
                            height={28}
                            sx={{ bgcolor: 'rgba(148, 163, 184, 0.12)' }}
                          />
                        </>
                      ) : (
                        <>
                          <Typography
                            variant="h6"
                            sx={{
                              color: 'var(--text-primary)',
                              fontWeight: 700,
                              lineHeight: 1.2,
                            }}
                          >
                            {category.label}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color: 'var(--text-secondary)',
                              minHeight: 42,
                            }}
                          >
                            {category.description}
                          </Typography>

                          <Box
                            sx={{
                              mt: 'auto',
                              display: 'flex',
                              alignItems: 'end',
                              justifyContent: 'space-between',
                              gap: 1.5,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  color: 'var(--text-muted)',
                                  letterSpacing: '0.06em',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Registros
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{
                                  color: 'var(--text-primary)',
                                  fontWeight: 800,
                                  lineHeight: 1,
                                }}
                              >
                                {category.count}
                              </Typography>
                            </Box>

                            <ArrowForwardOutlinedIcon
                              sx={{
                                color: 'var(--color-accent)',
                                opacity: 0.9,
                              }}
                            />
                          </Box>

                          <Typography
                            variant="caption"
                            sx={{
                              color: isError
                                ? '#fca5a5'
                                : category.count === 0
                                  ? 'var(--text-muted)'
                                  : 'var(--text-secondary)',
                              mt: 0.5,
                              display: 'block',
                            }}
                          >
                            {isError
                              ? 'Falha ao consultar esta coleção.'
                              : category.count === 0
                                ? 'Nenhum registro cadastrado.'
                                : `${category.count} registro${category.count === 1 ? '' : 's'} cadastrado${category.count === 1 ? '' : 's'}.`}
                          </Typography>
                        </>
                      )}
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Recursos;
