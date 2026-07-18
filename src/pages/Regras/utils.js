import * as Yup from 'yup';

export const REGRA_SCHEMA = Yup.object({
  nome: Yup.string().required('Nome é obrigatório'),
  linkImagem: Yup.string(),
  universo: Yup.string(),
  categoria: Yup.string(),
  tipo: Yup.string(),
  complexidade: Yup.string(),
  descricaoCurta: Yup.string(),
  explicacaoCompleta: Yup.string(),
  comoFunciona: Yup.string(),
  dadosUtilizados: Yup.string(),
  sucesso: Yup.string(),
  falha: Yup.string(),
  custo: Yup.string(),
  limite: Yup.string(),
  requisitos: Yup.string(),
  exemplo: Yup.string(),
});

export const REGRA_INITIAL_VALUES = {
  nome: '',
  linkImagem: '',
  universo: '',
  categoria: '',
  tipo: '',
  complexidade: '',
  descricaoCurta: '',
  explicacaoCompleta: '',
  comoFunciona: '',
  dadosUtilizados: '',
  sucesso: '',
  falha: '',
  custo: '',
  limite: '',
  requisitos: '',
  exemplo: '',
};
