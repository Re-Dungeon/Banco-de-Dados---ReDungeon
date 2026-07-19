import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import { Formik, Form, FastField, Field } from 'formik';
import { addReceita, updateReceita, getMateriais } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
import ImagePreviewPanel from 'components/ImagePreviewPanel/ImagePreviewPanel';
import FormActions from 'components/FormActions/FormActions';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import { RECEITA_SCHEMA, RECEITA_INITIAL_VALUES } from './utils';
import { RARIDADES, CATEGORIAS_RECEITA } from 'common/constants/constants';

const NovaReceita = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const receitaParaEditar = location.state?.receita ?? null;
  const [materiais, setMateriais] = useState([]);
  const [loadingMateriais, setLoadingMateriais] = useState(true);

  const { universos, loadingUniversos, isEditing } = useEntityFormGuard({
    itemParaEditar: receitaParaEditar,
    universoDoItem: receitaParaEditar?.universo,
    routeOnDeny: ROUTE_PATHS.RECEITAS,
  });

  useEffect(() => {
    getMateriais()
      .then(res => setMateriais(res))
      .catch(() => {})
      .finally(() => setLoadingMateriais(false));
  }, []);

  const editInitialValues = receitaParaEditar
    ? {
        ...RECEITA_INITIAL_VALUES,
        ...receitaParaEditar,
        materiais: receitaParaEditar.materiais || [],
      }
    : RECEITA_INITIAL_VALUES;

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateReceita(receitaParaEditar.id, values);
    } else {
      await addReceita(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.RECEITAS);
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

  const labelSx = {
    color: 'var(--text-secondary)',
    '&.Mui-focused': { color: 'var(--color-accent)' },
  };

  if (loadingUniversos || loadingMateriais) return null;

  return (
    <Box className="page-container">
      <FormPageHeader
        titulo={isEditing ? 'Editar Receita' : 'Nova Receita'}
        subtitulo={
          isEditing
            ? `Editando os dados de ${receitaParaEditar.nome}`
            : 'Preencha os dados da nova receita'
        }
        onVoltar={() => navigate(ROUTE_PATHS.RECEITAS)}
      />

      <Formik
        initialValues={editInitialValues}
        validationSchema={RECEITA_SCHEMA}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isSubmitting, setFieldValue }) => {
          const materiaisDoUniverso = materiais.filter(
            m => m.universo === values.universo,
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
                        <FastField name="nome">
                          {({ field }) => (
                            <TextField
                              {...field}
                              label="Nome da Receita"
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
                                  const novoUniverso = e.target.value;
                                  const permitidos = materiais.filter(
                                    m => m.universo === novoUniverso,
                                  );
                                  form.setFieldValue(
                                    'materiais',
                                    form.values.materiais.filter(sel =>
                                      permitidos.some(m => m.id === sel.id),
                                    ),
                                  );
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

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                          gap: 2,
                        }}
                      >
                        <Field name="raridade">
                          {({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel sx={labelSx}>Raridade</InputLabel>
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

                        <Field name="categoria">
                          {({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel sx={labelSx}>Categoria</InputLabel>
                              <Select
                                {...field}
                                label="Categoria"
                                sx={selectSx}
                                MenuProps={menuPropsSx}
                              >
                                <MenuItem value="">Nenhuma</MenuItem>
                                {CATEGORIAS_RECEITA.map(categoria => (
                                  <MenuItem key={categoria} value={categoria}>
                                    {categoria}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </Field>
                      </Box>

                      <FastField name="linkImagem">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Link da Imagem da Receita"
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

                      <Autocomplete
                        multiple
                        options={materiaisDoUniverso}
                        value={values.materiais}
                        onChange={(_, novosMateriais) =>
                          setFieldValue('materiais', novosMateriais)
                        }
                        getOptionLabel={option => option.nome ?? ''}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        disabled={!values.universo}
                        noOptionsText={
                          values.universo
                            ? 'Nenhum material encontrado neste universo'
                            : 'Selecione um Universo primeiro'
                        }
                        renderTags={(tagValue, getTagProps) =>
                          tagValue.map((option, index) => (
                            <Chip
                              {...getTagProps({ index })}
                              key={option.id}
                              label={option.nome}
                              size="small"
                              sx={{
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-primary)',
                              }}
                            />
                          ))
                        }
                        renderInput={params => (
                          <TextField
                            {...params}
                            label="Materiais"
                            placeholder="Buscar material..."
                            sx={slotInputSx}
                          />
                        )}
                        slotProps={{
                          paper: {
                            sx: {
                              background: 'var(--bg-card)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-primary)',
                            },
                          },
                        }}
                      />

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                          gap: 2,
                        }}
                      >
                        <FastField name="valorCompra">
                          {({ field }) => (
                            <TextField
                              {...field}
                              label="Valor de Compra"
                              fullWidth
                              placeholder="ex: 50 ouros"
                              sx={slotInputSx}
                            />
                          )}
                        </FastField>

                        <FastField name="valorVenda">
                          {({ field }) => (
                            <TextField
                              {...field}
                              label="Valor de Venda"
                              fullWidth
                              placeholder="ex: 25 ouros"
                              sx={slotInputSx}
                            />
                          )}
                        </FastField>
                      </Box>

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
                    </Box>

                    <ImagePreviewPanel
                      src={values.linkImagem}
                      alt="Preview da receita"
                    />
                  </Box>
                </Paper>

                <FormActions
                  onCancelar={() => navigate(ROUTE_PATHS.RECEITAS)}
                  isSubmitting={isSubmitting}
                  labelSalvar={
                    isEditing ? 'Salvar Alterações' : 'Salvar Receita'
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

export default NovaReceita;
