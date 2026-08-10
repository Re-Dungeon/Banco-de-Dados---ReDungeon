import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import { Formik, Form, FastField, Field } from 'formik';
import {
  addVeiaAstral,
  updateVeiaAstral,
  getDivindades,
  getVeiasAstrais,
} from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
import FormSelect from 'components/FormSelect/FormSelect';
import ImagePreviewPanel from 'components/ImagePreviewPanel/ImagePreviewPanel';
import FormActions from 'components/FormActions/FormActions';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import {
  VEIA_ASTRAL_SCHEMA,
  VEIA_ASTRAL_INITIAL_VALUES,
  getRequisitosIds,
} from './utils';

const NovaVeiaAstral = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const veiaAstralParaEditar = location.state?.veiaAstral ?? null;

  const { universos, loadingUniversos, isEditing } = useEntityFormGuard({
    itemParaEditar: veiaAstralParaEditar,
    universoDoItem: veiaAstralParaEditar?.universo,
    routeOnDeny: ROUTE_PATHS.VEIAS_ASTRAIS,
  });

  const [divindades, setDivindades] = useState([]);
  const [veiasAstrais, setVeiasAstrais] = useState([]);

  useEffect(() => {
    let active = true;
    getDivindades().then(data => {
      if (active) setDivindades(data);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    getVeiasAstrais().then(data => {
      if (active) setVeiasAstrais(data);
    });
    return () => {
      active = false;
    };
  }, []);

  // eslint-disable-next-line no-unused-vars
  const { requisito: requisitoLegado, ...veiaAstralParaEditarSemLegado } =
    veiaAstralParaEditar ?? {};

  const editInitialValues = veiaAstralParaEditar
    ? {
        ...VEIA_ASTRAL_INITIAL_VALUES,
        ...veiaAstralParaEditarSemLegado,
        requisitos: getRequisitosIds(veiaAstralParaEditar),
      }
    : VEIA_ASTRAL_INITIAL_VALUES;

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateVeiaAstral(veiaAstralParaEditar.id, values);
    } else {
      await addVeiaAstral(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.VEIAS_ASTRAIS);
  };

  const slotInputSx = {
    '& .MuiOutlinedInput-root': {
      color: 'var(--text-primary)',
      '& fieldset': { borderColor: 'var(--border-primary)' },
      '&:hover fieldset': { borderColor: 'var(--border-hover)' },
      '&.Mui-focused fieldset': { borderColor: 'var(--color-accent)' },
    },
    '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-accent)' },
    '& .MuiFormHelperText-root': { color: 'var(--text-muted)' },
  };

  if (loadingUniversos) return null;

  return (
    <Box className="page-container">
      <FormPageHeader
        titulo={isEditing ? 'Editar Veia Astral' : 'Nova Veia Astral'}
        subtitulo={
          isEditing
            ? `Editando os dados de ${veiaAstralParaEditar.nome}`
            : 'Preencha os dados da nova veia astral'
        }
        onVoltar={() => navigate(ROUTE_PATHS.VEIAS_ASTRAIS)}
      />

      <Formik
        initialValues={editInitialValues}
        validationSchema={VEIA_ASTRAL_SCHEMA}
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
                      <FastField name="nome">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Nome"
                            fullWidth
                            error={touched.nome && Boolean(errors.nome)}
                            helperText={touched.nome && errors.nome}
                            sx={slotInputSx}
                          />
                        )}
                      </FastField>

                      <Field name="universo">
                        {({ field, form }) => (
                          <FormSelect
                            field={field}
                            form={form}
                            label="Universo"
                            options={universos.map(universo => ({
                              value: universo.id,
                              label: universo.Nome,
                            }))}
                            disableClearable
                            onValueChange={() =>
                              form.setFieldValue('divindade', '')
                            }
                          />
                        )}
                      </Field>
                    </Box>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' },
                        gap: 2,
                      }}
                    >
                      <Field name="divindade">
                        {({ field, form }) => (
                          <FormSelect
                            field={field}
                            form={form}
                            label="Divindade/Constelação"
                            options={divindades
                              .filter(
                                divindade =>
                                  divindade.universo === values.universo,
                              )
                              .map(divindade => ({
                                value: divindade.id,
                                label: divindade.nome,
                              }))}
                            onValueChange={() =>
                              form.setFieldValue('requisitos', [])
                            }
                          />
                        )}
                      </Field>

                      <FastField name="nivel">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Nível"
                            type="number"
                            fullWidth
                            error={touched.nivel && Boolean(errors.nivel)}
                            helperText={touched.nivel && errors.nivel}
                            sx={slotInputSx}
                          />
                        )}
                      </FastField>
                    </Box>

                    {Number(values.nivel) > 1 && (
                      <Field name="requisitos">
                        {({ field, form }) => (
                          <FormSelect
                            field={field}
                            form={form}
                            multiple
                            label="Requisitos (Veias Astrais)"
                            options={veiasAstrais
                              .filter(
                                veiaAstral =>
                                  veiaAstral.id !== veiaAstralParaEditar?.id &&
                                  veiaAstral.divindade === values.divindade,
                              )
                              .map(veiaAstral => ({
                                value: veiaAstral.id,
                                label: veiaAstral.nome,
                              }))}
                          />
                        )}
                      </Field>
                    )}

                    <FastField name="custo">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Custo"
                          fullWidth
                          sx={slotInputSx}
                        />
                      )}
                    </FastField>

                    <FastField name="linkImagem">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Link da Imagem"
                          fullWidth
                          placeholder="https://..."
                          error={
                            touched.linkImagem && Boolean(errors.linkImagem)
                          }
                          helperText={touched.linkImagem && errors.linkImagem}
                          sx={slotInputSx}
                        />
                      )}
                    </FastField>

                    <FastField name="descricao">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Descrição"
                          fullWidth
                          sx={slotInputSx}
                        />
                      )}
                    </FastField>

                    <FastField name="aprimoramento">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Aprimoramento"
                          fullWidth
                          multiline
                          rows={4}
                          sx={slotInputSx}
                        />
                      )}
                    </FastField>
                  </Box>

                  <ImagePreviewPanel
                    src={values.linkImagem}
                    alt="Preview da veia astral"
                  />
                </Box>
              </Paper>

              <FormActions
                onCancelar={() => navigate(ROUTE_PATHS.VEIAS_ASTRAIS)}
                isSubmitting={isSubmitting}
                labelSalvar={
                  isEditing ? 'Salvar Alterações' : 'Salvar Veia Astral'
                }
              />
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default NovaVeiaAstral;
