import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const getRegras = vi.fn();
const removeRegra = vi.fn();
vi.mock('service/storage', () => ({
  getRegras: (...args) => getRegras(...args),
  removeRegra: (...args) => removeRegra(...args),
  getUniversos: vi.fn().mockResolvedValue([]),
}));

const canCreate = vi.fn(() => true);
const canWrite = vi.fn(() => true);
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ canCreate, canWrite }),
}));

import Regras from './Regras';

const REGRAS_MOCK = [
  { id: 'r1', nome: 'Iniciativa', categoria: 'Combate' },
  { id: 'r2', nome: 'Descanso', categoria: 'Exploração' },
];

const renderRegras = () =>
  render(
    <MemoryRouter>
      <Regras />
    </MemoryRouter>,
  );

describe('Regras (padrão useEntityCRUD + useUniversos + EntityFilters + EntityViewDialog)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
    getRegras.mockResolvedValue(REGRAS_MOCK);
  });

  it('lista as regras retornadas por getRegras depois do loading', async () => {
    renderRegras();

    await waitFor(() =>
      expect(screen.getByText('Iniciativa')).toBeInTheDocument(),
    );
    expect(screen.getByText('Descanso')).toBeInTheDocument();
  });

  it('filtra por nome no client-side', async () => {
    const user = userEvent.setup();
    renderRegras();

    await waitFor(() =>
      expect(screen.getByText('Iniciativa')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Buscar por nome'), 'Descanso');

    expect(screen.getByText('Descanso')).toBeInTheDocument();
    expect(screen.queryByText('Iniciativa')).not.toBeInTheDocument();
  });

  it('remove uma regra e ela desaparece da lista sem novo fetch', async () => {
    removeRegra.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderRegras();

    await waitFor(() =>
      expect(screen.getByText('Iniciativa')).toBeInTheDocument(),
    );

    await user.click(screen.getByLabelText('Remover regra Iniciativa'));

    await waitFor(() =>
      expect(screen.queryByText('Iniciativa')).not.toBeInTheDocument(),
    );
    expect(removeRegra).toHaveBeenCalledWith('r1');
    expect(getRegras).toHaveBeenCalledTimes(1);
  });

  it('abre o dialog de visualização com funcionamento e botão Editar', async () => {
    getRegras.mockResolvedValue([
      {
        id: 'r1',
        nome: 'Iniciativa',
        descricaoCurta: 'Define a ordem de ação em combate.',
        comoFunciona: 'Cada personagem rola um dado.',
      },
    ]);
    const user = userEvent.setup();
    renderRegras();

    await waitFor(() =>
      expect(screen.getByText('Iniciativa')).toBeInTheDocument(),
    );
    await user.click(screen.getByLabelText('Visualizar regra Iniciativa'));

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByText('Define a ordem de ação em combate.'),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('Funcionamento')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Editar' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('não mostra botões de editar/remover quando canWrite retorna false', async () => {
    canWrite.mockReturnValue(false);
    renderRegras();

    await waitFor(() =>
      expect(screen.getByText('Iniciativa')).toBeInTheDocument(),
    );

    expect(
      screen.queryByLabelText('Remover regra Iniciativa'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Editar regra Iniciativa'),
    ).not.toBeInTheDocument();
  });
});
