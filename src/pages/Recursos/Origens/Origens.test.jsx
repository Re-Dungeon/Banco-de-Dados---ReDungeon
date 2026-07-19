import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const getOrigens = vi.fn();
const removeOrigem = vi.fn();
vi.mock('service/storage', () => ({
  getOrigens: (...args) => getOrigens(...args),
  removeOrigem: (...args) => removeOrigem(...args),
  getUniversos: vi.fn().mockResolvedValue([]),
}));

const canCreate = vi.fn(() => true);
const canWrite = vi.fn(() => true);
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ canCreate, canWrite }),
}));

import Origens from './Origens';

const ORIGENS_MOCK = [
  { id: 'o1', nome: 'Floresta Sombria', tipo: 'Região' },
  { id: 'o2', nome: 'Cidade Alta', tipo: 'Cidade' },
];

const renderOrigens = () =>
  render(
    <MemoryRouter>
      <Origens />
    </MemoryRouter>,
  );

describe('Origens (padrão useEntityCRUD + useUniversos + EntityFilters + EntityViewDialog)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
    getOrigens.mockResolvedValue(ORIGENS_MOCK);
  });

  it('lista as origens retornadas por getOrigens depois do loading', async () => {
    renderOrigens();

    await waitFor(() =>
      expect(screen.getByText('Floresta Sombria')).toBeInTheDocument(),
    );
    expect(screen.getByText('Cidade Alta')).toBeInTheDocument();
  });

  it('filtra por nome no client-side', async () => {
    const user = userEvent.setup();
    renderOrigens();

    await waitFor(() =>
      expect(screen.getByText('Floresta Sombria')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Buscar por nome'), 'Cidade');

    expect(screen.getByText('Cidade Alta')).toBeInTheDocument();
    expect(screen.queryByText('Floresta Sombria')).not.toBeInTheDocument();
  });

  it('remove uma origem e ela desaparece da lista sem novo fetch', async () => {
    removeOrigem.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderOrigens();

    await waitFor(() =>
      expect(screen.getByText('Floresta Sombria')).toBeInTheDocument(),
    );

    await user.click(screen.getByLabelText('Remover origem Floresta Sombria'));

    await waitFor(() =>
      expect(screen.queryByText('Floresta Sombria')).not.toBeInTheDocument(),
    );
    expect(removeOrigem).toHaveBeenCalledWith('o1');
    expect(getOrigens).toHaveBeenCalledTimes(1);
  });

  it('abre o dialog de visualização com tags e descrição', async () => {
    getOrigens.mockResolvedValue([
      {
        id: 'o1',
        nome: 'Floresta Sombria',
        descricao: 'Uma floresta densa e perigosa.',
        tags: 'perigoso, natureza',
      },
    ]);
    const user = userEvent.setup();
    renderOrigens();

    await waitFor(() =>
      expect(screen.getByText('Floresta Sombria')).toBeInTheDocument(),
    );
    await user.click(
      screen.getByLabelText('Visualizar origem Floresta Sombria'),
    );

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('perigoso')).toBeInTheDocument();
    expect(
      within(dialog).getByText('Uma floresta densa e perigosa.'),
    ).toBeInTheDocument();
  });

  it('não mostra botões de editar/remover quando canWrite retorna false', async () => {
    canWrite.mockReturnValue(false);
    renderOrigens();

    await waitFor(() =>
      expect(screen.getByText('Floresta Sombria')).toBeInTheDocument(),
    );

    expect(
      screen.queryByLabelText('Remover origem Floresta Sombria'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Editar origem Floresta Sombria'),
    ).not.toBeInTheDocument();
  });
});
