import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import { Formik, Form, FastField, Field } from 'formik';
import { addArte, updateArte, getCondicoes } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
import FormSelect from 'components/FormSelect/FormSelect';
import ImagePreviewPanel from 'components/ImagePreviewPanel/ImagePreviewPanel';
import FormActions from 'components/FormActions/FormActions';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import { ARTE_SCHEMA, ARTE_INITIAL_VALUES } from './utils';
import {
  TIPOS_ARTE,
  ACAO_ARTE,
  CLASSIFICACOES_ARTE,
  CIRCULOS_MAGICOS,
} from 'common/constants/constants';

const NovaArte = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const arteParaEditar = location.state?.arte ?? null;
  const [condicoes, setCondicoes] = useState([]);
  const [loadingCondicoes, setLoadingCondicoes] = useState(true);

  const { universos, loadingUniversos, isEditing } = useEntityFormGuard({
    itemParaEditar: arteParaEditar,
    universoDoItem: arteParaEditar?.universo,
    routeOnDeny: ROUTE_PATHS.ARTES,
  });

  useEffect(() => {
    getCondicoes()
      .then(res => setCondicoes(res))
      .catch(() => {})
      .finally(() => setLoadingCondicoes(false));
  }, []);

  const editInitialValues = arteParaEditar
    ? {
        ...ARTE_INITIAL_VALUES,
        ...arteParaEditar,
        condicoesAplicadas: arteParaEditar.condicoesAplicadas || [],
      }
    : ARTE_INITIAL_VALUES;

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateArte(arteParaEditar.id, values);
    } else {
      await addArte(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.ARTES);
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

  if (loadingUniversos || loadingCondicoes) return null;

  return (
    <Box className="page-container">
      <FormPageHeader
        titulo={isEditing ? 'Editar Arte' : 'Nova Arte'}
        subtitulo={
          isEditing
            ? `Editando os dados de ${arteParaEditar.nome}`
            : 'Preencha os dados da nova arte'
        }
        onVoltar={() => navigate(ROUTE_PATHS.ARTES)}
      />

      <Formik
        initialValues={editInitialValues}
        validationSchema={ARTE_SCHEMA}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isSubmitting, setFieldValue }) => {
          const condicoesDoUniverso = condicoes.filter(
            c => c.universo === values.universo,
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
                              label="Nome da Arte"
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
                              onValueChange={novoUniverso => {
                                const permitidas = condicoes.filter(
                                  c => c.universo === novoUniverso,
                                );
                                form.setFieldValue(
                                  'condicoesAplicadas',
                                  form.values.condicoesAplicadas.filter(sel =>
                                    permitidas.some(c => c.id === sel.id),
                                  ),
                                );
                              }}
                            />
                          )}
                        </Field>
                      </Box>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(4, 1fr)',
                          },
                          gap: 2,
                        }}
                      >
                        <Field name="tipo">
                          {({ field, form }) => (
                            <FormSelect
                              field={field}
                              form={form}
                              label="Tipo"
                              options={TIPOS_ARTE}
                            />
                          )}
                        </Field>

                        <Field name="acao">
                          {({ field, form }) => (
                            <FormSelect
                              field={field}
                              form={form}
                              label="Ação"
                              options={ACAO_ARTE}
                            />
                          )}
                        </Field>

                        <Field name="classificacao">
                          {({ field, form }) => (
                            <FormSelect
                              field={field}
                              form={form}
                              label="Classificação"
                              options={CLASSIFICACOES_ARTE}
                            />
                          )}
                        </Field>

                        <Field name="circuloMagico">
                          {({ field, form }) => (
                            <FormSelect
                              field={field}
                              form={form}
                              label="Círculo Mágico"
                              options={CIRCULOS_MAGICOS}
                              disableClearable
                            />
                          )}
                        </Field>
                      </Box>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(auto-fill, minmax(140px, 1fr))',
                          gap: 2,
                        }}
                      >
                        <FastField name="recarga">
                          {({ field }) => (
                            <TextField
                              {...field}
                              label="Recarga"
                              fullWidth
                              sx={slotInputSx}
                            />
                          )}
                        </FastField>

                        <FastField name="duracao">
                          {({ field }) => (
                            <TextField
                              {...field}
                              label="Duração"
                              fullWidth
                              sx={slotInputSx}
                            />
                          )}
                        </FastField>

                        <FastField name="alcance">
                          {({ field }) => (
                            <TextField
                              {...field}
                              label="Alcance"
                              fullWidth
                              sx={slotInputSx}
                            />
                          )}
                        </FastField>

                        <FastField name="alvos">
                          {({ field }) => (
                            <TextField
                              {...field}
                              label="Alvos"
                              fullWidth
                              sx={slotInputSx}
                            />
                          )}
                        </FastField>

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

                        <FastField name="dados">
                          {({ field }) => (
                            <TextField
                              {...field}
                              label="Dados"
                              fullWidth
                              sx={slotInputSx}
                            />
                          )}
                        </FastField>
                      </Box>

                      <FastField name="linkImagem">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Link da Imagem da Arte"
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
                            multiline
                            rows={4}
                            sx={slotInputSx}
                          />
                        )}
                      </FastField>

                      <FastField name="cantico">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Cântico"
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Palavras ou versos usados para invocar a arte..."
                            sx={slotInputSx}
                          />
                        )}
                      </FastField>

                      <Autocomplete
                        multiple
                        options={condicoesDoUniverso}
                        value={values.condicoesAplicadas}
                        onChange={(_, novasCondicoes) =>
                          setFieldValue('condicoesAplicadas', novasCondicoes)
                        }
                        getOptionLabel={option => option.nome ?? ''}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        disabled={!values.universo}
                        noOptionsText={
                          values.universo
                            ? 'Nenhuma condição encontrada neste universo'
                            : 'Selecione um Universo primeiro'
                        }
                        renderValue={(value, getTagProps) =>
                          value.map((option, index) => (
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
                            label="Condições Aplicadas"
                            placeholder="Buscar condição..."
                            sx={slotInputSx}
                            fullWidth
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
                    </Box>

                    <ImagePreviewPanel
                      src={values.linkImagem}
                      alt="Preview da arte"
                    />
                  </Box>
                </Paper>

                <FormActions
                  onCancelar={() => navigate(ROUTE_PATHS.ARTES)}
                  isSubmitting={isSubmitting}
                  labelSalvar={isEditing ? 'Salvar Alterações' : 'Salvar Arte'}
                />
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default NovaArte;
