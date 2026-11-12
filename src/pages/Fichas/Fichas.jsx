import React, { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Skeleton from '@mui/material/Skeleton';
import { useAuth } from 'context/AuthContext';
import useUniversos from 'hooks/useUniversos';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityImage from 'components/EntityImage/EntityImage';
import {
  getCampanhas,
  getAllRegisteredUsers,
  getPersonagens,
  getUsersDisplayNamesByUid,
  updatePersonagem,
  removePersonagem,
} from 'service/storage';
import {
  canAccessFichaForUniverse,
  filterFichas,
  getCampanhaLabel,
  getFichaOwnerName,
  normalizeFichaTipo,
  TIPOS_FICHA,
} from './utils';

const toSafeImageUrl = value => {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return '';

  try {
    const url = new URL(trimmed);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

const defaultDraft = ficha => ({
  tipo: normalizeFichaTipo(ficha?.tipo),
  universo: String(ficha?.universo ?? ficha?.universoId ?? ''),
  campanha: String(
    ficha?.campanha ??
      (Array.isArray(ficha?.campanhas) ? (ficha.campanhas[0] ?? '') : '') ??
      '',
  ),
  linkImagem: String(ficha?.linkImagem ?? ''),
  uid: String(ficha?.uid ?? ficha?.proprietarioId ?? ''),
});

const Fichas = () => {
  const { currentUser, isAdmin, allowedUniversos, canWrite } = useAuth();
  const { universos, loadingUniversos } = useUniversos();

  const [personagens, setPersonagens] = useState([]);
  const [campanhas, setCampanhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState(null);
  const [selectedFichaIds, setSelectedFichaIds] = useState([]);
  const [draft, setDraft] = useState(defaultDraft(null));
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteName, setDeleteName] = useState('');
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawFicha, setWithdrawFicha] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [ownerNames, setOwnerNames] = useState({});
  const [registeredPlayers, setRegisteredPlayers] = useState([]);
  const [bulkSelectionActive, setBulkSelectionActive] = useState(false);
  const [lastSelectedFichaId, setLastSelectedFichaId] = useState(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const [personagensData, campanhasData] = await Promise.all([
          getPersonagens(),
          getCampanhas(),
        ]);

        if (!active) return;

        setPersonagens(Array.isArray(personagensData) ? personagensData : []);
        setCampanhas(Array.isArray(campanhasData) ? campanhasData : []);
      } catch (loadError) {
        if (!active) return;
        setError(
          loadError?.message ||
            'Não foi possível carregar as fichas no momento.',
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const universosDisponiveis = useMemo(() => {
    if (isAdmin) {
      return universos;
    }

    const idsPermitidos = new Set(allowedUniversos);
    return universos.filter(universo => idsPermitidos.has(universo.id));
  }, [allowedUniversos, isAdmin, universos]);

  useEffect(() => {
    if (!personagens.length) {
      return undefined;
    }

    const uniqueUids = [
      ...new Set(
        personagens
          .map(ficha => String(ficha?.uid ?? '').trim())
          .filter(Boolean),
      ),
    ];

    if (uniqueUids.length === 0) {
      return undefined;
    }

    let active = true;

    void getUsersDisplayNamesByUid(uniqueUids)
      .then(data => {
        if (active) {
          setOwnerNames(data);
        }
      })
      .catch(error => {
        if (active) {
          // eslint-disable-next-line no-console
          console.error('[Fichas] getUsersDisplayNamesByUid failed', {
            code: error?.code ?? null,
            message: error?.message ?? String(error),
            operation: 'getUsersDisplayNamesByUid(uniqueUids)',
          });
          setOwnerNames(previous => ({ ...previous }));
        }
      });

    return () => {
      active = false;
    };
  }, [personagens]);

  useEffect(() => {
    let active = true;

    void getAllRegisteredUsers()
      .then(data => {
        if (active) {
          setRegisteredPlayers(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (active) {
          setRegisteredPlayers([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const ownerOptions = useMemo(() => {
    const fallbackOwner =
      draft.uid && !registeredPlayers.some(player => player.uid === draft.uid)
        ? {
            uid: draft.uid,
            nome: getFichaOwnerName({ uid: draft.uid }, ownerNames),
          }
        : null;

    return [...registeredPlayers, ...(fallbackOwner ? [fallbackOwner] : [])].filter(
      player => Boolean(player?.uid),
    );
  }, [draft.uid, ownerNames, registeredPlayers]);

  const selectedOwnerOption = useMemo(
    () => ownerOptions.find(player => player.uid === draft.uid) ?? null,
    [draft.uid, ownerOptions],
  );

  const campanhasPorId = useMemo(
    () =>
      Object.fromEntries(
        campanhas.map(campanha => [
          String(campanha.id ?? campanha.ID ?? ''),
          String(campanha.nome ?? campanha.Nome ?? 'Campanha sem nome'),
        ]),
      ),
    [campanhas],
  );

  const fichasPermitidas = useMemo(() => {
    if (isAdmin) {
      return personagens;
    }

    return personagens.filter(ficha =>
      canAccessFichaForUniverse(ficha, {
        isAdmin,
        allowedUniversos,
      }),
    );
  }, [allowedUniversos, isAdmin, personagens]);

  const fichasVisiveis = useMemo(
    () =>
      filterFichas(fichasPermitidas, {
        busca: filtroNome,
        universo: filtroUniverso,
        tipo: filtroTipo,
      }),
    [fichasPermitidas, filtroNome, filtroTipo, filtroUniverso],
  );

  const selectedFichas = useMemo(
    () => fichasVisiveis.filter(ficha => selectedFichaIds.includes(ficha.id)),
    [fichasVisiveis, selectedFichaIds],
  );

  const openFichaEditor = ficha => {
    if (!ficha || !canManageFicha(ficha)) return;
    setSelectedFicha(ficha);
    setDraft(defaultDraft(ficha));
    setDeleteName('');
    setModalOpen(true);
    setContextMenu(null);
  };

  const closeFichaEditor = () => {
    setModalOpen(false);
    setSelectedFicha(null);
    setDraft(defaultDraft(null));
    setDeleteName('');
    setDeleteDialogOpen(false);
  };

  const handleSave = async () => {
    if (!selectedFicha) return;

    const nextUniverso =
      draft.universo ||
      String(selectedFicha.universo ?? selectedFicha.universoId ?? '');

    if (!isAdmin && !(nextUniverso && canWrite(nextUniverso))) {
      setError('Você não tem permissão para salvar fichas deste universo.');
      return;
    }

    const nextTipo = draft.tipo || normalizeFichaTipo(selectedFicha.tipo);
    const nextCampanha =
      draft.campanha &&
      campanhas.some(
        campanha =>
          String(
            campanha.universoId ??
              campanha.universo ??
              campanha.universo_id ??
              '',
          ) === nextUniverso &&
          String(campanha.id ?? campanha.ID ?? '') === draft.campanha,
      )
        ? draft.campanha
        : '';
    const nextUid = draft.uid || currentUser?.uid || selectedFicha.uid || '';

    try {
      setSaving(true);
      await updatePersonagem(selectedFicha.id, {
        tipo: nextTipo,
        universo: nextUniverso,
        campanha: nextCampanha,
        linkImagem: toSafeImageUrl(draft.linkImagem) || '',
        uid: nextUid,
      });

      setPersonagens(previous =>
        previous.map(ficha =>
          ficha.id === selectedFicha.id
            ? {
                ...ficha,
                tipo: nextTipo,
                universo: nextUniverso,
                campanha: nextCampanha,
                linkImagem: toSafeImageUrl(draft.linkImagem) || '',
                uid: nextUid,
              }
            : ficha,
        ),
      );

      closeFichaEditor();
    } catch (saveError) {
      setError(
        saveError?.message || 'Não foi possível salvar as alterações da ficha.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRetirarProprietario = ficha => {
    if (!ficha || !currentUser) return;

    const universoId = String(ficha?.universo ?? ficha?.universoId ?? '');

    if (!isAdmin && !(universoId && canWrite(universoId))) {
      setError('Você não tem permissão para retirar o vínculo desta ficha.');
      return;
    }

    setWithdrawFicha(ficha);
    setWithdrawDialogOpen(true);
  };

  const confirmRetirarProprietario = async () => {
    if (!withdrawFicha) return;

    try {
      await updatePersonagem(withdrawFicha.id, { uid: '' });
      setPersonagens(previous =>
        previous.map(item =>
          item.id === withdrawFicha.id ? { ...item, uid: '' } : item,
        ),
      );
      if (selectedFicha?.id === withdrawFicha.id) {
        setDraft(previous => ({ ...previous, uid: '' }));
      }
      setWithdrawDialogOpen(false);
      setWithdrawFicha(null);
      setContextMenu(null);
    } catch (removeError) {
      setError(removeError?.message || 'Não foi possível retirar a ficha.');
    }
  };

  const handleDeleteFicha = async () => {
    if (!selectedFicha) return;

    const universoId = String(
      selectedFicha?.universo ?? selectedFicha?.universoId ?? '',
    );

    if (!isAdmin && !(universoId && canWrite(universoId))) {
      setError('Você não tem permissão para excluir esta ficha.');
      return;
    }

    const normalizedConfirmation = deleteName.trim();
    const targetName = String(selectedFicha.nome ?? '').trim();

    if (normalizedConfirmation !== targetName) {
      setError('Digite exatamente o nome da ficha para confirmar a exclusão.');
      return;
    }

    try {
      await removePersonagem(selectedFicha.id);
      setPersonagens(previous =>
        previous.filter(ficha => ficha.id !== selectedFicha.id),
      );
      closeFichaEditor();
    } catch (deleteError) {
      setError(deleteError?.message || 'Não foi possível excluir a ficha.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFichas.length === 0) {
      setBulkDeleteDialogOpen(false);
      return;
    }

    const unauthorizedFichas = selectedFichas.filter(
      ficha => !canManageFicha(ficha),
    );

    if (unauthorizedFichas.length > 0) {
      setError('Você não tem permissão para excluir uma ou mais fichas selecionadas.');
      setBulkDeleteDialogOpen(false);
      return;
    }

    try {
      await Promise.all(
        selectedFichas.map(ficha => removePersonagem(ficha.id)),
      );

      const selectedIds = new Set(selectedFichas.map(ficha => ficha.id));
      setPersonagens(previous =>
        previous.filter(ficha => !selectedIds.has(ficha.id)),
      );
      setSelectedFichaIds([]);
      setLastSelectedFichaId(null);
      setBulkSelectionActive(false);
      setBulkDeleteDialogOpen(false);
      setError('');
    } catch (deleteError) {
      setError(
        deleteError?.message || 'Não foi possível excluir as fichas selecionadas.',
      );
    }
  };

  const toggleFichaSelection = (ficha, event) => {
    if (!ficha || !canManageFicha(ficha) || !(event?.shiftKey ?? false)) {
      return;
    }

    setBulkSelectionActive(true);

    const isAlreadySelected = selectedFichaIds.includes(ficha.id);

    if (isAlreadySelected) {
      setSelectedFichaIds(previous => previous.filter(id => id !== ficha.id));
      setLastSelectedFichaId(ficha.id);
      return;
    }

    const rangeStart = fichasVisiveis.findIndex(
      item => item.id === (lastSelectedFichaId ?? ficha.id),
    );
    const rangeEnd = fichasVisiveis.findIndex(item => item.id === ficha.id);

    if (rangeStart === -1 || rangeEnd === -1) {
      setSelectedFichaIds(previous => [...new Set([...previous, ficha.id])]);
      setLastSelectedFichaId(ficha.id);
      return;
    }

    const start = Math.min(rangeStart, rangeEnd);
    const end = Math.max(rangeStart, rangeEnd);
    const idsRange = fichasVisiveis
      .slice(start, end + 1)
      .map(item => item.id);

    setSelectedFichaIds(previous => {
      const next = new Set(previous);
      idsRange.forEach(id => next.add(id));
      return [...next];
    });
    setLastSelectedFichaId(ficha.id);
  };

  const campanhasDoUniverso = useMemo(() => {
    const universoAtual =
      draft.universo ||
      selectedFicha?.universo ||
      selectedFicha?.universoId ||
      '';

    return campanhas.filter(campanha => {
      const idUniverso = String(
        campanha?.universoId ??
          campanha?.universo ??
          campanha?.universo_id ??
          '',
      );
      return idUniverso === universoAtual;
    });
  }, [campanhas, draft.universo, selectedFicha]);

  const canManageFicha = ficha => {
    if (!ficha) return false;

    if (isAdmin) {
      return true;
    }

    const universoId = String(ficha?.universo ?? ficha?.universoId ?? '');

    if (!universoId) {
      return false;
    }

    return Boolean(canWrite(universoId));
  };

  const tipoOptions = TIPOS_FICHA;

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          variant="h4"
          sx={{ color: 'var(--text-primary)', fontWeight: 700 }}
        >
          Fichas
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          Gerencie personagens, NPCs e criaturas do banco de dados central.
        </Typography>
      </Box>

      <Box
        sx={{
          border: '1px solid var(--border-primary)',
          background: 'var(--bg-card)',
          borderRadius: 3,
          p: 2.5,
        }}
      >
        <EntityFilters
          nomeValue={filtroNome}
          onNomeChange={setFiltroNome}
          extraFilters={[
            {
              label: 'Tipo',
              value: filtroTipo,
              onChange: value => setFiltroTipo(value || 'todos'),
              options: tipoOptions,
              allLabel: 'Todos',
            },
          ]}
          universos={universosDisponiveis}
          universoValue={filtroUniverso}
          onUniversoChange={value => setFiltroUniverso(value || 'todos')}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {bulkSelectionActive && selectedFichaIds.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            p: 2,
            border: '1px solid rgba(96, 165, 250, 0.28)',
            borderRadius: 3,
            background: 'rgba(15, 23, 42, 0.92)',
          }}
        >
          <Typography sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            {selectedFichaIds.length} ficha{selectedFichaIds.length > 1 ? 's' : ''} selecionada{selectedFichaIds.length > 1 ? 's' : ''}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedFichaIds([]);
                setLastSelectedFichaId(null);
                setBulkSelectionActive(false);
              }}
              sx={{
                color: 'var(--text-primary)',
                borderColor: 'rgba(148, 163, 184, 0.25)',
                textTransform: 'none',
              }}
            >
              Limpar seleção
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => setBulkDeleteDialogOpen(true)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              Excluir selecionadas
            </Button>
          </Box>
        </Box>
      )}

      {loading || loadingUniversos ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
              xl: 'repeat(6, minmax(0, 1fr))',
            },
            gap: 1.5,
          }}
        >
          {[...Array(6)].map((_, index) => (
            <Skeleton
              key={index}
              variant="rounded"
              height={220}
              sx={{ borderRadius: 3 }}
            />
          ))}
        </Box>
      ) : fichasVisiveis.length === 0 ? (
        <Box
          sx={{
            border: '1px solid var(--border-primary)',
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            background: 'var(--bg-card)',
          }}
        >
          <Typography variant="h6" sx={{ color: 'var(--text-primary)', mb: 1 }}>
            Nenhuma ficha corresponde aos filtros atuais.
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Ajuste a busca, o universo ou o tipo para encontrar o personagem
            desejado.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(5, minmax(0, 1fr))',
              xl: 'repeat(7, minmax(0, 1fr))',
            },
            gap: 1.5,
          }}
        >
          {fichasVisiveis.map(ficha => {
            const imageUrl = toSafeImageUrl(ficha.linkImagem);
            const canEdit = canManageFicha(ficha);

            return (
              <Card
                key={ficha.id}
                sx={{
                  border: `1px solid ${selectedFichaIds.includes(ficha.id) ? 'rgba(96,165,250,0.8)' : 'rgba(148, 163, 184, 0.2)'}`,
                  background: selectedFichaIds.includes(ficha.id)
                    ? 'rgba(30, 41, 59, 0.95)'
                    : 'rgba(15, 23, 42, 0.8)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  boxShadow: selectedFichaIds.includes(ficha.id)
                    ? '0 0 0 1px rgba(96,165,250,0.45), 0 20px 32px rgba(59,130,246,0.2)'
                    : '0 12px 28px rgba(2, 6, 23, 0.28)',
                  '&:hover': {
                    borderColor: 'rgba(96, 165, 250, 0.55)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 18px 34px rgba(59, 130, 246, 0.2)',
                  },
                  cursor: canEdit ? 'pointer' : 'default',
                }}
                onClick={event => {
                  if (!canEdit) return;

                  if (event.shiftKey) {
                    toggleFichaSelection(ficha, event);
                    return;
                  }

                  setBulkSelectionActive(false);
                  setSelectedFichaIds([]);
                  setLastSelectedFichaId(null);
                }}
                onDoubleClick={() => canEdit && openFichaEditor(ficha)}
                onContextMenu={event => {
                  if (!canEdit) return;
                  event.preventDefault();
                  setContextMenu({
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY + 2,
                    ficha,
                  });
                }}
              >
                <Box sx={{ position: 'relative', height: 420 }}>
                  <EntityImage
                    key={imageUrl || 'empty-image'}
                    src={imageUrl}
                    alt={ficha.nome || 'Ficha'}
                    height="100%"
                    width="100%"
                    objectFit="cover"
                    placeholderText="Sem imagem"
                    fallbackText="Imagem indisponível"
                    sx={{
                      borderRadius: 0,
                      border: 'none',
                      display: 'block',
                      width: '100%',
                      height: '100%',
                    }}
                  />

                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(180deg, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.18) 28%, rgba(2, 6, 23, 0.45) 60%, rgba(2, 6, 23, 0.9) 100%)',
                    }}
                  />

                  <Box sx={{ position: 'absolute', inset: 'auto 0 0 0', p: 1.5, zIndex: 1 }}>
                    <Stack
                      direction="row"
                      sx={{ mb: 0.9, justifyContent: 'space-between', alignItems: 'center', gap: 1 }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: '#f8fafc',
                          fontWeight: 800,
                          wordBreak: 'break-word',
                          lineHeight: 1.25,
                          flex: 1,
                          letterSpacing: '0.01em',
                          textShadow: '0 3px 12px rgba(15, 23, 42, 0.9)',
                        }}
                      >
                        {ficha.nome || 'Sem nome'}
                      </Typography>
                      <Chip
                        label={normalizeFichaTipo(ficha.tipo)}
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, rgba(96,165,250,0.22), rgba(168,85,247,0.18))',
                          color: '#e2e8f0',
                          border: '1px solid rgba(147, 197, 253, 0.45)',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          height: 22,
                          '& .MuiChip-label': { px: 0.8 },
                        }}
                      />
                    </Stack>

                    <Stack spacing={0.55}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(226, 232, 240, 0.9)',
                          lineHeight: 1.35,
                          fontWeight: 600,
                          textShadow: '0 2px 8px rgba(2,6,23,0.8)',
                        }}
                      >
                        <Box component="span" sx={{ color: 'rgba(148, 163, 184, 0.95)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.58rem', mr: 0.5 }}>
                          Universo
                        </Box>
                        {universos.find(
                          universo =>
                            universo.id === (ficha.universo || ficha.universoId),
                        )?.Nome || 'Não informado'}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(226, 232, 240, 0.9)',
                          lineHeight: 1.35,
                          fontWeight: 600,
                          textShadow: '0 2px 8px rgba(2,6,23,0.8)',
                        }}
                      >
                        <Box component="span" sx={{ color: 'rgba(148, 163, 184, 0.95)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.58rem', mr: 0.5 }}>
                          Campanha
                        </Box>
                        {getCampanhaLabel(ficha, campanhasPorId)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(226, 232, 240, 0.9)',
                          lineHeight: 1.35,
                          fontWeight: 600,
                          textShadow: '0 2px 8px rgba(2,6,23,0.8)',
                        }}
                      >
                        <Box component="span" sx={{ color: 'rgba(148, 163, 184, 0.95)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.58rem', mr: 0.5 }}>
                          Dono
                        </Box>
                        {getFichaOwnerName(ficha, ownerNames)}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}

      <Dialog
        open={modalOpen}
        onClose={closeFichaEditor}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              border: '1px solid rgba(148, 163, 184, 0.18)',
              background: 'linear-gradient(180deg, rgba(8, 13, 26, 0.98), rgba(11, 16, 32, 0.96))',
              boxShadow: '0 24px 80px rgba(2, 6, 23, 0.8)',
              overflow: 'hidden',
              maxHeight: '90vh',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 3,
            pb: 2.5,
            color: 'var(--text-primary)',
            background:
              'linear-gradient(180deg, rgba(18, 26, 41, 0.96), rgba(10, 16, 28, 0.94))',
            borderBottom: '1px solid rgba(148, 163, 184, 0.14)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{
                  display: 'block',
                  letterSpacing: 1.8,
                  color: 'var(--color-primary-light)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  mb: 0.5,
                }}
              >
                Re: Dungeon
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {selectedFicha ? 'Editar ficha' : 'Editar ficha'}
                {selectedFicha?.nome ? (
                  <Box component="span" sx={{ color: 'var(--text-secondary)', ml: 1 }}>
                    — {selectedFicha.nome}
                  </Box>
                ) : null}
              </Typography>
            </Box>
            <Button
              onClick={closeFichaEditor}
              aria-label="Fechar modal de edição da ficha"
              sx={{
                minWidth: 0,
                width: 38,
                height: 38,
                borderRadius: '50%',
                color: 'var(--text-secondary)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                background: 'rgba(148, 163, 184, 0.04)',
                '&:hover': {
                  background: 'rgba(111, 45, 168, 0.12)',
                  color: 'var(--text-primary)',
                  borderColor: 'rgba(111, 45, 168, 0.4)',
                },
              }}
            >
              ×
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            px: 3,
            py: 3,
            background:
              'radial-gradient(circle at top left, rgba(111, 45, 168, 0.08), transparent 28%), rgba(9, 14, 26, 0.92)',
          }}
        >
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                gap: 2,
                p: 2,
                borderRadius: 3,
                border: '1px solid rgba(148, 163, 184, 0.14)',
                background: 'rgba(15, 23, 42, 0.7)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
              }}
            >
              <FormControl fullWidth>
                <InputLabel id="ficha-tipo" sx={{ color: 'var(--text-secondary)' }}>
                  Tipo
                </InputLabel>
                <Select
                  labelId="ficha-tipo"
                  value={draft.tipo || ''}
                  label="Tipo"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(148, 163, 184, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(111, 45, 168, 0.6)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--color-primary-light)',
                      boxShadow: '0 0 0 1px rgba(139, 63, 181, 0.32)',
                    },
                    '& .MuiSelect-select': {
                      color: 'var(--text-primary)',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'var(--text-secondary)',
                    },
                  }}
                  onChange={event =>
                    setDraft(previous => ({
                      ...previous,
                      tipo: event.target.value,
                    }))
                  }
                >
                  {TIPOS_FICHA.map(tipo => (
                    <MenuItem
                      key={tipo}
                      value={tipo}
                      sx={{
                        color: 'var(--text-primary)',
                        '&.Mui-selected': {
                          background: 'rgba(111, 45, 168, 0.18)',
                        },
                        '&:hover': {
                          background: 'rgba(111, 45, 168, 0.08)',
                        },
                      }}
                    >
                      {tipo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="ficha-universo" sx={{ color: 'var(--text-secondary)' }}>
                  Universo
                </InputLabel>
                <Select
                  labelId="ficha-universo"
                  value={draft.universo || ''}
                  label="Universo"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(148, 163, 184, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(111, 45, 168, 0.6)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--color-primary-light)',
                      boxShadow: '0 0 0 1px rgba(139, 63, 181, 0.32)',
                    },
                    '& .MuiSelect-select': {
                      color: 'var(--text-primary)',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'var(--text-secondary)',
                    },
                  }}
                  onChange={event => {
                    const nextUniverso = event.target.value;
                    setDraft(previous => ({
                      ...previous,
                      universo: nextUniverso,
                      campanha: campanhasDoUniverso.some(
                        campanha => campanha.id === previous.campanha,
                      )
                        ? previous.campanha
                        : '',
                    }));
                  }}
                >
                  {universosDisponiveis.map(universo => (
                    <MenuItem
                      key={universo.id}
                      value={universo.id}
                      sx={{
                        color: 'var(--text-primary)',
                        '&.Mui-selected': {
                          background: 'rgba(111, 45, 168, 0.18)',
                        },
                        '&:hover': {
                          background: 'rgba(111, 45, 168, 0.08)',
                        },
                      }}
                    >
                      {universo.Nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="ficha-campanha" sx={{ color: 'var(--text-secondary)' }}>
                  Campanha
                </InputLabel>
                <Select
                  labelId="ficha-campanha"
                  value={draft.campanha || ''}
                  label="Campanha"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(148, 163, 184, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(111, 45, 168, 0.6)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--color-primary-light)',
                      boxShadow: '0 0 0 1px rgba(139, 63, 181, 0.32)',
                    },
                    '& .MuiSelect-select': {
                      color: 'var(--text-primary)',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'var(--text-secondary)',
                    },
                  }}
                  onChange={event =>
                    setDraft(previous => ({
                      ...previous,
                      campanha: event.target.value,
                    }))
                  }
                >
                  <MenuItem value="" sx={{ color: 'var(--text-primary)' }}>
                    Sem campanha
                  </MenuItem>
                  {campanhasDoUniverso.map(campanha => (
                    <MenuItem
                      key={campanha.id}
                      value={campanha.id}
                      sx={{
                        color: 'var(--text-primary)',
                        '&.Mui-selected': {
                          background: 'rgba(111, 45, 168, 0.18)',
                        },
                        '&:hover': {
                          background: 'rgba(111, 45, 168, 0.08)',
                        },
                      }}
                    >
                      {campanha.nome || campanha.Nome || 'Campanha sem nome'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid rgba(148, 163, 184, 0.14)',
                background: 'rgba(15, 23, 42, 0.7)',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  mb: 1.5,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Imagem da ficha
              </Typography>

              <TextField
                fullWidth
                label="URL da imagem"
                value={draft.linkImagem || ''}
                onChange={event =>
                  setDraft(previous => ({
                    ...previous,
                    linkImagem: event.target.value,
                  }))
                }
                placeholder="https://example.com/imagem.png"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(9, 14, 26, 0.7)',
                    borderRadius: 2,
                    color: 'var(--text-primary)',
                    '& fieldset': {
                      borderColor: 'rgba(148, 163, 184, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(111, 45, 168, 0.6)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--color-primary-light)',
                      boxShadow: '0 0 0 1px rgba(139, 63, 181, 0.32)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary)',
                  },
                }}
              />

              <EntityImage
                key={draft.linkImagem || 'empty-image-preview'}
                src={draft.linkImagem}
                alt="Pré-visualização da ficha"
                height={260}
                width="100%"
                objectFit="cover"
                placeholderText="Sem imagem"
                fallbackText="Imagem indisponível"
                sx={{
                  borderRadius: 3,
                  border: '1px solid rgba(148, 163, 184, 0.16)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
                }}
              />
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid rgba(148, 163, 184, 0.14)',
                background: 'rgba(15, 23, 42, 0.7)',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  mb: 1.5,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Propriedade e compartilhamento
              </Typography>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Proprietário atual"
                  value={
                    draft.uid
                      ? getFichaOwnerName({ uid: draft.uid }, ownerNames)
                      : 'Sem proprietário'
                  }
                  slotProps={{ input: { readOnly: true } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(18, 29, 46, 0.8)',
                      borderRadius: 2,
                      color: 'var(--text-primary)',
                      '& fieldset': {
                        borderColor: 'rgba(148, 163, 184, 0.18)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--text-secondary)',
                    },
                  }}
                />

                <FormControl fullWidth>
                  <Autocomplete
                    options={ownerOptions}
                    getOptionLabel={option => option?.nome || ''}
                    value={selectedOwnerOption}
                    isOptionEqualToValue={(option, value) =>
                      option?.uid === value?.uid
                    }
                    onChange={(_, value) => {
                      setDraft(previous => ({
                        ...previous,
                        uid: value?.uid || '',
                      }));
                    }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="Distribuir para"
                        placeholder="Buscar usuário"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            background: 'rgba(18, 29, 46, 0.8)',
                            borderRadius: 2,
                            color: 'var(--text-primary)',
                            '& fieldset': {
                              borderColor: 'rgba(148, 163, 184, 0.18)',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'var(--text-secondary)',
                          },
                        }}
                      />
                    )}
                    slotProps={{
                      listbox: {
                        sx: {
                          maxHeight: 220,
                          overflowY: 'auto',
                          padding: 1,
                        },
                      },
                      paper: {
                        sx: {
                          background: 'rgba(11, 18, 30, 0.98)',
                          border: '1px solid rgba(148, 163, 184, 0.18)',
                          borderRadius: 2,
                          boxShadow: '0 18px 40px rgba(2, 6, 23, 0.52)',
                          color: 'var(--text-primary)',
                        },
                      },
                    }}
                    noOptionsText="Nenhum usuário encontrado"
                    clearOnEscape
                  />
                </FormControl>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            borderTop: '1px solid rgba(148, 163, 184, 0.14)',
            background: 'rgba(8, 12, 20, 0.96)',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box>
            <Button
              color="error"
              variant="outlined"
              onClick={() => {
                setDeleteDialogOpen(true);
              }}
              sx={{
                borderRadius: 2,
                borderColor: 'rgba(248, 113, 113, 0.45)',
                color: '#fda4af',
                px: 2.25,
                py: 1,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'rgba(248, 113, 113, 0.7)',
                  background: 'rgba(127, 29, 29, 0.18)',
                },
              }}
            >
              Excluir ficha
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
            <Button
              onClick={handleRetirarProprietario.bind(null, selectedFicha)}
              disabled={!selectedFicha || !selectedFicha.uid}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1,
                color: 'var(--text-primary)',
                background: 'rgba(148, 163, 184, 0.04)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  background: 'rgba(148, 163, 184, 0.09)',
                },
                '&:disabled': {
                  opacity: 0.5,
                },
              }}
            >
              Retirar ficha
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={{
                borderRadius: 2,
                px: 2.75,
                py: 1,
                fontWeight: 700,
                textTransform: 'none',
                background:
                  'linear-gradient(135deg, rgba(111, 45, 168, 0.96), rgba(90, 67, 192, 0.92))',
                boxShadow: '0 12px 24px rgba(111, 45, 168, 0.35)',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, rgba(139, 63, 181, 1), rgba(109, 83, 200, 0.96))',
                },
                '&:disabled': {
                  background: 'rgba(148, 163, 184, 0.18)',
                  color: 'rgba(255,255,255,0.55)',
                  boxShadow: 'none',
                },
              }}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog
        open={withdrawDialogOpen}
        onClose={() => {
          setWithdrawDialogOpen(false);
          setWithdrawFicha(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'var(--text-primary)' }}>
          Retirar ficha do proprietário
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography sx={{ color: 'var(--text-secondary)' }}>
              Deseja retirar o vínculo de{' '}
              <Box component="span" sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                {withdrawFicha?.nome || 'esta ficha'}
              </Box>{' '}
              do jogador atual?
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
          <Button
            onClick={() => {
              setWithdrawDialogOpen(false);
              setWithdrawFicha(null);
            }}
            sx={{
              color: 'var(--text-secondary)',
              textTransform: 'none',
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={confirmRetirarProprietario}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'var(--text-primary)' }}>
          Confirmar exclusão em lote
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography sx={{ color: 'var(--text-secondary)' }}>
              Deseja excluir {selectedFichas.length} ficha{selectedFichas.length > 1 ? 's' : ''} selecionada{selectedFichas.length > 1 ? 's' : ''}?
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedFichas.map(ficha => (
                <Chip
                  key={ficha.id}
                  label={ficha.nome || 'Ficha sem nome'}
                  size="small"
                  sx={{
                    background: 'rgba(96, 165, 250, 0.12)',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(96, 165, 250, 0.28)',
                  }}
                />
              ))}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setBulkDeleteDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Não
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleBulkDelete}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
          >
            Sim
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'var(--text-primary)' }}>
          Confirmar exclusão
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <EntityImage
                key={selectedFicha?.linkImagem || 'empty-delete-preview'}
                src={selectedFicha?.linkImagem}
                alt={selectedFicha?.nome || 'Ficha'}
                height={72}
                width={72}
                objectFit="cover"
                placeholderText="IMG"
                fallbackText="IMG"
                sx={{
                  borderRadius: 2,
                  border: '1px solid rgba(148, 163, 184, 0.16)',
                  background: 'rgba(15, 23, 42, 0.7)',
                }}
              />
              <Box>
                <Typography variant="h6" sx={{ color: 'var(--text-primary)' }}>
                  {selectedFicha?.nome || 'Ficha sem nome'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--text-secondary)' }}
                >
                  Esta ação é permanente e não pode ser desfeita.
                </Typography>
              </Box>
            </Box>

            <TextField
              fullWidth
              label={`Digite ${selectedFicha?.nome || 'NOME'} para confirmar a exclusão`}
              value={deleteName}
              onChange={event => setDeleteName(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteFicha}
            disabled={deleteName.trim() !== (selectedFicha?.nome || '').trim()}
          >
            Excluir definitivamente
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        open={Boolean(contextMenu)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        onClose={() => setContextMenu(null)}
        slotProps={{
          paper: {
            sx: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 2,
            },
          },
        }}
      >
        <MenuItem onClick={() => openFichaEditor(contextMenu?.ficha)}>
          Editar ficha
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSelectedFicha(contextMenu?.ficha);
            setDeleteDialogOpen(true);
          }}
        >
          Excluir ficha
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Fichas;
