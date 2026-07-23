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
  universos: Yup.array().of(Yup.string()),
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
  universos: [],
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

/**
 * Regras antigas ainda podem ter o campo singular `universo` gravado no
 * Firestore (antes do suporte a múltiplos universos). Este helper unifica
 * a leitura para sempre retornar uma lista de ids.
 */
export const getRegraUniversos = regra =>
  regra?.universos ?? (regra?.universo ? [regra.universo] : []);

export const formatNomesUniversos = (universoIds, universos) =>
  universos
    .filter(u => universoIds.includes(u.id))
    .map(u => u.Nome)
    .join(', ');
