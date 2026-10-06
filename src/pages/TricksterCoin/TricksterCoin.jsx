import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import SearchableSelect from 'components/SearchableSelect/SearchableSelect';
import { Field, FieldArray, Form, Formik } from 'formik';
import { useAuth } from 'context/AuthContext';
import useDeleteConfirmation from 'hooks/useDeleteConfirmation';
import useUniversos from 'hooks/useUniversos';
import {
  addTricksterCoinBeneficio,
  getTricksterCoinBeneficios,
  removeTricksterCoinBeneficio,
  updateTricksterCoinBeneficio,
} from 'service/storage';
import TricksterCoinCard from './TricksterCoinCard';
import {
  BENEFICIO_INITIAL_VALUES,
  BONUS_TYPE_OPTIONS,
  STATUS_OPTIONS,
  TRICKSTER_COIN_SCHEMA,
  PERIODO_OPTIONS,
  getTricksterCoinTagOptions,
  getTricksterCoinUniversos,
  normalizeBenefitPayload,
  normalizeBenefitTag,
  normalizeBonusEntries,
  normalizeTokensValue,
  resolveBenefitTag,
} from './utils';

const ACCUMULABLE_OPTIONS = ['Todos', 'Sim', 'Não'];
const ACCUMULABLE_FORM_OPTIONS = [
  { value: true, label: 'Sim' },
  { value: false, label: 'Não' },
];
const SORT_OPTIONS = [
  { value: 'nome-asc', label: 'Nome (A → Z)' },
  { value: 'nome-desc', label: 'Nome (Z → A)' },
  { value: 'custo-asc', label: 'Menor custo' },
  { value: 'custo-desc', label: 'Maior custo' },
];

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    background: 'rgba(8, 13, 22, 0.72)',
    borderRadius: 2.5,
    color: 'var(--text-primary)',
    transition: 'all 180ms ease',
    '& fieldset': {
      borderColor: 'rgba(148, 163, 184, 0.22)',
      borderWidth: 1,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(96, 165, 250, 0.42)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(96, 208, 255, 0.9)',
      boxShadow: '0 0 0 3px rgba(96, 208, 255, 0.12)',
    },
    '&.Mui-disabled': {
      background: 'rgba(15, 23, 42, 0.35)',
      color: 'var(--text-muted)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'var(--text-secondary)',
    transform: 'translate(14px, -9px) scale(0.75)',
    '&.Mui-focused': { color: 'var(--color-accent)' },
  },
  '& .MuiInputBase-input': {
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
  },
  '& .MuiInputBase-input::placeholder': {
    color: 'var(--text-muted)',
    opacity: 1,
  },
  '& .MuiFormHelperText-root': {
    color: '#fca5a5',
    marginLeft: 0,
    marginTop: 0.6,
  },
  '& .MuiFormHelperText-root.Mui-error': {
    color: '#fca5a5',
  },
  '& .MuiOutlinedInput-inputMultiline': {
    resize: 'vertical',
    minHeight: 96,
  },
};

const sectionTitleSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  color: 'var(--text-primary)',
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  fontSize: '0.72rem',
  px: 0.5,
  '&::before': {
    content: '""',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #facc15, #d4a830)',
    boxShadow: '0 0 12px rgba(250, 204, 21, 0.42)',
  },
};

const sectionSurfaceSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  p: 1.75,
  borderRadius: 3,
  border: '1px solid rgba(148, 163, 184, 0.12)',
  background: 'linear-gradient(180deg, rgba(11, 17, 29, 0.88), rgba(15, 23, 42, 0.64))',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
};

const buildSelectOptions = values => values.map(value => ({ value, label: value }));

const normalizeTokenInput = value => {
  const candidate = String(value ?? '').trim();
  if (!candidate) {
    return '';
  }

  return candidate.replace(/,$/, '').trim();
};

const createBonusEntry = bonusEntry => ({
  texto: String(bonusEntry?.texto ?? bonusEntry?.descricao ?? '').trim(),
  tipo: bonusEntry?.tipo ?? 'Vantagem',
});

const sortBenefits = (benefits, sortValue) => {
  const items = [...benefits];

  switch (sortValue) {
    case 'nome-desc':
      return items.sort((a, b) => b.nome.localeCompare(a.nome, 'pt-BR'));
    case 'custo-asc':
      return items.sort((a, b) => (a.custo ?? 0) - (b.custo ?? 0));
    case 'custo-desc':
      return items.sort((a, b) => (b.custo ?? 0) - (a.custo ?? 0));
    case 'nome-asc':
    default:
      return items.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }
};

const getInitialValues = benefit => {
  const bonusLegacy = Array.isArray(benefit?.bonus)
    ? benefit.bonus
    : benefit?.bonus
      ? [benefit.bonus]
      : [];

  const normalizedBonus = normalizeBonusEntries(
    bonusLegacy.length > 0 ? bonusLegacy : benefit?.tipoBonus ? [{ texto: '', tipo: benefit.tipoBonus }] : [],
    benefit?.tipoBonus ?? 'Vantagem',
  );

  const preparedBonus =
    normalizedBonus.length > 0
      ? normalizedBonus.map(createBonusEntry)
      : [{ texto: '', tipo: 'Vantagem' }];

  return {
    ...BENEFICIO_INITIAL_VALUES,
    ...(benefit || {}),
    nome: benefit?.nome ?? '',
    descricao: benefit?.descricao ?? '',
    linkImagem: benefit?.linkImagem ?? '',
    tag: benefit?.tag ?? '',
    universos: getTricksterCoinUniversos(benefit),
    bonus: preparedBonus,
    custo: benefit?.custo ?? 0,
    tokens: normalizeTokensValue(benefit?.tokens),
    acumulavel: benefit?.acumulavel ?? true,
    limiteAcumulacao: benefit?.limiteAcumulacao ?? 0,
    limitePorPeriodo: benefit?.limitePorPeriodo ?? 0,
    periodo: benefit?.periodo || 'Nenhum',
    status: benefit?.status ?? 'Ativo',
  };
};

const TricksterCoin = () => {
  const { canCreate } = useAuth();
  const { confirmDelete, deleteConfirmationDialog } = useDeleteConfirmation();
  const [benefits, setBenefits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [selectedTag, setSelectedTag] = useState('Todos');
  const [selectedUniverse, setSelectedUniverse] = useState('Todos');
  const [selectedBonusType, setSelectedBonusType] = useState('Todos');
  const [selectedAcumulavel, setSelectedAcumulavel] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [sortValue, setSortValue] = useState('nome-asc');
  const [tokenInput, setTokenInput] = useState('');
  const [duplicatingBenefitId, setDuplicatingBenefitId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const { universos } = useUniversos();
  const tricksterCoinUniversosOptions = useMemo(() => {
    const seenUniverseKeys = new Set();

    return universos
      .filter(universo => {
        const universeId = String(universo?.id ?? '').trim();
        const universeName = String(universo?.Nome ?? universo?.nome ?? '').trim();

        if (!universeId && !universeName) {
          return false;
        }

        if (universeName.toLowerCase() === 'todos os universos') {
          return false;
        }

        const dedupeKey = universeId || universeName.toLowerCase();
        if (seenUniverseKeys.has(dedupeKey)) {
          return false;
        }

        seenUniverseKeys.add(dedupeKey);
        return true;
      })
      .map(universo => ({ value: universo.id, label: universo.Nome }));
  }, [universos]);

  const refreshBenefits = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const items = await getTricksterCoinBeneficios();
      setBenefits(Array.isArray(items) ? items : []);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erro ao carregar benefícios da Trickster Coin:', error);
      setBenefits([]);
      setLoadError('Não foi possível carregar os benefícios da Trickster Coin.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    getTricksterCoinBeneficios()
      .then(items => {
        if (active) {
          setBenefits(Array.isArray(items) ? items : []);
        }
      })
      .catch(error => {
        if (!active) {
          return;
        }

        // eslint-disable-next-line no-console
        console.error('Erro ao carregar benefícios da Trickster Coin:', error);
        setBenefits([]);
        setLoadError('Não foi possível carregar os benefícios da Trickster Coin.');
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const benefitTags = useMemo(
    () => getTricksterCoinTagOptions(benefits),
    [benefits],
  );

  const tagOptions = useMemo(() => ['Todos', ...benefitTags], [benefitTags]);
  const activeTagValue = tagOptions.includes(selectedTag)
    ? selectedTag
    : 'Todos';

  const filteredBenefits = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return sortBenefits(
      benefits.filter(benefit => {
        const matchesSearch =
          !query ||
          [benefit.nome, benefit.descricao, benefit.tag]
            .filter(Boolean)
            .some(value => String(value).toLowerCase().includes(query));

        const matchesTag =
          activeTagValue === 'Todos' || benefit.tag === activeTagValue;

        const matchesUniverse =
          selectedUniverse === 'Todos' ||
          (Array.isArray(benefit?.universos) && benefit.universos.includes(selectedUniverse));

        const bonusEntries = normalizeBonusEntries(
          benefit?.bonus,
          benefit?.tipoBonus ?? 'Neutro',
        );
        const matchesBonusType =
          selectedBonusType === 'Todos' ||
          bonusEntries.some(entry => entry.tipo === selectedBonusType);

        const matchesAcumulavel =
          selectedAcumulavel === 'Todos' ||
          String(Boolean(benefit.acumulavel)) ===
            (selectedAcumulavel === 'Sim' ? 'true' : 'false');

        const matchesStatus =
          selectedStatus === 'Todos' || benefit.status === selectedStatus;

        return (
          matchesSearch &&
          matchesTag &&
          matchesUniverse &&
          matchesBonusType &&
          matchesAcumulavel &&
          matchesStatus
        );
      }),
      sortValue,
    );
  }, [
    benefits,
    searchValue,
    activeTagValue,
    selectedUniverse,
    selectedBonusType,
    selectedAcumulavel,
    selectedStatus,
    sortValue,
  ]);

  const resultCount = filteredBenefits.length;

  const handleOpenCreateModal = () => {
    setEditingBenefit(null);
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = benefit => {
    setEditingBenefit(benefit);
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBenefit(null);
    setSubmitError('');
  };

  const handleSubmitBenefit = async (values, { setSubmitting, resetForm }) => {
    setSubmitError('');

    try {
      const validBonusEntries = normalizeBonusEntries(values.bonus, 'Vantagem');

      if (validBonusEntries.length === 0) {
        setSubmitError('Adicione ao menos um bônus válido com texto e tipo.');
        return;
      }

      const payload = normalizeBenefitPayload({
        ...values,
        bonus: validBonusEntries,
        tokens: normalizeTokensValue(values.tokens),
      });

      if (editingBenefit) {
        await updateTricksterCoinBeneficio(editingBenefit.id, payload);
      } else {
        await addTricksterCoinBeneficio(payload);
      }

      resetForm();
      await refreshBenefits();
      handleCloseModal();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erro ao salvar benefício da Trickster Coin:', error);
      setSubmitError(
        'Não foi possível salvar o benefício. Verifique os dados e tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const buildDuplicateName = (sourceName, existingNames = []) => {
    const baseName = String(sourceName ?? '').trim() || 'Benefício';
    const normalizedBase = baseName.replace(/\s+\(Cópia(?:\s+\d+)?\)$/i, '');
    const names = new Set(existingNames.map(name => String(name ?? '').trim()).filter(Boolean));

    let candidate = `${normalizedBase} (Cópia)`;
    let counter = 2;

    while (names.has(candidate)) {
      candidate = `${normalizedBase} (Cópia ${counter})`;
      counter += 1;
    }

    return candidate;
  };

  const handleDuplicateBenefit = async benefit => {
    if (!benefit || duplicatingBenefitId === benefit.id) {
      return;
    }

    setDuplicatingBenefitId(benefit.id);
    setActionMessage('');

    try {
      const existingNames = benefits.map(item => item?.nome).filter(Boolean);
      const duplicateName = buildDuplicateName(benefit.nome, existingNames);
      const sourceBonus = Array.isArray(benefit.bonus)
        ? benefit.bonus.map(entry => ({
            texto: entry?.texto ?? entry?.descricao ?? '',
            tipo: entry?.tipo ?? 'Vantagem',
          }))
        : [];

      const basePayload = {
        ...getInitialValues(benefit),
        ...benefit,
        id: undefined,
        documentId: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        nome: duplicateName,
        bonus: sourceBonus,
        universos: getTricksterCoinUniversos(benefit),
        tokens: normalizeTokensValue(benefit?.tokens),
      };

      const payload = normalizeBenefitPayload(basePayload);
      await addTricksterCoinBeneficio(payload);
      await refreshBenefits();
      setActionMessage('Benefício duplicado com sucesso.');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erro ao duplicar benefício da Trickster Coin:', error);
      setActionMessage('Não foi possível duplicar o benefício.');
    } finally {
      setDuplicatingBenefitId(null);
    }
  };

  const handleDeleteBenefit = benefit => {
    confirmDelete(benefit.nome, async () => {
      try {
        await removeTricksterCoinBeneficio(benefit.id);
        await refreshBenefits();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Erro ao remover benefício da Trickster Coin:', error);
      }
    });
  };

  return (
    <Box className="page-container" id="redungeon-trickster-coin" data-page="trickster-coin">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}>
            Trickster Coin
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie os benefícios disponíveis para os jogadores.
          </Typography>
        </Box>

        {canCreate() && (
          <Button
            id="trickster-coin-new-benefit"
            variant="contained"
            onClick={handleOpenCreateModal}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
              whiteSpace: 'nowrap',
            }}
          >
            + Novo Benefício
          </Button>
        )}
      </Box>

      {loadError && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#fca5a5',
          }}
        >
          {loadError}
        </Box>
      )}

      {actionMessage && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            border: actionMessage.includes('Não foi possível')
              ? '1px solid rgba(239, 68, 68, 0.3)'
              : '1px solid rgba(34, 197, 94, 0.3)',
            background: actionMessage.includes('Não foi possível')
              ? 'rgba(239, 68, 68, 0.08)'
              : 'rgba(34, 197, 94, 0.08)',
            color: actionMessage.includes('Não foi possível') ? '#fca5a5' : '#bbf7d0',
          }}
        >
          {actionMessage}
        </Box>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: 'var(--color-accent)' }} />
        </Box>
      ) : (
        <>
          <Box
            id="trickster-coin-filters"
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '2fr 1fr 1fr 1fr 1fr',
                md: '2.3fr 1fr 1fr 1fr 1fr 1fr',
              },
              gap: 2,
              mb: 3,
            }}
          >
            <TextField
              id="trickster-coin-search"
              label="Buscar por nome"
              size="small"
              value={searchValue}
              onChange={event => setSearchValue(event.target.value)}
              placeholder="Buscar por nome, descrição ou tag..."
              slotProps={{ inputLabel: { shrink: true } }}
              sx={textFieldSx}
            />

            <Box id="trickster-coin-universe-filter">
              <SearchableSelect
                label="Universo"
                size="small"
                options={[
                  { value: 'Todos', label: 'Todos' },
                  ...tricksterCoinUniversosOptions,
                ]}
                value={
                  [{ value: 'Todos', label: 'Todos' }, ...tricksterCoinUniversosOptions].find(
                    option => option.value === selectedUniverse,
                  ) ?? null
                }
                onChange={(_, value) => setSelectedUniverse(value?.value ?? 'Todos')}
                placeholder="Todos"
              />
            </Box>

            <Box id="trickster-coin-bonus-type-filter">
              <SearchableSelect
                label="Tipo de Bônus"
                size="small"
                options={buildSelectOptions(['Todos', ...BONUS_TYPE_OPTIONS])}
                value={
                  buildSelectOptions(['Todos', ...BONUS_TYPE_OPTIONS]).find(
                    option => option.value === selectedBonusType,
                  ) ?? null
                }
                onChange={(_, value) => setSelectedBonusType(value?.value ?? 'Todos')}
                placeholder="Todos"
              />
            </Box>

            <Box id="trickster-coin-acumulavel-filter">
              <SearchableSelect
                label="Acumulável"
                size="small"
                options={buildSelectOptions(ACCUMULABLE_OPTIONS)}
                value={
                  buildSelectOptions(ACCUMULABLE_OPTIONS).find(
                    option => option.value === selectedAcumulavel,
                  ) ?? null
                }
                onChange={(_, value) =>
                  setSelectedAcumulavel(value?.value ?? 'Todos')
                }
                placeholder="Todos"
              />
            </Box>

            <Box id="trickster-coin-status-filter">
              <SearchableSelect
                label="Status"
                size="small"
                options={buildSelectOptions(['Todos', ...STATUS_OPTIONS])}
                value={
                  buildSelectOptions(['Todos', ...STATUS_OPTIONS]).find(
                    option => option.value === selectedStatus,
                  ) ?? null
                }
                onChange={(_, value) => setSelectedStatus(value?.value ?? 'Todos')}
                placeholder="Todos"
              />
            </Box>

            <Box id="trickster-coin-sort-filter">
              <SearchableSelect
                label="Ordenação"
                size="small"
                disableClearable
                options={SORT_OPTIONS}
                value={SORT_OPTIONS.find(option => option.value === sortValue) ?? null}
                onChange={(_, value) => setSortValue(value?.value ?? 'nome-asc')}
              />
            </Box>
          </Box>

          <Box id="trickster-coin-tags" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {tagOptions.map(tag => {
              const isSelected = activeTagValue === tag;

              return (
                <Chip
                  key={`trickster-coin-tag-${tag}`}
                  label={tag}
                  variant={isSelected ? 'filled' : 'outlined'}
                  onClick={() => setSelectedTag(tag)}
                  sx={{
                    background: isSelected ? 'var(--color-primary)' : 'transparent',
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-primary)',
                    color: isSelected ? '#fff' : 'var(--text-primary)',
                    '&:hover': {
                      borderColor: 'var(--border-hover)',
                      background: isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.02)',
                    },
                    fontWeight: 600,
                  }}
                />
              );
            })}
          </Box>

          <Box id="trickster-coin-result-count" sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              {resultCount} benefício{resultCount === 1 ? '' : 's'}
            </Typography>
          </Box>

          <Box
            id="trickster-coin-content"
            sx={{
              minHeight: 260,
              border: '1px solid var(--border-primary)',
              borderRadius: 3,
              background: 'rgba(15, 23, 42, 0.35)',
              boxShadow: 'var(--shadow-md)',
              overflow: 'hidden',
            }}
          >
            {benefits.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  minHeight: 260,
                  px: 3,
                  py: 6,
                  color: 'var(--text-muted)',
                }}
              >
                <MonetizationOnOutlinedIcon
                  sx={{
                    fontSize: 52,
                    color: 'var(--color-accent)',
                    opacity: 0.85,
                    mb: 1,
                  }}
                />
                <Typography variant="body1" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}>
                  Nenhum benefício cadastrado.
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  Cadastre benefícios da Trickster Coin para que eles apareçam aqui.
                </Typography>
              </Box>
            ) : resultCount === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  minHeight: 260,
                  px: 3,
                  py: 6,
                  color: 'var(--text-muted)',
                }}
              >
                <MonetizationOnOutlinedIcon
                  sx={{
                    fontSize: 52,
                    color: 'var(--color-accent)',
                    opacity: 0.85,
                    mb: 1,
                  }}
                />
                <Typography variant="body1" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}>
                  Nenhum benefício encontrado para os filtros atuais.
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  Ajuste a busca ou os filtros para refiná-los.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(auto-fill, minmax(290px, 1fr))',
                    md: 'repeat(auto-fill, minmax(300px, 1fr))',
                    lg: 'repeat(auto-fill, minmax(320px, 1fr))',
                  },
                  gap: 2,
                  p: 2,
                }}
              >
                {filteredBenefits.map(benefit => (
                  <TricksterCoinCard
                    key={benefit.id}
                    benefit={benefit}
                    onEdit={() => handleOpenEditModal(benefit)}
                    onDuplicate={() => handleDuplicateBenefit(benefit)}
                    onDelete={() => handleDeleteBenefit(benefit)}
                    duplicating={duplicatingBenefitId === benefit.id}
                  />
                ))}
              </Box>
            )}
          </Box>
        </>
      )}

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        scroll="paper"
        aria-labelledby="trickster-coin-modal-title"
        slotProps={{
          paper: {
            sx: {
              background: 'linear-gradient(135deg, rgba(11, 16, 32, 0.97), rgba(17, 24, 39, 0.96) 60%, rgba(21, 28, 47, 0.98))',
              border: '1px solid rgba(124, 58, 237, 0.28)',
              boxShadow: '0 24px 70px rgba(5, 8, 22, 0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
              backdropFilter: 'blur(18px)',
              borderRadius: 4,
              overflow: 'hidden',
              width: { xs: '95%', sm: '90%', md: '980px' },
              maxHeight: { xs: '86vh', sm: '84vh' },
            },
          },
        }}
      >
        <DialogTitle
          id="trickster-coin-modal-title"
          sx={{
            color: 'var(--text-primary)',
            px: { xs: 2.25, sm: 3 },
            py: { xs: 2, sm: 2.5 },
            borderBottom: '1px solid rgba(76, 201, 240, 0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            background: 'linear-gradient(90deg, rgba(76, 201, 240, 0.08), rgba(124, 58, 237, 0.06))',
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1.15 }}>
              {editingBenefit ? 'Editar Benefício' : 'Novo Benefício'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.35 }}>
              {editingBenefit
                ? 'Atualize os dados deste benefício.'
                : 'Cadastre um novo benefício para a Trickster Coin.'}
            </Typography>
          </Box>
          <IconButton
            aria-label="Fechar modal"
            onClick={handleCloseModal}
            sx={{
              color: 'var(--text-secondary)',
              border: '1px solid rgba(76, 201, 240, 0.18)',
              background: 'rgba(255,255,255,0.03)',
              '&:hover': {
                color: 'var(--color-accent)',
                transform: 'rotate(90deg) scale(1.05)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            px: { xs: 2.25, sm: 3 },
            pt: { xs: 2.5, sm: 3 },
            pb: { xs: 2, sm: 2.5 },
            background: 'rgba(255,255,255,0.015)',
          }}
        >
          <Formik
            key={editingBenefit?.id ?? 'novo-beneficio'}
            enableReinitialize
            initialValues={getInitialValues(editingBenefit)}
            validationSchema={TRICKSTER_COIN_SCHEMA}
            onSubmit={handleSubmitBenefit}
          >
            {({
              values,
              errors,
              touched,
              isSubmitting,
              handleBlur,
              setFieldTouched,
              setFieldValue,
            }) => (
              <Form style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {submitError && (
                  <Box
                    sx={{
                      mb: 2.5,
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      background: 'rgba(239, 68, 68, 0.08)',
                      color: '#fca5a5',
                    }}
                  >
                    {submitError}
                  </Box>
                )}

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 2,
                    width: '100%',
                    minWidth: 0,
                  }}
                >
                  <Box component="section" sx={sectionSurfaceSx}>
                    <Typography variant="subtitle2" sx={sectionTitleSx}>
                      Informações Básicas
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                      <Field name="nome">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Nome do Benefício"
                            fullWidth
                            required
                            error={touched.nome && Boolean(errors.nome)}
                            helperText={touched.nome && errors.nome}
                            sx={textFieldSx}
                          />
                        )}
                      </Field>

                      <Field name="tag">
                        {({ field, form }) => (
                          <Autocomplete
                            freeSolo
                            selectOnFocus
                            clearOnBlur
                            handleHomeEndKeys
                            options={benefitTags}
                            value={field.value ?? ''}
                            inputValue={String(field.value ?? '')}
                            onChange={(_, newValue) => {
                              const rawValue = typeof newValue === 'string' ? newValue : newValue ?? '';
                              const cleanValue = rawValue.startsWith('+ Criar "')
                                ? rawValue.replace(/^\+ Criar\s+"|"$/g, '')
                                : rawValue;
                              form.setFieldValue('tag', resolveBenefitTag(cleanValue, benefitTags));
                            }}
                            onInputChange={(_, newInputValue) => {
                              form.setFieldValue('tag', resolveBenefitTag(newInputValue, benefitTags));
                            }}
                            filterOptions={(options, params) => {
                              const inputValue = normalizeBenefitTag(params.inputValue);
                              if (!inputValue) {
                                return options;
                              }

                              const matches = options.filter(option =>
                                normalizeBenefitTag(option)
                                  .toLowerCase()
                                  .includes(inputValue.toLowerCase()),
                              );

                              if (!matches.some(option => normalizeBenefitTag(option).toLowerCase() === inputValue.toLowerCase())) {
                                matches.push(`+ Criar "${inputValue}"`);
                              }

                              return matches.slice(0, 8);
                            }}
                            slotProps={{
                              paper: {
                                sx: {
                                  background: 'linear-gradient(180deg, rgba(10, 15, 26, 0.98), rgba(17, 24, 39, 0.98))',
                                  border: '1px solid rgba(124, 58, 237, 0.26)',
                                  borderRadius: 2,
                                  boxShadow: '0 18px 38px rgba(2, 6, 23, 0.52)',
                                  overflow: 'hidden',
                                },
                              },
                              listbox: {
                                sx: {
                                  bgcolor: 'transparent',
                                  p: 0.75,
                                  '& li': {
                                    color: 'var(--text-primary)',
                                    borderRadius: 1.5,
                                    px: 1.25,
                                    py: 0.75,
                                    '&:hover': { background: 'rgba(124, 58, 237, 0.12)' },
                                    '&[aria-selected="true"]': {
                                      background: 'rgba(96, 165, 250, 0.12)',
                                    },
                                  },
                                },
                              },
                            }}
                            renderOption={(optionProps, option) => {
                              const { key, ...restProps } = optionProps;

                              return (
                                <li
                                  key={key}
                                  {...restProps}
                                  style={{
                                    ...(typeof option === 'string' && option.startsWith('+ Criar')
                                      ? {
                                          color: '#f5d98c',
                                          fontWeight: 700,
                                          background: 'rgba(250, 204, 21, 0.04)',
                                        }
                                      : {}),
                                  }}
                                >
                                  {option}
                                </li>
                              );
                            }}
                            renderInput={params => (
                              <TextField
                                {...params}
                                label="Tag / Categoria"
                                placeholder="Pesquisar ou criar..."
                                required
                                error={touched.tag && Boolean(errors.tag)}
                                helperText={touched.tag && errors.tag}
                                sx={textFieldSx}
                              />
                            )}
                          />
                        )}
                      </Field>

                      <Field name="universos">
                        {({ field, form }) => {
                          const selectedUniverseIds = Array.isArray(field.value) ? field.value : [];
                          const selectedUniversos = selectedUniverseIds
                            .map(id => universos.find(universo => universo.id === id))
                            .filter(Boolean)
                            .map(universo => ({ value: universo.id, label: universo.Nome }));

                          return (
                            <SearchableSelect
                              label="Universos"
                              name={field.name}
                              multiple
                              disableClearable
                              compactSelection
                              compactMaxVisible={2}
                              options={tricksterCoinUniversosOptions}
                              value={selectedUniversos}
                              onChange={(_, newValue) => {
                                const nextSelection = Array.isArray(newValue) ? newValue : [];
                                const nextUniverseIds = nextSelection
                                  .filter(option => option?.value !== '__TRICKSTER_COIN_SELECT_ALL__')
                                  .map(option => option.value);
                                const hasAllSelected =
                                  nextSelection.some(option => option?.value === '__TRICKSTER_COIN_SELECT_ALL__') ||
                                  (universos.length > 0 &&
                                    universos.every(universo => nextUniverseIds.includes(universo.id)));

                                form.setFieldValue(
                                  field.name,
                                  hasAllSelected ? universos.map(universo => universo.id) : nextUniverseIds,
                                );
                              }}
                              onBlur={() => form.setFieldTouched(field.name, true)}
                              placeholder="Selecione os universos"
                              showSelectAll
                              selectAllLabel="Todos os Universos"
                              selectAllValue="__TRICKSTER_COIN_SELECT_ALL__"
                              sx={{ '& .MuiOutlinedInput-root': { background: 'rgba(8, 13, 22, 0.72)' } }}
                              error={touched.universos && Boolean(errors.universos)}
                              helperText={touched.universos && errors.universos}
                              listboxMaxHeight={220}
                            />
                          );
                        }}
                      </Field>
                    </Box>

                    <Field name="descricao">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Descrição"
                          fullWidth
                          multiline
                          minRows={4}
                          error={touched.descricao && Boolean(errors.descricao)}
                          helperText={touched.descricao && errors.descricao}
                          sx={textFieldSx}
                        />
                      )}
                    </Field>
                  </Box>

                  <Box component="section" sx={sectionSurfaceSx}>
                    <Typography variant="subtitle2" sx={sectionTitleSx}>
                      Imagem
                    </Typography>

                    <Field name="linkImagem">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Imagem (opcional)"
                          fullWidth
                          placeholder="https://..."
                          error={touched.linkImagem && Boolean(errors.linkImagem)}
                          helperText={touched.linkImagem && errors.linkImagem}
                          sx={textFieldSx}
                        />
                      )}
                    </Field>
                  </Box>

                  <Box component="section" sx={sectionSurfaceSx}>
                    <Typography variant="subtitle2" sx={sectionTitleSx}>
                      Bônus
                    </Typography>

                    <FieldArray name="bonus">
                      {({ push, remove }) => (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                          {values.bonus.length === 0 && (
                            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                              Nenhum bônus adicionado.
                            </Typography>
                          )}

                          {values.bonus.map((bonusItem, index) => {
                            const fieldName = `bonus[${index}].texto`;
                            const typeFieldName = `bonus[${index}].tipo`;
                            const bonusError =
                              touched.bonus?.[index]?.texto &&
                              Boolean(errors.bonus?.[index]?.texto);

                            return (
                              <Box
                                key={`bonus-item-${index}`}
                                sx={{
                                  display: 'grid',
                                  gridTemplateColumns: {
                                    xs: '1fr',
                                    md: 'minmax(0, 1fr) auto auto',
                                  },
                                  alignItems: 'center',
                                  gap: 1,
                                  width: '100%',
                                  p: 1.1,
                                  borderRadius: 2.5,
                                  border: '1px solid rgba(148,163,184,0.12)',
                                  background: 'rgba(15,23,42,0.28)',
                                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.015)',
                                  transition: 'border-color 160ms ease, transform 160ms ease',
                                  '&:hover': {
                                    borderColor: 'rgba(96, 165, 250, 0.2)',
                                  },
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography sx={{ color: 'var(--text-primary)', minWidth: 74, fontWeight: 700 }}>
                                    Bônus {index + 1}
                                  </Typography>

                                  <Field name={fieldName}>
                                    {({ field }) => (
                                      <TextField
                                        {...field}
                                        value={field.value ?? ''}
                                        fullWidth
                                        placeholder="Descreva o bônus..."
                                        error={bonusError}
                                        helperText={bonusError ? errors.bonus?.[index]?.texto : undefined}
                                        sx={{ ...textFieldSx, flex: 1 }}
                                      />
                                    )}
                                  </Field>
                                </Box>

                                <Field name={typeFieldName}>
                                  {({ field, form }) => (
                                    <SearchableSelect
                                      label="Tipo"
                                      size="small"
                                      disableClearable
                                      options={buildSelectOptions(BONUS_TYPE_OPTIONS)}
                                      value={
                                        buildSelectOptions(BONUS_TYPE_OPTIONS).find(
                                          option => option.value === field.value,
                                        ) ?? null
                                      }
                                      onChange={(_, value) =>
                                        form.setFieldValue(
                                          typeFieldName,
                                          value?.value ?? 'Neutro',
                                        )
                                      }
                                      sx={{ width: { xs: '100%', md: 150 }, minWidth: 0 }}
                                      error={
                                        touched.bonus?.[index]?.tipo &&
                                        Boolean(errors.bonus?.[index]?.tipo)
                                      }
                                      helperText={
                                        touched.bonus?.[index]?.tipo &&
                                        errors.bonus?.[index]?.tipo
                                      }
                                    />
                                  )}
                                </Field>

                                <IconButton
                                  size="small"
                                  onClick={() => remove(index)}
                                  aria-label={`Remover bônus ${index + 1}`}
                                  sx={{
                                    color: 'var(--text-secondary)',
                                    borderRadius: 1.5,
                                    border: '1px solid transparent',
                                    transition: 'all 160ms ease',
                                    '&:hover': {
                                      color: '#fecaca',
                                      background: 'rgba(239, 68, 68, 0.08)',
                                      borderColor: 'rgba(239, 68, 68, 0.22)',
                                    },
                                  }}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            );
                          })}

                          <Button
                            type="button"
                            variant="outlined"
                            onClick={() => push({ texto: '', tipo: 'Vantagem' })}
                            sx={{
                              alignSelf: 'flex-start',
                              borderColor: 'rgba(96, 165, 250, 0.28)',
                              color: 'var(--text-primary)',
                              background: 'rgba(12, 18, 30, 0.42)',
                              px: 1.75,
                              py: 0.85,
                              borderRadius: 2,
                              transition: 'all 180ms ease',
                              '&:hover': {
                                borderColor: 'rgba(96, 208, 255, 0.65)',
                                background: 'rgba(96, 208, 255, 0.06)',
                                color: 'var(--text-primary)',
                              },
                            }}
                          >
                            + Adicionar Bônus
                          </Button>
                        </Box>
                      )}
                    </FieldArray>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
                      gap: 2,
                      width: '100%',
                    }}
                  >
                    <Box component="section" sx={sectionSurfaceSx}>
                      <Typography variant="subtitle2" sx={sectionTitleSx}>
                        Custo
                      </Typography>

                      <TextField
                        name="custo"
                        label="Custo (Trickster Coins)"
                        type="number"
                        value={values.custo ?? 0}
                        onChange={event => {
                          const nextValue = Number(event.target.value || 0);
                          setFieldValue('custo', Number.isFinite(nextValue) ? nextValue : 0);
                        }}
                        onBlur={handleBlur}
                        fullWidth
                        slotProps={{ htmlInput: { min: 0 } }}
                        error={touched.custo && Boolean(errors.custo)}
                        helperText={touched.custo && errors.custo}
                        sx={textFieldSx}
                      />
                    </Box>

                    <Box component="section" sx={{ ...sectionSurfaceSx, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={sectionTitleSx}>
                        Tokens
                      </Typography>

                      <Autocomplete
                        multiple
                        freeSolo
                        options={[]}
                        value={Array.isArray(values.tokens) ? values.tokens : []}
                        inputValue={tokenInput}
                        onInputChange={(_, newInputValue) => setTokenInput(newInputValue)}
                        onBlur={() => setFieldTouched('tokens', true)}
                        onChange={(_, newValue) => {
                          const nextTokens = normalizeTokensValue(newValue);
                          setFieldValue('tokens', nextTokens);
                          setTokenInput('');
                        }}
                        renderValue={(tokenValue, getItemProps) =>
                          tokenValue.map((token, index) => {
                            const { key, ...chipProps } = getItemProps({ index });

                            return (
                              <Chip
                                {...chipProps}
                                key={key ?? `${token}-${index}`}
                                label={token}
                                onDelete={() => {
                                  const nextTokens = normalizeTokensValue(
                                    tokenValue.filter(item => item !== token),
                                  );
                                  setFieldValue('tokens', nextTokens);
                                }}
                                sx={{
                                  background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.14), rgba(11, 18, 33, 0.7))',
                                  border: '1px solid rgba(124,58,237,0.36)',
                                  color: '#f8f5ff',
                                  fontWeight: 700,
                                  '& .MuiChip-deleteIcon': {
                                    color: 'rgba(255,255,255,0.7)',
                                    '&:hover': { color: '#fecaca' },
                                  },
                                }}
                              />
                            );
                          })
                        }
                        renderInput={params => (
                          <TextField
                            {...params}
                            label="Tokens"
                            placeholder="Digite um token..."
                            onKeyDown={event => {
                              const rawValue = normalizeTokenInput(tokenInput);
                              if ((event.key === 'Enter' || event.key === ',' || event.key === 'Tab') && rawValue) {
                                event.preventDefault();
                                const currentTokens = Array.isArray(values.tokens) ? values.tokens : [];
                                const nextTokens = normalizeTokensValue([...currentTokens, rawValue]);
                                setFieldValue('tokens', nextTokens);
                                setTokenInput('');
                              }
                            }}
                            error={touched.tokens && Boolean(errors.tokens)}
                            helperText={touched.tokens && errors.tokens}
                            sx={textFieldSx}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  <Box component="section" sx={sectionSurfaceSx}>
                    <Typography variant="subtitle2" sx={sectionTitleSx}>
                      Regras de Uso
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 2 }}>
                      <Field name="acumulavel">
                        {({ field, form }) => (
                          <SearchableSelect
                            label="Acumulável?"
                            size="small"
                            disableClearable
                            options={ACCUMULABLE_FORM_OPTIONS}
                            value={ACCUMULABLE_FORM_OPTIONS.find(option => option.value === field.value) ?? null}
                            onChange={(_, value) => {
                              const nextValue = Boolean(value?.value ?? true);
                              form.setFieldValue('acumulavel', nextValue);
                              if (!nextValue) {
                                form.setFieldValue('limiteAcumulacao', 0);
                              }
                            }}
                            placeholder="Sim"
                            sx={{ '& .MuiOutlinedInput-root': { background: 'rgba(8, 13, 22, 0.72)' } }}
                          />
                        )}
                      </Field>

                      <Field name="limiteAcumulacao">
                        {({ field, form }) => (
                          <TextField
                            {...field}
                            label="Limite de Acúmulo"
                            type="number"
                            fullWidth
                            value={field.value ?? 0}
                            disabled={!values.acumulavel}
                            slotProps={{ htmlInput: { min: 0 } }}
                            onChange={event => {
                              const nextValue = Number(event.target.value || 0);
                              form.setFieldValue('limiteAcumulacao', Number.isFinite(nextValue) ? nextValue : 0);
                            }}
                            error={touched.limiteAcumulacao && Boolean(errors.limiteAcumulacao)}
                            helperText={touched.limiteAcumulacao && errors.limiteAcumulacao}
                            sx={textFieldSx}
                          />
                        )}
                      </Field>

                      <Field name="limitePorPeriodo">
                        {({ field, form }) => (
                          <TextField
                            {...field}
                            label="Limite por Período"
                            type="number"
                            fullWidth
                            value={field.value ?? 0}
                            slotProps={{ htmlInput: { min: 0 } }}
                            onChange={event => {
                              const nextValue = Number(event.target.value || 0);
                              form.setFieldValue('limitePorPeriodo', Number.isFinite(nextValue) ? nextValue : 0);
                              if (!nextValue && values.periodo !== 'Nenhum') {
                                form.setFieldValue('periodo', 'Nenhum');
                              }
                            }}
                            error={touched.limitePorPeriodo && Boolean(errors.limitePorPeriodo)}
                            helperText={touched.limitePorPeriodo && errors.limitePorPeriodo}
                            sx={textFieldSx}
                          />
                        )}
                      </Field>

                      <Field name="periodo">
                        {({ field, form }) => (
                          <SearchableSelect
                            label="Período"
                            size="small"
                            disableClearable
                            options={buildSelectOptions(PERIODO_OPTIONS)}
                            value={buildSelectOptions(PERIODO_OPTIONS).find(option => option.value === field.value) ?? null}
                            onChange={(_, value) => {
                              const nextPeriod = value?.value ?? 'Nenhum';
                              form.setFieldValue('periodo', nextPeriod);
                              if (nextPeriod === 'Nenhum') {
                                form.setFieldValue('limitePorPeriodo', 0);
                              }
                            }}
                            placeholder="Nenhum"
                          />
                        )}
                      </Field>
                    </Box>
                  </Box>

                  <Box component="section" sx={sectionSurfaceSx}>
                    <Typography variant="subtitle2" sx={sectionTitleSx}>
                      Status
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, border: '1px solid rgba(148,163,184,0.12)', background: 'rgba(15,23,42,0.24)' }}>
                      <Switch
                        checked={values.status === 'Ativo'}
                        onChange={event => {
                          setFieldValue('status', event.target.checked ? 'Ativo' : 'Inativo');
                        }}
                        color="success"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#facc15',
                            '& + .MuiSwitch-track': { backgroundColor: 'rgba(250, 204, 21, 0.45)' },
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(148, 163, 184, 0.28)',
                          },
                        }}
                        slotProps={{ input: { 'aria-label': 'Status do benefício' } }}
                      />
                      <Box>
                        <Typography sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                          {values.status === 'Ativo' ? 'Ativo' : 'Inativo'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                          {values.status === 'Ativo'
                            ? 'Disponível na loja'
                            : 'Desative para ocultar sem excluir'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <DialogActions sx={{ px: 0, pt: 2.5, pb: 0, justifyContent: 'flex-end', gap: 1.25, borderTop: '1px solid rgba(148,163,184,0.12)', mt: 2.5 }}>
                  <Button
                    onClick={handleCloseModal}
                    variant="outlined"
                    sx={{
                      borderColor: 'rgba(148, 163, 184, 0.18)',
                      color: 'var(--text-primary)',
                      background: 'rgba(11, 17, 29, 0.12)',
                      '&:hover': {
                        borderColor: 'rgba(96, 208, 255, 0.34)',
                        background: 'rgba(96, 208, 255, 0.04)',
                      },
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.18), rgba(124, 58, 237, 0.32), rgba(96, 208, 255, 0.18))',
                      color: '#fff8d6',
                      border: '1px solid rgba(250, 204, 21, 0.42)',
                      boxShadow: '0 10px 22px rgba(124, 58, 237, 0.2)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.24), rgba(124, 58, 237, 0.38), rgba(96, 208, 255, 0.2))',
                        boxShadow: '0 14px 24px rgba(124, 58, 237, 0.26)',
                      },
                      '&.Mui-disabled': {
                        background: 'rgba(148, 163, 184, 0.12)',
                        color: 'var(--text-muted)',
                        borderColor: 'rgba(148, 163, 184, 0.12)',
                      },
                    }}
                  >
                    {isSubmitting ? 'Salvando...' : editingBenefit ? 'Salvar alterações' : 'Salvar benefício'}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      {deleteConfirmationDialog}
    </Box>
  );
};

export default TricksterCoin;
