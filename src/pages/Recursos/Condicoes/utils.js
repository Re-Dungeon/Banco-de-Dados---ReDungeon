import * as Yup from 'yup';

export const CONDICAO_SCHEMA = Yup.object({
  nome: Yup.string().required('Nome é obrigatório'),
  descricao: Yup.string(),
  duracao: Yup.string(),
  raridade: Yup.string(),
  universo: Yup.string(),
  linkImagem: Yup.string(),
  aplicacao: Yup.string(),
  efeitos: Yup.array().of(Yup.string()),
  interacoes: Yup.array().of(Yup.string()),
});

export const CONDICAO_INITIAL_VALUES = {
  nome: '',
  descricao: '',
  duracao: '',
  raridade: '',
  universo: '',
  linkImagem: '',
  aplicacao: '',
  efeitos: [],
  interacoes: [],
};
