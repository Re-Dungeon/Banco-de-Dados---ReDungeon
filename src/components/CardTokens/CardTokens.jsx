import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullOutlinedIcon from '@mui/icons-material/OpenInFullOutlined';

const CATEGORY_STYLES = {
  creator: {
    icon: '👑',
    accent: '#5be3ff',
    border: 'rgba(91, 227, 255, 0.34)',
    glow: 'rgba(91, 227, 255, 0.16)',
    background:
      'linear-gradient(135deg, rgba(8, 20, 38, 0.95), rgba(15, 31, 58, 0.9))',
    color: '#e8f8ff',
  },
  type: {
    icon: '⚔',
    accent: '#a68dff',
    border: 'rgba(166, 141, 255, 0.34)',
    glow: 'rgba(166, 141, 255, 0.16)',
    background:
      'linear-gradient(135deg, rgba(19, 14, 38, 0.95), rgba(29, 24, 55, 0.9))',
    color: '#f0ebff',
  },
  rarity: {
    icon: '✦',
    accent: '#f2c96d',
    border: 'rgba(242, 201, 109, 0.34)',
    glow: 'rgba(242, 201, 109, 0.16)',
    background:
      'linear-gradient(135deg, rgba(32, 24, 10, 0.95), rgba(46, 35, 16, 0.9))',
    color: '#fff5d7',
  },
  availability: {
    icon: '🏪',
    accent: '#7ce8b2',
    border: 'rgba(124, 232, 178, 0.34)',
    glow: 'rgba(124, 232, 178, 0.16)',
    background:
      'linear-gradient(135deg, rgba(8, 26, 20, 0.95), rgba(15, 38, 28, 0.9))',
    color: '#e7fff4',
  },
  default: {
    icon: '✧',
    accent: '#6ea9ff',
    border: 'rgba(110, 169, 255, 0.3)',
    glow: 'rgba(110, 169, 255, 0.14)',
    background:
      'linear-gradient(135deg, rgba(9, 18, 34, 0.95), rgba(17, 29, 49, 0.9))',
    color: '#eaf3ff',
  },
};

const TOKEN_PREFIXES = [
  { symbol: '👑', category: 'creator' },
  { symbol: '⚔', category: 'type' },
  { symbol: '✦', category: 'rarity' },
  { symbol: '⭐', category: 'rarity' },
  { symbol: '🏪', category: 'availability' },
];

const parseTokenString = rawValue => {
  const value = `${rawValue || ''}`.trim();

  for (const { symbol, category } of TOKEN_PREFIXES) {
    if (
      value === symbol ||
      value.startsWith(`${symbol} `) ||
      value.startsWith(symbol)
    ) {
      return {
        label: value.slice(symbol.length).trim() || symbol,
        category,
        icon: symbol,
      };
    }
  }

  return { label: value, category: 'default', icon: undefined };
};

const normalizeItems = items =>
  (items || []).filter(Boolean).map(item => {
    if (typeof item === 'string') {
      return parseTokenString(item);
    }

    const rawLabel = item.label || item.value || '';
    const parsed = parseTokenString(rawLabel);

    return {
      label: parsed.label,
      category: item.category || item.type || parsed.category,
      icon: item.icon || parsed.icon,
    };
  });

const getCategoryStyle = item =>
  CATEGORY_STYLES[item.category] || CATEGORY_STYLES.default;

const tokenPillSx = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.75,
  minHeight: 30,
  padding: '7px 12px',
  borderRadius: 2.4,
  background:
    'linear-gradient(135deg, rgba(11, 16, 32, 0.92), rgba(21, 28, 47, 0.88))',
  border: '1px solid rgba(76, 201, 240, 0.24)',
  color: 'var(--text-primary)',
  fontSize: '0.78rem',
  fontWeight: 600,
  letterSpacing: '0.03em',
  whiteSpace: 'normal',
  lineHeight: 1.15,
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  maxWidth: '100%',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 24px rgba(7, 10, 20, 0.28)',
  backdropFilter: 'blur(14px)',
  transition:
    'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    background:
      'linear-gradient(120deg, rgba(255,255,255,0.06) 0%, transparent 55%)',
    pointerEvents: 'none',
    opacity: 0.9,
  },
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 30px rgba(76, 201, 240, 0.16)',
    borderColor: 'rgba(124, 58, 237, 0.48)',
  },
};

const CardTokens = ({ items = [], maxVisible = 2 }) => {
  const normalizedItems = useMemo(() => normalizeItems(items), [items]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (normalizedItems.length === 0) {
    return null;
  }

  const hasOverflow = normalizedItems.length > maxVisible;
  const visibleItems = normalizedItems.slice(0, maxVisible);
  const hiddenItems = normalizedItems.slice(maxVisible);

  return (
    <>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1.25,
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.9,
              alignItems: 'center',
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            {visibleItems.map((item, index) => {
              const categoryStyle = getCategoryStyle(item);
              const icon = item.icon || categoryStyle.icon;

              return (
                <Box
                  key={`${item.label}-${index}`}
                  component="span"
                  sx={{
                    ...tokenPillSx,
                    background: categoryStyle.background,
                    borderColor: categoryStyle.border,
                    color: categoryStyle.color,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 24px ${categoryStyle.glow}`,
                    '&:hover': {
                      ...tokenPillSx['&:hover'],
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 30px ${categoryStyle.glow}`,
                      borderColor: categoryStyle.border,
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.88rem',
                      lineHeight: 1,
                      filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.18))',
                    }}
                  >
                    {icon}
                  </Box>
                  <Box component="span" sx={{ color: 'inherit' }}>
                    {item.label}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {hasOverflow && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                flexShrink: 0,
                alignSelf: 'flex-start',
              }}
            >
              <Tooltip
                title={isExpanded ? 'Recolher tokens' : 'Expandir tokens'}
              >
                <IconButton
                  size="small"
                  onClick={() => setIsExpanded(value => !value)}
                  aria-label={
                    isExpanded ? 'Recolher tokens' : 'Expandir tokens'
                  }
                  sx={{
                    color: 'var(--color-accent)',
                    padding: '4px',
                    minWidth: '28px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '999px',
                    transition: 'transform 220ms ease, text-shadow 220ms ease',
                    textShadow: '0 0 8px rgba(76, 201, 240, 0.35)',
                    '&:hover': {
                      color: 'var(--color-accent)',
                      transform: 'scale(1.06)',
                      textShadow: '0 0 16px rgba(76, 201, 240, 0.6)',
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{ fontSize: '1rem', lineHeight: 1 }}
                  >
                    {isExpanded ? '−' : '+'}
                  </Box>
                </IconButton>
              </Tooltip>

              <Tooltip title="Abrir lista completa">
                <IconButton
                  size="small"
                  onClick={() => setIsModalOpen(true)}
                  aria-label="Abrir lista completa"
                  sx={{
                    color: 'var(--color-accent)',
                    padding: '4px',
                    minWidth: '28px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '999px',
                    transition: 'transform 220ms ease, text-shadow 220ms ease',
                    textShadow: '0 0 8px rgba(76, 201, 240, 0.35)',
                    '&:hover': {
                      color: 'var(--color-accent)',
                      transform: 'scale(1.06)',
                      textShadow: '0 0 16px rgba(76, 201, 240, 0.6)',
                    },
                  }}
                >
                  <OpenInFullOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        {hasOverflow && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.9,
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              maxHeight: isExpanded ? 220 : 0,
              opacity: isExpanded ? 1 : 0,
              overflow: 'hidden',
              transition:
                'max-height 260ms ease, opacity 220ms ease, transform 220ms ease',
              transform: isExpanded ? 'translateY(0)' : 'translateY(-6px)',
            }}
          >
            {hiddenItems.map((item, index) => {
              const categoryStyle = getCategoryStyle(item);
              const icon = item.icon || categoryStyle.icon;

              return (
                <Box
                  key={`${item.label}-${index}`}
                  component="span"
                  sx={{
                    ...tokenPillSx,
                    background: categoryStyle.background,
                    borderColor: categoryStyle.border,
                    color: categoryStyle.color,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 24px ${categoryStyle.glow}`,
                    '&:hover': {
                      ...tokenPillSx['&:hover'],
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 30px ${categoryStyle.glow}`,
                      borderColor: categoryStyle.border,
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.88rem',
                      lineHeight: 1,
                      filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.18))',
                    }}
                  >
                    {icon}
                  </Box>
                  <Box component="span" sx={{ color: 'inherit' }}>
                    {item.label}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="card-tokens-dialog-title"
        transitionDuration={280}
        slotProps={{
          paper: {
            sx: {
              background:
                'linear-gradient(135deg, rgba(11, 16, 32, 0.97), rgba(17, 24, 39, 0.96) 60%, rgba(21, 28, 47, 0.98))',
              border: '1px solid rgba(124, 58, 237, 0.28)',
              boxShadow:
                '0 24px 70px rgba(5, 8, 22, 0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
              backdropFilter: 'blur(18px)',
              borderRadius: 4,
              overflow: 'hidden',
              width: { xs: '95%', sm: '90%', md: '760px' },
              maxHeight: { xs: '80vh', sm: '70vh' },
            },
          },
        }}
      >
        <DialogTitle
          id="card-tokens-dialog-title"
          sx={{
            color: 'var(--text-primary)',
            px: { xs: 2.25, sm: 3 },
            py: { xs: 2, sm: 2.5 },
            borderBottom: '1px solid rgba(76, 201, 240, 0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            background:
              'linear-gradient(90deg, rgba(76, 201, 240, 0.08), rgba(124, 58, 237, 0.06))',
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                letterSpacing: '0.02em',
                lineHeight: 1.15,
              }}
            >
              Tokens
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'var(--text-secondary)', mt: 0.35 }}
            >
              {normalizedItems.length} categorias relacionadas
            </Typography>
          </Box>
          <IconButton
            aria-label="Fechar lista completa"
            onClick={() => setIsModalOpen(false)}
            sx={{
              color: 'var(--text-secondary)',
              border: '1px solid rgba(76, 201, 240, 0.18)',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(8px)',
              transition:
                'transform 220ms ease, box-shadow 220ms ease, color 220ms ease',
              '&:hover': {
                color: 'var(--color-accent)',
                transform: 'rotate(90deg) scale(1.05)',
                boxShadow: '0 0 16px rgba(76, 201, 240, 0.16)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            px: { xs: 2.25, sm: 3 },
            pt: { xs: 3, sm: 3.25 },
            pb: { xs: 2, sm: 2.5 },
            background: 'rgba(255,255,255,0.015)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.1,
              alignItems: 'center',
              justifyContent: 'flex-start',
              maxHeight: { xs: '62vh', sm: '58vh' },
              overflowY: 'auto',
              pr: 0.75,
              py: 0.5,
            }}
          >
            {normalizedItems.map((item, index) => {
              const categoryStyle = getCategoryStyle(item);
              const icon = item.icon || categoryStyle.icon;

              return (
                <Box
                  key={`${item.label}-${index}`}
                  component="span"
                  sx={{
                    ...tokenPillSx,
                    background: categoryStyle.background,
                    borderColor: categoryStyle.border,
                    color: categoryStyle.color,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 24px ${categoryStyle.glow}`,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.88rem',
                      lineHeight: 1,
                      filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.18))',
                    }}
                  >
                    {icon}
                  </Box>
                  <Box component="span" sx={{ color: 'inherit' }}>
                    {item.label}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </DialogContent>
        <Box
          sx={{
            px: { xs: 2.25, sm: 3 },
            py: 1.5,
            borderTop: '1px solid rgba(76, 201, 240, 0.14)',
            display: 'flex',
            justifyContent: 'flex-end',
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.02), rgba(76, 201, 240, 0.05))',
          }}
        >
          <Box
            component="button"
            onClick={() => setIsModalOpen(false)}
            sx={{
              border: '1px solid rgba(76, 201, 240, 0.24)',
              background:
                'linear-gradient(135deg, rgba(11, 16, 32, 0.9), rgba(21, 28, 47, 0.92))',
              color: 'var(--text-primary)',
              px: 2.25,
              py: 1,
              borderRadius: 999,
              fontSize: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.03em',
              boxShadow: '0 10px 24px rgba(7, 10, 20, 0.28)',
              backdropFilter: 'blur(10px)',
              transition:
                'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 0 18px rgba(76, 201, 240, 0.18)',
                borderColor: 'rgba(124, 58, 237, 0.44)',
              },
            }}
          >
            Fechar
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

CardTokens.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
      }),
    ]),
  ),
  maxVisible: PropTypes.number,
};

CardTokens.defaultProps = {
  items: [],
  maxVisible: 2,
};

export default CardTokens;
