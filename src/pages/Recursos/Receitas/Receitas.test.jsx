import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const getReceitas = vi.fn();
const removeReceita = vi.fn();
vi.mock('service/storage', () => ({
  getReceitas: (...args) => getReceitas(...args),
  removeReceita: (...args) => removeReceita(...args),
  getUniversos: vi.fn().mockResolvedValue([]),
}));

const canCreate = vi.fn(() => true);
const canWrite = vi.fn(() => true);
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ canCreate, canWrite }),
}));

import Receitas from './Receitas';

const RECEITAS_MOCK = [
  { id: 'r1', nome: 'Poção de Vida', categoria: 'Alquimia' },
  { id: 'r2', nome: 'Espada Flamejante', categoria: 'Forja' },
];

const renderReceitas = () =>
  render(
    <MemoryRouter>
      <Receitas />
    </MemoryRouter>,
  );

describe('Receitas (padrão useEntityCRUD + useUniversos + EntityFilters + EntityViewDialog)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
    getReceitas.mockResolvedValue(RECEITAS_MOCK);
  });

  it('lista as receitas retornadas por getReceitas depois do loading', async () => {
    renderReceitas();

    await waitFor(() =>
      expect(screen.getByText('Poção de Vida')).toBeInTheDocument(),
    );
    expect(screen.getByText('Espada Flamejante')).toBeInTheDocument();
  });

  it('filtra por nome no client-side', async () => {
    const user = userEvent.setup();
    renderReceitas();

    await waitFor(() =>
      expect(screen.getByText('Poção de Vida')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Buscar por nome'), 'Espada');

    expect(screen.getByText('Espada Flamejante')).toBeInTheDocument();
    expect(screen.queryByText('Poção de Vida')).not.toBeInTheDocument();
  });

  it('remove uma receita e ela desaparece da lista sem novo fetch', async () => {
    removeReceita.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderReceitas();

    await waitFor(() =>
      expect(screen.getByText('Poção de Vida')).toBeInTheDocument(),
    );

    await user.click(screen.getByLabelText('Remover receita Poção de Vida'));

    await waitFor(() =>
      expect(screen.queryByText('Poção de Vida')).not.toBeInTheDocument(),
    );
    expect(removeReceita).toHaveBeenCalledWith('r1');
    expect(getReceitas).toHaveBeenCalledTimes(1);
  });

  it('abre o dialog de visualização com botão Editar que navega e fecha o dialog', async () => {
    getReceitas.mockResolvedValue([
      {
        id: 'r1',
        nome: 'Poção de Vida',
        descricao: 'Restaura pontos de vida.',
        materiais: [{ id: 'mat1', nome: 'Erva Curativa' }],
      },
    ]);
    const user = userEvent.setup();
    renderReceitas();

    await waitFor(() =>
      expect(screen.getByText('Poção de Vida')).toBeInTheDocument(),
    );
    await user.click(screen.getByLabelText('Visualizar receita Poção de Vida'));

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByText('Restaura pontos de vida.'),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('Erva Curativa')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Editar' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('não mostra botão Editar no dialog quando canWrite retorna false', async () => {
    canWrite.mockReturnValue(false);
    const user = userEvent.setup();
    renderReceitas();

    await waitFor(() =>
      expect(screen.getByText('Poção de Vida')).toBeInTheDocument(),
    );
    await user.click(screen.getByLabelText('Visualizar receita Poção de Vida'));

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).queryByRole('button', { name: 'Editar' }),
    ).not.toBeInTheDocument();
  });
});
