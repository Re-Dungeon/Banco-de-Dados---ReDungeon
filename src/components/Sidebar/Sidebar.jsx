import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { NAV_ITEMS, NAV_ITEMS_SECONDARY } from 'common/constants/navItems';
import { useAuth } from 'context/AuthContext';
import LoginModal from 'components/LoginModal/LoginModal';
import {
  SidebarWrapper,
  SidebarOverlay,
  LogoSection,
  LogoImage,
  StyledNavLink,
  NavItemButton,
  UserButton,
} from './styles';

const Sidebar = ({ open, onClose }) => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  const handleUserButtonClick = () => {
    if (currentUser) {
      logout();
    } else {
      setLoginModalOpen(true);
    }
  };

  return (
    <>
      <SidebarOverlay $open={open} onClick={onClose} aria-hidden="true" />
      <SidebarWrapper id="redungeon-sidebar" $open={open}>
        <IconButton
          onClick={onClose}
          aria-label="Fechar menu de navegação"
          sx={{
            display: { xs: 'inline-flex', md: 'none' },
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'var(--text-secondary)',
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>
        <LogoSection>
          <LogoImage
            src="https://i.imgur.com/GdBanRI.png"
            alt="Re:Dungeon Logo"
          />
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: 'var(--text-primary)',
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              Re:Dungeon
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--accent-primary)',
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              V3.1
            </Typography>
          </Box>
        </LogoSection>

        <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
          {currentUser && (
            <>
              <List disablePadding>
                {NAV_ITEMS.map(item => (
                  <ListItem key={item.path} disablePadding>
                    <StyledNavLink to={item.path} onClick={onClose}>
                      <NavItemButton className="nav-item-btn">
                        <ListItemIcon sx={{ fontSize: 18 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        />
                      </NavItemButton>
                    </StyledNavLink>
                  </ListItem>
                ))}
              </List>

              <Divider
                sx={{ mx: 2, my: 1, borderColor: 'rgba(255,255,255,0.08)' }}
              />

              <List disablePadding>
                {NAV_ITEMS_SECONDARY.map(item => (
                  <ListItem key={item.path} disablePadding>
                    <StyledNavLink to={item.path} onClick={onClose}>
                      <NavItemButton className="nav-item-btn">
                        <ListItemIcon sx={{ fontSize: 18 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        />
                      </NavItemButton>
                    </StyledNavLink>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Box>

        <Tooltip
          title={currentUser ? 'Sair da conta' : 'Fazer login'}
          placement="top"
        >
          <UserButton
            id="btn-user-profile"
            onClick={handleUserButtonClick}
            aria-label={currentUser ? 'Sair da conta' : 'Fazer login'}
          >
            <Avatar
              src={currentUser?.photoURL || undefined}
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                fontSize: 16,
              }}
            >
              {currentUser
                ? currentUser.displayName?.[0]?.toUpperCase() || '👤'
                : '👤'}
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 120,
              }}
            >
              {currentUser
                ? currentUser.displayName || currentUser.email
                : 'Usuário'}
            </Typography>
          </UserButton>
        </Tooltip>

        <LoginModal
          open={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
        />
      </SidebarWrapper>
    </>
  );
};

Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;
