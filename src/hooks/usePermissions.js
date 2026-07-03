import { useState, useEffect, useCallback } from 'react';
import { getUserPermissions } from 'service/storage';

const usePermissions = currentUser => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [allowedUniversos, setAllowedUniversos] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setIsAdmin(false);
      setAllowedUniversos([]);
      setLoadingPermissions(false);
      return;
    }

    setLoadingPermissions(true);
    getUserPermissions(currentUser.uid)
      .then(({ isAdmin: admin, universos }) => {
        setIsAdmin(admin);
        setAllowedUniversos(universos);
      })
      .catch(() => {
        setIsAdmin(false);
        setAllowedUniversos([]);
      })
      .finally(() => setLoadingPermissions(false));
  }, [currentUser]);

  /**
   * Retorna true se o usuário pode criar/editar/deletar em pelo menos um universo.
   * Preparado para reutilização em Classes, NPCs e Mesas quando eles ganharem campo universo.
   */
  const canCreate = useCallback(
    () => isAdmin || allowedUniversos.length > 0,
    [isAdmin, allowedUniversos],
  );

  /**
   * Retorna true se o usuário pode escrever em um universo específico.
   * @param {string} universoId - ID do documento na coleção Universo
   */
  const canWrite = useCallback(
    universoId => isAdmin || allowedUniversos.includes(universoId),
    [isAdmin, allowedUniversos],
  );

  return { isAdmin, allowedUniversos, loadingPermissions, canCreate, canWrite };
};

export default usePermissions;
