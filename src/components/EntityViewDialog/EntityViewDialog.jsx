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
 * Dialog de visualização repetido em toda página de listagem de entidade:
 * título + subtítulo (ex. universo/raridade), imagem opcional e descrição.
 * Conteúdo específico de cada entidade (atributos, habilidades, etc.) entra
 * via `children`, renderizado logo após a descrição.
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
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    /* Aumenta largura máxima do modal para visualização mais ampla */
    maxWidth="lg"
    fullWidth
    slotProps={{
      paper: {
        sx: {
          background: 'rgba(5, 8, 20, 0.95)',
          border: '1px solid rgba(96, 165, 250, 0.18)',
          borderRadius: 3,
          boxShadow: '0 34px 68px rgba(0, 0, 0, 0.38)',
          overflow: 'hidden',
          maxWidth: '1100px',
          width: '100%',
        },
      },
    }}
  >
    {(titulo || subtitulo) && (
      <DialogTitle
        sx={{
          color: 'var(--text-primary)',
          fontWeight: 700,
          pb: 1,
          pt: 2,
          px: 3,
          lineHeight: 1.1,
        }}
      >
        {titulo}
        {subtitulo && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: 'var(--color-accent)',
              fontWeight: 600,
              mt: 0.75,
            }}
          >
            {subtitulo}
          </Typography>
        )}
      </DialogTitle>
    )}
    <DialogContent
      dividers
      sx={{
        borderColor: 'rgba(96, 165, 250, 0.12)',
        px: 3,
        pt: 2,
        pb: 0,
        background: 'rgba(4, 10, 24, 0.99)',
      }}
    >
      {imagem && (
        <Box
          component="img"
          src={imagem}
          alt={titulo}
          sx={{
            width: '100%',
            height: 200,
            borderRadius: 2,
            objectFit: 'cover',
            display: 'block',
            border: '1px solid var(--border-primary)',
            mb: 2,
            ...imagemSx,
          }}
          onError={e => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      {descricao && (
        <>
          <Typography
            variant="subtitle2"
            sx={{
              color: 'var(--color-accent)',
              fontWeight: 700,
              mb: 0.5,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: '0.72rem',
            }}
          >
            Descrição
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'var(--text-secondary)', mb: 2 }}
          >
            {descricao}
          </Typography>
        </>
      )}
      {children}
    </DialogContent>
    <DialogActions
      sx={{
        px: 3,
        py: 2,
        borderTop: '1px solid rgba(96, 165, 250, 0.12)',
        justifyContent: 'flex-end',
        gap: 1,
      }}
    >
      <Button
        onClick={onClose}
        sx={{
          color: 'var(--text-primary)',
          border: '1px solid rgba(96, 165, 250, 0.18)',
          boxShadow: '0 8px 18px rgba(0, 0, 0, 0.18)',
          textTransform: 'none',
          px: 3,
          py: 1,
          '&:hover': {
            background: 'rgba(96, 165, 250, 0.08)',
            color: 'var(--text-primary)',
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
};

export default EntityViewDialog;
