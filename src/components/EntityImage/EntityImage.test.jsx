import React from 'react';
import { beforeEach, describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { resetFailedImages } from 'common/utils/imageFallback';
import EntityImage from './EntityImage';

describe('EntityImage', () => {
  beforeEach(() => {
    resetFailedImages();
  });
  it('renderiza a imagem quando a URL é válida', () => {
    render(
      <EntityImage src="https://example.com/ficha.png" alt="Ficha do herói" />,
    );

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/ficha.png',
    );
  });

  it('mostra placeholder quando a URL está vazia', () => {
    render(<EntityImage src="" alt="Ficha do herói" />);

    expect(screen.getByText('Sem imagem')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('não renderiza nem tenta requisitar imagens hospedadas no Discord', () => {
    const { container } = render(
      <EntityImage
        src="https://cdn.discordapp.com/attachments/123/456/K0pC6wk.jpeg"
        alt="Ficha do herói"
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('mostra placeholder quando a imagem retorna 404', () => {
    render(
      <EntityImage src="https://example.com/quebrada.png" alt="Ficha do herói" />,
    );

    fireEvent.error(screen.getByRole('img'));

    expect(screen.getByText('Imagem indisponível')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('permite substituir uma URL quebrada por uma válida', () => {
    const { rerender } = render(
      <EntityImage src="https://example.com/quebrada.png" alt="Ficha do herói" />,
    );

    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByText('Imagem indisponível')).toBeInTheDocument();

    rerender(
      <EntityImage
        key="nova-url"
        src="https://example.com/correta.png"
        alt="Ficha do herói"
      />,
    );

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/correta.png',
    );
    expect(screen.queryByText('Imagem indisponível')).not.toBeInTheDocument();
  });

  it('evita tentativas repetidas para a mesma URL quebrada na sessão', () => {
    const { rerender } = render(
      <EntityImage src="https://example.com/quebrada.png" alt="Ficha do herói" />,
    );

    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    rerender(
      <EntityImage
        key="quebrada-fixa"
        src="https://example.com/quebrada.png"
        alt="Ficha do herói"
      />,
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Imagem indisponível')).toBeInTheDocument();
  });
});
