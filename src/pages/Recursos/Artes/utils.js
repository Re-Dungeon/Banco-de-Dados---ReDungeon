import * as Yup from 'yup';

export const ARTE_SCHEMA = Yup.object({
  nome: Yup.string().required('Nome é obrigatório'),
  linkImagem: Yup.string(),
  universo: Yup.string(),
  recarga: Yup.string(),
  tipo: Yup.string(),
  acao: Yup.string(),
  duracao: Yup.string(),
  alcance: Yup.string(),
  alvos: Yup.string(),
  custo: Yup.string(),
  dados: Yup.string(),
  descricao: Yup.string(),
  classificacao: Yup.string(),
  circuloMagico: Yup.string(),
  cantico: Yup.string(),
  condicoesAplicadas: Yup.array(),
});

export const ARTE_INITIAL_VALUES = {
  nome: '',
  linkImagem: '',
  universo: '',
  recarga: '',
  tipo: '',
  acao: '',
  duracao: '',
  alcance: '',
  alvos: '',
  custo: '',
  dados: '',
  descricao: '',
  classificacao: '',
  circuloMagico: '',
  cantico: '',
  condicoesAplicadas: [],
};
