import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import SearchableSelect from './SearchableSelect';

describe('SearchableSelect', () => {
  it('resumir valores selecionados e abrir a lista completa no clique do olho', async () => {
    const user = userEvent.setup();
    const selected = [
      { value: 'u1', label: 'Universo do Claudio' },
      { value: 'u2', label: 'Bleach' },
      { value: 'u3', label: 'Inazuma Eleven' },
      { value: 'u4', label: 'The Chronicles of the Seven' },
      { value: 'u5', label: 'The Last Human' },
    ];

    render(
      <SearchableSelect
        label="Universos"
        name="universos"
        multiple
        compactSelection
        options={selected}
        value={selected}
        onChange={() => {}}
        onBlur={() => {}}
      />,
    );

    expect(screen.getByText('+3')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Visualizar universos selecionados' }),
    );

    expect(screen.getByText('Todos os universos selecionados')).toBeInTheDocument();
    expect(screen.getAllByText('Universo do Claudio').length).toBeGreaterThan(0);
    expect(screen.getAllByText('The Last Human').length).toBeGreaterThan(0);
  });
});
