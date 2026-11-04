import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { sendPasswordResetEmail } from 'firebase/auth';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Fade from '@mui/material/Fade';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useAuth } from 'context/AuthContext';
import { auth } from 'service/firebase';
import { DEFAULT_USER_SETTINGS, saveUserSettings } from 'service/storage';

const DEFAULT_SETTINGS = {
  nomeExibicao: '',
  fotoPerfilUrl: '',
  tema: 'dark',
  corDestaque: '#6F2DA8',
  notificacoes: { ativadas: true },
};

const ACCENT_PRESETS = ['#00D9FF', '#6F2DA8', '#22C55E', '#F59E0B', '#F43F5E', '#A78BFA'];
const THEME_OPTIONS = [
  {
    value: 'dark',
    label: 'Escuro',
    preview:
      'linear-gradient(135deg, rgba(2, 6, 23, 1) 0%, rgba(15, 23, 42, 1) 40%, rgba(54, 65, 85, 1) 100%)',
  },
];

const normalizeProfileImageUrl = value => {
  if (typeof value !== 'string') {
    return '';
  }

  const normalized = value.trim();
  if (!normalized || !/^https:\/\//i.test(normalized)) {
    return '';
  }

  return normalized;
};

const sectionMeta = {
  perfil: { label: 'Perfil', icon: PersonOutlineOutlinedIcon },
  aparencia: { label: 'Aparência', icon: PaletteOutlinedIcon },
  preferencias: { label: 'Preferências', icon: NotificationsOutlinedIcon },
  administracao: { label: 'Administração', icon: ShieldOutlinedIcon },
};

const adjustHexColor = (hex, amount) => {
  const normalized = hex.replace('#', '');
  const safe = normalized.length === 3
    ? normalized
        .split('')
        .map(part => part + part)
        .join('')
    : normalized;

  const number = Number.parseInt(safe, 16);
  const channels = [
    (number >> 16) & 255,
    (number >> 8) & 255,
    number & 255,
  ].map(channel => {
    const next = Math.max(0, Math.min(255, channel + amount));
    return next.toString(16).padStart(2, '0');
  });

  return `#${channels.join('')}`.toUpperCase();
};

const applySavedTheme = settings => {
  const nextTheme = 'dark';
  const accent = settings?.corDestaque || '#00D9FF';
  const primaryDark = adjustHexColor(accent, -28);
  const primaryLight = adjustHexColor(accent, 28);

  document.documentElement.setAttribute('data-theme', nextTheme);
  document.documentElement.style.setProperty('--color-accent', accent);
  document.documentElement.style.setProperty('--color-primary', accent);
  document.documentElement.style.setProperty('--color-primary-dark', primaryDark);
  document.documentElement.style.setProperty('--color-primary-light', primaryLight);
  document.documentElement.style.setProperty('--accent-primary', accent);
};

const UserSettingsModal = ({ open, onClose, onPreferencesUpdated }) => {
  const { currentUser, isAdmin, userSettings, refreshUserPreferences } = useAuth();
  const [selectedSection, setSelectedSection] = useState('perfil');
  const [settings, setSettings] = useState(userSettings || DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const syncSettingsFromContext = useCallback(() => {
    if (!currentUser) {
      return;
    }

    const merged = {
      ...DEFAULT_SETTINGS,
      ...userSettings,
      fotoPerfilUrl: normalizeProfileImageUrl(userSettings?.fotoPerfilUrl ?? ''),
      nomeExibicao:
        userSettings?.nomeExibicao || currentUser.displayName || currentUser.email || '',
      notificacoes: {
        ativadas: userSettings?.notificacoes?.ativadas !== false,
      },
    };

    setSettings(merged);
    applySavedTheme(merged);
    setError('');
    setSuccess('');
    setLoading(false);
  }, [currentUser, userSettings]);

  const order = useMemo(
    () => ['perfil', 'aparencia', 'preferencias', 'administracao'],
    [],
  );

  const handleFieldChange = (field, value) => {
    setSettings(previous => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleNotificationChange = event => {
    setSettings(previous => ({
      ...previous,
      notificacoes: {
        ...previous.notificacoes,
        ativadas: event.target.checked,
      },
    }));
  };

  const handleClose = () => {
    setSuccess('');
    setError('');
    onClose();
  };

  const handleSave = async () => {
    if (!currentUser) {
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...settings,
        nomeExibicao: settings.nomeExibicao.trim() || currentUser.displayName || '',
        fotoPerfilUrl: normalizeProfileImageUrl(settings.fotoPerfilUrl),
        notificacoes: {
          ativadas: settings.notificacoes?.ativadas !== false,
        },
      };

      const saved = await saveUserSettings(currentUser.uid, payload);
      await refreshUserPreferences(currentUser.uid, saved);
      setSettings(saved);
      applySavedTheme(saved);
      setSuccess('Preferências salvas com sucesso.');
      if (onPreferencesUpdated) {
        onPreferencesUpdated(saved);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[UserSettingsModal] saveUserSettings failed', {
        code: error?.code ?? null,
        message: error?.message ?? String(error),
        operation: 'saveUserSettings(currentUser.uid, payload)',
      });
      setError('Não foi possível salvar suas preferências. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetAppearance = () => {
    setResetDialogOpen(true);
  };

  const confirmResetAppearance = () => {
    const restored = {
      ...settings,
      tema: DEFAULT_USER_SETTINGS.tema,
      corDestaque: '#6F2DA8',
      notificacoes: {
        ...DEFAULT_USER_SETTINGS.notificacoes,
      },
    };

    setSettings(restored);
    applySavedTheme(restored);
    setSuccess('Aparência restaurada para o padrão do Re.');
    setResetDialogOpen(false);
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) {
      setError('Não foi possível identificar o e-mail desta conta.');
      return;
    }

    setResettingPassword(true);
    setError('');
    setSuccess('');

    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setSuccess('E-mail de redefinição de senha enviado com sucesso.');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[UserSettingsModal] resetPasswordEmail failed', {
        code: error?.code ?? null,
        message: error?.message ?? String(error),
        operation: 'sendPasswordResetEmail(auth, currentUser.email)',
      });
      setError('Não foi possível enviar o e-mail de redefinição de senha.');
    } finally {
      setResettingPassword(false);
    }
  };

  const renderContent = () => {
    if (selectedSection === 'perfil') {
      return (
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: 3,
              background: 'rgba(148, 163, 184, 0.08)',
            }}
          >
            <Avatar
              src={normalizeProfileImageUrl(settings.fotoPerfilUrl) || currentUser?.photoURL || undefined}
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'rgba(111, 45, 168, 0.85)',
                fontSize: 22,
              }}
            >
              {currentUser?.displayName?.[0]?.toUpperCase() || '👤'}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'var(--text-secondary)' }}>
                Perfil da conta
              </Typography>
              <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                {settings.nomeExibicao || currentUser?.displayName || currentUser?.email || 'Usuário'}
              </Typography>
            </Box>
          </Box>

          <TextField
            label="Nome de exibição"
            value={settings.nomeExibicao}
            onChange={event => handleFieldChange('nomeExibicao', event.target.value)}
            fullWidth
            placeholder="Digite o nome que deseja exibir"
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

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              background: 'rgba(148, 163, 184, 0.06)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
            }}
          >
            <Typography variant="subtitle2" sx={{ color: 'var(--text-primary)', mb: 1.5 }}>
              URL da imagem de perfil
            </Typography>

            <TextField
              value={settings.fotoPerfilUrl}
              onChange={event => handleFieldChange('fotoPerfilUrl', event.target.value)}
              fullWidth
              placeholder="https://exemplo.com/avatar.jpg"
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

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Avatar
                src={normalizeProfileImageUrl(settings.fotoPerfilUrl) || currentUser?.photoURL || undefined}
                sx={{
                  width: 52,
                  height: 52,
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  bgcolor: 'rgba(111, 45, 168, 0.85)',
                }}
              >
                {currentUser?.displayName?.[0]?.toUpperCase() || '👤'}
              </Avatar>

              <Button
                variant="outlined"
                size="small"
                onClick={() => handleFieldChange('fotoPerfilUrl', '')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  color: 'var(--text-primary)',
                  borderColor: 'rgba(148, 163, 184, 0.25)',
                }}
              >
                Remover imagem
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              background: 'rgba(148, 163, 184, 0.06)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
            }}
          >
            <Typography variant="subtitle2" sx={{ color: 'var(--text-primary)', mb: 1.5 }}>
              Segurança da conta
            </Typography>

            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  E-mail vinculado
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {currentUser?.email || 'Não informado'}
                </Typography>
              </Box>

              <Button
                variant="contained"
                onClick={handlePasswordReset}
                disabled={resettingPassword}
                sx={{
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  color: '#fff',
                  textTransform: 'none',
                  borderRadius: 2,
                  alignSelf: 'flex-start',
                }}
              >
                {resettingPassword ? 'Enviando...' : 'Enviar e-mail para redefinir senha'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      );
    }

    if (selectedSection === 'aparencia') {
      return (
        <Stack spacing={3}>
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              background: 'rgba(148, 163, 184, 0.06)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
            }}
          >
            <Typography variant="subtitle2" sx={{ color: 'var(--text-primary)', mb: 1.5 }}>
              Tema visual
            </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              {THEME_OPTIONS.map(option => (
                <Button
                  key={option.value}
                  variant={settings.tema === option.value ? 'contained' : 'outlined'}
                  onClick={() => handleFieldChange('tema', option.value)}
                  sx={{
                    flex: 1,
                    minHeight: 86,
                    p: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    color: settings.tema === option.value ? '#fff' : 'var(--text-primary)',
                    borderColor: 'rgba(148, 163, 184, 0.25)',
                    background:
                      settings.tema === option.value
                        ? option.preview
                        : 'rgba(15, 23, 42, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: option.preview,
                      border: '1px solid rgba(255,255,255,0.25)',
                    }}
                  />
                  {option.label}
                </Button>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              background: 'rgba(148, 163, 184, 0.06)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
            }}
          >
            <Typography variant="subtitle2" sx={{ color: 'var(--text-primary)', mb: 1.5 }}>
              Cor de destaque
            </Typography>

            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {ACCENT_PRESETS.map(color => (
                  <Button
                    key={color}
                    onClick={() => handleFieldChange('corDestaque', color)}
                    sx={{
                      minWidth: 0,
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: color,
                      border:
                        settings.corDestaque === color
                          ? '2px solid rgba(255,255,255,0.9)'
                          : '1px solid rgba(148, 163, 184, 0.3)',
                      boxShadow:
                        settings.corDestaque === color ? '0 0 0 2px rgba(96, 208, 255, 0.25)' : 'none',
                    }}
                    aria-label={`Selecionar cor ${color}`}
                  />
                ))}
              </Stack>

              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                sx={{ alignItems: 'center' }}
              >
                <TextField
                  type="color"
                  value={settings.corDestaque}
                  onChange={event => handleFieldChange('corDestaque', event.target.value)}
                  fullWidth
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      sx: {
                        minHeight: 56,
                        padding: '0 10px',
                        background: 'rgba(15, 23, 42, 0.25)',
                        borderRadius: 2,
                      },
                    },
                  }}
                />

                <TextField
                  value={settings.corDestaque}
                  onChange={event => handleFieldChange('corDestaque', event.target.value)}
                  label="Hexadecimal"
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
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              background: 'rgba(148, 163, 184, 0.06)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
            }}
          >
            <Typography variant="subtitle2" sx={{ color: 'var(--text-primary)', mb: 1.5 }}>
              Pré-visualização
            </Typography>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Button
                variant="contained"
                sx={{
                  background: `linear-gradient(135deg, ${settings.corDestaque}, var(--color-accent))`,
                  color: '#fff',
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                Botão principal
              </Button>

              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: settings.corDestaque,
                  border: '2px solid rgba(255,255,255,0.5)',
                }}
              />
            </Stack>

            <Button
              variant="outlined"
              onClick={handleResetAppearance}
              sx={{
                mt: 2,
                borderRadius: 2,
                textTransform: 'none',
                color: 'var(--text-primary)',
                borderColor: 'rgba(148, 163, 184, 0.25)',
              }}
            >
              Restaurar aparência padrão
            </Button>
          </Box>
        </Stack>
      );
    }

    if (selectedSection === 'preferencias') {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            p: 2,
            borderRadius: 3,
            background: 'rgba(148, 163, 184, 0.08)',
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              Notificações
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              Receber alertas básicos sobre a conta e atividades do sistema.
            </Typography>
          </Box>

          <Switch
            checked={settings.notificacoes?.ativadas !== false}
            onChange={handleNotificationChange}
            color="secondary"
          />
        </Box>
      );
    }

    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          border: '1px solid rgba(148, 163, 184, 0.18)',
          background: 'rgba(148, 163, 184, 0.06)',
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 2,
              background: 'rgba(96, 165, 250, 0.1)',
              color: 'var(--text-primary)',
            }}
          >
            <LockOutlinedIcon fontSize="small" />
          </Box>
          <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            Área administrativa reservada
          </Typography>
        </Stack>

        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Opções administrativas ficam disponíveis apenas para usuários com privilégios de
          administrador. Usuários comuns podem visualizar essa área, mas não podem alterar
          dados de permissões ou configurações sensíveis.
        </Typography>

        {!isAdmin && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              background: 'rgba(15, 23, 42, 0.25)',
              border: '1px dashed rgba(148, 163, 184, 0.3)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
              Acesso restrito para administradores.
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <>
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="reset-appearance-dialog-title"
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(2, 6, 23, 0.7)',
              backdropFilter: 'blur(10px)',
            },
          },
          paper: {
            sx: {
              borderRadius: '28px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(11, 17, 32, 0.97)',
              color: 'var(--text-primary)',
              p: 1,
            },
          },
        }}
      >
        <Box sx={{ p: 2.5, textAlign: 'center' }}>
          <Typography
            id="reset-appearance-dialog-title"
            variant="h6"
            sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 1 }}
          >
            Restaurar aparência padrão
          </Typography>

          <Typography variant="body1" sx={{ color: 'var(--text-secondary)', lineHeight: 1.6, mb: 3 }}>
            Deseja voltar às configurações visuais originais do Re? Isso redefine o tema e a cor de destaque para os valores padrão do sistema.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={confirmResetAppearance}
              sx={{
                flex: 1,
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #f7c7c7, #f0b1b1)',
                color: '#111827',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #f5bebe, #eb9a9a)',
                },
              }}
            >
              OK
            </Button>
            <Button
              variant="outlined"
              onClick={() => setResetDialogOpen(false)}
              sx={{
                flex: 1,
                borderRadius: '999px',
                borderColor: 'rgba(255,255,255,0.12)',
                color: 'var(--text-primary)',
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.04)',
                },
              }}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        aria-labelledby="user-settings-dialog-title"
        slots={{ transition: Fade }}
        slotProps={{
          transition: {
            onEntered: syncSettingsFromContext,
          },
          paper: {
            sx: {
              borderRadius: 4,
              border: '1px solid rgba(148, 163, 184, 0.18)',
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.9))',
              overflow: 'hidden',
              maxHeight: '90vh',
              minHeight: { xs: '70vh', md: '62vh' },
            },
          },
        }}
      >
        <DialogTitle
          id="user-settings-dialog-title"
          sx={{
            color: 'var(--text-primary)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
            pb: 1.5,
            fontWeight: 700,
          }}
        >
          Configurações da conta
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              minHeight: 420,
            }}
          >
            <Box
              sx={{
                width: { xs: '100%', md: 220 },
                p: 2,
                borderRight: { md: '1px solid rgba(148, 163, 184, 0.18)' },
                background: 'rgba(2, 6, 23, 0.22)',
              }}
            >
              <Stack spacing={1}>
                {order.map(sectionKey => {
                  const meta = sectionMeta[sectionKey];
                  const Icon = meta.icon;
                  const isSelected = selectedSection === sectionKey;

                  return (
                    <Button
                      key={sectionKey}
                      onClick={() => setSelectedSection(sectionKey)}
                      startIcon={<Icon fontSize="small" />}
                      sx={{
                        justifyContent: 'flex-start',
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        textTransform: 'none',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        background: isSelected ? 'rgba(96, 208, 255, 0.12)' : 'transparent',
                        border: isSelected ? '1px solid rgba(96, 208, 255, 0.2)' : '1px solid transparent',
                        '&:hover': {
                          background: 'rgba(148, 163, 184, 0.08)',
                        },
                      }}
                    >
                      {meta.label}
                    </Button>
                  );
                })}
              </Stack>
            </Box>

            <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
              {loading ? (
                <Typography sx={{ color: 'var(--text-secondary)' }}>
                  Carregando preferências...
                </Typography>
              ) : (
                <>
                  {error && (
                    <Typography sx={{ color: '#fca5a5', mb: 2 }}>
                      {error}
                    </Typography>
                  )}

                  {success && (
                    <Typography sx={{ color: '#86efac', mb: 2 }}>
                      {success}
                    </Typography>
                  )}

                  {renderContent()}
                </>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(148, 163, 184, 0.18)' }}>
          <Button onClick={handleClose} color="inherit" sx={{ color: 'var(--text-secondary)' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || loading}
            sx={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              color: '#fff',
              textTransform: 'none',
              borderRadius: 2,
              px: 2.5,
              '&:hover': {
                opacity: 0.96,
              },
            }}
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

UserSettingsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPreferencesUpdated: PropTypes.func,
};

UserSettingsModal.defaultProps = {
  onPreferencesUpdated: undefined,
};

export default UserSettingsModal;
