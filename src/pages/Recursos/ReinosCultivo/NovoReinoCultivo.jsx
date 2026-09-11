import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import { Formik, Form, FastField, Field } from 'formik';
import {
  addReinoCultivo,
  updateReinoCultivo,
  getReinosCultivo,
} from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
import FormSelect from 'components/FormSelect/FormSelect';
import ImagePreviewPanel from 'components/ImagePreviewPanel/ImagePreviewPanel';
import FormActions from 'components/FormActions/FormActions';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import {
  REINO_CULTIVO_SCHEMA,
  REINO_CULTIVO_INITIAL_VALUES,
  REGRAS_CULTIVO_CATEGORIAS,
  REGRAS_CULTIVO_ATRIBUTOS,
  normalizeRegrasCultivoValues,
} from './utils';

const DESTINO_ICONS = {
  atributosPrincipais: '⚔',
  atributosSecundarios: '◈',
  status: '♥',
};

const NovoReinoCultivo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reinoCultivoParaEditar = location.state?.reinoCultivo ?? null;

  const { universos, loadingUniversos, isEditing } = useEntityFormGuard({
    itemParaEditar: reinoCultivoParaEditar,
    universoDoItem: reinoCultivoParaEditar?.universo,
    routeOnDeny: ROUTE_PATHS.REINOS_CULTIVO,
  });

  const [reinosCultivo, setReinosCultivo] = useState([]);

  useEffect(() => {
    let active = true;
    getReinosCultivo().then(data => {
      if (active) setReinosCultivo(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const editInitialValues = reinoCultivoParaEditar
    ? {
        ...REINO_CULTIVO_INITIAL_VALUES,
        ...reinoCultivoParaEditar,
        regrasCultivo: normalizeRegrasCultivoValues(
          reinoCultivoParaEditar.regrasCultivo,
        ),
      }
    : REINO_CULTIVO_INITIAL_VALUES;

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      ...values,
      regrasCultivo: normalizeRegrasCultivoValues(values.regrasCultivo),
    };

    if (isEditing) {
      await updateReinoCultivo(reinoCultivoParaEditar.id, payload);
    } else {
      await addReinoCultivo(payload);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.REINOS_CULTIVO);
  };

  if (loadingUniversos) return null;

  return (
    <Box className="page-container">
      <FormPageHeader
        titulo={isEditing ? 'Editar Reino de Cultivo' : 'Novo Reino de Cultivo'}
        subtitulo={
          isEditing
            ? `Editando os dados de ${reinoCultivoParaEditar.nome}`
            : 'Preencha os dados do novo reino de cultivo'
        }
        onVoltar={() => navigate(ROUTE_PATHS.REINOS_CULTIVO)}
      />

      <Formik
        initialValues={editInitialValues}
        validationSchema={REINO_CULTIVO_SCHEMA}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isSubmitting }) => {
          const universoSelecionado = universos.find(
            u => u.id === values.universo,
          );
          const subUniversosDisponiveis =
            universoSelecionado?.SubUniversos || [];
          const reinosAnterioresDisponiveis = reinosCultivo.filter(
            reino =>
              reino.id !== reinoCultivoParaEditar?.id &&
              reino.universo === values.universo &&
              (!values.subUniverso || reino.subUniverso === values.subUniverso),
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
                        <FastField
                          as={TextField}
                          name="nome"
                          label="Nome do Reino de Cultivo"
                          fullWidth
                          error={touched.nome && Boolean(errors.nome)}
                          helperText={touched.nome && errors.nome}
                        />
                        <Field name="universo">
                          {({ field, form }) => (
                            <FormSelect
                              field={field}
                              form={form}
                              label="Universo"
                              options={universos.map(universo => ({
                                value: universo.id,
                                label: universo.Nome,
                              }))}
                              disableClearable
                              onValueChange={() => {
                                form.setFieldValue('subUniverso', '');
                                form.setFieldValue('reinoAnterior', '');
                              }}
                            />
                          )}
                        </Field>
                      </Box>

                      {subUniversosDisponiveis.length > 0 && (
                        <Field name="subUniverso">
                          {({ field, form }) => (
                            <FormSelect
                              field={field}
                              form={form}
                              label="Subuniverso"
                              options={subUniversosDisponiveis}
                              onValueChange={() =>
                                form.setFieldValue('reinoAnterior', '')
                              }
                            />
                          )}
                        </Field>
                      )}

                      <Field name="reinoAnterior">
                        {({ field, form }) => (
                          <FormSelect
                            field={field}
                            form={form}
                            label="Reino Anterior"
                            options={reinosAnterioresDisponiveis.map(reino => ({
                              value: reino.id,
                              label: reino.nome,
                            }))}
                          />
                        )}
                      </Field>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                          gap: 2,
                        }}
                      >
                        <FastField
                          as={TextField}
                          name="quantidadeSubReinos"
                          label="Quantidade de Sub-Reinos"
                          type="number"
                          fullWidth
                          error={
                            touched.quantidadeSubReinos &&
                            Boolean(errors.quantidadeSubReinos)
                          }
                          helperText={
                            touched.quantidadeSubReinos &&
                            errors.quantidadeSubReinos
                          }
                        />
                        <FastField
                          as={TextField}
                          name="experienciaPorSubReino"
                          label="Experiência por Sub-Reino"
                          type="number"
                          fullWidth
                          error={
                            touched.experienciaPorSubReino &&
                            Boolean(errors.experienciaPorSubReino)
                          }
                          helperText={
                            touched.experienciaPorSubReino &&
                            errors.experienciaPorSubReino
                          }
                        />
                      </Box>

                      <FastField
                        as={TextField}
                        name="linkImagem"
                        label="Link da Imagem do Reino de Cultivo"
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
                      alt="Preview do reino de cultivo"
                    />
                  </Box>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 2,
                    boxShadow: '0 12px 30px rgba(4, 8, 20, 0.28)',
                  }}
                >
                  <SectionTitle>Regras de Cultivo</SectionTitle>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
                        gap: 2.5,
                      }}
                    >
                      <Box
                        sx={{
                          background:
                            'linear-gradient(180deg, rgba(112, 84, 170, 0.14), rgba(9, 15, 25, 0.7))',
                          border: '1px solid rgba(119, 158, 255, 0.28)',
                          borderRadius: 2,
                          p: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          minHeight: 170,
                        }}
                      >
                        <Typography
                          variant="overline"
                          sx={{
                            color: 'var(--text-muted)',
                            letterSpacing: 1.4,
                            mb: 1,
                          }}
                        >
                          Pontos de Cultivo
                        </Typography>

                        <FastField
                          as={TextField}
                          name="regrasCultivo.pontos"
                          type="number"
                          fullWidth
                          variant="outlined"
                          sx={{
                            '& .MuiInputBase-root': {
                              background: 'rgba(9, 15, 25, 0.5)',
                              borderRadius: 1.5,
                              fontSize: '2.1rem',
                              fontWeight: 800,
                              color: 'var(--color-accent)',
                              minHeight: 74,
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(119, 158, 255, 0.35)',
                            },
                            '& .MuiInputBase-input': {
                              textAlign: 'center',
                              paddingY: 1.4,
                            },
                          }}
                          error={
                            touched.regrasCultivo?.pontos &&
                            Boolean(errors.regrasCultivo?.pontos)
                          }
                          helperText={
                            touched.regrasCultivo?.pontos &&
                            errors.regrasCultivo?.pontos
                          }
                        />

                        <Typography
                          variant="caption"
                          sx={{
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                            mt: 1.25,
                            textAlign: 'center',
                          }}
                        >
                          Pontos concedidos pelo Reino
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: 'var(--text-primary)',
                            letterSpacing: 1.4,
                            textTransform: 'uppercase',
                            fontWeight: 700,
                          }}
                        >
                          Destinos permitidos
                        </Typography>

                        <FormGroup
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                              xs: '1fr',
                              sm: 'repeat(3, minmax(0, 1fr))',
                            },
                            gap: 1.5,
                          }}
                        >
                          {Object.entries(REGRAS_CULTIVO_CATEGORIAS).map(
                            ([categoria, label]) => (
                              <Field
                                key={categoria}
                                name="regrasCultivo.destinosPermitidos"
                              >
                                {({ field, form }) => {
                                  const selected =
                                    field.value?.includes(categoria) || false;

                                  const handleChange = event => {
                                    const nextValues = [...(field.value || [])];
                                    if (event.target.checked) {
                                      nextValues.push(categoria);
                                    } else {
                                      const index = nextValues.indexOf(categoria);
                                      if (index >= 0) nextValues.splice(index, 1);
                                    }
                                    form.setFieldValue(
                                      'regrasCultivo.destinosPermitidos',
                                      nextValues,
                                    );
                                  };

                                  return (
                                    <Box
                                      sx={{
                                        background: selected
                                          ? 'rgba(98, 128, 255, 0.1)'
                                          : 'rgba(10, 16, 28, 0.7)',
                                        border: selected
                                          ? '1px solid rgba(212, 175, 55, 0.7)'
                                          : '1px solid rgba(119, 158, 255, 0.18)',
                                        borderRadius: 2,
                                        p: 1.5,
                                        minHeight: 110,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        transition:
                                          'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
                                        boxShadow: selected
                                          ? '0 0 0 1px rgba(212, 175, 55, 0.18), 0 10px 24px rgba(20, 28, 46, 0.25)'
                                          : 'none',
                                        '&:hover': {
                                          borderColor: selected
                                            ? 'rgba(212, 175, 55, 0.9)'
                                            : 'rgba(119, 158, 255, 0.35)',
                                          transform: 'translateY(-1px)',
                                        },
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          mb: 1,
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            width: 28,
                                            height: 28,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            background: selected
                                              ? 'rgba(212, 175, 55, 0.15)'
                                              : 'rgba(111, 128, 166, 0.08)',
                                            color: selected
                                              ? 'var(--color-accent)'
                                              : 'var(--text-secondary)',
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                          }}
                                        >
                                          {DESTINO_ICONS[categoria] || '✦'}
                                        </Box>

                                        <Checkbox
                                          checked={selected}
                                          onChange={handleChange}
                                          name={categoria}
                                          sx={{
                                            color: 'var(--text-muted)',
                                            '&.Mui-checked': {
                                              color: 'var(--color-accent)',
                                            },
                                            padding: 0,
                                          }}
                                        />
                                      </Box>

                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: selected
                                            ? 'var(--text-primary)'
                                            : 'var(--text-secondary)',
                                          fontWeight: 700,
                                          lineHeight: 1.2,
                                        }}
                                      >
                                        {label.split(' ').map((word, index) => (
                                          <React.Fragment key={`${categoria}-${word}-${index}`}>
                                            {index > 0 && <br />}
                                            {word}
                                          </React.Fragment>
                                        ))}
                                      </Typography>
                                    </Box>
                                  );
                                }}
                              </Field>
                            ),
                          )}
                        </FormGroup>
                      </Box>
                    </Box>

                    {Object.entries(REGRAS_CULTIVO_CATEGORIAS).map(
                      ([categoria, categoriaLabel]) => {
                        const atributosCategoria = REGRAS_CULTIVO_ATRIBUTOS.filter(
                          atributo => atributo.categoria === categoria,
                        );

                        if (atributosCategoria.length === 0) return null;

                        return (
                          <Box
                            key={categoria}
                            sx={{
                              background: 'rgba(9, 15, 25, 0.75)',
                              border: '1px solid rgba(119, 158, 255, 0.18)',
                              borderRadius: 2,
                              p: 2,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: 'var(--text-primary)',
                                letterSpacing: 1.25,
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                mb: 1.5,
                              }}
                            >
                              {categoriaLabel}
                            </Typography>

                            <Box
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                  xs: '1fr',
                                  sm: 'repeat(2, minmax(0, 1fr))',
                                  xl: 'repeat(3, minmax(0, 1fr))',
                                },
                                gap: 1.5,
                              }}
                            >
                              {atributosCategoria.map(atributo => {
                                const atributoIndex = values.regrasCultivo.atributos.findIndex(
                                  item => item.id === atributo.id,
                                );

                                if (atributoIndex === -1) return null;

                                return (
                                  <Box
                                    key={atributo.id}
                                    sx={{
                                      background: 'rgba(16, 24, 43, 0.88)',
                                      border: '1px solid rgba(119, 158, 255, 0.18)',
                                      borderRadius: 1.75,
                                      p: 1.5,
                                      transition:
                                        'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
                                      '&:hover': {
                                        borderColor: 'rgba(212, 175, 55, 0.45)',
                                        transform: 'translateY(-1px)',
                                      },
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 1,
                                        mb: 1.5,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1,
                                          minWidth: 0,
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            width: 22,
                                            height: 22,
                                            borderRadius: '50%',
                                            background: 'rgba(110, 149, 255, 0.14)',
                                            color: 'var(--text-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                          }}
                                        >
                                          {DESTINO_ICONS[categoria] || '✦'}
                                        </Box>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: 'var(--text-primary)',
                                            fontWeight: 700,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                          }}
                                        >
                                          {atributo.label}
                                        </Typography>
                                      </Box>
                                    </Box>

                                    <Box
                                      sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1,
                                      }}
                                    >
                                      <Field
                                        name={`regrasCultivo.atributos[${atributoIndex}].permitido`}
                                      >
                                        {({ field, form }) => (
                                          <Box
                                            sx={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              gap: 1,
                                              p: 0.75,
                                              borderRadius: 1,
                                              border: '1px solid rgba(119, 158, 255, 0.12)',
                                              background: field.value
                                                ? 'rgba(24, 39, 63, 0.85)'
                                                : 'rgba(9, 15, 25, 0.5)',
                                            }}
                                          >
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                color: 'var(--text-secondary)',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.8,
                                              }}
                                            >
                                              Permitido
                                            </Typography>
                                            <Checkbox
                                              checked={Boolean(field.value)}
                                              onChange={event =>
                                                form.setFieldValue(
                                                  `regrasCultivo.atributos[${atributoIndex}].permitido`,
                                                  event.target.checked,
                                                )
                                              }
                                              sx={{
                                                color: 'var(--text-muted)',
                                                '&.Mui-checked': {
                                                  color: 'var(--color-accent)',
                                                },
                                                padding: 0,
                                              }}
                                            />
                                          </Box>
                                        )}
                                      </Field>

                                      <FastField
                                        as={TextField}
                                        name={`regrasCultivo.atributos[${atributoIndex}].limite`}
                                        label="Limite"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        placeholder="Opcional"
                                        inputProps={{ min: 0 }}
                                        sx={{
                                          '& .MuiInputBase-root': {
                                            background: 'rgba(9, 15, 25, 0.65)',
                                            borderRadius: 1,
                                          },
                                          '& .MuiInputLabel-root': {
                                            fontSize: '0.72rem',
                                          },
                                        }}
                                        error={
                                          touched.regrasCultivo?.atributos?.[atributoIndex]?.limite &&
                                          Boolean(
                                            errors.regrasCultivo?.atributos?.[atributoIndex]?.limite,
                                          )
                                        }
                                        helperText={
                                          touched.regrasCultivo?.atributos?.[atributoIndex]?.limite &&
                                          errors.regrasCultivo?.atributos?.[atributoIndex]?.limite
                                        }
                                      />
                                    </Box>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        );
                      },
                    )}
                  </Box>
                </Paper>

                <FormActions
                  onCancelar={() => navigate(ROUTE_PATHS.REINOS_CULTIVO)}
                  isSubmitting={isSubmitting}
                  labelSalvar={
                    isEditing ? 'Salvar Alterações' : 'Salvar Reino de Cultivo'
                  }
                />
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default NovoReinoCultivo;
