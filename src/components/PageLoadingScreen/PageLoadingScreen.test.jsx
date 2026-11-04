import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PageLoadingScreen from './PageLoadingScreen';

describe('PageLoadingScreen', () => {
  it('exibe o GIF enquanto a tela está visível', () => {
    render(<PageLoadingScreen visible />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /carregando aplicação/i })).toHaveAttribute(
      'src',
      'https://i.imgur.com/fBSP9Dd.gif',
    );
  });

  it('oculta a tela quando o carregamento já terminou', () => {
    const { container } = render(<PageLoadingScreen visible={false} />);

    expect(container.firstChild).toHaveStyle({
      opacity: '0',
      visibility: 'hidden',
      pointerEvents: 'none',
    });
  });
});
