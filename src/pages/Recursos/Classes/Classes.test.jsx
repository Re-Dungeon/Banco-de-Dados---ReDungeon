import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const getClasses = vi.fn();
const removeClasse = vi.fn();
vi.mock('service/storage', () => ({
  getClasses: (...args) => getClasses(...args),
  removeClasse: (...args) => removeClasse(...args),
  getUniversos: vi.fn().mockResolvedValue([]),
}));

const canCreate = vi.fn(() => true);
const canWrite = vi.fn(() => true);
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ canCreate, canWrite }),
}));

import Classes from './Classes';

const CLASSES_MOCK = [
  { id: 'c1', nome: 'Guerreiro', raridade: 'Comum' },
  { id: 'c2', nome: 'Mago', raridade: 'Raro' },
];

const renderClasses = () =>
  render(
    <MemoryRouter>
      <Classes />
    </MemoryRouter>,
  );

describe('Classes (padrão useEntityCRUD + useUniversos + EntityFilters + EntityViewDialog)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
    getClasses.mockResolvedValue(CLASSES_MOCK);
  });

  it('lista as classes retornadas por getClasses depois do loading', async () => {
    renderClasses();

    await waitFor(() =>
      expect(screen.getByText('Guerreiro')).toBeInTheDocument(),
    );
    expect(screen.getByText('Mago')).toBeInTheDocument();
  });

  it('filtra por nome no client-side', async () => {
    const user = userEvent.setup();
    renderClasses();

    await waitFor(() =>
      expect(screen.getByText('Guerreiro')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Buscar por nome'), 'Mago');

    expect(screen.getByText('Mago')).toBeInTheDocument();
    expect(screen.queryByText('Guerreiro')).not.toBeInTheDocument();
  });

  it('remove uma classe e ela desaparece da lista sem novo fetch', async () => {
    removeClasse.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderClasses();

    await waitFor(() =>
      expect(screen.getByText('Guerreiro')).toBeInTheDocument(),
    );

    await user.click(screen.getByLabelText('Remover classe Guerreiro'));

    await waitFor(() =>
      expect(screen.queryByText('Guerreiro')).not.toBeInTheDocument(),
    );
    expect(removeClasse).toHaveBeenCalledWith('c1');
    expect(getClasses).toHaveBeenCalledTimes(1);
  });

  it('abre o dialog de visualização com atributos e habilidades', async () => {
    getClasses.mockResolvedValue([
      {
        id: 'c1',
        nome: 'Guerreiro',
        descricao: 'Especialista em combate corpo a corpo.',
        habilidadesBasicas: [
          { nome: 'Golpe Poderoso', descricao: 'Dano em área.' },
        ],
      },
    ]);
    const user = userEvent.setup();
    renderClasses();

    await waitFor(() =>
      expect(screen.getByText('Guerreiro')).toBeInTheDocument(),
    );
    await user.click(screen.getByLabelText('Visualizar classe Guerreiro'));

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByText('Especialista em combate corpo a corpo.'),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('Habilidades Básicas')).toBeInTheDocument();
    expect(within(dialog).getByText('Golpe Poderoso')).toBeInTheDocument();
  });

  it('não mostra botões de editar/remover quando canWrite retorna false', async () => {
    canWrite.mockReturnValue(false);
    renderClasses();

    await waitFor(() =>
      expect(screen.getByText('Guerreiro')).toBeInTheDocument(),
    );

    expect(
      screen.queryByLabelText('Remover classe Guerreiro'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Editar classe Guerreiro'),
    ).not.toBeInTheDocument();
  });
});
