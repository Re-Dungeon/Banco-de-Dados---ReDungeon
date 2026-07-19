import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const addAptidao = vi.fn();
const updateAptidao = vi.fn();
vi.mock('service/storage', () => ({
  addAptidao: (...args) => addAptidao(...args),
  updateAptidao: (...args) => updateAptidao(...args),
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

import NovaAptidao from './NovaAptidao';

const renderNova = state =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/aptidoes/nova', state }]}>
      <NovaAptidao />
    </MemoryRouter>,
  );

describe('NovaAptidao (useEntityFormGuard/FormPageHeader/ImagePreviewPanel/FormActions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
  });

  it('mostra "Nova Aptidão" e o placeholder de preview antes de preencher a imagem', async () => {
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Aptidão')).toBeInTheDocument(),
    );
    expect(
      screen.getByText('Insira um link para ver o preview'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Defina o Nível Máximo acima para configurar a progressão.',
      ),
    ).toBeInTheDocument();
  });

  it('cria um registro novo via addAptidao ao preencher o nome e salvar', async () => {
    addAptidao.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Aptidão')).toBeInTheDocument(),
    );

    await user.type(
      screen.getByLabelText('Nome da Aptidão'),
      'Fúria Ancestral',
    );
    await user.click(screen.getByRole('button', { name: 'Salvar Aptidão' }));

    await waitFor(() => expect(addAptidao).toHaveBeenCalledTimes(1));
    expect(updateAptidao).not.toHaveBeenCalled();
  });

  it('mostra "Editar Aptidão" com os dados preenchidos e salva via updateAptidao', async () => {
    updateAptidao.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderNova({
      aptidao: { id: 'a1', nome: 'Golpe Rápido', universo: 'u1' },
    });

    await waitFor(() =>
      expect(screen.getByText('Editar Aptidão')).toBeInTheDocument(),
    );
    expect(screen.getByDisplayValue('Golpe Rápido')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() =>
      expect(updateAptidao).toHaveBeenCalledWith(
        'a1',
        expect.objectContaining({ nome: 'Golpe Rápido' }),
      ),
    );
    expect(addAptidao).not.toHaveBeenCalled();
  });

  it('gera um bloco por nível ao definir o Nível Máximo, cada um sem bônus por padrão', async () => {
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Aptidão')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Nível Máximo'), '2');

    expect(screen.getByText('Nível 1')).toBeInTheDocument();
    expect(screen.getByText('Nível 2')).toBeInTheDocument();
    expect(
      screen.getAllByText(
        'Sem bônus definido: o jogador recebe +1 no dado em testes desta aptidão.',
      ),
    ).toHaveLength(2);
    expect(screen.queryByLabelText('Descrição Curta')).not.toBeInTheDocument();
  });

  it('marca "Conceder bônus neste nível" e mostra/some os campos de descrição', async () => {
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Aptidão')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Nível Máximo'), '1');

    await user.click(
      screen.getByRole('checkbox', { name: 'Conceder bônus neste nível' }),
    );

    expect(screen.getByLabelText('Descrição Curta')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição Completa')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'Sem bônus definido: o jogador recebe +1 no dado em testes desta aptidão.',
      ),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('checkbox', { name: 'Conceder bônus neste nível' }),
    );
    expect(screen.queryByLabelText('Descrição Curta')).not.toBeInTheDocument();
  });

  it('reduz o Nível Máximo e remove os blocos de nível excedentes', async () => {
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Aptidão')).toBeInTheDocument(),
    );

    const nivelMaximoInput = screen.getByLabelText('Nível Máximo');
    await user.type(nivelMaximoInput, '3');
    expect(screen.getByText('Nível 3')).toBeInTheDocument();

    await user.clear(nivelMaximoInput);
    await user.type(nivelMaximoInput, '1');

    expect(screen.getByText('Nível 1')).toBeInTheDocument();
    expect(screen.queryByText('Nível 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Nível 3')).not.toBeInTheDocument();
  });

  it('volta para a listagem ao clicar em Voltar/Cancelar', async () => {
    const user = userEvent.setup();
    renderNova(undefined);

    await waitFor(() =>
      expect(screen.getByText('Nova Aptidão')).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: '← Voltar' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
  });
});
