import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Painel de preview de imagem repetido em toda página `Nova`/`Novo` de
 * entidade: mostra a imagem de `src` (tipicamente `values.linkImagem` do
 * Formik) ou um placeholder quando vazio/inválido. O estado de erro é
 * interno e reseta automaticamente sempre que `src` muda (ajustado durante
 * a renderização, sem `useEffect`, seguindo o padrão recomendado pelo React
 * para "adjusting state when a prop changes").
 */
const ImagePreviewPanel = ({ src, alt }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const hasPreview = Boolean(src?.trim()) && !imgError;
  const statusText = useMemo(() => {
    if (!src?.trim()) return 'Aguardando imagem';
    if (imgError) return 'Falha ao carregar';
    return 'Prévia carregada';
  }, [imgError, src]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography
        variant="overline"
        sx={{
          color: '#29B6F6',
          letterSpacing: '0.28em',
          fontWeight: 700,
        }}
      >
        PREVIEW
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          padding: '22px',
          borderRadius: '22px',
          border: '1px solid rgba(41, 182, 246, 0.28)',
          background:
            'linear-gradient(145deg, rgba(12, 20, 36, 0.96), rgba(15, 23, 42, 0.9))',
          boxShadow: '0 16px 38px rgba(2, 6, 23, 0.35)',
        }}
      >
        <Box
          sx={{
            minHeight: '280px',
            borderRadius: '18px',
            overflow: 'hidden',
            border: '1px solid rgba(124, 77, 255, 0.24)',
            background:
              'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(22, 33, 54, 0.92))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.22s ease, box-shadow 0.22s ease',
            '&:hover': {
              transform: 'translateY(-2px) scale(1.01)',
              boxShadow: '0 12px 28px rgba(41, 182, 246, 0.12)',
            },
          }}
        >
          {hasPreview ? (
            <img
              src={src}
              alt={alt}
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <Typography
              variant="body2"
              sx={{ color: 'var(--text-muted)', textAlign: 'center', px: 2 }}
            >
              {imgError
                ? 'Imagem não encontrada'
                : 'Insira um link para ver o preview'}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
              Resolução detectada
            </Typography>
            <Typography variant="caption" sx={{ color: '#29B6F6' }}>
              {hasPreview ? 'Auto' : '—'}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
              Status
            </Typography>
            <Typography variant="caption" sx={{ color: '#ffffff' }}>
              {statusText}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

ImagePreviewPanel.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
};

export default ImagePreviewPanel;
