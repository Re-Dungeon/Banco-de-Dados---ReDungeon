import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const getDivindades = vi.fn();
const removeDivindade = vi.fn();
vi.mock('service/storage', () => ({
  getDivindades: (...args) => getDivindades(...args),
  removeDivindade: (...args) => removeDivindade(...args),
  getUniversos: vi.fn().mockResolvedValue([]),
}));

const canCreate = vi.fn(() => true);
const canWrite = vi.fn(() => true);
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ canCreate, canWrite }),
}));

import Divindades from './Divindades';

const DIVINDADES_MOCK = [
  { id: 'd1', nome: 'Anúbis' },
  { id: 'd2', nome: 'Hestia' },
];

const renderDivindades = () =>
  render(
    <MemoryRouter>
      <Divindades />
    </MemoryRouter>,
  );

describe('Divindades (padrão useEntityCRUD + useUniversos + EntityFilters + EntityViewDialog)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
    getDivindades.mockResolvedValue(DIVINDADES_MOCK);
  });

  it('lista as divindades retornadas por getDivindades depois do loading', async () => {
    renderDivindades();

    await waitFor(() => expect(screen.getByText('Anúbis')).toBeInTheDocument());
    expect(screen.getByText('Hestia')).toBeInTheDocument();
  });

  it('filtra por nome no client-side', async () => {
    const user = userEvent.setup();
    renderDivindades();

    await waitFor(() => expect(screen.getByText('Anúbis')).toBeInTheDocument());

    await user.type(screen.getByLabelText('Buscar por nome'), 'Hestia');

    expect(screen.getByText('Hestia')).toBeInTheDocument();
    expect(screen.queryByText('Anúbis')).not.toBeInTheDocument();
  });

  it('remove uma divindade e ela desaparece da lista sem novo fetch', async () => {
    removeDivindade.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderDivindades();

    await waitFor(() => expect(screen.getByText('Anúbis')).toBeInTheDocument());

    await user.click(screen.getByLabelText('Remover divindade Anúbis'));

    await waitFor(() =>
      expect(screen.queryByText('Anúbis')).not.toBeInTheDocument(),
    );
    expect(removeDivindade).toHaveBeenCalledWith('d1');
    expect(getDivindades).toHaveBeenCalledTimes(1);
  });

  it('abre o dialog de visualização com a descrição', async () => {
    getDivindades.mockResolvedValue([
      {
        id: 'd1',
        nome: 'Anúbis',
        descricao: 'Divindade dos mortos.',
      },
    ]);
    const user = userEvent.setup();
    renderDivindades();

    await waitFor(() => expect(screen.getByText('Anúbis')).toBeInTheDocument());
    await user.click(screen.getByLabelText('Visualizar divindade Anúbis'));

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByText('Divindade dos mortos.'),
    ).toBeInTheDocument();
  });

  it('não mostra botões de editar/remover quando canWrite retorna false', async () => {
    canWrite.mockReturnValue(false);
    renderDivindades();

    await waitFor(() => expect(screen.getByText('Anúbis')).toBeInTheDocument());

    expect(
      screen.queryByLabelText('Remover divindade Anúbis'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Editar divindade Anúbis'),
    ).not.toBeInTheDocument();
  });
});
