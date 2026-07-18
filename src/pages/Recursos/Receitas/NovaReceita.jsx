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
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import { Formik, Form, FastField, Field } from 'formik';
import {
  addReceita,
  updateReceita,
  getUniversos,
  getMateriais,
} from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { RECEITA_SCHEMA, RECEITA_INITIAL_VALUES } from './utils';
import { RARIDADES, CATEGORIAS_RECEITA } from 'common/constants/constants';

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

const NovaReceita = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canCreate, canWrite, isAdmin, allowedUniversos, loadingPermissions } =
    useAuth();
  const receitaParaEditar = location.state?.receita ?? null;
  const isEditing = Boolean(receitaParaEditar);
  const [imgError, setImgError] = useState(false);
  const [universos, setUniversos] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUniversos(), getMateriais()])
      .then(([universosData, materiaisData]) => {
        setUniversos(universosData);
        setMateriais(materiaisData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loadingPermissions) return;
    const allowed = isEditing
      ? canWrite(receitaParaEditar?.universo)
      : canCreate();
    if (!allowed) navigate(ROUTE_PATHS.RECEITAS);
  }, [
    loadingPermissions,
    isEditing,
    canWrite,
    canCreate,
    receitaParaEditar,
    navigate,
  ]);

  const editInitialValues = receitaParaEditar
    ? {
        ...RECEITA_INITIAL_VALUES,
        ...receitaParaEditar,
        materiais: receitaParaEditar.materiais || [],
      }
    : RECEITA_INITIAL_VALUES;

  const filteredUniversos = isAdmin
    ? universos
    : universos.filter(u => allowedUniversos.includes(u.id));

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

  if (loading) return null;

  return (
    <Box className="page-container">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          onClick={() => navigate(ROUTE_PATHS.RECEITAS)}
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
            {isEditing ? 'Editar Receita' : 'Nova Receita'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            {isEditing
              ? `Editando os dados de ${receitaParaEditar.nome}`
              : 'Preencha os dados da nova receita'}
          </Typography>
        </Box>
      </Box>

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
                                {filteredUniversos.map(universo => (
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
                            onChange={e => {
                              setImgError(false);
                              field.onChange(e);
                            }}
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
                            alt="Preview da receita"
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
                    onClick={() => navigate(ROUTE_PATHS.RECEITAS)}
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
                    {isEditing ? 'Salvar Alterações' : 'Salvar Receita'}
                  </Button>
                </Box>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default NovaReceita;
