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

const KEYS = {
  npcs: 'redungeon_npcs',
  mesas: 'redungeon_mesas',
  mundo: 'redungeon_mundo',
  recursos: 'redungeon_recursos',
  classes: 'redungeon_classes',
  regras: 'redungeon_regras',
  macros: 'redungeon_macros',
};

function getItems(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function saveItems(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}

function addItem(key, item) {
  const items = getItems(key);
  const newItem = {
    id: Date.now() + Math.random(),
    createdAt: new Date().toISOString(),
    ...item,
  };
  items.push(newItem);
  saveItems(key, items);
  return newItem;
}

function removeItem(key, id) {
  const items = getItems(key).filter(item => item.id !== id);
  saveItems(key, items);
}

function updateItem(key, id, updates) {
  const items = getItems(key).map(item =>
    item.id === id
      ? { ...item, ...updates, updatedAt: new Date().toISOString() }
      : item,
  );
  saveItems(key, items);
}

// NPCs
export const getNPCs = () => getItems(KEYS.npcs);
export const addNPC = npc => addItem(KEYS.npcs, npc);
export const removeNPC = id => removeItem(KEYS.npcs, id);
export const updateNPC = (id, updates) => updateItem(KEYS.npcs, id, updates);

// Mesas
export const getMesas = () => getItems(KEYS.mesas);
export const addMesa = mesa => addItem(KEYS.mesas, mesa);
export const removeMesa = id => removeItem(KEYS.mesas, id);
export const updateMesa = (id, updates) => updateItem(KEYS.mesas, id, updates);

// Mundo
export const getMundos = () => getItems(KEYS.mundo);
export const addMundo = mundo => addItem(KEYS.mundo, mundo);
export const removeMundo = id => removeItem(KEYS.mundo, id);

// Recursos
export const getRecursos = () => getItems(KEYS.recursos);
export const addRecurso = recurso => addItem(KEYS.recursos, recurso);
export const removeRecurso = id => removeItem(KEYS.recursos, id);

// Classes (Firestore)
const CLASSES_COLLECTION = 'classes';

export const getClasses = async () => {
  const snapshot = await getDocs(collection(db, CLASSES_COLLECTION));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addClasse = async classe => {
  const docRef = await addDoc(collection(db, CLASSES_COLLECTION), {
    ...classe,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...classe };
};

export const removeClasse = async id => {
  await deleteDoc(doc(db, CLASSES_COLLECTION, id));
};

export const updateClasse = async (id, updates) => {
  await updateDoc(doc(db, CLASSES_COLLECTION, id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Regras
export const getRegras = () => getItems(KEYS.regras);
export const addRegra = regra => addItem(KEYS.regras, regra);
export const removeRegra = id => removeItem(KEYS.regras, id);

// Macros
export const getMacros = () => getItems(KEYS.macros);
export const addMacro = macro => addItem(KEYS.macros, macro);
export const removeMacro = id => removeItem(KEYS.macros, id);

// ── Materiais (Firestore) ─────────────────────────────────────────────────────
const MATERIAIS_COLLECTION = 'materiais';

export const getMateriais = async () => {
  const snapshot = await getDocs(collection(db, MATERIAIS_COLLECTION));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addMaterial = async material => {
  const docRef = await addDoc(collection(db, MATERIAIS_COLLECTION), {
    ...material,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...material };
};

export const removeMaterial = async id => {
  await deleteDoc(doc(db, MATERIAIS_COLLECTION, id));
};

export const updateMaterial = async (id, updates) => {
  await updateDoc(doc(db, MATERIAIS_COLLECTION, id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// ── Raças (Firestore) ────────────────────────────────────────────────────────
const RACAS_COLLECTION = 'racas';

export const getRacas = async () => {
  const snapshot = await getDocs(collection(db, RACAS_COLLECTION));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addRaca = async raca => {
  const docRef = await addDoc(collection(db, RACAS_COLLECTION), {
    ...raca,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...raca };
};

export const removeRaca = async id => {
  await deleteDoc(doc(db, RACAS_COLLECTION, id));
};

export const updateRaca = async (id, updates) => {
  await updateDoc(doc(db, RACAS_COLLECTION, id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// ── Itens (Firestore) ────────────────────────────────────────────────────────
const ITENS_COLLECTION = 'itens';

export const getItens = async () => {
  const snapshot = await getDocs(collection(db, ITENS_COLLECTION));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addIten = async item => {
  const docRef = await addDoc(collection(db, ITENS_COLLECTION), {
    ...item,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...item };
};

export const removeIten = async id => {
  await deleteDoc(doc(db, ITENS_COLLECTION, id));
};

export const updateIten = async (id, updates) => {
  await updateDoc(doc(db, ITENS_COLLECTION, id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// ── Universo (Firestore) ────────────────────────────────────────────────────────

const UNIVERSO_COLLECTION = 'Universo';

export const getUniversos = async () => {
  const snapshot = await getDocs(collection(db, UNIVERSO_COLLECTION));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

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
