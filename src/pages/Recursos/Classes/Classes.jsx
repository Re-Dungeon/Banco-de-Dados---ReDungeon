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
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import { Formik, Form, Field } from 'formik';
import { getClasses, addClass, removeClass } from 'service/storage';
import { CLASSE_SCHEMA } from './utils';
import { ClasseCard } from './styles';
import { TIPOS_CLASSE } from './constants';

const Classes = () => {
  const [classes, setClasses] = useState(() => getClasses());
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdd = (values, { setSubmitting, resetForm }) => {
    const nova = addClass(values);
    setClasses(prev => [...prev, nova]);
    resetForm();
    setSubmitting(false);
    setModalOpen(false);
  };

  const handleRemove = id => {
    removeClass(id);
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  return (
    <Box className="page-container" id="redungeon-classes" data-page="classes">
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
            Classes
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as classes disponíveis na campanha.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setModalOpen(true)}
          sx={{
            background: 'var(--color-primary)',
            '&:hover': { background: '#5a2090' },
          }}
        >
          + Nova Classe
        </Button>
      </Box>

      {classes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}>
          <Typography variant="h2" sx={{ mb: 1 }}>
            ⚔️
          </Typography>
          <Typography variant="body1">Nenhuma classe cadastrada</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 2,
          }}
        >
          {classes.map(classe => (
            <ClasseCard key={classe.id} elevation={0}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                  >
                    {classe.nome}
                  </Typography>
                  {classe.tipo && (
                    <Chip
                      label={classe.tipo}
                      size="small"
                      sx={{
                        mt: 0.5,
                        background: 'rgba(111,45,168,0.3)',
                        color: 'var(--color-accent)',
                        fontSize: '0.7rem',
                      }}
                    />
                  )}
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleRemove(classe.id)}
                  sx={{
                    color: 'var(--text-muted)',
                    '&:hover': { color: '#ef4444' },
                  }}
                  aria-label={`Remover classe ${classe.nome}`}
                >
                  ✕
                </IconButton>
              </Box>
              {classe.descricao && (
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--text-secondary)', mt: 1 }}
                >
                  {classe.descricao}
                </Typography>
              )}
              {classe.habilidades && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'var(--text-muted)',
                    mt: 1,
                    fontStyle: 'italic',
                  }}
                >
                  Habilidades: {classe.habilidades}
                </Typography>
              )}
            </ClasseCard>
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
        <DialogTitle sx={{ color: 'var(--text-primary)' }}>
          Nova Classe
        </DialogTitle>
        <Formik
          initialValues={{ nome: '', tipo: '', descricao: '', habilidades: '' }}
          validationSchema={CLASSE_SCHEMA}
          onSubmit={handleAdd}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <Field
                  as={TextField}
                  name="nome"
                  label="Nome"
                  fullWidth
                  error={touched.nome && Boolean(errors.nome)}
                  helperText={touched.nome && errors.nome}
                />
                <Field
                  as={TextField}
                  name="tipo"
                  label="Tipo"
                  select
                  fullWidth
                  error={touched.tipo && Boolean(errors.tipo)}
                  helperText={touched.tipo && errors.tipo}
                >
                  <MenuItem value="">Selecione...</MenuItem>
                  {TIPOS_CLASSE.map(t => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Field>
                <Field
                  as={TextField}
                  name="descricao"
                  label="Descrição"
                  fullWidth
                  multiline
                  rows={3}
                  error={touched.descricao && Boolean(errors.descricao)}
                  helperText={touched.descricao && errors.descricao}
                />
                <Field
                  as={TextField}
                  name="habilidades"
                  label="Habilidades Principais"
                  fullWidth
                  multiline
                  rows={2}
                  error={touched.habilidades && Boolean(errors.habilidades)}
                  helperText={touched.habilidades && errors.habilidades}
                />
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                  onClick={() => setModalOpen(false)}
                  sx={{ color: 'var(--text-muted)' }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    background: 'var(--color-primary)',
                    '&:hover': { background: '#5a2090' },
                  }}
                >
                  Salvar
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
};

export default Classes;
