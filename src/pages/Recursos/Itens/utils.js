import * as Yup from 'yup';

const habilidadeEspecialSchema = Yup.object({
  nome: Yup.string().required('Nome é obrigatório'),
  descricao: Yup.string(),
});

export const ITEM_SCHEMA = Yup.object({
  nome: Yup.string().required('Nome é obrigatório'),
  qualidade: Yup.string(),
  tipo: Yup.string(),
  linkImagem: Yup.string(),
  nivelAtual: Yup.number().integer().min(0).nullable(),
  nivelMaximo: Yup.number().integer().min(0).nullable(),
  dados: Yup.string(),
  extra: Yup.string(),
  descricao: Yup.string(),
  habilidadesEspeciais: Yup.array().of(habilidadeEspecialSchema),
});

export const HABILIDADE_ESPECIAL_INICIAL = { nome: '', descricao: '' };

export const ITEM_INITIAL_VALUES = {
  nome: '',
  qualidade: '',
  tipo: '',
  linkImagem: '',
  nivelAtual: '',
  nivelMaximo: '',
  dados: '',
  extra: '',
  descricao: '',
  universo: '',
  habilidadesEspeciais: [],
};

export const TIPOS_ITEM = [
  'Arma',
  'Armadura',
  'Acessório',
  'Relíquia',
  'Artefato',
  'Mobs',
];
