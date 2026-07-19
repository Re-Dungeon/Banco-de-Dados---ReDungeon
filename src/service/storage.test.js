import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./firebase', () => ({ db: {} }));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, name) => ({ __collection: name })),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn((_db, name, id) => ({ __doc: name, id })),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(() => '__serverTimestamp__'),
}));

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import {
  getRacas,
  addRaca,
  removeRaca,
  updateRaca,
  getUserPermissions,
} from './storage';

describe('storage.js — CRUD de Raças (padrão Firestore repetido em todas as entidades)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getRacas busca a coleção certa e mapeia docs para {id, ...data}', async () => {
    getDocs.mockResolvedValue({
      docs: [
        { id: 'abc', data: () => ({ nome: 'Elfo' }) },
        { id: 'def', data: () => ({ nome: 'Anão' }) },
      ],
    });

    const result = await getRacas();

    expect(collection).toHaveBeenCalledWith({}, 'racas');
    expect(result).toEqual([
      { id: 'abc', nome: 'Elfo' },
      { id: 'def', nome: 'Anão' },
    ]);
  });

  it('addRaca grava com createdAt e retorna o item com o id gerado', async () => {
    addDoc.mockResolvedValue({ id: 'novo-id' });

    const result = await addRaca({ nome: 'Halfling' });

    expect(addDoc).toHaveBeenCalledWith(
      { __collection: 'racas' },
      { nome: 'Halfling', createdAt: '__serverTimestamp__' },
    );
    expect(result).toEqual({ id: 'novo-id', nome: 'Halfling' });
  });

  it('removeRaca deleta o doc pelo id na coleção certa', async () => {
    await removeRaca('id-123');

    expect(doc).toHaveBeenCalledWith({}, 'racas', 'id-123');
    expect(deleteDoc).toHaveBeenCalledWith({ __doc: 'racas', id: 'id-123' });
  });

  it('updateRaca atualiza com updatedAt', async () => {
    await updateRaca('id-123', { nome: 'Meio-Elfo' });

    expect(updateDoc).toHaveBeenCalledWith(
      { __doc: 'racas', id: 'id-123' },
      { nome: 'Meio-Elfo', updatedAt: '__serverTimestamp__' },
    );
  });

  it('propaga e loga erros do Firestore em vez de engoli-los silenciosamente', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const firestoreError = new Error('permission-denied');
    getDocs.mockRejectedValue(firestoreError);

    await expect(getRacas()).rejects.toThrow('permission-denied');
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('racas'),
      firestoreError,
    );

    consoleError.mockRestore();
  });
});

describe('storage.js — getUserPermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna isAdmin/universos padrão quando o documento não existe', async () => {
    getDoc.mockResolvedValue({ exists: () => false });

    const result = await getUserPermissions('uid-sem-doc');

    expect(result).toEqual({ isAdmin: false, universos: [] });
  });

  it('retorna isAdmin/universos do documento quando ele existe', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ isAdmin: true, universos: ['universo-1'] }),
    });

    const result = await getUserPermissions('uid-admin');

    expect(result).toEqual({ isAdmin: true, universos: ['universo-1'] });
  });

  it('normaliza universos ausente/inválido para array vazio', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ isAdmin: false }),
    });

    const result = await getUserPermissions('uid-sem-universos');

    expect(result).toEqual({ isAdmin: false, universos: [] });
  });
});
