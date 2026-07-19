import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import { Formik, Form, FastField, Field } from 'formik';
import { addMaterial, updateMaterial } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
import ImagePreviewPanel from 'components/ImagePreviewPanel/ImagePreviewPanel';
import FormActions from 'components/FormActions/FormActions';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import { MATERIAL_SCHEMA, MATERIAL_INITIAL_VALUES } from './utils';
import { RARIDADES } from 'common/constants/constants';

const NovoMaterial = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const materialParaEditar = location.state?.material ?? null;

  const { universos, loadingUniversos, isEditing } = useEntityFormGuard({
    itemParaEditar: materialParaEditar,
    universoDoItem: materialParaEditar?.universo,
    routeOnDeny: ROUTE_PATHS.MATERIAIS,
  });

  const editInitialValues = materialParaEditar
    ? {
        ...MATERIAL_INITIAL_VALUES,
        ...materialParaEditar,
      }
    : MATERIAL_INITIAL_VALUES;

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateMaterial(materialParaEditar.id, values);
    } else {
      await addMaterial(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.MATERIAIS);
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
    '& .MuiFormHelperText-root': { color: '#ef4444' },
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

  if (loadingUniversos) return null;

  return (
    <Box className="page-container">
      <FormPageHeader
        titulo={isEditing ? 'Editar Material' : 'Novo Material'}
        subtitulo={
          isEditing
            ? `Editando os dados de ${materialParaEditar.nome}`
            : 'Preencha os dados do novo material'
        }
        onVoltar={() => navigate(ROUTE_PATHS.MATERIAIS)}
      />

      <Formik
        initialValues={editInitialValues}
        validationSchema={MATERIAL_SCHEMA}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isSubmitting, setFieldValue }) => (
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
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                        gap: 2,
                      }}
                    >
                      <FastField name="nome">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Nome do Material"
                            fullWidth
                            error={touched.nome && Boolean(errors.nome)}
                            helperText={touched.nome && errors.nome}
                            sx={slotInputSx}
                          />
                        )}
                      </FastField>

                      <FastField name="tipo">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Tipo"
                            fullWidth
                            sx={slotInputSx}
                          />
                        )}
                      </FastField>

                      <Field name="raridade">
                        {({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel
                              sx={{
                                color: 'var(--text-secondary)',
                                '&.Mui-focused': {
                                  color: 'var(--color-accent)',
                                },
                              }}
                            >
                              Raridade
                            </InputLabel>
                            <Select
                              {...field}
                              label="Raridade"
                              sx={selectSx}
                              MenuProps={menuPropsSx}
                            >
                              <MenuItem value="">Nenhuma</MenuItem>
                              {RARIDADES.map(raridade => (
                                <MenuItem key={raridade} value={raridade}>
                                  {raridade}
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
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2,
                      }}
                    >
                      <FastField name="valorMercado">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Valor de Mercado"
                            fullWidth
                            placeholder="ex: 50 ouros"
                            sx={slotInputSx}
                          />
                        )}
                      </FastField>

                      <FastField name="quantidadeBase">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Quantidade Base"
                            fullWidth
                            placeholder="ex: 1d6"
                            sx={slotInputSx}
                          />
                        )}
                      </FastField>
                    </Box>

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

                    <Field name="universo">
                      {({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel
                            sx={{
                              color: 'var(--text-secondary)',
                              '&.Mui-focused': { color: 'var(--color-accent)' },
                            }}
                          >
                            Universo
                          </InputLabel>
                          <Select
                            {...field}
                            label="Universo"
                            sx={selectSx}
                            MenuProps={menuPropsSx}
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

                  <ImagePreviewPanel
                    src={values.linkImagem}
                    alt="Preview do material"
                  />
                </Box>
              </Paper>

              {/* Seção: Atributos Numéricos */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 2,
                }}
              >
                <SectionTitle>Atributos</SectionTitle>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 4,
                    mt: 2,
                  }}
                >
                  {/* Pureza */}
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}
                      >
                        Pureza
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'var(--color-accent)', fontWeight: 700 }}
                      >
                        {values.pureza}%
                      </Typography>
                    </Box>
                    <Slider
                      value={values.pureza}
                      onChange={(_, value) => setFieldValue('pureza', value)}
                      min={0}
                      max={100}
                      step={1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={v => `${v}%`}
                      sx={{
                        color: 'var(--color-accent)',
                        '& .MuiSlider-thumb': {
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: '0 0 0 8px rgba(0, 217, 255, 0.16)',
                          },
                        },
                        '& .MuiSlider-rail': {
                          background: 'var(--border-primary)',
                        },
                      }}
                    />
                  </Box>

                  {/* Taxa de Drop */}
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}
                      >
                        Taxa de Drop
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'var(--color-accent)', fontWeight: 700 }}
                      >
                        {values.taxaDrop}%
                      </Typography>
                    </Box>
                    <Slider
                      value={values.taxaDrop}
                      onChange={(_, value) => setFieldValue('taxaDrop', value)}
                      min={0}
                      max={100}
                      step={1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={v => `${v}%`}
                      sx={{
                        color: 'var(--color-accent)',
                        '& .MuiSlider-thumb': {
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: '0 0 0 8px rgba(0, 217, 255, 0.16)',
                          },
                        },
                        '& .MuiSlider-rail': {
                          background: 'var(--border-primary)',
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Paper>

              {/* Seção: Descrição e Propriedades */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 2,
                }}
              >
                <SectionTitle>Descrição e Propriedades</SectionTitle>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    mt: 1.5,
                  }}
                >
                  <FastField name="descricao">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Descrição"
                        fullWidth
                        multiline
                        rows={4}
                        sx={slotInputSx}
                      />
                    )}
                  </FastField>

                  <FastField name="propriedades">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Propriedades do Material"
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Descreva as propriedades especiais do material..."
                        sx={slotInputSx}
                      />
                    )}
                  </FastField>
                </Box>
              </Paper>

              <FormActions
                onCancelar={() => navigate(ROUTE_PATHS.MATERIAIS)}
                isSubmitting={isSubmitting}
                labelSalvar={
                  isEditing ? 'Salvar Alterações' : 'Salvar Material'
                }
              />
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default NovoMaterial;
