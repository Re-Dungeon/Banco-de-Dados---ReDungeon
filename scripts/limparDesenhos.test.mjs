import { describe, expect, it, vi } from 'vitest';

import { limparDesenhosExpirados } from './limparDesenhos.mjs';

// Firestore falso, só com o que o script usa (listDocuments, where/orderBy/limit/startAfter/get, batch).
const criarDb = estrutura => {
  const apagados = [];
  const consultaDesenhos = desenhos => {
    const estado = { corte: null, limite: Infinity, depoisDe: null };
    const consulta = {
      where: (campo, op, valor) => {
        expect([campo, op]).toEqual(['createdAt', '<']);
        estado.corte = valor;
        return consulta;
      },
      orderBy: () => consulta,
      limit: n => {
        estado.limite = n;
        return consulta;
      },
      startAfter: doc => {
        estado.depoisDe = doc;
        return consulta;
      },
      get: async () => {
        let lista = desenhos
          .filter(d => d.createdAt < estado.corte)
          .sort((a, b) => a.createdAt - b.createdAt);
        if (estado.depoisDe) lista = lista.filter(d => d.createdAt > estado.depoisDe.createdAt);
        const docs = lista.slice(0, estado.limite).map(d => ({ ...d, ref: { id: d.id } }));
        return { docs, size: docs.length, empty: docs.length === 0 };
      },
    };
    return consulta;
  };
  const db = {
    collection: () => ({
      listDocuments: async () =>
        Object.entries(estrutura).map(([campanhaId, cenas]) => ({
          id: campanhaId,
          collection: () => ({
            listDocuments: async () =>
              Object.entries(cenas).map(([cenaId, desenhos]) => ({
                id: cenaId,
                collection: () => consultaDesenhos(desenhos),
              })),
          }),
        })),
    }),
    batch: () => {
      const pendentes = [];
      return {
        delete: ref => pendentes.push(ref.id),
        commit: vi.fn(async () => apagados.push(...pendentes)),
      };
    },
  };
  return { db, apagados };
};

const HORA = 3_600_000;
const AGORA = new Date('2026-11-16T12:00:00Z').getTime();
const em = horasAtras => new Date(AGORA - horasAtras * HORA);

describe('limparDesenhosExpirados', () => {
  it('sem --apagar só conta os vencidos', async () => {
    const { db, apagados } = criarDb({
      c1: { cena1: [{ id: 'velho', createdAt: em(3) }, { id: 'novo', createdAt: em(1) }] },
    });
    const r = await limparDesenhosExpirados(db, { agora: AGORA });
    expect(r.total).toBe(1);
    expect(apagados).toEqual([]);
  });

  it('com apagar remove só os mais antigos que a validade, em todas as campanhas e cenas', async () => {
    const { db, apagados } = criarDb({
      c1: {
        cena1: [{ id: 'a', createdAt: em(5) }, { id: 'b', createdAt: em(0.5) }],
        cena2: [{ id: 'c', createdAt: em(2.1) }],
      },
      c2: { cena3: [] },
    });
    const log = vi.fn();
    const r = await limparDesenhosExpirados(db, { agora: AGORA, apagar: true, log });
    expect(apagados.sort()).toEqual(['a', 'c']);
    expect(r).toMatchObject({ total: 2, cenasComDesenhos: 2, campanhas: 2 });
    expect(log).toHaveBeenCalledTimes(2);
  });

  it('pagina quando há mais desenhos que uma página', async () => {
    const desenhos = Array.from({ length: 950 }, (_, i) => ({ id: `d${i}`, createdAt: em(3 + i / 1000) }));
    const { db, apagados } = criarDb({ c1: { cena1: desenhos } });
    const r = await limparDesenhosExpirados(db, { agora: AGORA, apagar: true });
    expect(r.total).toBe(950);
    expect(new Set(apagados).size).toBe(950);
  });

  it('respeita uma validade maior', async () => {
    const { db } = criarDb({ c1: { cena1: [{ id: 'a', createdAt: em(3) }] } });
    const r = await limparDesenhosExpirados(db, { agora: AGORA, validadeMs: 4 * HORA });
    expect(r.total).toBe(0);
  });
});
