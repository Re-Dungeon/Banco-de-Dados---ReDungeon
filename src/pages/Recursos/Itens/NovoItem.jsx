import React, { useState, useEffect } from 'react';
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
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import { Formik, Form, FastField, Field, FieldArray } from 'formik';
import { addIten, updateIten, getUniversos } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import {
  ITEM_SCHEMA,
  ITEM_INITIAL_VALUES,
  HABILIDADE_ESPECIAL_INICIAL,
  TIPOS_ITEM,
} from './utils';
import { RARIDADES } from 'common/constants/constants';

const SectionTitle = ({ children }) => (
  <Typography
    variant="subtitle2"
    sx={{
      color: 'var(--color-accent)',
      fontWeight: 700,
      mt: 1,
      mb: 0.5,
      textTransform: 'uppercase',
      letterSpacing: 1,
      fontSize: '0.72rem',
    }}
  >
    {children}
  </Typography>
);

const NovoItem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canCreate, canWrite, isAdmin, allowedUniversos, loadingPermissions } =
    useAuth();
  const itemParaEditar = location.state?.item ?? null;
  const isEditing = Boolean(itemParaEditar);
  const [imgError, setImgError] = useState(false);
  const [universos, setUniversos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUniversos()
      .then(res => setUniversos(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loadingPermissions) return;
    const allowed = isEditing
      ? canWrite(itemParaEditar?.universo)
      : canCreate();
    if (!allowed) navigate(ROUTE_PATHS.ITENS);
  }, [
    loadingPermissions,
    isEditing,
    canWrite,
    canCreate,
    itemParaEditar,
    navigate,
  ]);

  const editInitialValues = itemParaEditar
    ? {
        ...ITEM_INITIAL_VALUES,
        ...itemParaEditar,
        habilidadesEspeciais: itemParaEditar.habilidadesEspeciais || [],
      }
    : ITEM_INITIAL_VALUES;

  const filteredUniversos = isAdmin
    ? universos
    : universos.filter(u => allowedUniversos.includes(u.id));

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateIten(itemParaEditar.id, values);
    } else {
      await addIten(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.ITENS);
  };

  return (
    <Box className="page-container">
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        <Button
          onClick={() => navigate(ROUTE_PATHS.ITENS)}
          sx={{
            color: 'var(--text-muted)',
            minWidth: 'auto',
            px: 1,
            '&:hover': { color: 'var(--text-primary)' },
          }}
        >
          ← Voltar
        </Button>
        <Box>
          <Typography
            variant="h5"
            sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}
          >
            {isEditing ? 'Editar Item' : 'Novo Item'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            {isEditing
              ? `Editando os dados de ${itemParaEditar.nome}`
              : 'Preencha os dados do novo item'}
          </Typography>
        </Box>
      </Box>

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
                              {filteredUniversos.map(universo => (
                                <MenuItem key={universo.id} value={universo.id}>
                                  {universo.Nome}
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
                          label="Link da Imagem do Item"
                          fullWidth
                          placeholder="https://..."
                          onChange={e => {
                            setImgError(false);
                            field.onChange(e);
                          }}
                        />
                      )}
                    </FastField>
                    <FastField
                      as={TextField}
                      name="descricao"
                      label="Descrição"
                      fullWidth
                      multiline
                      rows={4}
                    />
                  </Box>

                  {/* Preview da imagem */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      Preview
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        aspectRatio: '1 / 1',
                        borderRadius: 2,
                        border: '1px solid var(--border-primary)',
                        background: 'var(--bg-secondary)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {values.linkImagem && !imgError ? (
                        <img
                          src={values.linkImagem}
                          alt="Preview do item"
                          onError={() => setImgError(true)}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'var(--text-muted)',
                            textAlign: 'center',
                            px: 2,
                          }}
                        >
                          {imgError
                            ? 'Imagem não encontrada'
                            : 'Insira um link para ver o preview'}
                        </Typography>
                      )}
                    </Box>
                  </Box>
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
                          key={idx}
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
                              onClick={() => remove(idx)}
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
                        onClick={() => push({ ...HABILIDADE_ESPECIAL_INICIAL })}
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

              {/* Ações */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                  pb: 2,
                }}
              >
                <Button
                  onClick={() => navigate(ROUTE_PATHS.ITENS)}
                  sx={{ color: 'var(--text-muted)' }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    background: 'var(--color-primary)',
                    '&:hover': { background: '#5a2090' },
                  }}
                >
                  {isEditing ? 'Salvar Alterações' : 'Salvar Item'}
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default NovoItem;
