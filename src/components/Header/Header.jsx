import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import UserProfileButton from 'components/UserProfileButton/UserProfileButton';
import { StyledAppBar } from './styles';

const Header = ({ onMenuClick }) => (
  <StyledAppBar id="redungeon-header">
    <Toolbar
      sx={{
        justifyContent: 'space-between',
        minHeight: 'var(--header-height) !important',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
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
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <UserProfileButton compact />
      </Box>
    </Toolbar>
  </StyledAppBar>
);

Header.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
};

export default Header;
