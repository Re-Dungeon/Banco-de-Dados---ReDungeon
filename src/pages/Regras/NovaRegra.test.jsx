import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const addRegra = vi.fn();
const updateRegra = vi.fn();
vi.mock('service/storage', () => ({
  addRegra: (...args) => addRegra(...args),
  updateRegra: (...args) => updateRegra(...args),
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

import NovaRegra from './NovaRegra';

const renderNova = state =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/regras/nova', state }]}>
      <NovaRegra />
    </MemoryRouter>,
  );

describe('NovaRegra (migrado para useEntityFormGuard/FormPageHeader/ImagePreviewPanel/FormActions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
  });

  it('mostra "Nova Regra" e o placeholder de preview antes de preencher a imagem', async () => {
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Regra')).toBeInTheDocument(),
    );
    expect(
      screen.getByText('Insira um link para ver o preview'),
    ).toBeInTheDocument();
  });

  it('cria um registro novo via addRegra ao preencher o nome e salvar', async () => {
    addRegra.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Regra')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Nome da Regra'), 'Iniciativa');
    await user.click(screen.getByRole('button', { name: 'Salvar Regra' }));

    await waitFor(() => expect(addRegra).toHaveBeenCalledTimes(1));
    expect(updateRegra).not.toHaveBeenCalled();
  });

  it('mostra "Editar Regra" com os dados preenchidos e salva via updateRegra', async () => {
    updateRegra.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova({
      regra: { id: 'r1', nome: 'Vantagem/Desvantagem', universo: 'u1' },
    });

    await waitFor(() =>
      expect(screen.getByText('Editar Regra')).toBeInTheDocument(),
    );
    expect(
      screen.getByDisplayValue('Vantagem/Desvantagem'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() =>
      expect(updateRegra).toHaveBeenCalledWith(
        'r1',
        expect.objectContaining({ nome: 'Vantagem/Desvantagem' }),
      ),
    );
    expect(addRegra).not.toHaveBeenCalled();
  });
});
