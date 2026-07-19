import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const getMateriais = vi.fn();
const removeMaterial = vi.fn();
vi.mock('service/storage', () => ({
  getMateriais: (...args) => getMateriais(...args),
  removeMaterial: (...args) => removeMaterial(...args),
  getUniversos: vi.fn().mockResolvedValue([]),
}));

const canCreate = vi.fn(() => true);
const canWrite = vi.fn(() => true);
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ canCreate, canWrite }),
}));

import Materiais from './Materiais';

const MATERIAIS_MOCK = [
  { id: 'm1', nome: 'Ferro', raridade: 'Comum' },
  { id: 'm2', nome: 'Mithril', raridade: 'Raro' },
];

const renderMateriais = () =>
  render(
    <MemoryRouter>
      <Materiais />
    </MemoryRouter>,
  );

describe('Materiais (padrão useEntityCRUD + useUniversos + EntityFilters + EntityViewDialog)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
    getMateriais.mockResolvedValue(MATERIAIS_MOCK);
  });

  it('lista os materiais retornados por getMateriais depois do loading', async () => {
    renderMateriais();

    await waitFor(() => expect(screen.getByText('Ferro')).toBeInTheDocument());
    expect(screen.getByText('Mithril')).toBeInTheDocument();
  });

  it('filtra por nome no client-side', async () => {
    const user = userEvent.setup();
    renderMateriais();

    await waitFor(() => expect(screen.getByText('Ferro')).toBeInTheDocument());

    await user.type(screen.getByLabelText('Buscar por nome'), 'Mithril');

    expect(screen.getByText('Mithril')).toBeInTheDocument();
    expect(screen.queryByText('Ferro')).not.toBeInTheDocument();
  });

  it('remove um material e ele desaparece da lista sem novo fetch', async () => {
    removeMaterial.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderMateriais();

    await waitFor(() => expect(screen.getByText('Ferro')).toBeInTheDocument());

    await user.click(screen.getByLabelText('Remover material Ferro'));

    await waitFor(() =>
      expect(screen.queryByText('Ferro')).not.toBeInTheDocument(),
    );
    expect(removeMaterial).toHaveBeenCalledWith('m1');
    expect(getMateriais).toHaveBeenCalledTimes(1);
  });

  it('abre o dialog de visualização com botão Editar que navega e fecha o dialog', async () => {
    getMateriais.mockResolvedValue([
      { id: 'm1', nome: 'Ferro', descricao: 'Metal comum.' },
    ]);
    const user = userEvent.setup();
    renderMateriais();

    await waitFor(() => expect(screen.getByText('Ferro')).toBeInTheDocument());
    await user.click(screen.getByLabelText('Visualizar material Ferro'));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Metal comum.')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Editar' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('não mostra botão Editar no dialog quando canWrite retorna false', async () => {
    canWrite.mockReturnValue(false);
    const user = userEvent.setup();
    renderMateriais();

    await waitFor(() => expect(screen.getByText('Ferro')).toBeInTheDocument());
    await user.click(screen.getByLabelText('Visualizar material Ferro'));

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).queryByRole('button', { name: 'Editar' }),
    ).not.toBeInTheDocument();
  });
});
