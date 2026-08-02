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
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PsychologyIcon from '@mui/icons-material/Psychology';
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
import {
  RARIDADES,
  TIPOS_PERSONAGEM,
} from 'common/constants/constants';
import {
  ClasseFormPanel,
  ClasseFormHeader,
  ClasseFormTitle,
  ClasseFormSubtitle,
  ClasseFormDivider,
  ClasseFormContentGrid,
  ClasseFormFieldColumn,
  ClasseFormFieldGrid,
  AtributosCard,
  AtributosHeader,
  AtributosHeaderRow,
  AtributosHeaderLine,
  AtributosGrid,
} from './styles';

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

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      color: 'var(--text-primary)',
      background:
        'linear-gradient(180deg, rgba(22, 33, 54, 0.95), rgba(15, 23, 42, 0.95))',
      borderRadius: '14px',
      minHeight: '56px',
      transition: 'all 0.2s ease',
      '& fieldset': {
        borderColor: 'rgba(43, 57, 85, 0.9)',
        borderWidth: '1px',
        transition: 'all 0.2s ease',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(41, 182, 246, 0.7)',
        boxShadow: '0 0 0 1px rgba(41, 182, 246, 0.14)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#29B6F6',
        boxShadow: '0 0 0 4px rgba(41, 182, 246, 0.14)',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'var(--text-secondary)',
      fontWeight: 600,
      '&.Mui-focused': { color: '#29B6F6' },
    },
    '& .MuiInputBase-input': {
      color: 'var(--text-primary)',
      '&::placeholder': { color: '#64748b', opacity: 1 },
    },
    '& .MuiFormHelperText-root': {
      color: '#ef4444',
      marginLeft: 0,
    },
  };

  const selectSx = {
    color: 'var(--text-primary)',
    background:
      'linear-gradient(180deg, rgba(22, 33, 54, 0.95), rgba(15, 23, 42, 0.95))',
    borderRadius: '14px',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(43, 57, 85, 0.9)',
      borderWidth: '1px',
      transition: 'all 0.2s ease',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(41, 182, 246, 0.7)',
      boxShadow: '0 0 0 1px rgba(41, 182, 246, 0.14)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#29B6F6',
      boxShadow: '0 0 0 4px rgba(41, 182, 246, 0.14)',
    },
    '& .MuiSvgIcon-root': { color: 'var(--text-secondary)' },
  };

  const menuPropsSx = {
    slotProps: {
      paper: {
        sx: {
          background: 'linear-gradient(145deg, #10182b 0%, #0f172a 100%)',
          color: 'var(--text-primary)',
          border: '1px solid rgba(43, 57, 85, 0.95)',
          borderRadius: '16px',
          boxShadow: '0 16px 36px rgba(2, 6, 23, 0.38)',
          overflow: 'hidden',
        },
      },
    },
  };

  const attributeLabelProps = {
    shrink: true,
  };

  const attributeFieldSx = {
    padding: '25px 20px 14px',
    minHeight: '50px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background:
      'linear-gradient(180deg, rgba(8, 16, 31, 0.98), rgba(10, 23, 41, 0.96))',
    borderRadius: '20px',
    border: '1px solid rgba(42, 92, 126, 0.85)',
    boxShadow: 'inset 0 0 0 1px rgba(31, 64, 96, 0.12)',
    transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      borderColor: '#60a5fa',
      boxShadow:
        '0 10px 30px rgba(30, 86, 148, 0.12), inset 0 0 0 1px rgba(96, 165, 250, 0.12)',
    },
    '& .MuiOutlinedInput-root': {
      background: 'transparent',
      minHeight: 'auto',
      borderRadius: '16px',
      alignItems: 'center',
      padding: 0,
      '& fieldset, & .MuiOutlinedInput-notchedOutline': {
        border: 'none',
        borderColor: 'transparent',
        boxShadow: 'none',
      },
      '&:hover fieldset, &:hover .MuiOutlinedInput-notchedOutline': {
        border: 'none',
        boxShadow: 'none',
      },
      '&.Mui-focused fieldset, &.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: 'none',
        boxShadow: 'none',
      },
      '& .MuiInputBase-input': {
        color: '#ffffff',
        fontSize: '1.35rem',
        fontWeight: 500,
        textAlign: 'center',
        padding: '4px 0 0',
        lineHeight: 1.05,
        outline: 'none',
      },
    },
    '& .MuiInputLabel-root': {
      display: 'block',
      position: 'relative',
      transform: 'none',
      left: 0,
      top: 0,
      width: '100%',
      textAlign: 'center',
      color: '#e2e8f0',
      fontSize: '0.9rem',
      fontWeight: 600,
      marginBottom: '12px',
      paddingBottom: '2px',
      '&:after': {
        content: '""',
        display: 'block',
        width: '100%',
        height: '1px',
        marginTop: '10px',
        background:
          'linear-gradient(90deg, rgba(34, 211, 238, 0.4), rgba(96, 165, 250, 0.15))',
        opacity: 0.9,
      },
    },
  };

  const skillSectionSx = {
    p: 3,
    background: 'linear-gradient(180deg, #0f172a, #111827)',
    border: '1px solid rgba(51, 65, 85, 0.95)',
    borderRadius: '20px',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.18)',
  };

  const skillCardSx = {
    p: 3,
    background:
      'linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(22, 33, 54, 0.95))',
    border: '1px solid rgba(51, 65, 85, 0.95)',
    borderRadius: '16px',
    boxShadow:
      '0 12px 28px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(59, 130, 246, 0.08)',
    transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      borderColor: '#3b82f6',
      boxShadow:
        '0 18px 40px rgba(59, 130, 246, 0.12), inset 0 0 0 1px rgba(59, 130, 246, 0.12)',
    },
  };

  const skillHeaderSx = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 2,
    mb: 2,
  };

  const skillTitleSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    color: '#ffffff',
    fontSize: '1.05rem',
    fontWeight: 600,
  };

  const skillFieldSx = {
    '& .MuiOutlinedInput-root': {
      background: '#111827',
      borderRadius: '14px',
      '& fieldset': {
        borderColor: 'rgba(51, 65, 85, 0.95)',
      },
      '&:hover fieldset': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 5px rgba(59, 130, 246, 0.08)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#22d3ee',
        boxShadow: '0 0 0 8px rgba(34, 211, 238, 0.14)',
      },
      '& .MuiInputBase-input': {
        color: '#ffffff',
        fontSize: '0.95rem',
        padding: '14px 14px',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#cbd5e1',
      fontSize: '0.78rem',
      fontWeight: 500,
      marginBottom: '8px',
    },
  };

  const skillTextareaSx = {
    ...skillFieldSx,
    '& .MuiOutlinedInput-root': {
      ...skillFieldSx['& .MuiOutlinedInput-root'],
      minHeight: '120px',
      alignItems: 'flex-start',
      py: 1,
    },
  };

  const bonusItemSx = {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 2,
    alignItems: 'center',
    p: 2,
    mb: 1.5,
    background: 'rgba(15, 23, 42, 0.92)',
    border: '1px solid rgba(51, 65, 85, 0.95)',
    borderRadius: '14px',
    boxShadow: 'inset 0 0 0 1px rgba(59, 130, 246, 0.06)',
  };

  const addBonusButtonSx = {
    color: '#60a5fa',
    border: '1px solid rgba(59, 130, 246, 0.75)',
    borderRadius: '999px',
    background: 'transparent',
    py: '8px',
    px: 2,
    fontSize: '0.85rem',
    textTransform: 'none',
    transition: 'all 200ms ease',
    '&:hover': {
      background: 'rgba(59, 130, 246, 0.12)',
      borderColor: '#3b82f6',
      color: '#ffffff',
    },
  };

  const skillAddButtonSx = {
    alignSelf: 'flex-start',
    color: '#60a5fa',
    border: '1px solid rgba(59, 130, 246, 0.8)',
    background: 'transparent',
    borderRadius: '999px',
    py: '10px',
    px: 3,
    fontSize: '0.95rem',
    textTransform: 'none',
    transition: 'all 200ms ease',
    '&:hover': {
      background: 'rgba(59, 130, 246, 0.12)',
      borderColor: '#3b82f6',
      color: '#ffffff',
    },
  };

  const removeBonusButtonSx = {
    minWidth: 0,
    width: 30,
    height: 30,
    borderRadius: '50%',
    color: '#94a3b8',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(59, 130, 246, 0.12)',
    transition: 'all 200ms ease',
    '&:hover': {
      background: 'rgba(239, 68, 68, 0.14)',
      color: '#f87171',
    },
  };

  const deleteSkillButtonSx = {
    minWidth: 0,
    width: 34,
    height: 34,
    borderRadius: '50%',
    color: '#94a3b8',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(59, 130, 246, 0.12)',
    transition: 'all 200ms ease',
    '&:hover': {
      background: 'rgba(239, 68, 68, 0.16)',
      color: '#f87171',
      boxShadow: '0 0 0 6px rgba(248, 113, 113, 0.12)',
    },
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
              <ClasseFormPanel elevation={0}>
                <ClasseFormHeader>
                  <ClasseFormTitle variant="h4">🛡️ Informações da Classe</ClasseFormTitle>
                  <ClasseFormSubtitle>
                    Dados básicos utilizados pelo sistema para identificar esta classe.
                  </ClasseFormSubtitle>
                  <ClasseFormDivider />
                </ClasseFormHeader>

                <ClasseFormContentGrid>
                  <ClasseFormFieldColumn>
                    <ClasseFormFieldGrid>
                      <FastField name="nome">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Nome da Classe"
                            fullWidth
                            error={touched.nome && Boolean(errors.nome)}
                            helperText={touched.nome && errors.nome}
                            sx={inputSx}
                          />
                        )}
                      </FastField>

                      <FastField name="raridade">
                        {({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel sx={{ color: 'var(--text-secondary)' }}>
                              Raridade
                            </InputLabel>
                            <Select
                              {...field}
                              label="Raridade"
                              sx={selectSx}
                              MenuProps={menuPropsSx}
                            >
                              {RARIDADES.map(raridade => (
                                <MenuItem
                                  key={raridade}
                                  value={raridade}
                                  sx={{
                                    '&:hover': {
                                      background: 'rgba(41, 182, 246, 0.16)',
                                    },
                                    '&.Mui-selected': {
                                      background:
                                        'linear-gradient(90deg, rgba(124, 77, 255, 0.32), rgba(41, 182, 246, 0.18))',
                                      color: '#fff',
                                    },
                                  }}
                                >
                                  {raridade}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </FastField>

                      <Field name="universo">
                        {({ field, form }) => (
                          <FormControl fullWidth>
                            <InputLabel sx={{ color: 'var(--text-secondary)' }}>
                              Universo
                            </InputLabel>
                            <Select
                              {...field}
                              value={field.value || ''}
                              onChange={e => form.setFieldValue('universo', e.target.value)}
                              label="Universo"
                              sx={selectSx}
                              MenuProps={menuPropsSx}
                            >
                              {universos.map(universo => (
                                <MenuItem
                                  key={universo.id}
                                  value={universo.id}
                                  sx={{
                                    '&:hover': {
                                      background: 'rgba(41, 182, 246, 0.16)',
                                    },
                                    '&.Mui-selected': {
                                      background:
                                        'linear-gradient(90deg, rgba(124, 77, 255, 0.32), rgba(41, 182, 246, 0.18))',
                                      color: '#fff',
                                    },
                                  }}
                                >
                                  {universo.Nome}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </Field>
                    </ClasseFormFieldGrid>

                    <Field name="linkImagem">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Link da Imagem da Classe"
                          fullWidth
                          placeholder="https://..."
                          error={touched.linkImagem && Boolean(errors.linkImagem)}
                          helperText={touched.linkImagem && errors.linkImagem}
                          sx={inputSx}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Box
                                    sx={{
                                      mr: 1.25,
                                      color: 'var(--color-accent)',
                                      fontSize: '1.05rem',
                                    }}
                                  >
                                    🌐
                                  </Box>
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      )}
                    </Field>

                    <Field name="tiposDisponiveis">
                      {({ field, form }) => (
                        <FormControl fullWidth>
                          <InputLabel sx={{ color: 'var(--text-secondary)' }}>
                            Disponível Para os Tipos
                          </InputLabel>
                          <Select
                            {...field}
                            multiple
                            label="Disponível Para os Tipos"
                            value={field.value || []}
                            onChange={e =>
                              form.setFieldValue('tiposDisponiveis', e.target.value)
                            }
                            renderValue={selecionados => selecionados.join(', ')}
                            sx={selectSx}
                            MenuProps={menuPropsSx}
                          >
                            {TIPOS_PERSONAGEM.map(tipo => (
                              <MenuItem
                                key={tipo}
                                value={tipo}
                                sx={{
                                  '&:hover': {
                                    background: 'rgba(41, 182, 246, 0.16)',
                                  },
                                  '&.Mui-selected': {
                                    background:
                                      'linear-gradient(90deg, rgba(124, 77, 255, 0.32), rgba(41, 182, 246, 0.18))',
                                    color: '#fff',
                                  },
                                }}
                              >
                                <Checkbox
                                  checked={field.value?.includes(tipo)}
                                  sx={{
                                    color: 'rgba(41, 182, 246, 0.7)',
                                    '&.Mui-checked': {
                                      color: '#29B6F6',
                                    },
                                  }}
                                />
                                <ListItemText primary={tipo} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Field>

                    <FastField
                      as={TextField}
                      name="descricao"
                      label="Descrição"
                      fullWidth
                      multiline
                      rows={6}
                      error={touched.descricao && Boolean(errors.descricao)}
                      helperText={touched.descricao && errors.descricao}
                      sx={{
                        ...inputSx,
                        '& .MuiOutlinedInput-root': {
                          ...inputSx['& .MuiOutlinedInput-root'],
                          minHeight: '180px',
                          alignItems: 'flex-start',
                          py: 1.25,
                        },
                      }}
                    />
                  </ClasseFormFieldColumn>

                  <ImagePreviewPanel src={values.linkImagem} alt="Preview da classe" />
                </ClasseFormContentGrid>
              </ClasseFormPanel>

              {/* Seção: Atributos Básicos */}
              <AtributosCard elevation={0}>
                <AtributosHeader>
                  <AtributosHeaderRow>
                    <ShieldOutlinedIcon sx={{ color: '#22d3ee', fontSize: '1.25rem' }} />
                    <Typography
                      sx={{
                        color: '#22d3ee',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                      }}
                    >
                      Atributos Básicos
                    </Typography>
                  </AtributosHeaderRow>
                  <AtributosHeaderLine />
                </AtributosHeader>
                <AtributosGrid
                  sx={{
                    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                    '@media (max-width: 900px)': {
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    },
                    '@media (max-width: 600px)': {
                      gridTemplateColumns: '1fr',
                    },
                  }}
                >
                  <FastField
                    as={TextField}
                    name="atributosBasicos.forca"
                    fullWidth
                    size="small"
                    label={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.75,
                          color: '#f8fafc',
                        }}
                      >
                        <FitnessCenterIcon sx={{ color: '#22d3ee', fontSize: '1.18rem' }} />
                        <Typography sx={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc' }}>
                          Força
                        </Typography>
                      </Box>
                    }
                    slotProps={{ inputLabel: attributeLabelProps }}
                    sx={attributeFieldSx}
                  />
                  <FastField
                    as={TextField}
                    name="atributosBasicos.agilidade"
                    fullWidth
                    size="small"
                    label={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.75,
                          color: '#f8fafc',
                        }}
                      >
                        <DirectionsRunIcon sx={{ color: '#22d3ee', fontSize: '1.18rem' }} />
                        <Typography sx={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc' }}>
                          Agilidade
                        </Typography>
                      </Box>
                    }
                    slotProps={{ inputLabel: attributeLabelProps }}
                    sx={attributeFieldSx}
                  />
                  <FastField
                    as={TextField}
                    name="atributosBasicos.percepcao"
                    fullWidth
                    size="small"
                    label={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.75,
                          color: '#f8fafc',
                        }}
                      >
                        <VisibilityIcon sx={{ color: '#22d3ee', fontSize: '1.18rem' }} />
                        <Typography sx={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc' }}>
                          Percepção
                        </Typography>
                      </Box>
                    }
                    slotProps={{ inputLabel: attributeLabelProps }}
                    sx={attributeFieldSx}
                  />
                  <FastField
                    as={TextField}
                    name="atributosBasicos.vitalidade"
                    fullWidth
                    size="small"
                    label={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.75,
                          color: '#f8fafc',
                        }}
                      >
                        <FavoriteIcon sx={{ color: '#22d3ee', fontSize: '1.18rem' }} />
                        <Typography sx={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc' }}>
                          Vitalidade
                        </Typography>
                      </Box>
                    }
                    slotProps={{ inputLabel: attributeLabelProps }}
                    sx={attributeFieldSx}
                  />
                  <FastField
                    as={TextField}
                    name="atributosBasicos.inteligencia"
                    fullWidth
                    size="small"
                    label={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.75,
                          color: '#f8fafc',
                        }}
                      >
                        <PsychologyIcon sx={{ color: '#22d3ee', fontSize: '1.18rem' }} />
                        <Typography sx={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc' }}>
                          Inteligência
                        </Typography>
                      </Box>
                    }
                    slotProps={{ inputLabel: attributeLabelProps }}
                    sx={attributeFieldSx}
                  />
                </AtributosGrid>
              </AtributosCard>

              {/* Seção: Habilidades Básicas */}
              <Paper elevation={0} sx={skillSectionSx}>
                <SectionTitle>Habilidades Básicas</SectionTitle>
                <FieldArray name="habilidadesBasicas">
                  {({ push, remove }) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1.5 }}>
                      {values.habilidadesBasicas.map((hab, idx) => (
                        <Box key={habilidadesBasicasKeys.keys[idx] ?? idx} sx={skillCardSx}>
                          <Box sx={skillHeaderSx}>
                            <Typography sx={skillTitleSx}>
                              Habilidade #{idx + 1}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => {
                                habilidadesBasicasKeys.removeKey(idx);
                                remove(idx);
                              }}
                              sx={deleteSkillButtonSx}
                              aria-label="Remover habilidade"
                            >
                              ✕
                            </IconButton>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FastField
                              as={TextField}
                              name={`habilidadesBasicas[${idx}].nome`}
                              label="Nome da Habilidade"
                              fullWidth
                              size="small"
                              sx={skillFieldSx}
                            />
                            <FastField
                              as={TextField}
                              name={`habilidadesBasicas[${idx}].descricao`}
                              label="Descrição da Habilidade"
                              fullWidth
                              multiline
                              rows={2}
                              size="small"
                              sx={skillTextareaSx}
                            />
                            <FieldArray name={`habilidadesBasicas[${idx}].bonus`}>
                              {({ push: pushBonus, remove: removeBonus }) => (
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                      Bônus
                                    </Typography>
                                    <Button onClick={() => pushBonus('')} sx={addBonusButtonSx}>
                                      + Adicionar
                                    </Button>
                                  </Box>
                                  {hab.bonus.map((_, bIdx) => (
                                    <Box key={bIdx} sx={bonusItemSx}>
                                      <FastField
                                        as={TextField}
                                        name={`habilidadesBasicas[${idx}].bonus[${bIdx}]`}
                                        label={`Bônus ${bIdx + 1}`}
                                        fullWidth
                                        size="small"
                                        sx={skillFieldSx}
                                      />
                                      <IconButton
                                        size="small"
                                        onClick={() => removeBonus(bIdx)}
                                        sx={removeBonusButtonSx}
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
                        sx={skillAddButtonSx}
                      >
                        + Adicionar Habilidade
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              </Paper>

              {/* Seção: Habilidades Avançadas */}
              <Paper elevation={0} sx={skillSectionSx}>
                <SectionTitle>Habilidades Avançadas</SectionTitle>
                <FieldArray name="habilidadesAvancadas">
                  {({ push, remove }) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1.5 }}>
                      {values.habilidadesAvancadas.map((hab, idx) => (
                        <Box key={habilidadesAvancadasKeys.keys[idx] ?? idx} sx={skillCardSx}>
                          <Box sx={skillHeaderSx}>
                            <Typography sx={skillTitleSx}>
                              Habilidade Avançada #{idx + 1}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => {
                                habilidadesAvancadasKeys.removeKey(idx);
                                remove(idx);
                              }}
                              sx={deleteSkillButtonSx}
                              aria-label="Remover habilidade"
                            >
                              ✕
                            </IconButton>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FastField
                              as={TextField}
                              name={`habilidadesAvancadas[${idx}].nome`}
                              label="Nome da Habilidade"
                              fullWidth
                              size="small"
                              sx={skillFieldSx}
                            />
                            <FastField
                              as={TextField}
                              name={`habilidadesAvancadas[${idx}].descricao`}
                              label="Descrição da Habilidade"
                              fullWidth
                              multiline
                              rows={2}
                              size="small"
                              sx={skillTextareaSx}
                            />
                            <FieldArray name={`habilidadesAvancadas[${idx}].bonus`}>
                              {({ push: pushBonus, remove: removeBonus }) => (
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                      Bônus
                                    </Typography>
                                    <Button onClick={() => pushBonus('')} sx={addBonusButtonSx}>
                                      + Adicionar
                                    </Button>
                                  </Box>
                                  {hab.bonus.map((_, bIdx) => (
                                    <Box key={bIdx} sx={bonusItemSx}>
                                      <FastField
                                        as={TextField}
                                        name={`habilidadesAvancadas[${idx}].bonus[${bIdx}]`}
                                        label={`Bônus ${bIdx + 1}`}
                                        fullWidth
                                        size="small"
                                        sx={skillFieldSx}
                                      />
                                      <IconButton
                                        size="small"
                                        onClick={() => removeBonus(bIdx)}
                                        sx={removeBonusButtonSx}
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
                        sx={skillAddButtonSx}
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
