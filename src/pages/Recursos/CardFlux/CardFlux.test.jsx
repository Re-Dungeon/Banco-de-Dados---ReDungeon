import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const getCardFlux = vi.fn();
const removeCardFlux = vi.fn();
vi.mock('service/storage', () => ({
  getCardFlux: (...args) => getCardFlux(...args),
  removeCardFlux: (...args) => removeCardFlux(...args),
  getUniversos: vi.fn().mockResolvedValue([]),
}));

const canCreate = vi.fn(() => true);
const canWrite = vi.fn(() => true);
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ canCreate, canWrite }),
}));

import CardFlux from './CardFlux';

const CARDFLUX_MOCK = [
  { id: 'cf1', nome: 'Emboscada Noturna', tipo: '🗡️ Emboscada' },
  { id: 'cf2', nome: 'Ruínas Antigas', tipo: '💎 Descoberta' },
];

const renderCardFlux = () =>
  render(
    <MemoryRouter>
      <CardFlux />
    </MemoryRouter>,
  );

describe('CardFlux (padrão useEntityCRUD + useUniversos + EntityFilters + EntityViewDialog)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
    getCardFlux.mockResolvedValue(CARDFLUX_MOCK);
  });

  it('lista os CardFlux retornados por getCardFlux depois do loading', async () => {
    renderCardFlux();

    await waitFor(() =>
      expect(screen.getByText('Emboscada Noturna')).toBeInTheDocument(),
    );
    expect(screen.getByText('Ruínas Antigas')).toBeInTheDocument();
  });

  it('filtra por nome no client-side', async () => {
    const user = userEvent.setup();
    renderCardFlux();

    await waitFor(() =>
      expect(screen.getByText('Emboscada Noturna')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Buscar por nome'), 'Ruínas');

    expect(screen.getByText('Ruínas Antigas')).toBeInTheDocument();
    expect(screen.queryByText('Emboscada Noturna')).not.toBeInTheDocument();
  });

  it('remove um CardFlux e ele desaparece da lista sem novo fetch', async () => {
    removeCardFlux.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderCardFlux();

    await waitFor(() =>
      expect(screen.getByText('Emboscada Noturna')).toBeInTheDocument(),
    );

    await user.click(
      screen.getByLabelText('Remover CardFlux Emboscada Noturna'),
    );

    await waitFor(() =>
      expect(screen.queryByText('Emboscada Noturna')).not.toBeInTheDocument(),
    );
    expect(removeCardFlux).toHaveBeenCalledWith('cf1');
    expect(getCardFlux).toHaveBeenCalledTimes(1);
  });

  it('abre o dialog de visualização com narrativa e botão Editar', async () => {
    getCardFlux.mockResolvedValue([
      {
        id: 'cf1',
        nome: 'Emboscada Noturna',
        descricaoGeral: 'Um grupo ataca de surpresa.',
        deck: '🌲 Floresta',
      },
    ]);
    const user = userEvent.setup();
    renderCardFlux();

    await waitFor(() =>
      expect(screen.getByText('Emboscada Noturna')).toBeInTheDocument(),
    );
    await user.click(
      screen.getByLabelText('Visualizar CardFlux Emboscada Noturna'),
    );

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Narrativa')).toBeInTheDocument();
    expect(
      within(dialog).getByText('Um grupo ataca de surpresa.'),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Editar' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('não mostra botões de editar/remover quando canWrite retorna false', async () => {
    canWrite.mockReturnValue(false);
    renderCardFlux();

    await waitFor(() =>
      expect(screen.getByText('Emboscada Noturna')).toBeInTheDocument(),
    );

    expect(
      screen.queryByLabelText('Remover CardFlux Emboscada Noturna'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Editar CardFlux Emboscada Noturna'),
    ).not.toBeInTheDocument();
  });
});
