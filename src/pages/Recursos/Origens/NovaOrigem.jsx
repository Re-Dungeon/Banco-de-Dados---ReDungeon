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
import { Formik, Form, FastField, Field, FieldArray } from 'formik';
import { addOrigem, updateOrigem } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import useStableListKeys from 'hooks/useStableListKeys';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
import ImagePreviewPanel from 'components/ImagePreviewPanel/ImagePreviewPanel';
import FormActions from 'components/FormActions/FormActions';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import {
  ORIGEM_SCHEMA,
  ORIGEM_INITIAL_VALUES,
  CAMPOS_POR_TIPO,
  TODOS_CAMPOS_DEPENDENTES,
  REPUTACAO_ITEM_INICIAL,
} from './utils';
import {
  RARIDADES,
  TIPOS_ORIGEM,
  NIVEIS_PERIGO,
} from 'common/constants/constants';

const NovaOrigem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const origemParaEditar = location.state?.origem ?? null;

  const { universos, loadingUniversos, isEditing } = useEntityFormGuard({
    itemParaEditar: origemParaEditar,
    universoDoItem: origemParaEditar?.universo,
    routeOnDeny: ROUTE_PATHS.ORIGENS,
  });

  const editInitialValues = origemParaEditar
    ? {
        ...ORIGEM_INITIAL_VALUES,
        ...origemParaEditar,
        reputacao: {
          fama: origemParaEditar.reputacao?.fama || [],
          terror: origemParaEditar.reputacao?.terror || [],
        },
      }
    : ORIGEM_INITIAL_VALUES;

  const famaKeys = useStableListKeys(editInitialValues.reputacao.fama.length);
  const terrorKeys = useStableListKeys(
    editInitialValues.reputacao.terror.length,
  );

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateOrigem(origemParaEditar.id, values);
    } else {
      await addOrigem(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.ORIGENS);
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
        titulo={isEditing ? 'Editar Origem' : 'Nova Origem'}
        subtitulo={
          isEditing
            ? `Editando os dados de ${origemParaEditar.nome}`
            : 'Preencha os dados da nova origem'
        }
        onVoltar={() => navigate(ROUTE_PATHS.ORIGENS)}
      />

      <Formik
        initialValues={editInitialValues}
        validationSchema={ORIGEM_SCHEMA}
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
                            label="Nome da Origem"
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
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2,
                      }}
                    >
                      <Field name="tipo">
                        {({ field, form }) => (
                          <FormControl fullWidth>
                            <InputLabel sx={labelSx}>Tipo</InputLabel>
                            <Select
                              {...field}
                              label="Tipo"
                              sx={selectSx}
                              MenuProps={menuPropsSx}
                              onChange={e => {
                                field.onChange(e);
                                TODOS_CAMPOS_DEPENDENTES.forEach(key =>
                                  form.setFieldValue(key, ''),
                                );
                              }}
                            >
                              <MenuItem value="">Nenhum</MenuItem>
                              {TIPOS_ORIGEM.map(tipo => (
                                <MenuItem key={tipo} value={tipo}>
                                  {tipo}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </Field>

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
                    </Box>

                    <FastField name="tags">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Tags"
                          fullWidth
                          placeholder="aventura, mistério, fogo"
                          helperText="Separe as tags por vírgula"
                          sx={slotInputSx}
                        />
                      )}
                    </FastField>

                    <FastField name="linkImagem">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Link da Imagem da Origem"
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
                  </Box>

                  <ImagePreviewPanel
                    src={values.linkImagem}
                    alt="Preview da origem"
                  />
                </Box>
              </Paper>

              {/* Seção: Campos dependentes do Tipo */}
              {values.tipo && CAMPOS_POR_TIPO[values.tipo] && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 2,
                  }}
                >
                  <SectionTitle>Detalhes de {values.tipo}</SectionTitle>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                      },
                      gap: 2,
                      mt: 1.5,
                    }}
                  >
                    {CAMPOS_POR_TIPO[values.tipo].map(campo =>
                      campo.key === 'climaPerigo' ? (
                        <Field key={campo.key} name={campo.key}>
                          {({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel sx={labelSx}>
                                {campo.label}
                              </InputLabel>
                              <Select
                                {...field}
                                label={campo.label}
                                sx={selectSx}
                                MenuProps={menuPropsSx}
                              >
                                <MenuItem value="">Nenhum</MenuItem>
                                {NIVEIS_PERIGO.map(nivel => (
                                  <MenuItem key={nivel} value={nivel}>
                                    {nivel}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </Field>
                      ) : (
                        <FastField key={campo.key} name={campo.key}>
                          {({ field }) => (
                            <TextField
                              {...field}
                              label={campo.label}
                              fullWidth
                              sx={slotInputSx}
                            />
                          )}
                        </FastField>
                      ),
                    )}
                  </Box>
                </Paper>
              )}

              {/* Seção: Reputação */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 2,
                }}
              >
                <SectionTitle>Reputação</SectionTitle>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 3,
                    mt: 1.5,
                  }}
                >
                  <FieldArray name="reputacao.fama">
                    {({ push, remove }) => (
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'var(--text-secondary)',
                              fontWeight: 600,
                            }}
                          >
                            Fama
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => {
                              famaKeys.addKey();
                              push({ ...REPUTACAO_ITEM_INICIAL });
                            }}
                            sx={{
                              color: 'var(--color-accent)',
                              minWidth: 'auto',
                              fontSize: '0.7rem',
                              py: 0,
                            }}
                          >
                            + Adicionar
                          </Button>
                        </Box>
                        {values.reputacao.fama.map((_, idx) => (
                          <Box
                            key={famaKeys.keys[idx] ?? idx}
                            sx={{
                              display: 'flex',
                              gap: 1,
                              alignItems: 'flex-start',
                              mb: 1.5,
                              border: '1px solid var(--border-primary)',
                              borderRadius: 2,
                              p: 1.5,
                              background: 'var(--bg-secondary)',
                            }}
                          >
                            <FastField
                              as={TextField}
                              name={`reputacao.fama[${idx}].quantidade`}
                              label="Quantidade"
                              type="number"
                              size="small"
                              sx={{ width: 110, ...slotInputSx }}
                            />
                            <FastField
                              as={TextField}
                              name={`reputacao.fama[${idx}].efeito`}
                              label="Efeito"
                              fullWidth
                              multiline
                              size="small"
                              sx={slotInputSx}
                            />
                            <IconButton
                              size="small"
                              onClick={() => {
                                famaKeys.removeKey(idx);
                                remove(idx);
                              }}
                              sx={{
                                color: 'var(--text-muted)',
                                '&:hover': { color: '#ef4444' },
                              }}
                              aria-label="Remover reputação de fama"
                            >
                              ✕
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </FieldArray>

                  <FieldArray name="reputacao.terror">
                    {({ push, remove }) => (
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'var(--text-secondary)',
                              fontWeight: 600,
                            }}
                          >
                            Terror
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => {
                              terrorKeys.addKey();
                              push({ ...REPUTACAO_ITEM_INICIAL });
                            }}
                            sx={{
                              color: 'var(--color-accent)',
                              minWidth: 'auto',
                              fontSize: '0.7rem',
                              py: 0,
                            }}
                          >
                            + Adicionar
                          </Button>
                        </Box>
                        {values.reputacao.terror.map((_, idx) => (
                          <Box
                            key={terrorKeys.keys[idx] ?? idx}
                            sx={{
                              display: 'flex',
                              gap: 1,
                              alignItems: 'flex-start',
                              mb: 1.5,
                              border: '1px solid var(--border-primary)',
                              borderRadius: 2,
                              p: 1.5,
                              background: 'var(--bg-secondary)',
                            }}
                          >
                            <FastField
                              as={TextField}
                              name={`reputacao.terror[${idx}].quantidade`}
                              label="Quantidade"
                              type="number"
                              size="small"
                              sx={{ width: 110, ...slotInputSx }}
                            />
                            <FastField
                              as={TextField}
                              name={`reputacao.terror[${idx}].efeito`}
                              label="Efeito"
                              fullWidth
                              multiline
                              size="small"
                              sx={slotInputSx}
                            />
                            <IconButton
                              size="small"
                              onClick={() => {
                                terrorKeys.removeKey(idx);
                                remove(idx);
                              }}
                              sx={{
                                color: 'var(--text-muted)',
                                '&:hover': { color: '#ef4444' },
                              }}
                              aria-label="Remover reputação de terror"
                            >
                              ✕
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </FieldArray>
                </Box>
              </Paper>

              <FormActions
                onCancelar={() => navigate(ROUTE_PATHS.ORIGENS)}
                isSubmitting={isSubmitting}
                labelSalvar={isEditing ? 'Salvar Alterações' : 'Salvar Origem'}
              />
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default NovaOrigem;
