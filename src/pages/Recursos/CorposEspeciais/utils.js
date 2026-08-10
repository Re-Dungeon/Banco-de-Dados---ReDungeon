import * as Yup from 'yup';
import {
  nomeSchema,
  campoCurtoSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

const bonusEntrySchema = Yup.object({
  texto: campoCurtoSchema.required('O texto do bônus é obrigatório'),
  tipo: Yup.string().oneOf(['vantagem', 'desvantagem']).required('Selecione o tipo'),
});

export const CORPO_ESPECIAL_SCHEMA = Yup.object({
  nome: nomeSchema,
  universo: Yup.string(),
  linkImagem: urlImagemSchema,
  descricao: descricaoSchema,
  bonus: Yup.array().of(bonusEntrySchema),
});

export const CORPO_ESPECIAL_INITIAL_VALUES = {
  nome: '',
  universo: '',
  linkImagem: '',
  descricao: '',
  bonus: [],
};

export const normalizeBonusEntries = bonusEntries => {
  if (!Array.isArray(bonusEntries)) {
    return [];
  }

  return bonusEntries.map(entry => {
    if (typeof entry === 'string') {
      return { texto: entry, tipo: 'vantagem' };
    }

    if (entry && typeof entry === 'object') {
      return {
        texto: entry.texto ?? '',
        tipo: entry.tipo === 'desvantagem' ? 'desvantagem' : 'vantagem',
      };
    }

    return { texto: '', tipo: 'vantagem' };
  });
};

export const getBonusEntriesByTipo = bonusEntries => {
  const entries = normalizeBonusEntries(bonusEntries);

  return {
    vantagens: entries.filter(entry => entry.tipo === 'vantagem'),
    desvantagens: entries.filter(entry => entry.tipo === 'desvantagem'),
  };
};
