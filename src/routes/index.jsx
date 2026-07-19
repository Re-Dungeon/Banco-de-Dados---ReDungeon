import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from 'common/constants/routes';

const Recursos = lazy(() => import('pages/Recursos/Recursos'));
const Racas = lazy(() => import('pages/Recursos/Racas/Racas'));
const NovaRaca = lazy(() => import('pages/Recursos/Racas/NovaRaca'));
const Itens = lazy(() => import('pages/Recursos/Itens/Itens'));
const NovoItem = lazy(() => import('pages/Recursos/Itens/NovoItem'));
const Materiais = lazy(() => import('pages/Recursos/Materiais/Materiais'));
const NovoMaterial = lazy(
  () => import('pages/Recursos/Materiais/NovoMaterial'),
);
const Classes = lazy(() => import('pages/Recursos/Classes/Classes'));
const NovaClasse = lazy(() => import('pages/Recursos/Classes/NovaClasse'));
const Receitas = lazy(() => import('pages/Recursos/Receitas/Receitas'));
const NovaReceita = lazy(() => import('pages/Recursos/Receitas/NovaReceita'));
const Condicoes = lazy(() => import('pages/Recursos/Condicoes/Condicoes'));
const NovaCondicao = lazy(
  () => import('pages/Recursos/Condicoes/NovaCondicao'),
);
const Artes = lazy(() => import('pages/Recursos/Artes/Artes'));
const NovaArte = lazy(() => import('pages/Recursos/Artes/NovaArte'));
const Origens = lazy(() => import('pages/Recursos/Origens/Origens'));
const NovaOrigem = lazy(() => import('pages/Recursos/Origens/NovaOrigem'));
const CardFlux = lazy(() => import('pages/Recursos/CardFlux/CardFlux'));
const NovoCardFlux = lazy(() => import('pages/Recursos/CardFlux/NovoCardFlux'));
const Regras = lazy(() => import('pages/Regras/Regras'));
const NovaRegra = lazy(() => import('pages/Regras/NovaRegra'));
const VeiasAstrais = lazy(
  () => import('pages/Recursos/VeiasAstrais/VeiasAstrais'),
);
const NovaVeiaAstral = lazy(
  () => import('pages/Recursos/VeiasAstrais/NovaVeiaAstral'),
);
const PatchNotes = lazy(() => import('pages/PatchNotes/PatchNotes'));
const Sobre = lazy(() => import('pages/Sobre/Sobre'));

export const ROUTES = [
  { index: true, element: <Navigate to={ROUTE_PATHS.RACAS} replace /> },
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
  { path: ROUTE_PATHS.CARDFLUX.slice(1), element: <CardFlux /> },
  { path: ROUTE_PATHS.NOVO_CARDFLUX.slice(1), element: <NovoCardFlux /> },
  { path: ROUTE_PATHS.REGRAS.slice(1), element: <Regras /> },
  { path: ROUTE_PATHS.NOVA_REGRA.slice(1), element: <NovaRegra /> },
  { path: ROUTE_PATHS.VEIAS_ASTRAIS.slice(1), element: <VeiasAstrais /> },
  {
    path: ROUTE_PATHS.NOVA_VEIA_ASTRAL.slice(1),
    element: <NovaVeiaAstral />,
  },
  { path: ROUTE_PATHS.PATCH_NOTES.slice(1), element: <PatchNotes /> },
  { path: ROUTE_PATHS.SOBRE.slice(1), element: <Sobre /> },
];
