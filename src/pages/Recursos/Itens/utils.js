import * as Yup from 'yup';
import {
  nomeSchema,
  campoCurtoSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

const habilidadeEspecialSchema = Yup.object({
  nome: nomeSchema,
  descricao: descricaoSchema,
});

export const ITEM_SCHEMA = Yup.object({
  nome: nomeSchema,
  qualidade: Yup.string(),
  tipo: Yup.string(),
  linkImagem: urlImagemSchema,
  nivelAtual: Yup.number().integer().min(0).nullable(),
  nivelMaximo: Yup.number().integer().min(0).nullable(),
  pesoUnitario: Yup.number().min(0).nullable(),
  bonusEspaco: Yup.number().integer().nullable(),
  precoCompra: Yup.number().min(0).nullable(),
  precoVenda: Yup.number().min(0).nullable(),
  dados: campoCurtoSchema,
  extra: campoCurtoSchema,
  descricao: descricaoSchema,
  mostrarNaLoja: Yup.boolean(),
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
  pesoUnitario: '',
  bonusEspaco: '',
  precoCompra: '',
  precoVenda: '',
  dados: '',
  extra: '',
  descricao: '',
  universo: '',
  mostrarNaLoja: false,
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
