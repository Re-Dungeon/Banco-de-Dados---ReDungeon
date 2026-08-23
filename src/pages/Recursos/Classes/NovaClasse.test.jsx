import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const addClasse = vi.fn();
const updateClasse = vi.fn();
vi.mock('service/storage', () => ({
  addClasse: (...args) => addClasse(...args),
  updateClasse: (...args) => updateClasse(...args),
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

import NovaClasse from './NovaClasse';

const renderNova = state =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/classes/nova', state }]}>
      <NovaClasse />
    </MemoryRouter>,
  );

describe('NovaClasse (migrado para useEntityFormGuard/FormPageHeader/ImagePreviewPanel/FormActions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
  });

  it('mostra "Nova Classe" e o placeholder de preview antes de preencher a imagem', async () => {
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Classe')).toBeInTheDocument(),
    );
    expect(
      screen.getByText('Insira um link para ver o preview'),
    ).toBeInTheDocument();
  });

  it('cria um registro novo via addClasse ao preencher o nome e salvar', async () => {
    addClasse.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Classe')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Nome da Classe'), 'Guerreiro');
    await user.click(screen.getByRole('button', { name: 'Salvar Classe' }));

    await waitFor(() => expect(addClasse).toHaveBeenCalledTimes(1));
    expect(updateClasse).not.toHaveBeenCalled();
  });

  it('mostra "Editar Classe" com os dados preenchidos e salva via updateClasse', async () => {
    updateClasse.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova({
      classe: { id: 'cl1', nome: 'Mago Arcano', universo: 'u1' },
    });

    await waitFor(() =>
      expect(screen.getByText('Editar Classe')).toBeInTheDocument(),
    );
    expect(screen.getByDisplayValue('Mago Arcano')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() =>
      expect(updateClasse).toHaveBeenCalledWith(
        'cl1',
        expect.objectContaining({ nome: 'Mago Arcano' }),
      ),
    );
    expect(addClasse).not.toHaveBeenCalled();
  });

  it('adiciona uma habilidade básica e um bônus dentro dela usando keys estáveis', async () => {
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Classe')).toBeInTheDocument(),
    );

    await user.click(
      screen.getByRole('button', { name: '+ Adicionar Habilidade Básica' }),
    );
    expect(screen.getByText('Habilidade #1')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de Ação')).toBeInTheDocument();
    expect(screen.getByLabelText('Alvo')).toBeInTheDocument();
    expect(screen.getByLabelText('Alcance')).toBeInTheDocument();
    expect(screen.getByLabelText('Recarga')).toBeInTheDocument();
    expect(screen.getByLabelText('Custo')).toBeInTheDocument();
    expect(screen.getByLabelText('Duração')).toBeInTheDocument();
    expect(screen.getByLabelText('Dados')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '+ Adicionar' }));
    expect(screen.getByLabelText('Bônus 1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remover bônus' }));
    expect(screen.queryByLabelText('Bônus 1')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Remover habilidade' }),
    );
    expect(screen.queryByText('Habilidade #1')).not.toBeInTheDocument();
  });

  it('apresenta os campos completos de habilidade avançada seguindo o padrão das raças', async () => {
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Classe')).toBeInTheDocument(),
    );

    await user.click(
      screen.getByRole('button', { name: '+ Adicionar Habilidade Avançada' }),
    );

    expect(
      screen.getByText('Habilidade Avançada #1'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Nome da Habilidade')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de Ação')).toBeInTheDocument();
    expect(screen.getByLabelText('Alvo')).toBeInTheDocument();
    expect(screen.getByLabelText('Alcance')).toBeInTheDocument();
    expect(screen.getByLabelText('Recarga')).toBeInTheDocument();
    expect(screen.getByLabelText('Custo')).toBeInTheDocument();
    expect(screen.getByLabelText('Duração')).toBeInTheDocument();
    expect(screen.getByLabelText('Dados')).toBeInTheDocument();
  });
});
