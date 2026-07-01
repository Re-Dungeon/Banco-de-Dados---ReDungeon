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
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { getMesas, addMesa, removeMesa } from 'service/storage';
import { SISTEMAS } from './constants';
import { MesaCard } from './styles';

const MESA_SCHEMA = Yup.object({
  nome: Yup.string()
    .required('Nome é obrigatório')
    .min(2, 'Mínimo 2 caracteres'),
  sistema: Yup.string().required('Sistema é obrigatório'),
});

const INITIAL_VALUES = { nome: '', sistema: 'D&D 5e' };

const Mesas = () => {
  const [mesas, setMesas] = useState(() => getMesas());
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddMesa = (values, { setSubmitting, resetForm }) => {
    const nova = addMesa(values);
    setMesas(prev => [...prev, nova]);
    resetForm();
    setSubmitting(false);
    setModalOpen(false);
  };

  const handleRemove = id => {
    removeMesa(id);
    setMesas(prev => prev.filter(m => m.id !== id));
  };

  return (
    <Box className="page-container" id="redungeon-mesas" data-page="mesas">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}
          >
            Mesas
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Administre suas mesas de RPG aqui.
          </Typography>
        </Box>
        {/* <Button
          variant="contained"
          color="primary"
          onClick={() => setModalOpen(true)}
          sx={{ borderRadius: 2 }}
          disabled
        >
          + Nova Mesa
        </Button> */}
      </Box>

      {mesas.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}>
          <Typography variant="h2" sx={{ mb: 1 }}>
            🎲
          </Typography>
          <Typography variant="body1">Nenhuma mesa criada</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 2,
          }}
        >
          {mesas.map(mesa => (
            <MesaCard key={mesa.id} elevation={0}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                  >
                    {mesa.nome}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'var(--text-secondary)' }}
                  >
                    {mesa.sistema}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => handleRemove(mesa.id)}
                  sx={{
                    color: 'var(--text-muted)',
                    minWidth: 0,
                    '&:hover': { color: '#ef4444' },
                  }}
                >
                  ✕
                </Button>
              </Box>
            </MesaCard>
          ))}
        </Box>
      )}

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Nova Mesa</DialogTitle>
        <Formik
          initialValues={INITIAL_VALUES}
          validationSchema={MESA_SCHEMA}
          onSubmit={handleAddMesa}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form noValidate>
              <DialogContent
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <Field
                  as={TextField}
                  name="nome"
                  label="Nome da Mesa"
                  fullWidth
                  required
                  error={touched.nome && Boolean(errors.nome)}
                  helperText={touched.nome && errors.nome}
                />
                <Field
                  as={TextField}
                  name="sistema"
                  label="Sistema"
                  select
                  fullWidth
                  required
                  error={touched.sistema && Boolean(errors.sistema)}
                  helperText={touched.sistema && errors.sistema}
                >
                  {SISTEMAS.map(s => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Field>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  Criar Mesa
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
};

export default Mesas;
