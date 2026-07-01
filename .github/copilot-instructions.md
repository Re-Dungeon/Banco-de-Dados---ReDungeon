# Copilot Instructions - Re-Dungeon Banco de Dados

## Visão Geral do Projeto

Esta é uma aplicação frontend para o **Re-Dungeon**, um banco de dados de campanha de RPG de mesa. Ela permite gerenciar NPCs, Mesas, Mundo, Recursos, Regras, Macros e outras informações relevantes para sessões de RPG.

### Tech Stack
- **React 19** com **Vite** como bundler
- **Material-UI (@mui/material)** para componentes de UI
- **Styled Components** para estilização customizada
- **React Router DOM v7** para navegação
- **Formik** com **Yup** para formulários e validação
- **Chart.js** com **react-chartjs-2** para visualizações de dados
- **localStorage** como camada de persistência de dados (via `service/storage.js`)

### Persistência de Dados
Toda a persistência é feita via **localStorage** através do serviço `src/service/storage.js`. Não há backend ou API externa. As chaves de armazenamento seguem o prefixo `redungeon_`.

---

## Arquitetura

### Estrutura de Pastas
```
src/
├── assets/            # Imagens e recursos estáticos
├── common/
│   ├── constants/     # Constantes globais (rotas, itens de nav)
│   └── styles/        # CSS global e estilos compartilhados
├── components/        # Componentes reutilizáveis (Header, Layout, Sidebar)
├── pages/             # Páginas da aplicação
│   ├── Macros/
│   ├── Mesas/
│   ├── Mundo/
│   ├── NPCs/
│   ├── Nucleo/
│   ├── PatchNotes/
│   ├── Recursos/
│   ├── Regras/
│   └── Sobre/
├── routes/            # Definição das rotas
└── service/
    └── storage.js     # Camada de acesso ao localStorage
```

### Padrão de Arquivos por Página
Cada página pode conter:
- **`NomePagina.jsx`** — Componente principal da página
- **`styles.js`** — Styled components da página
- **`constants.js`** — Constantes específicas da página (listas, enums, etc.)
- **`utils.js`** — Funções utilitárias e schemas Yup

---

## Padrões de Código

### Convenções JavaScript/JSX

#### Regras Gerais
- Use **ES6+** (arrow functions, destructuring, template literals)
- Prefira **const** sobre let; evite var
- Use **async/await** quando aplicável
- Siga princípios de **programação funcional** onde possível

#### Nomenclatura
- **camelCase** para variáveis, funções e métodos
- **PascalCase** para componentes e classes
- **SCREAMING_SNAKE_CASE** para constantes
- **PascalCase** para nomes de arquivos de componentes

#### Organização de Imports
```javascript
// 1. Bibliotecas externas
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { Formik, Form } from 'formik';

// 2. Serviços e utilitários internos (use caminhos absolutos)
import { getNPCs, addNPC } from 'service/storage';
import { MINHA_CONSTANTE } from './constants';
import { meuSchema } from './utils';

// 3. Imports relativos (estilos, componentes locais)
import { MeuStyledComponent } from './styles';
```
- **Prefira caminhos absolutos** (ex: `import X from 'service/storage'`) sobre relativos quando possível.

---

### Estrutura de Componentes React

```jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const NomeComponente = ({ prop1, prop2, onAcao }) => {
  // 1. Hooks
  const [estado, setEstado] = useState(valorInicial);

  // 2. Handlers de eventos
  const handleAcao = () => {
    // implementação
  };

  // 3. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

NomeComponente.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
  onAcao: PropTypes.func.isRequired,
};

NomeComponente.defaultProps = {
  prop2: 0,
};

export default NomeComponente;
```

---

### Estilização

#### Styled Components
- Crie componentes estilizados em arquivos `styles.js` separados.
- Use as variáveis CSS definidas em `src/common/styles/global.css`.
- Siga o padrão glassmorphism/dark theme do projeto.

```javascript
import styled from 'styled-components';
import Paper from '@mui/material/Paper';

export const MeuCard = styled(Paper)`
  padding: 20px !important;
  background: var(--bg-card) !important;
  border: 1px solid var(--border-primary) !important;
  border-radius: 12px !important;
  transition: all 0.25s ease !important;

  &:hover {
    border-color: var(--border-hover) !important;
    transform: translateY(-2px);
    box-shadow: var(--shadow-md) !important;
  }
`;
```

#### Variáveis CSS Globais Disponíveis
```css
/* Cores principais */
--color-primary: #6f2da8;
--color-accent: #00d9ff;

/* Backgrounds */
--bg-primary: #050816;
--bg-secondary: #0b1020;
--bg-card: #10182b;

/* Texto */
--text-primary
--text-secondary
--text-muted

/* Bordas e sombras */
--border-primary
--border-hover
--shadow-md
```

#### Integração com Material-UI
- Use componentes MUI como base (Box, Typography, Button, Dialog, etc.).
- Customize com prop `sx` ou styled-components.
- Mantenha o tema escuro e consistência visual em todas as páginas.

---

### Serviço de Armazenamento

Todas as operações de dados devem passar por `service/storage.js`:

```javascript
// Leitura
import { getNPCs, getMesas } from 'service/storage';

// Criação
import { addNPC, addMesa } from 'service/storage';

// Remoção
import { removeNPC, removeMesa } from 'service/storage';

// Atualização
import { updateNPC, updateMesa } from 'service/storage';
```

Ao adicionar uma nova entidade ao sistema:
1. Registre a chave em `KEYS` dentro de `storage.js`
2. Exporte as funções CRUD usando as funções genéricas internas (`getItems`, `addItem`, `removeItem`, `updateItem`)

---

### Formulários com Formik + Yup

```jsx
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const MINHA_SCHEMA = Yup.object({
  nome: Yup.string().required('Nome é obrigatório'),
  descricao: Yup.string(),
});

const MeuFormulario = ({ onSubmit, initialValues }) => (
  <Formik
    initialValues={initialValues}
    validationSchema={MINHA_SCHEMA}
    onSubmit={onSubmit}
  >
    {({ errors, touched, isSubmitting }) => (
      <Form>
        {/* campos */}
      </Form>
    )}
  </Formik>
);
```

- Coloque o schema Yup no arquivo `utils.js` da página.

---

### Rotas

Para adicionar uma nova rota:
1. Adicione o caminho em `src/common/constants/routes.js` (em `ROUTE_PATHS` e `PAGE_TITLES`)
2. Adicione o item de navegação em `src/common/constants/navItems.js`
3. Registre a rota em `src/routes/index.jsx`
4. Crie a pasta e o componente em `src/pages/NovaPagina/`

---

## Fluxo de Desenvolvimento

### Verificação de Qualidade
Antes de commitar, sempre execute:
```bash
# Verificar erros de lint
npm run eslint

# Corrigir automaticamente
npm run eslint-fix

# Formatar arquivos modificados
npx prettier --write "src/path/to/modified/file.jsx"
```

> Evite rodar `npm run prettier` em todo o projeto. Formate apenas os arquivos modificados.

### Comandos Principais
```bash
npm run dev       # Servidor de desenvolvimento
npm run build     # Build de produção
npm run preview   # Pré-visualizar o build
npm run eslint    # Verificar lint
```

---

## Diretrizes de Performance

- Use `React.memo()` para componentes que recebem as mesmas props frequentemente.
- Use `useCallback` e `useMemo` quando evitar re-renders desnecessários for relevante.
- Inicialize estado de localStorage com função lazy: `useState(() => getItems())`.

---

## Considerações de Segurança

- Sanitize inputs do usuário antes de salvar no localStorage.
- Não armazene dados sensíveis no localStorage.
- Valide dados no frontend com Yup antes de persistir.
- Siga as diretrizes OWASP para segurança no cliente.

---

## Acessibilidade (a11y)

- Use elementos HTML semânticos.
- Implemente atributos ARIA adequados.
- Garanta navegação por teclado nos modais e formulários.
- Mantenha contraste de cores suficiente (o tema atual usa fundo escuro com texto claro).

---

## Diretrizes de Code Review

### O Que Verificar
- Código segue os padrões e convenções estabelecidos
- Componentes possuem PropTypes definidos
- Dados são lidos e escritos via `service/storage.js`
- Imports usam caminhos absolutos por padrão
- Nenhum `console.log` em código de produção
- Estilos seguem o sistema de variáveis CSS globais
- Formulários usam Formik + Yup

### Ações Obrigatórias Antes do Merge
1. ✅ ESLint sem erros ou avisos
2. ✅ Prettier aplicado nos arquivos modificados
3. ✅ PropTypes definidos em todos os componentes
4. ✅ Sem `console.log` em código de produção
5. ✅ Testado manualmente no navegador
