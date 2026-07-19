import * as Yup from 'yup';
import {
  nomeSchema,
  campoCurtoSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

const habilidadeBasicaSchema = Yup.object({
  nome: nomeSchema,
  descricao: descricaoSchema,
  raridade: Yup.string(),
  bonus: Yup.array().of(campoCurtoSchema),
  alcance: campoCurtoSchema,
  alvo: campoCurtoSchema,
  custo: campoCurtoSchema,
  recarga: campoCurtoSchema,
  duracao: campoCurtoSchema,
  dados: campoCurtoSchema,
});

const habilidadeAvancadaSchema = Yup.object({
  nome: nomeSchema,
  descricao: descricaoSchema,
  raridade: Yup.string(),
  bonus: Yup.array().of(campoCurtoSchema),
  alcance: campoCurtoSchema,
  alvo: campoCurtoSchema,
  custo: campoCurtoSchema,
  recarga: campoCurtoSchema,
  duracao: campoCurtoSchema,
  dados: campoCurtoSchema,
});

export const CLASSE_SCHEMA = Yup.object({
  nome: nomeSchema,
  raridade: Yup.string(),
  linkImagem: urlImagemSchema,
  descricao: descricaoSchema,
  atributosBasicos: Yup.object({
    forca: campoCurtoSchema,
    vitalidade: campoCurtoSchema,
    agilidade: campoCurtoSchema,
    inteligencia: campoCurtoSchema,
    percepcao: campoCurtoSchema,
  }),
  habilidadesBasicas: Yup.array().of(habilidadeBasicaSchema),
  habilidadesAvancadas: Yup.array().of(habilidadeAvancadaSchema),
});

export const HABILIDADE_INICIAL = {
  nome: '',
  descricao: '',
  raridade: '',
  bonus: [],
  alcance: '',
  alvo: '',
  custo: '',
  recarga: '',
  duracao: '',
  dados: '',
};

export const CLASSE_INITIAL_VALUES = {
  nome: '',
  raridade: '',
  linkImagem: '',
  descricao: '',
  atributosBasicos: {
    forca: '',
    vitalidade: '',
    agilidade: '',
    inteligencia: '',
    percepcao: '',
  },
  habilidadesBasicas: [],
  habilidadesAvancadas: [],
};
