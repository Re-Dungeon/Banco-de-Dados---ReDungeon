import * as Yup from 'yup';

export const CLASSE_SCHEMA = Yup.object({
  nome: Yup.string().required('Nome é obrigatório'),
  tipo: Yup.string(),
  descricao: Yup.string(),
  habilidades: Yup.string(),
});
