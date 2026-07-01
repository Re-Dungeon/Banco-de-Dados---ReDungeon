import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import { PATCH_NOTES } from './constants';

const PatchNotes = () => {
  return (
    <Box
      className="page-container"
      id="redungeon-patch-notes"
      data-page="patch-notes"
    >
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}
        >
          Patch Notes
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          Acompanhe as atualizações e melhorias.
        </Typography>
      </Box>

      {PATCH_NOTES.map(note => (
        <Paper
          key={note.version}
          elevation={0}
          sx={{
            p: 3,
            mb: 2,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip label={`v${note.version}`} color="primary" size="small" />
            <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
              {note.date}
            </Typography>
          </Box>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {note.changes.map(change => (
              <Typography
                key={change}
                component="li"
                variant="body2"
                sx={{ color: 'var(--text-secondary)', mb: 0.5 }}
              >
                {change}
              </Typography>
            ))}
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default PatchNotes;
