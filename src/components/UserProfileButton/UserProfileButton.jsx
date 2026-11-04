import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useAuth } from 'context/AuthContext';
import LoginModal from 'components/LoginModal/LoginModal';
import UserSettingsModal from 'components/UserSettingsModal/UserSettingsModal';

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

const UserProfileButton = ({ compact = false }) => {
  const { currentUser, logout, userSettings, loadingPreferences } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const menuOpen = Boolean(anchorEl);
  const isProfileLoading = Boolean(currentUser && loadingPreferences);
  const profileDisplayName =
    userSettings?.nomeExibicao || currentUser?.displayName || currentUser?.email || 'Usuário';
  const profileImageUrl =
    normalizeProfileImageUrl(userSettings?.fotoPerfilUrl) || currentUser?.photoURL || '';

  const handleToggleMenu = event => {
    if (!currentUser) {
      setLoginModalOpen(true);
      return;
    }

    setAnchorEl(previous => (previous ? null : event.currentTarget));
  };

  const handleCloseMenu = () => setAnchorEl(null);

  const handleSettingsClick = () => {
    handleCloseMenu();
    setSettingsModalOpen(true);
  };

  const handleLogoutClick = () => {
    handleCloseMenu();
    logout();
  };

  return (
    <>
      <Tooltip title={currentUser ? 'Perfil do usuário' : 'Fazer login'} placement="bottom">
        <Box
          component="button"
          type="button"
          id="btn-user-profile"
          aria-haspopup="menu"
          aria-expanded={menuOpen ? 'true' : undefined}
          aria-controls={menuOpen ? 'user-profile-menu' : undefined}
          aria-label={currentUser ? 'Perfil do usuário' : 'Fazer login'}
          onClick={handleToggleMenu}
          sx={{
            border: '1px solid rgba(148, 163, 184, 0.18)',
            background: compact
              ? 'rgba(15, 23, 42, 0.52)'
              : 'rgba(15, 23, 42, 0.7)',
            color: 'var(--text-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.25,
            px: compact ? 1.25 : 1.5,
            py: compact ? 0.75 : 0.9,
            borderRadius: 999,
            cursor: 'pointer',
            transition: 'all 180ms ease',
            '&:hover': {
              borderColor: 'rgba(96, 208, 255, 0.48)',
              background: 'rgba(17, 24, 39, 0.82)',
              boxShadow: '0 0 0 1px rgba(96, 208, 255, 0.12)',
            },
          }}
        >
          <Box
            className={isProfileLoading ? 're-image-shell is-loading' : 're-image-shell'}
            sx={{
              position: 'relative',
              width: compact ? 28 : 32,
              height: compact ? 28 : 32,
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(148, 163, 184, 0.18)',
            }}
          >
            <Avatar
              src={isProfileLoading ? undefined : profileImageUrl || undefined}
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: isProfileLoading ? 'rgba(148, 163, 184, 0.2)' : 'rgba(111, 45, 168, 0.85)',
                fontSize: compact ? 13 : 15,
                border: '1px solid rgba(255,255,255,0.08)',
                color: isProfileLoading ? 'rgba(255,255,255,0.45)' : 'inherit',
                opacity: isProfileLoading ? 0 : 1,
                transition: 'opacity 240ms ease',
              }}
            >
              {isProfileLoading ? '…' : currentUser ? profileDisplayName?.[0]?.toUpperCase() || '👤' : '👤'}
            </Avatar>
            {isProfileLoading && <Box className="re-image-shimmer" aria-hidden="true" sx={{ borderRadius: '50%' }} />}
          </Box>

          {currentUser && (
            <>
              {isProfileLoading ? (
                <Box
                  sx={{
                    width: compact ? 90 : 120,
                    height: compact ? 12 : 14,
                    borderRadius: 999,
                    background: 'rgba(148, 163, 184, 0.18)',
                    boxShadow: 'inset 0 0 0 1px rgba(148, 163, 184, 0.08)',
                  }}
                />
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    maxWidth: compact ? 110 : 140,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {profileDisplayName || currentUser.email}
                </Typography>
              )}

              <KeyboardArrowDownRoundedIcon
                fontSize="small"
                sx={{
                  color: 'var(--text-secondary)',
                  transition: 'transform 180ms ease',
                  transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </>
          )}
        </Box>
      </Tooltip>

      <Menu
        id="user-profile-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          list: {
            'aria-labelledby': 'btn-user-profile',
            sx: { p: 0.75 },
          },
          paper: {
            sx: {
              mt: 1.25,
              minWidth: 220,
              borderRadius: 3,
              border: '1px solid rgba(148, 163, 184, 0.18)',
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.88))',
              boxShadow: '0 18px 42px rgba(2, 6, 23, 0.42)',
              overflow: 'visible',
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: -7,
                right: 18,
                width: 14,
                height: 14,
                bgcolor: 'rgba(15, 23, 42, 0.96)',
                transform: 'rotate(45deg)',
                borderTop: '1px solid rgba(148, 163, 184, 0.18)',
                borderLeft: '1px solid rgba(148, 163, 184, 0.18)',
              },
            },
          },
        }}
      >
        <MenuItem
          onClick={handleSettingsClick}
          sx={{
            borderRadius: 2,
            px: 1.5,
            py: 1,
            gap: 1,
            color: 'var(--text-primary)',
            '&:hover': {
              background: 'rgba(148, 163, 184, 0.08)',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'var(--text-secondary)' }}>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Configurações" />
        </MenuItem>

        <MenuItem
          onClick={handleLogoutClick}
          sx={{
            borderRadius: 2,
            px: 1.5,
            py: 1,
            gap: 1,
            color: '#fca5a5',
            '&:hover': {
              background: 'rgba(239, 68, 68, 0.08)',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: '#fca5a5' }}>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sair da conta" />
        </MenuItem>
      </Menu>

      <UserSettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
};

UserProfileButton.propTypes = {
  compact: PropTypes.bool,
};

export default UserProfileButton;
