import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

/**
 * Dialog de visualização repetido em toda página de listagem de entidade.
 * Mantém a lógica existente, mas oferece uma camada visual premium para
 * permitir headers e hero banners personalizados quando necessário.
 */
const EntityViewDialog = ({
  open,
  onClose,
  titulo = null,
  subtitulo = null,
  imagem = null,
  imagemSx = null,
  descricao = null,
  children = null,
  actions = null,
  headerContent = null,
  heroContent = null,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="lg"
    fullWidth
    slotProps={{
      paper: {
        sx: {
          background: 'rgba(4, 8, 20, 0.96)',
          border: '1px solid rgba(111, 45, 168, 0.22)',
          borderRadius: 4,
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          maxWidth: '1180px',
          width: '100%',
          backdropFilter: 'blur(18px)',
        },
      },
    }}
  >
    {(titulo || subtitulo || headerContent) && (
      <DialogTitle
        sx={{
          px: { xs: 2.4, md: 3.2 },
          pt: { xs: 2.4, md: 3 },
          pb: { xs: 1.4, md: 1.8 },
          background:
            'linear-gradient(135deg, rgba(20, 35, 70, 0.95) 0%, rgba(25, 35, 65, 0.92) 50%, rgba(30, 20, 55, 0.94) 100%)',
          borderBottom: '1px solid rgba(0, 217, 255, 0.12)',
          color: '#fff',
          lineHeight: 1.15,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 24,
            right: 24,
            bottom: 0,
            height: 2,
            background:
              'linear-gradient(90deg, rgba(0, 217, 255, 0.35), rgba(111, 45, 168, 0.5), transparent)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {titulo && (
              <Typography
                variant="h4"
                sx={{
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: { xs: '1.55rem', md: '2rem' },
                  letterSpacing: '0.02em',
                  lineHeight: 1.1,
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                }}
              >
                {titulo}
              </Typography>
            )}
            {subtitulo && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: 'var(--color-accent)',
                  fontWeight: 700,
                  mt: 0.9,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                }}
              >
                {subtitulo}
              </Typography>
            )}
          </Box>
          {headerContent && (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                ml: 'auto',
                alignItems: 'center',
              }}
            >
              {headerContent}
            </Box>
          )}
        </Box>
      </DialogTitle>
    )}
    <DialogContent
      dividers
      sx={{
        px: { xs: 2.2, md: 3.2 },
        pt: { xs: 2.2, md: 2.8 },
        pb: { xs: 2.2, md: 2.8 },
        borderColor: 'rgba(111, 45, 168, 0.18)',
        background:
          'linear-gradient(180deg, rgba(7, 13, 27, 0.98) 0%, rgba(5, 9, 19, 0.96) 100%)',
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '999px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0, 217, 255, 0.28)',
          borderRadius: '999px',
          '&:hover': {
            background: 'rgba(0, 217, 255, 0.45)',
          },
        },
      }}
    >
      {(imagem || heroContent) && (
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3.5,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 18px 50px rgba(0, 0, 0, 0.28)',
            mb: 3,
            minHeight: { xs: 220, md: 280 },
            background:
              'linear-gradient(135deg, rgba(8, 13, 28, 0.98) 0%, rgba(15, 22, 40, 0.9) 100%)',
          }}
        >
          {imagem && (
            <Box
              component="img"
              src={imagem}
              alt={titulo || 'Imagem do conteúdo'}
              sx={{
                width: '100%',
                height: '100%',
                minHeight: { xs: 220, md: 280 },
                objectFit: 'cover',
                display: 'block',
                ...imagemSx,
              }}
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(3, 7, 15, 0.92) 0%, rgba(3, 7, 15, 0.72) 46%, rgba(3, 7, 15, 0.16) 100%)',
              display: 'flex',
              alignItems: 'flex-end',
              p: { xs: 2, md: 3 },
            }}
          >
            {heroContent}
          </Box>
        </Box>
      )}
      {descricao && (
        <Box
          sx={{
            mb: 2.5,
            p: 2,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              color: 'var(--color-accent)',
              fontWeight: 700,
              mb: 0.75,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              fontSize: '0.72rem',
            }}
          >
            Descrição
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
          >
            {descricao}
          </Typography>
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
        {children}
      </Box>
    </DialogContent>
    <DialogActions
      sx={{
        px: { xs: 2.2, md: 3.2 },
        py: 2,
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        justifyContent: 'flex-end',
        gap: 1,
        background: 'rgba(3, 7, 15, 0.92)',
      }}
    >
      <Button
        onClick={onClose}
        sx={{
          color: 'var(--text-primary)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.18)',
          textTransform: 'none',
          px: 2.4,
          py: 1,
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--text-primary)',
            transform: 'translateY(-1px)',
          },
        }}
      >
        Fechar
      </Button>
      {actions}
    </DialogActions>
  </Dialog>
);

EntityViewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  titulo: PropTypes.node,
  subtitulo: PropTypes.node,
  imagem: PropTypes.string,
  imagemSx: PropTypes.object,
  descricao: PropTypes.string,
  children: PropTypes.node,
  actions: PropTypes.node,
  headerContent: PropTypes.node,
  heroContent: PropTypes.node,
};

export default EntityViewDialog;
