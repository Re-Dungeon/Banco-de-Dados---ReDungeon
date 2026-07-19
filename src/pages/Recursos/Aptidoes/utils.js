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
  bonus: Yup.array().of(bonusNivelSchema),
});

export const APTIDAO_SCHEMA = Yup.object({
  nome: nomeSchema,
  universo: Yup.string(),
  linkImagem: urlImagemSchema,
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

export const APTIDAO_INITIAL_VALUES = {
  nome: '',
  universo: '',
  linkImagem: '',
  nivelMaximo: '',
  progressaoNiveis: [],
};
