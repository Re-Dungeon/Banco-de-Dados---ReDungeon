import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import { Formik, Form, FastField, Field } from 'formik';
import { addRegra, updateRegra } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
import ImagePreviewPanel from 'components/ImagePreviewPanel/ImagePreviewPanel';
import FormActions from 'components/FormActions/FormActions';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import { REGRA_SCHEMA, REGRA_INITIAL_VALUES } from './utils';
import {
  CATEGORIAS_REGRA,
  COMPLEXIDADES_REGRA,
} from 'common/constants/constants';

const NovaRegra = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const regraParaEditar = location.state?.regra ?? null;

  const { universos, loadingUniversos, isEditing } = useEntityFormGuard({
    itemParaEditar: regraParaEditar,
    universoDoItem: regraParaEditar?.universo,
    routeOnDeny: ROUTE_PATHS.REGRAS,
  });

  const editInitialValues = regraParaEditar
    ? {
        ...REGRA_INITIAL_VALUES,
        ...regraParaEditar,
      }
    : REGRA_INITIAL_VALUES;

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateRegra(regraParaEditar.id, values);
    } else {
      await addRegra(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.REGRAS);
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

  if (loadingUniversos) return null;

  return (
    <Box className="page-container">
      <FormPageHeader
        titulo={isEditing ? 'Editar Regra' : 'Nova Regra'}
        subtitulo={
          isEditing
            ? `Editando os dados de ${regraParaEditar.nome}`
            : 'Preencha os dados da nova regra'
        }
        onVoltar={() => navigate(ROUTE_PATHS.REGRAS)}
      />

      <Formik
        initialValues={editInitialValues}
        validationSchema={REGRA_SCHEMA}
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
                            label="Nome da Regra"
                            fullWidth
                            error={touched.nome && Boolean(errors.nome)}
                            helperText={touched.nome && errors.nome}
                            sx={slotInputSx}
                          />
                        )}
                      </FastField>

                      <Field name="universo">
                        {({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel sx={labelSx}>Universo</InputLabel>
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

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                        gap: 2,
                      }}
                    >
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
                              {CATEGORIAS_REGRA.map(categoria => (
                                <MenuItem key={categoria} value={categoria}>
                                  {categoria}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </Field>

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

                      <Field name="complexidade">
                        {({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel sx={labelSx}>Complexidade</InputLabel>
                            <Select
                              {...field}
                              label="Complexidade"
                              sx={selectSx}
                              MenuProps={menuPropsSx}
                            >
                              <MenuItem value="">Nenhuma</MenuItem>
                              {COMPLEXIDADES_REGRA.map(complexidade => (
                                <MenuItem
                                  key={complexidade}
                                  value={complexidade}
                                >
                                  {complexidade}
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
                          label="Link da Imagem da Regra"
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
                  </Box>

                  <ImagePreviewPanel
                    src={values.linkImagem}
                    alt="Preview da regra"
                  />
                </Box>
              </Paper>

              {/* Seção: Descrições */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 2,
                }}
              >
                <SectionTitle>Descrições</SectionTitle>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    mt: 1.5,
                  }}
                >
                  <FastField name="descricaoCurta">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Descrição Curta"
                        fullWidth
                        sx={slotInputSx}
                      />
                    )}
                  </FastField>

                  <FastField name="explicacaoCompleta">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Explicação Completa"
                        fullWidth
                        multiline
                        rows={4}
                        sx={slotInputSx}
                      />
                    )}
                  </FastField>
                </Box>
              </Paper>

              {/* Seção: Funcionamento */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 2,
                }}
              >
                <SectionTitle>Funcionamento</SectionTitle>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2,
                    mt: 1.5,
                  }}
                >
                  <FastField name="comoFunciona">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Como Funciona"
                        fullWidth
                        sx={slotInputSx}
                      />
                    )}
                  </FastField>

                  <FastField name="dadosUtilizados">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Quais Dados São Utilizados"
                        fullWidth
                        sx={slotInputSx}
                      />
                    )}
                  </FastField>

                  <FastField name="sucesso">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Sucesso"
                        fullWidth
                        sx={slotInputSx}
                      />
                    )}
                  </FastField>

                  <FastField name="falha">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Falha"
                        fullWidth
                        sx={slotInputSx}
                      />
                    )}
                  </FastField>
                </Box>
              </Paper>

              {/* Seção: Restrições */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 2,
                }}
              >
                <SectionTitle>Restrições</SectionTitle>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                    gap: 2,
                    mt: 1.5,
                  }}
                >
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

                  <FastField name="limite">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Limite"
                        fullWidth
                        sx={slotInputSx}
                      />
                    )}
                  </FastField>

                  <FastField name="requisitos">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Requisitos"
                        fullWidth
                        sx={slotInputSx}
                      />
                    )}
                  </FastField>
                </Box>
              </Paper>

              {/* Seção: Exemplo */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 2,
                }}
              >
                <SectionTitle>Exemplo</SectionTitle>
                <Box sx={{ mt: 1.5 }}>
                  <FastField name="exemplo">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Exemplo"
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Descreva um exemplo prático de uso desta regra..."
                        sx={slotInputSx}
                      />
                    )}
                  </FastField>
                </Box>
              </Paper>

              <FormActions
                onCancelar={() => navigate(ROUTE_PATHS.REGRAS)}
                isSubmitting={isSubmitting}
                labelSalvar={isEditing ? 'Salvar Alterações' : 'Salvar Regra'}
              />
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default NovaRegra;
