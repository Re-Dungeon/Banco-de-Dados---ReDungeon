import React from 'react';
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
import { addAptidao, updateAptidao } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import useStableListKeys from 'hooks/useStableListKeys';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
import ImagePreviewPanel from 'components/ImagePreviewPanel/ImagePreviewPanel';
import FormActions from 'components/FormActions/FormActions';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import {
  APTIDAO_SCHEMA,
  APTIDAO_INITIAL_VALUES,
  BONUS_NIVEL_INICIAL,
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

/**
 * Um bloco por nível (1..nivelMaximo). Precisa ser um componente próprio (e
 * não um `.map` direto no corpo de `NovaAptidao`) porque `useStableListKeys`
 * é um hook: o número de níveis muda dinamicamente com `nivelMaximo`, então
 * chamá-lo dentro de um loop violaria as regras de hooks. Como componente,
 * cada bloco de nível tem sua própria instância com uma única chamada fixa.
 */
const NivelProgressao = ({ idx, bonus }) => {
  const bonusKeys = useStableListKeys(bonus.length);

  return (
    <Box
      sx={{
        border: '1px solid var(--border-primary)',
        borderRadius: 2,
        p: 2,
        background: 'var(--bg-secondary)',
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: 'var(--text-secondary)', fontWeight: 600, mb: 1.5 }}
      >
        Nível {idx + 1}
      </Typography>
      <FieldArray name={`progressaoNiveis[${idx}].bonus`}>
        {({ push, remove }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {bonus.map((_, bIdx) => (
              <Box
                key={bonusKeys.keys[bIdx] ?? bIdx}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  border: '1px solid var(--border-primary)',
                  borderRadius: 1.5,
                  p: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: 'var(--text-muted)' }}
                  >
                    Bônus #{bIdx + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      bonusKeys.removeKey(bIdx);
                      remove(bIdx);
                    }}
                    sx={{
                      color: 'var(--text-muted)',
                      '&:hover': { color: '#ef4444' },
                    }}
                    aria-label={`Remover bônus do nível ${idx + 1}`}
                  >
                    ✕
                  </IconButton>
                </Box>
                <FastField
                  as={TextField}
                  name={`progressaoNiveis[${idx}].bonus[${bIdx}].descricaoCurta`}
                  label="Descrição Curta"
                  fullWidth
                  size="small"
                  sx={slotInputSx}
                />
                <FastField
                  as={TextField}
                  name={`progressaoNiveis[${idx}].bonus[${bIdx}].descricaoCompleta`}
                  label="Descrição Completa"
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  sx={slotInputSx}
                />
              </Box>
            ))}
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                bonusKeys.addKey();
                push({ ...BONUS_NIVEL_INICIAL });
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
              + Adicionar Bônus
            </Button>
          </Box>
        )}
      </FieldArray>
    </Box>
  );
};

NivelProgressao.propTypes = {
  idx: PropTypes.number.isRequired,
  bonus: PropTypes.arrayOf(PropTypes.object).isRequired,
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
                              (_, i) => atual[i] ?? { nivel: i + 1, bonus: [] },
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
                      <NivelProgressao
                        key={idx}
                        idx={idx}
                        bonus={nivelItem.bonus}
                      />
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
