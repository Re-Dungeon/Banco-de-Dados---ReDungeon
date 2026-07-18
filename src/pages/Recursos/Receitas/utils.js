import * as Yup from 'yup';

export const RECEITA_SCHEMA = Yup.object({
  nome: Yup.string().required('Nome é obrigatório'),
  raridade: Yup.string(),
  categoria: Yup.string(),
  universo: Yup.string(),
  linkImagem: Yup.string(),
  materiais: Yup.array(),
  descricao: Yup.string(),
  valorCompra: Yup.string(),
  valorVenda: Yup.string(),
});

export const RECEITA_INITIAL_VALUES = {
  nome: '',
  raridade: '',
  categoria: '',
  universo: '',
  linkImagem: '',
  materiais: [],
  descricao: '',
  valorCompra: '',
  valorVenda: '',
};
