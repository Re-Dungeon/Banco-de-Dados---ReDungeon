import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const addRaca = vi.fn();
const updateRaca = vi.fn();
vi.mock('service/storage', () => ({
  addRaca: (...args) => addRaca(...args),
  updateRaca: (...args) => updateRaca(...args),
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

import NovaRaca from './NovaRaca';

const renderNova = state =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/racas/nova', state }]}>
      <NovaRaca />
    </MemoryRouter>,
  );

describe('NovaRaca (migrado para useEntityFormGuard/FormPageHeader/ImagePreviewPanel/FormActions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
  });

  it('mostra "Nova Raça" e o placeholder de preview antes de preencher a imagem', async () => {
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Raça')).toBeInTheDocument(),
    );
    expect(
      screen.getByText('Insira um link para ver o preview'),
    ).toBeInTheDocument();
  });

  it('cria um registro novo via addRaca ao preencher o nome e salvar', async () => {
    addRaca.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Raça')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Nome da Raça'), 'Elfo Sombrio');
    await user.click(screen.getByRole('button', { name: 'Salvar Raça' }));

    await waitFor(() => expect(addRaca).toHaveBeenCalledTimes(1));
    expect(updateRaca).not.toHaveBeenCalled();
  });

  it('mostra "Editar Raça" com os dados preenchidos e salva via updateRaca', async () => {
    updateRaca.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova({
      raca: { id: 'rc1', nome: 'Anão da Montanha', universo: 'u1' },
    });

    await waitFor(() =>
      expect(screen.getByText('Editar Raça')).toBeInTheDocument(),
    );
    expect(screen.getByDisplayValue('Anão da Montanha')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() =>
      expect(updateRaca).toHaveBeenCalledWith(
        'rc1',
        expect.objectContaining({ nome: 'Anão da Montanha' }),
      ),
    );
    expect(addRaca).not.toHaveBeenCalled();
  });

  it('adiciona uma habilidade racial básica e um bônus dentro dela usando keys estáveis', async () => {
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Raça')).toBeInTheDocument(),
    );

    await user.click(
      screen.getByRole('button', { name: '+ Adicionar Habilidade Básica' }),
    );
    expect(screen.getByText('Habilidade #1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '+ Adicionar' }));
    expect(screen.getByLabelText('Bônus 1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remover bônus' }));
    expect(screen.queryByLabelText('Bônus 1')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Remover habilidade básica' }),
    );
    expect(screen.queryByText('Habilidade #1')).not.toBeInTheDocument();
  });
});
