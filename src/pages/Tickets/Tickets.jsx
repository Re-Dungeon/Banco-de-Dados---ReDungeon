import React, { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Trash2 } from 'lucide-react';
import { useAuth } from 'context/AuthContext';
import {
  deleteSupportTicket,
  getSupportTickets,
  updateSupportTicket,
} from 'service/storage';

const STATUS_META = {
  open: { label: 'Aberto', color: 'warning' },
  'in-progress': { label: 'Em andamento', color: 'info' },
  answered: { label: 'Respondido', color: 'success' },
  resolved: { label: 'Resolvido', color: 'default' },
};

const normalizeStatus = status => {
  const normalized = String(status ?? 'open').trim().toLowerCase().replace(/_/g, '-');

  if (normalized === 'in-progress' || normalized === 'in_progress') {
    return 'in-progress';
  }

  if (normalized === 'answered' || normalized === 'respondido') {
    return 'answered';
  }

  if (normalized === 'resolved' || normalized === 'resolvido') {
    return 'resolved';
  }

  return 'open';
};

const formatDate = value => {
  if (!value) {
    return 'Sem data';
  }

  if (typeof value === 'object' && value !== null && typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000).toLocaleDateString('pt-BR');
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Sem data';
  }

  return parsedDate.toLocaleDateString('pt-BR');
};

const formatRelativeStatus = ticket => {
  if (ticket.respondedAt) {
    return formatDate(ticket.respondedAt);
  }

  return formatDate(ticket.updatedAt || ticket.createdAt);
};

const Tickets = () => {
  const { currentUser, isAdmin, loadingPermissions } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortMode, setSortMode] = useState('recent');
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [savingTicketId, setSavingTicketId] = useState('');
  const [deletingTicketId, setDeletingTicketId] = useState('');
  const [responseDrafts, setResponseDrafts] = useState({});
  const [statusDrafts, setStatusDrafts] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const canDeleteTicket = isAdmin === true && !loadingPermissions;

  useEffect(() => {
    let active = true;

    const loadTickets = async () => {
      if (!currentUser) {
        if (active) {
          setTickets([]);
          setLoadingTickets(false);
        }
        return;
      }

      if (active) {
        setLoadingTickets(true);
        setError('');
      }

      try {
        const items = await getSupportTickets();

        if (!active) {
          return;
        }

        setTickets(Array.isArray(items) ? items : []);
      } catch (loadError) {
        // eslint-disable-next-line no-console
        console.error('[Tickets] getSupportTickets failed', {
          code: loadError?.code ?? null,
          message: loadError?.message ?? String(loadError),
          operation: 'getSupportTickets()',
        });

        if (active) {
          setTickets([]);
          setError('Não foi possível carregar os tickets de suporte. Tente novamente.');
        }
      } finally {
        if (active) {
          setLoadingTickets(false);
        }
      }
    };

    void loadTickets();

    return () => {
      active = false;
    };
  }, [currentUser]);

  const counts = useMemo(() => {
    const summary = {
      total: tickets.length,
      open: tickets.filter(ticket => normalizeStatus(ticket.status) === 'open').length,
      'in-progress': tickets.filter(ticket => normalizeStatus(ticket.status) === 'in-progress').length,
      answered: tickets.filter(ticket => normalizeStatus(ticket.status) === 'answered').length,
      resolved: tickets.filter(ticket => normalizeStatus(ticket.status) === 'resolved').length,
    };

    return summary;
  }, [tickets]);

  const sourceOptions = useMemo(() => {
    const uniqueSources = tickets.reduce((sources, ticket) => {
      const label = ticket.sourceAppName || ticket.sourceApp || 'Banco de Dados';
      if (label && !sources.includes(label)) {
        sources.push(label);
      }
      return sources;
    }, []);

    return ['all', ...uniqueSources];
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    return [...tickets]
      .filter(ticket => {
        const title = String(ticket.title ?? '').toLowerCase();
        const description = String(ticket.description ?? '').toLowerCase();
        const userName = String(ticket.userDisplayName ?? '').toLowerCase();
        const userEmail = String(ticket.userEmail ?? '').toLowerCase();
        const sourceLabel = String(ticket.sourceAppName || ticket.sourceApp || 'Banco de Dados').toLowerCase();
        const matchesSearch =
          !normalizedQuery ||
          title.includes(normalizedQuery) ||
          description.includes(normalizedQuery) ||
          userName.includes(normalizedQuery) ||
          userEmail.includes(normalizedQuery) ||
          sourceLabel.includes(normalizedQuery);

        const matchesStatus = statusFilter === 'all' || normalizeStatus(ticket.status) === statusFilter;
        const matchesSource = sourceFilter === 'all' || (ticket.sourceAppName || ticket.sourceApp || 'Banco de Dados') === sourceFilter;

        return matchesSearch && matchesStatus && matchesSource;
      })
      .sort((left, right) => {
        const leftValue = left.createdAt?.seconds ?? 0;
        const rightValue = right.createdAt?.seconds ?? 0;

        if (sortMode === 'older') {
          return leftValue - rightValue;
        }

        return rightValue - leftValue;
      });
  }, [searchTerm, sourceFilter, sortMode, statusFilter, tickets]);

  const selectedTicket =
    filteredTickets.find(ticket => ticket.id === selectedTicketId) ?? filteredTickets[0] ?? null;

  const handleSaveTicket = async ticket => {
    const draftResponse = String(responseDrafts[ticket.id] ?? ticket.adminResponse ?? '').trim();
    const nextStatus = normalizeStatus(statusDrafts[ticket.id] ?? ticket.status ?? 'open');

    setSavingTicketId(ticket.id);
    setError('');
    setSuccessMessage('');

    try {
      const nextTicketData = {
        status: nextStatus,
        adminResponse: draftResponse || null,
        respondedAt: draftResponse ? ticket.respondedAt || new Date() : null,
      };

      await updateSupportTicket(ticket.id, nextTicketData);

      setTickets(previous =>
        previous.map(currentTicket =>
          currentTicket.id === ticket.id
            ? {
                ...currentTicket,
                ...nextTicketData,
                updatedAt: new Date(),
              }
            : currentTicket,
        ),
      );
    } catch (saveError) {
      // eslint-disable-next-line no-console
      console.error('[Tickets] updateSupportTicket failed', {
        code: saveError?.code ?? null,
        message: saveError?.message ?? String(saveError),
        operation: 'updateSupportTicket(ticket.id, updates)',
      });
      setError('Não foi possível atualizar o ticket. Tente novamente.');
    } finally {
      setSavingTicketId('');
    }
  };

  const handleRequestDelete = ticket => {
    if (!canDeleteTicket || !ticket) {
      return;
    }

    setTicketToDelete(ticket);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!ticketToDelete || !canDeleteTicket) {
      return;
    }

    setDeletingTicketId(ticketToDelete.id);
    setError('');
    setSuccessMessage('');

    try {
      await deleteSupportTicket(ticketToDelete.id);
      setTickets(previous => previous.filter(currentTicket => currentTicket.id !== ticketToDelete.id));
      setSelectedTicketId(previousSelectedId =>
        previousSelectedId === ticketToDelete.id ? '' : previousSelectedId,
      );
      setSuccessMessage('Ticket excluído com sucesso.');
    } catch (deleteError) {
      // eslint-disable-next-line no-console
      console.error('[Tickets] deleteSupportTicket failed', {
        code: deleteError?.code ?? null,
        message: deleteError?.message ?? String(deleteError),
        operation: 'deleteSupportTicket(ticket.id)',
      });
      setError('Não foi possível excluir o ticket. Tente novamente.');
    } finally {
      setDeletingTicketId('');
      setDeleteDialogOpen(false);
      setTicketToDelete(null);
    }
  };

  return (
    <Box className="page-container" id="redungeon-tickets" data-page="tickets" sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}>
          Central de Tickets
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          Acompanhamento geral de suporte e respostas administrativas.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {[
          { key: 'total', label: 'Total', value: counts.total },
          { key: 'open', label: 'Abertos', value: counts.open },
          { key: 'in-progress', label: 'Em andamento', value: counts['in-progress'] },
          { key: 'answered', label: 'Respondidos', value: counts.answered },
          { key: 'resolved', label: 'Resolvidos', value: counts.resolved },
        ].map(metric => (
          <Paper
            key={metric.key}
            elevation={0}
            sx={{
              flex: 1,
              p: 2,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: 3,
            }}
          >
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.75 }}>
              {metric.label}
            </Typography>
            <Typography variant="h4" sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              {metric.value}
            </Typography>
          </Paper>
        ))}
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 3,
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
          <TextField
            label="Buscar ticket"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="Nome, e-mail, título ou origem"
            fullWidth
            slotProps={{
              input: {
                sx: {
                  background: 'rgba(15, 23, 42, 0.25)',
                  borderRadius: 2,
                  color: 'var(--text-primary)',
                },
              },
            }}
          />

          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={event => setStatusFilter(event.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">Todos</MenuItem>
            {Object.entries(STATUS_META).map(([value, meta]) => (
              <MenuItem key={value} value={value}>
                {meta.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Origem"
            value={sourceFilter}
            onChange={event => setSourceFilter(event.target.value)}
            sx={{ minWidth: 180 }}
          >
            {sourceOptions.map(source => (
              <MenuItem key={source} value={source}>
                {source === 'all' ? 'Todas as origens' : source}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Ordenar"
            value={sortMode}
            onChange={event => setSortMode(event.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="recent">Mais recentes</MenuItem>
            <MenuItem value="older">Mais antigos</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {error && (
        <Typography sx={{ color: '#fda4af', fontWeight: 600 }}>
          {error}
        </Typography>
      )}

      {successMessage && (
        <Typography sx={{ color: '#86efac', fontWeight: 600 }}>
          {successMessage}
        </Typography>
      )}

      {loadingTickets ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '360px 1fr' }, gap: 2 }}>
          <Paper
            elevation={0}
            sx={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid var(--border-primary)' }}>
              <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                Tickets filtrados
              </Typography>
            </Box>

            <Box sx={{ p: 2, display: 'grid', gap: 1.5, maxHeight: '70vh', overflowY: 'auto' }}>
              {filteredTickets.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  Nenhum ticket corresponde aos filtros atuais.
                </Typography>
              ) : (
                filteredTickets.map(ticket => {
                  const status = normalizeStatus(ticket.status);
                  const isSelected = selectedTicket?.id === ticket.id;

                  return (
                    <Box
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: isSelected ? '1px solid rgba(111, 45, 168, 0.5)' : '1px solid rgba(148, 163, 184, 0.16)',
                        background: isSelected ? 'rgba(111, 45, 168, 0.12)' : 'rgba(15, 23, 42, 0.12)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': { borderColor: 'rgba(148, 163, 184, 0.28)' },
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <Typography variant="subtitle2" sx={{ color: 'var(--text-primary)', fontWeight: 700, wordBreak: 'break-word' }}>
                            {ticket.title || 'Ticket sem título'}
                          </Typography>
                          <Chip
                            label={STATUS_META[status]?.label ?? 'Aberto'}
                            color={STATUS_META[status]?.color ?? 'warning'}
                            size="small"
                          />
                        </Stack>

                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                          {ticket.userDisplayName || 'Usuário sem nome'} • {ticket.userEmail || 'e-mail não informado'}
                        </Typography>

                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                          {ticket.sourceAppName || ticket.sourceApp || 'Banco de Dados'} • {formatDate(ticket.createdAt)}
                        </Typography>
                      </Stack>
                    </Box>
                  );
                })
              )}
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: 3,
              p: 2,
            }}
          >
            {selectedTicket ? (
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}>
                      {selectedTicket.title || 'Ticket sem título'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                      {selectedTicket.userDisplayName || 'Usuário sem nome'} • {selectedTicket.userEmail || 'e-mail não informado'}
                    </Typography>
                  </Box>

                  {canDeleteTicket && (
                    <IconButton
                      aria-label={`Excluir ticket ${selectedTicket.title || 'sem título'}`}
                      size="small"
                      color="error"
                      onClick={() => handleRequestDelete(selectedTicket)}
                      disabled={deletingTicketId === selectedTicket.id}
                      sx={{
                        border: '1px solid rgba(239, 68, 68, 0.28)',
                        background: 'rgba(239, 68, 68, 0.08)',
                        '&:hover': {
                          background: 'rgba(239, 68, 68, 0.16)',
                        },
                      }}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  )}
                </Box>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                  <Chip label={selectedTicket.category || 'Outro'} size="small" color="primary" />
                  <Chip label={selectedTicket.sourceAppName || selectedTicket.sourceApp || 'Banco de Dados'} size="small" color="secondary" />
                  <Chip label={STATUS_META[normalizeStatus(selectedTicket.status)]?.label ?? 'Aberto'} size="small" color={STATUS_META[normalizeStatus(selectedTicket.status)]?.color ?? 'warning'} />
                </Stack>

                <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(15, 23, 42, 0.25)', border: '1px solid rgba(148, 163, 184, 0.18)' }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 1 }}>
                    Descrição do usuário
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                    {selectedTicket.description || 'Sem descrição registrada.'}
                  </Typography>
                </Box>

                {Array.isArray(selectedTicket.attachments) && selectedTicket.attachments.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 1 }}>
                      Anexos
                    </Typography>
                    <Stack spacing={1}>
                      {selectedTicket.attachments.map((attachment, index) => (
                        <a
                          key={`${attachment}-${index}`}
                          href={attachment}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--color-accent)', wordBreak: 'break-all' }}
                        >
                          {attachment}
                        </a>
                      ))}
                    </Stack>
                  </Box>
                )}

                <Divider sx={{ borderColor: 'var(--border-primary)' }} />

                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 1 }}>
                    Resposta administrativa
                  </Typography>

                  <TextField
                    select
                    label="Status"
                    value={statusDrafts[selectedTicket.id] ?? normalizeStatus(selectedTicket.status)}
                    onChange={event =>
                      setStatusDrafts(previous => ({
                        ...previous,
                        [selectedTicket.id]: event.target.value,
                      }))
                    }
                    sx={{ minWidth: 220, mb: 2 }}
                  >
                    {Object.entries(STATUS_META).map(([value, meta]) => (
                      <MenuItem key={value} value={value}>
                        {meta.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Mensagem de resposta"
                    value={responseDrafts[selectedTicket.id] ?? selectedTicket.adminResponse ?? ''}
                    onChange={event =>
                      setResponseDrafts(previous => ({
                        ...previous,
                        [selectedTicket.id]: event.target.value,
                      }))
                    }
                    multiline
                    minRows={6}
                    placeholder="Escreva a resposta para o usuário."
                    fullWidth
                    slotProps={{
                      input: {
                        sx: {
                          background: 'rgba(15, 23, 42, 0.25)',
                          borderRadius: 2,
                          color: 'var(--text-primary)',
                        },
                      },
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                      Atualizado em: {formatRelativeStatus(selectedTicket)}
                    </Typography>

                    <Button
                      variant="contained"
                      onClick={() => handleSaveTicket(selectedTicket)}
                      disabled={savingTicketId === selectedTicket.id}
                      sx={{
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        color: '#fff',
                        textTransform: 'none',
                        borderRadius: 2,
                      }}
                    >
                      {savingTicketId === selectedTicket.id ? 'Salvando...' : 'Salvar resposta'}
                    </Button>
                  </Box>
                </Box>
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                Selecione um ticket para visualizar detalhes.
              </Typography>
            )}
          </Paper>
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTicketToDelete(null);
        }}
        aria-modal="true"
        role="dialog"
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(1, 4, 10, 0.7)',
              backdropFilter: 'blur(10px)',
            },
          },
          paper: {
            sx: {
              width: { xs: 'calc(100vw - 32px)', md: 420 },
              maxWidth: 420,
              background: 'rgba(10, 15, 25, 0.92)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              boxShadow: '0 28px 80px rgba(0, 0, 0, 0.55)',
              color: 'var(--text-primary)',
            },
          },
        }}
      >
        <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            Excluir ticket?
          </Typography>

          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Essa ação é permanente e não poderá ser desfeita.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTicketToDelete(null);
              }}
              sx={{
                color: 'var(--text-primary)',
                borderColor: 'rgba(255,255,255,0.16)',
                borderRadius: '999px',
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDelete}
              disabled={!ticketToDelete || deletingTicketId !== ''}
              sx={{ borderRadius: '999px' }}
            >
              {deletingTicketId ? 'Excluindo...' : 'Confirmar exclusão'}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Tickets;
