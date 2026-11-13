import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { useAuth } from 'context/AuthContext';
import useUniversos from 'hooks/useUniversos';
import PageHeader from 'components/PageHeader/PageHeader';
import SearchableSelect from 'components/SearchableSelect/SearchableSelect';
import { db } from 'service/firebase';
import { getAptidoes, getCondicoes } from 'service/storage';
import EntityImage from 'components/EntityImage/EntityImage';
import { UniverseCountBadge } from 'components/CardTokens/CardTokens';

const TAB_OPTIONS = [
  { value: 'aptidoes', label: 'Aptidões' },
  { value: 'condicoes', label: 'Condições' },
];

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

const EMPTY_FILTER_STATE = {
  search: '',
  sort: 'asc',
};

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
  const { isAdmin, allowedUniversos } = useAuth();
  const { universos, loadingUniversos } = useUniversos();

  const [selectedCategory, setSelectedCategory] = useState('aptidoes');
  const [selectedUniverseId, setSelectedUniverseId] = useState('');
  const [linkedFilters, setLinkedFilters] = useState(EMPTY_FILTER_STATE);
  const [availableFilters, setAvailableFilters] = useState(EMPTY_FILTER_STATE);
  const [selectedIds, setSelectedIds] = useState([]);
  const [data, setData] = useState({ aptidoes: [], condicoes: [] });
  const [loadingItems, setLoadingItems] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: 'info', text: '' });

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoadingItems(true);
      setNotice({ type: 'info', text: '' });

      try {
        const [aptidoes, condicoes] = await Promise.all([
          getAptidoes(),
          getCondicoes(),
        ]);

        if (!active) return;

        setData({
          aptidoes: Array.isArray(aptidoes) ? aptidoes : [],
          condicoes: Array.isArray(condicoes) ? condicoes : [],
        });
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

  const allowedUniverseOptions = useMemo(() => {
    if (isAdmin) {
      return universos;
    }

    return universos.filter(universo => allowedUniversos.includes(universo.id));
  }, [allowedUniversos, isAdmin, universos]);

  const activeUniverseId = selectedUniverseId || allowedUniverseOptions[0]?.id || '';

  const selectedUniverseLabel =
    universos.find(universo => universo.id === activeUniverseId)?.Nome ||
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
    !activeUniverseId
      ? false
      : isAdmin || allowedUniversos.includes(activeUniverseId);

  const selectedUniverseOption =
    allowedUniverseOptions.find(universo => universo.id === activeUniverseId) || null;

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

  const handleBulkUpdate = async action => {
    if (!activeUniverseId || !canManageSelectedUniverse) {
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

        try {
          const result = await persistUniverseMutation({
            collectionName,
            itemId: item.id,
            action,
            universeId: activeUniverseId,
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
    <Box className="page-container" sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
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
            <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 340px' }, minWidth: { md: 280 } }}>
              <SearchableSelect
                label="Universo"
                options={allowedUniverseOptions.map(universo => ({
                  value: universo.id,
                  label: universo.Nome,
                }))}
                value={selectedUniverseOption ? { value: selectedUniverseOption.id, label: selectedUniverseOption.Nome } : null}
                onChange={(_, newValue) => {
                  setSelectedUniverseId(newValue?.value ?? '');
                  setSelectedIds([]);
                }}
                placeholder="Selecione um universo"
                size="small"
                disableClearable={false}
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
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', px: 0.5 }}>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
              {activeUniverseId
                ? `${selectedUniverseLabel} · ${linkedItems.length} vinculados · ${selectedIds.length} selecionados`
                : 'Selecione um universo para visualizar e administrar os vínculos.'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Tabs
              value={selectedCategory}
              onChange={(_, nextValue) => {
                setSelectedCategory(nextValue);
                setSelectedIds([]);
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

          {activeUniverseId ? (
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
    </Box>
  );
};

export default GerenciadorUniversos;
