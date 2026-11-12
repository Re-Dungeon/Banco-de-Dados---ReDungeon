import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { normalizeSupportTicketCategory } from 'common/utils/supportTickets';
import { auth, db } from './firebase';

// ── Helpers genéricos de CRUD Firestore ─────────────────────────────────────
// Toda entidade abaixo (classes, materiais, raças, itens, receitas, condições,
// artes, origens, regras, cardflux, veias astrais) segue este mesmo padrão de
// 4 operações; os blocos por entidade são apenas wrappers finos com o nome da
// coleção certa, para manter a API pública (`getRacas()`, `addRaca()`, etc.).

const getFirestoreItems = async collectionName => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Erro ao buscar itens de "${collectionName}":`, error);
    throw error;
  }
};

const addFirestoreItem = async (collectionName, item) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...item,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...item };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Erro ao adicionar item em "${collectionName}":`, error);
    throw error;
  }
};

const updateFirestoreItem = async (collectionName, id, updates) => {
  try {
    await updateDoc(doc(db, collectionName, id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `Erro ao atualizar item "${id}" em "${collectionName}":`,
      error,
    );
    throw error;
  }
};

const removeFirestoreItem = async (collectionName, id) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `Erro ao remover item "${id}" em "${collectionName}":`,
      error,
    );
    throw error;
  }
};

// ── Classes (Firestore) ──────────────────────────────────────────────────────
const CLASSES_COLLECTION = 'classes';

export const getClasses = () => getFirestoreItems(CLASSES_COLLECTION);
export const addClasse = classe => addFirestoreItem(CLASSES_COLLECTION, classe);
export const removeClasse = id => removeFirestoreItem(CLASSES_COLLECTION, id);
export const updateClasse = (id, updates) =>
  updateFirestoreItem(CLASSES_COLLECTION, id, updates);

// ── Materiais (Firestore) ─────────────────────────────────────────────────────
const MATERIAIS_COLLECTION = 'materiais';

export const getMateriais = () => getFirestoreItems(MATERIAIS_COLLECTION);
export const addMaterial = material =>
  addFirestoreItem(MATERIAIS_COLLECTION, material);
export const removeMaterial = id =>
  removeFirestoreItem(MATERIAIS_COLLECTION, id);
export const updateMaterial = (id, updates) =>
  updateFirestoreItem(MATERIAIS_COLLECTION, id, updates);

// ── Raças (Firestore) ────────────────────────────────────────────────────────
const RACAS_COLLECTION = 'racas';

export const getRacas = () => getFirestoreItems(RACAS_COLLECTION);
export const addRaca = raca => addFirestoreItem(RACAS_COLLECTION, raca);
export const removeRaca = id => removeFirestoreItem(RACAS_COLLECTION, id);
export const updateRaca = (id, updates) =>
  updateFirestoreItem(RACAS_COLLECTION, id, updates);

// ── Itens (Firestore) ────────────────────────────────────────────────────────
const ITENS_COLLECTION = 'itens';

export const getItens = () => getFirestoreItems(ITENS_COLLECTION);
export const addIten = item => addFirestoreItem(ITENS_COLLECTION, item);
export const removeIten = id => removeFirestoreItem(ITENS_COLLECTION, id);
export const updateIten = (id, updates) =>
  updateFirestoreItem(ITENS_COLLECTION, id, updates);

// ── Receitas (Firestore) ─────────────────────────────────────────────────────
const RECEITAS_COLLECTION = 'receitas';

export const getReceitas = () => getFirestoreItems(RECEITAS_COLLECTION);
export const addReceita = receita =>
  addFirestoreItem(RECEITAS_COLLECTION, receita);
export const removeReceita = id => removeFirestoreItem(RECEITAS_COLLECTION, id);
export const updateReceita = (id, updates) =>
  updateFirestoreItem(RECEITAS_COLLECTION, id, updates);

// ── Condições (Firestore) ────────────────────────────────────────────────────
const CONDICOES_COLLECTION = 'condicoes';

export const getCondicoes = () => getFirestoreItems(CONDICOES_COLLECTION);
export const addCondicao = condicao =>
  addFirestoreItem(CONDICOES_COLLECTION, condicao);
export const removeCondicao = id =>
  removeFirestoreItem(CONDICOES_COLLECTION, id);
export const updateCondicao = (id, updates) =>
  updateFirestoreItem(CONDICOES_COLLECTION, id, updates);

// ── Artes (Firestore) ────────────────────────────────────────────────────────
const ARTES_COLLECTION = 'artes';

export const getArtes = () => getFirestoreItems(ARTES_COLLECTION);
export const addArte = arte => addFirestoreItem(ARTES_COLLECTION, arte);
export const removeArte = id => removeFirestoreItem(ARTES_COLLECTION, id);
export const updateArte = (id, updates) =>
  updateFirestoreItem(ARTES_COLLECTION, id, updates);

// ── Origens (Firestore) ──────────────────────────────────────────────────────
const ORIGENS_COLLECTION = 'origens';

export const getOrigens = () => getFirestoreItems(ORIGENS_COLLECTION);
export const addOrigem = origem => addFirestoreItem(ORIGENS_COLLECTION, origem);
export const removeOrigem = id => removeFirestoreItem(ORIGENS_COLLECTION, id);
export const updateOrigem = (id, updates) =>
  updateFirestoreItem(ORIGENS_COLLECTION, id, updates);

// ── Regras (Firestore) ───────────────────────────────────────────────────────
const REGRAS_COLLECTION = 'regras';

export const getRegras = () => getFirestoreItems(REGRAS_COLLECTION);
export const addRegra = regra => addFirestoreItem(REGRAS_COLLECTION, regra);
export const removeRegra = id => removeFirestoreItem(REGRAS_COLLECTION, id);
export const updateRegra = (id, updates) =>
  updateFirestoreItem(REGRAS_COLLECTION, id, updates);

// ── CardFlux (Firestore) ─────────────────────────────────────────────────────
const CARDFLUX_COLLECTION = 'cardflux';

export const getCardFlux = () => getFirestoreItems(CARDFLUX_COLLECTION);
export const addCardFlux = cardFlux =>
  addFirestoreItem(CARDFLUX_COLLECTION, cardFlux);
export const removeCardFlux = id =>
  removeFirestoreItem(CARDFLUX_COLLECTION, id);
export const updateCardFlux = (id, updates) =>
  updateFirestoreItem(CARDFLUX_COLLECTION, id, updates);

// ── Veias Astrais (Firestore) ───────────────────────────────────────────────
const VEIAS_ASTRAIS_COLLECTION = 'veiasAstrais';

export const getVeiasAstrais = () =>
  getFirestoreItems(VEIAS_ASTRAIS_COLLECTION);
export const addVeiaAstral = veiaAstral =>
  addFirestoreItem(VEIAS_ASTRAIS_COLLECTION, veiaAstral);
export const removeVeiaAstral = id =>
  removeFirestoreItem(VEIAS_ASTRAIS_COLLECTION, id);
export const updateVeiaAstral = (id, updates) =>
  updateFirestoreItem(VEIAS_ASTRAIS_COLLECTION, id, updates);

// ── Divindades (Firestore) ───────────────────────────────────────────────────
const DIVINDADES_COLLECTION = 'divindades';

export const getDivindades = () => getFirestoreItems(DIVINDADES_COLLECTION);
export const addDivindade = divindade =>
  addFirestoreItem(DIVINDADES_COLLECTION, divindade);
export const removeDivindade = id =>
  removeFirestoreItem(DIVINDADES_COLLECTION, id);
export const updateDivindade = (id, updates) =>
  updateFirestoreItem(DIVINDADES_COLLECTION, id, updates);

// ── Aptidões (Firestore) ─────────────────────────────────────────────────────
const APTIDOES_COLLECTION = 'aptidoes';

export const getAptidoes = () => getFirestoreItems(APTIDOES_COLLECTION);
export const addAptidao = aptidao =>
  addFirestoreItem(APTIDOES_COLLECTION, aptidao);
export const removeAptidao = id => removeFirestoreItem(APTIDOES_COLLECTION, id);
export const updateAptidao = (id, updates) =>
  updateFirestoreItem(APTIDOES_COLLECTION, id, updates);

// ── Corpos Especiais (Firestore) ────────────────────────────────────────────
const CORPOS_ESPECIAIS_COLLECTION = 'corposEspeciais';

export const getCorposEspeciais = () =>
  getFirestoreItems(CORPOS_ESPECIAIS_COLLECTION);
export const addCorpoEspecial = corpoEspecial =>
  addFirestoreItem(CORPOS_ESPECIAIS_COLLECTION, corpoEspecial);
export const removeCorpoEspecial = id =>
  removeFirestoreItem(CORPOS_ESPECIAIS_COLLECTION, id);
export const updateCorpoEspecial = (id, updates) =>
  updateFirestoreItem(CORPOS_ESPECIAIS_COLLECTION, id, updates);

// ── Reinos de Cultivo (Firestore) ───────────────────────────────────────────
const REINOS_CULTIVO_COLLECTION = 'reinosCultivo';

export const getReinosCultivo = () =>
  getFirestoreItems(REINOS_CULTIVO_COLLECTION);
export const addReinoCultivo = reinoCultivo =>
  addFirestoreItem(REINOS_CULTIVO_COLLECTION, reinoCultivo);
export const removeReinoCultivo = id =>
  removeFirestoreItem(REINOS_CULTIVO_COLLECTION, id);
export const updateReinoCultivo = (id, updates) =>
  updateFirestoreItem(REINOS_CULTIVO_COLLECTION, id, updates);

// ── Trickster Coin (Firestore) ──────────────────────────────────────────────
const TRICKSTER_COIN_COLLECTION = 'tricksterCoin';

export const getTricksterCoinBeneficios = () =>
  getFirestoreItems(TRICKSTER_COIN_COLLECTION);
export const addTricksterCoinBeneficio = beneficio =>
  addFirestoreItem(TRICKSTER_COIN_COLLECTION, beneficio);
export const removeTricksterCoinBeneficio = id =>
  removeFirestoreItem(TRICKSTER_COIN_COLLECTION, id);
export const updateTricksterCoinBeneficio = (id, updates) =>
  updateFirestoreItem(TRICKSTER_COIN_COLLECTION, id, updates);

// ── Personagens / Fichas (Firestore) ───────────────────────────────────────
const PERSONAGENS_COLLECTION = 'personagens';

export const getPersonagens = () => getFirestoreItems(PERSONAGENS_COLLECTION);
export const addPersonagem = personagem =>
  addFirestoreItem(PERSONAGENS_COLLECTION, personagem);
export const removePersonagem = id =>
  removeFirestoreItem(PERSONAGENS_COLLECTION, id);
export const updatePersonagem = (id, updates) =>
  updateFirestoreItem(PERSONAGENS_COLLECTION, id, updates);

// ── Campanhas (Firestore) ─────────────────────────────────────────────────────
const CAMPANHAS_COLLECTION = 'rmCampanhas';

export const getCampanhas = () => getFirestoreItems(CAMPANHAS_COLLECTION);

// ── Universo (Firestore) ────────────────────────────────────────────────────────

const UNIVERSO_COLLECTION = 'Universo';

export const getUniversos = () => getFirestoreItems(UNIVERSO_COLLECTION);

// ── User Permissions (Firestore) ─────────────────────────────────────────────

const USER_PERMISSIONS_COLLECTION = 'userPermissions';

export const getUserPermissions = async uid => {
  const snap = await getDoc(doc(db, USER_PERMISSIONS_COLLECTION, uid));
  if (!snap.exists()) return { isAdmin: false, universos: [] };
  const data = snap.data();
  return {
    isAdmin: data.isAdmin ?? false,
    universos: Array.isArray(data.universos) ? data.universos : [],
  };
};

const normalizeDisplayName = value => {
  const normalized = String(value ?? '').trim();
  return normalized.length > 0 ? normalized : 'Usuário sem nome';
};

const getUserPermissionName = data => {
  const sourceValue = data?.Nome ?? data?.nome ?? '';
  return normalizeDisplayName(sourceValue);
};

export const getUsersDisplayNamesByUid = async uids => {
  const uniqueIds = [
    ...new Set((Array.isArray(uids) ? uids : []).map(String).filter(Boolean)),
  ];

  if (uniqueIds.length === 0) {
    return {};
  }

  const results = await Promise.allSettled(
    uniqueIds.map(async uid => {
      try {
        const permissionsSnapshot = await getDoc(
          doc(db, USER_PERMISSIONS_COLLECTION, uid),
        );

        if (!permissionsSnapshot.exists()) {
          return [uid, 'Usuário sem nome'];
        }

        const userData = permissionsSnapshot.data() ?? {};
        const playerName = getUserPermissionName(userData);

        return [uid, playerName];
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[storage] getUsersDisplayNamesByUid failed', {
          code: error?.code ?? null,
          message: error?.message ?? String(error),
          uid,
          operation: 'getDoc(doc(db, "userPermissions", uid))',
        });

        return [uid, 'Usuário sem nome'];
      }
    }),
  );

  return Object.fromEntries(
    results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value),
  );
};

export const getAllRegisteredUsers = async () => {
  try {
    const permissionsSnapshot = await getDocs(
      collection(db, USER_PERMISSIONS_COLLECTION),
    );

    return permissionsSnapshot.docs
      .map(docItem => {
        const data = docItem.data() ?? {};
        const nome = getUserPermissionName(data);

        return {
          uid: String(docItem.id ?? '').trim(),
          nome,
        };
      })
      .filter(user => Boolean(user.uid))
      .sort((left, right) => left.nome.localeCompare(right.nome));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[storage] getAllRegisteredUsers failed', error);
    throw error;
  }
};

export const getEligiblePlayersByUniverse = async universoId => {
  const normalizedUniversoId = String(universoId ?? '').trim();

  if (!normalizedUniversoId) {
    return [];
  }

  try {
    const permissionsSnapshot = await getDocs(
      collection(db, USER_PERMISSIONS_COLLECTION),
    );

    const eligibleUids = permissionsSnapshot.docs
      .filter(docItem => {
        const data = docItem.data() ?? {};
        const universos = Array.isArray(data.universos) ? data.universos : [];
        return (
          data.isAdmin === true || universos.includes(normalizedUniversoId)
        );
      })
      .map(docItem => docItem.id);

    if (eligibleUids.length === 0) {
      return [];
    }

    const namesByUid = await getUsersDisplayNamesByUid(eligibleUids);

    return eligibleUids
      .map(uid => ({
        uid,
        nome: namesByUid[uid] || 'Usuário sem nome',
      }))
      .sort((left, right) => left.nome.localeCompare(right.nome));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[storage] getEligiblePlayersByUniverse failed', error);
    throw error;
  }
};

export const DEFAULT_USER_SETTINGS = Object.freeze({
  nomeExibicao: '',
  fotoPerfilUrl: '',
  tema: 'dark',
  corDestaque: '#6F2DA8',
  notificacoes: { ativadas: true },
});

const SUPPORT_APP_CONFIG = Object.freeze({
  database: {
    sourceApp: 'database',
    sourceAppName: 'Banco de Dados',
    sourceUrl:
      import.meta.env.VITE_SUPPORT_DATABASE_URL ||
      import.meta.env.VITE_RE_DATABASE_URL ||
      (typeof window !== 'undefined'
        ? window.location.origin
        : 'https://re-dungeon.app'),
  },
  'player-sheet': {
    sourceApp: 'player-sheet',
    sourceAppName: 'Ficha de Jogador',
    sourceUrl:
      import.meta.env.VITE_SUPPORT_PLAYER_SHEET_URL ||
      import.meta.env.VITE_RE_PLAYER_SHEET_URL ||
      (typeof window !== 'undefined'
        ? window.location.origin
        : 'https://re-player-sheet.app'),
  },
  'gm-shield': {
    sourceApp: 'gm-shield',
    sourceAppName: 'Escudo do Mestre',
    sourceUrl:
      import.meta.env.VITE_SUPPORT_GM_SHIELD_URL ||
      import.meta.env.VITE_RE_GM_SHIELD_URL ||
      (typeof window !== 'undefined'
        ? window.location.origin
        : 'https://re-gm-shield.app'),
  },
});

export const getSupportAppContext = appId => {
  const resolvedAppId =
    typeof appId === 'string' && SUPPORT_APP_CONFIG[appId]
      ? appId
      : import.meta.env.VITE_SUPPORT_APP_ID ||
        import.meta.env.VITE_RE_APP_ID ||
        'database';

  const config =
    SUPPORT_APP_CONFIG[resolvedAppId] || SUPPORT_APP_CONFIG.database;

  return {
    ...config,
    sourceUrl:
      config.sourceUrl ||
      (typeof window !== 'undefined'
        ? window.location.origin
        : 'https://re-dungeon.app'),
  };
};

const SUPPORT_TICKETS_COLLECTION = 'supportTickets';

export const createSupportTicket = async payload => {
  const sourceContext = getSupportAppContext(payload?.sourceApp);
  const normalizedTitle = String(payload?.title ?? '').trim();
  const normalizedDescription = String(payload?.description ?? '').trim();
  const attachments = Array.isArray(payload?.attachments)
    ? payload.attachments
        .map(item => String(item ?? '').trim())
        .filter(item => item.length > 0)
    : [];

  const ticketData = {
    userId: payload?.userId ?? '',
    userEmail: String(payload?.userEmail ?? '').trim(),
    userDisplayName: String(payload?.userDisplayName ?? '').trim(),
    sourceApp: payload?.sourceApp || sourceContext.sourceApp,
    sourceAppName: payload?.sourceAppName || sourceContext.sourceAppName,
    sourceUrl: payload?.sourceUrl || sourceContext.sourceUrl,
    category: normalizeSupportTicketCategory(payload?.category),
    title: normalizedTitle,
    description: normalizedDescription,
    attachments,
    status: 'open',
    adminResponse: null,
    respondedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(
      collection(db, SUPPORT_TICKETS_COLLECTION),
      ticketData,
    );
    return { id: docRef.id, ...ticketData };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[storage] createSupportTicket failed', {
      code: error?.code ?? null,
      message: error?.message ?? String(error),
      operation: 'addDoc(collection(db, "supportTickets"), ticketData)',
    });
    throw error;
  }
};

export const getSupportTicketsByUser = async userId => {
  if (!userId) {
    return [];
  }

  try {
    const ticketQuery = query(
      collection(db, SUPPORT_TICKETS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(ticketQuery);
    return snapshot.docs.map(docItem => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[storage] getSupportTicketsByUser failed', {
      code: error?.code ?? null,
      message: error?.message ?? String(error),
      operation:
        'query(collection(db, "supportTickets"), where("userId", "==", userId), orderBy("createdAt", "desc"))',
    });
    throw error;
  }
};

export const getSupportTickets = async () => {
  try {
    const ticketQuery = query(
      collection(db, SUPPORT_TICKETS_COLLECTION),
      orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(ticketQuery);
    return snapshot.docs.map(docItem => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[storage] getSupportTickets failed', {
      code: error?.code ?? null,
      message: error?.message ?? String(error),
      operation:
        'query(collection(db, "supportTickets"), orderBy("createdAt", "desc"))',
    });
    throw error;
  }
};

export const updateSupportTicket = async (ticketId, updates) => {
  if (!ticketId) {
    throw new Error('O id do ticket é obrigatório para atualizar o registro.');
  }

  const normalizedUpdates = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  if (
    Object.prototype.hasOwnProperty.call(normalizedUpdates, 'adminResponse') &&
    typeof normalizedUpdates.adminResponse === 'string'
  ) {
    normalizedUpdates.respondedAt = normalizedUpdates.respondedAt ?? new Date();
  }

  try {
    await updateDoc(
      doc(db, SUPPORT_TICKETS_COLLECTION, ticketId),
      normalizedUpdates,
    );
    return normalizedUpdates;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[storage] updateSupportTicket failed', {
      code: error?.code ?? null,
      message: error?.message ?? String(error),
      operation: 'updateDoc(doc(db, "supportTickets", ticketId), payload)',
    });
    throw error;
  }
};

export const deleteSupportTicket = async ticketId => {
  if (!ticketId) {
    throw new Error('O id do ticket é obrigatório para excluir o registro.');
  }

  try {
    await deleteDoc(doc(db, SUPPORT_TICKETS_COLLECTION, ticketId));
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[storage] deleteSupportTicket failed', {
      code: error?.code ?? null,
      message: error?.message ?? String(error),
      operation: 'deleteDoc(doc(db, "supportTickets", ticketId))',
    });
    throw error;
  }
};

const normalizeProfileImageUrl = value => {
  if (typeof value !== 'string') return '';

  const normalized = value.trim();

  if (!normalized) {
    return '';
  }

  if (!/^https:\/\//i.test(normalized)) {
    return '';
  }

  return normalized;
};

const normalizeUserSettings = settings => ({
  nomeExibicao: String(settings?.nomeExibicao ?? '').trim(),
  fotoPerfilUrl: normalizeProfileImageUrl(settings?.fotoPerfilUrl),
  tema: 'dark',
  corDestaque:
    typeof settings?.corDestaque === 'string' &&
    /^#[0-9A-Fa-f]{3,6}$/.test(settings.corDestaque)
      ? settings.corDestaque
      : '#6F2DA8',
  notificacoes: {
    ativadas: settings?.notificacoes?.ativadas !== false,
  },
});

export const getUserSettings = async uid => {
  if (!uid || !auth?.currentUser || auth.currentUser.uid !== uid) {
    return {
      ...DEFAULT_USER_SETTINGS,
      notificacoes: { ...DEFAULT_USER_SETTINGS.notificacoes },
    };
  }

  const snap = await getDoc(doc(db, 'users', uid, 'settings', 'preferences'));
  if (!snap.exists()) {
    return {
      ...DEFAULT_USER_SETTINGS,
      notificacoes: { ...DEFAULT_USER_SETTINGS.notificacoes },
    };
  }

  const data = snap.data();
  return {
    nomeExibicao: String(data.nomeExibicao ?? '').trim(),
    fotoPerfilUrl: normalizeProfileImageUrl(data.fotoPerfilUrl),
    tema: 'dark',
    corDestaque:
      typeof data.corDestaque === 'string' &&
      /^#[0-9A-Fa-f]{3,6}$/.test(data.corDestaque)
        ? data.corDestaque
        : '#6F2DA8',
    notificacoes: {
      ativadas: data.notificacoes?.ativadas !== false,
    },
  };
};

export const saveUserSettings = async (uid, settings) => {
  if (!uid || !auth?.currentUser || auth.currentUser.uid !== uid) {
    throw new Error(
      'O UID do usuário autenticado é obrigatório para salvar preferências.',
    );
  }

  const payload = normalizeUserSettings(settings);

  try {
    await setDoc(doc(db, 'users', uid, 'settings', 'preferences'), payload, {
      merge: true,
    });

    return payload;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[storage] saveUserSettings failed', {
      code: error?.code ?? null,
      message: error?.message ?? String(error),
      operation:
        'setDoc(doc(db, "users", uid, "settings", "preferences"), payload, { merge: true })',
    });
    throw error;
  }
};
