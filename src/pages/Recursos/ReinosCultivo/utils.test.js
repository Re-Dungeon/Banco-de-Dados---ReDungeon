import { describe, it, expect } from 'vitest';
import {
  REINO_CULTIVO_SCHEMA,
  REINO_CULTIVO_INITIAL_VALUES,
  normalizeRegrasCultivoValues,
} from './utils';

describe('normalizeRegrasCultivoValues', () => {
  it('cria estrutura segura para documentos antigos sem regras', () => {
    expect(normalizeRegrasCultivoValues(undefined)).toMatchObject({
      pontos: '',
      destinosPermitidos: [],
      atributos: expect.arrayContaining([
        expect.objectContaining({ id: 'forca' }),
        expect.objectContaining({ id: 'saude' }),
      ]),
    });
  });

  it('mantém os ids e categorias de atributos já existentes no projeto', async () => {
    const validValues = {
      nome: 'Cristalização',
      universo: 'u1',
      regrasCultivo: {
        pontos: 10,
        destinosPermitidos: ['atributosPrincipais', 'status'],
        atributos: [
          { id: 'forca', permitido: true, limite: 5 },
          { id: 'saude', permitido: false, limite: '' },
        ],
      },
    };

    await expect(REINO_CULTIVO_SCHEMA.validate(validValues)).resolves.toBeTruthy();
  });
});

describe('REINO_CULTIVO_INITIAL_VALUES', () => {
  it('expõe a estrutura de regras de cultivo com valores padrão seguros', () => {
    expect(REINO_CULTIVO_INITIAL_VALUES.regrasCultivo).toMatchObject({
      pontos: '',
      destinosPermitidos: [],
      atributos: expect.arrayContaining([
        expect.objectContaining({ id: 'forca' }),
        expect.objectContaining({ id: 'prontidao' }),
        expect.objectContaining({ id: 'saude' }),
      ]),
    });
  });
});
