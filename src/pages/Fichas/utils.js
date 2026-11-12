export const TIPOS_FICHA = ['Personagem Jogável', 'NPC', 'Criatura'];

const normalizeText = value =>
  String(value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
export const normalizeUniverseId = value => String(value ?? '').trim();

export const canAccessFichaForUniverse = (
  ficha = {},
  { isAdmin = false, allowedUniversos = [] } = {},
) => {
  if (isAdmin) {
    return true;
  }

  const universeIds = Array.isArray(ficha?.universos)
    ? ficha.universos.map(item => normalizeUniverseId(item)).filter(Boolean)
    : [normalizeUniverseId(ficha?.universo ?? ficha?.universoId)];

  const hasAuthorizedUniverse = universeIds.some(
    universoId =>
      Array.isArray(allowedUniversos) && allowedUniversos.includes(universoId),
  );

  return hasAuthorizedUniverse && universeIds.length > 0;
};

export const normalizeFichaTipo = tipo => {
  const normalized = normalizeText(tipo).replace(/[_-]+/g, ' ');

  if (!normalized) {
    return 'Desconhecido';
  }

  const mapping = {
    personagem: 'Personagem Jogável',
    'personagem jogavel': 'Personagem Jogável',
    'personagem jogavel ': 'Personagem Jogável',
    'personagem jogavel  ': 'Personagem Jogável',
    personagemjogavel: 'Personagem Jogável',
    npc: 'NPC',
    npcs: 'NPC',
    criatura: 'Criatura',
    criaturas: 'Criatura',
    companheiro: 'Companheiro',
    companheiros: 'Companheiro',
    companheira: 'Companheiro',
    companheiras: 'Companheiro',
    desconhecido: 'Desconhecido',
  };

  const mapped = mapping[normalized];

  if (mapped) {
    return mapped;
  }

  const fallback = String(tipo ?? '').trim();
  return fallback || 'Desconhecido';
};

const isFichaTeste = ficha => {
  const nome = normalizeText(ficha?.nome);

  if (!nome) {
    return false;
  }

  const marcadoresTeste = [
    'teste',
    'ficha de teste',
    'ficha teste',
    'card de teste',
    'card teste',
    'personagem de teste',
    'teste ficha',
  ];

  return marcadoresTeste.some(marcador => nome.includes(marcador));
};

export const filterFichas = (fichas = [], filtros = {}) => {
  const busca = normalizeText(filtros.busca);
  const universo = String(filtros.universo ?? 'todos').trim();
  const tipo = String(filtros.tipo ?? 'todos').trim();

  return (Array.isArray(fichas) ? fichas : []).filter(ficha => {
    if (isFichaTeste(ficha)) {
      return false;
    }

    const nome = String(ficha?.nome ?? '').trim();
    const nomeMatch = !busca || nome.toLowerCase().includes(busca);
    const universoMatch =
      universo === 'todos' ||
      String(ficha?.universo ?? ficha?.universoId ?? '').trim() === universo;
    const tipoMatch =
      tipo === 'todos' ||
      normalizeFichaTipo(ficha?.tipo) === normalizeFichaTipo(tipo);

    return nomeMatch && universoMatch && tipoMatch;
  });
};

export const getCampanhaLabel = (ficha = {}, campanhasPorId = {}) => {
  const lista = Array.isArray(ficha?.campanhas) ? ficha.campanhas : [];
  const campanhaId = String(ficha?.campanha ?? lista[0] ?? '').trim();

  if (!campanhaId) {
    return 'Sem campanha';
  }

  return campanhasPorId[campanhaId] || 'Campanha desconhecida';
};

export const getFichaOwnerName = (ficha = {}, usuariosPorId = {}) => {
  const uid = String(ficha?.uid ?? ficha?.proprietarioId ?? '').trim();

  if (!uid) {
    return 'Sem proprietário';
  }

  const usuario = usuariosPorId[uid];
  const nome =
    typeof usuario === 'string'
      ? usuario
      : usuario?.Nome ||
        usuario?.nome ||
        usuario?.displayName ||
        usuario?.name ||
        'Usuário sem nome';

  return nome || 'Sem proprietário';
};
