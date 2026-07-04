import * as Yup from 'yup';

export const MATERIAL_SCHEMA = Yup.object({
  nome: Yup.string().required('Nome é obrigatório'),
  linkImagem: Yup.string(),
  tipo: Yup.string(),
  raridade: Yup.string(),
  valorMercado: Yup.string(),
  quantidadeBase: Yup.string(),
  pureza: Yup.number().min(0).max(100),
  taxaDrop: Yup.number().min(0).max(100),
  descricao: Yup.string(),
  propriedades: Yup.string(),
});

export const MATERIAL_INITIAL_VALUES = {
  nome: '',
  linkImagem: '',
  tipo: '',
  raridade: '',
  valorMercado: '',
  quantidadeBase: '',
  pureza: 0,
  taxaDrop: 0,
  descricao: '',
  propriedades: '',
};
