import * as Yup from 'yup';
import {
  nomeSchema,
  campoCurtoSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

export const RECEITA_SCHEMA = Yup.object({
  nome: nomeSchema,
  raridade: Yup.string(),
  categoria: Yup.string(),
  universo: Yup.string(),
  linkImagem: urlImagemSchema,
  materiais: Yup.array(),
  descricao: descricaoSchema,
  valorCompra: campoCurtoSchema,
  valorVenda: campoCurtoSchema,
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
