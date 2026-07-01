import React from 'react';
import { useLocation } from 'react-router-dom';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { PAGE_TITLES } from 'common/constants/routes';
import { StyledAppBar, PageTitle } from './styles';

const Header = () => {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Re:Dungeon';

  return (
    <StyledAppBar id="redungeon-header">
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          minHeight: 'var(--header-height) !important',
        }}
      >
        <PageTitle variant="h6" id="page-title">
          {title}
        </PageTitle>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Pesquisar">
            <IconButton
              id="btn-search"
              aria-label="Pesquisar"
              sx={{
                color: 'var(--color-text)',
                '&:hover': { color: 'var(--color-accent)' },
              }}
            >
              🔍
            </IconButton>
          </Tooltip>
          <Tooltip title="Notificações">
            <IconButton
              id="btn-notifications"
              aria-label="Notificações"
              sx={{
                color: 'var(--color-text)',
                '&:hover': { color: 'var(--color-accent)' },
              }}
            >
              🔔
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
