import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import { Formik, Form, FastField, Field } from 'formik';
import {
  addReinoCultivo,
  updateReinoCultivo,
  getReinosCultivo,
} from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
import ImagePreviewPanel from 'components/ImagePreviewPanel/ImagePreviewPanel';
import FormActions from 'components/FormActions/FormActions';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import { REINO_CULTIVO_SCHEMA, REINO_CULTIVO_INITIAL_VALUES } from './utils';

const NovoReinoCultivo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reinoCultivoParaEditar = location.state?.reinoCultivo ?? null;

  const { universos, loadingUniversos, isEditing } = useEntityFormGuard({
    itemParaEditar: reinoCultivoParaEditar,
    universoDoItem: reinoCultivoParaEditar?.universo,
    routeOnDeny: ROUTE_PATHS.REINOS_CULTIVO,
  });

  const [reinosCultivo, setReinosCultivo] = useState([]);

  useEffect(() => {
    let active = true;
    getReinosCultivo().then(data => {
      if (active) setReinosCultivo(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const editInitialValues = reinoCultivoParaEditar
    ? {
        ...REINO_CULTIVO_INITIAL_VALUES,
        ...reinoCultivoParaEditar,
      }
    : REINO_CULTIVO_INITIAL_VALUES;

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateReinoCultivo(reinoCultivoParaEditar.id, values);
    } else {
      await addReinoCultivo(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.REINOS_CULTIVO);
  };

  if (loadingUniversos) return null;

  return (
    <Box className="page-container">
      <FormPageHeader
        titulo={isEditing ? 'Editar Reino de Cultivo' : 'Novo Reino de Cultivo'}
        subtitulo={
          isEditing
            ? `Editando os dados de ${reinoCultivoParaEditar.nome}`
            : 'Preencha os dados do novo reino de cultivo'
        }
        onVoltar={() => navigate(ROUTE_PATHS.REINOS_CULTIVO)}
      />

      <Formik
        initialValues={editInitialValues}
        validationSchema={REINO_CULTIVO_SCHEMA}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isSubmitting }) => {
          const universoSelecionado = universos.find(
            u => u.id === values.universo,
          );
          const subUniversosDisponiveis =
            universoSelecionado?.SubUniversos || [];
          const reinosAnterioresDisponiveis = reinosCultivo.filter(
            reino =>
              reino.id !== reinoCultivoParaEditar?.id &&
              reino.universo === values.universo &&
              (!values.subUniverso || reino.subUniverso === values.subUniverso),
          );

          return (
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
                          label="Nome do Reino de Cultivo"
                          fullWidth
                          error={touched.nome && Boolean(errors.nome)}
                          helperText={touched.nome && errors.nome}
                        />
                        <Field name="universo">
                          {({ field, form }) => (
                            <FormControl fullWidth>
                              <InputLabel>Universo</InputLabel>
                              <Select
                                {...field}
                                label="Universo"
                                onChange={e => {
                                  field.onChange(e);
                                  form.setFieldValue('subUniverso', '');
                                  form.setFieldValue('reinoAnterior', '');
                                }}
                              >
                                {universos.map(universo => (
                                  <MenuItem
                                    key={universo.id}
                                    value={universo.id}
                                  >
                                    {universo.Nome}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </Field>
                      </Box>

                      {subUniversosDisponiveis.length > 0 && (
                        <Field name="subUniverso">
                          {({ field, form }) => (
                            <FormControl fullWidth>
                              <InputLabel>Subuniverso</InputLabel>
                              <Select
                                {...field}
                                label="Subuniverso"
                                onChange={e => {
                                  field.onChange(e);
                                  form.setFieldValue('reinoAnterior', '');
                                }}
                              >
                                <MenuItem value="">Nenhum</MenuItem>
                                {subUniversosDisponiveis.map(subUniverso => (
                                  <MenuItem
                                    key={subUniverso}
                                    value={subUniverso}
                                  >
                                    {subUniverso}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </Field>
                      )}

                      <Field name="reinoAnterior">
                        {({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Reino Anterior</InputLabel>
                            <Select {...field} label="Reino Anterior">
                              <MenuItem value="">Nenhum</MenuItem>
                              {reinosAnterioresDisponiveis.map(reino => (
                                <MenuItem key={reino.id} value={reino.id}>
                                  {reino.nome}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </Field>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                          gap: 2,
                        }}
                      >
                        <FastField
                          as={TextField}
                          name="quantidadeSubReinos"
                          label="Quantidade de Sub-Reinos"
                          type="number"
                          fullWidth
                          error={
                            touched.quantidadeSubReinos &&
                            Boolean(errors.quantidadeSubReinos)
                          }
                          helperText={
                            touched.quantidadeSubReinos &&
                            errors.quantidadeSubReinos
                          }
                        />
                        <FastField
                          as={TextField}
                          name="experienciaPorSubReino"
                          label="Experiência por Sub-Reino"
                          type="number"
                          fullWidth
                          error={
                            touched.experienciaPorSubReino &&
                            Boolean(errors.experienciaPorSubReino)
                          }
                          helperText={
                            touched.experienciaPorSubReino &&
                            errors.experienciaPorSubReino
                          }
                        />
                      </Box>

                      <FastField
                        as={TextField}
                        name="linkImagem"
                        label="Link da Imagem do Reino de Cultivo"
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
                      alt="Preview do reino de cultivo"
                    />
                  </Box>
                </Paper>

                <FormActions
                  onCancelar={() => navigate(ROUTE_PATHS.REINOS_CULTIVO)}
                  isSubmitting={isSubmitting}
                  labelSalvar={
                    isEditing ? 'Salvar Alterações' : 'Salvar Reino de Cultivo'
                  }
                />
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default NovoReinoCultivo;
