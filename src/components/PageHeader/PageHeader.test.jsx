import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@mui/material/Button';
import PageHeader from './PageHeader';

describe('PageHeader', () => {
  it('renderiza título e descrição', () => {
    render(
      <PageHeader
        title="Raças"
        description="Gerencie as raças disponíveis na campanha."
      />,
    );

    expect(screen.getByText('Raças')).toBeInTheDocument();
    expect(
      screen.getByText('Gerencie as raças disponíveis na campanha.'),
    ).toBeInTheDocument();
  });

  it('renderiza ações e executa evento ao clicar', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <PageHeader
        title="Classes"
        description="Gerencie as classes disponíveis na campanha."
        actions={
          <Button onClick={onClick} variant="contained">
            + Nova Classe
          </Button>
        }
      />,
    );

    await user.click(screen.getByRole('button', { name: '+ Nova Classe' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
