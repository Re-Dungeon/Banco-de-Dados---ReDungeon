export const pageHeaderSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
  mb: 3,
  px: 2.5,
  py: 2,
  borderRadius: 2,
  background: 'rgba(11, 16, 32, 0.72)',
  border: '1px solid var(--border-primary)',
  boxShadow: 'var(--shadow-md)',
  width: '100%',
  flexWrap: 'wrap',
  '@media (max-width: 640px)': {
    alignItems: 'stretch',
    flexDirection: 'column',
    px: 2,
  },
};

export const pageHeaderTitleSx = {
  color: 'var(--text-primary)',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  lineHeight: 1.2,
  mb: 0.5,
};

export const pageHeaderDescriptionSx = {
  color: 'var(--text-secondary)',
  lineHeight: 1.5,
};

export const pageHeaderActionsSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 1.5,
  flexWrap: 'wrap',
  ml: 'auto',
};
