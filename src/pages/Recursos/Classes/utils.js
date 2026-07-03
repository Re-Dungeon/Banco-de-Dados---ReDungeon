import * as Yup from 'yup';

const habilidadeBasicaSchema = Yup.object({
  nome: Yup.string().required('Nome é obrigatório'),
  descricao: Yup.string(),
  raridade: Yup.string(),
  bonus: Yup.array().of(Yup.string()),
  alcance: Yup.string(),
  alvo: Yup.string(),
  custo: Yup.string(),
  recarga: Yup.string(),
  duracao: Yup.string(),
  dados: Yup.string(),
});

const habilidadeAvancadaSchema = Yup.object({
  nome: Yup.string().required('Nome é obrigatório'),
  descricao: Yup.string(),
  raridade: Yup.string(),
  bonus: Yup.array().of(Yup.string()),
  alcance: Yup.string(),
  alvo: Yup.string(),
  custo: Yup.string(),
  recarga: Yup.string(),
  duracao: Yup.string(),
  dados: Yup.string(),
});

export const CLASSE_SCHEMA = Yup.object({
  nome: Yup.string().required('Nome é obrigatório'),
  raridade: Yup.string(),
  linkImagem: Yup.string(),
  descricao: Yup.string(),
  atributosBasicos: Yup.object({
    forca: Yup.string(),
    vitalidade: Yup.string(),
    agilidade: Yup.string(),
    inteligencia: Yup.string(),
    percepcao: Yup.string(),
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
