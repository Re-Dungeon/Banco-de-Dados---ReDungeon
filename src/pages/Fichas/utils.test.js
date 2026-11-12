import { describe, expect, it } from 'vitest';
import {
  canAccessFichaForUniverse,
  filterFichas,
  getCampanhaLabel,
  normalizeFichaTipo,
  getFichaOwnerName,
  TIPOS_FICHA,
} from './utils';

describe('normalizeFichaTipo', () => {
  it('normaliza tipos do sistema e inclui o companheiro como dado legado', () => {
    expect(normalizeFichaTipo('Personagem Jogável')).toBe('Personagem Jogável');
    expect(normalizeFichaTipo('npc')).toBe('NPC');
    expect(normalizeFichaTipo('criatura')).toBe('Criatura');
    expect(normalizeFichaTipo('companheiro')).toBe('Companheiro');
    expect(normalizeFichaTipo('companheiros')).toBe('Companheiro');
    expect(normalizeFichaTipo('desconhecido')).toBe('Desconhecido');
  });

  it('remove o companheiro das opções públicas de tipo', () => {
    expect(TIPOS_FICHA).not.toContain('Companheiro');
  });
});

describe('filterFichas', () => {
  const fichas = [
    {
      id: 'f1',
      nome: 'Byakko',
      tipo: 'NPC',
      universo: 'u1',
      campanha: 'c1',
      uid: 'user-1',
      linkImagem: 'https://example.com/byakko.png',
    },
    {
      id: 'f2',
      nome: 'Luna',
      tipo: 'Personagem Jogável',
      universo: 'u2',
      campanha: 'c2',
      uid: 'user-2',
      linkImagem: '',
    },
    {
      id: 'f3',
      nome: 'Mochi',
      tipo: 'Companheiro',
      universo: 'u1',
      campanha: '',
      uid: '',
      linkImagem: 'https://example.com/mochi.png',
    },
  ];

  it('aplica pesquisa, universo e filtro de tipo em conjunto', () => {
    const filtered = filterFichas(fichas, {
      busca: 'bya',
      universo: 'u1',
      tipo: 'NPC',
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('f1');
  });

  it('ignora maiúsculas/minúsculas e aceita campos vazios', () => {
    const filtered = filterFichas(fichas, {
      busca: 'luna',
      universo: 'todos',
      tipo: 'todos',
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].nome).toBe('Luna');
  });

  it('filtra fichas por companheiro mesmo quando o valor vem em variação de escrita', () => {
    const filtered = filterFichas(fichas, {
      busca: '',
      universo: 'todos',
      tipo: 'Companheiro',
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('f3');
  });

  it('remove fichas de teste/demonstração da visualização', () => {
    const filtered = filterFichas(
      [
        ...fichas,
        {
          id: 'test-card',
          nome: 'Ficha de teste',
          tipo: 'NPC',
          universo: 'u1',
          campanha: 'c1',
          uid: 'user-1',
          linkImagem: 'https://example.com/test.png',
        },
      ],
      {
        busca: '',
        universo: 'todos',
        tipo: 'todos',
      },
    );

    expect(filtered.some(ficha => ficha.id === 'test-card')).toBe(false);
  });
});

describe('campanha e dono', () => {
  it('resolve rótulos para campanha e personagem sem dono', () => {
    expect(
      getCampanhaLabel(
        { campanha: 'camp-1', campanhas: ['camp-1'] },
        { 'camp-1': 'Abyss' },
      ),
    ).toBe('Abyss');
    expect(getCampanhaLabel({}, {})).toBe('Sem campanha');
    expect(getFichaOwnerName({ uid: '' })).toBe('Sem proprietário');
    expect(
      getFichaOwnerName({ uid: 'owner-42' }, { 'owner-42': 'Byakko' }),
    ).toBe('Byakko');
  });
});

describe('permissões por universo', () => {
  it('admin vê todas as fichas e usuários sem universo são bloqueados', () => {
    expect(
      canAccessFichaForUniverse(
        { universo: 'u-1' },
        { isAdmin: true, allowedUniversos: [] },
      ),
    ).toBe(true);
    expect(
      canAccessFichaForUniverse(
        { universo: '' },
        { isAdmin: false, allowedUniversos: ['u-1'] },
      ),
    ).toBe(false);
  });

  it('usuário comum só acessa universos autorizados', () => {
    expect(
      canAccessFichaForUniverse(
        { universo: 'u-1' },
        { isAdmin: false, allowedUniversos: ['u-1'] },
      ),
    ).toBe(true);
    expect(
      canAccessFichaForUniverse(
        { universo: 'u-2' },
        { isAdmin: false, allowedUniversos: ['u-1'] },
      ),
    ).toBe(false);
  });
});
