import * as Yup from 'yup';

export const VEIA_ASTRAL_SCHEMA = Yup.object({
  nome: Yup.string().required('Nome é obrigatório'),
  linkImagem: Yup.string(),
  universo: Yup.string(),
  divindade: Yup.string(),
  descricao: Yup.string(),
  aprimoramento: Yup.string(),
  custo: Yup.string(),
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
  descricao: '',
  aprimoramento: '',
  custo: '',
  nivel: '',
};
