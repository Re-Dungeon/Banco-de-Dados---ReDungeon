import * as Yup from 'yup';
import {
  nomeSchema,
  descricaoSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

const numeroOpcionalSchema = Yup.number()
  .typeError('Deve ser um número')
  .min(0, 'Deve ser maior ou igual a 0')
  .transform((value, originalValue) =>
    String(originalValue).trim() === '' ? undefined : value,
  );

export const REGRAS_CULTIVO_CATEGORIAS = {
  atributosPrincipais: 'Atributos Principais',
  atributosSecundarios: 'Atributos Secundários',
  status: 'Status',
};

export const REGRAS_CULTIVO_ATRIBUTOS = [
  { id: 'forca', label: 'Força', categoria: 'atributosPrincipais' },
  { id: 'vitalidade', label: 'Vitalidade', categoria: 'atributosPrincipais' },
  { id: 'agilidade', label: 'Agilidade', categoria: 'atributosPrincipais' },
  { id: 'inteligencia', label: 'Inteligência', categoria: 'atributosPrincipais' },
  { id: 'percepcao', label: 'Percepção', categoria: 'atributosPrincipais' },
  { id: 'sorte', label: 'Sorte', categoria: 'atributosPrincipais' },
  { id: 'prontidao', label: 'Prontidão', categoria: 'atributosSecundarios' },
  { id: 'ataque', label: 'Ataque', categoria: 'atributosSecundarios' },
  { id: 'defesa', label: 'Defesa', categoria: 'atributosSecundarios' },
  { id: 'reacao', label: 'Reação', categoria: 'atributosSecundarios' },
  { id: 'precisao', label: 'Precisão', categoria: 'atributosSecundarios' },
  { id: 'evasao', label: 'Evasão', categoria: 'atributosSecundarios' },
  { id: 'saude', label: 'Saúde', categoria: 'status' },
  { id: 'energia', label: 'Energia', categoria: 'status' },
  { id: 'fadiga', label: 'Fadiga', categoria: 'status' },
];

export const getAtributosPorCategoria = categoria =>
  REGRAS_CULTIVO_ATRIBUTOS.filter(atributo => atributo.categoria === categoria);

export const syncCategoriaAtributos = (
  regrasCultivo = {},
  categoria,
  permitido,
) => {
  const normalized = normalizeRegrasCultivoValues(regrasCultivo);
  const atributosCategoria = getAtributosPorCategoria(categoria);

  const atributos = normalized.atributos.map(atributo => {
    const pertenceACategoria = atributosCategoria.some(
      item => item.id === atributo.id,
    );

    if (!pertenceACategoria) return atributo;

    return {
      ...atributo,
      permitido,
    };
  });

  const destinosPermitidos = Array.from(
    new Set(
      permitido
        ? [...normalized.destinosPermitidos, categoria]
        : normalized.destinosPermitidos.filter(destino => destino !== categoria),
    ),
  );

  return {
    ...normalized,
    destinosPermitidos,
    atributos,
  };
};

export const syncCategoriasPorAtributos = regrasCultivo => {
  const normalized = normalizeRegrasCultivoValues(regrasCultivo);
  const destinosPermitidos = new Set(normalized.destinosPermitidos);

  Object.keys(REGRAS_CULTIVO_CATEGORIAS).forEach(categoria => {
    const atributosCategoria = getAtributosPorCategoria(categoria);
    const categoriaPermitida =
      atributosCategoria.length > 0 &&
      atributosCategoria.every(atributo =>
        normalized.atributos.some(
          item => item.id === atributo.id && Boolean(item.permitido),
        ),
      );

    if (categoriaPermitida) {
      destinosPermitidos.add(categoria);
    } else {
      destinosPermitidos.delete(categoria);
    }
  });

  return {
    ...normalized,
    destinosPermitidos: Array.from(destinosPermitidos),
  };
};

export const normalizeRegrasCultivoValues = regrasCultivo => {
  const existingAtributos = Array.isArray(regrasCultivo?.atributos)
    ? regrasCultivo.atributos
    : [];

  const destinosPermitidos = Array.isArray(regrasCultivo?.destinosPermitidos)
    ? regrasCultivo.destinosPermitidos.filter(destino =>
        Object.prototype.hasOwnProperty.call(
          REGRAS_CULTIVO_CATEGORIAS,
          destino,
        ),
      )
    : [];

  return {
    pontos: regrasCultivo?.pontos ?? '',
    destinosPermitidos,
    atributos: REGRAS_CULTIVO_ATRIBUTOS.map(atributo => {
      const regraAtual = existingAtributos.find(item => item.id === atributo.id);

      return {
        id: atributo.id,
        permitido: Boolean(regraAtual?.permitido),
        limite: regraAtual?.limite ?? '',
      };
    }),
  };
};

export const REINO_CULTIVO_SCHEMA = Yup.object({
  nome: nomeSchema,
  universo: Yup.string(),
  subUniverso: Yup.string(),
  linkImagem: urlImagemSchema,
  quantidadeSubReinos: numeroOpcionalSchema,
  experienciaPorSubReino: numeroOpcionalSchema,
  reinoAnterior: Yup.string(),
  descricao: descricaoSchema,
  regrasCultivo: Yup.object({
    pontos: numeroOpcionalSchema,
    destinosPermitidos: Yup.array().of(
      Yup.string().oneOf(Object.keys(REGRAS_CULTIVO_CATEGORIAS)),
    ),
    atributos: Yup.array().of(
      Yup.object({
        id: Yup.string().oneOf(REGRAS_CULTIVO_ATRIBUTOS.map(item => item.id)),
        permitido: Yup.boolean(),
        limite: numeroOpcionalSchema,
      }),
    ),
  }),
});

export const REINO_CULTIVO_INITIAL_VALUES = {
  nome: '',
  universo: '',
  subUniverso: '',
  linkImagem: '',
  quantidadeSubReinos: '',
  experienciaPorSubReino: '',
  reinoAnterior: '',
  descricao: '',
  regrasCultivo: normalizeRegrasCultivoValues(),
};
