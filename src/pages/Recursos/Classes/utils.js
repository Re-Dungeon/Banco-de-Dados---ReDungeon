import * as Yup from 'yup';
import {
  nomeSchema,
  campoCurtoSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

const habilidadeBasicaSchema = Yup.object({
  nome: nomeSchema,
  acao: Yup.string().oneOf(['Imediata', 'Duradoura', 'Sustentada', 'Passiva']),
  tipo: Yup.string().oneOf(['Imediata', 'Duradoura', 'Sustentada', 'Passiva']),
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
  acao: Yup.string().oneOf(['Imediata', 'Duradoura', 'Sustentada', 'Passiva']),
  tipo: Yup.string().oneOf(['Imediata', 'Duradoura', 'Sustentada', 'Passiva']),
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
  tiposDisponiveis: Yup.array().of(Yup.string()),
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

export const HABILIDADE_BASICA_INICIAL = {
  nome: '',
  acao: 'Passiva',
  tipo: 'Passiva',
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

export const HABILIDADE_AVANCADA_INICIAL = {
  nome: '',
  acao: 'Passiva',
  tipo: 'Passiva',
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

export const HABILIDADE_INICIAL = HABILIDADE_BASICA_INICIAL;

export const CLASSE_INITIAL_VALUES = {
  nome: '',
  raridade: '',
  linkImagem: '',
  tiposDisponiveis: [],
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
