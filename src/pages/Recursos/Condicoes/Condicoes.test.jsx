import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const getCondicoes = vi.fn();
const removeCondicao = vi.fn();
vi.mock('service/storage', () => ({
  getCondicoes: (...args) => getCondicoes(...args),
  removeCondicao: (...args) => removeCondicao(...args),
  getUniversos: vi.fn().mockResolvedValue([]),
}));

const canCreate = vi.fn(() => true);
const canWrite = vi.fn(() => true);
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ canCreate, canWrite }),
}));

import Condicoes from './Condicoes';

const CONDICOES_MOCK = [
  { id: 'c1', nome: 'Envenenado', raridade: 'Comum' },
  { id: 'c2', nome: 'Atordoado', raridade: 'Raro' },
];

const renderCondicoes = () =>
  render(
    <MemoryRouter>
      <Condicoes />
    </MemoryRouter>,
  );

describe('Condicoes (padrão useEntityCRUD + useUniversos + EntityFilters + EntityViewDialog)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
    getCondicoes.mockResolvedValue(CONDICOES_MOCK);
  });

  it('lista as condições retornadas por getCondicoes depois do loading', async () => {
    renderCondicoes();

    await waitFor(() =>
      expect(screen.getByText('Envenenado')).toBeInTheDocument(),
    );
    expect(screen.getByText('Atordoado')).toBeInTheDocument();
  });

  it('filtra por nome no client-side', async () => {
    const user = userEvent.setup();
    renderCondicoes();

    await waitFor(() =>
      expect(screen.getByText('Envenenado')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Buscar por nome'), 'Atordoado');

    expect(screen.getByText('Atordoado')).toBeInTheDocument();
    expect(screen.queryByText('Envenenado')).not.toBeInTheDocument();
  });

  it('remove uma condição e ela desaparece da lista sem novo fetch', async () => {
    removeCondicao.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderCondicoes();

    await waitFor(() =>
      expect(screen.getByText('Envenenado')).toBeInTheDocument(),
    );

    await user.click(screen.getByLabelText('Remover condição Envenenado'));

    await waitFor(() =>
      expect(screen.queryByText('Envenenado')).not.toBeInTheDocument(),
    );
    expect(removeCondicao).toHaveBeenCalledWith('c1');
    expect(getCondicoes).toHaveBeenCalledTimes(1);
  });

  it('abre o dialog de visualização com descrição, aplicação e efeitos', async () => {
    getCondicoes.mockResolvedValue([
      {
        id: 'c1',
        nome: 'Envenenado',
        descricao: 'Sofre dano contínuo.',
        aplicacao: 'Ao ser atingido por veneno.',
        efeitos: ['-2 em testes de Força'],
      },
    ]);
    const user = userEvent.setup();
    renderCondicoes();

    await waitFor(() =>
      expect(screen.getByText('Envenenado')).toBeInTheDocument(),
    );
    await user.click(screen.getByLabelText('Visualizar condição Envenenado'));

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByText('Sofre dano contínuo.'),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText('Ao ser atingido por veneno.'),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText('-2 em testes de Força', { exact: false }),
    ).toBeInTheDocument();
  });

  it('não mostra botões de editar/remover quando canWrite retorna false', async () => {
    canWrite.mockReturnValue(false);
    renderCondicoes();

    await waitFor(() =>
      expect(screen.getByText('Envenenado')).toBeInTheDocument(),
    );

    expect(
      screen.queryByLabelText('Remover condição Envenenado'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Editar condição Envenenado'),
    ).not.toBeInTheDocument();
  });
});
