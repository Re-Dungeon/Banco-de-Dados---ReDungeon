import * as Yup from 'yup';
import {
  nomeSchema,
  campoCurtoSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

export const ARTE_SCHEMA = Yup.object({
  nome: nomeSchema,
  linkImagem: urlImagemSchema,
  universo: Yup.string(),
  recarga: campoCurtoSchema,
  tipo: Yup.string(),
  acao: Yup.string(),
  duracao: campoCurtoSchema,
  alcance: campoCurtoSchema,
  alvos: campoCurtoSchema,
  custo: campoCurtoSchema,
  dados: campoCurtoSchema,
  descricao: descricaoSchema,
  classificacao: Yup.string(),
  circuloMagico: campoCurtoSchema,
  cantico: descricaoSchema,
  condicoesAplicadas: Yup.array(),
});

export const ARTE_INITIAL_VALUES = {
  nome: '',
  linkImagem: '',
  universo: '',
  recarga: '',
  tipo: '',
  acao: '',
  duracao: '',
  alcance: '',
  alvos: '',
  custo: '',
  dados: '',
  descricao: '',
  classificacao: '',
  circuloMagico: '',
  cantico: '',
  condicoesAplicadas: [],
};
