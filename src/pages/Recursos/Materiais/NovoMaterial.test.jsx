import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const addMaterial = vi.fn();
const updateMaterial = vi.fn();
vi.mock('service/storage', () => ({
  addMaterial: (...args) => addMaterial(...args),
  updateMaterial: (...args) => updateMaterial(...args),
  getUniversos: vi.fn().mockResolvedValue([{ id: 'u1', Nome: 'Prime' }]),
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

import NovoMaterial from './NovoMaterial';

const renderNovo = state =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/materiais/novo', state }]}>
      <NovoMaterial />
    </MemoryRouter>,
  );

describe('NovoMaterial (migrado para useEntityFormGuard/FormPageHeader/ImagePreviewPanel/FormActions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
  });

  it('mostra "Novo Material" e o placeholder de preview antes de preencher a imagem', async () => {
    renderNovo(undefined);

    await waitFor(() =>
      expect(screen.getByText('Novo Material')).toBeInTheDocument(),
    );
    expect(
      screen.getByText('Insira um link para ver o preview'),
    ).toBeInTheDocument();
  });

  it('cria um registro novo via addMaterial ao preencher o nome e salvar', async () => {
    addMaterial.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNovo(undefined);

    await waitFor(() =>
      expect(screen.getByText('Novo Material')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Nome do Material'), 'Ferro-Lunar');
    await user.click(screen.getByRole('button', { name: 'Salvar Material' }));

    await waitFor(() => expect(addMaterial).toHaveBeenCalledTimes(1));
    expect(updateMaterial).not.toHaveBeenCalled();
  });

  it('mostra "Editar Material" com os dados preenchidos e salva via updateMaterial', async () => {
    updateMaterial.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNovo({
      material: { id: 'm1', nome: 'Cristal Antigo', universo: 'u1' },
    });

    await waitFor(() =>
      expect(screen.getByText('Editar Material')).toBeInTheDocument(),
    );
    expect(screen.getByDisplayValue('Cristal Antigo')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() =>
      expect(updateMaterial).toHaveBeenCalledWith(
        'm1',
        expect.objectContaining({ nome: 'Cristal Antigo' }),
      ),
    );
    expect(addMaterial).not.toHaveBeenCalled();
  });
});
