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
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Formik, Form, FastField, Field, FieldArray } from 'formik';
import { addIten, updateIten } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import useStableListKeys from 'hooks/useStableListKeys';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
import ImagePreviewPanel from 'components/ImagePreviewPanel/ImagePreviewPanel';
import FormActions from 'components/FormActions/FormActions';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import {
  ITEM_SCHEMA,
  ITEM_INITIAL_VALUES,
  HABILIDADE_ESPECIAL_INICIAL,
  TIPOS_ITEM,
} from './utils';
import { RARIDADES } from 'common/constants/constants';

const NovoItem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const itemParaEditar = location.state?.item ?? null;

  const { universos, loadingUniversos, isEditing } = useEntityFormGuard({
    itemParaEditar,
    universoDoItem: itemParaEditar?.universo,
    routeOnDeny: ROUTE_PATHS.ITENS,
  });

  const editInitialValues = itemParaEditar
    ? {
        ...ITEM_INITIAL_VALUES,
        ...itemParaEditar,
        habilidadesEspeciais: itemParaEditar.habilidadesEspeciais || [],
      }
    : ITEM_INITIAL_VALUES;

  const habilidadesEspeciaisKeys = useStableListKeys(
    editInitialValues.habilidadesEspeciais.length,
  );

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateIten(itemParaEditar.id, values);
    } else {
      await addIten(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.ITENS);
  };

  if (loadingUniversos) return null;

  return (
    <Box className="page-container">
      <FormPageHeader
        titulo={isEditing ? 'Editar Item' : 'Novo Item'}
        subtitulo={
          isEditing
            ? `Editando os dados de ${itemParaEditar.nome}`
            : 'Preencha os dados do novo item'
        }
        onVoltar={() => navigate(ROUTE_PATHS.ITENS)}
      />

      <Formik
        initialValues={editInitialValues}
        validationSchema={ITEM_SCHEMA}
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
                        gridTemplateColumns: '1fr 1fr 1fr 1fr',
                        gap: 2,
                      }}
                    >
                      <FastField
                        as={TextField}
                        name="nome"
                        label="Nome do Item"
                        fullWidth
                        error={touched.nome && Boolean(errors.nome)}
                        helperText={touched.nome && errors.nome}
                      />
                      <FastField name="qualidade">
                        {({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Qualidade</InputLabel>
                            <Select {...field} label="Qualidade">
                              {RARIDADES.map(r => (
                                <MenuItem key={r} value={r}>
                                  {r}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </FastField>
                      <FastField name="tipo">
                        {({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Tipo</InputLabel>
                            <Select {...field} label="Tipo">
                              {TIPOS_ITEM.map(t => (
                                <MenuItem key={t} value={t}>
                                  {t}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </FastField>
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
                      label="Link da Imagem do Item"
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
                    <Field name="mostrarNaLoja">
                      {({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={Boolean(field.value)}
                              sx={{
                                color: 'var(--text-secondary)',
                                '&.Mui-checked': {
                                  color: 'var(--color-accent)',
                                },
                              }}
                            />
                          }
                          label="Mostrar na Loja"
                          sx={{ color: 'var(--text-secondary)' }}
                        />
                      )}
                    </Field>
                  </Box>

                  <ImagePreviewPanel
                    src={values.linkImagem}
                    alt="Preview do item"
                  />
                </Box>
              </Paper>

              {/* Seção: Atributos do Item */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 2,
                }}
              >
                <SectionTitle>Atributos do Item</SectionTitle>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 2,
                    mt: 1.5,
                  }}
                >
                  <FastField
                    as={TextField}
                    name="nivelAtual"
                    label="Nível Atual"
                    type="number"
                    fullWidth
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                  <FastField
                    as={TextField}
                    name="nivelMaximo"
                    label="Nível Máximo"
                    type="number"
                    fullWidth
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                  <FastField
                    as={TextField}
                    name="dados"
                    label="Dados"
                    fullWidth
                    size="small"
                    placeholder="ex: 2d6+3"
                  />
                  <FastField
                    as={TextField}
                    name="pesoUnitario"
                    label="Peso Unitário"
                    type="number"
                    fullWidth
                    size="small"
                    inputProps={{ min: 0, step: 'any' }}
                  />
                  <FastField
                    as={TextField}
                    name="bonusEspaco"
                    label="Bônus de Espaço"
                    type="number"
                    fullWidth
                    size="small"
                  />
                  <FastField
                    as={TextField}
                    name="precoCompra"
                    label="Preço de Compra"
                    type="number"
                    fullWidth
                    size="small"
                    inputProps={{ min: 0, step: 'any' }}
                  />
                  <FastField
                    as={TextField}
                    name="precoVenda"
                    label="Preço de Venda"
                    type="number"
                    fullWidth
                    size="small"
                    inputProps={{ min: 0, step: 'any' }}
                  />
                  <FastField
                    as={TextField}
                    name="extra"
                    label="Extra"
                    fullWidth
                    size="small"
                  />
                </Box>
              </Paper>

              {/* Seção: Habilidades Especiais */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 2,
                }}
              >
                <SectionTitle>Habilidades Especiais</SectionTitle>
                <FieldArray name="habilidadesEspeciais">
                  {({ push, remove }) => (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        mt: 1.5,
                      }}
                    >
                      {values.habilidadesEspeciais.map((hab, idx) => (
                        <Box
                          key={habilidadesEspeciaisKeys.keys[idx] ?? idx}
                          sx={{
                            border: '1px solid var(--border-primary)',
                            borderRadius: 2,
                            p: 2,
                            background: 'var(--bg-secondary)',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: 1.5,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'var(--text-secondary)',
                                fontWeight: 600,
                              }}
                            >
                              Habilidade #{idx + 1}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => {
                                habilidadesEspeciaisKeys.removeKey(idx);
                                remove(idx);
                              }}
                              sx={{
                                color: 'var(--text-muted)',
                                '&:hover': { color: '#ef4444' },
                              }}
                              aria-label="Remover habilidade especial"
                            >
                              ✕
                            </IconButton>
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                            }}
                          >
                            <FastField
                              as={TextField}
                              name={`habilidadesEspeciais[${idx}].nome`}
                              label="Nome da Habilidade"
                              fullWidth
                              size="small"
                            />
                            <FastField
                              as={TextField}
                              name={`habilidadesEspeciais[${idx}].descricao`}
                              label="Descrição da Habilidade"
                              fullWidth
                              multiline
                              rows={2}
                              size="small"
                            />
                          </Box>
                        </Box>
                      ))}
                      <Button
                        variant="outlined"
                        onClick={() => {
                          habilidadesEspeciaisKeys.addKey();
                          push({ ...HABILIDADE_ESPECIAL_INICIAL });
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
                        + Adicionar Habilidade Especial
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              </Paper>

              <FormActions
                onCancelar={() => navigate(ROUTE_PATHS.ITENS)}
                isSubmitting={isSubmitting}
                labelSalvar={isEditing ? 'Salvar Alterações' : 'Salvar Item'}
              />
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default NovoItem;
