import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const addIten = vi.fn();
const updateIten = vi.fn();
vi.mock('service/storage', () => ({
  addIten: (...args) => addIten(...args),
  updateIten: (...args) => updateIten(...args),
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

import NovoItem from './NovoItem';

const renderNovo = state =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/itens/novo', state }]}>
      <NovoItem />
    </MemoryRouter>,
  );

describe('NovoItem (migrado para useEntityFormGuard/FormPageHeader/ImagePreviewPanel/FormActions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
  });

  it('mostra "Novo Item" e o placeholder de preview antes de preencher a imagem', async () => {
    renderNovo(undefined);

    await waitFor(() =>
      expect(screen.getByText('Novo Item')).toBeInTheDocument(),
    );
    expect(
      screen.getByText('Insira um link para ver o preview'),
    ).toBeInTheDocument();
  });

  it('cria um registro novo via addIten ao preencher o nome e salvar', async () => {
    addIten.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNovo(undefined);

    await waitFor(() =>
      expect(screen.getByText('Novo Item')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Nome do Item'), 'Espada Rúnica');
    await user.click(screen.getByRole('button', { name: 'Salvar Item' }));

    await waitFor(() => expect(addIten).toHaveBeenCalledTimes(1));
    expect(updateIten).not.toHaveBeenCalled();
  });

  it('mostra "Editar Item" com os dados preenchidos e salva via updateIten', async () => {
    updateIten.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNovo({
      item: { id: 'i1', nome: 'Adaga Sombria', universo: 'u1' },
    });

    await waitFor(() =>
      expect(screen.getByText('Editar Item')).toBeInTheDocument(),
    );
    expect(screen.getByDisplayValue('Adaga Sombria')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() =>
      expect(updateIten).toHaveBeenCalledWith(
        'i1',
        expect.objectContaining({ nome: 'Adaga Sombria' }),
      ),
    );
    expect(addIten).not.toHaveBeenCalled();
  });

  it('adiciona e remove uma habilidade especial usando keys estáveis', async () => {
    const user = userEvent.setup();
    renderNovo(undefined);

    await waitFor(() =>
      expect(screen.getByText('Novo Item')).toBeInTheDocument(),
    );

    await user.click(
      screen.getByRole('button', { name: '+ Adicionar Habilidade Especial' }),
    );
    expect(screen.getByText('Habilidade #1')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Remover habilidade especial' }),
    );
    expect(screen.queryByText('Habilidade #1')).not.toBeInTheDocument();
  });
});
