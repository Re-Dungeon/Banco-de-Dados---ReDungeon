import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const addOrigem = vi.fn();
const updateOrigem = vi.fn();
vi.mock('service/storage', () => ({
  addOrigem: (...args) => addOrigem(...args),
  updateOrigem: (...args) => updateOrigem(...args),
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

import NovaOrigem from './NovaOrigem';

const renderNova = state =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/origens/nova', state }]}>
      <NovaOrigem />
    </MemoryRouter>,
  );

describe('NovaOrigem (migrado para useEntityFormGuard/FormPageHeader/ImagePreviewPanel/FormActions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
  });

  it('mostra "Nova Origem" e o placeholder de preview antes de preencher a imagem', async () => {
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Origem')).toBeInTheDocument(),
    );
    expect(
      screen.getByText('Insira um link para ver o preview'),
    ).toBeInTheDocument();
  });

  it('cria um registro novo via addOrigem ao preencher o nome e salvar', async () => {
    addOrigem.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Origem')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Nome da Origem'), 'Deserto Rúbeo');
    await user.click(screen.getByRole('button', { name: 'Salvar Origem' }));

    await waitFor(() => expect(addOrigem).toHaveBeenCalledTimes(1));
    expect(updateOrigem).not.toHaveBeenCalled();
  });

  it('mostra "Editar Origem" com os dados preenchidos e salva via updateOrigem', async () => {
    updateOrigem.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova({
      origem: { id: 'o1', nome: 'Vale Esquecido', universo: 'u1' },
    });

    await waitFor(() =>
      expect(screen.getByText('Editar Origem')).toBeInTheDocument(),
    );
    expect(screen.getByDisplayValue('Vale Esquecido')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() =>
      expect(updateOrigem).toHaveBeenCalledWith(
        'o1',
        expect.objectContaining({ nome: 'Vale Esquecido' }),
      ),
    );
    expect(addOrigem).not.toHaveBeenCalled();
  });

  it('mostra os campos dependentes do tipo selecionado (CAMPOS_POR_TIPO)', async () => {
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Origem')).toBeInTheDocument(),
    );

    expect(screen.queryByText(/Detalhes de/)).not.toBeInTheDocument();

    await user.click(document.getElementById('mui-component-select-tipo'));
    await user.click(await screen.findByRole('option', { name: 'Região' }));

    expect(screen.getByText('Detalhes de Região')).toBeInTheDocument();
    expect(screen.getByLabelText('Clima')).toBeInTheDocument();
  });
});
