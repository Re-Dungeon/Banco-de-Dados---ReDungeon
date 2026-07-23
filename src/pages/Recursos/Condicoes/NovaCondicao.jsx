import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import { Formik, Form, FastField, Field, FieldArray } from 'formik';
import { addCondicao, updateCondicao } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import useStableListKeys from 'hooks/useStableListKeys';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
import ImagePreviewPanel from 'components/ImagePreviewPanel/ImagePreviewPanel';
import FormActions from 'components/FormActions/FormActions';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import {
  CONDICAO_SCHEMA,
  CONDICAO_INITIAL_VALUES,
  getCondicaoUniversos,
} from './utils';
import { RARIDADES } from 'common/constants/constants';

const NovaCondicao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const condicaoParaEditar = location.state?.condicao ?? null;

  const { universos, loadingUniversos, isEditing } = useEntityFormGuard({
    itemParaEditar: condicaoParaEditar,
    universoDoItem: getCondicaoUniversos(condicaoParaEditar),
    routeOnDeny: ROUTE_PATHS.CONDICOES,
  });

  const editInitialValues = condicaoParaEditar
    ? {
        ...CONDICAO_INITIAL_VALUES,
        ...condicaoParaEditar,
        universos: getCondicaoUniversos(condicaoParaEditar),
        efeitos: condicaoParaEditar.efeitos || [],
        interacoes: condicaoParaEditar.interacoes || [],
      }
    : CONDICAO_INITIAL_VALUES;

  const efeitosKeys = useStableListKeys(editInitialValues.efeitos.length);
  const interacoesKeys = useStableListKeys(editInitialValues.interacoes.length);

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateCondicao(condicaoParaEditar.id, values);
    } else {
      await addCondicao(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.CONDICOES);
  };

  if (loadingUniversos) return null;

  return (
    <Box className="page-container">
      <FormPageHeader
        titulo={isEditing ? 'Editar Condição' : 'Nova Condição'}
        subtitulo={
          isEditing
            ? `Editando os dados de ${condicaoParaEditar.nome}`
            : 'Preencha os dados da nova condição'
        }
        onVoltar={() => navigate(ROUTE_PATHS.CONDICOES)}
      />

      <Formik
        initialValues={editInitialValues}
        validationSchema={CONDICAO_SCHEMA}
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
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                        gap: 2,
                      }}
                    >
                      <FastField
                        as={TextField}
                        name="nome"
                        label="Nome da Condição"
                        fullWidth
                        error={touched.nome && Boolean(errors.nome)}
                        helperText={touched.nome && errors.nome}
                      />
                      <FastField name="raridade">
                        {({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Raridade</InputLabel>
                            <Select {...field} label="Raridade">
                              {RARIDADES.map(raridade => (
                                <MenuItem key={raridade} value={raridade}>
                                  {raridade}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </FastField>
                      <Field name="universos">
                        {({ field, form }) => (
                          <FormControl fullWidth>
                            <InputLabel>Universos</InputLabel>
                            <Select
                              {...field}
                              multiple
                              label="Universos"
                              value={field.value || []}
                              onChange={e =>
                                form.setFieldValue('universos', e.target.value)
                              }
                              renderValue={selecionados =>
                                universos
                                  .filter(u => selecionados.includes(u.id))
                                  .map(u => u.Nome)
                                  .join(', ')
                              }
                            >
                              {universos.map(universo => (
                                <MenuItem key={universo.id} value={universo.id}>
                                  <Checkbox
                                    checked={field.value?.includes(universo.id)}
                                  />
                                  <ListItemText primary={universo.Nome} />
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
                      <FastField
                        as={TextField}
                        name="duracao"
                        label="Duração"
                        fullWidth
                        placeholder="ex: 3 turnos"
                      />
                      <FastField
                        as={TextField}
                        name="aplicacao"
                        label="Aplicação"
                        fullWidth
                        placeholder="ex: contato com veneno"
                      />
                    </Box>

                    <FastField
                      as={TextField}
                      name="linkImagem"
                      label="Link da Imagem da Condição"
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
                    alt="Preview da condição"
                  />
                </Box>
              </Paper>

              {/* Seção: Efeitos */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 2,
                }}
              >
                <SectionTitle>Efeitos</SectionTitle>
                <FieldArray name="efeitos">
                  {({ push, remove }) => (
                    <Box sx={{ mt: 1.5 }}>
                      {values.efeitos.map((_, idx) => (
                        <Box
                          key={efeitosKeys.keys[idx] ?? idx}
                          sx={{
                            display: 'flex',
                            gap: 1,
                            mb: 1.5,
                            alignItems: 'center',
                          }}
                        >
                          <FastField
                            as={TextField}
                            name={`efeitos[${idx}]`}
                            label={`Efeito ${idx + 1}`}
                            fullWidth
                            size="small"
                          />
                          <IconButton
                            size="small"
                            onClick={() => {
                              efeitosKeys.removeKey(idx);
                              remove(idx);
                            }}
                            sx={{
                              color: 'var(--text-muted)',
                              '&:hover': { color: '#ef4444' },
                            }}
                            aria-label="Remover efeito"
                          >
                            ✕
                          </IconButton>
                        </Box>
                      ))}
                      <Button
                        variant="outlined"
                        onClick={() => {
                          efeitosKeys.addKey();
                          push('');
                        }}
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
                        + Adicionar Efeito
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              </Paper>

              {/* Seção: Interações */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 2,
                }}
              >
                <SectionTitle>Interações</SectionTitle>
                <FieldArray name="interacoes">
                  {({ push, remove }) => (
                    <Box sx={{ mt: 1.5 }}>
                      {values.interacoes.map((_, idx) => (
                        <Box
                          key={interacoesKeys.keys[idx] ?? idx}
                          sx={{
                            display: 'flex',
                            gap: 1,
                            mb: 1.5,
                            alignItems: 'center',
                          }}
                        >
                          <FastField
                            as={TextField}
                            name={`interacoes[${idx}]`}
                            label={`Interação ${idx + 1}`}
                            fullWidth
                            size="small"
                          />
                          <IconButton
                            size="small"
                            onClick={() => {
                              interacoesKeys.removeKey(idx);
                              remove(idx);
                            }}
                            sx={{
                              color: 'var(--text-muted)',
                              '&:hover': { color: '#ef4444' },
                            }}
                            aria-label="Remover interação"
                          >
                            ✕
                          </IconButton>
                        </Box>
                      ))}
                      <Button
                        variant="outlined"
                        onClick={() => {
                          interacoesKeys.addKey();
                          push('');
                        }}
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
                        + Adicionar Interação
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              </Paper>

              <FormActions
                onCancelar={() => navigate(ROUTE_PATHS.CONDICOES)}
                isSubmitting={isSubmitting}
                labelSalvar={
                  isEditing ? 'Salvar Alterações' : 'Salvar Condição'
                }
              />
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default NovaCondicao;
