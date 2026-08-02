const DELETE_CONFIRMATION_STORAGE_KEY = 'redungeon:skip_delete_confirmation';

export const shouldShowDeleteConfirmation = () => {
  if (typeof window === 'undefined') {
    return true;
  }

  const storedValue = window.localStorage.getItem(
    DELETE_CONFIRMATION_STORAGE_KEY,
  );

  return storedValue !== 'true';
};

export const setDeleteConfirmationPreference = value => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    DELETE_CONFIRMATION_STORAGE_KEY,
    String(value),
  );
};

export const resetDeleteConfirmationPreference = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(DELETE_CONFIRMATION_STORAGE_KEY);
};

export default DELETE_CONFIRMATION_STORAGE_KEY;
