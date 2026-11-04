export const PATCH_NOTES = [
  {
    version: '3.3.0',
    date: '2026-11-03',
    changes: [
      'Atualização visual do menu lateral com nova identidade de navegação, melhor legibilidade e refinamento da experiência geral do app',
      'Redesign visual da tela de login para uma apresentação mais imersiva e moderna, mantendo a mesma lógica de autenticação e fluxo do sistema',
      'Ajuste na gestão de custos das Artes: o tipo de custo agora considera somente Energia, Fadiga, Saúde e Neutro',
      'Refinamento visual dos cards e destaques da navegação para manter o padrão escuro e fantasy do Re:Dungeon',
      'Ajustes de consistência visual para manter fundos, cards, menus, modais e textos alinhados ao padrão escuro do Re',
    ],
  },
  {
    version: '3.2.0',
    date: '2026-10-06',
    changes: [
      'Nova aba de gestão da Trickster Coin no painel administrativo, com cadastro, edição e remoção de benefícios por universo',
      'Implementação do CRUD real da Trickster Coin com integração ao Firestore e validações de formulário para nome, descrição, link de imagem e universo',
      'Ajuste do filtro superior da página para universo, substituindo o filtro de tag e deixando a navegação mais consistente com o restante do app',
      'Melhorias visuais e de UX nos cards de benefício, incluindo fallback de imagem para casos de URL indisponível ou bloqueada',
      'Diagnóstico e correção do problema de imagens externas: confirmou-se que o 403 era causado pela origem da URL e não pela aplicação, com tratamento visual para evitar quebra da interface',
      'Atualização da identificação visual do app para Re:Dungeon V3.2 no topo da navegação',
    ],
  },
  {
    version: '3.1.1',
    date: '2026-07-19',
    changes: [
      'Validação de formulários reforçada: limite de caracteres em nome, campos curtos e descrições, e verificação de formato de URL no link de imagem, em todos os Recursos e Regras',
      'Correção de bug: remover um item do meio de listas de habilidades (Classes, Raças, Itens, Condições) não troca mais o conteúdo dos itens seguintes de posição',
      'Adição do plugin de acessibilidade (jsx-a11y) e do eslint-config-prettier ao ESLint; `no-console` e `react-hooks/exhaustive-deps` agora são erros',
      'Novos testes unitários para os schemas de validação compartilhados e para o hook de chaves estáveis de lista',
    ],
  },
  {
    version: '3.1.0',
    date: '2026-07-18',
    changes: [
      'Novas telas de Recursos: Receitas, Condições, Artes, Origens, Regras, CardFlux e Veias Astrais',
      'Migração completa de Raças, Classes, Materiais, Itens e demais Recursos para o Firebase Firestore',
      'Sistema de permissões por Universo, com controle de criação/edição por usuário',
      'Regras de segurança do Firestore revisadas para todas as coleções',
      'Correção do menu lateral, que agora preenche corretamente a linha de cada item',
      'Remoção de páginas não utilizadas (Mesas, Mundo, NPCs, Núcleo, Macros)',
      'Ajustes e correções de ESLint em todo o projeto',
    ],
  },
  {
    version: '3.0.0',
    date: '2026',
    changes: [
      'Refatoração completa com Material-UI',
      'Integração de Styled Components',
      'Formulários com Formik e Yup',
      'Gráficos com Chart.js no Núcleo',
      'Persistência com localStorage',
    ],
  },
];
