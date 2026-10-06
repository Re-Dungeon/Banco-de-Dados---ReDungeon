import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import { normalizeBonusEntries, normalizeTokensValue } from './utils';

const getBonusStyles = tipoBonus => {
  switch (tipoBonus) {
    case 'Vantagem':
      return {
        background: 'rgba(16, 185, 129, 0.12)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        color: '#86efac',
      };
    case 'Desvantagem':
      return {
        background: 'rgba(239, 68, 68, 0.12)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        color: '#fca5a5',
      };
    case 'Neutro':
    default:
      return {
        background: 'rgba(148, 163, 184, 0.12)',
        borderColor: 'rgba(148, 163, 184, 0.28)',
        color: '#cbd5e1',
      };
  }
};

const getStatusStyles = status => {
  if (status === 'Inativo') {
    return {
      background: 'rgba(148, 163, 184, 0.08)',
      borderColor: 'rgba(148, 163, 184, 0.16)',
      color: 'var(--text-secondary)',
    };
  }

  return {
    background: 'rgba(34, 197, 94, 0.12)',
    borderColor: 'rgba(34, 197, 94, 0.28)',
    color: '#bbf7d0',
  };
};

const getBonusSummaryChip = benefit => {
  const bonusEntries = normalizeBonusEntries(benefit?.bonus, benefit?.tipoBonus ?? 'Neutro');
  const tipos = [...new Set(bonusEntries.map(entry => entry.tipo))];

  if (tipos.length === 0) {
    return 'Neutro';
  }

  if (tipos.length === 1) {
    return tipos[0];
  }

  return 'Misturado';
};

const TricksterCoinCard = ({
  benefit,
  onEdit = () => undefined,
  onDuplicate = () => undefined,
  onDelete = () => undefined,
  duplicating = false,
}) => {
  const imageSource = String(benefit?.linkImagem ?? '').trim();
  const [failedImageUrls, setFailedImageUrls] = useState({});
  const bonusEntries = normalizeBonusEntries(benefit?.bonus, benefit?.tipoBonus ?? 'Neutro');
  const tokens = normalizeTokensValue(benefit?.tokens);
  const bonusPreview = bonusEntries.slice(0, 3);
  const extraBonusCount = Math.max(bonusEntries.length - bonusPreview.length, 0);
  const bonusStyles = getBonusStyles(getBonusSummaryChip(benefit));
  const statusStyles = getStatusStyles(benefit.status || 'Ativo');
  const hasFailedImage = Boolean(imageSource) && Boolean(failedImageUrls[imageSource]);
  const shouldRenderImage = Boolean(imageSource) && !hasFailedImage;

  const handleImageError = () => {
    if (!imageSource) {
      return;
    }

    setFailedImageUrls(previous => ({
      ...previous,
      [imageSource]: true,
    }));
  };

  return (
    <Box
      id={`trickster-coin-card-${benefit.id}`}
      data-benefit-id={benefit.id}
      sx={{
        border: '1px solid var(--border-primary)',
        borderRadius: 3,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(16, 24, 39, 0.92), rgba(7, 10, 18, 0.96))',
        boxShadow: 'var(--shadow-md)',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          borderColor: 'var(--border-hover)',
          transform: 'translateY(-2px)',
        },
        minHeight: 420,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: 174,
          borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
          background: 'linear-gradient(135deg, rgba(111, 45, 168, 0.32), rgba(0, 217, 255, 0.08))',
        }}
      >
        {shouldRenderImage ? (
          <Box
            component="img"
            key={`trickster-coin-image-${imageSource}`}
            src={imageSource}
            alt={benefit.nome}
            onError={handleImageError}
            onLoad={() => {
              if (failedImageUrls[imageSource]) {
                setFailedImageUrls(previous => ({ ...previous, [imageSource]: false }));
              }
            }}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              color: 'var(--color-accent)',
              background: 'radial-gradient(circle at center, rgba(0,217,255,0.1), rgba(15,23,42,0.2))',
              fontSize: 14,
              textAlign: 'center',
              px: 2,
              gap: 0.75,
            }}
          >
            <Box sx={{ fontSize: 34, lineHeight: 1 }}>🪙</Box>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
              {imageSource ? 'Imagem indisponível' : 'Sem imagem'}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(5,8,16,0.14), rgba(5,8,16,0.4))',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1,
            zIndex: 1,
          }}
        >
          <Chip
            label={benefit.tag || 'Sem tag'}
            size="small"
            sx={{
              background: 'rgba(15, 23, 42, 0.82)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              maxWidth: '75%',
              '& .MuiChip-label': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
          />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              background: 'rgba(15, 23, 42, 0.72)',
              border: '1px solid var(--border-primary)',
              borderRadius: 999,
              px: 0.75,
              py: 0.4,
            }}
          >
            <MonetizationOnOutlinedIcon
              sx={{ fontSize: 14, color: 'var(--color-accent)' }}
            />
            <Typography variant="caption" sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              {benefit.custo ?? 0}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            zIndex: 1,
            display: 'flex',
            gap: 0.5,
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.72)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 999,
            p: 0.5,
          }}
        >
          <Tooltip title="Editar benefício">
            <IconButton
              size="small"
              onClick={onEdit}
              aria-label={`Editar benefício ${benefit.nome}`}
              sx={{
                color: 'var(--color-accent)',
                '&:hover': { color: 'var(--color-accent)' },
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Duplicar benefício">
            <IconButton
              size="small"
              onClick={onDuplicate}
              aria-label={`Duplicar benefício ${benefit.nome}`}
              disabled={duplicating}
              sx={{
                color: duplicating ? 'var(--text-muted)' : 'var(--text-secondary)',
                '&:hover': { color: duplicating ? 'var(--text-muted)' : 'var(--text-primary)' },
              }}
            >
              <ContentCopyOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir benefício">
            <IconButton
              size="small"
              onClick={onDelete}
              aria-label={`Excluir benefício ${benefit.nome}`}
              sx={{
                color: '#fca5a5',
                '&:hover': { color: '#f87171' },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          gap: 1.25,
          minHeight: 246,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'var(--text-primary)',
              fontWeight: 700,
              lineHeight: 1.25,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
            }}
          >
            {benefit.nome}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          <Chip
            label={getBonusSummaryChip(benefit)}
            size="small"
            sx={{
              ...bonusStyles,
              border: '1px solid',
              fontWeight: 700,
              '& .MuiChip-label': { px: 1 },
            }}
          />
          <Chip
            label={benefit.status || 'Ativo'}
            size="small"
            sx={{
              ...statusStyles,
              border: '1px solid',
              fontWeight: 700,
              '& .MuiChip-label': { px: 1 },
            }}
          />
          {benefit.acumulavel !== undefined && (
            <Chip
              label={benefit.acumulavel ? 'Acumulável' : 'Não acumulável'}
              size="small"
              sx={{
                background: benefit.acumulavel
                  ? 'rgba(96, 165, 250, 0.12)'
                  : 'rgba(148, 163, 184, 0.08)',
                border: '1px solid',
                borderColor: benefit.acumulavel
                  ? 'rgba(96, 165, 250, 0.28)'
                  : 'rgba(148, 163, 184, 0.16)',
                color: benefit.acumulavel ? '#bfdbfe' : 'var(--text-secondary)',
                fontWeight: 700,
                '& .MuiChip-label': { px: 1 },
              }}
            />
          )}
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: 'var(--text-secondary)',
            minHeight: 64,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5,
            textAlign: 'left',
          }}
        >
          {benefit.descricao}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
            p: 1.25,
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
            Bônus
          </Typography>

          {bonusEntries.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              Efeito do benefício ainda não informado.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {bonusPreview.map((bonusEntry, index) => (
                <Box
                  key={`${bonusEntry.tipo}-${index}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                  }}
                >
                  <Box component="span" sx={{ color: 'var(--color-accent)' }}>⚡</Box>
                  <Box component="span" sx={{ flex: 1, wordBreak: 'break-word' }}>
                    {bonusEntry.texto}
                  </Box>
                </Box>
              ))}
              {extraBonusCount > 0 && (
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                  +{extraBonusCount} bônus
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
            mt: 'auto',
          }}
        >
          {tokens.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {tokens.map(token => (
                <Chip
                  key={`${benefit.id}-${token}`}
                  label={token}
                  size="small"
                  sx={{
                    background: 'rgba(14, 165, 233, 0.12)',
                    color: '#bae6fd',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    fontWeight: 600,
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

TricksterCoinCard.propTypes = {
  benefit: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nome: PropTypes.string,
    tag: PropTypes.string,
    descricao: PropTypes.string,
    bonus: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    tipoBonus: PropTypes.string,
    custo: PropTypes.number,
    tokens: PropTypes.number,
    acumulavel: PropTypes.bool,
    status: PropTypes.string,
    linkImagem: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func,
  onDuplicate: PropTypes.func,
  onDelete: PropTypes.func,
  duplicating: PropTypes.bool,
};

export default TricksterCoinCard;
