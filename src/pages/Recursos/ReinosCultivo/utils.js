import * as Yup from 'yup';
import {
  nomeSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

const numeroOpcionalSchema = Yup.number()
  .typeError('Deve ser um número')
  .min(0, 'Deve ser maior ou igual a 0')
  .transform((value, originalValue) =>
    String(originalValue).trim() === '' ? undefined : value,
  );

export const REINO_CULTIVO_SCHEMA = Yup.object({
  nome: nomeSchema,
  universo: Yup.string(),
  subUniverso: Yup.string(),
  linkImagem: urlImagemSchema,
  quantidadeSubReinos: numeroOpcionalSchema,
  experienciaPorSubReino: numeroOpcionalSchema,
  reinoAnterior: Yup.string(),
  descricao: descricaoSchema,
});

export const REINO_CULTIVO_INITIAL_VALUES = {
  nome: '',
  universo: '',
  subUniverso: '',
  linkImagem: '',
  quantidadeSubReinos: '',
  experienciaPorSubReino: '',
  reinoAnterior: '',
  descricao: '',
};
