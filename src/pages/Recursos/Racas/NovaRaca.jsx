import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Formik, Form, Field, FieldArray } from 'formik';
import { addRaca } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import {
  RACA_SCHEMA,
  RACA_INITIAL_VALUES,
  HABILIDADE_BASICA_INICIAL,
  HABILIDADE_AVANCADA_INICIAL,
  TIPOS_HABILIDADE,
} from './utils';

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

const NovaRaca = () => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const handleSubmit = (values, { setSubmitting }) => {
    addRaca(values);
    setSubmitting(false);
    navigate(ROUTE_PATHS.RACAS);
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
          onClick={() => navigate(ROUTE_PATHS.RACAS)}
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
            Nova Raça
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Preencha os dados da nova raça
          </Typography>
        </Box>
      </Box>

      <Formik
        initialValues={RACA_INITIAL_VALUES}
        validationSchema={RACA_SCHEMA}
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
                        gridTemplateColumns: '1fr 1fr',
                        gap: 2,
                      }}
                    >
                      <Field
                        as={TextField}
                        name="nome"
                        label="Nome da Raça"
                        fullWidth
                        error={touched.nome && Boolean(errors.nome)}
                        helperText={touched.nome && errors.nome}
                      />
                      <Field
                        as={TextField}
                        name="raridade"
                        label="Raridade"
                        fullWidth
                      />
                    </Box>
                    <Field name="linkImagem">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Link da Imagem da Raça"
                          fullWidth
                          placeholder="https://..."
                          onChange={e => {
                            setImgError(false);
                            field.onChange(e);
                          }}
                        />
                      )}
                    </Field>
                    <Field
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
                          alt="Preview da raça"
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
                  <Field
                    as={TextField}
                    name="atributosBasicos.forca"
                    label="Força"
                    fullWidth
                    size="small"
                  />
                  <Field
                    as={TextField}
                    name="atributosBasicos.agilidade"
                    label="Agilidade"
                    fullWidth
                    size="small"
                  />
                  <Field
                    as={TextField}
                    name="atributosBasicos.percepcao"
                    label="Percepção"
                    fullWidth
                    size="small"
                  />
                  <Field
                    as={TextField}
                    name="atributosBasicos.vitalidade"
                    label="Vitalidade"
                    fullWidth
                    size="small"
                  />
                  <Field
                    as={TextField}
                    name="atributosBasicos.inteligencia"
                    label="Inteligência"
                    fullWidth
                    size="small"
                  />
                  <Field
                    as={TextField}
                    name="atributosBasicos.sorte"
                    label="Sorte"
                    fullWidth
                    size="small"
                  />
                  <Field
                    as={TextField}
                    name="atributosBasicos.limiteMaximoAtributo"
                    label="Limite Máximo de Atributo"
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
                <FieldArray name="habilidadesRaciais.habilidadesBasicas">
                  {({ push, remove }) => (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        mt: 1.5,
                      }}
                    >
                      {values.habilidadesRaciais.habilidadesBasicas.map(
                        (hab, idx) => (
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
                                aria-label="Remover habilidade básica"
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
                              <Field
                                as={TextField}
                                name={`habilidadesRaciais.habilidadesBasicas[${idx}].nome`}
                                label="Nome da Habilidade"
                                fullWidth
                                size="small"
                              />
                              <Field
                                as={TextField}
                                name={`habilidadesRaciais.habilidadesBasicas[${idx}].descricao`}
                                label="Descrição da Habilidade"
                                fullWidth
                                multiline
                                rows={2}
                                size="small"
                              />
                              <FieldArray
                                name={`habilidadesRaciais.habilidadesBasicas[${idx}].bonus`}
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
                                        <Field
                                          as={TextField}
                                          name={`habilidadesRaciais.habilidadesBasicas[${idx}].bonus[${bIdx}]`}
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
                        ),
                      )}
                      <Button
                        variant="outlined"
                        onClick={() => push({ ...HABILIDADE_BASICA_INICIAL })}
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
                        + Adicionar Habilidade Básica
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
                <FieldArray name="habilidadesRaciais.habilidadesAvancadas">
                  {({ push, remove }) => (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        mt: 1.5,
                      }}
                    >
                      {values.habilidadesRaciais.habilidadesAvancadas.map(
                        (hab, idx) => (
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
                                aria-label="Remover habilidade avançada"
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
                                <Field
                                  as={TextField}
                                  name={`habilidadesRaciais.habilidadesAvancadas[${idx}].nome`}
                                  label="Nome da Habilidade"
                                  fullWidth
                                  size="small"
                                />
                                <Field
                                  name={`habilidadesRaciais.habilidadesAvancadas[${idx}].tipo`}
                                >
                                  {({ field }) => (
                                    <FormControl fullWidth size="small">
                                      <InputLabel>
                                        Tipo de Habilidade
                                      </InputLabel>
                                      <Select
                                        {...field}
                                        label="Tipo de Habilidade"
                                      >
                                        {TIPOS_HABILIDADE.map(tipo => (
                                          <MenuItem key={tipo} value={tipo}>
                                            {tipo}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  )}
                                </Field>
                              </Box>
                              <Field
                                as={TextField}
                                name={`habilidadesRaciais.habilidadesAvancadas[${idx}].descricao`}
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
                                <Field
                                  as={TextField}
                                  name={`habilidadesRaciais.habilidadesAvancadas[${idx}].alvo`}
                                  label="Alvo"
                                  fullWidth
                                  size="small"
                                />
                                <Field
                                  as={TextField}
                                  name={`habilidadesRaciais.habilidadesAvancadas[${idx}].alcance`}
                                  label="Alcance"
                                  fullWidth
                                  size="small"
                                />
                                <Field
                                  as={TextField}
                                  name={`habilidadesRaciais.habilidadesAvancadas[${idx}].recarga`}
                                  label="Recarga"
                                  fullWidth
                                  size="small"
                                />
                                <Field
                                  as={TextField}
                                  name={`habilidadesRaciais.habilidadesAvancadas[${idx}].custo`}
                                  label="Custo"
                                  fullWidth
                                  size="small"
                                />
                                <Field
                                  as={TextField}
                                  name={`habilidadesRaciais.habilidadesAvancadas[${idx}].duracao`}
                                  label="Duração"
                                  fullWidth
                                  size="small"
                                />
                                <Field
                                  as={TextField}
                                  name={`habilidadesRaciais.habilidadesAvancadas[${idx}].dados`}
                                  label="Dados"
                                  fullWidth
                                  size="small"
                                />
                              </Box>
                              <FieldArray
                                name={`habilidadesRaciais.habilidadesAvancadas[${idx}].bonus`}
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
                                        <Field
                                          as={TextField}
                                          name={`habilidadesRaciais.habilidadesAvancadas[${idx}].bonus[${bIdx}]`}
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
                        ),
                      )}
                      <Button
                        variant="outlined"
                        onClick={() => push({ ...HABILIDADE_AVANCADA_INICIAL })}
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
                        + Adicionar Habilidade Avançada
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
                  onClick={() => navigate(ROUTE_PATHS.RACAS)}
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
                  Salvar Raça
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default NovaRaca;
