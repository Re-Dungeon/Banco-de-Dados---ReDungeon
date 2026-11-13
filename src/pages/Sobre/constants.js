import packageJson from '../../../package.json';

export const APP_VERSION = packageJson.version;

export const INFO_ITEMS = [
  { label: 'Versão', value: APP_VERSION },
  { label: 'Ano', value: '2026' },
  { label: 'Stack', value: 'React + Vite + MUI + Firebase' },
  { label: 'Persistência', value: 'Firebase Firestore' },
  { label: 'Autenticação', value: 'Firebase Auth' },
];
