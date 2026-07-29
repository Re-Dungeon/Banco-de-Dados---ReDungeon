import React from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { PAGE_TITLES } from 'common/constants/routes';
import { StyledAppBar, PageTitle } from './styles';

const Header = ({ onMenuClick }) => {
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={onMenuClick}
            aria-label="Abrir menu de navegação"
            sx={{
              display: { xs: 'inline-flex', md: 'none' },
              mr: 1,
              color: 'var(--text-primary)',
            }}
          >
            <MenuIcon />
          </IconButton>
          <PageTitle variant="h6" id="page-title">
            {title}
          </PageTitle>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

Header.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
};

export default Header;
