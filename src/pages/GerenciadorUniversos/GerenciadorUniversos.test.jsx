import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mocks = vi.hoisted(() => {
  const transactionUpdate = vi.fn();
  const runTransaction = vi.fn(async (_, callback) => {
    const transaction = {
      get: async ref => ({
        exists: () => true,
        data: () => {
          const currentState = {
            a1: { universos: ['u2'] },
            a2: { universos: ['u2'] },
            c1: { universos: ['u2'] },
          };

          return currentState[ref.id] || { universos: [] };
        },
      }),
      update: transactionUpdate,
    };

    return callback(transaction);
  });

  return { transactionUpdate, runTransaction };
});

const getUniversos = vi.fn();
const getAptidoes = vi.fn();
const updateAptidao = vi.fn();
const getCondicoes = vi.fn();
const updateCondicao = vi.fn();

vi.mock('service/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: (_, collectionName, id) => ({ collectionName, id }),
  runTransaction: mocks.runTransaction,
  serverTimestamp: () => 'server-timestamp',
}));

vi.mock('service/storage', () => ({
  getUniversos: (...args) => getUniversos(...args),
  getAptidoes: (...args) => getAptidoes(...args),
  updateAptidao: (...args) => updateAptidao(...args),
  getCondicoes: (...args) => getCondicoes(...args),
  updateCondicao: (...args) => updateCondicao(...args),
}));

vi.mock('context/AuthContext', () => ({
  useAuth: () => ({
    isAdmin: false,
    allowedUniversos: ['u1'],
    canCreate: () => true,
    canWrite: universoId =>
      Array.isArray(universoId)
        ? universoId.some(id => id === 'u1')
        : universoId === 'u1',
  }),
}));

import GerenciadorUniversos from './GerenciadorUniversos';

describe('GerenciadorUniversos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transactionUpdate.mockClear();
    mocks.runTransaction.mockClear();
    getUniversos.mockResolvedValue([
      { id: 'u1', Nome: 'Mundo A' },
      { id: 'u2', Nome: 'Mundo B' },
    ]);
  });

  it('carrega aptidões vinculadas e não vinculadas ao universo selecionado', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Aptidão A', universos: ['u1'] },
      { id: 'a2', nome: 'Aptidão B', universos: ['u2'] },
    ]);
    getCondicoes.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Gerenciador de Universos')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Aptidão A')).toBeInTheDocument());
    expect(screen.getByText('Aptidão B')).toBeInTheDocument();
  });

  it('vincula múltiplos registros ao universo selecionado sem excluir outros vínculos', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Aptidão A', universos: ['u1'] },
      { id: 'a2', nome: 'Aptidão B', universos: ['u2'] },
    ]);
    getCondicoes.mockResolvedValue([
      { id: 'c1', nome: 'Condição A', universos: ['u2'] },
    ]);
    updateAptidao.mockResolvedValue(undefined);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Aptidão B')).toBeInTheDocument());

    const botaoSelecionarAptidaoB = screen.getByRole('button', {
      name: 'Selecionar aptidão Aptidão B',
    });
    await user.click(botaoSelecionarAptidaoB);

    const vincularButton = screen.getByRole('button', { name: 'Vincular selecionados' });
    await waitFor(() => expect(vincularButton).not.toBeDisabled());
    await user.click(vincularButton);

    await waitFor(() => expect(mocks.runTransaction).toHaveBeenCalledTimes(1));
    expect(mocks.transactionUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        universos: ['u2', 'u1'],
      }),
    );
    expect(mocks.transactionUpdate.mock.calls[0][1]).not.toHaveProperty('universo');
  });

  it('preserva a compatibilidade de leitura para documentos legados com apenas universo', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Aptidão Legada', universo: 'u1' },
    ]);
    getCondicoes.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Aptidão Legada')).toBeInTheDocument());
    expect(screen.getByText('1 universo')).toBeInTheDocument();
    expect(screen.getByLabelText('Universos vinculados: 1 universo')).toBeInTheDocument();
  });

  it('atualiza somente universos em documentos legados e preserva outros vínculos', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Aptidão Legada', universo: 'u1', universos: ['u2'] },
    ]);
    getCondicoes.mockResolvedValue([]);
    updateAptidao.mockResolvedValue(undefined);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Aptidão Legada')).toBeInTheDocument());

    const botaoSelecionar = screen.getByRole('button', {
      name: 'Selecionar aptidão Aptidão Legada',
    });
    await user.click(botaoSelecionar);

    const vincularButton = screen.getByRole('button', { name: 'Vincular selecionados' });
    await user.click(vincularButton);

    await waitFor(() => expect(mocks.runTransaction).toHaveBeenCalledTimes(1));
    expect(mocks.transactionUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        universos: ['u2', 'u1'],
      }),
    );
    expect(mocks.transactionUpdate.mock.calls[0][1]).not.toHaveProperty('universo');
  });

  it('reexecuta somente os registros que falharam no lote', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Aptidão A', universos: ['u2'] },
      { id: 'a2', nome: 'Aptidão B', universos: ['u2'] },
    ]);
    getCondicoes.mockResolvedValue([]);

    mocks.runTransaction
      .mockImplementationOnce(async (_, callback) => {
        const transaction = {
          get: async () => ({
            exists: () => true,
            data: () => ({ universos: ['u2'] }),
          }),
          update: vi.fn(),
        };

        return callback(transaction);
      })
      .mockImplementationOnce(async () => {
        throw new Error('falhou no segundo registro');
      });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Aptidão B')).toBeInTheDocument());

    const botaoA1 = screen.getByRole('button', { name: 'Selecionar aptidão Aptidão A' });
    const botaoA2 = screen.getByRole('button', { name: 'Selecionar aptidão Aptidão B' });

    await user.click(botaoA1);
    await user.click(botaoA2);

    const vincularButton = screen.getByRole('button', { name: 'Vincular selecionados' });
    await user.click(vincularButton);

    await waitFor(() =>
      expect(screen.getByText(/falhou no segundo registro/i)).toBeInTheDocument(),
    );

    const failedButton = screen.getByRole('button', {
      name: 'Selecionar aptidão Aptidão B',
    });
    expect(failedButton).toHaveTextContent('Selecionado');
    expect(screen.getByText(/1 registro falhou/i)).toBeInTheDocument();
  });

  it('mostra um resumo compacto de universos com tooltip acessível nos cards do gerenciador', async () => {
    getAptidoes.mockResolvedValue([
      { id: 'a1', nome: 'Aptidão A', universos: ['u1', 'u2'] },
    ]);
    getCondicoes.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <GerenciadorUniversos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Aptidão A')).toBeInTheDocument());
    expect(screen.getByText('2 universos')).toBeInTheDocument();
    expect(screen.getByLabelText('Universos vinculados: 2 universos')).toBeInTheDocument();
  });
});
