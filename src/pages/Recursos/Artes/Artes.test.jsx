import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const getArtes = vi.fn();
const removeArte = vi.fn();
vi.mock('service/storage', () => ({
  getArtes: (...args) => getArtes(...args),
  removeArte: (...args) => removeArte(...args),
  getUniversos: vi.fn().mockResolvedValue([]),
}));

const canCreate = vi.fn(() => true);
const canWrite = vi.fn(() => true);
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ canCreate, canWrite }),
}));

import Artes from './Artes';

const ARTES_MOCK = [
  { id: 'a1', nome: 'Punho Flamejante', tipo: 'Marcial' },
  { id: 'a2', nome: 'Bola de Fogo', tipo: 'Mágica' },
];

const renderArtes = () =>
  render(
    <MemoryRouter>
      <Artes />
    </MemoryRouter>,
  );

describe('Artes (padrão useEntityCRUD + useUniversos + EntityFilters + EntityViewDialog)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
    getArtes.mockResolvedValue(ARTES_MOCK);
  });

  it('lista as artes retornadas por getArtes depois do loading', async () => {
    renderArtes();

    await waitFor(() =>
      expect(screen.getByText('Punho Flamejante')).toBeInTheDocument(),
    );
    expect(screen.getByText('Bola de Fogo')).toBeInTheDocument();
  });

  it('filtra por nome no client-side', async () => {
    const user = userEvent.setup();
    renderArtes();

    await waitFor(() =>
      expect(screen.getByText('Punho Flamejante')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Buscar por nome'), 'Fogo');

    expect(screen.getByText('Bola de Fogo')).toBeInTheDocument();
    expect(screen.queryByText('Punho Flamejante')).not.toBeInTheDocument();
  });

  it('remove uma arte e ela desaparece da lista sem novo fetch', async () => {
    removeArte.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderArtes();

    await waitFor(() =>
      expect(screen.getByText('Punho Flamejante')).toBeInTheDocument(),
    );

    await user.click(screen.getByLabelText('Remover arte Punho Flamejante'));

    await waitFor(() =>
      expect(screen.queryByText('Punho Flamejante')).not.toBeInTheDocument(),
    );
    expect(removeArte).toHaveBeenCalledWith('a1');
    expect(getArtes).toHaveBeenCalledTimes(1);
  });

  it('abre o dialog de visualização com meta-campos e botão Editar', async () => {
    getArtes.mockResolvedValue([
      {
        id: 'a1',
        nome: 'Punho Flamejante',
        descricao: 'Um soco em chamas.',
        recarga: '1 turno',
      },
    ]);
    const user = userEvent.setup();
    renderArtes();

    await waitFor(() =>
      expect(screen.getByText('Punho Flamejante')).toBeInTheDocument(),
    );
    await user.click(screen.getByLabelText('Visualizar arte Punho Flamejante'));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Recarga')).toBeInTheDocument();
    expect(within(dialog).getByText('1 turno')).toBeInTheDocument();
    expect(within(dialog).getByText('Um soco em chamas.')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Editar' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('não mostra botões de editar/remover quando canWrite retorna false', async () => {
    canWrite.mockReturnValue(false);
    renderArtes();

    await waitFor(() =>
      expect(screen.getByText('Punho Flamejante')).toBeInTheDocument(),
    );

    expect(
      screen.queryByLabelText('Remover arte Punho Flamejante'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Editar arte Punho Flamejante'),
    ).not.toBeInTheDocument();
  });
});
