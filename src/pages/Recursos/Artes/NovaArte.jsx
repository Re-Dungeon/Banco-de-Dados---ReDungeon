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
import { addArte, updateArte, getCondicoes } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
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
                          gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(4, 1fr)',
                          },
                          gap: 2,
                        }}
                      >
                        <Field name="tipo">
                          {({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel sx={labelSx}>Tipo</InputLabel>
                              <Select
                                {...field}
                                label="Tipo"
                                sx={selectSx}
                                MenuProps={menuPropsSx}
                              >
                                <MenuItem value="">Nenhum</MenuItem>
                                {TIPOS_ARTE.map(tipo => (
                                  <MenuItem key={tipo} value={tipo}>
                                    {tipo}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </Field>

                        <Field name="acao">
                          {({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel sx={labelSx}>Ação</InputLabel>
                              <Select
                                {...field}
                                label="Ação"
                                sx={selectSx}
                                MenuProps={menuPropsSx}
                              >
                                <MenuItem value="">Nenhuma</MenuItem>
                                {ACAO_ARTE.map(acao => (
                                  <MenuItem key={acao} value={acao}>
                                    {acao}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </Field>

                        <Field name="classificacao">
                          {({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel sx={labelSx}>
                                Classificação
                              </InputLabel>
                              <Select
                                {...field}
                                label="Classificação"
                                sx={selectSx}
                                MenuProps={menuPropsSx}
                              >
                                <MenuItem value="">Nenhuma</MenuItem>
                                {CLASSIFICACOES_ARTE.map(classificacao => (
                                  <MenuItem
                                    key={classificacao}
                                    value={classificacao}
                                  >
                                    {classificacao}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </Field>

                        <Field name="circuloMagico">
                          {({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel sx={labelSx}>
                                Círculo Mágico
                              </InputLabel>
                              <Select
                                {...field}
                                label="Círculo Mágico"
                                sx={selectSx}
                                MenuProps={menuPropsSx}
                              >
                                {CIRCULOS_MAGICOS.map(circulo => (
                                  <MenuItem key={circulo} value={circulo}>
                                    {circulo}
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
                            label="Condições Aplicadas"
                            placeholder="Buscar condição..."
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
