import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockUseAuth = vi.fn();

vi.mock('context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('components/LoginModal/LoginModal', () => ({
  default: ({ open }) => (open ? <div>LoginModal Aberta</div> : null),
}));

import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });
  });

  it('renderiza a tela de acesso restrito com botão para abrir login', async () => {
    const user = userEvent.setup();
    const { container } = render(<ProtectedRoute />);

    expect(container.firstChild).toHaveStyle({
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
    expect(screen.getByText('Acesso Restrito')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Acessar minha conta/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Acessar minha conta/i }));

    expect(screen.getByText('LoginModal Aberta')).toBeInTheDocument();
  });
});
