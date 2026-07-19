import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const getItens = vi.fn();
const removeIten = vi.fn();
vi.mock('service/storage', () => ({
  getItens: (...args) => getItens(...args),
  removeIten: (...args) => removeIten(...args),
  getUniversos: vi.fn().mockResolvedValue([]),
}));

const canCreate = vi.fn(() => true);
const canWrite = vi.fn(() => true);
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ canCreate, canWrite }),
}));

import Itens from './Itens';

const ITENS_MOCK = [
  { id: 'i1', nome: 'Espada Longa', qualidade: 'Raro', tipo: 'Arma' },
  { id: 'i2', nome: 'Poção de Cura', qualidade: 'Comum', tipo: 'Consumível' },
];

const renderItens = () =>
  render(
    <MemoryRouter>
      <Itens />
    </MemoryRouter>,
  );

describe('Itens (padrão useEntityCRUD + useUniversos + EntityFilters + EntityViewDialog)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
    getItens.mockResolvedValue(ITENS_MOCK);
  });

  it('lista os itens retornados por getItens depois do loading', async () => {
    renderItens();

    await waitFor(() =>
      expect(screen.getByText('Espada Longa')).toBeInTheDocument(),
    );
    expect(screen.getByText('Poção de Cura')).toBeInTheDocument();
  });

  it('filtra por nome no client-side', async () => {
    const user = userEvent.setup();
    renderItens();

    await waitFor(() =>
      expect(screen.getByText('Espada Longa')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Buscar por nome'), 'Espada');

    expect(screen.getByText('Espada Longa')).toBeInTheDocument();
    expect(screen.queryByText('Poção de Cura')).not.toBeInTheDocument();
  });

  it('remove um item e ele desaparece da lista sem novo fetch', async () => {
    removeIten.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderItens();

    await waitFor(() =>
      expect(screen.getByText('Espada Longa')).toBeInTheDocument(),
    );

    await user.click(screen.getByLabelText('Remover item Espada Longa'));

    await waitFor(() =>
      expect(screen.queryByText('Espada Longa')).not.toBeInTheDocument(),
    );
    expect(removeIten).toHaveBeenCalledWith('i1');
    expect(getItens).toHaveBeenCalledTimes(1);
  });

  it('abre o dialog de visualização com atributos e descrição', async () => {
    getItens.mockResolvedValue([
      {
        id: 'i1',
        nome: 'Espada Longa',
        descricao: 'Uma lâmina afiada.',
        nivelAtual: '3',
      },
    ]);
    const user = userEvent.setup();
    renderItens();

    await waitFor(() =>
      expect(screen.getByText('Espada Longa')).toBeInTheDocument(),
    );
    await user.click(screen.getByLabelText('Visualizar item Espada Longa'));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Atributos')).toBeInTheDocument();
    expect(within(dialog).getByText('Uma lâmina afiada.')).toBeInTheDocument();
  });

  it('não mostra botões de editar/remover quando canWrite retorna false', async () => {
    canWrite.mockReturnValue(false);
    renderItens();

    await waitFor(() =>
      expect(screen.getByText('Espada Longa')).toBeInTheDocument(),
    );

    expect(
      screen.queryByLabelText('Remover item Espada Longa'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Editar item Espada Longa'),
    ).not.toBeInTheDocument();
  });
});
