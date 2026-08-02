import { describe, expect, it } from 'vitest';

import { getBonusEntriesByTipo, normalizeBonusEntries } from './utils';

describe('normalizeBonusEntries', () => {
  it('converte entradas antigas em texto para o formato com tipo', () => {
    expect(
      normalizeBonusEntries(['Resistência', { texto: 'Agilidade', tipo: 'desvantagem' }]),
    ).toEqual([
      { texto: 'Resistência', tipo: 'vantagem' },
      { texto: 'Agilidade', tipo: 'desvantagem' },
    ]);
  });

  it('retorna um array vazio para valores nulos', () => {
    expect(normalizeBonusEntries()).toEqual([]);
    expect(normalizeBonusEntries(null)).toEqual([]);
  });
});

describe('getBonusEntriesByTipo', () => {
  it('agrupa os registros em vantagens e desvantagens', () => {
    const entries = [
      { texto: 'Forte', tipo: 'vantagem' },
      { texto: 'Lento', tipo: 'desvantagem' },
      { texto: 'Ágil', tipo: 'vantagem' },
    ];

    expect(getBonusEntriesByTipo(entries)).toEqual({
      vantagens: [{ texto: 'Forte', tipo: 'vantagem' }, { texto: 'Ágil', tipo: 'vantagem' }],
      desvantagens: [{ texto: 'Lento', tipo: 'desvantagem' }],
    });
  });
});
