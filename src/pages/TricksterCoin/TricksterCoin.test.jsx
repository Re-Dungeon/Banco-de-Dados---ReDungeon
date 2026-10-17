import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TricksterCoin from './TricksterCoin';
import { useAuth } from 'context/AuthContext';
import { getTricksterCoinBeneficios } from 'service/storage';

vi.mock('context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const defaultAuthState = {
  currentUser: { uid: 'user-1' },
  loading: false,
  loadingPermissions: false,
  isAdmin: true,
  canCreate: () => true,
};

vi.mock('hooks/useDeleteConfirmation', () => ({
  default: () => ({
    confirmDelete: vi.fn(),
    deleteConfirmationDialog: null,
  }),
}));

vi.mock('hooks/useUniversos', () => ({
  default: () => ({ universos: [] }),
}));

vi.mock('service/storage', () => ({
  addTricksterCoinBeneficio: vi.fn(),
  getTricksterCoinBeneficios: vi.fn(),
  removeTricksterCoinBeneficio: vi.fn(),
  updateTricksterCoinBeneficio: vi.fn(),
}));

vi.mock('./TricksterCoinCard', () => ({
  default: () => <div>Trickster Coin Card</div>,
}));

describe('TricksterCoin', () => {
  it('não consulta benefícios quando o usuário não tem acesso administrativo', () => {
    useAuth.mockReturnValue({
      ...defaultAuthState,
      isAdmin: false,
      canCreate: () => false,
    });

    render(<TricksterCoin />);

    expect(getTricksterCoinBeneficios).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Você não possui acesso à Trickster Coin/i),
    ).toBeInTheDocument();
  });

  it('carrega benefícios quando o usuário é administrador autenticado', async () => {
    useAuth.mockReturnValue(defaultAuthState);
    getTricksterCoinBeneficios.mockResolvedValue([{ id: '1', nome: 'Teste' }]);

    render(<TricksterCoin />);

    expect(await screen.findByText('Trickster Coin Card')).toBeInTheDocument();
    expect(getTricksterCoinBeneficios).toHaveBeenCalledTimes(1);
  });
});
