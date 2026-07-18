import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
import { addCondicao, updateCondicao, getUniversos } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { CONDICAO_SCHEMA, CONDICAO_INITIAL_VALUES } from './utils';
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

SectionTitle.propTypes = {
  children: PropTypes.node.isRequired,
};

const NovaCondicao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canCreate, canWrite, isAdmin, allowedUniversos, loadingPermissions } =
    useAuth();
  const condicaoParaEditar = location.state?.condicao ?? null;
  const isEditing = Boolean(condicaoParaEditar);
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
      ? canWrite(condicaoParaEditar?.universo)
      : canCreate();
    if (!allowed) navigate(ROUTE_PATHS.CONDICOES);
  }, [
    loadingPermissions,
    isEditing,
    canWrite,
    canCreate,
    condicaoParaEditar,
    navigate,
  ]);

  const editInitialValues = condicaoParaEditar
    ? {
        ...CONDICAO_INITIAL_VALUES,
        ...condicaoParaEditar,
        efeitos: condicaoParaEditar.efeitos || [],
        interacoes: condicaoParaEditar.interacoes || [],
      }
    : CONDICAO_INITIAL_VALUES;

  const filteredUniversos = isAdmin
    ? universos
    : universos.filter(u => allowedUniversos.includes(u.id));

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateCondicao(condicaoParaEditar.id, values);
    } else {
      await addCondicao(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.CONDICOES);
  };

  if (loading) return null;

  return (
    <Box className="page-container">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          onClick={() => navigate(ROUTE_PATHS.CONDICOES)}
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
            {isEditing ? 'Editar Condição' : 'Nova Condição'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            {isEditing
              ? `Editando os dados de ${condicaoParaEditar.nome}`
              : 'Preencha os dados da nova condição'}
          </Typography>
        </Box>
      </Box>

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

                    <FastField name="linkImagem">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Link da Imagem da Condição"
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
                          alt="Preview da condição"
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
                          key={idx}
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
                            onClick={() => remove(idx)}
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
                        onClick={() => push('')}
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
                          key={idx}
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
                            onClick={() => remove(idx)}
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
                        onClick={() => push('')}
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
                  onClick={() => navigate(ROUTE_PATHS.CONDICOES)}
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
                  {isEditing ? 'Salvar Alterações' : 'Salvar Condição'}
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default NovaCondicao;
