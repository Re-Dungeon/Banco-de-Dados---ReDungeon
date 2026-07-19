import * as Yup from 'yup';
import {
  nomeSchema,
  campoCurtoSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

export const CONDICAO_SCHEMA = Yup.object({
  nome: nomeSchema,
  descricao: descricaoSchema,
  duracao: campoCurtoSchema,
  raridade: Yup.string(),
  universo: Yup.string(),
  linkImagem: urlImagemSchema,
  aplicacao: campoCurtoSchema,
  efeitos: Yup.array().of(campoCurtoSchema),
  interacoes: Yup.array().of(campoCurtoSchema),
});

export const CONDICAO_INITIAL_VALUES = {
  nome: '',
  descricao: '',
  duracao: '',
  raridade: '',
  universo: '',
  linkImagem: '',
  aplicacao: '',
  efeitos: [],
  interacoes: [],
};
