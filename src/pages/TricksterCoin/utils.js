import * as Yup from 'yup';
import {
  nomeSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

export const BONUS_TYPE_OPTIONS = ['Vantagem', 'Desvantagem', 'Neutro'];
export const STATUS_OPTIONS = ['Ativo', 'Inativo'];
export const PERIODO_OPTIONS = ['Nenhum', 'Sessão', 'Dia'];
export const BENEFICIO_INITIAL_VALUES = {
  nome: '',
  descricao: '',
  linkImagem: '',
  tag: '',
  universos: [],
  bonus: [{ texto: '', tipo: 'Vantagem' }],
  custo: 0,
  tokens: [],
  acumulavel: true,
  limiteAcumulacao: 0,
  limitePorPeriodo: 0,
  periodo: 'Nenhum',
  status: 'Ativo',
};

export const normalizeBonusType = value => {
  const normalized = String(value ?? '').trim().toLowerCase();

  switch (normalized) {
    case 'vantagem':
      return 'Vantagem';
    case 'desvantagem':
      return 'Desvantagem';
    case 'neutro':
      return 'Neutro';
    default:
      return 'Neutro';
  }
};

export const normalizeBonusEntries = (bonusEntries, fallbackTipo = 'Neutro') => {
  const normalizedFallback = normalizeBonusType(fallbackTipo);

  const toNormalizedEntry = entry => {
    if (typeof entry === 'string') {
      const texto = entry.trim();
      return texto ? { texto, tipo: normalizedFallback } : null;
    }

    if (entry && typeof entry === 'object') {
      const texto = String(entry.texto ?? entry.descricao ?? '').trim();
      const tipo = normalizeBonusType(entry.tipo ?? entry.tipoBonus ?? normalizedFallback);

      if (!texto) {
        return null;
      }

      return { texto, tipo };
    }

    return null;
  };

  if (!Array.isArray(bonusEntries)) {
    const legacyEntry = toNormalizedEntry(bonusEntries);
    return legacyEntry ? [legacyEntry] : [];
  }

  return bonusEntries
    .map(toNormalizedEntry)
    .filter(Boolean)
    .filter(entry => String(entry.texto).trim().length > 0);
};

export const getBonusEntriesByTipo = bonusEntries => {
  const entries = normalizeBonusEntries(bonusEntries);

  return {
    vantagens: entries.filter(entry => entry.tipo === 'Vantagem'),
    desvantagens: entries.filter(entry => entry.tipo === 'Desvantagem'),
    neutros: entries.filter(entry => entry.tipo === 'Neutro'),
  };
};

export const normalizeBenefitTag = value => {
  const tag = String(value ?? '').trim();
  if (!tag) {
    return '';
  }

  return tag.replace(/\s+/g, ' ');
};

export const resolveBenefitTag = (value, existingTags = []) => {
  const nextValue = normalizeBenefitTag(value);
  if (!nextValue) {
    return '';
  }

  const match = (existingTags || []).find(tag => {
    const candidate = normalizeBenefitTag(tag);
    return candidate && candidate.toLowerCase() === nextValue.toLowerCase();
  });

  return match || nextValue;
};

export const normalizeTokensValue = value => {
  const seen = new Set();
  const tokens = [];

  const addToken = token => {
    const normalizedToken = String(token ?? '').trim();
    if (!normalizedToken) {
      return;
    }

    const key = normalizedToken.toLowerCase();
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    tokens.push(normalizedToken);
  };

  if (Array.isArray(value)) {
    value.forEach(addToken);
    return tokens;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) {
      return [];
    }

    addToken(String(value));
    return tokens;
  }

  if (typeof value === 'string') {
    value
      .split(/[\n,]+/)
      .forEach(fragment => addToken(fragment));
    return tokens;
  }

  return [];
};

export const getTricksterCoinTagOptions = benefits => {
  const uniqueTags = new Map();

  (benefits || []).forEach(benefit => {
    const tag = normalizeBenefitTag(benefit?.tag);
    if (!tag) {
      return;
    }

    const normalizedKey = tag.toLowerCase();
    if (!uniqueTags.has(normalizedKey)) {
      uniqueTags.set(normalizedKey, tag);
    }
  });

  return [...uniqueTags.values()].sort((a, b) =>
    a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }),
  );
};

export const normalizeNumberValue = (value, fallback = 0) => {
  if (value === '' || value === null || value === undefined) {
    return fallback;
  }

  const nextValue = Number(value);
  if (!Number.isFinite(nextValue)) {
    return fallback;
  }

  return Math.max(0, nextValue);
};

export const normalizeUniversosValue = value => {
  const sourceValues = Array.isArray(value)
    ? value
    : value === undefined || value === null || value === ''
      ? []
      : [value];

  const normalized = [];
  const seen = new Set();

  sourceValues.forEach(item => {
    const nextValue = String(item ?? '').trim();
    if (
      !nextValue ||
      nextValue === '__TRICKSTER_COIN_SELECT_ALL__' ||
      nextValue.toLowerCase() === 'todos os universos' ||
      seen.has(nextValue)
    ) {
      return;
    }

    seen.add(nextValue);
    normalized.push(nextValue);
  });

  return normalized;
};

export const getTricksterCoinUniversos = benefit => {
  const rawUniversos = Array.isArray(benefit?.universos)
    ? benefit.universos
    : benefit?.universos || benefit?.universo
      ? [benefit?.universos ?? benefit?.universo]
      : [];

  return normalizeUniversosValue(rawUniversos);
};

export const normalizeBenefitPayload = values => {
  const normalizedTag = normalizeBenefitTag(values?.tag);
  const acumulavel = Boolean(values?.acumulavel);
  const bonusEntries = normalizeBonusEntries(values?.bonus, values?.tipoBonus ?? 'Neutro');
  const tokens = normalizeTokensValue(values?.tokens);
  const universos = normalizeUniversosValue(values?.universos ?? values?.universo);
  const limiteAcumulacao = acumulavel
    ? normalizeNumberValue(values?.limiteAcumulacao, 0)
    : 0;
  const limitePorPeriodo = normalizeNumberValue(values?.limitePorPeriodo, 0);
  const periodo = PERIODO_OPTIONS.includes(values?.periodo)
    ? values.periodo
    : 'Nenhum';

  return {
    nome: String(values?.nome ?? '').trim(),
    descricao: String(values?.descricao ?? '').trim(),
    linkImagem: String(values?.linkImagem ?? '').trim(),
    tag: normalizedTag,
    universos,
    bonus: bonusEntries,
    custo: normalizeNumberValue(values?.custo, 0),
    tokens,
    acumulavel,
    limiteAcumulacao,
    limitePorPeriodo: limitePorPeriodo > 0 ? limitePorPeriodo : 0,
    periodo: limitePorPeriodo > 0 ? periodo : 'Nenhum',
    status: STATUS_OPTIONS.includes(values?.status) ? values.status : 'Ativo',
  };
};

const bonusEntrySchema = Yup.object({
  texto: Yup.string().trim().max(400, 'Bônus deve ter no máximo 400 caracteres'),
  tipo: Yup.string()
    .oneOf(BONUS_TYPE_OPTIONS, 'Tipo de bônus inválido')
    .required('Tipo do bônus é obrigatório'),
});

export const TRICKSTER_COIN_SCHEMA = Yup.object({
  nome: nomeSchema,
  descricao: descricaoSchema,
  linkImagem: urlImagemSchema.nullable().notRequired(),
  universos: Yup.array().of(Yup.string().trim().required('Universo inválido')).default([]),
  tag: Yup.string()
    .trim()
    .required('Tag é obrigatória')
    .max(100, 'Tag deve ter no máximo 100 caracteres'),
  bonus: Yup.array()
    .of(bonusEntrySchema)
    .test('bonus-validado', 'Adicione ao menos um bônus válido.', value => {
      if (!Array.isArray(value) || value.length === 0) {
        return false;
      }

      const invalidPartialRows = value.some(item => {
        const texto = String(item?.texto ?? '').trim();
        const tipo = String(item?.tipo ?? '').trim();

        return (texto && !tipo) || (!texto && tipo);
      });

      if (invalidPartialRows) {
        return false;
      }

      return value.some(item => String(item?.texto ?? '').trim().length > 0);
    }),
  custo: Yup.number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue === null ? 0 : Number(value),
    )
    .min(0, 'Custo deve ser maior ou igual a 0')
    .required('Custo é obrigatório'),
  tokens: Yup.array()
    .of(Yup.string().trim().min(1, 'Token não pode ser vazio'))
    .test('tokens-validos', 'Tokens inválidos.', value => {
      if (!Array.isArray(value)) {
        return true;
      }

      return value.every(token => String(token ?? '').trim().length > 0);
    }),
  acumulavel: Yup.boolean().required('Informe se é acumulável'),
  limiteAcumulacao: Yup.number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue === null ? 0 : Number(value),
    )
    .min(0, 'Limite de acúmulo deve ser maior ou igual a 0')
    .when('acumulavel', {
      is: true,
      otherwise: schema => schema.transform(() => 0),
    }),
  limitePorPeriodo: Yup.number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue === null ? 0 : Number(value),
    )
    .min(0, 'Limite por período deve ser maior ou igual a 0')
    .when('periodo', {
      is: value => value && value !== 'Nenhum',
      then: schema => schema.min(1, 'Informe um limite por período válido'),
      otherwise: schema => schema.transform(() => 0),
    }),
  periodo: Yup.string()
    .oneOf(PERIODO_OPTIONS, 'Período inválido')
    .default('Nenhum'),
  status: Yup.string()
    .oneOf(STATUS_OPTIONS, 'Status inválido')
    .required('Status é obrigatório'),
});
