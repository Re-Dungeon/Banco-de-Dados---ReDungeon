import * as Yup from 'yup';
import {
  nomeSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

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

const reputacaoItemSchema = Yup.object({
  quantidade: Yup.number()
    .integer('Quantidade deve ser um número inteiro')
    .min(0, 'Quantidade não pode ser negativa')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  efeito: descricaoSchema,
});

export const REPUTACAO_ITEM_INICIAL = { quantidade: '', efeito: '' };

export const ORIGEM_SCHEMA = Yup.object({
  nome: nomeSchema,
  linkImagem: urlImagemSchema,
  universo: Yup.string(),
  tipo: Yup.string(),
  tags: descricaoSchema,
  raridade: Yup.string(),
  descricao: descricaoSchema,
  reputacao: Yup.object({
    fama: Yup.array().of(reputacaoItemSchema),
    terror: Yup.array().of(reputacaoItemSchema),
  }),
  ...Object.fromEntries(
    TODOS_CAMPOS_DEPENDENTES.map(key => [key, descricaoSchema]),
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
  reputacao: {
    fama: [],
    terror: [],
  },
  ...Object.fromEntries(TODOS_CAMPOS_DEPENDENTES.map(key => [key, ''])),
};
