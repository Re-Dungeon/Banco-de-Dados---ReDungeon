import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const getters = vi.hoisted(() => ({
  getRacas: vi.fn(),
  getClasses: vi.fn(),
  getAptidoes: vi.fn(),
  getCorposEspeciais: vi.fn(),
  getOrigens: vi.fn(),
  getDivindades: vi.fn(),
  getArtes: vi.fn(),
  getVeiasAstrais: vi.fn(),
  getReinosCultivo: vi.fn(),
  getCondicoes: vi.fn(),
  getMateriais: vi.fn(),
  getItens: vi.fn(),
  getReceitas: vi.fn(),
  getCardFlux: vi.fn(),
  getTricksterCoinBeneficios: vi.fn(),
  getRegras: vi.fn(),
}));

vi.mock('service/storage', () => getters);

const canCreate = vi.fn(() => true);
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'user-1' },
    canCreate,
    canWrite: vi.fn(() => true),
  }),
}));

import Recursos from './Recursos';

const seed = () => {
  getters.getRacas.mockResolvedValue([{ id: 'r1' }, { id: 'r2' }]);
  getters.getClasses.mockResolvedValue([{ id: 'c1' }]);
  getters.getAptidoes.mockResolvedValue([{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }]);
  getters.getCorposEspeciais.mockResolvedValue([]);
  getters.getOrigens.mockResolvedValue([{ id: 'o1' }, { id: 'o2' }, { id: 'o3' }, { id: 'o4' }]);
  getters.getDivindades.mockResolvedValue([{ id: 'd1' }]);
  getters.getArtes.mockResolvedValue([{ id: 'ar1' }, { id: 'ar2' }]);
  getters.getVeiasAstrais.mockResolvedValue([{ id: 'v1' }, { id: 'v2' }, { id: 'v3' }, { id: 'v4' }, { id: 'v5' }]);
  getters.getReinosCultivo.mockResolvedValue([{ id: 'rk1' }, { id: 'rk2' }, { id: 'rk3' }]);
  getters.getCondicoes.mockResolvedValue([]);
  getters.getMateriais.mockResolvedValue([{ id: 'm1' }, { id: 'm2' }]);
  getters.getItens.mockResolvedValue([{ id: 'i1' }, { id: 'i2' }, { id: 'i3' }, { id: 'i4' }]);
  getters.getReceitas.mockResolvedValue([{ id: 'rc1' }, { id: 'rc2' }, { id: 'rc3' }, { id: 'rc4' }, { id: 'rc5' }, { id: 'rc6' }]);
  getters.getCardFlux.mockResolvedValue([{ id: 'cf1' }, { id: 'cf2' }]);
  getters.getTricksterCoinBeneficios.mockResolvedValue([{ id: 'tc1' }]);
  getters.getRegras.mockResolvedValue([{ id: 'rg1' }, { id: 'rg2' }, { id: 'rg3' }, { id: 'rg4' }, { id: 'rg5' }, { id: 'rg6' }, { id: 'rg7' }]);
};

describe('Recursos dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canCreate.mockReturnValue(true);
    seed();
  });

  it('carrega resumo e cards calculados a partir das coleções reais', async () => {
    render(
      <MemoryRouter>
        <Recursos />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Recursos')).toBeInTheDocument());

    expect(screen.getByText('Total de registros')).toBeInTheDocument();
    expect(screen.getByText('Categorias disponíveis')).toBeInTheDocument();
    expect(screen.getByText('Categorias cadastradas')).toBeInTheDocument();

    expect(screen.getByText('Raças')).toBeInTheDocument();
    expect(screen.getByText('Classes')).toBeInTheDocument();
    expect(screen.getByText('CardFlux')).toBeInTheDocument();
    expect(screen.getByText('Trickster Coin')).toBeInTheDocument();
    expect(screen.getByText('Regras')).toBeInTheDocument();

    expect(screen.getByText('43')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
  });
});
