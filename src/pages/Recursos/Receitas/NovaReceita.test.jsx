import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const addReceita = vi.fn();
const updateReceita = vi.fn();
vi.mock('service/storage', () => ({
  addReceita: (...args) => addReceita(...args),
  updateReceita: (...args) => updateReceita(...args),
  getUniversos: vi.fn().mockResolvedValue([{ id: 'u1', Nome: 'Prime' }]),
  getMateriais: vi.fn().mockResolvedValue([
    { id: 'm1', nome: 'Ferro', universo: 'u1' },
    { id: 'm2', nome: 'Cristal', universo: 'u2' },
  ]),
}));

const canCreate = vi.fn(() => true);
const canWrite = vi.fn(() => true);
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({
    canCreate,
    canWrite,
    isAdmin: true,
    allowedUniversos: [],
    loadingPermissions: false,
  }),
}));

import NovaReceita from './NovaReceita';

const renderNova = state =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/receitas/nova', state }]}>
      <NovaReceita />
    </MemoryRouter>,
  );

describe('NovaReceita (migrado para useEntityFormGuard/FormPageHeader/ImagePreviewPanel/FormActions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
  });

  it('mostra "Nova Receita" e o placeholder de preview antes de preencher a imagem', async () => {
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Receita')).toBeInTheDocument(),
    );
    expect(
      screen.getByText('Insira um link para ver o preview'),
    ).toBeInTheDocument();
  });

  it('cria um registro novo via addReceita ao preencher o nome e salvar', async () => {
    addReceita.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Receita')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Nome da Receita'), 'Poção de Cura');
    await user.click(screen.getByRole('button', { name: 'Salvar Receita' }));

    await waitFor(() => expect(addReceita).toHaveBeenCalledTimes(1));
    expect(updateReceita).not.toHaveBeenCalled();
  });

  it('mostra "Editar Receita" com os dados preenchidos e salva via updateReceita', async () => {
    updateReceita.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova({
      receita: { id: 're1', nome: 'Poção de Veneno', universo: 'u1' },
    });

    await waitFor(() =>
      expect(screen.getByText('Editar Receita')).toBeInTheDocument(),
    );
    expect(screen.getByDisplayValue('Poção de Veneno')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() =>
      expect(updateReceita).toHaveBeenCalledWith(
        're1',
        expect.objectContaining({ nome: 'Poção de Veneno' }),
      ),
    );
    expect(addReceita).not.toHaveBeenCalled();
  });
});
