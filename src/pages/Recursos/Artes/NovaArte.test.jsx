import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const addArte = vi.fn();
const updateArte = vi.fn();
vi.mock('service/storage', () => ({
  addArte: (...args) => addArte(...args),
  updateArte: (...args) => updateArte(...args),
  getUniversos: vi.fn().mockResolvedValue([{ id: 'u1', Nome: 'Prime' }]),
  getCondicoes: vi.fn().mockResolvedValue([
    { id: 'c1', nome: 'Envenenado', universo: 'u1' },
    { id: 'c2', nome: 'Atordoado', universo: 'u2' },
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

import NovaArte from './NovaArte';

const renderNova = state =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/artes/nova', state }]}>
      <NovaArte />
    </MemoryRouter>,
  );

describe('NovaArte (migrado para useEntityFormGuard/FormPageHeader/ImagePreviewPanel/FormActions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
  });

  it('mostra "Nova Arte" e o placeholder de preview antes de preencher a imagem', async () => {
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Arte')).toBeInTheDocument(),
    );
    expect(
      screen.getByText('Insira um link para ver o preview'),
    ).toBeInTheDocument();
  });

  it('cria um registro novo via addArte ao preencher o nome e salvar', async () => {
    addArte.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Arte')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Nome da Arte'), 'Bola de Fogo');
    await user.click(screen.getByRole('button', { name: 'Salvar Arte' }));

    await waitFor(() => expect(addArte).toHaveBeenCalledTimes(1));
    expect(updateArte).not.toHaveBeenCalled();
  });

  it('mostra "Editar Arte" com os dados preenchidos e salva via updateArte', async () => {
    updateArte.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova({
      arte: { id: 'a1', nome: 'Lâmina Espectral', universo: 'u1' },
    });

    await waitFor(() =>
      expect(screen.getByText('Editar Arte')).toBeInTheDocument(),
    );
    expect(screen.getByDisplayValue('Lâmina Espectral')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() =>
      expect(updateArte).toHaveBeenCalledWith(
        'a1',
        expect.objectContaining({ nome: 'Lâmina Espectral' }),
      ),
    );
    expect(addArte).not.toHaveBeenCalled();
  });
});
