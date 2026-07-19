import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const addDivindade = vi.fn();
const updateDivindade = vi.fn();
vi.mock('service/storage', () => ({
  addDivindade: (...args) => addDivindade(...args),
  updateDivindade: (...args) => updateDivindade(...args),
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

import NovaDivindade from './NovaDivindade';

const renderNova = state =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/divindades/nova', state }]}>
      <NovaDivindade />
    </MemoryRouter>,
  );

describe('NovaDivindade (useEntityFormGuard/FormPageHeader/ImagePreviewPanel/FormActions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
  });

  it('mostra "Nova Divindade" e o placeholder de preview antes de preencher a imagem', async () => {
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Divindade')).toBeInTheDocument(),
    );
    expect(
      screen.getByText('Insira um link para ver o preview'),
    ).toBeInTheDocument();
  });

  it('cria um registro novo via addDivindade ao preencher o nome e salvar', async () => {
    addDivindade.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Divindade')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Nome da Divindade'), 'Anúbis');
    await user.click(screen.getByRole('button', { name: 'Salvar Divindade' }));

    await waitFor(() => expect(addDivindade).toHaveBeenCalledTimes(1));
    expect(updateDivindade).not.toHaveBeenCalled();
  });

  it('mostra "Editar Divindade" com os dados preenchidos e salva via updateDivindade', async () => {
    updateDivindade.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova({
      divindade: { id: 'd1', nome: 'Hestia', universo: 'u1' },
    });

    await waitFor(() =>
      expect(screen.getByText('Editar Divindade')).toBeInTheDocument(),
    );
    expect(screen.getByDisplayValue('Hestia')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() =>
      expect(updateDivindade).toHaveBeenCalledWith(
        'd1',
        expect.objectContaining({ nome: 'Hestia' }),
      ),
    );
    expect(addDivindade).not.toHaveBeenCalled();
  });

  it('volta para a listagem ao clicar em Voltar/Cancelar', async () => {
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Divindade')).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: '← Voltar' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
  });
});
