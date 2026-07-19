import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const addCardFlux = vi.fn();
const updateCardFlux = vi.fn();
vi.mock('service/storage', () => ({
  addCardFlux: (...args) => addCardFlux(...args),
  updateCardFlux: (...args) => updateCardFlux(...args),
  getUniversos: vi.fn().mockResolvedValue([{ id: 'u1', Nome: 'Prime' }]),
  getCardFlux: vi.fn().mockResolvedValue([
    { id: 'cf1', nome: 'Carta A', universo: 'u1' },
    { id: 'cf2', nome: 'Carta B', universo: 'u2' },
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

import NovoCardFlux from './NovoCardFlux';

const renderNovo = state =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/cardflux/novo', state }]}>
      <NovoCardFlux />
    </MemoryRouter>,
  );

describe('NovoCardFlux (migrado para useEntityFormGuard/FormPageHeader/ImagePreviewPanel/FormActions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
  });

  it('mostra "Novo CardFlux" e o placeholder de preview antes de preencher a imagem', async () => {
    renderNovo(undefined);

    await waitFor(() =>
      expect(screen.getByText('Novo CardFlux')).toBeInTheDocument(),
    );
    expect(
      screen.getByText('Insira um link para ver o preview'),
    ).toBeInTheDocument();
  });

  it('cria um registro novo via addCardFlux ao preencher o nome e salvar', async () => {
    addCardFlux.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNovo(undefined);

    await waitFor(() =>
      expect(screen.getByText('Novo CardFlux')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Nome'), 'Carta do Destino');
    await user.click(screen.getByRole('button', { name: 'Salvar CardFlux' }));

    await waitFor(() => expect(addCardFlux).toHaveBeenCalledTimes(1));
    expect(updateCardFlux).not.toHaveBeenCalled();
  });

  it('mostra "Editar CardFlux" com os dados preenchidos e salva via updateCardFlux', async () => {
    updateCardFlux.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNovo({
      cardFlux: { id: 'cfx1', nome: 'Carta Antiga', universo: 'u1' },
    });

    await waitFor(() =>
      expect(screen.getByText('Editar CardFlux')).toBeInTheDocument(),
    );
    expect(screen.getByDisplayValue('Carta Antiga')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() =>
      expect(updateCardFlux).toHaveBeenCalledWith(
        'cfx1',
        expect.objectContaining({ nome: 'Carta Antiga' }),
      ),
    );
    expect(addCardFlux).not.toHaveBeenCalled();
  });

  it('mostra os campos de encadeamento de eventos ao marcar o checkbox', async () => {
    const user = userEvent.setup();
    renderNovo(undefined);

    await waitFor(() =>
      expect(screen.getByText('Novo CardFlux')).toBeInTheDocument(),
    );

    expect(
      document.getElementById('mui-component-select-tipoAtivacao'),
    ).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Ativar encadeamento de eventos'));

    expect(
      document.getElementById('mui-component-select-tipoAtivacao'),
    ).toBeInTheDocument();
  });
});
