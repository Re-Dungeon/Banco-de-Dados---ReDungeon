import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const getVeiasAstrais = vi.fn();
const removeVeiaAstral = vi.fn();
vi.mock('service/storage', () => ({
  getVeiasAstrais: (...args) => getVeiasAstrais(...args),
  removeVeiaAstral: (...args) => removeVeiaAstral(...args),
  getUniversos: vi.fn().mockResolvedValue([]),
  getDivindades: vi.fn().mockResolvedValue([]),
}));

const canCreate = vi.fn(() => true);
const canWrite = vi.fn(() => true);
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ canCreate, canWrite }),
}));

import VeiasAstrais from './VeiasAstrais';

const VEIAS_ASTRAIS_MOCK = [
  { id: 'v1', nome: 'Bênção Solar', divindade: 'Sol' },
  { id: 'v2', nome: 'Manto Lunar', divindade: 'Lua' },
];

const renderVeiasAstrais = () =>
  render(
    <MemoryRouter>
      <VeiasAstrais />
    </MemoryRouter>,
  );

describe('VeiasAstrais (padrão useEntityCRUD + useUniversos + EntityFilters + EntityViewDialog)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
    getVeiasAstrais.mockResolvedValue(VEIAS_ASTRAIS_MOCK);
  });

  it('lista as veias astrais retornadas por getVeiasAstrais depois do loading', async () => {
    renderVeiasAstrais();

    await waitFor(() =>
      expect(screen.getByText('Bênção Solar')).toBeInTheDocument(),
    );
    expect(screen.getByText('Manto Lunar')).toBeInTheDocument();
  });

  it('filtra por nome no client-side', async () => {
    const user = userEvent.setup();
    renderVeiasAstrais();

    await waitFor(() =>
      expect(screen.getByText('Bênção Solar')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Buscar por nome'), 'Lunar');

    expect(screen.getByText('Manto Lunar')).toBeInTheDocument();
    expect(screen.queryByText('Bênção Solar')).not.toBeInTheDocument();
  });

  it('remove uma veia astral e ela desaparece da lista sem novo fetch', async () => {
    removeVeiaAstral.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderVeiasAstrais();

    await waitFor(() =>
      expect(screen.getByText('Bênção Solar')).toBeInTheDocument(),
    );

    await user.click(screen.getByLabelText('Remover veia astral Bênção Solar'));

    await waitFor(() =>
      expect(screen.queryByText('Bênção Solar')).not.toBeInTheDocument(),
    );
    expect(removeVeiaAstral).toHaveBeenCalledWith('v1');
    expect(getVeiasAstrais).toHaveBeenCalledTimes(1);
  });

  it('abre o dialog de visualização com custo, descrição e botão Editar', async () => {
    getVeiasAstrais.mockResolvedValue([
      {
        id: 'v1',
        nome: 'Bênção Solar',
        custo: '2 PM',
        descricao: 'Concede luz e cura.',
      },
    ]);
    const user = userEvent.setup();
    renderVeiasAstrais();

    await waitFor(() =>
      expect(screen.getByText('Bênção Solar')).toBeInTheDocument(),
    );
    await user.click(
      screen.getByLabelText('Visualizar veia astral Bênção Solar'),
    );

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('2 PM')).toBeInTheDocument();
    expect(within(dialog).getByText('Concede luz e cura.')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Editar' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('não mostra botões de editar/remover quando canWrite retorna false', async () => {
    canWrite.mockReturnValue(false);
    renderVeiasAstrais();

    await waitFor(() =>
      expect(screen.getByText('Bênção Solar')).toBeInTheDocument(),
    );

    expect(
      screen.queryByLabelText('Remover veia astral Bênção Solar'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Editar veia astral Bênção Solar'),
    ).not.toBeInTheDocument();
  });
});
