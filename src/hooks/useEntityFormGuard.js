import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import useUniversos from './useUniversos';

/**
 * Encapsula o padrão repetido em toda página `Nova*`/`Novo*`: buscar os
 * universos (via `useUniversos`, com cache de módulo), filtrar por
 * `allowedUniversos`/`isAdmin` e redirecionar para `routeOnDeny` caso o
 * usuário não tenha permissão de criar (item novo) ou editar (item
 * existente, avaliado contra `universoDoItem`).
 * @param {{ itemParaEditar: object|null, universoDoItem?: string|string[], routeOnDeny: string, permitirEdicaoParcial?: boolean }} params
 * `permitirEdicaoParcial` libera o acesso à edição mesmo sem overlap com
 * `universoDoItem` quando o usuário pode criar em algum universo — usado por
 * entidades multi-universo (ex.: Aptidões) cujas regras do Firestore
 * permitem associar/desassociar o próprio universo de um doc já existente
 * (`canTogglePartialUniverso`), mesmo sem acesso aos demais universos dele.
 */
const useEntityFormGuard = ({
  itemParaEditar,
  universoDoItem,
  routeOnDeny,
  permitirEdicaoParcial = false,
}) => {
  const navigate = useNavigate();
  const { canCreate, canWrite, isAdmin, allowedUniversos, loadingPermissions } =
    useAuth();
  const { universos, loadingUniversos } = useUniversos();
  const isEditing = Boolean(itemParaEditar);

  useEffect(() => {
    if (loadingPermissions) return;
    const allowed = isEditing
      ? canWrite(universoDoItem) || (permitirEdicaoParcial && canCreate())
      : canCreate();
    if (!allowed) navigate(routeOnDeny);
  }, [
    loadingPermissions,
    isEditing,
    canWrite,
    canCreate,
    universoDoItem,
    permitirEdicaoParcial,
    navigate,
    routeOnDeny,
  ]);

  const universosFiltrados = isAdmin
    ? universos
    : universos.filter(u => allowedUniversos.includes(u.id));

  return { universos: universosFiltrados, loadingUniversos, isEditing };
};

export default useEntityFormGuard;
