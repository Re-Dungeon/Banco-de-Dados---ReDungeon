import React, { useCallback, useState } from 'react';
import DeleteConfirmationDialog from 'components/DeleteConfirmationDialog/DeleteConfirmationDialog';
import { shouldShowDeleteConfirmation } from 'common/utils/deleteConfirmation';

const useDeleteConfirmation = () => {
  const [dialogState, setDialogState] = useState({
    open: false,
    itemName: '',
    message: '',
    onConfirm: null,
    title: 'Confirmar exclusão',
    confirmText: 'Excluir',
  });

  const closeDialog = useCallback(() => {
    setDialogState({
      open: false,
      itemName: '',
      message: '',
      onConfirm: null,
      title: 'Confirmar exclusão',
      confirmText: 'Excluir',
    });
  }, []);

  const confirmDelete = useCallback(
    (itemName, onConfirm, message = '', options = {}) => {
      if (!shouldShowDeleteConfirmation()) {
        onConfirm();
        return;
      }

      setDialogState({
        open: true,
        itemName,
        message,
        onConfirm,
        title: options.title || 'Confirmar exclusão',
        confirmText: options.confirmText || 'Excluir',
      });
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    dialogState.onConfirm?.();
    closeDialog();
  }, [closeDialog, dialogState]);

  const deleteConfirmationDialog = dialogState.open ? (
    <DeleteConfirmationDialog
      open={dialogState.open}
      itemName={dialogState.itemName}
      message={dialogState.message}
      onClose={closeDialog}
      onConfirm={handleConfirm}
      title={dialogState.title}
      confirmText={dialogState.confirmText}
    />
  ) : null;

  return { confirmDelete, deleteConfirmationDialog };
};

export default useDeleteConfirmation;
