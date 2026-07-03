export const NAV_ITEMS = [
  //{ path: '/mesas', icon: '⬡', label: 'Mesas' },
  //{ path: '/mundo', icon: '◉', label: 'World' },
  //{ path: '/npcs', icon: '👤', label: 'NPCs' },
  {
    path: '/recursos',
    icon: '◆',
    label: 'Recursos',
    children: [
      { path: '/recursos/racas', icon: '🧬', label: 'Raças' },
      { path: '/recursos/classes', icon: '⚔️', label: 'Classes' },
    ],
  },
  //{ path: '/regras', icon: '📋', label: 'Regras' },
  //{ path: '/macros', icon: '⚙', label: 'Macros' },
];

export const NAV_ITEMS_SECONDARY = [
  //{ path: '/patch-notes', icon: '📄', label: 'Patch Notes' },
  //{ path: '/nucleo', icon: '⚡', label: 'Núcleo' },
  { path: '/sobre', icon: 'ⓘ', label: 'Sobre' },
];
