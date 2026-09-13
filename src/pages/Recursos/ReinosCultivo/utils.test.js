import { describe, it, expect } from 'vitest';
import {
  REINO_CULTIVO_SCHEMA,
  REINO_CULTIVO_INITIAL_VALUES,
  normalizeRegrasCultivoValues,
  REGRAS_CULTIVO_ATRIBUTOS,
  syncCategoriaAtributos,
  syncCategoriasPorAtributos,
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

describe('syncCategoriaAtributos', () => {
  it('marca automaticamente todos os atributos da categoria ao ativar o destino', () => {
    const regrasCultivo = {
      destinosPermitidos: ['status'],
      atributos: REGRAS_CULTIVO_ATRIBUTOS.map(atributo => ({
        id: atributo.id,
        permitido: false,
        limite: '',
      })),
    };

    const resultado = syncCategoriaAtributos(
      regrasCultivo,
      'atributosPrincipais',
      true,
    );

    expect(resultado.destinosPermitidos).toEqual(
      expect.arrayContaining(['status', 'atributosPrincipais']),
    );
    expect(
      resultado.atributos
        .filter(atributo =>
          ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao', 'sorte'].includes(
            atributo.id,
          ),
        )
        .every(atributo => atributo.permitido),
    ).toBe(true);
    expect(
      resultado.atributos.find(atributo => atributo.id === 'saude')?.permitido,
    ).toBe(false);
  });

  it('desmarca todos os atributos da categoria ao desativar o destino', () => {
    const regrasCultivo = {
      destinosPermitidos: ['atributosPrincipais'],
      atributos: REGRAS_CULTIVO_ATRIBUTOS.map(atributo => ({
        id: atributo.id,
        permitido: true,
        limite: '',
      })),
    };

    const resultado = syncCategoriaAtributos(
      regrasCultivo,
      'atributosPrincipais',
      false,
    );

    expect(resultado.destinosPermitidos).not.toContain('atributosPrincipais');
    expect(
      resultado.atributos
        .filter(atributo =>
          ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao', 'sorte'].includes(
            atributo.id,
          ),
        )
        .every(atributo => !atributo.permitido),
    ).toBe(true);
  });
});

describe('syncCategoriasPorAtributos', () => {
  it('ativa o destino da categoria quando todos os atributos daquela categoria forem permitidos', () => {
    const regrasCultivo = {
      destinosPermitidos: [],
      atributos: REGRAS_CULTIVO_ATRIBUTOS.map(atributo => ({
        id: atributo.id,
        permitido: atributo.categoria === 'atributosSecundarios',
        limite: '',
      })),
    };

    const resultado = syncCategoriasPorAtributos(regrasCultivo);

    expect(resultado.destinosPermitidos).toContain('atributosSecundarios');
    expect(resultado.destinosPermitidos).not.toContain('atributosPrincipais');
  });
});
