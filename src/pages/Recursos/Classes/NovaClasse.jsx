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
import { addClasse, updateClasse, getUniversos } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import {
  CLASSE_SCHEMA,
  CLASSE_INITIAL_VALUES,
  HABILIDADE_INICIAL,
} from './utils';
import { RARIDADES, ACAO_HABILIDADE } from 'common/constants/constants';

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

const NovaClasse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canCreate, canWrite, isAdmin, allowedUniversos, loadingPermissions } =
    useAuth();
  const classeParaEditar = location.state?.classe ?? null;
  const isEditing = Boolean(classeParaEditar);
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
      ? canWrite(classeParaEditar?.universo)
      : canCreate();
    if (!allowed) navigate(ROUTE_PATHS.CLASSES);
  }, [
    loadingPermissions,
    isEditing,
    canWrite,
    canCreate,
    classeParaEditar,
    navigate,
  ]);

  const editInitialValues = classeParaEditar
    ? {
        ...CLASSE_INITIAL_VALUES,
        ...classeParaEditar,
        atributosBasicos: {
          ...CLASSE_INITIAL_VALUES.atributosBasicos,
          ...(classeParaEditar.atributosBasicos || {}),
        },
        habilidades: classeParaEditar.habilidades || [],
      }
    : CLASSE_INITIAL_VALUES;

  const filteredUniversos = isAdmin
    ? universos
    : universos.filter(u => allowedUniversos.includes(u.id));

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateClasse(classeParaEditar.id, values);
    } else {
      await addClasse(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.CLASSES);
  };

  if (loading) return null;

  return (
    <Box className="page-container">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          onClick={() => navigate(ROUTE_PATHS.CLASSES)}
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
            {isEditing ? 'Editar Classe' : 'Nova Classe'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            {isEditing
              ? `Editando os dados de ${classeParaEditar.nome}`
              : 'Preencha os dados da nova classe'}
          </Typography>
        </Box>
      </Box>

      <Formik
        initialValues={editInitialValues}
        validationSchema={CLASSE_SCHEMA}
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
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: 2,
                      }}
                    >
                      <FastField
                        as={TextField}
                        name="nome"
                        label="Nome da Classe"
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
                    <FastField name="linkImagem">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Link da Imagem da Classe"
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
                          alt="Preview da classe"
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

              {/* Seção: Atributos Básicos */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 2,
                }}
              >
                <SectionTitle>Atributos Básicos</SectionTitle>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: 2,
                    mt: 1.5,
                  }}
                >
                  <FastField
                    as={TextField}
                    name="atributosBasicos.forca"
                    label="Força"
                    fullWidth
                    size="small"
                  />
                  <FastField
                    as={TextField}
                    name="atributosBasicos.vitalidade"
                    label="Vitalidade"
                    fullWidth
                    size="small"
                  />
                  <FastField
                    as={TextField}
                    name="atributosBasicos.agilidade"
                    label="Agilidade"
                    fullWidth
                    size="small"
                  />
                  <FastField
                    as={TextField}
                    name="atributosBasicos.inteligencia"
                    label="Inteligência"
                    fullWidth
                    size="small"
                  />
                  <FastField
                    as={TextField}
                    name="atributosBasicos.percepcao"
                    label="Percepção"
                    fullWidth
                    size="small"
                  />
                </Box>
              </Paper>

              {/* Seção: Habilidades Básicas */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 2,
                }}
              >
                <SectionTitle>Habilidades Básicas</SectionTitle>
                <FieldArray name="habilidadesBasicas">
                  {({ push, remove }) => (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        mt: 1.5,
                      }}
                    >
                      {values.habilidadesBasicas.map((hab, idx) => (
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
                              aria-label="Remover habilidade"
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
                            <Box
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 2,
                              }}
                            >
                              <FastField
                                as={TextField}
                                name={`habilidadesBasicas[${idx}].nome`}
                                label="Nome da Habilidade"
                                fullWidth
                                size="small"
                              />
                              <FastField
                                name={`habilidadesBasicas[${idx}].acao`}
                              >
                                {({ field }) => (
                                  <FormControl fullWidth size="small">
                                    <InputLabel>Ação</InputLabel>
                                    <Select {...field} label="Ação">
                                      {ACAO_HABILIDADE.map(r => (
                                        <MenuItem key={r} value={r}>
                                          {r}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                )}
                              </FastField>
                            </Box>
                            <FastField
                              as={TextField}
                              name={`habilidadesBasicas[${idx}].descricao`}
                              label="Descrição da Habilidade"
                              fullWidth
                              multiline
                              rows={2}
                              size="small"
                            />
                            <Divider
                              sx={{ borderColor: 'var(--border-primary)' }}
                            />
                            <Box
                              sx={{
                                display: 'grid',
                                gridTemplateColumns:
                                  'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: 2,
                              }}
                            >
                              <FastField
                                as={TextField}
                                name={`habilidadesBasicas[${idx}].alvo`}
                                label="Alvo"
                                fullWidth
                                size="small"
                              />
                              <FastField
                                as={TextField}
                                name={`habilidadesBasicas[${idx}].alcance`}
                                label="Alcance"
                                fullWidth
                                size="small"
                              />
                              <FastField
                                as={TextField}
                                name={`habilidadesBasicas[${idx}].custo`}
                                label="Custo"
                                fullWidth
                                size="small"
                              />
                              <FastField
                                as={TextField}
                                name={`habilidadesBasicas[${idx}].recarga`}
                                label="Recarga"
                                fullWidth
                                size="small"
                              />
                              <FastField
                                as={TextField}
                                name={`habilidadesBasicas[${idx}].duracao`}
                                label="Duração"
                                fullWidth
                                size="small"
                              />
                              <FastField
                                as={TextField}
                                name={`habilidadesBasicas[${idx}].dados`}
                                label="Dados"
                                fullWidth
                                size="small"
                              />
                            </Box>
                            <FieldArray
                              name={`habilidadesBasicas[${idx}].bonus`}
                            >
                              {({ push: pushBonus, remove: removeBonus }) => (
                                <Box>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1,
                                      mb: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{ color: 'var(--text-muted)' }}
                                    >
                                      Bônus
                                    </Typography>
                                    <Button
                                      size="small"
                                      onClick={() => pushBonus('')}
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
                                  {hab.bonus.map((_, bIdx) => (
                                    <Box
                                      key={bIdx}
                                      sx={{
                                        display: 'flex',
                                        gap: 1,
                                        mb: 1,
                                        alignItems: 'center',
                                      }}
                                    >
                                      <FastField
                                        as={TextField}
                                        name={`habilidadesBasicas[${idx}].bonus[${bIdx}]`}
                                        label={`Bônus ${bIdx + 1}`}
                                        fullWidth
                                        size="small"
                                      />
                                      <IconButton
                                        size="small"
                                        onClick={() => removeBonus(bIdx)}
                                        sx={{
                                          color: 'var(--text-muted)',
                                          '&:hover': { color: '#ef4444' },
                                        }}
                                        aria-label="Remover bônus"
                                      >
                                        ✕
                                      </IconButton>
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </FieldArray>
                          </Box>
                        </Box>
                      ))}
                      <Button
                        variant="outlined"
                        onClick={() => push({ ...HABILIDADE_INICIAL })}
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
                        + Adicionar Habilidade
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              </Paper>

              {/* Seção: Habilidades Avançadas */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 2,
                }}
              >
                <SectionTitle>Habilidades Avançadas</SectionTitle>
                <FieldArray name="habilidadesAvancadas">
                  {({ push, remove }) => (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        mt: 1.5,
                      }}
                    >
                      {values.habilidadesAvancadas.map((hab, idx) => (
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
                              Habilidade Avançada #{idx + 1}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => remove(idx)}
                              sx={{
                                color: 'var(--text-muted)',
                                '&:hover': { color: '#ef4444' },
                              }}
                              aria-label="Remover habilidade"
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
                            <Box
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 2,
                              }}
                            >
                              <FastField
                                as={TextField}
                                name={`habilidadesAvancadas[${idx}].nome`}
                                label="Nome da Habilidade"
                                fullWidth
                                size="small"
                              />
                              <FastField
                                name={`habilidadesAvancadas[${idx}].acao`}
                              >
                                {({ field }) => (
                                  <FormControl fullWidth size="small">
                                    <InputLabel>Ação</InputLabel>
                                    <Select {...field} label="Ação">
                                      {ACAO_HABILIDADE.map(r => (
                                        <MenuItem key={r} value={r}>
                                          {r}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                )}
                              </FastField>
                            </Box>
                            <FastField
                              as={TextField}
                              name={`habilidadesAvancadas[${idx}].descricao`}
                              label="Descrição da Habilidade"
                              fullWidth
                              multiline
                              rows={2}
                              size="small"
                            />
                            <Divider
                              sx={{ borderColor: 'var(--border-primary)' }}
                            />
                            <Box
                              sx={{
                                display: 'grid',
                                gridTemplateColumns:
                                  'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: 2,
                              }}
                            >
                              <FastField
                                as={TextField}
                                name={`habilidadesAvancadas[${idx}].alvo`}
                                label="Alvo"
                                fullWidth
                                size="small"
                              />
                              <FastField
                                as={TextField}
                                name={`habilidadesAvancadas[${idx}].alcance`}
                                label="Alcance"
                                fullWidth
                                size="small"
                              />
                              <FastField
                                as={TextField}
                                name={`habilidadesAvancadas[${idx}].custo`}
                                label="Custo"
                                fullWidth
                                size="small"
                              />
                              <FastField
                                as={TextField}
                                name={`habilidadesAvancadas[${idx}].recarga`}
                                label="Recarga"
                                fullWidth
                                size="small"
                              />
                              <FastField
                                as={TextField}
                                name={`habilidadesAvancadas[${idx}].duracao`}
                                label="Duração"
                                fullWidth
                                size="small"
                              />
                              <FastField
                                as={TextField}
                                name={`habilidadesAvancadas[${idx}].dados`}
                                label="Dados"
                                fullWidth
                                size="small"
                              />
                            </Box>
                            <FieldArray
                              name={`habilidadesAvancadas[${idx}].bonus`}
                            >
                              {({ push: pushBonus, remove: removeBonus }) => (
                                <Box>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1,
                                      mb: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{ color: 'var(--text-muted)' }}
                                    >
                                      Bônus
                                    </Typography>
                                    <Button
                                      size="small"
                                      onClick={() => pushBonus('')}
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
                                  {hab.bonus.map((_, bIdx) => (
                                    <Box
                                      key={bIdx}
                                      sx={{
                                        display: 'flex',
                                        gap: 1,
                                        mb: 1,
                                        alignItems: 'center',
                                      }}
                                    >
                                      <FastField
                                        as={TextField}
                                        name={`habilidadesAvancadas[${idx}].bonus[${bIdx}]`}
                                        label={`Bônus ${bIdx + 1}`}
                                        fullWidth
                                        size="small"
                                      />
                                      <IconButton
                                        size="small"
                                        onClick={() => removeBonus(bIdx)}
                                        sx={{
                                          color: 'var(--text-muted)',
                                          '&:hover': { color: '#ef4444' },
                                        }}
                                        aria-label="Remover bônus"
                                      >
                                        ✕
                                      </IconButton>
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </FieldArray>
                          </Box>
                        </Box>
                      ))}
                      <Button
                        variant="outlined"
                        onClick={() => push({ ...HABILIDADE_INICIAL })}
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
                        + Adicionar Habilidade
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
                  onClick={() => navigate(ROUTE_PATHS.CLASSES)}
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
                  {isEditing ? 'Salvar Alterações' : 'Salvar Classe'}
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default NovaClasse;
