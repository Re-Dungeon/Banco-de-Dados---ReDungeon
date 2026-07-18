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
  addArte,
  updateArte,
  getUniversos,
  getCondicoes,
} from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { ARTE_SCHEMA, ARTE_INITIAL_VALUES } from './utils';
import {
  TIPOS_ARTE,
  ACAO_ARTE,
  CLASSIFICACOES_ARTE,
  CIRCULOS_MAGICOS,
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

const NovaArte = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canCreate, canWrite, isAdmin, allowedUniversos, loadingPermissions } =
    useAuth();
  const arteParaEditar = location.state?.arte ?? null;
  const isEditing = Boolean(arteParaEditar);
  const [imgError, setImgError] = useState(false);
  const [universos, setUniversos] = useState([]);
  const [condicoes, setCondicoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUniversos(), getCondicoes()])
      .then(([universosData, condicoesData]) => {
        setUniversos(universosData);
        setCondicoes(condicoesData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loadingPermissions) return;
    const allowed = isEditing
      ? canWrite(arteParaEditar?.universo)
      : canCreate();
    if (!allowed) navigate(ROUTE_PATHS.ARTES);
  }, [
    loadingPermissions,
    isEditing,
    canWrite,
    canCreate,
    arteParaEditar,
    navigate,
  ]);

  const editInitialValues = arteParaEditar
    ? {
        ...ARTE_INITIAL_VALUES,
        ...arteParaEditar,
        condicoesAplicadas: arteParaEditar.condicoesAplicadas || [],
      }
    : ARTE_INITIAL_VALUES;

  const filteredUniversos = isAdmin
    ? universos
    : universos.filter(u => allowedUniversos.includes(u.id));

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

  if (loading) return null;

  return (
    <Box className="page-container">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          onClick={() => navigate(ROUTE_PATHS.ARTES)}
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
            {isEditing ? 'Editar Arte' : 'Nova Arte'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            {isEditing
              ? `Editando os dados de ${arteParaEditar.nome}`
              : 'Preencha os dados da nova arte'}
          </Typography>
        </Box>
      </Box>

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
                            alt="Preview da arte"
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
                    onClick={() => navigate(ROUTE_PATHS.ARTES)}
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
                    {isEditing ? 'Salvar Alterações' : 'Salvar Arte'}
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

export default NovaArte;
