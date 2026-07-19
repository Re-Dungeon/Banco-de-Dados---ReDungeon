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
import { addClasse, updateClasse } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import useStableListKeys from 'hooks/useStableListKeys';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
import ImagePreviewPanel from 'components/ImagePreviewPanel/ImagePreviewPanel';
import FormActions from 'components/FormActions/FormActions';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import {
  CLASSE_SCHEMA,
  CLASSE_INITIAL_VALUES,
  HABILIDADE_INICIAL,
} from './utils';
import { RARIDADES, ACAO_HABILIDADE } from 'common/constants/constants';

const NovaClasse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const classeParaEditar = location.state?.classe ?? null;

  const { universos, loadingUniversos, isEditing } = useEntityFormGuard({
    itemParaEditar: classeParaEditar,
    universoDoItem: classeParaEditar?.universo,
    routeOnDeny: ROUTE_PATHS.CLASSES,
  });

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

  const habilidadesBasicasKeys = useStableListKeys(
    editInitialValues.habilidadesBasicas.length,
  );
  const habilidadesAvancadasKeys = useStableListKeys(
    editInitialValues.habilidadesAvancadas.length,
  );

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateClasse(classeParaEditar.id, values);
    } else {
      await addClasse(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.CLASSES);
  };

  if (loadingUniversos) return null;

  return (
    <Box className="page-container">
      <FormPageHeader
        titulo={isEditing ? 'Editar Classe' : 'Nova Classe'}
        subtitulo={
          isEditing
            ? `Editando os dados de ${classeParaEditar.nome}`
            : 'Preencha os dados da nova classe'
        }
        onVoltar={() => navigate(ROUTE_PATHS.CLASSES)}
      />

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
                      label="Link da Imagem da Classe"
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
                    alt="Preview da classe"
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
                        onClick={() => {
                          habilidadesBasicasKeys.addKey();
                          push({ ...HABILIDADE_INICIAL });
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
                        onClick={() => {
                          habilidadesAvancadasKeys.addKey();
                          push({ ...HABILIDADE_INICIAL });
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
                        + Adicionar Habilidade
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              </Paper>

              <FormActions
                onCancelar={() => navigate(ROUTE_PATHS.CLASSES)}
                isSubmitting={isSubmitting}
                labelSalvar={isEditing ? 'Salvar Alterações' : 'Salvar Classe'}
              />
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default NovaClasse;
