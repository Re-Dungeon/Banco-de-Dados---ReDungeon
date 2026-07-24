import * as Yup from 'yup';
import {
  nomeSchema,
  campoCurtoSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

export const CORPO_ESPECIAL_SCHEMA = Yup.object({
  nome: nomeSchema,
  universo: Yup.string(),
  linkImagem: urlImagemSchema,
  descricao: descricaoSchema,
  bonus: Yup.array().of(campoCurtoSchema),
});

export const CORPO_ESPECIAL_INITIAL_VALUES = {
  nome: '',
  universo: '',
  linkImagem: '',
  descricao: '',
  bonus: [],
};
