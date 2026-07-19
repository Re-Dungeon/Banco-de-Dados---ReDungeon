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
import { Formik, Form, FastField, Field } from 'formik';
import { addVeiaAstral, updateVeiaAstral, getUniversos } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { VEIA_ASTRAL_SCHEMA, VEIA_ASTRAL_INITIAL_VALUES } from './utils';
import { DIVINDADES_VEIAS_ASTRAIS } from 'common/constants/constants';

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

const NovaVeiaAstral = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canCreate, canWrite, isAdmin, allowedUniversos, loadingPermissions } =
    useAuth();
  const veiaAstralParaEditar = location.state?.veiaAstral ?? null;
  const isEditing = Boolean(veiaAstralParaEditar);
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
      ? canWrite(veiaAstralParaEditar?.universo)
      : canCreate();
    if (!allowed) navigate(ROUTE_PATHS.VEIAS_ASTRAIS);
  }, [
    loadingPermissions,
    isEditing,
    canWrite,
    canCreate,
    veiaAstralParaEditar,
    navigate,
  ]);

  const editInitialValues = veiaAstralParaEditar
    ? {
        ...VEIA_ASTRAL_INITIAL_VALUES,
        ...veiaAstralParaEditar,
      }
    : VEIA_ASTRAL_INITIAL_VALUES;

  const filteredUniversos = isAdmin
    ? universos
    : universos.filter(u => allowedUniversos.includes(u.id));

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateVeiaAstral(veiaAstralParaEditar.id, values);
    } else {
      await addVeiaAstral(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.VEIAS_ASTRAIS);
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

  if (loading) return null;

  return (
    <Box className="page-container">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          onClick={() => navigate(ROUTE_PATHS.VEIAS_ASTRAIS)}
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
            {isEditing ? 'Editar Veia Astral' : 'Nova Veia Astral'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            {isEditing
              ? `Editando os dados de ${veiaAstralParaEditar.nome}`
              : 'Preencha os dados da nova veia astral'}
          </Typography>
        </Box>
      </Box>

      <Formik
        initialValues={editInitialValues}
        validationSchema={VEIA_ASTRAL_SCHEMA}
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
                            label="Nome"
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
                        gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' },
                        gap: 2,
                      }}
                    >
                      <Field name="divindade">
                        {({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel sx={labelSx}>
                              Divindade/Constelação
                            </InputLabel>
                            <Select
                              {...field}
                              label="Divindade/Constelação"
                              sx={selectSx}
                              MenuProps={menuPropsSx}
                            >
                              <MenuItem value="">Nenhuma</MenuItem>
                              {DIVINDADES_VEIAS_ASTRAIS.map(divindade => (
                                <MenuItem key={divindade} value={divindade}>
                                  {divindade}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </Field>

                      <FastField name="nivel">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Nível"
                            type="number"
                            fullWidth
                            error={touched.nivel && Boolean(errors.nivel)}
                            helperText={touched.nivel && errors.nivel}
                            sx={slotInputSx}
                          />
                        )}
                      </FastField>
                    </Box>

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

                    <FastField name="linkImagem">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Link da Imagem"
                          fullWidth
                          placeholder="https://..."
                          error={
                            touched.linkImagem && Boolean(errors.linkImagem)
                          }
                          helperText={touched.linkImagem && errors.linkImagem}
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
                          sx={slotInputSx}
                        />
                      )}
                    </FastField>

                    <FastField name="aprimoramento">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Aprimoramento"
                          fullWidth
                          multiline
                          rows={4}
                          sx={slotInputSx}
                        />
                      )}
                    </FastField>
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
                          alt="Preview da veia astral"
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
                  onClick={() => navigate(ROUTE_PATHS.VEIAS_ASTRAIS)}
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
                  {isEditing ? 'Salvar Alterações' : 'Salvar Veia Astral'}
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default NovaVeiaAstral;
