import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { saveUserSettingsMock, refreshUserPreferencesMock, mockAuthState } = vi.hoisted(() => {
  const mockCurrentUser = {
    uid: 'uid-123',
    displayName: 'Jogador Teste',
    email: 'jogador@teste.com',
  };

  return {
    saveUserSettingsMock: vi.fn(),
    refreshUserPreferencesMock: vi.fn(),
    mockCurrentUser,
    mockAuthState: {
      currentUser: mockCurrentUser,
      isAdmin: false,
      userSettings: {
        nomeExibicao: 'Jogador Teste',
        fotoPerfilUrl: '',
        tema: 'dark',
        corDestaque: '#6F2DA8',
        notificacoes: { ativadas: true },
      },
      refreshUserPreferences: vi.fn(),
    },
  };
});

mockAuthState.refreshUserPreferences = refreshUserPreferencesMock;

vi.mock('context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('service/firebase', () => ({
  auth: {},
}));

vi.mock('service/storage', () => ({
  DEFAULT_USER_SETTINGS: {
    nomeExibicao: '',
    fotoPerfilUrl: '',
    tema: 'dark',
    corDestaque: '#6F2DA8',
    notificacoes: { ativadas: true },
  },
  saveUserSettings: saveUserSettingsMock,
  getSupportAppContext: () => ({
    sourceApp: 'database',
    sourceAppName: 'Banco de Dados',
    sourceUrl: 'https://re-dungeon.app',
  }),
}));

import UserSettingsModal from './UserSettingsModal';

describe('UserSettingsModal', () => {
  beforeEach(() => {
    saveUserSettingsMock.mockReset();
    refreshUserPreferencesMock.mockReset();

    saveUserSettingsMock.mockResolvedValue({
      nomeExibicao: 'Jogador Teste',
      fotoPerfilUrl: '',
      tema: 'dark',
      corDestaque: '#6F2DA8',
      notificacoes: { ativadas: true },
    });
  });

  it('envia o uid do usuário e as preferências salvas para refreshUserPreferences', async () => {
    const user = userEvent.setup();
    render(<UserSettingsModal open onClose={() => {}} />);

    await user.click(screen.getByRole('button', { name: /salvar alterações/i }));

    expect(saveUserSettingsMock).toHaveBeenCalledWith(
      'uid-123',
      expect.objectContaining({
        nomeExibicao: 'Jogador Teste',
        tema: 'dark',
      }),
    );

    expect(refreshUserPreferencesMock).toHaveBeenCalledWith(
      'uid-123',
      expect.objectContaining({
        tema: 'dark',
        corDestaque: '#6F2DA8',
      }),
    );
  });
});
