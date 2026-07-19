import * as Yup from 'yup';
import {
  nomeSchema,
  campoCurtoSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

export const MATERIAL_SCHEMA = Yup.object({
  nome: nomeSchema,
  linkImagem: urlImagemSchema,
  tipo: Yup.string(),
  raridade: Yup.string(),
  valorMercado: campoCurtoSchema,
  quantidadeBase: campoCurtoSchema,
  pureza: Yup.number().min(0).max(100),
  taxaDrop: Yup.number().min(0).max(100),
  descricao: descricaoSchema,
  propriedades: descricaoSchema,
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
