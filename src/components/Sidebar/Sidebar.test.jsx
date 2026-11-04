import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const logout = vi.fn();
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { displayName: 'Teste User' },
    logout,
  }),
}));

import Sidebar from './Sidebar';

describe('Sidebar', () => {
  beforeEach(() => {
    logout.mockReset();
  });

  it('agrupa os módulos em categorias expansíveis e mantém a navegação por itens', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/regras']}>
        <Sidebar open onClose={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: /visão geral/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /personagens/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sistemas/i })).toBeInTheDocument();

    expect(screen.queryByText('Raças')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /personagens/i }));
    expect(screen.getByText('Raças')).toBeInTheDocument();
    expect(screen.getByText('Classes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /inventário/i }));
    expect(screen.getByText('Materiais')).toBeInTheDocument();
    expect(screen.getByText('Receitas')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /regras/i })).toBeInTheDocument();
  });
});
