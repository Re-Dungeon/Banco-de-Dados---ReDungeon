import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import { NAV_GROUPS } from 'common/constants/navItems';
import { useAuth } from 'context/AuthContext';
import { useLocation } from 'react-router-dom';
import {
  SidebarWrapper,
  SidebarOverlay,
  LogoSection,
  LogoImage,
  StyledNavLink,
  NavItemButton,
  GroupSection,
  SectionButton,
  SectionTitle,
  SectionChevron,
  SectionItems,
} from './styles';

const matchesRoute = (currentPath, itemPath) =>
  currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  const { currentUser, isAdmin } = useAuth();
  const [manualExpandedGroups, setManualExpandedGroups] = useState({});

  const visibleNavGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => !item.requiresAdmin || isAdmin),
  })).filter(group => group.items.length > 0);

  const activeGroups = visibleNavGroups.reduce((groups, group) => {
    if (group.items.some(item => matchesRoute(location.pathname, item.path))) {
      groups[group.id] = true;
    }

    return groups;
  }, {});

  const toggleGroup = groupId => {
    const nextExpanded = Object.prototype.hasOwnProperty.call(
      manualExpandedGroups,
      groupId,
    )
      ? manualExpandedGroups[groupId]
      : Boolean(activeGroups[groupId]);

    setManualExpandedGroups(previous => ({
      ...previous,
      [groupId]: !nextExpanded,
    }));
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
          <LogoImage aria-label="Re:Dungeon Logo">R</LogoImage>
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
              V3.3
            </Typography>
          </Box>
        </LogoSection>

        <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
          {currentUser && (
            <>
              {visibleNavGroups.map(group => {
                const isExpanded = Object.prototype.hasOwnProperty.call(
                  manualExpandedGroups,
                  group.id,
                )
                  ? manualExpandedGroups[group.id]
                  : Boolean(activeGroups[group.id]);

                return (
                  <GroupSection key={group.id}>
                    <SectionButton
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={`sidebar-section-${group.id}`}
                      onClick={() => toggleGroup(group.id)}
                    >
                      <SectionTitle>{group.title}</SectionTitle>
                      <SectionChevron $expanded={isExpanded} aria-hidden="true">
                        <KeyboardArrowRightRoundedIcon fontSize="small" />
                      </SectionChevron>
                    </SectionButton>

                    <Collapse in={isExpanded} timeout={180} unmountOnExit>
                      <SectionItems id={`sidebar-section-${group.id}`}>
                        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {group.items.map(item => {
                            const Icon = item.icon;
                            const isActive =
                              item.path === location.pathname ||
                              location.pathname.startsWith(`${item.path}/`);

                            return (
                              <ListItem key={item.path} disablePadding>
                                <StyledNavLink
                                  to={item.path}
                                  end={item.path === '/recursos'}
                                  onClick={onClose}
                                  className={({ isActive: navIsActive }) =>
                                    navIsActive ? 'active' : ''
                                  }
                                >
                                  <NavItemButton className="nav-item-btn" selected={isActive}>
                                    <ListItemIcon>
                                      <Icon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                                          {item.label}
                                        </Typography>
                                      }
                                    />
                                  </NavItemButton>
                                </StyledNavLink>
                              </ListItem>
                            );
                          })}
                        </List>
                      </SectionItems>
                    </Collapse>
                  </GroupSection>
                );
              })}
            </>
          )}
        </Box>

      </SidebarWrapper>
    </>
  );
};

Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;
