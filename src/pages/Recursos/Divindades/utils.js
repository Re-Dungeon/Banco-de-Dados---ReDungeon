import * as Yup from 'yup';
import {
  nomeSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

export const DIVINDADE_SCHEMA = Yup.object({
  nome: nomeSchema,
  universo: Yup.string(),
  linkImagem: urlImagemSchema,
  descricao: descricaoSchema,
});

export const DIVINDADE_INITIAL_VALUES = {
  nome: '',
  universo: '',
  linkImagem: '',
  descricao: '',
};
