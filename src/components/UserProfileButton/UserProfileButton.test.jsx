import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const logout = vi.fn();
const mockCurrentUser = {
  displayName: 'Test User',
  email: 'test@example.com',
  photoURL: 'https://example.com/avatar.png',
};
const mockAuthState = {
  currentUser: mockCurrentUser,
  isAdmin: false,
  logout,
  userSettings: {
    nomeExibicao: 'Perfil Customizado',
    fotoPerfilUrl: 'https://example.com/custom-avatar.png',
  },
  loadingPreferences: false,
};

vi.mock('context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

import UserProfileButton from './UserProfileButton';

describe('UserProfileButton', () => {
  beforeEach(() => {
    logout.mockClear();
    mockAuthState.currentUser = mockCurrentUser;
    mockAuthState.userSettings = {
      nomeExibicao: 'Perfil Customizado',
      fotoPerfilUrl: 'https://example.com/custom-avatar.png',
    };
    mockAuthState.loadingPreferences = false;
  });

  it('abre o dropdown ao clicar no botão principal sem disparar logout', async () => {
    const user = userEvent.setup();
    render(<UserProfileButton compact />);

    await user.click(screen.getByRole('button', { name: /perfil do usuário/i }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /configurações/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /sair da conta/i })).toBeInTheDocument();
    expect(logout).not.toHaveBeenCalled();
  });

  it('abre o modal de configurações ao clicar em configurações do menu', async () => {
    const user = userEvent.setup();
    render(<UserProfileButton compact />);

    await user.click(screen.getByRole('button', { name: /perfil do usuário/i }));
    await user.click(screen.getByRole('menuitem', { name: /configurações/i }));

    expect(screen.getByRole('dialog', { name: /configurações da conta/i })).toBeInTheDocument();
  });

  it('não exibe dados temporários enquanto as preferências do perfil estão carregando', () => {
    mockAuthState.loadingPreferences = true;
    mockAuthState.userSettings = {
      nomeExibicao: '',
      fotoPerfilUrl: '',
    };

    render(<UserProfileButton compact />);

    expect(screen.getByRole('button', { name: /perfil do usuário/i })).toBeInTheDocument();
    expect(screen.queryByText(/test@example.com/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/perfil customizado/i)).not.toBeInTheDocument();
  });

  it('abre o popup de confirmação customizado ao restaurar a aparência', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(<UserProfileButton compact />);

    await user.click(screen.getByRole('button', { name: /perfil do usuário/i }));
    await user.click(screen.getByRole('menuitem', { name: /configurações/i }));
    await user.click(screen.getByRole('button', { name: /aparência/i }));
    await user.click(screen.getByRole('button', { name: /restaurar aparência padrão/i }));

    expect(screen.getByRole('dialog', { name: /restaurar aparência padrão/i })).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /restaurar aparência padrão/i })).not.toBeInTheDocument();
    });
    confirmSpy.mockRestore();
  });

  it('executa logout somente ao clicar em sair do menu', async () => {
    const user = userEvent.setup();
    render(<UserProfileButton compact />);

    await user.click(screen.getByRole('button', { name: /perfil do usuário/i }));
    await user.click(screen.getByRole('menuitem', { name: /sair da conta/i }));

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
  });
});
