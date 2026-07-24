import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import { Formik, Form, FastField, Field, FieldArray } from 'formik';
import { addCorpoEspecial, updateCorpoEspecial } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
import ImagePreviewPanel from 'components/ImagePreviewPanel/ImagePreviewPanel';
import FormActions from 'components/FormActions/FormActions';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import { CORPO_ESPECIAL_SCHEMA, CORPO_ESPECIAL_INITIAL_VALUES } from './utils';

const NovoCorpoEspecial = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const corpoEspecialParaEditar = location.state?.corpoEspecial ?? null;

  const { universos, loadingUniversos, isEditing } = useEntityFormGuard({
    itemParaEditar: corpoEspecialParaEditar,
    universoDoItem: corpoEspecialParaEditar?.universo,
    routeOnDeny: ROUTE_PATHS.CORPOS_ESPECIAIS,
  });

  const editInitialValues = corpoEspecialParaEditar
    ? {
        ...CORPO_ESPECIAL_INITIAL_VALUES,
        ...corpoEspecialParaEditar,
        bonus: corpoEspecialParaEditar.bonus || [],
      }
    : CORPO_ESPECIAL_INITIAL_VALUES;

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateCorpoEspecial(corpoEspecialParaEditar.id, values);
    } else {
      await addCorpoEspecial(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.CORPOS_ESPECIAIS);
  };

  if (loadingUniversos) return null;

  return (
    <Box className="page-container">
      <FormPageHeader
        titulo={isEditing ? 'Editar Corpo Especial' : 'Novo Corpo Especial'}
        subtitulo={
          isEditing
            ? `Editando os dados de ${corpoEspecialParaEditar.nome}`
            : 'Preencha os dados do novo corpo especial'
        }
        onVoltar={() => navigate(ROUTE_PATHS.CORPOS_ESPECIAIS)}
      />

      <Formik
        initialValues={editInitialValues}
        validationSchema={CORPO_ESPECIAL_SCHEMA}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isSubmitting }) => (
          <Form>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Seção: Informações Gerais */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 2,
                }}
              >
                <SectionTitle>Informações Gerais</SectionTitle>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 280px' },
                    gap: 3,
                    mt: 1.5,
                  }}
                >
                  {/* Campos do lado esquerdo */}
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2,
                      }}
                    >
                      <FastField
                        as={TextField}
                        name="nome"
                        label="Nome do Corpo Especial"
                        fullWidth
                        error={touched.nome && Boolean(errors.nome)}
                        helperText={touched.nome && errors.nome}
                      />
                      <Field name="universo">
                        {({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Universo</InputLabel>
                            <Select {...field} label="Universo">
                              {universos.map(universo => (
                                <MenuItem key={universo.id} value={universo.id}>
                                  {universo.Nome}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </Field>
                    </Box>
                    <FastField
                      as={TextField}
                      name="linkImagem"
                      label="Link da Imagem do Corpo Especial"
                      fullWidth
                      placeholder="https://..."
                      error={touched.linkImagem && Boolean(errors.linkImagem)}
                      helperText={touched.linkImagem && errors.linkImagem}
                    />
                    <FastField
                      as={TextField}
                      name="descricao"
                      label="Descrição"
                      fullWidth
                      multiline
                      rows={4}
                    />
                  </Box>

                  <ImagePreviewPanel
                    src={values.linkImagem}
                    alt="Preview do corpo especial"
                  />
                </Box>
              </Paper>

              {/* Seção: Bônus */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 2,
                }}
              >
                <SectionTitle>Bônus</SectionTitle>
                <FieldArray name="bonus">
                  {({ push, remove }) => (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        mt: 1.5,
                      }}
                    >
                      {values.bonus.length === 0 && (
                        <Typography
                          variant="body2"
                          sx={{ color: 'var(--text-muted)' }}
                        >
                          Nenhum bônus adicionado.
                        </Typography>
                      )}
                      {values.bonus.map((_, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center',
                          }}
                        >
                          <FastField
                            as={TextField}
                            name={`bonus[${idx}]`}
                            label={`Bônus ${idx + 1}`}
                            fullWidth
                            size="small"
                          />
                          <IconButton
                            size="small"
                            onClick={() => remove(idx)}
                            sx={{
                              color: 'var(--text-muted)',
                              '&:hover': { color: '#ef4444' },
                            }}
                            aria-label="Remover bônus"
                          >
                            ✕
                          </IconButton>
                        </Box>
                      ))}
                      <Button
                        variant="outlined"
                        onClick={() => push('')}
                        sx={{
                          alignSelf: 'flex-start',
                          borderColor: 'var(--border-primary)',
                          color: 'var(--text-secondary)',
                          '&:hover': {
                            borderColor: 'var(--color-accent)',
                            color: 'var(--color-accent)',
                          },
                        }}
                      >
                        + Adicionar Bônus
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              </Paper>

              <FormActions
                onCancelar={() => navigate(ROUTE_PATHS.CORPOS_ESPECIAIS)}
                isSubmitting={isSubmitting}
                labelSalvar={
                  isEditing ? 'Salvar Alterações' : 'Salvar Corpo Especial'
                }
              />
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default NovoCorpoEspecial;
