import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

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
