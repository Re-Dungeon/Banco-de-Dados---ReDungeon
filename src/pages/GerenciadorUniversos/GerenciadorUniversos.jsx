import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { useAuth } from 'context/AuthContext';
import useUniversos from 'hooks/useUniversos';
import useDeleteConfirmation from 'hooks/useDeleteConfirmation';
import PageHeader from 'components/PageHeader/PageHeader';
import SearchableSelect from 'components/SearchableSelect/SearchableSelect';
import { db } from 'service/firebase';
import {
  addUniverso,
  getAllRegisteredUsers,
  getAptidoes,
  getArtes,
  getCampanhas,
  getCardFlux,
  getClasses,
  getCondicoes,
  getCorposEspeciais,
  getDivindades,
  getItens,
  getMateriais,
  getOrigens,
  getPersonagens,
  getRacas,
  getRegras,
  getReceitas,
  getReinosCultivo,
  getTricksterCoinBeneficios,
  getUserPermissions,
  getVeiasAstrais,
  removeAptidao,
  removeArte,
  removeCardFlux,
  removeClasse,
  removeCondicao,
  removeCorpoEspecial,
  removeDivindade,
  removeIten,
  removeMaterial,
  removeOrigem,
  removeRaca,
  removeReceita,
  removeRegra,
  removeReinoCultivo,
  removeTricksterCoinBeneficio,
  removeUniverso,
  removeVeiaAstral,
  updateUniverso,
} from 'service/storage';
import EntityImage from 'components/EntityImage/EntityImage';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
import { UniverseCountBadge } from 'components/CardTokens/CardTokens';
import { urlImagemSchema } from 'common/utils/yupSchemas';

const ALL_UNIVERSE_VALUE = '__ALL_UNIVERSES__';
const DELETION_INITIAL_BATCH_SIZE = 40;

const TAB_OPTIONS = [
  { value: 'aptidoes', label: 'Aptidões' },
  { value: 'condicoes', label: 'Condições' },
  { value: 'universos', label: 'Universos' },
  { value: 'exclusao', label: 'Exclusão' },
];

const DELETION_CATEGORY_OPTIONS = [
  { value: 'aptidoes', label: 'Aptidões' },
  { value: 'artes', label: 'Artes' },
  { value: 'cardflux', label: 'CardFlux' },
  { value: 'classes', label: 'Classes' },
  { value: 'condicoes', label: 'Condições' },
  { value: 'corposEspeciais', label: 'Corpos Especiais' },
  { value: 'divindades', label: 'Divindades' },
  { value: 'itens', label: 'Itens' },
  { value: 'materiais', label: 'Materiais' },
  { value: 'origens', label: 'Origens' },
  { value: 'racas', label: 'Raças' },
  { value: 'receitas', label: 'Receitas' },
  { value: 'regras', label: 'Regras' },
  { value: 'reinosCultivo', label: 'Reinos de Cultivo' },
  { value: 'tricksterCoin', label: 'Trickster Coin' },
  { value: 'Universo', label: 'Universos' },
  { value: 'veiasAstrais', label: 'Veias Astrais' },
].sort((left, right) => left.label.localeCompare(right.label, 'pt-BR', { sensitivity: 'base' }));

const UNIVERSE_FORM_INITIAL_VALUES = {
  Nome: '',
  linkImagem: '',
};

const UNIVERSE_FORM_SCHEMA = Yup.object({
  Nome: Yup.string()
    .trim()
    .required('Nome do universo é obrigatório')
    .max(100, 'Deve ter no máximo 100 caracteres'),
  linkImagem: urlImagemSchema.nullable().notRequired(),
});

const getUniverseName = universe =>
  String(universe?.Nome ?? universe?.nome ?? '').trim() || 'Universo sem nome';

const isUniverseActive = universe =>
  universe?.ativo === false ? false : true;

const getUniverseStatusLabel = universe =>
  isUniverseActive(universe) ? 'Ativo' : 'Inativo';

const getCampaignName = campaign =>
  String(
    campaign?.nome ??
      campaign?.Nome ??
      campaign?.titulo ??
      campaign?.name ??
      'Campanha sem nome',
  ).trim() || 'Campanha sem nome';

const normalizeCampaignUniverseId = campaign =>
  String(
    campaign?.universoId ??
      campaign?.universo ??
      campaign?.universo_id ??
      campaign?.universoID ??
      '',
  ).trim();

const getCampaignImageSource = campaign =>
  String(
    campaign?.linkImagem ??
      campaign?.imagem ??
      campaign?.capa ??
      campaign?.image ??
      campaign?.banner ??
      '',
  ).trim();

const getStableIndexFromSeed = (seed, length) => {
  if (!length) {
    return 0;
  }

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash % length;
};

const getUniverseVisualImage = (universo, campanhas = []) => {
  const directImage = String(
    universo?.linkImagem ?? universo?.imagem ?? '',
  ).trim();

  if (directImage) {
    return directImage;
  }

  const matchingCampaigns = campanhas.filter(campanha => {
    const universeId = normalizeCampaignUniverseId(campanha);
    return universeId === String(universo?.id ?? '');
  });

  if (matchingCampaigns.length === 0) {
    return '';
  }

  const fallbackImage = getCampaignImageSource(
    matchingCampaigns[
      getStableIndexFromSeed(String(universo?.id ?? ''), matchingCampaigns.length)
    ],
  );

  return fallbackImage;
};

const getUniverseCampaignImageOptions = (universo, campanhas = []) => {
  const universeId = String(universo?.id ?? '');

  if (!universeId) {
    return [];
  }

  return campanhas
    .filter(campanha => normalizeCampaignUniverseId(campanha) === universeId)
    .map(campanha => ({
      value: getCampaignImageSource(campanha),
      label: getCampaignName(campanha),
    }))
    .filter(option => option.value);
};

const getDeletionRecordCategory = collectionName => {
  const category = DELETION_CATEGORY_OPTIONS.find(option => option.value === collectionName);
  return category?.label || 'Registro';
};

const normalizeUniverseIds = item => {
  const raw = Array.isArray(item?.universos)
    ? item.universos
    : item?.universos || item?.universo
      ? [item?.universos ?? item?.universo]
      : [];

  const unique = [];
  const seen = new Set();

  raw.forEach(value => {
    const normalized = String(value ?? '').trim();
    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    unique.push(normalized);
  });

  return unique;
};

const buildUpdatedPayload = nextUniversos => ({
  universos: nextUniversos,
});

export const removeSuccessfulDeletionRecords = (previousData, successfulRecords) => {
  const successfulIdsByCollection = successfulRecords.reduce((accumulator, record) => {
    if (record.collection === 'Universo') {
      return accumulator;
    }

    if (!accumulator[record.collection]) {
      accumulator[record.collection] = new Set();
    }

    accumulator[record.collection].add(record.docId);
    return accumulator;
  }, {});

  return Object.keys(previousData).reduce((accumulator, collectionName) => {
    const currentItems = Array.isArray(previousData[collectionName])
      ? previousData[collectionName]
      : [];
    const removedIds = successfulIdsByCollection[collectionName];

    accumulator[collectionName] = removedIds
      ? currentItems.filter(item => !removedIds.has(item.id))
      : currentItems;

    return accumulator;
  }, { ...previousData });
};

const EMPTY_FILTER_STATE = {
  search: '',
  sort: 'asc',
};

export const createDeletionLookupMaps = ({ universos = [], data = {} }) => ({
  universeById: new Map((universos || []).map(universo => [String(universo.id), universo])),
  itemByCollectionAndId: Object.fromEntries(
    Object.entries(data).map(([collectionName, collectionItems]) => [
      collectionName,
      new Map(
        (Array.isArray(collectionItems) ? collectionItems : []).map(item => [
          String(item.id),
          item,
        ]),
      ),
    ]),
  ),
});

const applyListFilters = ({ items, activeUniverseId, filterState, scope }) => {
  const searchTerm = filterState.search.trim().toLowerCase();

  const filtered = items.filter(item => {
    const itemUniversos = normalizeUniverseIds(item);
    const matchesScope =
      scope === 'linked'
        ? itemUniversos.includes(activeUniverseId)
        : !itemUniversos.includes(activeUniverseId);

    if (!matchesScope) {
      return false;
    }

    return (
      !searchTerm || String(item?.nome ?? '').toLowerCase().includes(searchTerm)
    );
  });

  return [...filtered].sort((left, right) => {
    const result = String(left?.nome ?? '').localeCompare(
      String(right?.nome ?? ''),
      'pt-BR',
      { sensitivity: 'base' },
    );

    return filterState.sort === 'desc' ? -result : result;
  });
};

const persistUniverseMutation = async ({ collectionName, itemId, action, universeId }) => {
  const itemRef = doc(db, collectionName, itemId);

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(itemRef);

    if (!snapshot.exists()) {
      throw new Error(`Registro ${itemId} não foi encontrado.`);
    }

    const currentData = snapshot.data();
    const currentUniversos = normalizeUniverseIds(currentData);
    const hasUniverse = currentUniversos.includes(universeId);
    const nextUniversos =
      action === 'link'
        ? Array.from(new Set([...currentUniversos, universeId]))
        : currentUniversos.filter(universoId => universoId !== universeId);

    if (action === 'link' && hasUniverse) {
      return { status: 'skipped', itemId };
    }

    if (action === 'unlink' && !hasUniverse) {
      return { status: 'skipped', itemId };
    }

    transaction.update(itemRef, {
      universos: nextUniversos,
      updatedAt: serverTimestamp(),
    });

    return { status: 'updated', itemId, nextUniversos };
  });
};

const GerenciadorUniversos = () => {
  const { isAdmin, allowedUniversos, canCreate } = useAuth();
  const { universos, loadingUniversos, updateUniversos } = useUniversos();
  const { confirmDelete, deleteConfirmationDialog, isDeleteDialogOpen } = useDeleteConfirmation();

  const [selectedCategory, setSelectedCategory] = useState('aptidoes');
  const [selectedUniverseId, setSelectedUniverseId] = useState('');
  const [universeStatusFilter, setUniverseStatusFilter] = useState('all');
  const [linkedFilters, setLinkedFilters] = useState(EMPTY_FILTER_STATE);
  const [availableFilters, setAvailableFilters] = useState(EMPTY_FILTER_STATE);
  const [selectedIds, setSelectedIds] = useState([]);
  const [data, setData] = useState({
    aptidoes: [],
    condicoes: [],
    classes: [],
    racas: [],
    materiais: [],
    itens: [],
    receitas: [],
    artes: [],
    origens: [],
    divindades: [],
    corposEspeciais: [],
    veiasAstrais: [],
    reinosCultivo: [],
    tricksterCoin: [],
    regras: [],
    cardflux: [],
  });
  const [campanhas, setCampanhas] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [deletionDataLoaded, setDeletionDataLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isCreateUniverseOpen, setIsCreateUniverseOpen] = useState(false);
  const [selectedUniverseDetail, setSelectedUniverseDetail] = useState(null);
  const [universeSearch, setUniverseSearch] = useState('');
  const [deleteFilters, setDeleteFilters] = useState({
    search: '',
    category: 'all',
    universe: 'all',
  });
  const [deleteColumnCount, setDeleteColumnCount] = useState(2);
  const [deleteSelectedIds, setDeleteSelectedIds] = useState([]);
  const [visibleDeletionCount, setVisibleDeletionCount] = useState(DELETION_INITIAL_BATCH_SIZE);
  const [universePopover, setUniversePopover] = useState({ recordId: null, anchorEl: null });
  const hasUserChosenDeleteUniverse = useRef(false);
  const [universeImageForm, setUniverseImageForm] = useState({
    source: 'link',
    selectedCampaignImage: '',
    customLink: '',
  });
  const [notice, setNotice] = useState({ type: 'info', text: '' });

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoadingItems(true);
      setNotice({ type: 'info', text: '' });

      try {
        const [aptidoes, condicoes, campanhasData] = await Promise.all([
          getAptidoes(),
          getCondicoes(),
          getCampanhas(),
        ]);

        if (!active) return;

        setData(previous => ({
          ...previous,
          aptidoes: Array.isArray(aptidoes) ? aptidoes : [],
          condicoes: Array.isArray(condicoes) ? condicoes : [],
        }));
        setCampanhas(Array.isArray(campanhasData) ? campanhasData : []);
      } catch (error) {
        if (!active) return;
        setNotice({
          type: 'error',
          text: error?.message || 'Não foi possível carregar os registros do gerenciador.',
        });
      } finally {
        if (active) {
          setLoadingItems(false);
        }
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (selectedCategory !== 'exclusao' || deletionDataLoaded) {
      return;
    }

    let active = true;

    const loadDeletionData = async () => {
      try {
        const [
          classes,
          racas,
          materiais,
          itens,
          receitas,
          artes,
          origens,
          divindades,
          corposEspeciais,
          veiasAstrais,
          reinosCultivo,
          tricksterCoin,
          regras,
          cardflux,
        ] = await Promise.all([
          getClasses(),
          getRacas(),
          getMateriais(),
          getItens(),
          getReceitas(),
          getArtes(),
          getOrigens(),
          getDivindades(),
          getCorposEspeciais(),
          getVeiasAstrais(),
          getReinosCultivo(),
          getTricksterCoinBeneficios(),
          getRegras(),
          getCardFlux(),
        ]);

        if (!active) return;

        setData(previous => ({
          ...previous,
          classes: Array.isArray(classes) ? classes : [],
          racas: Array.isArray(racas) ? racas : [],
          materiais: Array.isArray(materiais) ? materiais : [],
          itens: Array.isArray(itens) ? itens : [],
          receitas: Array.isArray(receitas) ? receitas : [],
          artes: Array.isArray(artes) ? artes : [],
          origens: Array.isArray(origens) ? origens : [],
          divindades: Array.isArray(divindades) ? divindades : [],
          corposEspeciais: Array.isArray(corposEspeciais) ? corposEspeciais : [],
          veiasAstrais: Array.isArray(veiasAstrais) ? veiasAstrais : [],
          reinosCultivo: Array.isArray(reinosCultivo) ? reinosCultivo : [],
          tricksterCoin: Array.isArray(tricksterCoin) ? tricksterCoin : [],
          regras: Array.isArray(regras) ? regras : [],
          cardflux: Array.isArray(cardflux) ? cardflux : [],
        }));
        setDeletionDataLoaded(true);
      } catch (error) {
        if (!active) return;
        setNotice({
          type: 'error',
          text: error?.message || 'Não foi possível carregar os registros para exclusão.',
        });
      }
    };

    void loadDeletionData();

    return () => {
      active = false;
    };
  }, [deletionDataLoaded, selectedCategory]);

  const allowedUniverseOptions = useMemo(() => {
    if (isAdmin) {
      return universos;
    }

    return universos.filter(universo => allowedUniversos.includes(universo.id));
  }, [allowedUniversos, isAdmin, universos]);

  const isAllUniversesSelected =
    selectedUniverseId === ALL_UNIVERSE_VALUE || selectedUniverseId === '';
  const activeUniverseId =
    selectedUniverseId === ALL_UNIVERSE_VALUE || !selectedUniverseId
      ? allowedUniverseOptions[0]?.id || ''
      : selectedUniverseId;

  useEffect(() => {
    if (selectedCategory !== 'exclusao' || !activeUniverseId || hasUserChosenDeleteUniverse.current) {
      return;
    }

    setDeleteFilters(previous => {
      if (previous.universe === 'all' || previous.universe === '') {
        return {
          ...previous,
          universe: activeUniverseId,
        };
      }

      return previous;
    });
  }, [activeUniverseId, selectedCategory]);

  const selectedUniverseLabel =
    isAllUniversesSelected
      ? 'Todos os universos'
      : universos.find(universo => universo.id === activeUniverseId)?.Nome ||
        'Selecionar universo';

  const currentItems = useMemo(
    () => data[selectedCategory] ?? [],
    [data, selectedCategory],
  );

  const linkedItems = useMemo(
    () =>
      applyListFilters({
        items: currentItems,
        activeUniverseId,
        filterState: linkedFilters,
        scope: 'linked',
      }),
    [activeUniverseId, currentItems, linkedFilters],
  );

  const availableItems = useMemo(
    () =>
      applyListFilters({
        items: currentItems,
        activeUniverseId,
        filterState: availableFilters,
        scope: 'available',
      }),
    [activeUniverseId, availableFilters, currentItems],
  );

  const canManageSelectedUniverse =
    isAllUniversesSelected
      ? allowedUniverseOptions.length > 0
      : !activeUniverseId
        ? false
        : isAdmin || allowedUniversos.includes(activeUniverseId);

  const selectedUniverseOption = isAllUniversesSelected
    ? { value: ALL_UNIVERSE_VALUE, label: 'Todos' }
    : allowedUniverseOptions.find(universo => universo.id === activeUniverseId) || null;

  const handleToggleItem = itemId => {
    setSelectedIds(previous =>
      previous.includes(itemId)
        ? previous.filter(id => id !== itemId)
        : [...previous, itemId],
    );
  };

  const updateFilterState = (area, nextState) => {
    if (area === 'linked') {
      setLinkedFilters(nextState);
      return;
    }

    setAvailableFilters(nextState);
  };

  const renderFilterBar = ({ area, state, onChange, sortLabel }) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.5fr) auto' },
        gap: 1.25,
        alignItems: 'center',
        mb: 1.5,
      }}
    >
      <TextField
        label={`Pesquisar ${area === 'linked' ? 'vinculados' : 'disponíveis'}`}
        size="small"
        value={state.search}
        onChange={event => onChange({ ...state, search: event.target.value })}
        sx={{
          '& .MuiOutlinedInput-root': {
            color: 'var(--text-primary)',
            '& fieldset': { borderColor: 'var(--border-primary)' },
            '&:hover fieldset': { borderColor: 'var(--border-hover)' },
            '&.Mui-focused fieldset': { borderColor: 'var(--color-accent)' },
          },
          '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant="text"
          onClick={() => onChange(EMPTY_FILTER_STATE)}
          sx={{
            color: 'var(--text-secondary)',
            minWidth: 0,
            px: 1,
          }}
        >
          Limpar
        </Button>

        <Box component="div" aria-label={sortLabel} sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant={state.sort === 'asc' ? 'contained' : 'outlined'}
            onClick={() => onChange({ ...state, sort: 'asc' })}
            aria-label={`${sortLabel}: A–Z`}
            sx={{
              minWidth: 62,
              borderColor: 'var(--border-primary)',
              color: state.sort === 'asc' ? 'rgba(4, 7, 16, 1)' : 'var(--text-primary)',
              background: state.sort === 'asc' ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.96), rgba(251, 191, 36, 0.85))' : 'transparent',
              '&:hover': {
                background: state.sort === 'asc' ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.98), rgba(251, 191, 36, 0.88))' : 'rgba(15, 23, 42, 0.72)',
              },
            }}
          >
            A–Z
          </Button>
          <Button
            size="small"
            variant={state.sort === 'desc' ? 'contained' : 'outlined'}
            onClick={() => onChange({ ...state, sort: 'desc' })}
            aria-label={`${sortLabel}: Z–A`}
            sx={{
              minWidth: 62,
              borderColor: 'var(--border-primary)',
              color: state.sort === 'desc' ? 'rgba(4, 7, 16, 1)' : 'var(--text-primary)',
              background: state.sort === 'desc' ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.96), rgba(251, 191, 36, 0.85))' : 'transparent',
              '&:hover': {
                background: state.sort === 'desc' ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.98), rgba(251, 191, 36, 0.88))' : 'rgba(15, 23, 42, 0.72)',
              },
            }}
          >
            Z–A
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const handleCreateUniverse = async (values, { resetForm, setSubmitting, setFieldError }) => {
    const nome = String(values?.Nome ?? '').trim();
    const linkImagem = String(values?.linkImagem ?? '').trim();

    if (!nome) {
      setFieldError('Nome', 'Nome do universo é obrigatório');
      return;
    }

    const duplicateUniverse = universos.some(universo => {
      const existingName = getUniverseName(universo).toLowerCase();
      return existingName === nome.toLowerCase();
    });

    if (duplicateUniverse) {
      setFieldError('Nome', 'Já existe um universo com este nome.');
      return;
    }

    setSaving(true);
    setNotice({ type: 'info', text: 'Criando universo...' });

    try {
      const createdUniverse = await addUniverso({
        Nome: nome,
        linkImagem,
      });

      const nextUniversos = [
        ...(Array.isArray(universos) ? universos : []),
        {
          id: createdUniverse?.id || `universo-${Date.now()}`,
          Nome: nome,
          linkImagem,
        },
      ];

      updateUniversos(nextUniversos);
      setSelectedUniverseId(createdUniverse?.id || '');
      setSelectedCategory('universos');
      setIsCreateUniverseOpen(false);
      resetForm();
      setNotice({
        type: 'success',
        text: `Universo "${nome}" criado com sucesso.`,
      });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error?.message || 'Não foi possível criar o universo.',
      });
      setFieldError('Nome', error?.message || 'Não foi possível criar o universo.');
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  const handleBulkUpdate = async action => {
    const targetUniverseIds =
      selectedUniverseId === ALL_UNIVERSE_VALUE
        ? allowedUniverseOptions.map(universo => universo.id)
        : [activeUniverseId].filter(Boolean);

    if (targetUniverseIds.length === 0 || !canManageSelectedUniverse) {
      setNotice({
        type: 'error',
        text: 'Você não tem permissão para alterar vínculos neste universo.',
      });
      return;
    }

    if (selectedIds.length === 0) {
      setNotice({
        type: 'info',
        text: 'Selecione pelo menos um registro para continuar.',
      });
      return;
    }

    const categoryItems = data[selectedCategory] ?? [];
    const selectedItems = categoryItems.filter(item => selectedIds.includes(item.id));

    if (selectedItems.length === 0) {
      setNotice({
        type: 'info',
        text: 'Nenhum registro selecionado foi encontrado na categoria atual.',
      });
      return;
    }

    setSaving(true);
    setNotice({ type: 'info', text: 'Atualizando vínculos...' });

    const succeededIds = [];
    const failedItems = [];

    try {
      for (const item of selectedItems) {
        const collectionName = selectedCategory === 'aptidoes' ? 'aptidoes' : 'condicoes';

        for (const universeId of targetUniverseIds) {
          try {
            const result = await persistUniverseMutation({
              collectionName,
              itemId: item.id,
              action,
              universeId,
            });

            if (result.status === 'skipped') {
              continue;
            }

            succeededIds.push(item.id);

            setData(previous => ({
              ...previous,
              [selectedCategory]: (previous[selectedCategory] || []).map(entry => {
                if (entry.id !== item.id) {
                  return entry;
                }

                return {
                  ...entry,
                  ...buildUpdatedPayload(result.nextUniversos),
                };
              }),
            }));
          } catch (error) {
            failedItems.push({ id: item.id, nome: item.nome, error });
          }
        }
      }

      if (failedItems.length > 0) {
        const failedDetails = failedItems
          .map(
            item =>
              `${item.nome}: ${item.error?.message || 'Erro ao atualizar o registro.'}`,
          )
          .join('; ');
        const retryIds = failedItems.map(item => item.id);
        const failureSummary =
          failedItems.length === 1
            ? '1 registro falhou'
            : `${failedItems.length} registros falharam`;

        setSelectedIds(retryIds);
        setNotice({
          type: 'error',
          text: `Atualização parcial concluída: ${succeededIds.length} registro(s) atualizado(s); ${failureSummary}: ${failedDetails}. Repetir apenas os registros falhos.`,
        });
        return;
      }

      setSelectedIds([]);
      setNotice({
        type: 'success',
        text:
          action === 'link'
            ? 'Vínculos atualizados com sucesso.'
            : 'Desvínculos realizados com sucesso.',
      });
    } catch (error) {
      setNotice({
        type: 'error',
        text:
          error?.message ||
          'Não foi possível atualizar os vínculos selecionados.',
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredUniversos = useMemo(() => {
    const normalizedSearch = universeSearch.trim().toLowerCase();

    return universos.filter(universo => {
      const matchesSearch =
        !normalizedSearch ||
        getUniverseName(universo).toLowerCase().includes(normalizedSearch);

      const isActive = isUniverseActive(universo);
      const matchesStatus =
        universeStatusFilter === 'all'
          ? true
          : universeStatusFilter === 'active'
            ? isActive
            : !isActive;

      return matchesSearch && matchesStatus;
    });
  }, [universeSearch, universos, universeStatusFilter]);

  const getDeletionRecordName = item => {
    const nameValue = String(
      item?.nome ?? item?.Nome ?? item?.titulo ?? item?.title ?? item?.name ?? '',
    ).trim();

    return nameValue || 'Registro sem nome';
  };

  const deletionRecords = useMemo(
    () => [
      ...data.classes.map(item => ({
        id: `classes:${item.id}`,
        collection: 'classes',
        docId: item.id,
        name: getDeletionRecordName(item),
        categoryLabel: getDeletionRecordCategory('classes'),
        universos: normalizeUniverseIds(item),
      })),
      ...data.racas.map(item => ({
        id: `racas:${item.id}`,
        collection: 'racas',
        docId: item.id,
        name: getDeletionRecordName(item),
        categoryLabel: getDeletionRecordCategory('racas'),
        universos: normalizeUniverseIds(item),
      })),
      ...data.aptidoes.map(item => ({
        id: `aptidoes:${item.id}`,
        collection: 'aptidoes',
        docId: item.id,
        name: getDeletionRecordName(item),
        categoryLabel: getDeletionRecordCategory('aptidoes'),
        universos: normalizeUniverseIds(item),
      })),
      ...data.corposEspeciais.map(item => ({
        id: `corposEspeciais:${item.id}`,
        collection: 'corposEspeciais',
        docId: item.id,
        name: getDeletionRecordName(item),
        categoryLabel: getDeletionRecordCategory('corposEspeciais'),
        universos: normalizeUniverseIds(item),
      })),
      ...data.origens.map(item => ({
        id: `origens:${item.id}`,
        collection: 'origens',
        docId: item.id,
        name: getDeletionRecordName(item),
        categoryLabel: getDeletionRecordCategory('origens'),
        universos: normalizeUniverseIds(item),
      })),
      ...data.divindades.map(item => ({
        id: `divindades:${item.id}`,
        collection: 'divindades',
        docId: item.id,
        name: getDeletionRecordName(item),
        categoryLabel: getDeletionRecordCategory('divindades'),
        universos: normalizeUniverseIds(item),
      })),
      ...data.artes.map(item => ({
        id: `artes:${item.id}`,
        collection: 'artes',
        docId: item.id,
        name: getDeletionRecordName(item),
        categoryLabel: getDeletionRecordCategory('artes'),
        universos: normalizeUniverseIds(item),
      })),
      ...data.veiasAstrais.map(item => ({
        id: `veiasAstrais:${item.id}`,
        collection: 'veiasAstrais',
        docId: item.id,
        name: getDeletionRecordName(item),
        categoryLabel: getDeletionRecordCategory('veiasAstrais'),
        universos: normalizeUniverseIds(item),
      })),
      ...data.reinosCultivo.map(item => ({
        id: `reinosCultivo:${item.id}`,
        collection: 'reinosCultivo',
        docId: item.id,
        name: getDeletionRecordName(item),
        categoryLabel: getDeletionRecordCategory('reinosCultivo'),
        universos: normalizeUniverseIds(item),
      })),
      ...data.condicoes.map(item => ({
        id: `condicoes:${item.id}`,
        collection: 'condicoes',
        docId: item.id,
        name: getDeletionRecordName(item),
        categoryLabel: getDeletionRecordCategory('condicoes'),
        universos: normalizeUniverseIds(item),
      })),
      ...data.materiais.map(item => ({
        id: `materiais:${item.id}`,
        collection: 'materiais',
        docId: item.id,
        name: getDeletionRecordName(item),
        categoryLabel: getDeletionRecordCategory('materiais'),
        universos: normalizeUniverseIds(item),
      })),
      ...data.itens.map(item => ({
        id: `itens:${item.id}`,
        collection: 'itens',
        docId: item.id,
        name: getDeletionRecordName(item),
        categoryLabel: getDeletionRecordCategory('itens'),
        universos: normalizeUniverseIds(item),
      })),
      ...data.receitas.map(item => ({
        id: `receitas:${item.id}`,
        collection: 'receitas',
        docId: item.id,
        name: getDeletionRecordName(item),
        categoryLabel: getDeletionRecordCategory('receitas'),
        universos: normalizeUniverseIds(item),
      })),
      ...data.cardflux.map(item => ({
        id: `cardflux:${item.id}`,
        collection: 'cardflux',
        docId: item.id,
        name: getDeletionRecordName(item),
        categoryLabel: getDeletionRecordCategory('cardflux'),
        universos: normalizeUniverseIds(item),
      })),
      ...data.tricksterCoin.map(item => ({
        id: `tricksterCoin:${item.id}`,
        collection: 'tricksterCoin',
        docId: item.id,
        name: getDeletionRecordName(item),
        categoryLabel: getDeletionRecordCategory('tricksterCoin'),
        universos: normalizeUniverseIds(item),
      })),
      ...data.regras.map(item => ({
        id: `regras:${item.id}`,
        collection: 'regras',
        docId: item.id,
        name: getDeletionRecordName(item),
        categoryLabel: getDeletionRecordCategory('regras'),
        universos: normalizeUniverseIds(item),
      })),
      ...universos.map(universo => ({
        id: `Universo:${universo.id}`,
        collection: 'Universo',
        docId: universo.id,
        name: getUniverseName(universo),
        categoryLabel: getDeletionRecordCategory('Universo'),
        universos: [String(universo?.id ?? '').trim()].filter(Boolean),
      })),
    ],
    [
      data.aptidoes,
      data.artes,
      data.cardflux,
      data.classes,
      data.condicoes,
      data.corposEspeciais,
      data.divindades,
      data.itens,
      data.materiais,
      data.origens,
      data.racas,
      data.receitas,
      data.reinosCultivo,
      data.regras,
      data.tricksterCoin,
      data.veiasAstrais,
      universos,
    ],
  );

  const filteredDeletionRecords = useMemo(() => {
    const searchTerm = deleteFilters.search.trim().toLowerCase();

    return deletionRecords.filter(record => {
      if (searchTerm && !record.name.toLowerCase().includes(searchTerm)) {
        return false;
      }

      if (deleteFilters.category !== 'all' && record.collection !== deleteFilters.category) {
        return false;
      }

      if (deleteFilters.universe !== 'all') {
        const matchesUniverse =
          record.collection === 'Universo'
            ? record.docId === deleteFilters.universe
            : record.universos.includes(deleteFilters.universe);

        if (!matchesUniverse) {
          return false;
        }
      }

      return true;
    });
  }, [deleteFilters, deletionRecords]);

  const selectedDeletionRecords = useMemo(
    () => filteredDeletionRecords.filter(record => deleteSelectedIds.includes(record.id)),
    [deleteSelectedIds, filteredDeletionRecords],
  );

  const displayedDeletionRecords = useMemo(
    () => filteredDeletionRecords.slice(0, visibleDeletionCount),
    [filteredDeletionRecords, visibleDeletionCount],
  );

  const { universeById, itemByCollectionAndId } = useMemo(
    () => createDeletionLookupMaps({ universos, data }),
    [data, universos],
  );

  const handleOpenUniversePopover = (event, recordId) => {
    event?.stopPropagation?.();
    setUniversePopover({ recordId, anchorEl: event.currentTarget });
  };

  const handleCloseUniversePopover = () => {
    setUniversePopover({ recordId: null, anchorEl: null });
  };

  const handleToggleDeletionRecord = recordId => {
    setDeleteSelectedIds(previous =>
      previous.includes(recordId)
        ? previous.filter(id => id !== recordId)
        : [...previous, recordId],
    );
  };

  const handleSelectAllVisibleDeletionRecords = () => {
    const nextIds = filteredDeletionRecords.map(record => record.id);
    setDeleteSelectedIds(nextIds);
  };

  const handleClearDeletionSelection = () => {
    setDeleteSelectedIds([]);
  };

  const updateDeleteFilters = updater => {
    setVisibleDeletionCount(DELETION_INITIAL_BATCH_SIZE);
    setDeleteFilters(previous => updater(previous));
  };

  const getUniverseDependencySnapshot = async universeId => {
    if (!universeId) {
      return { hasDependencies: false, dependencies: [] };
    }

    const [, personagens, registeredUsers] = await Promise.all([
      getRegras(),
      getPersonagens(),
      getAllRegisteredUsers(),
    ]);

    const dependencyGroups = [
      { label: 'Classes', items: data.classes },
      { label: 'Raças', items: data.racas },
      { label: 'Aptidões', items: data.aptidoes },
      { label: 'Corpos Especiais', items: data.corposEspeciais },
      { label: 'Origens', items: data.origens },
      { label: 'Divindades', items: data.divindades },
      { label: 'Artes', items: data.artes },
      { label: 'Veias Astrais', items: data.veiasAstrais },
      { label: 'Reinos de Cultivo', items: data.reinosCultivo },
      { label: 'Condições', items: data.condicoes },
      { label: 'Materiais', items: data.materiais },
      { label: 'Itens', items: data.itens },
      { label: 'Receitas', items: data.receitas },
      { label: 'CardFlux', items: data.cardflux },
      { label: 'Trickster Coin', items: data.tricksterCoin },
      { label: 'Regras', items: data.regras },
    ];

    const dependencies = [];
    const permissionDependencies = [];

    for (const group of dependencyGroups) {
      if (group.items.some(item => normalizeUniverseIds(item).includes(universeId))) {
        dependencies.push(group.label);
      }
    }

    if (
      personagens.some(item =>
        normalizeUniverseIds(item).includes(universeId) || item?.universo === universeId,
      )
    ) {
      dependencies.push('Personagens');
    }

    if (campanhas.some(campanha => normalizeCampaignUniverseId(campanha) === universeId)) {
      dependencies.push('Campanhas do Re');
    }

    const permissionResults = await Promise.all(
      registeredUsers.map(async user => {
        const permissions = await getUserPermissions(user.uid);
        return permissions?.universos?.includes(universeId)
          ? user.nome || user.uid
          : null;
      }),
    );

    permissionDependencies.push(
      ...permissionResults.filter(Boolean).map(name => `Permissões de usuário (${name})`),
    );

    if (permissionDependencies.length > 0) {
      dependencies.push(...permissionDependencies);
    }

    return {
      hasDependencies: dependencies.length > 0,
      dependencies: [...new Set(dependencies)],
    };
  };

  const handleDeleteSelectedRecords = async () => {
    if (selectedDeletionRecords.length === 0) {
      return;
    }

    const universeDependencyFailures = [];

    for (const record of selectedDeletionRecords) {
      if (record.collection !== 'Universo') {
        continue;
      }

      const dependencyCheck = await getUniverseDependencySnapshot(record.docId);
      if (dependencyCheck.hasDependencies) {
        universeDependencyFailures.push({
          record,
          reason: `O universo "${record.name}" possui dependências em ${dependencyCheck.dependencies.join(', ')}. A exclusão foi bloqueada.`,
        });
      }
    }

    if (universeDependencyFailures.length > 0) {
      setNotice({
        type: 'error',
        text: universeDependencyFailures[0].reason,
      });
      return;
    }

    const selectionSet = new Set(selectedDeletionRecords.map(record => record.id));

    const confirmationMessage = (
      <Box component="div" sx={{ textAlign: 'left' }}>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1 }}>
          Deseja excluir {selectedDeletionRecords.length} registro(s) selecionado(s)?
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'var(--text-primary)' }}>
          {selectedDeletionRecords.map(record => (
            <Box component="li" key={record.id} sx={{ mb: 0.5 }}>
              {record.categoryLabel}: {record.name}
            </Box>
          ))}
        </Box>
      </Box>
    );

    setDeleteSelectedIds([]);

    confirmDelete(
      `${selectedDeletionRecords.length} registros`,
      async () => {
        const successfulRecords = [];
        const failedRecords = [];

        for (const record of selectedDeletionRecords) {
          try {
            if (record.collection === 'Universo') {
              const dependencyCheck = await getUniverseDependencySnapshot(record.docId);

              if (dependencyCheck.hasDependencies) {
                failedRecords.push({
                  record,
                  reason: `O universo "${record.name}" possui dependências em ${dependencyCheck.dependencies.join(', ')}. A exclusão foi bloqueada.`,
                });
                continue;
              }
            }

            if (record.collection === 'classes') {
              await removeClasse(record.docId);
            } else if (record.collection === 'racas') {
              await removeRaca(record.docId);
            } else if (record.collection === 'aptidoes') {
              await removeAptidao(record.docId);
            } else if (record.collection === 'corposEspeciais') {
              await removeCorpoEspecial(record.docId);
            } else if (record.collection === 'origens') {
              await removeOrigem(record.docId);
            } else if (record.collection === 'divindades') {
              await removeDivindade(record.docId);
            } else if (record.collection === 'artes') {
              await removeArte(record.docId);
            } else if (record.collection === 'veiasAstrais') {
              await removeVeiaAstral(record.docId);
            } else if (record.collection === 'reinosCultivo') {
              await removeReinoCultivo(record.docId);
            } else if (record.collection === 'condicoes') {
              await removeCondicao(record.docId);
            } else if (record.collection === 'materiais') {
              await removeMaterial(record.docId);
            } else if (record.collection === 'itens') {
              await removeIten(record.docId);
            } else if (record.collection === 'receitas') {
              await removeReceita(record.docId);
            } else if (record.collection === 'cardflux') {
              await removeCardFlux(record.docId);
            } else if (record.collection === 'tricksterCoin') {
              await removeTricksterCoinBeneficio(record.docId);
            } else if (record.collection === 'regras') {
              await removeRegra(record.docId);
            } else if (record.collection === 'Universo') {
              await removeUniverso(record.docId);
            }

            successfulRecords.push(record);
          } catch (error) {
            failedRecords.push({
              record,
              reason:
                error?.message || `Não foi possível excluir ${record.name}.`,
            });
          }
        }

        const successfulUniverseIds = new Set(
          successfulRecords
            .filter(record => record.collection === 'Universo')
            .map(record => record.docId),
        );

        setData(previous => removeSuccessfulDeletionRecords(previous, successfulRecords));

        if (successfulUniverseIds.size > 0) {
          const nextUniversos = universos.filter(
            universo => !successfulUniverseIds.has(universo.id),
          );
          updateUniversos(nextUniversos);
        }

        setDeleteSelectedIds(previous =>
          previous.filter(id => !selectionSet.has(id)),
        );

        if (failedRecords.length === 0) {
          setNotice({
            type: 'success',
            text: `${successfulRecords.length} registro(s) excluído(s) com sucesso.`,
          });
        } else {
          const failureSummary = failedRecords
            .map(item => `${item.record.name} (${item.record.categoryLabel})`)
            .join(', ');

          setNotice({
            type: 'error',
            text: `Exclusão parcial concluída: ${successfulRecords.length} removido(s); ${failedRecords.length} falhou(ram). Detalhes: ${failureSummary}.`,
          });
        }

        if (successfulRecords.length === 0 && failedRecords.length > 0) {
          setNotice({
            type: 'error',
            text: failedRecords[0].reason,
          });
        }
      },
      confirmationMessage,
    );
  };

  const buildUniverseImageFormState = universe => {
    if (!universe) {
      return {
        source: 'link',
        selectedCampaignImage: '',
        customLink: '',
      };
    }

    const universeCampaignOptions = getUniverseCampaignImageOptions(universe, campanhas);
    const directImage = String(universe.linkImagem ?? '').trim();
    const fallbackCampaignImage = universeCampaignOptions[0]?.value || '';

    return {
      source: directImage ? 'link' : fallbackCampaignImage ? 'campaign' : 'link',
      selectedCampaignImage: fallbackCampaignImage,
      customLink: directImage,
    };
  };

  const handleSelectUniverse = universe => {
    setSelectedUniverseDetail(universe);
    if (universe) {
      setUniverseImageForm(buildUniverseImageFormState(universe));
    }
  };

  const handleSaveUniverseName = async () => {
    if (!selectedUniverseDetail?.id) {
      return;
    }

    const nextName = String(selectedUniverseDetail.Nome ?? '').trim();

    if (!nextName) {
      setNotice({
        type: 'error',
        text: 'Informe um nome válido para o universo.',
      });
      return;
    }

    setSaving(true);

    try {
      await updateUniverso(selectedUniverseDetail.id, {
        Nome: nextName,
      });

      const nextUniversos = universos.map(universo =>
        universo.id === selectedUniverseDetail.id
          ? { ...universo, Nome: nextName }
          : universo,
      );

      updateUniversos(nextUniversos);
      setSelectedUniverseDetail({
        ...selectedUniverseDetail,
        Nome: nextName,
      });
      setNotice({ type: 'success', text: 'Universo atualizado.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error?.message || 'Não foi possível atualizar o universo.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUniverse = async () => {
    if (!selectedUniverseDetail?.id) {
      return;
    }

    setSaving(true);

    try {
      await removeUniverso(selectedUniverseDetail.id);

      const nextUniversos = universos.filter(
        universo => universo.id !== selectedUniverseDetail.id,
      );

      updateUniversos(nextUniversos);
      setSelectedUniverseId(previous =>
        previous === selectedUniverseDetail.id ? '' : previous,
      );
      setSelectedUniverseDetail(null);
      setNotice({ type: 'success', text: 'Universo excluído.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error?.message || 'Não foi possível excluir o universo.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUniverseStatus = async nextActive => {
    if (!selectedUniverseDetail?.id || !isAdmin) {
      setNotice({
        type: 'error',
        text: 'Apenas administradores podem alterar o status do universo.',
      });
      return;
    }

    setSaving(true);

    try {
      await updateUniverso(selectedUniverseDetail.id, { ativo: nextActive });

      const nextUniversos = universos.map(universo =>
        universo.id === selectedUniverseDetail.id
          ? { ...universo, ativo: nextActive }
          : universo,
      );

      updateUniversos(nextUniversos);
      setSelectedUniverseDetail(previous =>
        previous ? { ...previous, ativo: nextActive } : previous,
      );
      setNotice({
        type: 'success',
        text: nextActive ? 'Universo reativado.' : 'Universo desativado.',
      });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error?.message || 'Não foi possível alterar o status do universo.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUniverseImage = async () => {
    if (!selectedUniverseDetail?.id) {
      return;
    }

    const nextImageValue =
      universeImageForm.source === 'campaign'
        ? universeImageForm.selectedCampaignImage
        : universeImageForm.customLink.trim();

    if (!nextImageValue) {
      setNotice({
        type: 'error',
        text: 'Selecione uma imagem da campanha ou informe um link válido.',
      });
      return;
    }

    setSaving(true);

    try {
      await updateUniverso(selectedUniverseDetail.id, {
        linkImagem: nextImageValue,
      });

      const nextUniversos = universos.map(universo =>
        universo.id === selectedUniverseDetail.id
          ? { ...universo, linkImagem: nextImageValue }
          : universo,
      );

      updateUniversos(nextUniversos);
      setSelectedUniverseDetail({
        ...selectedUniverseDetail,
        linkImagem: nextImageValue,
      });
      setUniverseImageForm({
        source: 'link',
        selectedCampaignImage: universeImageForm.selectedCampaignImage,
        customLink: nextImageValue,
      });
      setNotice({ type: 'success', text: 'Imagem do universo salva.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error?.message || 'Não foi possível salvar a imagem do universo.',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderUniverseCards = () => {
    if (filteredUniversos.length === 0) {
      return (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            background: 'linear-gradient(135deg, rgba(11, 17, 30, 0.94), rgba(17, 24, 39, 0.88))',
            border: '1px solid rgba(148, 163, 184, 0.18)',
            borderRadius: 3,
            color: 'var(--text-secondary)',
          }}
        >
          Nenhum universo encontrado para a busca atual.
        </Paper>
      );
    }

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
          gap: 2.5,
        }}
      >
        {filteredUniversos.map(universo => {
          const universeName = getUniverseName(universo);
          const fallbackUniverseImage = getUniverseVisualImage(universo, campanhas);
          const isActive = isUniverseActive(universo);

          return (
            <Paper
              key={universo.id}
              elevation={0}
              role="button"
              tabIndex={0}
              onDoubleClick={() => handleSelectUniverse(universo)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleSelectUniverse(universo);
                }
              }}
              sx={{
                p: 1.5,
                background: 'linear-gradient(135deg, rgba(11, 17, 30, 0.94), rgba(17, 24, 39, 0.9))',
                border: '1px solid rgba(148, 163, 184, 0.18)',
                borderRadius: 3,
                boxShadow: '0 16px 32px rgba(2, 6, 23, 0.24)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 180ms ease, border-color 180ms ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: 'rgba(96, 165, 250, 0.38)',
                },
                '&:focus-visible': {
                  outline: '2px solid rgba(96, 165, 250, 0.8)',
                  outlineOffset: '2px',
                },
              }}
            >
              <EntityImage
                src={fallbackUniverseImage}
                alt={universeName}
                height={180}
                objectFit="cover"
                placeholderText="Sem capa"
                fallbackText="Capa indisponível"
                sx={{
                  borderRadius: 2,
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                }}
              />

              <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    wordBreak: 'break-word',
                    lineHeight: 1.3,
                  }}
                >
                  {universeName}
                </Typography>
                <Chip
                  label={isActive ? 'Ativo' : 'Inativo'}
                  size="small"
                  sx={{
                    background: isActive ? 'rgba(34, 197, 94, 0.12)' : 'rgba(248, 113, 113, 0.12)',
                    color: isActive ? '#86efac' : '#fca5a5',
                    border: `1px solid ${isActive ? 'rgba(34, 197, 94, 0.35)' : 'rgba(248, 113, 113, 0.32)'}`,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                  }}
                />
              </Box>
            </Paper>
          );
        })}
      </Box>
    );
  };

  const renderItemList = list => (
    <Stack spacing={1.75}>
      {list.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            background: 'linear-gradient(135deg, rgba(11, 17, 30, 0.94), rgba(17, 24, 39, 0.88))',
            border: '1px solid rgba(148, 163, 184, 0.18)',
            borderRadius: 3,
            color: 'var(--text-secondary)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          Nenhum registro encontrado.
        </Paper>
      ) : (
        list.map(item => {
          const itemUniversos = normalizeUniverseIds(item);
          const isLinked = itemUniversos.includes(activeUniverseId);
          const isSelected = selectedIds.includes(item.id);
          const typeLabel = selectedCategory === 'aptidoes' ? 'Aptidão' : 'Condição';

          return (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                p: 1.5,
                display: 'flex',
                gap: 1.5,
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(12, 18, 30, 0.96))'
                  : 'linear-gradient(135deg, rgba(11, 17, 30, 0.92), rgba(17, 24, 39, 0.86))',
                border: isSelected
                  ? '1px solid rgba(234, 179, 8, 0.75)'
                  : '1px solid rgba(148, 163, 184, 0.18)',
                borderRadius: 3,
                boxShadow: isSelected
                  ? '0 18px 42px rgba(234, 179, 8, 0.12), inset 0 1px 0 rgba(255,255,255,0.04)'
                  : '0 12px 26px rgba(6, 10, 20, 0.28), inset 0 1px 0 rgba(255,255,255,0.03)',
                transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  borderColor: isSelected
                    ? 'rgba(234, 179, 8, 0.96)'
                    : 'rgba(96, 165, 250, 0.32)',
                  boxShadow: isSelected
                    ? '0 22px 46px rgba(234, 179, 8, 0.18), inset 0 1px 0 rgba(255,255,255,0.04)'
                    : '0 18px 30px rgba(59, 130, 246, 0.12), inset 0 1px 0 rgba(255,255,255,0.03)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.5, width: '100%' }}>
                <EntityImage
                  src={item.linkImagem}
                  alt={item.nome}
                  width={96}
                  height={96}
                  objectFit="cover"
                  placeholderText="Sem imagem"
                  fallbackText="Imagem indisponível"
                  sx={{
                    borderRadius: 2.5,
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                    flexShrink: 0,
                  }}
                />

                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    justifyContent: 'space-between',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 1,
                      minWidth: 0,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: 'var(--text-primary)',
                          fontWeight: 700,
                          lineHeight: 1.2,
                          wordBreak: 'break-word',
                        }}
                      >
                        {item.nome}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: 'var(--text-secondary)',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          mt: 0.4,
                        }}
                      >
                        {typeLabel}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', ml: 1 }}>
                      <UniverseCountBadge
                        universoIds={itemUniversos}
                        universos={universos}
                        emptyLabel="Sem universo"
                      />
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Chip
                      label={isLinked ? 'Vinculado' : 'Disponível'}
                      size="small"
                      sx={{
                        background: isLinked
                          ? 'rgba(41, 182, 246, 0.12)'
                          : 'rgba(234, 179, 8, 0.12)',
                        color: isLinked ? 'var(--color-accent)' : 'var(--text-primary)',
                        border: '1px solid',
                        borderColor: isLinked
                          ? 'rgba(41, 182, 246, 0.35)'
                          : 'rgba(234, 179, 8, 0.38)',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    />

                    <Button
                      variant={isSelected ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleToggleItem(item.id)}
                      aria-label={`Selecionar ${selectedCategory === 'aptidoes' ? 'aptidão' : 'condição'} ${item.nome}`}
                      aria-pressed={isSelected}
                      sx={{
                        minWidth: 128,
                        borderRadius: 2,
                        borderColor: isSelected ? 'transparent' : 'rgba(148, 163, 184, 0.28)',
                        color: isSelected ? 'rgba(4, 7, 16, 1)' : 'var(--text-primary)',
                        background: isSelected
                          ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.96), rgba(251, 191, 36, 0.85))'
                          : 'rgba(15, 23, 42, 0.48)',
                        fontWeight: 700,
                        boxShadow: isSelected
                          ? '0 12px 28px rgba(234, 179, 8, 0.25)'
                          : 'none',
                        '&:hover': {
                          background: isSelected
                            ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.98), rgba(251, 191, 36, 0.88))'
                            : 'rgba(15, 23, 42, 0.72)',
                          borderColor: isSelected ? 'transparent' : 'rgba(148, 163, 184, 0.38)',
                        },
                      }}
                    >
                      {isSelected ? 'Selecionado' : 'Selecionar'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          );
        })
      )}
    </Stack>
  );

  return (
    <Box className="page-container redungeon-gerenciador-universos" sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader
        title="Gerenciador de Universos"
        description="Gerencie vínculos entre universos e registros de Aptidões e Condições."
        sx={{
          justifyContent: 'center',
          textAlign: 'center',
          px: 2.5,
          py: 2.75,
          background: 'linear-gradient(180deg, rgba(9, 14, 26, 0.98), rgba(12, 18, 31, 0.86))',
          border: '1px solid rgba(234, 179, 8, 0.28)',
          boxShadow: '0 18px 38px rgba(15, 23, 42, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.02)',
          '& .MuiBox-root': {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          },
          '& .MuiTypography-h5': {
            color: 'var(--text-primary)',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textShadow: '0 0 26px rgba(234, 179, 8, 0.22)',
            fontSize: { xs: '1.65rem', md: '2.15rem' },
            lineHeight: 1.1,
            mb: 0.5,
          },
          '& .MuiTypography-body2': {
            color: 'var(--text-secondary)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontSize: '0.72rem',
            opacity: 0.9,
          },
        }}
      />

      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 2,
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              width: '100%',
            }}
          >
            {selectedCategory === 'universos' && (
              <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 240px' }, minWidth: { md: 220 } }}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="universe-status-filter-label">Status dos universos</InputLabel>
                  <Select
                    labelId="universe-status-filter-label"
                    value={universeStatusFilter}
                    label="Status dos universos"
                    onChange={event => setUniverseStatusFilter(event.target.value)}
                    sx={{ color: 'var(--text-primary)' }}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="active">Ativos</MenuItem>
                    <MenuItem value="inactive">Inativos</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}

            {selectedCategory !== 'universos' && selectedCategory !== 'exclusao' && (
              <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 340px' }, minWidth: { md: 280 } }}>
                <SearchableSelect
                  label="Universo"
                  options={[
                    { value: ALL_UNIVERSE_VALUE, label: 'Todos' },
                    ...allowedUniverseOptions.map(universo => ({
                      value: universo.id,
                      label: universo.Nome,
                    })),
                  ]}
                  value={
                    selectedUniverseOption
                      ? {
                          value: selectedUniverseOption.value ?? selectedUniverseOption.id ?? ALL_UNIVERSE_VALUE,
                          label: selectedUniverseOption.label ?? selectedUniverseOption.Nome ?? 'Todos',
                        }
                      : { value: ALL_UNIVERSE_VALUE, label: 'Todos' }
                  }
                  onChange={(_, newValue) => {
                    setSelectedUniverseId(newValue?.value ?? ALL_UNIVERSE_VALUE);
                    setSelectedIds([]);
                  }}
                  placeholder="Selecione um universo"
                  size="small"
                  disableClearable={false}
                  sortOptions={false}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minHeight: 52,
                      borderRadius: 2,
                      background: 'linear-gradient(180deg, rgba(8, 12, 22, 0.98), rgba(15, 23, 42, 0.9))',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 28px rgba(2, 6, 23, 0.26)',
                      transition: 'all 180ms ease',
                      '& fieldset': {
                        borderColor: 'rgba(234, 179, 8, 0.4)',
                        borderWidth: '1px',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(234, 179, 8, 0.75)',
                        boxShadow: '0 0 0 1px rgba(234, 179, 8, 0.14)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(96, 165, 250, 0.86)',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.18)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--text-secondary)',
                      fontSize: '0.72rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'var(--color-accent)',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      paddingTop: '14px',
                      paddingBottom: '14px',
                    },
                    '& .MuiAutocomplete-endAdornment': {
                      color: 'var(--text-secondary)',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'var(--text-secondary)',
                    },
                  }}
                />
              </Box>
            )}

            {selectedCategory === 'universos' ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'stretch', md: 'flex-end' },
                  flexWrap: 'wrap',
                  gap: 1.5,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <TextField
                  label="Pesquisar universos"
                  size="small"
                  value={universeSearch}
                  onChange={event => setUniverseSearch(event.target.value)}
                  sx={{
                    flex: { xs: '1 1 100%', md: '0 0 320px' },
                    maxWidth: { xs: '100%', md: 320 },
                    '& .MuiOutlinedInput-root': {
                      color: 'var(--text-primary)',
                      '& fieldset': { borderColor: 'var(--border-primary)' },
                      '&:hover fieldset': { borderColor: 'var(--border-hover)' },
                      '&.Mui-focused fieldset': { borderColor: 'var(--color-accent)' },
                    },
                    '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
                  }}
                />

                {canCreate && (
                  <Button
                    variant="contained"
                    onClick={() => setIsCreateUniverseOpen(true)}
                    sx={{
                      minWidth: { xs: '100%', sm: 190 },
                      borderRadius: 1.5,
                      px: 2.25,
                      py: 1,
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.22), rgba(250, 204, 21, 0.12))',
                      color: 'var(--text-primary)',
                      border: '1px solid rgba(234, 179, 8, 0.46)',
                      boxShadow: '0 10px 22px rgba(234, 179, 8, 0.12)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.28), rgba(250, 204, 21, 0.18))',
                        borderColor: 'rgba(234, 179, 8, 0.7)',
                      },
                    }}
                  >
                    Criar universo
                  </Button>
                )}
              </Box>
            ) : selectedCategory !== 'exclusao' ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'stretch', md: 'flex-end' },
                  flexWrap: 'wrap',
                  gap: 1.5,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => handleBulkUpdate('link')}
                  disabled={!canManageSelectedUniverse || saving || selectedIds.length === 0}
                  sx={{
                    minWidth: { xs: '100%', sm: 190 },
                    borderRadius: 1.5,
                    px: 2.25,
                    py: 1,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.22), rgba(250, 204, 21, 0.12))',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(234, 179, 8, 0.46)',
                    boxShadow: '0 10px 22px rgba(234, 179, 8, 0.12)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.28), rgba(250, 204, 21, 0.18))',
                      borderColor: 'rgba(234, 179, 8, 0.7)',
                    },
                    '&:disabled': {
                      background: 'rgba(15, 23, 42, 0.7)',
                      color: 'rgba(148, 163, 184, 0.6)',
                      borderColor: 'rgba(148, 163, 184, 0.2)',
                      boxShadow: 'none',
                    },
                  }}
                >
                  Vincular selecionados
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => handleBulkUpdate('unlink')}
                  disabled={!canManageSelectedUniverse || saving || selectedIds.length === 0}
                  sx={{
                    minWidth: { xs: '100%', sm: 210 },
                    borderRadius: 1.5,
                    px: 2.25,
                    py: 1,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    borderColor: 'rgba(248, 113, 113, 0.36)',
                    color: 'var(--text-primary)',
                    background: 'rgba(127, 29, 29, 0.12)',
                    '&:hover': {
                      borderColor: 'rgba(248, 113, 113, 0.54)',
                      background: 'rgba(127, 29, 29, 0.18)',
                    },
                    '&:disabled': {
                      borderColor: 'rgba(148, 163, 184, 0.2)',
                      color: 'rgba(148, 163, 184, 0.6)',
                      background: 'rgba(15, 23, 42, 0.4)',
                    },
                  }}
                >
                  Desvincular selecionados
                </Button>
              </Box>
            ) : null}
          </Box>

          {selectedCategory !== 'universos' && selectedCategory !== 'exclusao' && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', px: 0.5 }}>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                {selectedUniverseId === ALL_UNIVERSE_VALUE || activeUniverseId
                  ? `${selectedUniverseLabel} · ${linkedItems.length} vinculados · ${selectedIds.length} selecionados`
                  : 'Selecione um universo para visualizar e administrar os vínculos.'}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Tabs
              value={selectedCategory}
              onChange={(_, nextValue) => {
                setSelectedCategory(nextValue);
                setSelectedIds([]);
                setVisibleDeletionCount(DELETION_INITIAL_BATCH_SIZE);
              }}
              centered
              sx={{
                minHeight: 56,
                '& .MuiTabs-flexContainer': {
                  gap: 1.25,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                },
                '& .MuiTab-root': {
                  minWidth: { xs: 140, sm: 170 },
                  px: 2.5,
                  py: 1.2,
                  borderRadius: 2,
                  border: '1px solid transparent',
                  color: 'var(--text-secondary)',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background: 'rgba(15, 23, 42, 0.52)',
                  transition: 'all 180ms ease',
                  '&:hover': {
                    color: 'var(--text-primary)',
                    borderColor: 'rgba(148, 163, 184, 0.22)',
                    background: 'rgba(17, 24, 39, 0.72)',
                  },
                  '&:focus-visible': {
                    outline: '2px solid rgba(96, 165, 250, 0.7)',
                    outlineOffset: '2px',
                  },
                },
                '& .MuiTab-root.Mui-selected': {
                  color: 'var(--text-primary)',
                  background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.16), rgba(59, 130, 246, 0.12))',
                  borderColor: 'rgba(234, 179, 8, 0.5)',
                  boxShadow: '0 12px 28px rgba(234, 179, 8, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
                },
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
              }}
            >
              {TAB_OPTIONS.map(tab => (
                <Tab key={tab.value} value={tab.value} label={tab.label} />
              ))}
            </Tabs>
          </Box>

          {selectedCategory === 'exclusao' ? (
            <>
              {notice.text && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor:
                      notice.type === 'error' ? 'rgba(239, 68, 68, 0.6)' : notice.type === 'success' ? 'rgba(34, 197, 94, 0.5)' : 'var(--border-primary)',
                    background:
                      notice.type === 'error'
                        ? 'rgba(239, 68, 68, 0.08)'
                        : notice.type === 'success'
                          ? 'rgba(34, 197, 94, 0.08)'
                          : 'transparent',
                    color:
                      notice.type === 'error'
                        ? '#fca5a5'
                        : notice.type === 'success'
                          ? '#86efac'
                          : 'var(--text-secondary)',
                  }}
                >
                  {notice.text}
                </Box>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.5fr) minmax(180px, 220px) minmax(180px, 220px) minmax(150px, 170px)' },
                    gap: 1.5,
                    alignItems: 'center',
                  }}
                >
                  <TextField
                    label="Pesquisar registros"
                    size="small"
                    value={deleteFilters.search}
                    onChange={event =>
                      setDeleteFilters(previous => ({
                        ...previous,
                        search: event.target.value,
                      }))
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'var(--text-primary)',
                        '& fieldset': { borderColor: 'var(--border-primary)' },
                      },
                    }}
                  />

                  <Box sx={{ width: '100%' }}>
                    <SearchableSelect
                      label="Categoria"
                      options={[
                        { value: 'all', label: 'Todas' },
                        ...DELETION_CATEGORY_OPTIONS,
                      ]}
                      value={
                        deleteFilters.category === 'all'
                          ? null
                          : ([{ value: 'all', label: 'Todas' }, ...DELETION_CATEGORY_OPTIONS].find(
                              option => option.value === deleteFilters.category,
                            ) ?? null)
                      }
                      onChange={(_, nextValue) =>
                        updateDeleteFilters(previous => ({
                          ...previous,
                          category: nextValue?.value ?? 'all',
                        }))
                      }
                      size="small"
                      fullWidth
                      disableClearable
                      listboxMaxHeight="280px"
                      openOnFocus
                      placeholder="Todas"
                      sortOptions={false}
                      sx={{ width: '100%' }}
                    />
                  </Box>

                  <FormControl size="small" fullWidth>
                    <InputLabel id="delete-universe-filter-label">Universo</InputLabel>
                    <Select
                      labelId="delete-universe-filter-label"
                      value={deleteFilters.universe}
                      label="Universo"
                      onChange={event => {
                        hasUserChosenDeleteUniverse.current = true;
                        updateDeleteFilters(previous => ({
                          ...previous,
                          universe: event.target.value,
                        }));
                      }}
                      sx={{ color: 'var(--text-primary)' }}
                    >
                      <MenuItem value="all">Todos</MenuItem>
                      {universos.map(universo => (
                        <MenuItem key={universo.id} value={universo.id}>
                          {getUniverseName(universo)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <InputLabel id="delete-columns-label">Colunas</InputLabel>
                    <Select
                      labelId="delete-columns-label"
                      value={deleteColumnCount}
                      label="Colunas"
                      onChange={event => setDeleteColumnCount(Number(event.target.value))}
                      sx={{ color: 'var(--text-primary)' }}
                    >
                      {[1, 2, 3, 4].map(columns => (
                        <MenuItem key={columns} value={columns}>
                          {columns} coluna{columns > 1 ? 's' : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1.5,
                    flexWrap: 'wrap',
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    {filteredDeletionRecords.length} registro(s) encontrado(s)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        hasUserChosenDeleteUniverse.current = true;
                        setVisibleDeletionCount(DELETION_INITIAL_BATCH_SIZE);
                        setDeleteFilters({ search: '', category: 'all', universe: 'all' });
                      }}
                    >
                      Limpar filtros
                    </Button>
                    <Button variant="outlined" size="small" onClick={handleSelectAllVisibleDeletionRecords}>
                      Selecionar todos
                    </Button>
                    <Button variant="outlined" size="small" onClick={handleClearDeletionSelection}>
                      Desmarcar todos
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    {selectedDeletionRecords.length === 1
                      ? '1 selecionado'
                      : `${selectedDeletionRecords.length} selecionados`}
                  </Typography>
                </Box>

                {!isDeleteDialogOpen && (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        md: `repeat(${deleteColumnCount}, minmax(0, 1fr))`,
                      },
                      gap: 1.5,
                    }}
                  >
                    {displayedDeletionRecords.length === 0 && filteredDeletionRecords.length === 0 ? (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          border: '1px solid rgba(148, 163, 184, 0.18)',
                          background: 'rgba(15, 23, 42, 0.6)',
                          borderRadius: 2,
                          color: 'var(--text-secondary)',
                          gridColumn: '1 / -1',
                        }}
                      >
                        Nenhum registro encontrado para os filtros atuais.
                      </Paper>
                    ) : (
                      displayedDeletionRecords.map(record => {
                        const matchingItem =
                          record.collection === 'Universo'
                            ? universeById.get(String(record.docId))
                            : itemByCollectionAndId[record.collection]?.get(String(record.docId)) || null;
                        const imageSource = matchingItem?.linkImagem || '';
                        const universeNames =
                          record.universos
                            .map(universeId => {
                              const universe = universeById.get(String(universeId));
                              return universe ? getUniverseName(universe) : '';
                            })
                            .filter(Boolean);
                        const isPopoverOpen = universePopover.recordId === record.id;

                        const isSelected = deleteSelectedIds.includes(record.id);

                        return (
                          <Paper
                            key={record.id}
                            elevation={0}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isSelected}
                            onClick={() => handleToggleDeletionRecord(record.id)}
                            onKeyDown={event => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                handleToggleDeletionRecord(record.id);
                              }
                            }}
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              border: `1px solid ${isSelected ? 'rgba(234, 179, 8, 0.75)' : 'rgba(96, 165, 250, 0.2)'}`,
                              background: isSelected
                                ? 'linear-gradient(180deg, rgba(12, 20, 36, 0.98), rgba(7, 13, 24, 0.96))'
                                : 'linear-gradient(180deg, rgba(9, 15, 27, 0.97), rgba(15, 23, 42, 0.9))',
                              boxShadow: isSelected
                                ? '0 0 0 1px rgba(234, 179, 8, 0.24), 0 12px 24px rgba(234, 179, 8, 0.1)'
                                : 'inset 0 1px 0 rgba(148, 163, 184, 0.06), 0 10px 20px rgba(2, 6, 23, 0.2)',
                              minHeight: 86,
                              cursor: 'pointer',
                              transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease, background 180ms ease',
                              '&:hover': {
                                borderColor: isSelected ? 'rgba(234, 179, 8, 0.9)' : 'rgba(96, 165, 250, 0.38)',
                                boxShadow: isSelected
                                  ? '0 0 0 1px rgba(234, 179, 8, 0.32), 0 14px 28px rgba(234, 179, 8, 0.16)'
                                  : 'inset 0 1px 0 rgba(148, 163, 184, 0.08), 0 16px 32px rgba(59, 130, 246, 0.12)',
                                transform: 'translateY(-1px)',
                              },
                              '&:focus-visible': {
                                outline: '2px solid rgba(234, 179, 8, 0.72)',
                                outlineOffset: 2,
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.25,
                                minHeight: 58,
                                width: '100%',
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  minWidth: 0,
                                  flex: '1 1 auto',
                                }}
                              >
                                <EntityImage
                                  src={imageSource}
                                  alt={record.name}
                                  width={48}
                                  height={48}
                                  objectFit="cover"
                                  placeholderText="Sem imagem"
                                  fallbackText="Imagem indisponível"
                                  sx={{
                                    borderRadius: 1.5,
                                    border: '1px solid rgba(96, 165, 250, 0.18)',
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    flexShrink: 0,
                                  }}
                                />

                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    color: 'var(--text-primary)',
                                    fontWeight: 800,
                                    lineHeight: 1.15,
                                    letterSpacing: '0.01em',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    minWidth: 0,
                                  }}
                                >
                                  {record.name}
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  marginLeft: 'auto',
                                  flexShrink: 0,
                                }}
                              >
                                <Box
                                  onClick={event => event.stopPropagation()}
                                  onMouseEnter={event => handleOpenUniversePopover(event, record.id)}
                                  onMouseLeave={handleCloseUniversePopover}
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.55,
                                    px: 0.7,
                                    py: 0.35,
                                    borderRadius: 999,
                                    border: '1px solid rgba(234, 179, 8, 0.16)',
                                    background: 'rgba(15, 23, 42, 0.72)',
                                    width: 'auto',
                                    flex: '0 0 auto',
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: 'var(--text-secondary)',
                                      fontWeight: 700,
                                      letterSpacing: '0.08em',
                                      textTransform: 'uppercase',
                                      lineHeight: 1,
                                    }}
                                  >
                                    {record.universos.length}
                                  </Typography>

                                  {record.universos.length > 0 && (
                                    <IconButton
                                      size="small"
                                      aria-label={`Abrir universos vinculados de ${record.name}`}
                                      onClick={event => {
                                        event.stopPropagation();
                                        handleOpenUniversePopover(event, record.id);
                                      }}
                                      sx={{
                                        border: '1px solid rgba(148, 163, 184, 0.2)',
                                        background: 'rgba(15, 23, 42, 0.74)',
                                        color: 'var(--text-secondary)',
                                        width: 20,
                                        height: 20,
                                        '&:hover': {
                                          background: 'rgba(15, 23, 42, 0.9)',
                                          borderColor: 'rgba(234, 179, 8, 0.42)',
                                        },
                                      }}
                                    >
                                      <ArrowDropDownOutlinedIcon fontSize="small" />
                                    </IconButton>
                                  )}

                                  {record.universos.length > 0 && (
                                    <Popover
                                      open={isPopoverOpen}
                                      anchorEl={universePopover.anchorEl}
                                      onClose={handleCloseUniversePopover}
                                      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                      slotProps={{
                                        paper: {
                                          sx: {
                                            background: 'linear-gradient(180deg, rgba(11, 17, 30, 0.98), rgba(15, 23, 42, 0.9))',
                                            border: '1px solid rgba(96, 165, 250, 0.26)',
                                            borderRadius: 2,
                                            boxShadow: '0 18px 36px rgba(2, 6, 23, 0.36)',
                                            color: 'var(--text-primary)',
                                            p: 1,
                                            width: 260,
                                          },
                                        },
                                      }}
                                    >
                                      <Box sx={{ p: 0.5 }}>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            display: 'block',
                                            px: 1,
                                            pb: 0.75,
                                            color: 'var(--text-secondary)',
                                            fontWeight: 700,
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                          }}
                                        >
                                          Universos vinculados
                                        </Typography>

                                        <Box
                                          sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 0.8,
                                            maxHeight: universeNames.length > 6 ? 244 : 'auto',
                                            overflowY: universeNames.length > 6 ? 'auto' : 'visible',
                                            pr: universeNames.length > 6 ? 0.75 : 0,
                                          }}
                                        >
                                          {universeNames.map((name, index) => (
                                            <Box
                                              key={`${record.id}-${name}-${index}`}
                                              sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                px: 0.75,
                                                py: 0.55,
                                                borderRadius: 1.5,
                                                background: 'rgba(15, 23, 42, 0.72)',
                                                border: '1px solid rgba(148, 163, 184, 0.12)',
                                              }}
                                            >
                                              <Box
                                                sx={{
                                                  width: 8,
                                                  height: 8,
                                                  borderRadius: '50%',
                                                  background: 'linear-gradient(135deg, rgba(41, 182, 246, 0.9), rgba(96, 165, 250, 0.7))',
                                                  boxShadow: '0 0 10px rgba(96, 165, 250, 0.4)',
                                                }}
                                              />
                                              <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                                {name}
                                              </Typography>
                                            </Box>
                                          ))}
                                        </Box>
                                      </Box>
                                    </Popover>
                                  )}
                                </Box>

                                <Chip
                                  label={record.categoryLabel}
                                  size="small"
                                  sx={{
                                    background: record.collection === 'Universo'
                                      ? 'rgba(96, 165, 250, 0.12)'
                                      : 'rgba(234, 179, 8, 0.12)',
                                    color: record.collection === 'Universo' ? 'var(--color-accent)' : '#f4d77a',
                                    border: '1px solid rgba(148, 163, 184, 0.22)',
                                    fontWeight: 800,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                    '& .MuiChip-label': { px: 0.75, fontSize: '0.6rem' },
                                    flex: '0 0 auto',
                                  }}
                                />

                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    background: isSelected ? 'rgba(234, 179, 8, 0.08)' : 'transparent',
                                    transition: 'all 180ms ease',
                                    '&:hover': { background: 'rgba(234, 179, 8, 0.08)' },
                                    flex: '0 0 20px',
                                  }}
                                  onClick={event => {
                                    event.stopPropagation();
                                    handleToggleDeletionRecord(record.id);
                                  }}
                                  onKeyDown={event => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault();
                                      handleToggleDeletionRecord(record.id);
                                    }
                                  }}
                                  role="checkbox"
                                  aria-checked={isSelected}
                                  aria-label={isSelected ? `Desmarcar ${record.name}` : `Selecionar ${record.name}`}
                                  tabIndex={0}
                                >
                                  <Box
                                    sx={{
                                      width: 14,
                                      height: 14,
                                      borderRadius: '50%',
                                      border: `2px solid ${isSelected ? 'rgba(234, 179, 8, 0.9)' : 'rgba(148, 163, 184, 0.5)'}`,
                                      background: isSelected ? 'radial-gradient(circle, rgba(234, 179, 8, 0.95), rgba(234, 179, 8, 0.62))' : 'rgba(15, 23, 42, 0.6)',
                                      boxShadow: isSelected ? '0 0 10px rgba(234, 179, 8, 0.3)' : 'none',
                                      transition: 'all 180ms ease',
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                          </Paper>
                        );
                      })
                    )}
                  </Box>
                )}

                {filteredDeletionRecords.length > displayedDeletionRecords.length && (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setVisibleDeletionCount(previous => previous + DELETION_INITIAL_BATCH_SIZE)}
                    >
                      Carregar mais
                    </Button>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="error"
                    disabled={selectedDeletionRecords.length === 0}
                    onClick={handleDeleteSelectedRecords}
                    sx={{
                      minWidth: 220,
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Excluir selecionados
                  </Button>
                </Box>
                </Box>
            </>
          ) : selectedCategory === 'universos' ? (
            <>
              {notice.text && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor:
                      notice.type === 'error' ? 'rgba(239, 68, 68, 0.6)' : notice.type === 'success' ? 'rgba(34, 197, 94, 0.5)' : 'var(--border-primary)',
                    background:
                      notice.type === 'error'
                        ? 'rgba(239, 68, 68, 0.08)'
                        : notice.type === 'success'
                          ? 'rgba(34, 197, 94, 0.08)'
                          : 'transparent',
                    color:
                      notice.type === 'error'
                        ? '#fca5a5'
                        : notice.type === 'success'
                          ? '#86efac'
                          : 'var(--text-secondary)',
                  }}
                >
                  {notice.text}
                </Box>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {loadingUniversos ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress sx={{ color: 'var(--color-accent)' }} />
                  </Box>
                ) : (
                  renderUniverseCards()
                )}
              </Box>
            </>
          ) : activeUniverseId ? (
            <>
              {notice.text && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor:
                      notice.type === 'error' ? 'rgba(239, 68, 68, 0.6)' : notice.type === 'success' ? 'rgba(34, 197, 94, 0.5)' : 'var(--border-primary)',
                    background:
                      notice.type === 'error'
                        ? 'rgba(239, 68, 68, 0.08)'
                        : notice.type === 'success'
                          ? 'rgba(34, 197, 94, 0.08)'
                          : 'transparent',
                    color:
                      notice.type === 'error'
                        ? '#fca5a5'
                        : notice.type === 'success'
                          ? '#86efac'
                          : 'var(--text-secondary)',
                  }}
                >
                  {notice.text}
                </Box>
              )}

              {loadingItems || loadingUniversos ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress sx={{ color: 'var(--color-accent)' }} />
                </Box>
              ) : !canManageSelectedUniverse ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-card)',
                    borderRadius: 2,
                    color: 'var(--text-secondary)',
                  }}
                >
                  Você não tem permissão para alterar vínculos neste universo.
                </Paper>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1.5, color: 'var(--text-primary)' }}>
                      Vinculados ao universo
                    </Typography>
                    {renderFilterBar({
                      area: 'linked',
                      state: linkedFilters,
                      onChange: nextState => updateFilterState('linked', nextState),
                      sortLabel: 'Ordenação vinculados',
                    })}
                    {renderItemList(linkedItems)}
                  </Box>

                  <Box>
                    <Typography variant="h6" sx={{ mb: 1.5, color: 'var(--text-primary)' }}>
                      Disponíveis para vincular
                    </Typography>
                    {renderFilterBar({
                      area: 'available',
                      state: availableFilters,
                      onChange: nextState => updateFilterState('available', nextState),
                      sortLabel: 'Ordenação disponíveis',
                    })}
                    {renderItemList(availableItems)}
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-card)',
                borderRadius: 2,
                color: 'var(--text-secondary)',
              }}
            >
              Selecione um universo para visualizar e administrar os registros vinculados.
            </Paper>
          )}
        </Stack>
      </Paper>

      {selectedUniverseDetail && (
        <EntityViewDialog
          open={Boolean(selectedUniverseDetail)}
          onClose={() => setSelectedUniverseDetail(null)}
          titulo={getUniverseName(selectedUniverseDetail)}
          subtitulo="Universo"
          imagem={getUniverseVisualImage(selectedUniverseDetail, campanhas)}
          descricao={
            selectedUniverseDetail?.descricao ||
            `Catalogo do universo ${getUniverseName(selectedUniverseDetail)}.`
          }
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              p: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(148, 163, 184, 0.18)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: 'var(--color-accent)',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  Status do universo
                </Typography>
                <Chip
                  label={getUniverseStatusLabel(selectedUniverseDetail)}
                  size="small"
                  sx={{
                    background: isUniverseActive(selectedUniverseDetail) ? 'rgba(34, 197, 94, 0.12)' : 'rgba(248, 113, 113, 0.12)',
                    color: isUniverseActive(selectedUniverseDetail) ? '#86efac' : '#fca5a5',
                    border: `1px solid ${isUniverseActive(selectedUniverseDetail) ? 'rgba(34, 197, 94, 0.35)' : 'rgba(248, 113, 113, 0.32)'}`,
                  }}
                />
              </Box>

              {isAdmin && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                  {isUniverseActive(selectedUniverseDetail) ? (
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() =>
                        confirmDelete(
                          getUniverseName(selectedUniverseDetail),
                          () => handleToggleUniverseStatus(false),
                          'Este universo ficará indisponível para novas associações. Os registros existentes serão preservados e nenhum dado será excluído.',
                          { title: 'Confirmar desativação', confirmText: 'Desativar' },
                        )
                      }
                      disabled={saving}
                      sx={{
                        minWidth: 180,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Desativar universo
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() =>
                        confirmDelete(
                          getUniverseName(selectedUniverseDetail),
                          () => handleToggleUniverseStatus(true),
                          'Este universo voltará a ficar disponível para novas associações.',
                          { title: 'Confirmar reativação', confirmText: 'Reativar' },
                        )
                      }
                      disabled={saving}
                      sx={{
                        minWidth: 180,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Reativar universo
                    </Button>
                  )}
                </Box>
              )}
            </Box>

            <TextField
              label="Nome do universo"
              value={selectedUniverseDetail?.Nome ?? ''}
              onChange={event =>
                setSelectedUniverseDetail(previous =>
                  previous ? { ...previous, Nome: event.target.value } : previous,
                )
              }
              size="small"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'var(--text-primary)',
                  '& fieldset': { borderColor: 'var(--border-primary)' },
                },
              }}
            />

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Button
                variant="contained"
                onClick={handleSaveUniverseName}
                disabled={saving}
                sx={{
                  minWidth: 220,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Salvar alterações do universo
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={() =>
                  confirmDelete(
                    getUniverseName(selectedUniverseDetail),
                    handleDeleteUniverse,
                    'Para excluir este universo, é recomendado remover primeiro os dados vinculados, como campanhas no Re:Master, fichas e outras informações do banco de dados. Isso pode ser feito na aba Exclusões.',
                  )
                }
                disabled={saving}
                sx={{
                  minWidth: 180,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  borderColor: 'rgba(248, 113, 113, 0.56)',
                  color: '#fca5a5',
                  '&:hover': {
                    borderColor: 'rgba(248, 113, 113, 0.8)',
                    background: 'rgba(127, 29, 29, 0.12)',
                  },
                }}
              >
                Excluir universo
              </Button>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(148, 163, 184, 0.18)',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'var(--color-accent)',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                Imagem do universo
              </Typography>

              <FormControl fullWidth size="small">
                <InputLabel id="universe-image-source-label">Fonte da imagem</InputLabel>
                <Select
                  labelId="universe-image-source-label"
                  value={universeImageForm.source}
                  label="Fonte da imagem"
                  onChange={event =>
                    setUniverseImageForm(previous => ({
                      ...previous,
                      source: event.target.value,
                    }))
                  }
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--border-primary)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'var(--text-primary)',
                    },
                  }}
                >
                  <MenuItem value="campaign">Usar imagem da campanha</MenuItem>
                  <MenuItem value="link">Usar link direto</MenuItem>
                </Select>
              </FormControl>

              {universeImageForm.source === 'campaign' ? (
                <FormControl fullWidth size="small">
                  <InputLabel id="universe-campaign-image-label">Campanha</InputLabel>
                  <Select
                    labelId="universe-campaign-image-label"
                    value={universeImageForm.selectedCampaignImage}
                    label="Campanha"
                    onChange={event =>
                      setUniverseImageForm(previous => ({
                        ...previous,
                        selectedCampaignImage: event.target.value,
                      }))
                    }
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--border-primary)',
                      },
                      '& .MuiInputBase-input': {
                        color: 'var(--text-primary)',
                      },
                    }}
                  >
                    {getUniverseCampaignImageOptions(selectedUniverseDetail, campanhas).map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  label="URL da imagem do universo"
                  value={universeImageForm.customLink}
                  onChange={event =>
                    setUniverseImageForm(previous => ({
                      ...previous,
                      customLink: event.target.value,
                    }))
                  }
                  size="small"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'var(--text-primary)',
                      '& fieldset': { borderColor: 'var(--border-primary)' },
                    },
                  }}
                />
              )}

              <Button
                variant="contained"
                onClick={handleSaveUniverseImage}
                disabled={saving}
                sx={{
                  alignSelf: 'flex-end',
                  minWidth: 210,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Salvar imagem do universo
              </Button>
            </Box>

            <Typography
              variant="subtitle2"
              sx={{
                color: 'var(--color-accent)',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Campanhas criadas
            </Typography>

            {campanhas.filter(campanha => normalizeCampaignUniverseId(campanha) === String(selectedUniverseDetail.id ?? '')).length === 0 ? (
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                Nenhuma campanha criada neste universo.
              </Typography>
            ) : (
              <Stack spacing={1.25}>
                {campanhas
                  .filter(
                    campanha =>
                      normalizeCampaignUniverseId(campanha) ===
                      String(selectedUniverseDetail.id ?? ''),
                  )
                  .map(campanha => (
                    <Box
                      key={campanha.id || getCampaignName(campanha)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.25,
                        borderRadius: 2,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <EntityImage
                        src={getCampaignImageSource(campanha)}
                        alt={getCampaignName(campanha)}
                        width={72}
                        height={72}
                        objectFit="cover"
                        placeholderText="Sem imagem"
                        fallbackText="Imagem indisponível"
                        sx={{
                          borderRadius: 2,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ color: 'var(--text-primary)', fontWeight: 700 }}
                        >
                          {getCampaignName(campanha)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'var(--text-secondary)',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Campanha
                        </Typography>
                      </Box>
                    </Box>
                  ))}
              </Stack>
            )}
          </Box>
        </EntityViewDialog>
      )}

      {deleteConfirmationDialog}

      <Dialog
        open={isCreateUniverseOpen}
        onClose={() => setIsCreateUniverseOpen(false)}
        aria-labelledby="create-universe-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <Formik
          initialValues={UNIVERSE_FORM_INITIAL_VALUES}
          validationSchema={UNIVERSE_FORM_SCHEMA}
          onSubmit={handleCreateUniverse}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              <DialogTitle id="create-universe-dialog-title" sx={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                Novo universo
              </DialogTitle>
              <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5 }}>
                <TextField
                  name="Nome"
                  label="Nome do universo"
                  value={values.Nome}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.Nome && errors.Nome)}
                  helperText={touched.Nome && errors.Nome}
                  required
                  fullWidth
                  sx={{
                    '& .MuiInputBase-root': {
                      background: 'rgba(15, 23, 42, 0.5)',
                    },
                  }}
                />

                <TextField
                  name="linkImagem"
                  label="URL da imagem de capa"
                  value={values.linkImagem}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.linkImagem && errors.linkImagem)}
                  helperText={touched.linkImagem && errors.linkImagem}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-root': {
                      background: 'rgba(15, 23, 42, 0.5)',
                    },
                  }}
                />

                {values.linkImagem && (
                  <EntityImage
                    src={values.linkImagem}
                    alt="Pré-visualização da capa do universo"
                    height={180}
                    objectFit="cover"
                    placeholderText="Sem capa"
                    fallbackText="Imagem indisponível"
                    sx={{
                      borderRadius: 2,
                      border: '1px solid rgba(148, 163, 184, 0.18)',
                    }}
                  />
                )}
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2, pt: 0.5, justifyContent: 'space-between' }}>
                <Button
                  onClick={() => setIsCreateUniverseOpen(false)}
                  variant="text"
                  sx={{ color: 'var(--text-secondary)' }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || saving}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.16), rgba(59, 130, 246, 0.16))',
                    border: '1px solid rgba(234, 179, 8, 0.42)',
                    color: 'var(--text-primary)',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Salvar universo
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
};

export default GerenciadorUniversos;
