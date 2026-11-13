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

const normalizeItems = items =>
  (items || [])
    .filter(Boolean)
    .map(item => (typeof item === 'string' ? { label: item } : item));

const tokenPillSx = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.6,
  padding: '7px 10px',
  borderRadius: 999,
  background: 'linear-gradient(135deg, rgba(11, 16, 32, 0.92), rgba(21, 28, 47, 0.88))',
  border: '1px solid rgba(76, 201, 240, 0.24)',
  color: 'var(--text-primary)',
  fontSize: '0.74rem',
  fontWeight: 600,
  letterSpacing: '0.02em',
  whiteSpace: 'normal',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  maxWidth: '100%',
  boxShadow: '0 10px 24px rgba(7, 10, 20, 0.28), inset 0 1px 0 rgba(255,255,255,0.04)',
  backdropFilter: 'blur(12px)',
  transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
  '&:hover': {
    transform: 'translateY(-1px) scale(1.03)',
    boxShadow: '0 12px 28px rgba(76, 201, 240, 0.16), inset 0 1px 0 rgba(255,255,255,0.04)',
    borderColor: 'rgba(124, 58, 237, 0.48)',
  },
};

export const UniverseCountBadge = ({
  universoIds = [],
  universos = [],
  emptyLabel = 'Sem universo vinculado',
}) => {
  const linkedUniversos = useMemo(() => {
    const normalizedIds = Array.isArray(universoIds) ? universoIds : [];

    if (!normalizedIds.length) {
      return [];
    }

    return universos
      .filter(universo => normalizedIds.includes(universo.id))
      .map(universo => universo.Nome || universo.nome || universo.id);
  }, [universoIds, universos]);

  const count = linkedUniversos.length;
  const summaryLabel =
    count === 0 ? emptyLabel : `${count} ${count === 1 ? 'universo' : 'universos'}`;

  const tooltipContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        minWidth: 180,
        maxWidth: 260,
        p: 0.25,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: 'var(--color-accent)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Universos vinculados
      </Typography>

      {count === 0 ? (
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          Nenhum universo vinculado.
        </Typography>
      ) : (
        linkedUniversos.map((nome, index) => (
          <Typography
            key={`${nome}-${index}`}
            variant="body2"
            sx={{
              color: 'var(--text-primary)',
              whiteSpace: 'normal',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
              lineHeight: 1.4,
            }}
          >
            {nome}
          </Typography>
        ))
      )}
    </Box>
  );

  return (
    <Tooltip title={tooltipContent} placement="top" arrow disableInteractive>
      <Box
        component="button"
        type="button"
        tabIndex={0}
        aria-label={
          count === 0
            ? 'Sem universos vinculados'
            : `Universos vinculados: ${summaryLabel}`
        }
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.6,
          px: 1.1,
          py: 0.55,
          borderRadius: 999,
          border: '1px solid rgba(234, 179, 8, 0.42)',
          background:
            'linear-gradient(135deg, rgba(18, 25, 38, 0.95), rgba(25, 32, 49, 0.9))',
          color: 'var(--text-primary)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          cursor: 'pointer',
          transition: 'transform 180ms ease, border-color 180ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            borderColor: 'rgba(234, 179, 8, 0.7)',
          },
          '&:focus-visible': {
            outline: '2px solid rgba(234, 179, 8, 0.7)',
            outlineOffset: '2px',
          },
        }}
      >
        <Box component="span" sx={{ fontSize: '0.72rem', lineHeight: 1 }}>
          ◎
        </Box>
        <Box
          component="span"
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}
        >
          {summaryLabel}
        </Box>
      </Box>
    </Tooltip>
  );
};

UniverseCountBadge.propTypes = {
  universoIds: PropTypes.arrayOf(PropTypes.string),
  universos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      Nome: PropTypes.string,
      nome: PropTypes.string,
    }),
  ),
  emptyLabel: PropTypes.string,
};

UniverseCountBadge.defaultProps = {
  universoIds: [],
  universos: [],
  emptyLabel: 'Sem universo vinculado',
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
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
              gap: 0.75,
              alignItems: 'center',
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            {visibleItems.map((item, index) => (
              <Box
                key={`${item.label}-${index}`}
                component="span"
                sx={{
                  ...tokenPillSx,
                  boxShadow: '0 6px 18px rgba(7, 10, 20, 0.18)',
                }}
              >
                {item.label}
              </Box>
            ))}
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
              <Tooltip title={isExpanded ? 'Recolher tokens' : 'Expandir tokens'}>
                <IconButton
                  size="small"
                  onClick={() => setIsExpanded(value => !value)}
                  aria-label={isExpanded ? 'Recolher tokens' : 'Expandir tokens'}
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
                  <Box component="span" sx={{ fontSize: '1rem', lineHeight: 1 }}>
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
              gap: 0.75,
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              maxHeight: isExpanded ? 220 : 0,
              opacity: isExpanded ? 1 : 0,
              overflow: 'hidden',
              transition: 'max-height 260ms ease, opacity 220ms ease, transform 220ms ease',
              transform: isExpanded ? 'translateY(0)' : 'translateY(-6px)',
            }}
          >
            {hiddenItems.map((item, index) => (
              <Box
                key={`${item.label}-${index}`}
                component="span"
                sx={{
                  ...tokenPillSx,
                  boxShadow: '0 6px 18px rgba(7, 10, 20, 0.18)',
                }}
              >
                {item.label}
              </Box>
            ))}
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
              background: 'linear-gradient(135deg, rgba(11, 16, 32, 0.97), rgba(17, 24, 39, 0.96) 60%, rgba(21, 28, 47, 0.98))',
              border: '1px solid rgba(124, 58, 237, 0.28)',
              boxShadow: '0 24px 70px rgba(5, 8, 22, 0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
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
            background: 'linear-gradient(90deg, rgba(76, 201, 240, 0.08), rgba(124, 58, 237, 0.06))',
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1.15 }}>
              Tokens
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.35 }}>
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
              transition: 'transform 220ms ease, box-shadow 220ms ease, color 220ms ease',
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
        <DialogContent sx={{ px: { xs: 2.25, sm: 3 }, pt: { xs: 3, sm: 3.25 }, pb: { xs: 2, sm: 2.5 }, background: 'rgba(255,255,255,0.015)' }}>
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
            {normalizedItems.map((item, index) => (
              <Box
                key={`${item.label}-${index}`}
                component="span"
                sx={{
                  ...tokenPillSx,
                  background: 'linear-gradient(135deg, rgba(11, 16, 32, 0.94), rgba(20, 28, 46, 0.9))',
                  borderColor: 'rgba(96, 165, 250, 0.24)',
                }}
              >
                {item.label}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <Box
          sx={{
            px: { xs: 2.25, sm: 3 },
            py: 1.5,
            borderTop: '1px solid rgba(76, 201, 240, 0.14)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.02), rgba(76, 201, 240, 0.05))',
          }}
        >
          <Box
            component="button"
            onClick={() => setIsModalOpen(false)}
            sx={{
              border: '1px solid rgba(76, 201, 240, 0.24)',
              background: 'linear-gradient(135deg, rgba(11, 16, 32, 0.9), rgba(21, 28, 47, 0.92))',
              color: 'var(--text-primary)',
              px: 2.25,
              py: 1,
              borderRadius: 999,
              fontSize: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.03em',
              boxShadow: '0 10px 24px rgba(7, 10, 20, 0.28)',
              backdropFilter: 'blur(10px)',
              transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
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
