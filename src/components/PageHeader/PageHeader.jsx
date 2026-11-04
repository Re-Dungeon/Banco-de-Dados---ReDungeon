import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  pageHeaderActionsSx,
  pageHeaderDescriptionSx,
  pageHeaderSx,
  pageHeaderTitleSx,
} from './styles';

const PageHeader = ({ title, description, actions, children, sx = {} }) => (
  <Box sx={{ ...pageHeaderSx, ...sx }}>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography variant="h5" sx={pageHeaderTitleSx}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={pageHeaderDescriptionSx}>
          {description}
        </Typography>
      )}
    </Box>

    {(actions || children) && (
      <Box sx={pageHeaderActionsSx}>{actions ?? children}</Box>
    )}
  </Box>
);

PageHeader.propTypes = {
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  actions: PropTypes.node,
  children: PropTypes.node,
  sx: PropTypes.object,
};

export default PageHeader;
