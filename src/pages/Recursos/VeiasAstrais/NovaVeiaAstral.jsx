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
  addVeiaAstral,
  updateVeiaAstral,
  getDivindades,
  getVeiasAstrais,
} from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
import ImagePreviewPanel from 'components/ImagePreviewPanel/ImagePreviewPanel';
import FormActions from 'components/FormActions/FormActions';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import { VEIA_ASTRAL_SCHEMA, VEIA_ASTRAL_INITIAL_VALUES } from './utils';

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

  const editInitialValues = veiaAstralParaEditar
    ? {
        ...VEIA_ASTRAL_INITIAL_VALUES,
        ...veiaAstralParaEditar,
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

  const selectSx = {
    color: 'var(--text-primary)',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--border-primary)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--border-hover)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--color-accent)',
    },
    '& .MuiSvgIcon-root': { color: 'var(--text-secondary)' },
  };

  const menuPropsSx = {
    PaperProps: {
      sx: { background: 'var(--bg-card)', color: 'var(--text-primary)' },
    },
  };

  const labelSx = {
    color: 'var(--text-secondary)',
    '&.Mui-focused': { color: 'var(--color-accent)' },
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
                          <FormControl fullWidth>
                            <InputLabel sx={labelSx}>Universo</InputLabel>
                            <Select
                              {...field}
                              label="Universo"
                              sx={selectSx}
                              MenuProps={menuPropsSx}
                              onChange={e => {
                                field.onChange(e);
                                form.setFieldValue('divindade', '');
                              }}
                            >
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

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' },
                        gap: 2,
                      }}
                    >
                      <Field name="divindade">
                        {({ field, form }) => (
                          <FormControl fullWidth>
                            <InputLabel sx={labelSx}>
                              Divindade/Constelação
                            </InputLabel>
                            <Select
                              {...field}
                              label="Divindade/Constelação"
                              sx={selectSx}
                              MenuProps={menuPropsSx}
                              onChange={e => {
                                field.onChange(e);
                                form.setFieldValue('requisito', '');
                              }}
                            >
                              <MenuItem value="">Nenhuma</MenuItem>
                              {divindades
                                .filter(
                                  divindade =>
                                    divindade.universo === values.universo,
                                )
                                .map(divindade => (
                                  <MenuItem
                                    key={divindade.id}
                                    value={divindade.id}
                                  >
                                    {divindade.nome}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
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
                      <Field name="requisito">
                        {({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel sx={labelSx}>
                              Requisito (Veia Astral)
                            </InputLabel>
                            <Select
                              {...field}
                              label="Requisito (Veia Astral)"
                              sx={selectSx}
                              MenuProps={menuPropsSx}
                            >
                              <MenuItem value="">Nenhum</MenuItem>
                              {veiasAstrais
                                .filter(
                                  veiaAstral =>
                                    veiaAstral.id !==
                                      veiaAstralParaEditar?.id &&
                                    veiaAstral.divindade === values.divindade,
                                )
                                .map(veiaAstral => (
                                  <MenuItem
                                    key={veiaAstral.id}
                                    value={veiaAstral.id}
                                  >
                                    {veiaAstral.nome}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
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
