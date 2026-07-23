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
  universos: Yup.array().of(Yup.string()),
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
  universos: [],
  linkImagem: '',
  aplicacao: '',
  efeitos: [],
  interacoes: [],
};

/**
 * Condições antigas ainda podem ter o campo singular `universo` gravado no
 * Firestore (antes do suporte a múltiplos universos). Este helper unifica
 * a leitura para sempre retornar uma lista de ids.
 */
export const getCondicaoUniversos = condicao =>
  condicao?.universos ?? (condicao?.universo ? [condicao.universo] : []);

export const formatNomesUniversos = (universoIds, universos) =>
  universos
    .filter(u => universoIds.includes(u.id))
    .map(u => u.Nome)
    .join(', ');
