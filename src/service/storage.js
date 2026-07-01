const KEYS = {
  npcs: 'redungeon_npcs',
  mesas: 'redungeon_mesas',
  mundo: 'redungeon_mundo',
  recursos: 'redungeon_recursos',
  racas: 'redungeon_racas',
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

// Raças
export const getRacas = () => getItems(KEYS.racas);
export const addRaca = raca => addItem(KEYS.racas, raca);
export const removeRaca = id => removeItem(KEYS.racas, id);
export const updateRaca = (id, updates) => updateItem(KEYS.racas, id, updates);

// Classes
export const getClasses = () => getItems(KEYS.classes);
export const addClass = classe => addItem(KEYS.classes, classe);
export const removeClass = id => removeItem(KEYS.classes, id);
export const updateClasse = (id, updates) =>
  updateItem(KEYS.classes, id, updates);

// Regras
export const getRegras = () => getItems(KEYS.regras);
export const addRegra = regra => addItem(KEYS.regras, regra);
export const removeRegra = id => removeItem(KEYS.regras, id);

// Macros
export const getMacros = () => getItems(KEYS.macros);
export const addMacro = macro => addItem(KEYS.macros, macro);
export const removeMacro = id => removeItem(KEYS.macros, id);
