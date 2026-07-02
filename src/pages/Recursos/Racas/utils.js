import * as Yup from 'yup';

const habilidadeBasicaSchema = Yup.object({
  nome: Yup.string().required('Nome é obrigatório'),
  descricao: Yup.string(),
  bonus: Yup.array().of(Yup.string()),
});

const habilidadeAvancadaSchema = Yup.object({
  nome: Yup.string().required('Nome é obrigatório'),
  tipo: Yup.string().oneOf(['Imediata', 'Duradoura', 'Sustentada', 'Passiva']),
  descricao: Yup.string(),
  bonus: Yup.array().of(Yup.string()),
  alvo: Yup.string(),
  alcance: Yup.string(),
  recarga: Yup.string(),
  custo: Yup.string(),
  duracao: Yup.string(),
  dados: Yup.string(),
});

export const RACA_SCHEMA = Yup.object({
  nome: Yup.string().required('Nome é obrigatório'),
  raridade: Yup.string(),
  linkImagem: Yup.string(),
  atributosBasicos: Yup.object({
    forca: Yup.string(),
    agilidade: Yup.string(),
    percepcao: Yup.string(),
    vitalidade: Yup.string(),
    inteligencia: Yup.string(),
    sorte: Yup.string(),
    limiteMaximoAtributo: Yup.string(),
  }),
  descricao: Yup.string(),
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
