import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  hasFailedImage,
  isDiscordImageUrl,
  markFailedImage,
  normalizeImageSource,
} from 'common/utils/imageFallback';

const EntityImage = ({
  src,
  alt = 'Imagem da entidade',
  height = 220,
  width = '100%',
  objectFit = 'cover',
  placeholderText = 'Sem imagem',
  fallbackText = 'Imagem indisponível',
  sx = {},
  imgProps = {},
}) => {
  const rawSource = typeof src === 'string' ? src.trim() : '';
  const isBlockedDiscord = isDiscordImageUrl(rawSource);
  const normalizedSrc = useMemo(() => normalizeImageSource(rawSource), [rawSource]);
  const [imageFailed, setImageFailed] = useState(false);

  if (isBlockedDiscord) {
    return null;
  }

  const shouldShowFallback = !normalizedSrc || imageFailed || hasFailedImage(normalizedSrc);

  const handleError = () => {
    if (!normalizedSrc) return;

    markFailedImage(normalizedSrc);
    setImageFailed(true);
  };

  if (shouldShowFallback) {
    return (
      <Box
        sx={{
          width,
          height,
          minHeight: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          borderRadius: 3,
          border: '1px solid rgba(148, 163, 184, 0.18)',
          background:
            'linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(8, 13, 23, 0.88))',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          ...sx,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at top, rgba(111, 45, 168, 0.16), transparent 45%)',
          }}
        />
        <Typography
          variant="caption"
          sx={{
            position: 'relative',
            zIndex: 1,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            px: 1,
            color: 'var(--text-secondary)',
          }}
        >
          {normalizedSrc ? fallbackText : placeholderText}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width,
        height,
        overflow: 'hidden',
        borderRadius: 3,
        border: '1px solid rgba(148, 163, 184, 0.18)',
        background: 'rgba(15, 23, 42, 0.8)',
        ...sx,
      }}
    >
      <Box
        component="img"
        src={normalizedSrc}
        alt={alt}
        onError={handleError}
        sx={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit,
          objectPosition: 'center',
        }}
        {...imgProps}
      />
    </Box>
  );
};

EntityImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  objectFit: PropTypes.oneOf(['cover', 'contain', 'fill', 'none', 'scale-down']),
  placeholderText: PropTypes.string,
  fallbackText: PropTypes.string,
  sx: PropTypes.object,
  imgProps: PropTypes.object,
};

export default EntityImage;
