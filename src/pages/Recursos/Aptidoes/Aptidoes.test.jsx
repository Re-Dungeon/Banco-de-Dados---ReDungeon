import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const getAptidoes = vi.fn();
const removeAptidao = vi.fn();
vi.mock('service/storage', () => ({
  getAptidoes: (...args) => getAptidoes(...args),
  removeAptidao: (...args) => removeAptidao(...args),
  getUniversos: vi.fn().mockResolvedValue([]),
}));

const canCreate = vi.fn(() => true);
const canWrite = vi.fn(() => true);
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ canCreate, canWrite }),
}));

import Aptidoes from './Aptidoes';

const APTIDOES_MOCK = [
  { id: 'a1', nome: 'Fúria Ancestral', nivelMaximo: 3 },
  { id: 'a2', nome: 'Golpe Rápido', nivelMaximo: 2 },
];

const renderAptidoes = () =>
  render(
    <MemoryRouter>
      <Aptidoes />
    </MemoryRouter>,
  );

describe('Aptidoes (padrão useEntityCRUD + useUniversos + EntityFilters + EntityViewDialog)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    canWrite.mockReturnValue(true);
    getAptidoes.mockResolvedValue(APTIDOES_MOCK);
  });

  it('lista as aptidões retornadas por getAptidoes depois do loading', async () => {
    renderAptidoes();

    await waitFor(() =>
      expect(screen.getByText('Fúria Ancestral')).toBeInTheDocument(),
    );
    expect(screen.getByText('Golpe Rápido')).toBeInTheDocument();
  });

  it('filtra por nome no client-side', async () => {
    const user = userEvent.setup();
    renderAptidoes();

    await waitFor(() =>
      expect(screen.getByText('Fúria Ancestral')).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText('Buscar por nome'), 'Golpe');

    expect(screen.getByText('Golpe Rápido')).toBeInTheDocument();
    expect(screen.queryByText('Fúria Ancestral')).not.toBeInTheDocument();
  });

  it('remove uma aptidão e ela desaparece da lista sem novo fetch', async () => {
    removeAptidao.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderAptidoes();

    await waitFor(() =>
      expect(screen.getByText('Fúria Ancestral')).toBeInTheDocument(),
    );

    await user.click(screen.getByLabelText('Remover aptidão Fúria Ancestral'));

    await waitFor(() =>
      expect(screen.queryByText('Fúria Ancestral')).not.toBeInTheDocument(),
    );
    expect(removeAptidao).toHaveBeenCalledWith('a1');
    expect(getAptidoes).toHaveBeenCalledTimes(1);
  });

  it('abre o dialog de visualização com a progressão de níveis', async () => {
    getAptidoes.mockResolvedValue([
      {
        id: 'a1',
        nome: 'Fúria Ancestral',
        nivelMaximo: 1,
        progressaoNiveis: [
          {
            nivel: 1,
            bonus: [
              {
                descricaoCurta: '+2 Força',
                descricaoCompleta: 'Ganha +2 de Força.',
              },
            ],
          },
        ],
      },
    ]);
    const user = userEvent.setup();
    renderAptidoes();

    await waitFor(() =>
      expect(screen.getByText('Fúria Ancestral')).toBeInTheDocument(),
    );
    await user.click(
      screen.getByLabelText('Visualizar aptidão Fúria Ancestral'),
    );

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Nível 1')).toBeInTheDocument();
    expect(within(dialog).getByText('• +2 Força')).toBeInTheDocument();
    expect(within(dialog).getByText('Ganha +2 de Força.')).toBeInTheDocument();
  });

  it('não mostra botões de editar/remover quando canWrite retorna false', async () => {
    canWrite.mockReturnValue(false);
    renderAptidoes();

    await waitFor(() =>
      expect(screen.getByText('Fúria Ancestral')).toBeInTheDocument(),
    );

    expect(
      screen.queryByLabelText('Remover aptidão Fúria Ancestral'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Editar aptidão Fúria Ancestral'),
    ).not.toBeInTheDocument();
  });
});
