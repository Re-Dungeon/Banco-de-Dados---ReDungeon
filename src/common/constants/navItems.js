import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SportsMartialArtsOutlinedIcon from '@mui/icons-material/SportsMartialArtsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import LocalFloristOutlinedIcon from '@mui/icons-material/LocalFloristOutlined';
import AgricultureOutlinedIcon from '@mui/icons-material/AgricultureOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { ROUTE_PATHS } from './routes';

export const NAV_GROUPS = [
  {
    id: 'overview',
    title: 'Visão Geral',
    items: [
      { path: ROUTE_PATHS.RECURSOS, label: 'Dashboard', icon: DashboardOutlinedIcon },
      { path: ROUTE_PATHS.FICHAS, label: 'Fichas', icon: BadgeOutlinedIcon },
      {
        path: ROUTE_PATHS.GERENCIADOR_UNIVERSOS,
        label: 'Gerenciador de Universos',
        icon: TravelExploreOutlinedIcon,
      },
    ],
  },
  {
    id: 'personagem',
    title: 'Personagens',
    items: [
      { path: ROUTE_PATHS.RACAS, label: 'Raças', icon: GroupsOutlinedIcon },
      { path: ROUTE_PATHS.CLASSES, label: 'Classes', icon: SportsMartialArtsOutlinedIcon },
      { path: ROUTE_PATHS.APTIDOES, label: 'Aptidões', icon: AutoAwesomeOutlinedIcon },
      { path: ROUTE_PATHS.CORPOS_ESPECIAIS, label: 'Corpos Especiais', icon: AccessibilityNewOutlinedIcon },
      { path: ROUTE_PATHS.ORIGENS, label: 'Origens', icon: TravelExploreOutlinedIcon },
      { path: ROUTE_PATHS.DIVINDADES, label: 'Divindades', icon: LocalFloristOutlinedIcon },
    ],
  },
  {
    id: 'progresso',
    title: 'Evolução',
    items: [
      { path: ROUTE_PATHS.ARTES, label: 'Artes', icon: PaletteOutlinedIcon },
      { path: ROUTE_PATHS.VEIAS_ASTRAIS, label: 'Veias Astrais', icon: AutoFixHighOutlinedIcon },
      { path: ROUTE_PATHS.REINOS_CULTIVO, label: 'Reinos de Cultivo', icon: AgricultureOutlinedIcon },
    ],
  },
  {
    id: 'combate',
    title: 'Combate',
    items: [{ path: ROUTE_PATHS.CONDICOES, label: 'Condições', icon: GavelOutlinedIcon }],
  },
  {
    id: 'sistemas',
    title: 'Sistemas',
    items: [
      { path: ROUTE_PATHS.CARDFLUX, label: 'CardFlux', icon: CreditCardOutlinedIcon },
      { path: ROUTE_PATHS.TRICKSTER_COIN, label: 'Trickster Coin', icon: MonetizationOnOutlinedIcon },
    ],
  },
  {
    id: 'recursos',
    title: 'Inventário',
    items: [
      { path: ROUTE_PATHS.MATERIAIS, label: 'Materiais', icon: Inventory2OutlinedIcon },
      { path: ROUTE_PATHS.ITENS, label: 'Itens', icon: ConstructionOutlinedIcon },
      { path: ROUTE_PATHS.RECEITAS, label: 'Receitas', icon: ReceiptLongOutlinedIcon },
    ],
  },
  {
    id: 'geral',
    title: 'Outros',
    items: [
      { path: ROUTE_PATHS.REGRAS, label: 'Regras', icon: DescriptionOutlinedIcon },
      {
        path: ROUTE_PATHS.TICKETS,
        label: 'Tickets',
        icon: SupportAgentOutlinedIcon,
        requiresAdmin: true,
      },
      { path: ROUTE_PATHS.PATCH_NOTES, label: 'Patch Notes', icon: ArticleOutlinedIcon },
      { path: ROUTE_PATHS.SOBRE, label: 'Sobre', icon: InfoOutlinedIcon },
    ],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap(group => group.items);

export const NAV_ITEMS_SECONDARY = [];
