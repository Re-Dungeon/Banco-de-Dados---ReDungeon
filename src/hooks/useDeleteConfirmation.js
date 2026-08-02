import React, { useCallback, useState } from 'react';
import DeleteConfirmationDialog from 'components/DeleteConfirmationDialog/DeleteConfirmationDialog';
import { shouldShowDeleteConfirmation } from 'common/utils/deleteConfirmation';

const useDeleteConfirmation = () => {
  const [dialogState, setDialogState] = useState({
    open: false,
    itemName: '',
    onConfirm: null,
  });

  const closeDialog = useCallback(() => {
    setDialogState({ open: false, itemName: '', onConfirm: null });
  }, []);

  const confirmDelete = useCallback((itemName, onConfirm) => {
    if (!shouldShowDeleteConfirmation()) {
      onConfirm();
      return;
    }

    setDialogState({ open: true, itemName, onConfirm });
  }, []);

  const handleConfirm = useCallback(() => {
    dialogState.onConfirm?.();
    closeDialog();
  }, [closeDialog, dialogState]);

  const deleteConfirmationDialog = React.createElement(DeleteConfirmationDialog, {
    open: dialogState.open,
    itemName: dialogState.itemName,
    onClose: closeDialog,
    onConfirm: handleConfirm,
  });

  return { confirmDelete, deleteConfirmationDialog };
};

export default useDeleteConfirmation;
