import { useEffect, useState } from 'react';
import { getUniversos } from 'service/storage';

let universosCache = null;
let inFlightRequest = null;

/**
 * Invalida o cache de módulo do useUniversos.
 * Chamar depois de criar/editar/remover um Universo, para que a próxima
 * leitura busque dados atualizados do Firestore em vez do cache.
 */
export const invalidateUniversosCache = () => {
  universosCache = null;
};

/**
 * Busca a coleção `Universo` uma única vez por sessão (cache em nível de
 * módulo compartilhado entre todas as páginas que usam este hook), evitando
 * uma leitura Firestore redundante a cada navegação.
 */
const useUniversos = () => {
  const [universos, setUniversos] = useState(universosCache ?? []);
  const [loadingUniversos, setLoadingUniversos] = useState(
    universosCache === null,
  );

  const updateUniversos = nextData => {
    const normalized = Array.isArray(nextData) ? nextData : [];
    universosCache = normalized;
    setUniversos(normalized);
    setLoadingUniversos(false);
    return normalized;
  };

  const refreshUniversos = async (forceReload = false) => {
    if (!forceReload && universosCache !== null) {
      setUniversos(universosCache);
      setLoadingUniversos(false);
      return universosCache;
    }

    setLoadingUniversos(true);
    const data = await getUniversos();
    universosCache = data;
    setUniversos(data);
    setLoadingUniversos(false);
    return data;
  };

  useEffect(() => {
    if (universosCache !== null) {
      return undefined;
    }

    if (!inFlightRequest) {
      inFlightRequest = getUniversos().finally(() => {
        inFlightRequest = null;
      });
    }

    let active = true;
    inFlightRequest.then(data => {
      universosCache = data;
      if (active) {
        setUniversos(data);
        setLoadingUniversos(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return { universos, loadingUniversos, refreshUniversos, updateUniversos };
};

export default useUniversos;
