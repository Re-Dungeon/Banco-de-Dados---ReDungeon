import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Formik, Form, FastField, Field } from 'formik';
import { addAptidao, updateAptidao } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
import ImagePreviewPanel from 'components/ImagePreviewPanel/ImagePreviewPanel';
import FormActions from 'components/FormActions/FormActions';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import {
  APTIDAO_SCHEMA,
  APTIDAO_INITIAL_VALUES,
  NIVEL_PROGRESSAO_INICIAL,
} from './utils';

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

const NovaAptidao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const aptidaoParaEditar = location.state?.aptidao ?? null;

  const { universos, loadingUniversos, isEditing } = useEntityFormGuard({
    itemParaEditar: aptidaoParaEditar,
    universoDoItem: aptidaoParaEditar?.universo,
    routeOnDeny: ROUTE_PATHS.APTIDOES,
  });

  const editInitialValues = aptidaoParaEditar
    ? {
        ...APTIDAO_INITIAL_VALUES,
        ...aptidaoParaEditar,
        progressaoNiveis: aptidaoParaEditar.progressaoNiveis || [],
      }
    : APTIDAO_INITIAL_VALUES;

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateAptidao(aptidaoParaEditar.id, values);
    } else {
      await addAptidao(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.APTIDOES);
  };

  if (loadingUniversos) return null;

  return (
    <Box className="page-container">
      <FormPageHeader
        titulo={isEditing ? 'Editar Aptidão' : 'Nova Aptidão'}
        subtitulo={
          isEditing
            ? `Editando os dados de ${aptidaoParaEditar.nome}`
            : 'Preencha os dados da nova aptidão'
        }
        onVoltar={() => navigate(ROUTE_PATHS.APTIDOES)}
      />

      <Formik
        initialValues={editInitialValues}
        validationSchema={APTIDAO_SCHEMA}
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
                            label="Nome da Aptidão"
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

                    <FastField name="linkImagem">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Link da Imagem da Aptidão"
                          fullWidth
                          placeholder="https://..."
                          error={
                            touched.linkImagem && Boolean(errors.linkImagem)
                          }
                          helperText={touched.linkImagem && errors.linkImagem}
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
                          error={touched.descricao && Boolean(errors.descricao)}
                          helperText={touched.descricao && errors.descricao}
                          sx={slotInputSx}
                        />
                      )}
                    </FastField>

                    <Field name="nivelMaximo">
                      {({ field, form }) => (
                        <TextField
                          {...field}
                          label="Nível Máximo"
                          type="number"
                          fullWidth
                          error={
                            touched.nivelMaximo && Boolean(errors.nivelMaximo)
                          }
                          helperText={touched.nivelMaximo && errors.nivelMaximo}
                          onChange={e => {
                            field.onChange(e);
                            const totalBruto = parseInt(e.target.value, 10);
                            const total = Number.isNaN(totalBruto)
                              ? 0
                              : Math.max(0, totalBruto);
                            const atual = form.values.progressaoNiveis;
                            const novaProgressao = Array.from(
                              { length: total },
                              (_, i) =>
                                atual[i] ?? NIVEL_PROGRESSAO_INICIAL(i + 1),
                            );
                            form.setFieldValue(
                              'progressaoNiveis',
                              novaProgressao,
                            );
                          }}
                          sx={slotInputSx}
                        />
                      )}
                    </Field>
                  </Box>

                  <ImagePreviewPanel
                    src={values.linkImagem}
                    alt="Preview da aptidão"
                  />
                </Box>
              </Paper>

              {/* Seção: Progressão de Níveis */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 2,
                }}
              >
                <SectionTitle>Progressão de Níveis</SectionTitle>
                {values.progressaoNiveis.length === 0 ? (
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--text-muted)', mt: 1.5 }}
                  >
                    Defina o Nível Máximo acima para configurar a progressão.
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      mt: 1.5,
                    }}
                  >
                    {values.progressaoNiveis.map((nivelItem, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          border: '1px solid var(--border-primary)',
                          borderRadius: 2,
                          p: 2,
                          background: 'var(--bg-secondary)',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'var(--text-secondary)',
                            fontWeight: 600,
                            mb: 1,
                          }}
                        >
                          Nível {idx + 1}
                        </Typography>

                        <Field name={`progressaoNiveis[${idx}].possuiBonus`}>
                          {({ field }) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  {...field}
                                  checked={Boolean(field.value)}
                                  sx={{
                                    color: 'var(--text-secondary)',
                                    '&.Mui-checked': {
                                      color: 'var(--color-accent)',
                                    },
                                  }}
                                />
                              }
                              label="Conceder bônus neste nível"
                              sx={{ color: 'var(--text-secondary)' }}
                            />
                          )}
                        </Field>

                        {nivelItem.possuiBonus ? (
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 1.5,
                              mt: 1.5,
                            }}
                          >
                            <FastField
                              as={TextField}
                              name={`progressaoNiveis[${idx}].bonus.descricaoCurta`}
                              label="Descrição Curta"
                              fullWidth
                              size="small"
                              sx={slotInputSx}
                            />
                            <FastField
                              as={TextField}
                              name={`progressaoNiveis[${idx}].bonus.descricaoCompleta`}
                              label="Descrição Completa"
                              fullWidth
                              multiline
                              rows={3}
                              size="small"
                              sx={slotInputSx}
                            />
                          </Box>
                        ) : (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'var(--text-muted)',
                              display: 'block',
                              mt: 1,
                            }}
                          >
                            Sem bônus definido: o jogador recebe +1 no dado em
                            testes desta aptidão.
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>

              <FormActions
                onCancelar={() => navigate(ROUTE_PATHS.APTIDOES)}
                isSubmitting={isSubmitting}
                labelSalvar={isEditing ? 'Salvar Alterações' : 'Salvar Aptidão'}
              />
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default NovaAptidao;
