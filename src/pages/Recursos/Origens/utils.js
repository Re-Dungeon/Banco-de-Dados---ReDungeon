import * as Yup from 'yup';

export const CAMPOS_POR_TIPO = {
  Origem: [
    { key: 'cultura', label: 'Cultura' },
    { key: 'influencia', label: 'Influência' },
    { key: 'beneficios', label: 'Benefícios' },
    { key: 'penalidades', label: 'Penalidades' },
  ],
  Região: [
    { key: 'clima', label: 'Clima' },
    { key: 'climaPerigo', label: 'Clima de Perigo' },
    { key: 'territorio', label: 'Território' },
    { key: 'facoesPoderesLocais', label: 'Facções/Poderes Locais' },
    { key: 'recursosDisponiveis', label: 'Recursos Disponíveis' },
  ],
  Cenário: [
    { key: 'eventoPrincipal', label: 'Evento Principal' },
    { key: 'estadoDoMundo', label: 'Estado do Mundo' },
    { key: 'impactoNarrativo', label: 'Impacto Narrativo' },
    { key: 'consequencias', label: 'Consequências' },
    { key: 'conflitosAtivos', label: 'Conflitos Ativos' },
  ],
};

export const TODOS_CAMPOS_DEPENDENTES = Object.values(CAMPOS_POR_TIPO).flatMap(
  campos => campos.map(c => c.key),
);

export const ORIGEM_SCHEMA = Yup.object({
  nome: Yup.string().required('Nome é obrigatório'),
  linkImagem: Yup.string(),
  universo: Yup.string(),
  tipo: Yup.string(),
  tags: Yup.string(),
  raridade: Yup.string(),
  descricao: Yup.string(),
  ...Object.fromEntries(
    TODOS_CAMPOS_DEPENDENTES.map(key => [key, Yup.string()]),
  ),
});

export const ORIGEM_INITIAL_VALUES = {
  nome: '',
  linkImagem: '',
  universo: '',
  tipo: '',
  tags: '',
  raridade: '',
  descricao: '',
  ...Object.fromEntries(TODOS_CAMPOS_DEPENDENTES.map(key => [key, ''])),
};
