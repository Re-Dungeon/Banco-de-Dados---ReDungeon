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
  bonus: Yup.array().of(campoCurtoSchema),
});

const habilidadeAvancadaSchema = Yup.object({
  nome: nomeSchema,
  tipo: Yup.string().oneOf(['Imediata', 'Duradoura', 'Sustentada', 'Passiva']),
  descricao: descricaoSchema,
  bonus: Yup.array().of(campoCurtoSchema),
  alvo: campoCurtoSchema,
  alcance: campoCurtoSchema,
  recarga: campoCurtoSchema,
  custo: campoCurtoSchema,
  duracao: campoCurtoSchema,
  dados: campoCurtoSchema,
});

export const RACA_SCHEMA = Yup.object({
  nome: nomeSchema,
  raridade: Yup.string(),
  linkImagem: urlImagemSchema,
  atributosBasicos: Yup.object({
    forca: campoCurtoSchema,
    agilidade: campoCurtoSchema,
    percepcao: campoCurtoSchema,
    vitalidade: campoCurtoSchema,
    inteligencia: campoCurtoSchema,
    sorte: campoCurtoSchema,
    limiteMaximoAtributo: campoCurtoSchema,
  }),
  descricao: descricaoSchema,
  habilidadesRaciais: Yup.object({
    habilidadesBasicas: Yup.array().of(habilidadeBasicaSchema),
    habilidadesAvancadas: Yup.array().of(habilidadeAvancadaSchema),
  }),
});

export const HABILIDADE_BASICA_INICIAL = { nome: '', descricao: '', bonus: [] };

export const HABILIDADE_AVANCADA_INICIAL = {
  nome: '',
  tipo: 'Passiva',
  descricao: '',
  bonus: [],
  alvo: '',
  alcance: '',
  recarga: '',
  custo: '',
  duracao: '',
  dados: '',
};

export const RACA_INITIAL_VALUES = {
  nome: '',
  raridade: '',
  linkImagem: '',
  atributosBasicos: {
    forca: '',
    agilidade: '',
    percepcao: '',
    vitalidade: '',
    inteligencia: '',
    sorte: '',
    limiteMaximoAtributo: '',
  },
  descricao: '',
  habilidadesRaciais: {
    habilidadesBasicas: [],
    habilidadesAvancadas: [],
  },
};
