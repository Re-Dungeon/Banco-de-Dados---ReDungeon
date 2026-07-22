import * as Yup from 'yup';
import {
  nomeSchema,
  campoCurtoSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

const bonusNivelSchema = Yup.object({
  descricaoCurta: campoCurtoSchema,
  descricaoCompleta: descricaoSchema,
});

const nivelProgressaoSchema = Yup.object({
  nivel: Yup.number().integer(),
  possuiBonus: Yup.boolean(),
  bonus: bonusNivelSchema,
});

export const APTIDAO_SCHEMA = Yup.object({
  nome: nomeSchema,
  universos: Yup.array().of(Yup.string()),
  linkImagem: urlImagemSchema,
  descricao: descricaoSchema,
  nivelMaximo: Yup.number()
    .integer('Nível Máximo deve ser um número inteiro')
    .min(1, 'Nível Máximo deve ser no mínimo 1')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  progressaoNiveis: Yup.array().of(nivelProgressaoSchema),
});

export const BONUS_NIVEL_INICIAL = {
  descricaoCurta: '',
  descricaoCompleta: '',
};

export const NIVEL_PROGRESSAO_INICIAL = nivel => ({
  nivel,
  possuiBonus: false,
  bonus: { ...BONUS_NIVEL_INICIAL },
});

export const APTIDAO_INITIAL_VALUES = {
  nome: '',
  universos: [],
  linkImagem: '',
  descricao: '',
  nivelMaximo: '',
  progressaoNiveis: [],
};

/**
 * Aptidões antigas ainda podem ter o campo singular `universo` gravado no
 * Firestore (antes do suporte a múltiplos universos). Este helper unifica
 * a leitura para sempre retornar uma lista de ids.
 */
export const getAptidaoUniversos = aptidao =>
  aptidao?.universos ?? (aptidao?.universo ? [aptidao.universo] : []);

export const formatNomesUniversos = (universoIds, universos) =>
  universos
    .filter(u => universoIds.includes(u.id))
    .map(u => u.Nome)
    .join(', ');
