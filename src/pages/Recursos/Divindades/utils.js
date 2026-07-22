import * as Yup from 'yup';
import {
  nomeSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

export const DIVINDADE_SCHEMA = Yup.object({
  nome: nomeSchema,
  universo: Yup.string(),
  cor: Yup.string()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/, {
      message: 'Deve ser uma cor hexadecimal válida (#rrggbb)',
      excludeEmptyString: true,
    }),
  linkImagem: urlImagemSchema,
  descricao: descricaoSchema,
});

export const DIVINDADE_INITIAL_VALUES = {
  nome: '',
  universo: '',
  cor: '#ffffff',
  linkImagem: '',
  descricao: '',
};
