import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Fichas from './Fichas';
import { useAuth } from 'context/AuthContext';
import useUniversos from 'hooks/useUniversos';
import {
  getCampanhas,
  getAllRegisteredUsers,
  getPersonagens,
  getUsersDisplayNamesByUid,
  removePersonagem,
  updatePersonagem,
} from 'service/storage';

vi.mock('context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('hooks/useUniversos', () => ({
  default: vi.fn(),
}));

vi.mock('service/storage', async () => {
  const actual = await vi.importActual('service/storage');

  return {
    ...actual,
    getCampanhas: vi.fn(),
    getAllRegisteredUsers: vi.fn(),
    getPersonagens: vi.fn(),
    getUsersDisplayNamesByUid: vi.fn(),
    updatePersonagem: vi.fn(),
    removePersonagem: vi.fn(),
  };
});

describe('Fichas', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
      currentUser: { uid: 'user-1' },
      isAdmin: false,
      allowedUniversos: ['universo-1'],
      canWrite: vi.fn(() => true),
    });

    useUniversos.mockReturnValue({
      universos: [{ id: 'universo-1', Nome: 'Mundo A' }],
      loadingUniversos: false,
    });

    getCampanhas.mockResolvedValue([]);
    getAllRegisteredUsers.mockResolvedValue([
      { uid: 'user-1', nome: 'Alice' },
      { uid: 'user-2', nome: 'Bruno' },
    ]);
    getUsersDisplayNamesByUid.mockResolvedValue({
      'user-1': 'Alice',
      'user-2': 'Bruno',
    });
  });

  it('bloqueia a edição quando o usuário não tem permissão no universo', async () => {
    useAuth.mockReturnValue({
      currentUser: { uid: 'user-3' },
      isAdmin: false,
      allowedUniversos: ['universo-2'],
      canWrite: vi.fn(() => false),
    });

    getPersonagens.mockResolvedValue([
      {
        id: 'ficha-1',
        nome: 'Ari',
        tipo: 'Personagem',
        universo: 'universo-1',
        uid: 'user-2',
      },
    ]);

    render(<Fichas />);

    await waitFor(() => {
      expect(screen.queryByText('Ari')).not.toBeInTheDocument();
    });

    expect(updatePersonagem).not.toHaveBeenCalled();
  });

  it('permite salvar uma ficha quando o usuário tem permissão do universo', async () => {
    const user = userEvent.setup();

    getPersonagens.mockResolvedValue([
      {
        id: 'ficha-2',
        nome: 'Lia',
        tipo: 'Personagem',
        universo: 'universo-1',
        uid: 'user-1',
      },
    ]);
    updatePersonagem.mockResolvedValue();

    render(<Fichas />);

    expect(await screen.findByText('Lia')).toBeInTheDocument();

    await user.dblClick(screen.getByText('Lia'));

    expect(await screen.findByRole('button', { name: /salvar/i })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(updatePersonagem).toHaveBeenCalledWith('ficha-2', expect.objectContaining({
        universo: 'universo-1',
      }));
    });
  });

  it('permite selecionar várias fichas com Shift e excluir em lote com confirmação', async () => {
    const user = userEvent.setup();
    getPersonagens.mockResolvedValue([
      {
        id: 'ficha-a',
        nome: 'Ari',
        tipo: 'Personagem',
        universo: 'universo-1',
        uid: 'user-1',
      },
      {
        id: 'ficha-b',
        nome: 'Lia',
        tipo: 'NPC',
        universo: 'universo-1',
        uid: 'user-1',
      },
      {
        id: 'ficha-c',
        nome: 'Beto',
        tipo: 'Criatura',
        universo: 'universo-1',
        uid: 'user-1',
      },
    ]);

    render(<Fichas />);

    expect(await screen.findByText('Ari')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /excluir selecionadas/i })).not.toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /excluir selecionadas/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Ari'), { shiftKey: true });
    fireEvent.click(screen.getByText('Lia'), { shiftKey: true });

    expect(await screen.findByRole('button', { name: /excluir selecionadas/i })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: /excluir selecionadas/i }));
    expect(await screen.findByText(/confirmar exclusão em lote/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /sim/i }));

    await waitFor(() => {
      expect(removePersonagem).toHaveBeenCalledTimes(2);
    });
  });
});
