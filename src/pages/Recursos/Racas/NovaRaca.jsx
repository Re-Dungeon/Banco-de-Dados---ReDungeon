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
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import { Formik, Form, FastField, Field, FieldArray } from 'formik';
import { addRaca, updateRaca } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import useStableListKeys from 'hooks/useStableListKeys';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
import ImagePreviewPanel from 'components/ImagePreviewPanel/ImagePreviewPanel';
import FormActions from 'components/FormActions/FormActions';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import {
  RACA_SCHEMA,
  RACA_INITIAL_VALUES,
  HABILIDADE_BASICA_INICIAL,
  HABILIDADE_AVANCADA_INICIAL,
} from './utils';
import { ACAO_HABILIDADE, RARIDADES } from 'common/constants/constants';

const NovaRaca = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const racaParaEditar = location.state?.raca ?? null;

  const { universos, loadingUniversos, isEditing } = useEntityFormGuard({
    itemParaEditar: racaParaEditar,
    universoDoItem: racaParaEditar?.universo,
    routeOnDeny: ROUTE_PATHS.RACAS,
  });

  const editInitialValues = racaParaEditar
    ? {
        ...RACA_INITIAL_VALUES,
        ...racaParaEditar,
        atributosBasicos: {
          ...RACA_INITIAL_VALUES.atributosBasicos,
          ...(racaParaEditar.atributosBasicos || {}),
        },
        habilidadesRaciais: {
          habilidadesBasicas:
            racaParaEditar.habilidadesRaciais?.habilidadesBasicas || [],
          habilidadesAvancadas:
            racaParaEditar.habilidadesRaciais?.habilidadesAvancadas || [],
        },
      }
    : RACA_INITIAL_VALUES;

  const habilidadesBasicasKeys = useStableListKeys(
    editInitialValues.habilidadesRaciais.habilidadesBasicas.length,
  );
  const habilidadesAvancadasKeys = useStableListKeys(
    editInitialValues.habilidadesRaciais.habilidadesAvancadas.length,
  );

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateRaca(racaParaEditar.id, values);
    } else {
      await addRaca(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.RACAS);
  };

  if (loadingUniversos) return null;

  return (
    <Box className="page-container">
      <FormPageHeader
        titulo={isEditing ? 'Editar Raça' : 'Nova Raça'}
        subtitulo={
          isEditing
            ? `Editando os dados de ${racaParaEditar.nome}`
            : 'Preencha os dados da nova raça'
        }
        onVoltar={() => navigate(ROUTE_PATHS.RACAS)}
      />

      <Formik
        initialValues={editInitialValues}
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
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: 2,
                      }}
                    >
                      <FastField
                        as={TextField}
                        name="nome"
                        label="Nome da Raça"
                        fullWidth
                        error={touched.nome && Boolean(errors.nome)}
                        helperText={touched.nome && errors.nome}
                      />
                      <FastField name={`raridade`}>
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
                      label="Link da Imagem da Raça"
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
                    alt="Preview da raça"
                  />
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
                    name="atributosBasicos.agilidade"
                    label="Agilidade"
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
                  <FastField
                    as={TextField}
                    name="atributosBasicos.vitalidade"
                    label="Vitalidade"
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
                    name="atributosBasicos.sorte"
                    label="Sorte"
                    fullWidth
                    size="small"
                  />
                  <FastField
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
                            key={habilidadesBasicasKeys.keys[idx] ?? idx}
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
                                  habilidadesBasicasKeys.removeKey(idx);
                                  remove(idx);
                                }}
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
                              <FastField
                                as={TextField}
                                name={`habilidadesRaciais.habilidadesBasicas[${idx}].nome`}
                                label="Nome da Habilidade"
                                fullWidth
                                size="small"
                              />
                              <FastField
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
                                        <FastField
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
                        onClick={() => {
                          habilidadesBasicasKeys.addKey();
                          push({ ...HABILIDADE_BASICA_INICIAL });
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
                            key={habilidadesAvancadasKeys.keys[idx] ?? idx}
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
                                onClick={() => {
                                  habilidadesAvancadasKeys.removeKey(idx);
                                  remove(idx);
                                }}
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
                                <FastField
                                  as={TextField}
                                  name={`habilidadesRaciais.habilidadesAvancadas[${idx}].nome`}
                                  label="Nome da Habilidade"
                                  fullWidth
                                  size="small"
                                />
                                <FastField
                                  name={`habilidadesRaciais.habilidadesAvancadas[${idx}].acao`}
                                >
                                  {({ field }) => (
                                    <FormControl fullWidth size="small">
                                      <InputLabel>Tipo de Ação</InputLabel>
                                      <Select {...field} label="Tipo de Ação">
                                        {ACAO_HABILIDADE.map(acao => (
                                          <MenuItem key={acao} value={acao}>
                                            {acao}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  )}
                                </FastField>
                              </Box>
                              <FastField
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
                                <FastField
                                  as={TextField}
                                  name={`habilidadesRaciais.habilidadesAvancadas[${idx}].alvo`}
                                  label="Alvo"
                                  fullWidth
                                  size="small"
                                />
                                <FastField
                                  as={TextField}
                                  name={`habilidadesRaciais.habilidadesAvancadas[${idx}].alcance`}
                                  label="Alcance"
                                  fullWidth
                                  size="small"
                                />
                                <FastField
                                  as={TextField}
                                  name={`habilidadesRaciais.habilidadesAvancadas[${idx}].recarga`}
                                  label="Recarga"
                                  fullWidth
                                  size="small"
                                />
                                <FastField
                                  as={TextField}
                                  name={`habilidadesRaciais.habilidadesAvancadas[${idx}].custo`}
                                  label="Custo"
                                  fullWidth
                                  size="small"
                                />
                                <FastField
                                  as={TextField}
                                  name={`habilidadesRaciais.habilidadesAvancadas[${idx}].duracao`}
                                  label="Duração"
                                  fullWidth
                                  size="small"
                                />
                                <FastField
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
                                        <FastField
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
                        onClick={() => {
                          habilidadesAvancadasKeys.addKey();
                          push({ ...HABILIDADE_AVANCADA_INICIAL });
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
                        + Adicionar Habilidade Avançada
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              </Paper>

              <FormActions
                onCancelar={() => navigate(ROUTE_PATHS.RACAS)}
                isSubmitting={isSubmitting}
                labelSalvar={isEditing ? 'Salvar Alterações' : 'Salvar Raça'}
              />
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default NovaRaca;
