# Re-Dungeon — Banco de Dados

> v3.0.0

Sistema de gerenciamento para sessões de RPG, construído com **React + Vite**. Centraliza mesas, NPCs, recursos, regras, macros e muito mais em uma interface única.

---

## Requisitos

- [Node.js](https://nodejs.org/) v22 ou superior
- npm v10 ou superior

---

## Instalação

```bash
npm install
```

---

## Comandos úteis

| Comando              | O que faz                                             |
| -------------------- | ----------------------------------------------------- |
| `npm install`        | Instala as dependências do projeto                    |
| `npm run dev`        | Inicia o servidor de desenvolvimento com hot-reload   |
| `npm run build`      | Gera o build otimizado para produção na pasta `dist/` |
| `npm run preview`    | Serve o build de produção localmente para testes      |
| `npm run eslint`     | Analisa o código com ESLint                           |
| `npm run eslint-fix` | Corrige automaticamente problemas do ESLint           |
| `npm run prettier`   | Formata o código com Prettier                         |

---

## Desenvolvimento local

```bash
npm run dev
```

Acesse em: `http://localhost:5173`

---

## Páginas

| Rota            | Descrição                              |
| --------------- | -------------------------------------- |
| `/mesas`        | Gerenciamento de mesas de RPG          |
| `/mundo`        | Informações e lore do mundo da campanha |
| `/npcs`         | Cadastro e gerenciamento de NPCs       |
| `/recursos`     | Recursos e materiais da campanha       |
| `/regras`       | Regras do sistema                      |
| `/macros`       | Macros e automações                    |
| `/patch-notes`  | Histórico de atualizações              |
| `/nucleo`       | Configurações e núcleo do sistema      |
| `/sobre`        | Informações sobre o projeto            |

---

## Estrutura do projeto

```
src/
├── App.jsx
├── main.jsx
├── common/
│   ├── constants/       # Rotas e itens de navegação
│   ├── styles/          # Estilos globais
│   └── utils/           # Utilitários (storage, etc.)
├── components/
│   ├── Header/
│   ├── Layout/
│   └── Sidebar/
├── pages/               # Uma pasta por página
├── routes/              # Configuração do React Router
└── service/             # Camada de serviço e persistência
```

---

## Tecnologias

- [React 19](https://react.dev/)
- [React Router DOM 7](https://reactrouter.com/)
- [Vite 8](https://vitejs.dev/)
- [MUI (Material UI) 9](https://mui.com/)
- [Styled Components 6](https://styled-components.com/)
- [Chart.js 4](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/)
- [Formik](https://formik.org/) + [Yup](https://github.com/jquense/yup)
- [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)
