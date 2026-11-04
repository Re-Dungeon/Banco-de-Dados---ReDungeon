import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockAuthState = {
  currentUser: null,
  loading: false,
};

vi.mock('context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('components/Sidebar/Sidebar', () => ({
  default: () => <div>Sidebar</div>,
}));

vi.mock('components/Header/Header', () => ({
  default: () => <div>Header</div>,
}));

vi.mock('components/ProtectedRoute/ProtectedRoute', () => ({
  default: () => <div>Protected Route Screen</div>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div>Outlet</div>,
  };
});

import Layout from './Layout';

describe('Layout', () => {
  beforeEach(() => {
    mockAuthState.currentUser = null;
    mockAuthState.loading = false;
  });

  it('esconde o shell interno quando o usuário não está autenticado', () => {
    render(<Layout />);

    expect(screen.getByText('Protected Route Screen')).toBeInTheDocument();
    expect(screen.queryByText('Sidebar')).not.toBeInTheDocument();
    expect(screen.queryByText('Header')).not.toBeInTheDocument();
    expect(screen.queryByText('Outlet')).not.toBeInTheDocument();
  });

  it('renderiza o shell completo quando o usuário está autenticado', () => {
    mockAuthState.currentUser = { uid: 'abc' };

    render(<Layout />);

    expect(screen.getByText('Sidebar')).toBeInTheDocument();
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Outlet')).toBeInTheDocument();
  });
});
