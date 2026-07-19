import * as Yup from 'yup';
import {
  nomeSchema,
  campoCurtoSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

export const REGRA_SCHEMA = Yup.object({
  nome: nomeSchema,
  linkImagem: urlImagemSchema,
  universo: Yup.string(),
  categoria: Yup.string(),
  tipo: Yup.string(),
  complexidade: Yup.string(),
  descricaoCurta: campoCurtoSchema,
  explicacaoCompleta: descricaoSchema,
  comoFunciona: descricaoSchema,
  dadosUtilizados: campoCurtoSchema,
  sucesso: campoCurtoSchema,
  falha: campoCurtoSchema,
  custo: campoCurtoSchema,
  limite: campoCurtoSchema,
  requisitos: descricaoSchema,
  exemplo: descricaoSchema,
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
