import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import { Formik, Form, FastField, Field } from 'formik';
import { addOrigem, updateOrigem, getUniversos } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import {
  ORIGEM_SCHEMA,
  ORIGEM_INITIAL_VALUES,
  CAMPOS_POR_TIPO,
  TODOS_CAMPOS_DEPENDENTES,
} from './utils';
import {
  RARIDADES,
  TIPOS_ORIGEM,
  NIVEIS_PERIGO,
} from 'common/constants/constants';

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

SectionTitle.propTypes = {
  children: PropTypes.node.isRequired,
};

const NovaOrigem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canCreate, canWrite, isAdmin, allowedUniversos, loadingPermissions } =
    useAuth();
  const origemParaEditar = location.state?.origem ?? null;
  const isEditing = Boolean(origemParaEditar);
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
      ? canWrite(origemParaEditar?.universo)
      : canCreate();
    if (!allowed) navigate(ROUTE_PATHS.ORIGENS);
  }, [
    loadingPermissions,
    isEditing,
    canWrite,
    canCreate,
    origemParaEditar,
    navigate,
  ]);

  const editInitialValues = origemParaEditar
    ? {
        ...ORIGEM_INITIAL_VALUES,
        ...origemParaEditar,
      }
    : ORIGEM_INITIAL_VALUES;

  const filteredUniversos = isAdmin
    ? universos
    : universos.filter(u => allowedUniversos.includes(u.id));

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

  if (loading) return null;

  return (
    <Box className="page-container">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          onClick={() => navigate(ROUTE_PATHS.ORIGENS)}
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
            {isEditing ? 'Editar Origem' : 'Nova Origem'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            {isEditing
              ? `Editando os dados de ${origemParaEditar.nome}`
              : 'Preencha os dados da nova origem'}
          </Typography>
        </Box>
      </Box>

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
                          onChange={e => {
                            setImgError(false);
                            field.onChange(e);
                          }}
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

                  {/* Preview da imagem */}
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
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
                          alt="Preview da origem"
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
                  onClick={() => navigate(ROUTE_PATHS.ORIGENS)}
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
                  {isEditing ? 'Salvar Alterações' : 'Salvar Origem'}
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default NovaOrigem;
