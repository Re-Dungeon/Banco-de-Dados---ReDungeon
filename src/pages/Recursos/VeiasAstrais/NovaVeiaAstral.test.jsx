import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const addVeiaAstral = vi.fn();
const updateVeiaAstral = vi.fn();
vi.mock('service/storage', () => ({
  addVeiaAstral: (...args) => addVeiaAstral(...args),
  updateVeiaAstral: (...args) => updateVeiaAstral(...args),
  getUniversos: vi.fn().mockResolvedValue([{ id: 'u1', Nome: 'Prime' }]),
  getDivindades: vi.fn().mockResolvedValue([]),
  getVeiasAstrais: vi.fn().mockResolvedValue([]),
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

import NovaVeiaAstral from './NovaVeiaAstral';

const renderNova = state =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/veias-astrais/nova', state }]}>
      <NovaVeiaAstral />
    </MemoryRouter>,
  );

describe('NovaVeiaAstral (piloto da fase 2 do item 2 — useEntityFormGuard/FormPageHeader/ImagePreviewPanel/FormActions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
  });

  it('mostra "Nova Veia Astral" e o placeholder de preview antes de preencher a imagem', async () => {
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Veia Astral')).toBeInTheDocument(),
    );
    expect(
      screen.getByText('Insira um link para ver o preview'),
    ).toBeInTheDocument();
  });

  it('cria um registro novo via addVeiaAstral ao preencher o nome e salvar', async () => {
    addVeiaAstral.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Veia Astral')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Nome'), 'Veia do Sol');
    await user.click(
      screen.getByRole('button', { name: 'Salvar Veia Astral' }),
    );

    await waitFor(() => expect(addVeiaAstral).toHaveBeenCalledTimes(1));
    expect(updateVeiaAstral).not.toHaveBeenCalled();
  });

  it('mostra "Editar Veia Astral" com os dados preenchidos e salva via updateVeiaAstral', async () => {
    updateVeiaAstral.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova({
      veiaAstral: { id: 'v1', nome: 'Veia Antiga', universo: 'u1' },
    });

    await waitFor(() =>
      expect(screen.getByText('Editar Veia Astral')).toBeInTheDocument(),
    );
    expect(
      screen.getByText('Editando os dados de Veia Antiga'),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Veia Antiga')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() =>
      expect(updateVeiaAstral).toHaveBeenCalledWith(
        'v1',
        expect.objectContaining({ nome: 'Veia Antiga' }),
      ),
    );
    expect(addVeiaAstral).not.toHaveBeenCalled();
  });

  it('volta para a listagem ao clicar em Voltar/Cancelar', async () => {
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Veia Astral')).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: '← Voltar' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
  });
});
