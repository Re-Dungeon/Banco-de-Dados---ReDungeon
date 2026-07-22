import * as Yup from 'yup';
import {
  nomeSchema,
  campoCurtoSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

export const VEIA_ASTRAL_SCHEMA = Yup.object({
  nome: nomeSchema,
  linkImagem: urlImagemSchema,
  universo: Yup.string(),
  divindade: Yup.string(),
  requisito: Yup.string(),
  descricao: descricaoSchema,
  aprimoramento: descricaoSchema,
  custo: campoCurtoSchema,
  nivel: Yup.number()
    .integer('Nível deve ser um número inteiro')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
});

export const VEIA_ASTRAL_INITIAL_VALUES = {
  nome: '',
  linkImagem: '',
  universo: '',
  divindade: '',
  requisito: '',
  descricao: '',
  aprimoramento: '',
  custo: '',
  nivel: '',
};
