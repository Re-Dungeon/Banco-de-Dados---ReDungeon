# Claude Instructions - Re-Dungeon Banco de Dados

## Visão Geral do Projeto

Esta é uma aplicação frontend para o **Re-Dungeon**, um banco de dados de campanha de RPG de mesa. Ela permite gerenciar Classes, Raças, Itens, Materiais, Condições, Artes, Origens, Receitas, CardFlux, Veias Astrais e Regras, entre outras informações relevantes para sessões de RPG.

### Tech Stack
- **React 19** com **Vite** como bundler
- **Material-UI (@mui/material)** para componentes de UI
- **Styled Components** para estilização customizada
- **React Router DOM v7** para navegação
- **Formik** com **Yup** para formulários e validação
- **Chart.js** com **react-chartjs-2** para visualizações de dados
- **Firebase/Firestore** como camada de persistência de dados (via `service/storage.js`)
- **Firebase Auth** para autenticação de usuários

### Persistência de Dados
Toda a persistência é feita via **Firebase/Firestore** através do serviço `src/service/storage.js`. Não há uso de `localStorage` no projeto — cada entidade (Classes, Materiais, Raças, Itens, Receitas, Condições, Artes, Origens, Regras, CardFlux, Veias Astrais) é uma coleção Firestore própria, acessada por funções CRUD (`get*`/`add*`/`remove*`/`update*`) que seguem o mesmo padrão genérico. As coleções `Universo` e `userPermissions` são somente-leitura pelo frontend (`getUniversos`, `getUserPermissions`).

---

## Arquitetura

### Estrutura de Pastas
```
src/
├── assets/            # Imagens e recursos estáticos
├── common/
│   ├── constants/     # Constantes globais (rotas, itens de nav)
│   ├── styles/        # CSS global e estilos compartilhados
│   └── utils/         # Utilitários compartilhados (ex.: schemas Yup reutilizáveis)
├── components/        # Componentes reutilizáveis (Header, Layout, Sidebar)
├── hooks/             # Hooks reutilizáveis (ex.: usePermissions, useStableListKeys)
├── pages/             # Páginas da aplicação
│   ├── PatchNotes/
│   ├── Recursos/
│   │   ├── Artes/
│   │   ├── CardFlux/
│   │   ├── Classes/
│   │   ├── Condicoes/
│   │   ├── Itens/
│   │   ├── Materiais/
│   │   ├── Origens/
│   │   ├── Racas/
│   │   ├── Receitas/
│   │   └── VeiasAstrais/
│   ├── Regras/
│   └── Sobre/
├── routes/            # Definição das rotas
└── service/
    └── storage.js     # Camada de acesso ao Firestore
```

### Autenticação e Permissões

A aplicação usa **Firebase Auth** (`src/service/firebase.js`) com três fluxos de login: e-mail/senha, cadastro e Google (popup).

- **`src/context/AuthContext.jsx`** — `AuthProvider` + hook `useAuth()`. Expõe `{ currentUser, loading, login, signup, loginWithGoogle, logout, isAdmin, allowedUniversos, loadingPermissions, canCreate, canWrite }`.
- **`src/hooks/usePermissions.js`** — `usePermissions(currentUser)` calcula permissões a partir do documento `userPermissions/{uid}` no Firestore:
  - `isAdmin`: booleano.
  - `allowedUniversos`: lista de IDs de Universo em que o usuário pode escrever.
  - `canCreate()`: `true` se `isAdmin` ou `allowedUniversos.length > 0`.
  - `canWrite(universoId)`: `true` se `isAdmin` ou `universoId` está em `allowedUniversos`.
- **`src/components/ProtectedRoute/ProtectedRoute.jsx`** — guarda de rota (layout route) que bloqueia acesso enquanto `loading` é `true` ou quando não há `currentUser`; não valida `canCreate`/`canWrite` (isso é feito dentro de cada página).
- **`src/components/LoginModal/LoginModal.jsx`** — UI de login (e-mail/senha + Google), consumida via `useAuth()`.

Ao criar uma página com operações de escrita, use `canCreate()`/`canWrite(universoId)` de `useAuth()` para exibir/ocultar botões de criar, editar e remover.

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
import { getRacas, getItens } from 'service/storage';

// Criação
import { addRaca, addIten } from 'service/storage';

// Remoção
import { removeRaca, removeIten } from 'service/storage';

// Atualização
import { updateRaca, updateIten } from 'service/storage';
```

Ao adicionar uma nova entidade ao sistema:
1. Crie a coleção correspondente no Firestore.
2. Exporte as funções `get*`/`add*`/`remove*`/`update*` em `storage.js`, seguindo o mesmo padrão das entidades existentes (`getDocs`/`addDoc`/`deleteDoc`/`updateDoc` com `createdAt`/`updatedAt` via `serverTimestamp()`).

---

### Formulários com Formik + Yup

```jsx
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { nomeSchema, descricaoSchema } from 'common/utils/yupSchemas';

const MINHA_SCHEMA = Yup.object({
  nome: nomeSchema,
  descricao: descricaoSchema,
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

- Coloque o schema Yup específico da página no arquivo `utils.js` da página.
- Reutilize os validadores genéricos de `src/common/utils/yupSchemas.js` em vez de repetir `Yup.string()` cru em cada página:
  - `nomeSchema` — obrigatório, `trim()`, máximo `NOME_MAX` (100) caracteres.
  - `campoCurtoSchema` — opcional, `trim()`, máximo `CAMPO_CURTO_MAX` (300) caracteres.
  - `descricaoSchema` — opcional, `trim()`, máximo `DESCRICAO_MAX` (2000) caracteres.
  - `urlImagemSchema` — opcional, `trim()`, valida formato de URL (usado em todo campo `linkImagem`).
- Ao exibir o campo `linkImagem`, mostre erro/helperText de validação (`touched.linkImagem && Boolean(errors.linkImagem)`), assim como qualquer outro campo com schema próprio.
- Em listas dinâmicas via `FieldArray` (ex.: habilidades), **nunca use o índice do array como `key`** do React — ao remover um item do meio da lista isso faz o conteúdo dos itens seguintes "colar" na posição errada, principalmente com `FastField`. Use o hook `src/hooks/useStableListKeys.js`, que gera um id estável por item:
  ```jsx
  const habilidadesKeys = useStableListKeys(values.habilidades.length);
  // no map: key={habilidadesKeys.keys[idx] ?? idx}
  // ao adicionar: habilidadesKeys.addKey(); push({ ...ITEM_INICIAL });
  // ao remover: habilidadesKeys.removeKey(idx); remove(idx);
  ```
  Para listas apenas de leitura (fora de um `FieldArray`), uma key derivada do conteúdo (ex.: `` `${item.nome}-${i}` ``) já resolve o problema sem precisar do hook.

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

O ESLint (`eslint.config.js`) inclui `eslint-plugin-jsx-a11y` (regras de acessibilidade) e `eslint-config-prettier` (desativa regras de estilo que conflitam com o Prettier). `no-console` e `react-hooks/exhaustive-deps` são erros (não apenas avisos) — corrija antes de commitar em vez de suprimir.

### Comandos Principais
```bash
npm run dev       # Servidor de desenvolvimento
npm run build     # Build de produção
npm run preview   # Pré-visualizar o build
npm run eslint    # Verificar lint
npm run test      # Executar testes (Vitest + Testing Library)
```

Utilitários e hooks compartilhados (`src/common/utils/`, `src/hooks/`) devem ter um arquivo `*.test.js` correspondente (ex.: `yupSchemas.test.js`, `useStableListKeys.test.js`).

---

## Diretrizes de Performance

- Use `React.memo()` para componentes que recebem as mesmas props frequentemente.
- Use `useCallback` e `useMemo` quando evitar re-renders desnecessários for relevante.
- Inicialize estado com função lazy quando o valor inicial exigir cálculo custoso: `useState(() => calcularValorInicial())`.

---

## Considerações de Segurança

- Sanitize inputs do usuário antes de persistir no Firestore.
- A autorização de escrita é reforçada em duas camadas: no frontend, via `canCreate()`/`canWrite(universoId)` (`useAuth()`), usados para esconder ações não permitidas na UI; e no backend, via **regras de segurança do Firestore** (`firestore.rules`), que é a camada que efetivamente impede escrita não autorizada — nunca confie somente na checagem de UI.
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
- Formulários usam Formik + Yup, reaproveitando os schemas de `common/utils/yupSchemas.js` quando aplicável
- Listas renderizadas a partir de `FieldArray` usam `useStableListKeys` (ou uma key derivada do conteúdo) em vez do índice do array

### Ações Obrigatórias Antes do Merge
1. ✅ ESLint sem erros ou avisos
2. ✅ Prettier aplicado nos arquivos modificados
3. ✅ PropTypes definidos em todos os componentes
4. ✅ Sem `console.log` em código de produção
5. ✅ Testado manualmente no navegador
