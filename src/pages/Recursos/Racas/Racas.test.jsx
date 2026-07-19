import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const getRacas = vi.fn();
const removeRaca = vi.fn();
vi.mock('service/storage', () => ({
  getRacas: (...args) => getRacas(...args),
  removeRaca: (...args) => removeRaca(...args),
  getUniversos: vi.fn().mockResolvedValue([]),
}));

const canCreate = vi.fn(() => true);
const canWrite = vi.fn(() => true);
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ canCreate, canWrite }),
}));

import Racas from './Racas';

const RACAS_MOCK = [
  { id: 'r1', nome: 'Elfo', raridade: 'Raro', universo: 'u1' },
  { id: 'r2', nome: 'Anão', raridade: 'Comum', universo: 'u1' },
];

const renderRacas = () =>
  render(
    <MemoryRouter>
      <Racas />
    </MemoryRouter>,
  );

describe('Racas (piloto do padrão useEntityCRUD + useUniversos, item 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
    getRacas.mockResolvedValue(RACAS_MOCK);
  });

  it('mostra o indicador de carregamento e depois lista as raças de getRacas', async () => {
    renderRacas();

    expect(
      document.querySelector('.MuiCircularProgress-root'),
    ).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Elfo')).toBeInTheDocument());
    expect(screen.getByText('Anão')).toBeInTheDocument();
  });

  it('filtra por nome no client-side', async () => {
    const user = userEvent.setup();
    renderRacas();

    await waitFor(() => expect(screen.getByText('Elfo')).toBeInTheDocument());

    await user.type(screen.getByLabelText('Buscar por nome'), 'Elfo');

    expect(screen.getByText('Elfo')).toBeInTheDocument();
    expect(screen.queryByText('Anão')).not.toBeInTheDocument();
  });

  it('remove uma raça e ela desaparece da lista sem novo fetch', async () => {
    removeRaca.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderRacas();

    await waitFor(() => expect(screen.getByText('Elfo')).toBeInTheDocument());

    await user.click(screen.getByLabelText('Remover raça Elfo'));

    await waitFor(() =>
      expect(screen.queryByText('Elfo')).not.toBeInTheDocument(),
    );
    expect(removeRaca).toHaveBeenCalledWith('r1');
    expect(getRacas).toHaveBeenCalledTimes(1);
  });

  it('abre o dialog de visualização com a descrição da raça', async () => {
    getRacas.mockResolvedValue([
      { id: 'r1', nome: 'Elfo', descricao: 'Ágil e sábio.' },
    ]);
    const user = userEvent.setup();
    renderRacas();

    await waitFor(() => expect(screen.getByText('Elfo')).toBeInTheDocument());
    await user.click(screen.getByLabelText('Visualizar raça Elfo'));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Ágil e sábio.')).toBeInTheDocument();
  });

  it('não mostra botões de editar/remover quando canWrite retorna false', async () => {
    canWrite.mockReturnValue(false);
    renderRacas();

    await waitFor(() => expect(screen.getByText('Elfo')).toBeInTheDocument());

    expect(
      screen.queryByLabelText('Remover raça Elfo'),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Editar raça Elfo')).not.toBeInTheDocument();
  });
});
