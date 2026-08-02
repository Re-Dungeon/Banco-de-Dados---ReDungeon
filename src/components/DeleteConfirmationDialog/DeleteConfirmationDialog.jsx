import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import {
  setDeleteConfirmationPreference,
  shouldShowDeleteConfirmation,
} from 'common/utils/deleteConfirmation';

const DeleteConfirmationDialog = ({
  open,
  itemName,
  onClose,
  onConfirm,
  title = 'Confirmar exclusão',
}) => {
  const [skipConfirmation, setSkipConfirmation] = useState(false);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (open) {
      setSkipConfirmation(!shouldShowDeleteConfirmation());
      setTimeout(() => cancelButtonRef.current?.focus(), 0);
    }
  }, [open]);

  const handleConfirm = () => {
    setDeleteConfirmationPreference(skipConfirmation);
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-modal="true"
      role="dialog"
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(1, 4, 10, 0.7)',
            backdropFilter: 'blur(10px)',
          },
        },
        paper: {
          sx: {
            width: { xs: 'calc(100vw - 32px)', md: 420 },
            maxWidth: 420,
            background: 'rgba(10, 15, 25, 0.92)',
            backdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            boxShadow: '0 28px 80px rgba(0, 0, 0, 0.55)',
            color: 'var(--text-primary)',
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          background:
            'linear-gradient(135deg, rgba(255,107,107,0.16) 0%, rgba(10, 15, 25, 0.95) 55%, rgba(20, 25, 43, 0.98) 100%)',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,107,107,0.16)',
            border: '1px solid rgba(255,107,107,0.35)',
            mb: 2,
          }}
        >
          <DeleteOutlineRoundedIcon sx={{ fontSize: 32, color: '#ff6b6b' }} />
        </Box>

        <Typography
          variant="h5"
          sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 1 }}
        >
          {title}
        </Typography>

        <Typography
          variant="body1"
          sx={{ color: 'var(--text-secondary)', lineHeight: 1.7, mb: 2.5 }}
        >
          Tem certeza de que deseja excluir este item? Esta ação pode não ser
          reversível.
          {itemName ? `
${itemName}` : ''}
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={skipConfirmation}
              onChange={event => setSkipConfirmation(event.target.checked)}
              sx={{
                color: 'rgba(255,255,255,0.35)',
                '&.Mui-checked': { color: '#ff6b6b' },
              }}
            />
          }
          label="Não mostrar esta confirmação novamente"
          sx={{
            color: 'var(--text-secondary)',
            mb: 3,
            alignSelf: 'flex-start',
          }}
        />

        <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
          <Button
            ref={cancelButtonRef}
            variant="outlined"
            onClick={onClose}
            sx={{
              flex: 1,
              color: 'var(--text-primary)',
              borderColor: 'rgba(255,255,255,0.16)',
              background: 'transparent',
              borderRadius: '999px',
              transition: 'all 180ms ease',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.28)',
                background: 'rgba(255,255,255,0.04)',
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            sx={{
              flex: 1,
              background: '#ff6b6b',
              color: '#fff',
              borderRadius: '999px',
              boxShadow: '0 12px 24px rgba(255,107,107,0.24)',
              transition: 'all 180ms ease',
              '&:hover': {
                background: '#ff5252',
                boxShadow: '0 14px 28px rgba(255,107,107,0.32)',
              },
            }}
          >
            Excluir
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

DeleteConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  itemName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
};

export default DeleteConfirmationDialog;
