import { describe, expect, it } from 'vitest';
import {
  getTricksterCoinTagOptions,
  normalizeBenefitPayload,
  normalizeBenefitTag,
} from './utils';

describe('TricksterCoin utils', () => {
  it('deduplica tags e ignora vazias sem duplicar por case', () => {
    const tags = getTricksterCoinTagOptions([
      { tag: ' Benefícios Menores ' },
      { tag: 'benefícios menores' },
      { tag: 'Táticas' },
      { tag: '' },
      { tag: '  ' },
    ]);

    expect(tags).toEqual(['Benefícios Menores', 'Táticas']);
  });

  it('normaliza payload para tokens em lista, sem limite contraditório e com regra periódica', () => {
    const normalized = normalizeBenefitPayload({
      nome: '  Encontro Favorável  ',
      descricao: '  Exemplo  ',
      tag: '   benefícios menores   ',
      bonus: [{ texto: ' Reduz obstáculo ', tipo: 'Vantagem' }],
      custo: '3',
      tokens: [' narrativo ', 'Imediato', 'narrativo'],
      acumulavel: false,
      limiteAcumulacao: 99,
      limitePorPeriodo: 2,
      periodo: 'Sessão',
      status: 'Ativo',
      linkImagem: ' https://example.com/image.png ',
    });

    expect(normalized.nome).toBe('Encontro Favorável');
    expect(normalized.tag).toBe('benefícios menores');
    expect(normalized.bonus).toHaveLength(1);
    expect(normalized.bonus[0].texto).toBe('Reduz obstáculo');
    expect(normalized.custo).toBe(3);
    expect(normalized.tokens).toEqual(['narrativo', 'Imediato']);
    expect(normalized.limiteAcumulacao).toBe(0);
    expect(normalized.limitePorPeriodo).toBe(2);
    expect(normalized.periodo).toBe('Sessão');
  });

  it('mantém compatibilidade com tokens legados numéricos e remove duplicatas', () => {
    const normalized = normalizeBenefitPayload({
      nome: 'Teste',
      descricao: 'Teste',
      tag: 'Bênçãos',
      bonus: [{ texto: 'Bônus', tipo: 'Vantagem' }],
      custo: 1,
      tokens: 2,
      acumulavel: true,
      limiteAcumulacao: 3,
      limitePorPeriodo: 1,
      periodo: 'Dia',
      status: 'Inativo',
    });

    expect(normalized.tokens).toEqual(['2']);
    expect(normalized.limiteAcumulacao).toBe(3);
    expect(normalized.limitePorPeriodo).toBe(1);
    expect(normalized.periodo).toBe('Dia');
  });

  it('normaliza tag vazia e converte para vazio quando não há valor', () => {
    expect(normalizeBenefitTag(null)).toBe('');
    expect(normalizeBenefitTag(undefined)).toBe('');
  });
});
