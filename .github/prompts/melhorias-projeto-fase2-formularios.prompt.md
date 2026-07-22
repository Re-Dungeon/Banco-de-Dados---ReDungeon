# Plano: Fase 2 do Item 2 — Extrair o esqueleto repetido dos formulários `Nova*/Novo*` — resolvido

> ✅ **Resolvido em 2026-07-19.** Todos os 11 formulários (`NovaVeiaAstral` como piloto + as outras 10: `NovoMaterial`, `NovoItem`, `NovaCondicao`, `NovaOrigem`, `NovaRegra`, `NovaReceita`, `NovaArte`, `NovaClasse`, `NovaRaca`, `NovoCardFlux`) foram migrados para `useEntityFormGuard` + `FormPageHeader` + `ImagePreviewPanel` + `FormActions` + `SectionTitle` compartilhado. Ver nota de resolução completa na seção "Passo a passo" abaixo.

**TL;DR:** Sim, vale a pena. Uma auditoria dos 11 formulários (`NovaArte`, `NovoCardFlux`, `NovaClasse`, `NovaCondicao`, `NovoItem`, `NovoMaterial`, `NovaOrigem`, `NovaRaca`, `NovaReceita`, `NovaVeiaAstral`, `NovaRegra` — 6.973 linhas no total) confirma que, além da variação real de campos entre entidades (motivo pelo qual a fase 1 deixou isso de fora), existe um bloco de **boilerplate idêntico ou quase idêntico copiado 11 vezes**: o componente `SectionTitle`, o carregamento de `universos`, o guard de permissão, o cálculo de `filteredUniversos`, o header (botão Voltar + título/subtítulo), o painel de preview de imagem e o footer de ações (Cancelar/Salvar). Isso é o mesmo tipo de duplicação que a fase 1 já resolveu para as páginas de listagem (`EntityFilters`/`EntityViewDialog`/`useEntityCRUD`), só que do lado dos formulários. Diferente da fase 1, esta fase **não** tenta unificar o corpo do formulário (os campos e `FieldArray`s específicos de cada entidade) — só o esqueleto ao redor dele.

Bônus encontrado durante a auditoria (não é motivo por si só, mas reforça o caso): **nenhum dos 11 formulários usa o hook `useUniversos` (cache em nível de módulo, item 9)** — todos chamam `getUniversos()` direto, então toda vez que o usuário abre uma página `Nova*/Novo*` depois de já ter navegado por uma listagem, a coleção `Universo` é buscada de novo do Firestore, mesmo já estando em cache. Extrair o guard para um hook compartilhado corrige isso de graça. Também há uma inconsistência real: **3 dos 11 formulários** (`NovaRaca`, `NovoItem`, `NovoMaterial`) não têm o gate `if (loading) return null;` que os outros 8 têm — ou seja, nessas 3 páginas o formulário pode renderizar brevemente com a lista de Universos vazia antes do fetch terminar. Um hook único elimina essa divergência.

---

## Por quê

As 11 páginas seguem exatamente o mesmo esqueleto:

1. **`SectionTitle`** — o mesmo componente local (`Typography` com `variant="subtitle2"`, cor `--color-accent`, `textTransform: uppercase`) definido do zero em cada um dos 11 arquivos, com o mesmo `propTypes`. ~20 linhas × 11 = ~220 linhas idênticas.
2. **Carregamento de universos** — `const [universos, setUniversos] = useState([])` + `useEffect(() => { getUniversos().then(...).catch(...) }, [])`, ignorando o hook `useUniversos` já existente (item 9).
3. **Guard de permissão** — `useEffect` que redireciona para a listagem se `!canWrite(...)`/`!canCreate()`, com a mesma forma em todos os 11 arquivos (só o `ROUTE_PATHS.X` e o campo `location.state?.x` mudam).
4. **`filteredUniversos`** — `isAdmin ? universos : universos.filter(u => allowedUniversos.includes(u.id))`, idêntico nos 11.
5. **Header** — `Box` com botão "← Voltar" + `Typography` de título (`Editar X` / `Novo X`) + subtítulo, mesma estrutura e mesmos estilos inline em todos.
6. **Painel de preview de imagem** — o bloco `aspectRatio: '1/1'` com `<img>`/mensagem de erro/placeholder, e o estado `imgError` que o acompanha, é copiado byte-a-byte (só troca o `alt` da imagem) em todos os 11.
7. **Footer de ações** — botões "Cancelar" (volta pra listagem) e "Salvar.../Salvar Alterações" (submit), mesmo layout e mesmos estilos.
8. **`handleSubmit`** — sempre o mesmo formato: `isEditing ? update*(id, values) : add*(values)`, seguido de `navigate(ROUTE_PATHS.X)`.

O que **não** é igual, e por isso não deve ser forçado numa abstração única:
- O conjunto de campos de cada entidade (de ~8 campos simples em Materiais/VeiasAstrais até múltiplas seções com `FieldArray` aninhado em Classes/Racas — `habilidadesBasicas`/`habilidadesAvancadas`/`habilidadesRaciais.*` com sub-array `bonus` dentro de cada habilidade).
- Campos dinâmicos por tipo (ex. `CAMPOS_POR_TIPO` em Origens).
- Estilos de input customizados por página (ex. `slotInputSx`/`selectSx`/`labelSx` em `NovaVeiaAstral` não existem em `NovaCondicao`, que usa o `TextField`/`Select` sem `sx` próprio).

Essa é exatamente a mesma razão pela qual a fase 1 extraiu só o Dialog de visualização e a grade de filtros (não o corpo inteiro da página de listagem) — aqui o alvo é o esqueleto (header, loading/permissão, preview de imagem, footer), não o corpo do formulário.

---

## O que extrair

### 1. `useEntityFormGuard` (novo hook, `src/hooks/useEntityFormGuard.js`)
Encapsula os itens 2–4 acima. Assinatura sugerida:
```javascript
const {
  universos,        // já filtrado por allowedUniversos/isAdmin
  loadingUniversos,
  isEditing,
} = useEntityFormGuard({
  itemParaEditar,          // location.state?.x ?? null
  universoDoItem: itemParaEditar?.universo,
  routeOnDeny: ROUTE_PATHS.X,   // para onde redirecionar se não tiver permissão
});
```
Internamente usa `useUniversos()` (item 9) em vez de `getUniversos()` direto — corrige a divergência de cache descrita acima — e roda o mesmo `useEffect` de guard de permissão que hoje está duplicado. `loadingUniversos` substitui o `loading`/`if (loading) return null` que hoje só existe em 8 dos 11 arquivos, padronizando o comportamento nos 3 que não tinham.

### 2. `FormPageHeader` (novo componente, `src/components/FormPageHeader/`)
Props: `titulo`, `subtitulo`, `onVoltar`. Substitui o bloco de header (botão Voltar + título + subtítulo) repetido nos 11 arquivos.

### 3. `ImagePreviewPanel` (novo componente, `src/components/ImagePreviewPanel/`)
Props: `src` (valor de `values.linkImagem`), `alt`. Encapsula o `imgError` (estado interno do próprio componente, via `onError` da `<img>`) e o placeholder — remove a necessidade de cada página gerenciar `imgError` manualmente.

### 4. `FormActions` (novo componente, `src/components/FormActions/`)
Props: `onCancelar`, `isSubmitting`, `labelSalvar` (ex. `"Salvar Veia Astral"` vs `"Salvar Alterações"`). Substitui o footer de botões.

### 5. `SectionTitle` compartilhado
Mover o componente local (definido 11 vezes) para `src/components/SectionTitle/SectionTitle.jsx` e importar nos 11 arquivos, em vez de manter a definição local.

**Fora de escopo, deliberado:** um `useEntityFormSubmit` genérico para o `handleSubmit` (`isEditing ? update() : add()`) foi cogitado, mas como cada página já tem essa lógica em 6 linhas simples e sem duplicação de *padrão de erro* (não há tratamento de erro além do `try/catch` do item 1, que já vive em `storage.js`), a abstração não paga o custo de indireção — manter `handleSubmit` inline em cada página.

---

## Passo a passo

1. ~~Criar `src/hooks/useEntityFormGuard.js`~~ ✅ feito — usa `useUniversos` (item 9) internamente. `useEntityFormGuard.test.jsx` (7 testes): permissão negada redireciona (criação e edição), permissão concedida não redireciona, `universos` filtrado corretamente para admin vs não-admin, `loadingUniversos` reflete o estado do `useUniversos` subjacente, guard não avalia nada enquanto `loadingPermissions` é `true`.
2. ~~Criar `src/components/FormPageHeader/FormPageHeader.jsx`~~ ✅ feito + 2 testes (renderiza título/subtítulo, clique aciona `onVoltar`).
3. ~~Criar `src/components/ImagePreviewPanel/ImagePreviewPanel.jsx`~~ ✅ feito + 4 testes (placeholder sem `src`, `<img>` com `src` válido, mensagem de "não encontrada" no `onError`, reset do erro quando `src` muda).
4. ~~Criar `src/components/FormActions/FormActions.jsx`~~ ✅ feito + 3 testes (clique em Cancelar aciona `onCancelar`, botão Salvar desabilitado/habilitado conforme `isSubmitting`).
5. ~~Mover `SectionTitle` para `src/components/SectionTitle/SectionTitle.jsx`~~ ✅ feito (componente puro, sem lógica nova, sem teste dedicado — mesma decisão de não testar `EntityViewDialog`/`EntityFilters` isoladamente além do necessário).
6. ~~Escolher a entidade piloto — **Veias Astrais**~~ ✅ feito — `NovaVeiaAstral.jsx` migrada para usar os 4 componentes/hook novos.
7. ~~Validar a página piloto~~ ✅ feito — `NovaVeiaAstral.test.jsx` (4 testes: modo criação com preview vazio, submit em modo criação chama `addVeiaAstral`, modo edição pré-preenchido chama `updateVeiaAstral`, navegação de Voltar/Cancelar) + `npm run eslint` limpo + `npx prettier --write` aplicado. Suíte completa: 121 testes (era 101), `npm run eslint` limpo em todo `src/`. **Validação manual no navegador não foi feita** (sem credencial de login disponível nesta sessão de agente) — recomenda-se ao usuário criar e editar uma Veia Astral de verdade antes do passo 8.
8. ~~Aplicar o mesmo padrão nas outras 10 páginas~~ ✅ feito — `NovoMaterial`, `NovoItem`, `NovaCondicao`, `NovaOrigem`, `NovaRegra`, `NovaReceita`, `NovaArte`, `NovaClasse`, `NovaRaca`, `NovoCardFlux`, cada uma com teste próprio (34 testes novos no total: 3 a 4 por página, cobrindo modo criação, modo edição, preview de imagem e, onde aplicável, `FieldArray`s simples e aninhados com `bonus`).
9. ~~Rodar a suíte completa depois de cada página migrada~~ ✅ feito — `npm run eslint` limpo e `npx vitest run` verde a cada página, não só no final.
10. **Não** tentar generalizar o corpo do formulário (campos, `FieldArray`s, `CAMPOS_POR_TIPO`) nesta fase — mantém-se como código específico de cada página, igual à decisão original da fase 1.

**Resultado final:** 157 testes no total (era 101 antes da fase 2; 56 novos: 20 do piloto + 34 do rollout + 2 de ajuste), `npm run eslint` limpo em todo `src/`, `npx prettier --write` aplicado em todos os arquivos tocados. `npx vitest run` confirmado verde em duas execuções completas consecutivas da suíte inteira.

### Achados durante o rollout às 10 páginas restantes

- **3 páginas ganharam o gate de `loadingUniversos` que não tinham** (`NovaRaca`, `NovoItem`, `NovoMaterial`) — correção real de comportamento, não regressão: antes, essas 3 páginas podiam renderizar brevemente com a lista de Universos vazia antes do fetch terminar.
- **3 páginas (`NovaReceita`, `NovaArte`, `NovoCardFlux`) buscam uma segunda coleção** além de Universos (`getMateriais`, `getCondicoes`, `getCardFlux`, respectivamente, para popular um `Autocomplete` multi-seleção). `useEntityFormGuard` só cobre Universos — o fetch da segunda coleção continua como `useState`/`useEffect` local a cada página (com seu próprio `loadingX`), e o gate de renderização virou `if (loadingUniversos || loadingX) return null` nessas 3 páginas, preservando o comportamento original de "só renderiza quando tudo carregou".
- **Flakiness real pega pela suíte completa (não pelos arquivos isolados):** rodar os 35 arquivos de teste em paralelo (`npx vitest run`) fez 1–2 testes de formulário (`NovaArte`, `NovoCardFlux`) estourarem o timeout padrão de 5000ms do Vitest sob contenção de CPU — os mesmos testes sempre passavam ao rodar isoladamente. Corrigido subindo `testTimeout` para `10000` em `vite.config.js` (`test.testTimeout`), já que os novos testes de formulário fazem várias interações `userEvent` (digitar + clicar) em sequência, mais pesadas que os testes de listagem da fase 1. Confirmado estável em duas execuções completas depois do ajuste.

### Duas decisões tomadas durante a implementação do piloto (diferentes do desenho original)

- **`ImagePreviewPanel` não usa `useEffect` para resetar o `imgError`** (como o texto original da seção "Riscos" sugeria via `key`) — o ESLint (`react-hooks/set-state-in-effect`) acusou `setState` síncrono dentro de efeito. Resolvido ajustando o estado durante a própria renderização (padrão "adjusting state when a prop changes" documentado pelo React: comparar `src` com um `lastSrc` guardado em estado e resetar `imgError` inline, sem `useEffect`). Mais simples do que a alternativa de `key` cogitada originalmente, e não exige que a página consumidora saiba nada sobre o reset.
- **Achado real de lint durante o teste do hook:** o mock de `useUniversos` em `useEntityFormGuard.test.jsx` inicialmente usava uma variável chamada `useUniversosMock` — o ESLint (`react-hooks/rules-of-hooks`) interpretou a chamada como "uma função que começa com `use` sendo invocada dentro de uma função que não é um Hook/Componente" (a função anônima do mock, atribuída à chave `default`, não tem nome válido de Hook). Corrigido renomeando a variável para `mockUniversosHook` (não começa com `use`) — vale seguir essa convenção de nome em qualquer mock futuro de um hook que comece com `use`.

---

## Arquivos afetados

- Novos: `src/hooks/useEntityFormGuard.js` ✅ + teste, `src/components/FormPageHeader/` ✅ + teste, `src/components/ImagePreviewPanel/` ✅ + teste, `src/components/FormActions/` ✅ + teste, `src/components/SectionTitle/` ✅
- Refatoradas (as 11 páginas de formulário, todas ✅): `NovaArte.jsx`, `NovoCardFlux.jsx`, `NovaClasse.jsx`, `NovaCondicao.jsx`, `NovoItem.jsx`, `NovoMaterial.jsx`, `NovaOrigem.jsx`, `NovaRaca.jsx`, `NovaReceita.jsx`, `NovaVeiaAstral.jsx`, `NovaRegra.jsx` — cada uma com seu `*.test.jsx` novo
- `vite.config.js` ✅ (`test.testTimeout: 10000`, ver achado de flakiness acima)
- **Não tocado** (fora de escopo, deliberado): o corpo de cada formulário (campos, `FieldArray`s de habilidades/bônus, lógica de `CAMPOS_POR_TIPO`)

---

## Riscos e pontos de atenção

- **`imgError` deixou de ser estado da página** — resolvido dentro de `ImagePreviewPanel` via ajuste de estado durante a renderização (comparação `src`/`lastSrc`), sem depender de nenhuma página consumidora gerenciar reset manualmente. Coberto por `ImagePreviewPanel.test.jsx` (caso "reseta o erro quando src muda").
- **3 páginas sem o gate de `loading`** (`NovaRaca`, `NovoItem`, `NovoMaterial`) ganharam o gate como efeito colateral da migração — correção real, sem tela em branco perceptível esperada na maioria das navegações graças ao cache do `useUniversos`. Não testado manualmente no navegador (ver limitação abaixo).
- **Estilos de input divergentes** (`slotInputSx` em VeiasAstrais/Origens/CardFlux/etc. vs. ausência em Condicoes/Itens/Classes/Raças) não fazem parte desta extração — cada página mantém seu próprio `sx` nos campos do corpo do formulário.
- **Limitação de sessão, não resolvida:** sem credencial de login disponível em sessão de agente, a validação manual completa no navegador (criar/editar em cada uma das 11 entidades) não foi feita — a cobertura ficou inteiramente em testes automatizados (56 novos, mockando `service/storage` e `context/AuthContext`). Recomenda-se ao usuário um passeio manual pelas 11 páginas `Nova*/Novo*` quando houver oportunidade, com atenção especial às 3 que ganharam o gate de loading e às 3 que têm `Autocomplete` dependente de uma segunda coleção (Receitas/materiais, Artes/condições, CardFlux/cartas).

## Verificação geral (após cada página migrada)

- [x] `npm run eslint` sem novos erros/warnings
- [x] `npx prettier --write` nos arquivos modificados
- [x] PropTypes definidos nos 4 componentes novos + hook
- [x] `npm run test` sem falhas (suíte completa, não só o arquivo novo) — 157 testes, confirmado estável em 2 execuções completas consecutivas
- [ ] Testado manualmente no navegador — **não feito**, ver limitação de sessão acima
- [ ] Testado manualmente no navegador: criar novo registro, editar registro existente, preview de imagem (com URL válida, inválida e vazia), guard de permissão (usuário sem `canWrite` é redirecionado)
