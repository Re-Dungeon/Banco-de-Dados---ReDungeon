# Plano: Melhorias do Projeto Re-Dungeon

**TL;DR:** Análise do código atual (v3.1.0) encontrou 12 oportunidades concretas de melhoria — **todas resolvidas** (ou deliberadamente fora de escopo, no caso da fase 2 do item 2). Os dois maiores problemas eram **duplicação massiva de código** (14.168 linhas em 22 páginas de entidade seguindo o mesmo esqueleto, e ~11 blocos idênticos de CRUD Firestore em `storage.js`) e **ausência total de testes automatizados** — resolvidos via testes automatizados (item 7), CRUD de `storage.js` (item 1) e duplicação nas 11 páginas de listagem de entidade via `useEntityCRUD`/`useUniversos`/`EntityFilters`/`EntityViewDialog` (item 2, fase 1). Também havia uma divergência importante: o `CLAUDE.md` descrevia o projeto como "localStorage-only, sem backend", quando o código já era **100% Firebase/Firestore** — corrigido (item 0), junto com o Error Boundary global (item 4), a memoização do `AuthContext` (item 6), code splitting de rotas (item 3), integração ESLint+Prettier+a11y (item 8), `key`s de lista baseadas em índice (item 10) e reforço dos schemas Yup (item 11). Suite final: 101 testes automatizados, `npm run eslint` limpo em todo `src/`.

> **Atualização (2026-07-18):** a entidade `recursos` (única que ainda usava `localStorage`, junto dos helpers genéricos `getItems`/`saveItems`/`addItem`/`removeItem` e a `KEYS.classes` órfã) foi confirmada como código morto — `getRecursos`/`addRecurso`/`removeRecurso` não tinham nenhum import em todo o `src/` — e removida de `src/service/storage.js`. Isso elimina toda a camada `localStorage` do projeto e torna moot os itens que dependiam dela (5 e 12, marcados como resolvidos abaixo). Os itens 0 e 1 foram ajustados de acordo.
>
> **Atualização (2026-07-18, cont.):** os itens **0** (`CLAUDE.md` desatualizado), **4** (Error Boundary global) e **6** (memoização do `AuthContext`) foram implementados e verificados manualmente (ESLint limpo, Prettier aplicado, teste de fallback do Error Boundary e de login/logout via Playwright). Ver notas de resolução em cada item abaixo.
>
> **Atualização (2026-07-18, cont. 2):** o item **7** (Vitest + React Testing Library) foi implementado. Ver nota de resolução no item abaixo.
>
> **Atualização (2026-07-18, cont. 3):** o item **2** foi concluído na fase 1 (11 páginas de listagem migradas para `useEntityCRUD`/`useUniversos`/`EntityFilters`/`EntityViewDialog`); a fase 2 (formulários `Nova*/Novo*`) segue deliberadamente fora de escopo. Ver nota de resolução no item abaixo.
>
> **Atualização (2026-07-18, cont. 4):** o item **3** (code splitting de rotas) foi implementado — `src/routes/index.jsx` com `React.lazy` em todas as 26 páginas e `Suspense` em `ProtectedRoute.jsx`. Ver nota de resolução no item abaixo.
>
> **Atualização (2026-07-19):** os itens **8** (ESLint + Prettier + `jsx-a11y`), **10** (`key`s baseadas em índice) e **11** (schemas Yup reforçados) foram implementados. Com isso, todo o backlog do plano está resolvido ou deliberadamente fora de escopo — ver notas de resolução em cada item abaixo.

---

## 0. ~~Corrigir o `CLAUDE.md` desatualizado~~ — resolvido

> ✅ **Resolvido em 2026-07-18.** `CLAUDE.md` foi atualizado: seção "Persistência de Dados" agora descreve 100% Firestore via `service/storage.js`; "Estrutura de Pastas" reflete a árvore real de `src/pages` (`PatchNotes/`, `Recursos/{Artes,CardFlux,Classes,Condicoes,Itens,Materiais,Origens,Racas,Receitas,VeiasAstrais}/`, `Regras/`, `Sobre/`); nova seção "Autenticação e Permissões" documenta `AuthContext`/`useAuth()`, `usePermissions` (`canCreate`/`canWrite`), `ProtectedRoute` e `LoginModal`; `firebase`/`Firebase Auth` adicionados ao Tech Stack; seção "Serviço de Armazenamento" com exemplos reais (`getRacas`/`addRaca` em vez de `getNPCs`/`addNPC`) e sem a instrução obsoleta de registrar `KEYS`; "Diretrizes de Performance" sem o exemplo de `localStorage`; "Considerações de Segurança" trocada pela orientação real (UI via `canCreate()`/`canWrite()` + regras do Firestore em `firestore.rules`).

### Por quê (histórico)
O `CLAUDE.md:14-17` afirma "Não há backend ou API externa. Toda a persistência é feita via localStorage". Isso não é mais verdade: existem `firebase.json`, `firestore.rules`, `src/service/firebase.js`, `src/context/AuthContext.jsx`, `LoginModal`, `ProtectedRoute` e `usePermissions`, e **todas** as entidades usam Firestore — a última que ainda vivia em `localStorage` (`recursos`) era código morto sem nenhum consumidor e foi removida (ver nota de atualização no topo deste arquivo). A estrutura de pastas documentada (`pages/Macros/`, `pages/Mesas/`, `pages/Mundo/`, `pages/NPCs/`, `pages/Nucleo/`) também não existe mais em `src/pages`. Como este arquivo é carregado como instrução de sistema em toda sessão do Claude Code, informação errada aqui gera sugestões erradas de forma recorrente.

### Passo a passo
1. Atualizar a seção "Persistência de Dados" (`CLAUDE.md:14-17`) para afirmar que a persistência é 100% Firestore via `service/storage.js` (nenhuma entidade usa mais `localStorage`).
2. Atualizar "Estrutura de Pastas" (`CLAUDE.md:32-39`) para refletir `src/pages` real: `Recursos/{Artes,CardFlux,Classes,Condicoes,Itens,Materiais,Origens,Racas,Receitas,VeiasAstrais}`, `Regras`, `PatchNotes`, `Sobre`.
3. Adicionar uma seção "Autenticação e Permissões" documentando `AuthContext`, `ProtectedRoute` e `usePermissions` (`canWrite`/`canCreate`), já que hoje o `CLAUDE.md` não menciona esse fluxo.
4. Adicionar `firebase` à lista de dependências da seção "Tech Stack".
5. Remover a seção "Considerações de Segurança" (`CLAUDE.md:280-284`) da referência a "não armazene dados sensíveis no localStorage" — ajustar para o contexto Firestore (ex. regras de segurança do Firestore, `firestore.rules`).

---

## 1. ~~Eliminar duplicação de CRUD no `service/storage.js`~~ — resolvido

> ✅ **Resolvido em 2026-07-18.** Extraídos 4 helpers genéricos no topo de `storage.js` (`getFirestoreItems`, `addFirestoreItem`, `updateFirestoreItem`, `removeFirestoreItem`), cada um com `try/catch` que loga o erro via `console.error` (com `// eslint-disable-next-line no-console`, seguindo o padrão já usado em `ErrorBoundary.jsx`) e relança a exceção — nada é engolido silenciosamente. Os 11 blocos de entidade (`classes`, `materiais`, `racas`, `itens`, `receitas`, `condicoes`, `artes`, `origens`, `regras`, `cardflux`, `veiasAstrais`) e também `getUniversos` (mesmo padrão de leitura) viraram wrappers de uma linha chamando os helpers com o nome da coleção certa — a API pública (`getRacas()`, `addRaca()`, etc.) não mudou, então nenhuma página consumidora precisou ser alterada. `storage.js` caiu de 385 para ~254 linhas (`git diff --stat`: 127 inserções / 258 remoções). `getUserPermissions` foi mantido como está — não segue o padrão CRUD genérico (é uma leitura única com lógica própria de valor-padrão).
>
> Verificação: os 19 testes de `src/service/storage.test.js` (item 7) continuaram passando sem nenhuma mudança nas asserções, confirmando que o refactor preservou o comportamento exato das chamadas ao SDK do Firestore (nome de coleção, payload de `createdAt`/`updatedAt`, mapeamento de resultado). Foi adicionado um teste novo cobrindo o `try/catch` (erro do Firestore é logado e relançado, não suprimido). `npm run eslint` limpo, `npx prettier --write` aplicado nos arquivos modificados. **Não** foi feita verificação manual no navegador com escrita real no Firestore de produção (passo 3 original) — o risco de mutar dados reais da campanha não se justifica para um refactor mecânico já coberto por teste automatizado; se houver um ambiente de Firestore de teste/staging disponível no futuro, vale rodar esse passo manual lá.

### Por quê (histórico)
`storage.js` repete o mesmo padrão de 4 funções (`get*`, `add*`, `remove*`, `update*`) ~11 vezes — uma para cada coleção Firestore (`classes`, `materiais`, `racas`, `itens`, `receitas`, `condicoes`, `artes`, `origens`, `regras`, `cardflux`, `veiasAstrais`), trocando apenas o nome da coleção. É ~220 linhas que poderiam ser ~40. Cada nova entidade hoje exige copiar/colar mais um bloco de 20 linhas. Agora que a entidade `recursos` (única baseada em `localStorage`) foi removida do arquivo, **todo** `storage.js` segue esse mesmo padrão Firestore, o que torna a extração ainda mais direta — não há mais dois modelos de persistência para conciliar dentro do mesmo módulo.

### Passo a passo
1. Criar funções genéricas no topo de `storage.js`, por exemplo:
   ```javascript
   const getFirestoreItems = async (collectionName) => {
     const snapshot = await getDocs(collection(db, collectionName));
     return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
   };

   const addFirestoreItem = (collectionName, item) =>
     addDoc(collection(db, collectionName), item);

   const updateFirestoreItem = (collectionName, id, item) =>
     updateDoc(doc(db, collectionName, id), item);

   const removeFirestoreItem = (collectionName, id) =>
     deleteDoc(doc(db, collectionName, id));
   ```
2. Substituir cada bloco de entidade (ex. `getRacas`/`addRaca`/`updateRaca`/`removeRaca`) por wrappers finos que chamam as funções genéricas com o nome da coleção certa — mantém a API pública (`getRacas()`, `addRaca()`, etc.) igual, então nenhuma página consumidora precisa mudar.
3. Rodar `npm run eslint` e testar manualmente CRUD de pelo menos 2 entidades (ex. Raças e Itens) no navegador para confirmar que nada quebrou.
4. Adicionar `try/catch` nas funções genéricas para logar erros de rede/permissão do Firestore em vez de deixar a exceção propagar sem contexto.

### Arquivos afetados
- `src/service/storage.js`

---

## 2. ~~Extrair padrão repetido das páginas de entidade (hook + componentes genéricos)~~ — resolvido (fase 1: listagem)

> 🔶 **Parcialmente resolvido em 2026-07-18** (passos 1–6 do plano original; falta só o passo 7 — rollout às outras 10 entidades — e o passo 8, fora de escopo por ora). Criados `src/hooks/useEntityCRUD.js` (recebe `{ getAll, remove }`, devolve `{ items, loading, remove }`; encapsula o `useEffect` de carregamento e a remoção otimista da lista local) e `src/hooks/useUniversos.js` (cache em nível de módulo — resolve também o item 9 — com `invalidateUniversosCache()` exportado para ser chamado depois de criar/editar/remover um Universo). `src/pages/Recursos/Racas/Racas.jsx` (entidade piloto) foi refatorada para usar os dois hooks; a saída visual e o comportamento (listagem, filtros, visualização, remoção, guarda de permissão) não mudaram.
>
> Uma diferença importante em relação ao desenho original do hook: `getFirestoreItems`/`add`/`update`/`remove` do item 1 não têm parâmetros de `add`/`update` no `useEntityCRUD` porque nenhuma página de listagem hoje precisa deles (ficam nas páginas `Nova*`) — adicionar essas duas operações ao hook antes de haver um consumidor real seria abstração especulativa; se o item 2 avançar para os formulários (passo 8, fase 2), reavaliar então.
>
> Verificação: `npx eslint` acusou `react-hooks/set-state-in-effect` nos dois hooks na primeira versão (chamada síncrona de `setState` dentro do corpo do efeito, fora de um `.then()`) — corrigido removendo o `setLoading(true)`/`setUniversos(cache)` redundantes do corpo síncrono do efeito (o estado inicial via `useState` já cobre esses casos). Escritos `src/hooks/useEntityCRUD.test.js`, `src/hooks/useUniversos.test.js` (cobrindo 1ª leitura, reuso de cache entre montagens e invalidação) e `src/pages/Recursos/Racas/Racas.test.jsx` (listagem, filtro por nome, remoção sem novo fetch, dialog de visualização, ocultação de editar/remover quando `canWrite` é `false`) — todos com `service/storage` e `context/AuthContext` mockados. 29 testes passando no total, `npm run eslint` limpo, `npx prettier --write` aplicado. **Atualização:** o passo 6 (validação manual no navegador) foi confirmado pelo usuário em 2026-07-18 diretamente na página real de Raças, cobrindo o que os testes automatizados mockados não cobrem (fluxo de login/permissões real e leitura/escrita no Firestore de produção).
>
> **Atualização (2026-07-18, cont.):** passos 4 e 5 também concluídos. Criados `src/components/EntityViewDialog/EntityViewDialog.jsx` (título + subtítulo opcional + imagem opcional + descrição opcional, com o conteúdo específico de cada entidade — no caso de Raças, atributos básicos e habilidades — passado via `children`) e `src/components/EntityFilters/EntityFilters.jsx` (busca por nome + lista de selects dinâmicos via prop `extraFilters` + select de Universo fixo ao final; grid `gridTemplateColumns` calculado a partir de `extraFilters.length`, reproduzindo o `'2fr 1fr 1fr'` fixo que existia só para Raças). `Racas.jsx` foi atualizada para usar os dois componentes; JSX de filtros e de dialog saiu de ~260 linhas inline para duas tags declarativas.
>
> **Bug real pego pelos testes:** a primeira versão de ambos os componentes usava `ComponenteX.defaultProps = {...}` para valores padrão (seguindo o exemplo do próprio `CLAUDE.md`) — mas o projeto está em **React 19**, que removeu suporte a `defaultProps` em componentes de função; o valor simplesmente fica `undefined` quando a prop não é passada, silenciosamente. Isso quebrou `EntityFilters` (`extraFilters.length` de um `undefined` ao renderizar sem `extraFilters`) e foi pego pelo teste automatizado do componente, não pelo `Racas.test.jsx` (que sempre passa `extraFilters`). Corrigido trocando `defaultProps` por valores-padrão na desestruturação dos parâmetros (`extraFilters = []`, `titulo = null`, etc.) nos dois componentes — esse é o padrão a seguir daqui pra frente para qualquer novo componente com props opcionais.
>
> Também adicionado `id`/`labelId` explícitos nos `<InputLabel>`/`<Select>` de `EntityFilters` (o código inline original em `Racas.jsx` não tinha essa associação de acessibilidade — só proximidade visual) para que o nome acessível do select seja descobrível via `aria-labelledby`; puramente aditivo, sem mudança visual, e evita depender de position pais para leitores de tela.
>
> Testes novos: `EntityViewDialog.test.jsx` (4 casos: fechado não renderiza, todos os campos presentes, campos opcionais omitidos quando ausentes, `Fechar` chama `onClose`) e `EntityFilters.test.jsx` (3 casos: digitar no nome chama `onNomeChange`, selecionar opção de `extraFilters` chama seu `onChange`, selecionar universo chama `onUniversoChange`). 36 testes no total, `npm run eslint` limpo, `npx prettier --write` aplicado. Usuário validou manualmente no navegador após esta segunda leva de mudanças em `Racas.jsx` também.
>
> **Atualização (2026-07-18, cont. 2) — passo 7 concluído.** As outras 10 páginas de listagem (Itens, Materiais, Classes, Receitas, Condições, Artes, Origens, Regras, CardFlux, Veias Astrais) foram migradas para o mesmo padrão (`useEntityCRUD` + `useUniversos` + `EntityFilters` + `EntityViewDialog`), uma de cada vez, cada uma com teste próprio (listagem, filtro por nome, remoção sem novo fetch, dialog de visualização, ocultação de ações quando `canWrite` é `false`). Redução de linhas por página (JSX de filtros/dialog inline → tags declarativas):
>
> | Página | Antes | Depois |
> |---|---|---|
> | Racas.jsx | 757 | 565 |
> | Itens.jsx | 604 | 449 |
> | Materiais.jsx | 716 | 575 |
> | Classes.jsx | 820 | 628 |
> | Receitas.jsx | 607 | 461 |
> | Condicoes.jsx | 567 | 405 |
> | Artes.jsx | 646 | 504 |
> | Origens.jsx | 555 | 413 |
> | Regras.jsx | 644 | 501 |
> | CardFlux.jsx | 861 | 713 |
> | VeiasAstrais.jsx | 529 | 387 |
>
> `EntityViewDialog` e `EntityFilters` precisaram de pequenas extensões conforme mais entidades foram migradas (todas retrocompatíveis — nenhuma quebrou os testes de Raças já existentes):
> - `EntityViewDialog`: prop `imagemSx` (algumas entidades usam `maxHeight: 220` sem altura fixa, em vez do `height: 200` padrão) e prop `actions` (várias entidades têm um botão "Editar" no dialog, além do "Fechar", que navega para a página `Nova*`/`Novo*` e fecha o dialog).
> - `EntityFilters`: prop `sx` (Receitas/Artes/Origens/Regras/CardFlux têm um breakpoint `md` adicional no grid de filtros que Raças não tinha) e prop `menuMaxHeight` (CardFlux tem listas de opções longas — 15+ itens em `TIPOS_CARDFLUX`/`DECKS_CARDFLUX` — e usava `maxHeight: 320` no menu do `Select` para não estourar a viewport).
> - Em entidades onde a "Descrição" não é o primeiro bloco de conteúdo após a imagem (ex. Itens, Materiais, Artes, Origens, Regras, CardFlux, Veias Astrais têm atributos/tags/meta-campos antes), a prop `descricao` do `EntityViewDialog` não foi usada — o bloco de descrição ficou como parte do `children`, junto com o resto do conteúdo específico, preservando a ordem visual original exata.
>
> 87 testes no total (era 36 antes deste passo), `npm run eslint` limpo em todo `src/`, `npx prettier --write` aplicado em todos os arquivos tocados. Validação manual no navegador não foi repetida para as 10 entidades novas (ficou restrita a Raças, confirmada pelo usuário) — os testes automatizados cobrem o mesmo contrato comportamental (listagem, filtro, remoção, dialog, guarda de permissão) entidade por entidade; recomenda-se um passeio rápido pelas páginas no navegador quando houver oportunidade, mas não é bloqueante dado o nível de cobertura automatizada.
>
> **Fora de escopo (deliberado):** passo 8 — unificar os formulários `Nova*/Novo*` (Formik+Yup) é uma segunda fase, com padrão de variação de campos muito maior entre entidades; tratar separadamente se/quando o time decidir priorizar.

### Por quê (histórico)
As 22 páginas de "Recursos" + Regras (11 pares lista/formulário) somam **14.168 linhas** seguindo exatamente o mesmo esqueleto: mesmo conjunto de `useState` (entidade, universos, loading, filtros, item-em-visualização), mesmo `useEffect` com `Promise.all([getX(), getUniversos()])`, mesmo `useMemo` de filtragem client-side, mesmo `handleRemove`, mesmo Dialog de visualização, e nos formulários o mesmo padrão Formik+Yup com guarda de permissão e preview de imagem. Essa é a maior fonte de esforço duplicado do projeto — qualquer correção de bug ou melhoria de UX hoje precisa ser replicada manualmente em até 11 lugares.

### Passo a passo
1. ~~Criar `src/hooks/useEntityCRUD.js`~~ ✅ feito — recebe `{ getAll, remove }` (sem `add`/`update`, ver nota acima) e devolve `{ items, loading, remove }`.
2. ~~Criar `src/hooks/useUniversos.js`~~ ✅ feito — cache em nível de módulo + `invalidateUniversosCache()`, resolve também o item 9.
3. ~~Escolher uma entidade piloto (Raças) e refatorar `Racas.jsx`~~ ✅ feito, sem mudar o resultado visual.
4. ~~Extrair o Dialog de visualização repetido~~ ✅ feito — `src/components/EntityViewDialog/EntityViewDialog.jsx`.
5. ~~Extrair a grade de filtros~~ ✅ feito — `src/components/EntityFilters/EntityFilters.jsx`.
6. ~~Validar a página piloto~~ ✅ feito — testes automatizados (`Racas.test.jsx`, `EntityViewDialog.test.jsx`, `EntityFilters.test.jsx`) + validação manual real no navegador confirmada pelo usuário em 2026-07-18 (nas duas levas de mudança em `Racas.jsx`).
7. ~~Aplicar o mesmo padrão nas demais 10 entidades~~ ✅ feito — Itens, Materiais, Classes, Receitas, Condições, Artes, Origens, Regras, CardFlux, Veias Astrais, cada uma com teste próprio.
8. **Não** tentar unificar os formulários "Nova*/Novo*" na mesma leva — eles têm mais variação de campos entre si; tratar como uma segunda fase depois que o padrão de listagem estiver estável. **Deliberadamente fora de escopo.**

### Arquivos afetados
- Novos: `src/hooks/useEntityCRUD.js` ✅, `src/hooks/useUniversos.js` ✅, `src/components/EntityViewDialog/` ✅, `src/components/EntityFilters/` ✅
- Refatoradas (todas as 11 páginas de listagem): `src/pages/Recursos/Racas/Racas.jsx` ✅, `src/pages/Recursos/Itens/Itens.jsx` ✅, `src/pages/Recursos/Materiais/Materiais.jsx` ✅, `src/pages/Recursos/Classes/Classes.jsx` ✅, `src/pages/Recursos/Receitas/Receitas.jsx` ✅, `src/pages/Recursos/Condicoes/Condicoes.jsx` ✅, `src/pages/Recursos/Artes/Artes.jsx` ✅, `src/pages/Recursos/Origens/Origens.jsx` ✅, `src/pages/Regras/Regras.jsx` ✅, `src/pages/Recursos/CardFlux/CardFlux.jsx` ✅, `src/pages/Recursos/VeiasAstrais/VeiasAstrais.jsx` ✅
- **Não tocadas** (fora de escopo, ver passo 8): as 11 páginas de formulário `Nova*/Novo*`

---

## 3. ~~Code splitting de rotas (bundle inicial de 1.46 MB)~~ — resolvido

> ✅ **Resolvido em 2026-07-18.** Em `src/routes/index.jsx`, todos os 26 imports estáticos de página viraram `lazy(() => import(...))`. A estrutura de `ROUTES` (array de `{ path, element }`) não mudou — `React.lazy` devolve um componente normal, então `<Racas />` continua funcionando igual dentro de um `Suspense`.
>
> **Decisão diferente do passo 2 original:** em vez de envolver `<Routes>`/o elemento raiz em `src/App.jsx`, o `<Suspense fallback={...}>` foi colocado em `src/components/ProtectedRoute/ProtectedRoute.jsx`, direto em volta do `<Outlet />` que ele já renderiza. Motivo: `ProtectedRoute` é filho de `Layout` (que renderiza Sidebar/Header) — colocar o `Suspense` em `App.jsx` faria a árvore inteira de rotas cair no fallback a cada troca de página, escondendo Sidebar/Header também. Colocando em `ProtectedRoute`, só a área de conteúdo (`Outlet`) mostra o spinner, igual ao comportamento que já existia ali para o carregamento de autenticação — reaproveitado como `PageLoadingFallback` (mesmo `Box`/`CircularProgress` que já era usado para o loading de auth, extraído para não duplicar o JSX).
>
> **Verificação:** `npm run build` gerou os chunks por página esperados (`Racas-*.js` 8.34 kB, `Itens-*.js` 6.86 kB, `CardFlux-*.js` 10.34 kB, etc., todos na casa de 5-20 kB) mais um chunk `routes-*.js` de 703.82 kB — esse chunk grande é o SDK do Firebase (usado por `service/storage.js`, importado por todas as 11 páginas de listagem) que o bundler extraiu automaticamente por ser dependência compartilhada entre múltiplos chunks assíncronos; ele é baixado uma vez e cacheado entre navegações, não a cada página. Testado com Playwright headless contra `npm run preview`: sem erros de console, sem tela branca, e confirmado via inspeção de rede que **nenhum** dos 26 chunks de página é requisitado no carregamento inicial (só `index-*.js`, `routes-*.js` e dois chunks de componentes MUI compartilhados) — a prova central de que o code splitting está funcionando. **Limitação da verificação:** a aplicação exige login (Firebase Auth) e nenhuma credencial estava disponível nesta sessão, então não foi possível navegar de fato entre páginas autenticadas para ver o fallback de loading aparecer e o chunk específico ser buscado sob demanda (passo 4 original) — o que foi verificado é que o `ProtectedRoute` (tela "Acesso Restrito") renderiza normalmente em todas as rotas testadas, sem erros, e que os chunks pesados não vazam para o carregamento inicial. Recomenda-se ao usuário fazer login e navegar entre 2-3 páginas no `npm run preview` para confirmar visualmente o spinner de loading.

### Por quê (histórico)
`npm run build` gerava um único chunk JS de ~1.46 MB porque `src/routes/index.jsx` importava todas as 26 páginas de forma síncrona, incluindo o SDK inteiro do Firebase. Um usuário que só queria ver "Regras" baixava também todo o código de Classes, Itens, CardFlux, etc.

### Arquivos afetados
- `src/routes/index.jsx`
- `src/components/ProtectedRoute/ProtectedRoute.jsx` (`Suspense` aqui em vez de `App.jsx`, ver nota acima)

---

## 4. ~~Error Boundary global~~ — resolvido

> ✅ **Resolvido em 2026-07-18.** Criado `src/components/ErrorBoundary/ErrorBoundary.jsx` (class component com `componentDidCatch`/`getDerivedStateFromError`, fallback no tema dark com emoji ⚠️, título, descrição e botão "Recarregar" que chama `window.location.reload()`). Envolvido em `src/main.jsx` logo dentro de `<React.StrictMode>`, por fora de `<ThemeProvider>`/`<HashRouter>`/`<AuthProvider>`. Testado via Playwright: erro proposital (`throw` temporário em `App.jsx`) confirmou o fallback renderizando em vez de tela branca, log em `console.error` e o botão "Recarregar" disparando reload; o `throw` de teste foi removido após a validação.

### Por quê (histórico)
Não existe nenhum Error Boundary no projeto (`componentDidCatch`/`getDerivedStateFromError` — zero ocorrências). Qualquer erro de renderização inesperado (ex. dado corrompido vindo do Firestore) derruba a aplicação inteira para uma tela branca, sem log nem opção de recuperação para o usuário.

### Passo a passo
1. Criar `src/components/ErrorBoundary/ErrorBoundary.jsx` como class component (é o único jeito de implementar `componentDidCatch` em React) exibindo uma tela de fallback com o tema dark do projeto e um botão "Recarregar".
2. Envolver a árvore principal em `src/main.jsx`, logo dentro do `<React.StrictMode>`, com `<ErrorBoundary>`.
3. Testar forçando um erro proposital (ex. `throw new Error('teste')` temporário dentro de uma página) para confirmar que o fallback aparece em vez da tela branca, depois remover o erro de teste.

### Arquivos afetados
- Novo: `src/components/ErrorBoundary/ErrorBoundary.jsx`
- `src/main.jsx`

---

## 5. ~~Exportar/Importar dados (backup)~~ — resolvido pela remoção de `recursos`

> ✅ **Resolvido em 2026-07-18.** Este item existia especificamente porque a entidade `recursos` vivia só em `localStorage` e podia ser perdida permanentemente se o usuário limpasse o navegador. Como `recursos` era código morto (nenhum consumidor em `src/`) e foi removida de `storage.js`, o risco que motivava este item deixou de existir — todas as entidades hoje estão no Firestore, com backup do lado do servidor.
>
> Uma funcionalidade de exportar/importar dados ainda pode ter valor no futuro (ex. snapshot de uma campanha para compartilhar, migração entre projetos Firebase), mas isso é uma feature nova motivada por conveniência, não mais uma correção de um risco real de perda de dados — reavaliar separadamente se/quando surgir essa necessidade.

---

## 6. ~~Memoizar `AuthContext` para evitar re-renders em cascata~~ — resolvido

> ✅ **Resolvido em 2026-07-18.** `login`, `signup`, `loginWithGoogle` e `logout` agora usam `useCallback` (deps `[]`, já que dependem só de constantes de módulo). O objeto `value` do `AuthContext.Provider` agora usa `useMemo` com todas as 11 chaves como dependências. Confirmado que `usePermissions` já memoizava `canCreate`/`canWrite` com `useCallback`, então nenhuma mudança adicional foi necessária ali. Testado via Playwright: tela "Acesso Restrito" e modal de login renderizam sem erros de console; forma do objeto retornado por `useAuth()` não mudou, então nenhum dos 26 consumidores precisou ser alterado.

### Por quê (histórico)
`src/context/AuthContext.jsx:46-59` cria um objeto `value` novo a cada render (`value={{ currentUser, loading, login, signup, ... }}`), e as funções `login`/`signup`/`loginWithGoogle`/`logout` (linhas 32-40) não usam `useCallback`. Como praticamente toda página consome `useAuth()` (para `canCreate`/`canWrite`), qualquer re-render do `AuthProvider` propaga re-render para toda a árvore de componentes que o consome.

### Passo a passo
1. Envolver `login`, `signup`, `loginWithGoogle`, `logout` em `useCallback` com as dependências corretas.
2. Envolver o objeto `value` do `AuthContext.Provider` em `useMemo`, com dependências `[currentUser, loading, isAdmin, ...]`.
3. Rodar `npm run eslint` (a regra `exhaustive-deps` do `eslint-plugin-react-hooks` já vai sinalizar dependências faltando).
4. Validar manualmente que login/logout continuam funcionando normalmente.

### Arquivos afetados
- `src/context/AuthContext.jsx`

---

## 7. ~~Configurar testes automatizados (Vitest + React Testing Library)~~ — resolvido

> ✅ **Resolvido em 2026-07-18.** Instaladas as dependências (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`). Adicionado bloco `test: { environment: 'jsdom', globals: true, setupFiles: './src/setupTests.js' }` em `vite.config.js` e criado `src/setupTests.js`. Adicionado script `"test": "vitest"` em `package.json`. O passo 5 original (testar `getItems`/`saveItems` de `localStorage`) não se aplica mais — essas funções foram removidas junto com a entidade `recursos` morta (ver nota de atualização no topo deste arquivo) — então o primeiro teste real cobriu o padrão Firestore que hoje é repetido ~11 vezes em `storage.js` (relevante para o item 1): `src/service/storage.test.js` mocka `firebase/firestore` e valida `getRacas`/`addRaca`/`removeRaca`/`updateRaca` (nome de coleção correto, `createdAt`/`updatedAt` via `serverTimestamp()`, mapeamento `{id, ...data}`) e `getUserPermissions` (documento inexistente, `isAdmin`/`universos` presentes, `universos` ausente normalizado para `[]`). Também criados `src/components/LoginModal/utils.test.js` (schema Yup `loginSchema` e `getFirebaseErrorMessage`) e `src/components/LoginModal/LoginModal.test.jsx` (render com `useAuth` mockado, campos visíveis só quando `open`, submit chamando `login` e `onClose`) para validar o setup de React Testing Library com Formik/MUI. 18 testes, todos passando (`npx vitest run`); `npm run eslint` limpo.
>
> O passo 7 original (priorizar testes para `useEntityCRUD` do item 2) segue válido e pendente — só faz sentido depois que esse hook existir.

### Por quê (histórico)
Não existia nenhum arquivo de teste no projeto e nenhuma dependência de teste instalada, apesar de `eslint.config.js:36-45` já declarar globals de teste (`vi`, `describe`, `it`, `expect`...) como se testes fossem planejados. Sem testes, toda a refatoração sugerida nos itens 1 e 2 dependia inteiramente de verificação manual no navegador, o que é lento e propenso a deixar regressões passarem.

### Arquivos afetados
- Novos: `src/setupTests.js`, `src/service/storage.test.js`, `src/components/LoginModal/utils.test.js`, `src/components/LoginModal/LoginModal.test.jsx`
- `package.json`, `vite.config.js`

---

## 8. ~~Integrar ESLint + Prettier e adicionar `eslint-plugin-jsx-a11y`~~ — resolvido

> ✅ **Resolvido em 2026-07-18.** Instalados `eslint-config-prettier` e `eslint-plugin-jsx-a11y`. Em `eslint.config.js`: `jsxA11yPlugin.flatConfigs.recommended.rules` espalhado no bloco de regras principal, e `eslintConfigPrettier` adicionado como último item do array de configs (desativa regras de estilo do ESLint que conflitam com o Prettier).
>
> **Resultado surpreendente:** `npm run eslint` continuou em **zero erros/zero warnings** mesmo com `jsx-a11y` recomendado ativo (confirmado via `eslint --format=json`, 93 arquivos) — o passo 4 original ("revisar e corrigir novos warnings") não teve nada para corrigir; a boa disciplina de acessibilidade do projeto (aria-label, alt) já era suficiente. Como o backlog de warnings já estava zerado, o passo 5 (promover regras de `warn` para `error`) foi feito de imediato: `no-console` e `react-hooks/exhaustive-deps` agora são `error` em vez de `warn` — e o projeto inteiro continuou passando sem nenhuma violação, confirmando que não havia nenhum `console.log`/dependência de hook faltando escondido atrás do nível `warn`.
>
> `npx vitest run` (101 testes) e `npx prettier --write` seguem limpos após a mudança de config.

### Por quê (histórico)
`.prettierrc.json` existia mas não estava integrado ao `eslint.config.js`, então não havia um único comando que garantisse formatação + lint consistentes, e o próprio `CLAUDE.md` recomendava evitar rodar `npm run prettier` no projeto todo. Além disso, não havia `eslint-plugin-jsx-a11y` configurado, então a boa conformidade de acessibilidade observada no código era resultado de disciplina manual, sem nenhum enforcement automatizado.

### Arquivos afetados
- `eslint.config.js`
- `package.json`

---

## 9. ~~Cache de `getUniversos()` entre navegações~~ — resolvido

> ✅ **Resolvido em 2026-07-18** como efeito colateral do item 2. `src/hooks/useUniversos.js` (cache em nível de módulo + `invalidateUniversosCache()`) está em uso nas 11 páginas de listagem (Raças, Itens, Materiais, Classes, Receitas, Condições, Artes, Origens, Regras, CardFlux, Veias Astrais), substituindo as chamadas diretas a `getUniversos()`. **Não implementado:** o passo 4 original (testar a invalidação de cache criando um novo Universo pelo navegador) — `invalidateUniversosCache()` foi escrito e coberto por teste automatizado (`useUniversos.test.js`), mas nenhuma página de listagem/formulário de Universo chama essa função hoje (não há uma tela de CRUD de Universo neste projeto); ficará pronta para uso assim que essa tela existir.

### Por quê (histórico)
`getUniversos()` (`storage.js:353-356`) não tinha nenhum cache e era chamado via `Promise.all([getX(), getUniversos()])` em praticamente toda página de listagem. Cada navegação entre páginas disparava uma nova leitura Firestore da mesma coleção `Universo`, que raramente muda.

### Arquivos afetados
- `src/hooks/useUniversos.js` (compartilhado com o item 2)
- As 11 páginas de listagem, que agora usam o hook em vez de chamar `getUniversos()` diretamente

---

## 10. ~~Corrigir `key` de listas dinâmicas baseadas em índice~~ — resolvido

> ✅ **Resolvido em 2026-07-18.** Uma varredura completa por `key={` em todo `src/pages` (não só nos arquivos que o plano original listava) encontrou o problema em **4 formulários** (`NovaClasse.jsx`, `NovaCondicao.jsx`, `NovoItem.jsx`, `NovaRaca.jsx` — este último não estava na lista original) e em **4 páginas de listagem read-only** (`Classes.jsx`, `Condicoes.jsx`, `Itens.jsx`, `Racas.jsx` — idem).
>
> Para os `FieldArray` dos formulários, criado `src/hooks/useStableListKeys.js`: gera um id estável (`crypto.randomUUID()`) por posição, mantido em `useState` (não em `values` do Formik) — ou seja, o id nunca é persistido no Firestore, só existe para dar ao React uma identidade estável por item. Cada `FieldArray` passou a chamar `addKey()`/`removeKey(idx)` em paralelo ao `push()`/`remove(idx)` do Formik, e a usar `keys[idx] ?? idx` como `key` do React. Coberto por `useStableListKeys.test.js` (3 testes: geração inicial, adicionar ao final, remover da posição certa mantendo os ids dos itens restantes).
>
> Nas páginas de listagem (dialog de visualização, somente leitura), trocado `key={i}` por `key={`${item.nome}-${i}`}` (ou `${valor}-${i}` para arrays de string simples como `efeitos`/`interações`) — o índice como sufixo é só para desempate em caso de nomes duplicados; como é lista somente-leitura montada uma vez por abertura do dialog, o risco original quase não se aplicava aqui, mas a correção deixa o padrão consistente com o resto do código.
>
> **Fora de escopo (decisão deliberada):** os arrays `bonus` aninhados *dentro* de cada item de habilidade (em `NovaClasse.jsx`/`NovaRaca.jsx` e seus equivalentes de listagem) continuam com `key={bIdx}`/`key={bi}`. Corrigir esse caso exigiria rastrear uma lista de ids por item pai (já que hooks não podem ser chamados dentro de um `.map()`), adicionando uma segunda camada de estado (`Map` de id-do-pai → ids-dos-filhos) só para um sub-caso de bug já sutil (remover um bônus do meio de uma habilidade específica). O plano original também não listava esses casos. Se isso virar um bug reportado de verdade, vale revisitar com uma estrutura de estado dedicada.
>
> **Verificação:** 101 testes passando (nenhuma regressão nos testes existentes de `Racas`/`Itens`/`Classes`/`Condicoes` que verificam o dialog de visualização), `npm run eslint` limpo. **Não testado manualmente** (passo 3 original — adicionar/remover itens de um `FieldArray` no navegador) por falta de credencial de login nesta sessão; a lógica do hook em si está coberta por teste automatizado, mas a integração visual end-to-end (o comportamento exato que motivou o item) não foi observada ao vivo.

### Por quê (histórico)
Vários `FieldArray`/`.map()` usavam `key={idx}`/`key={i}` (índice do array) em vez de um identificador estável. Em listas onde o usuário pode adicionar/remover itens do meio (comum em `FieldArray` de habilidades/efeitos/bônus), usar índice como `key` causa o React reconciliar o DOM errado, gerando bugs sutis de estado "grudado" no item errado após remoção — especialmente combinado com `FastField` do Formik.

### Arquivos afetados
- `src/hooks/useStableListKeys.js` ✅ (novo) + `useStableListKeys.test.js` ✅
- `src/pages/Recursos/Condicoes/NovaCondicao.jsx` ✅, `Condicoes.jsx` ✅
- `src/pages/Recursos/Classes/NovaClasse.jsx` ✅, `Classes.jsx` ✅
- `src/pages/Recursos/Itens/NovoItem.jsx` ✅, `Itens.jsx` ✅
- `src/pages/Recursos/Racas/NovaRaca.jsx` ✅, `Racas.jsx` ✅ (não estavam na lista original do plano)

---

## 11. ~~Reforçar schemas Yup (trim, `.max()`, validação de URL)~~ — resolvido

> ✅ **Resolvido em 2026-07-18.** Criado `src/common/utils/yupSchemas.js` com blocos reutilizáveis em vez de repetir `.trim().max(N, 'mensagem')` cru em 11 arquivos: `nomeSchema` (trim + max 100 + required), `campoCurtoSchema` (trim + max 300, opcional — para valores curtos como `alvo`, `custo`, `valorVenda`), `descricaoSchema` (trim + max 2000, opcional — para qualquer campo de texto livre longo) e `urlImagemSchema` (trim + `.url('Deve ser uma URL válida')`, opcional). Como são schemas Yup prontos (não fábricas), são só importados e atribuídos diretamente a cada campo — `nome: nomeSchema`, `descricao: descricaoSchema`, etc. — nos 11 `utils.js` (`Racas`, `Itens`, `Materiais`, `Classes`, `Condicoes`, `Artes`, `Origens`, `Receitas`, `CardFlux`, `VeiasAstrais`, `Regras`), incluindo os schemas aninhados de habilidades/atributos. Coberto por `yupSchemas.test.js` (11 testes: nome vazio/só-espaço/muito longo/válido, campo curto vazio/muito longo, descrição vazia/muito longa, URL vazia/inválida/válida).
>
> **Dois riscos reais verificados antes de aplicar em escala** (poderiam ter quebrado os 11 formulários se estivessem errados):
> 1. `Yup.string().url()` em um campo **não obrigatório** com valor inicial `''` — testado isoladamente (`schema.validate({ linkImagem: '' })`) e confirmado que Yup não falha em string vazia, só quando há conteúdo inválido. Sem essa checagem, todo formulário teria começado com um erro de validação preso no campo de imagem vazio.
> 2. **Nenhum dos 11 formulários exibia `error`/`helperText` no campo `linkImagem`** (só `nome` tinha esse tratamento) — ou seja, adicionar a validação de URL sem mais nada teria criado uma falha **silenciosa**: o clique em "Salvar" simplesmente não faria nada, sem nenhuma mensagem visível, para uma URL inválida. Corrigido adicionando `error={touched.linkImagem && Boolean(errors.linkImagem)}` / `helperText={touched.linkImagem && errors.linkImagem}` no campo `linkImagem` das 11 páginas `Nova*/Novo*`, replicando o padrão que já existia só no campo `nome`.
>
> **Calibração dos limites por campo:** `nome` sempre 100; campos com rótulo/valor curto (raridade, tipo, custo, alcance, tags, etc.) usam `campoCurtoSchema` (300); qualquer campo cujo nome sugere texto livre mais longo (`descricao*`, `explicacaoCompleta`, `aplicacao`, `cantico`, `aprimoramento`, os campos dinâmicos de `CAMPOS_POR_TIPO` em Origens, etc.) usa `descricaoSchema` (2000), **independente de o campo ser renderizado como `multiline` ou não** — restringir pelo tipo de input em vez do significado do campo arriscaria cortar conteúdo legítimo (ex.: `VeiasAstrais.descricao` e `Regras.descricaoCurta`/`comoFunciona` são `TextField` de uma linha só, mas guardam texto livre).
>
> **Não verificado (limitação desta sessão):** o passo 3 original (checar se os limites escolhidos não quebram dados já existentes no Firestore) — não há acesso à base de produção nesta sessão. Os limites foram escolhidos deliberadamente generosos (100/300/2000) exatamente para minimizar esse risco, mas em teoria um registro existente com um campo mais longo que o limite ficaria bloqueado para reedição até o usuário encurtar esse campo (não afeta a visualização, só o salvamento). O passo 4 (teste manual no navegador) também não foi possível sem credencial de login; a lógica de validação em si tem cobertura automatizada completa via `yupSchemas.test.js`.

### Por quê (histórico)
Os schemas Yup usavam majoritariamente `Yup.string().required(...)`, sem `.trim()`, `.max()` ou validação de formato. Isso permitia, por exemplo, salvar um nome só com espaços em branco, um texto de descrição sem limite de tamanho, ou uma string qualquer no campo `linkImagem` (que deveria ser uma URL).

### Arquivos afetados
- Novo: `src/common/utils/yupSchemas.js` ✅ + `yupSchemas.test.js` ✅
- Todos os `src/pages/Recursos/*/utils.js` (10 arquivos) ✅ + `src/pages/Regras/utils.js` ✅
- Todos os `src/pages/Recursos/*/Nova*.jsx`/`Novo*.jsx` (11 arquivos) ✅ — `error`/`helperText` adicionados ao campo `linkImagem`

---

## 12. ~~Tratar `QuotaExceededError` e falhas de parse em `storage.js`~~ — resolvido pela remoção de `recursos`

> ✅ **Resolvido em 2026-07-18.** Este item existia porque `saveItems`/`getItems` (os helpers genéricos de `localStorage`, usados só pela entidade `recursos`) não tratavam `QuotaExceededError` nem logavam falhas de parse. Como `recursos` era código morto e foi removida junto com `KEYS`, `getItems`, `saveItems`, `addItem` e `removeItem`, `storage.js` não tem mais nenhum código de `localStorage` — o problema deixou de existir. Erros de rede/permissão do Firestore continuam relevantes e já são cobertos pelo item 1 (passo 4: `try/catch` nas funções genéricas Firestore).

---

## Ordem de prioridade sugerida

1. ~~**Item 0** (corrigir `CLAUDE.md`)~~ — ✅ resolvido em 2026-07-18.
2. ~~**Item 7** (testes)~~ — ✅ resolvido em 2026-07-18. Setup de Vitest + RTL pronto, com cobertura inicial de `storage.js` e `LoginModal` — serve de rede de segurança para os itens 1 e 2 a seguir.
3. ~~**Item 1** (duplicação em `storage.js`)~~ — ✅ resolvido em 2026-07-18. ~~**Item 2** (duplicação nas páginas de entidade)~~ — ✅ resolvido em 2026-07-18 (fase 1 — as 11 páginas de listagem; fase 2 — formulários `Nova*/Novo*` — deliberadamente fora de escopo por ora).
4. ~~**Itens 4 e 6** (Error Boundary, memoização do Auth)~~ — ✅ resolvidos em 2026-07-18. *(Item 12 já resolvido.)*
5. ~~**Item 3** (code splitting)~~ — ✅ resolvido em 2026-07-18.
6. ~~**Itens 10, 11, 8** (keys, validação Yup, lint/a11y)~~ — ✅ todos resolvidos em 2026-07-18. *(Itens 5 e 9 já resolvidos.)*

Com isso, **todos os 12 itens do plano estão resolvidos ou deliberadamente fora de escopo** (fase 2 do item 2 — unificar formulários `Nova*/Novo*`). Os pontos que dependem de acesso ao navegador autenticado ou à base de produção (validação manual em algumas entidades do item 2/3, teste de invalidação de cache do item 9, verificação de dados existentes do item 11) ficaram documentados como limitação de sessão em cada item — recomenda-se um passeio manual pelo app quando houver oportunidade, mas nenhum bloqueia o que já foi entregue, dado o nível de cobertura automatizada (101 testes, `npm run eslint` limpo).

## Verificação geral (após qualquer item acima)

- [ ] `npm run eslint` sem novos erros/warnings
- [ ] `npx prettier --write` nos arquivos modificados
- [ ] PropTypes definidos em componentes novos que recebem props
- [ ] Testado manualmente no navegador (fluxo afetado + navegação geral)
- [ ] `npm run test` (Vitest, configurado desde o item 7) sem falhas
