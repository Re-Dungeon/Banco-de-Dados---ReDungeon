import React from 'react';
import { Navigate } from 'react-router-dom';
import Mesas from 'pages/Mesas/Mesas';
import Mundo from 'pages/Mundo/Mundo';
import NPCs from 'pages/NPCs/NPCs';
import Recursos from 'pages/Recursos/Recursos';
import Racas from 'pages/Recursos/Racas/Racas';
import NovaRaca from 'pages/Recursos/Racas/NovaRaca';
import Classes from 'pages/Recursos/Classes/Classes';
import NovaClasse from 'pages/Recursos/Classes/NovaClasse';
import Regras from 'pages/Regras/Regras';
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
  { path: ROUTE_PATHS.CLASSES.slice(1), element: <Classes /> },
  { path: ROUTE_PATHS.NOVA_CLASSE.slice(1), element: <NovaClasse /> },
  { path: ROUTE_PATHS.REGRAS.slice(1), element: <Regras /> },
  { path: ROUTE_PATHS.MACROS.slice(1), element: <Macros /> },
  { path: 'patch-notes', element: <PatchNotes /> },
  { path: ROUTE_PATHS.NUCLEO.slice(1), element: <Nucleo /> },
  { path: ROUTE_PATHS.SOBRE.slice(1), element: <Sobre /> },
];
