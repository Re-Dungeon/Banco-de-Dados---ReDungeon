import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import { Formik, Form } from 'formik';
import { getNPCs, addNPC, removeNPC } from 'service/storage';
import { RACAS, CLASSES } from './constants';
import { NPC_SCHEMA } from './utils';
import { NPCCard } from './styles';

const NPCs = () => {
  const [npcs, setNpcs] = useState(() => getNPCs());
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddNPC = (values, { setSubmitting, resetForm }) => {
    const novo = addNPC(values);
    setNpcs(prev => [...prev, novo]);
    resetForm();
    setSubmitting(false);
    setModalOpen(false);
  };

  const handleRemove = id => {
    removeNPC(id);
    setNpcs(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Box className="page-container" id="redungeon-npcs" data-page="npcs">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}
          >
            NPCs
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie seus personagens não-jogáveis.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setModalOpen(true)}
          sx={{ borderRadius: 2 }}
          disabled
        >
          + Novo NPC
        </Button>
      </Box>

      {npcs.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'var(--text-muted)',
          }}
        >
          <Typography variant="h2" sx={{ mb: 1 }}>
            👤
          </Typography>
          <Typography variant="body1" sx={{ mb: 0.5 }}>
            Nenhum NPC criado
          </Typography>
          <Typography variant="caption">
            Clique em &quot;Novo NPC&quot; para começar.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 2,
          }}
        >
          {npcs.map(npc => (
            <NPCCard key={npc.id} elevation={0}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                >
                  {npc.nome}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleRemove(npc.id)}
                  sx={{
                    color: 'var(--text-muted)',
                    '&:hover': { color: '#ef4444' },
                  }}
                >
                  ✕
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={npc.raca}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={npc.classe}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </Box>
              {npc.descricao && (
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--text-secondary)' }}
                >
                  {npc.descricao}
                </Typography>
              )}
            </NPCCard>
          ))}
        </Box>
      )}

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
          },
        }}
      >
        <DialogTitle sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
          Novo NPC
        </DialogTitle>
        <Formik
          initialValues={{ nome: '', raca: '', classe: '', descricao: '' }}
          validationSchema={NPC_SCHEMA}
          onSubmit={handleAddNPC}
        >
          {({ errors, touched, isSubmitting, getFieldProps }) => (
            <Form>
              <DialogContent
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
              >
                <TextField
                  label="Nome"
                  fullWidth
                  {...getFieldProps('nome')}
                  error={touched.nome && Boolean(errors.nome)}
                  helperText={touched.nome && errors.nome}
                />
                <TextField
                  label="Raça"
                  select
                  fullWidth
                  {...getFieldProps('raca')}
                  error={touched.raca && Boolean(errors.raca)}
                  helperText={touched.raca && errors.raca}
                >
                  {RACAS.map(r => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Classe"
                  select
                  fullWidth
                  {...getFieldProps('classe')}
                  error={touched.classe && Boolean(errors.classe)}
                  helperText={touched.classe && errors.classe}
                >
                  {CLASSES.map(c => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Descrição"
                  multiline
                  rows={3}
                  fullWidth
                  {...getFieldProps('descricao')}
                  error={touched.descricao && Boolean(errors.descricao)}
                  helperText={touched.descricao && errors.descricao}
                />
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                  onClick={() => setModalOpen(false)}
                  sx={{ color: 'var(--text-secondary)' }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  Criar NPC
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
};

export default NPCs;
