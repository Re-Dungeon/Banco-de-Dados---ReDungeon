import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const addCondicao = vi.fn();
const updateCondicao = vi.fn();
vi.mock('service/storage', () => ({
  addCondicao: (...args) => addCondicao(...args),
  updateCondicao: (...args) => updateCondicao(...args),
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

import NovaCondicao from './NovaCondicao';

const renderNova = state =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/condicoes/nova', state }]}>
      <NovaCondicao />
    </MemoryRouter>,
  );

describe('NovaCondicao (migrado para useEntityFormGuard/FormPageHeader/ImagePreviewPanel/FormActions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
  });

  it('mostra "Nova Condição" e o placeholder de preview antes de preencher a imagem', async () => {
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Condição')).toBeInTheDocument(),
    );
    expect(
      screen.getByText('Insira um link para ver o preview'),
    ).toBeInTheDocument();
  });

  it('cria um registro novo via addCondicao ao preencher o nome e salvar', async () => {
    addCondicao.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Condição')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Nome da Condição'), 'Envenenado');
    await user.click(screen.getByRole('button', { name: 'Salvar Condição' }));

    await waitFor(() => expect(addCondicao).toHaveBeenCalledTimes(1));
    expect(updateCondicao).not.toHaveBeenCalled();
  });

  it('mostra "Editar Condição" com os dados preenchidos e salva via updateCondicao', async () => {
    updateCondicao.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova({
      condicao: { id: 'c1', nome: 'Atordoado', universo: 'u1' },
    });

    await waitFor(() =>
      expect(screen.getByText('Editar Condição')).toBeInTheDocument(),
    );
    expect(screen.getByDisplayValue('Atordoado')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() =>
      expect(updateCondicao).toHaveBeenCalledWith(
        'c1',
        expect.objectContaining({ nome: 'Atordoado' }),
      ),
    );
    expect(addCondicao).not.toHaveBeenCalled();
  });

  it('adiciona e remove um efeito usando keys estáveis', async () => {
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Condição')).toBeInTheDocument(),
    );

    await user.click(
      screen.getByRole('button', { name: '+ Adicionar Efeito' }),
    );
    expect(screen.getByLabelText('Efeito 1')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Remover efeito'));
    expect(screen.queryByLabelText('Efeito 1')).not.toBeInTheDocument();
  });
});
