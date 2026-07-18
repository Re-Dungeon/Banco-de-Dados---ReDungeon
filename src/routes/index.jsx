import React from 'react';
import { Navigate } from 'react-router-dom';
import Mesas from 'pages/Mesas/Mesas';
import Mundo from 'pages/Mundo/Mundo';
import NPCs from 'pages/NPCs/NPCs';
import Recursos from 'pages/Recursos/Recursos';
import Racas from 'pages/Recursos/Racas/Racas';
import NovaRaca from 'pages/Recursos/Racas/NovaRaca';
import Itens from 'pages/Recursos/Itens/Itens';
import NovoItem from 'pages/Recursos/Itens/NovoItem';
import Materiais from 'pages/Recursos/Materiais/Materiais';
import NovoMaterial from 'pages/Recursos/Materiais/NovoMaterial';
import Classes from 'pages/Recursos/Classes/Classes';
import NovaClasse from 'pages/Recursos/Classes/NovaClasse';
import Receitas from 'pages/Recursos/Receitas/Receitas';
import NovaReceita from 'pages/Recursos/Receitas/NovaReceita';
import Condicoes from 'pages/Recursos/Condicoes/Condicoes';
import NovaCondicao from 'pages/Recursos/Condicoes/NovaCondicao';
import Artes from 'pages/Recursos/Artes/Artes';
import NovaArte from 'pages/Recursos/Artes/NovaArte';
import Origens from 'pages/Recursos/Origens/Origens';
import NovaOrigem from 'pages/Recursos/Origens/NovaOrigem';
import Regras from 'pages/Regras/Regras';
import NovaRegra from 'pages/Regras/NovaRegra';
import Macros from 'pages/Macros/Macros';
import PatchNotes from 'pages/PatchNotes/PatchNotes';
import Nucleo from 'pages/Nucleo/Nucleo';
import Sobre from 'pages/Sobre/Sobre';
import { ROUTE_PATHS } from 'common/constants/routes';

export const ROUTES = [
  { index: true, element: <Navigate to={ROUTE_PATHS.MESAS} replace /> },
  { path: ROUTE_PATHS.MESAS.slice(1), element: <Mesas /> },
  { path: ROUTE_PATHS.MUNDO.slice(1), element: <Mundo /> },
  { path: ROUTE_PATHS.NPCS.slice(1), element: <NPCs /> },
  { path: ROUTE_PATHS.RECURSOS.slice(1), element: <Recursos /> },
  { path: ROUTE_PATHS.RACAS.slice(1), element: <Racas /> },
  { path: ROUTE_PATHS.NOVA_RACA.slice(1), element: <NovaRaca /> },
  { path: ROUTE_PATHS.ITENS.slice(1), element: <Itens /> },
  { path: ROUTE_PATHS.NOVO_ITEM.slice(1), element: <NovoItem /> },
  { path: ROUTE_PATHS.MATERIAIS.slice(1), element: <Materiais /> },
  { path: ROUTE_PATHS.NOVO_MATERIAL.slice(1), element: <NovoMaterial /> },
  { path: ROUTE_PATHS.CLASSES.slice(1), element: <Classes /> },
  { path: ROUTE_PATHS.NOVA_CLASSE.slice(1), element: <NovaClasse /> },
  { path: ROUTE_PATHS.RECEITAS.slice(1), element: <Receitas /> },
  { path: ROUTE_PATHS.NOVA_RECEITA.slice(1), element: <NovaReceita /> },
  { path: ROUTE_PATHS.CONDICOES.slice(1), element: <Condicoes /> },
  { path: ROUTE_PATHS.NOVA_CONDICAO.slice(1), element: <NovaCondicao /> },
  { path: ROUTE_PATHS.ARTES.slice(1), element: <Artes /> },
  { path: ROUTE_PATHS.NOVA_ARTE.slice(1), element: <NovaArte /> },
  { path: ROUTE_PATHS.ORIGENS.slice(1), element: <Origens /> },
  { path: ROUTE_PATHS.NOVA_ORIGEM.slice(1), element: <NovaOrigem /> },
  { path: ROUTE_PATHS.REGRAS.slice(1), element: <Regras /> },
  { path: ROUTE_PATHS.NOVA_REGRA.slice(1), element: <NovaRegra /> },
  { path: ROUTE_PATHS.MACROS.slice(1), element: <Macros /> },
  { path: 'patch-notes', element: <PatchNotes /> },
  { path: ROUTE_PATHS.NUCLEO.slice(1), element: <Nucleo /> },
  { path: ROUTE_PATHS.SOBRE.slice(1), element: <Sobre /> },
];
