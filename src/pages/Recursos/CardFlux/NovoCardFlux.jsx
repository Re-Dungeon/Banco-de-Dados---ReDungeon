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
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import { Formik, Form, FastField, Field } from 'formik';
import {
  addCardFlux,
  updateCardFlux,
  getUniversos,
  getCardFlux,
} from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { CARDFLUX_SCHEMA, CARDFLUX_INITIAL_VALUES } from './utils';
import {
  RARIDADES,
  TIPOS_CARDFLUX,
  DECKS_CARDFLUX,
  TIPOS_ATIVACAO_CARDFLUX,
} from 'common/constants/constants';

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

const NovoCardFlux = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canCreate, canWrite, isAdmin, allowedUniversos, loadingPermissions } =
    useAuth();
  const cardFluxParaEditar = location.state?.cardFlux ?? null;
  const isEditing = Boolean(cardFluxParaEditar);
  const [imgError, setImgError] = useState(false);
  const [universos, setUniversos] = useState([]);
  const [cardFluxList, setCardFluxList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUniversos(), getCardFlux()])
      .then(([universosData, cardFluxData]) => {
        setUniversos(universosData);
        setCardFluxList(cardFluxData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loadingPermissions) return;
    const allowed = isEditing
      ? canWrite(cardFluxParaEditar?.universo)
      : canCreate();
    if (!allowed) navigate(ROUTE_PATHS.CARDFLUX);
  }, [
    loadingPermissions,
    isEditing,
    canWrite,
    canCreate,
    cardFluxParaEditar,
    navigate,
  ]);

  const editInitialValues = cardFluxParaEditar
    ? {
        ...CARDFLUX_INITIAL_VALUES,
        ...cardFluxParaEditar,
        cartasVinculadas: cardFluxParaEditar.cartasVinculadas || [],
      }
    : CARDFLUX_INITIAL_VALUES;

  const filteredUniversos = isAdmin
    ? universos
    : universos.filter(u => allowedUniversos.includes(u.id));

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isEditing) {
      await updateCardFlux(cardFluxParaEditar.id, values);
    } else {
      await addCardFlux(values);
    }
    setSubmitting(false);
    navigate(ROUTE_PATHS.CARDFLUX);
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
    '& .MuiFormHelperText-root': { color: '#ef4444' },
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
      sx: {
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        maxHeight: 320,
      },
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
          onClick={() => navigate(ROUTE_PATHS.CARDFLUX)}
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
            {isEditing ? 'Editar CardFlux' : 'Novo CardFlux'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            {isEditing
              ? `Editando os dados de ${cardFluxParaEditar.nome}`
              : 'Preencha os dados do novo CardFlux'}
          </Typography>
        </Box>
      </Box>

      <Formik
        initialValues={editInitialValues}
        validationSchema={CARDFLUX_SCHEMA}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isSubmitting, setFieldValue }) => {
          const cartasDoUniverso = cardFluxList.filter(
            c =>
              c.universo === values.universo && c.id !== cardFluxParaEditar?.id,
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
                          {({ field, form }) => (
                            <FormControl fullWidth>
                              <InputLabel sx={labelSx}>Universo</InputLabel>
                              <Select
                                {...field}
                                label="Universo"
                                sx={selectSx}
                                MenuProps={menuPropsSx}
                                onChange={e => {
                                  field.onChange(e);
                                  const novoUniverso = e.target.value;
                                  const permitidas = cardFluxList.filter(
                                    c => c.universo === novoUniverso,
                                  );
                                  form.setFieldValue(
                                    'cartasVinculadas',
                                    form.values.cartasVinculadas.filter(sel =>
                                      permitidas.some(c => c.id === sel.id),
                                    ),
                                  );
                                }}
                              >
                                {filteredUniversos.map(universo => (
                                  <MenuItem
                                    key={universo.id}
                                    value={universo.id}
                                  >
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
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                          gap: 2,
                        }}
                      >
                        <Field name="tipo">
                          {({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel sx={labelSx}>Tipo</InputLabel>
                              <Select
                                {...field}
                                label="Tipo"
                                sx={selectSx}
                                MenuProps={menuPropsSx}
                              >
                                <MenuItem value="">Nenhum</MenuItem>
                                {TIPOS_CARDFLUX.map(tipo => (
                                  <MenuItem key={tipo} value={tipo}>
                                    {tipo}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </Field>

                        <Field name="raridade">
                          {({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel sx={labelSx}>Raridade</InputLabel>
                              <Select
                                {...field}
                                label="Raridade"
                                sx={selectSx}
                                MenuProps={menuPropsSx}
                              >
                                <MenuItem value="">Nenhuma</MenuItem>
                                {RARIDADES.map(raridade => (
                                  <MenuItem key={raridade} value={raridade}>
                                    {raridade}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </Field>

                        <Field name="deck">
                          {({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel sx={labelSx}>Deck</InputLabel>
                              <Select
                                {...field}
                                label="Deck"
                                sx={selectSx}
                                MenuProps={menuPropsSx}
                              >
                                <MenuItem value="">Nenhum</MenuItem>
                                {DECKS_CARDFLUX.map(deck => (
                                  <MenuItem key={deck} value={deck}>
                                    {deck}
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
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                          gap: 2,
                        }}
                      >
                        <FastField name="intensidade">
                          {({ field }) => (
                            <TextField
                              {...field}
                              label="Intensidade"
                              type="number"
                              fullWidth
                              inputProps={{ min: 0 }}
                              sx={slotInputSx}
                            />
                          )}
                        </FastField>

                        <FastField name="peso">
                          {({ field }) => (
                            <TextField
                              {...field}
                              label="Peso"
                              type="number"
                              fullWidth
                              inputProps={{ min: 0 }}
                              sx={slotInputSx}
                            />
                          )}
                        </FastField>

                        <FastField name="cd">
                          {({ field }) => (
                            <TextField
                              {...field}
                              label="CD"
                              type="number"
                              fullWidth
                              inputProps={{ min: 0 }}
                              sx={slotInputSx}
                            />
                          )}
                        </FastField>
                      </Box>

                      <FastField name="tags">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Tags"
                            fullWidth
                            placeholder="aventura, mistério, fogo"
                            helperText="Separe as tags por vírgula"
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
                            onChange={e => {
                              setImgError(false);
                              field.onChange(e);
                            }}
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
                            alt="Preview do CardFlux"
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

                {/* Seção: Narrativa */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 2,
                  }}
                >
                  <SectionTitle>Narrativa</SectionTitle>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      mt: 1.5,
                    }}
                  >
                    <FastField name="descricaoGeral">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Descrição Geral"
                          fullWidth
                          multiline
                          rows={3}
                          sx={slotInputSx}
                        />
                      )}
                    </FastField>

                    <FastField name="comoApresentar">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Como Apresentar"
                          fullWidth
                          multiline
                          rows={3}
                          sx={slotInputSx}
                        />
                      )}
                    </FastField>

                    <FastField name="mecanicasDesafios">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Mecânicas/Desafios"
                          fullWidth
                          multiline
                          rows={3}
                          sx={slotInputSx}
                        />
                      )}
                    </FastField>
                  </Box>
                </Paper>

                {/* Seção: Resultados */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 2,
                  }}
                >
                  <SectionTitle>Resultados</SectionTitle>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 2,
                      mt: 1.5,
                    }}
                  >
                    <FastField name="seConseguirem">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Se Conseguirem"
                          fullWidth
                          multiline
                          rows={3}
                          sx={slotInputSx}
                        />
                      )}
                    </FastField>

                    <FastField name="seFalharem">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Se Falharem"
                          fullWidth
                          multiline
                          rows={3}
                          sx={slotInputSx}
                        />
                      )}
                    </FastField>
                  </Box>
                </Paper>

                {/* Seção: Consequências */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 2,
                  }}
                >
                  <SectionTitle>Consequências</SectionTitle>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      mt: 1.5,
                    }}
                  >
                    <FastField name="recompensas">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Recompensas"
                          fullWidth
                          multiline
                          rows={3}
                          sx={slotInputSx}
                        />
                      )}
                    </FastField>

                    <FastField name="impactoMundo">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Impacto no Mundo"
                          fullWidth
                          multiline
                          rows={3}
                          sx={slotInputSx}
                        />
                      )}
                    </FastField>

                    <FastField name="ganchosNarrativos">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Ganchos Narrativos"
                          fullWidth
                          multiline
                          rows={3}
                          sx={slotInputSx}
                        />
                      )}
                    </FastField>
                  </Box>
                </Paper>

                {/* Seção: Encadeamento de Eventos */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 2,
                  }}
                >
                  <SectionTitle>Encadeamento de Eventos</SectionTitle>
                  <Field name="encadeamentoAtivo">
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
                        label="Ativar encadeamento de eventos"
                        sx={{ color: 'var(--text-secondary)', mt: 1 }}
                      />
                    )}
                  </Field>

                  {values.encadeamentoAtivo && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        mt: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                          gap: 2,
                        }}
                      >
                        <Field name="tipoAtivacao">
                          {({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel sx={labelSx}>
                                Tipo de Ativação
                              </InputLabel>
                              <Select
                                {...field}
                                label="Tipo de Ativação"
                                sx={selectSx}
                                MenuProps={menuPropsSx}
                              >
                                <MenuItem value="">Nenhum</MenuItem>
                                {TIPOS_ATIVACAO_CARDFLUX.map(tipo => (
                                  <MenuItem key={tipo} value={tipo}>
                                    {tipo}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </Field>

                        {values.tipoAtivacao === 'Chance' && (
                          <Box>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'var(--text-secondary)',
                                  fontWeight: 600,
                                }}
                              >
                                Porcentagem
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'var(--color-accent)',
                                  fontWeight: 700,
                                }}
                              >
                                {values.porcentagem}%
                              </Typography>
                            </Box>
                            <Slider
                              value={values.porcentagem}
                              onChange={(_, value) =>
                                setFieldValue('porcentagem', value)
                              }
                              min={0}
                              max={100}
                              step={1}
                              valueLabelDisplay="auto"
                              valueLabelFormat={v => `${v}%`}
                              sx={{
                                color: 'var(--color-accent)',
                                '& .MuiSlider-thumb': {
                                  '&:hover, &.Mui-focusVisible': {
                                    boxShadow:
                                      '0 0 0 8px rgba(0, 217, 255, 0.16)',
                                  },
                                },
                                '& .MuiSlider-rail': {
                                  background: 'var(--border-primary)',
                                },
                              }}
                            />
                          </Box>
                        )}
                      </Box>

                      <Autocomplete
                        multiple
                        options={cartasDoUniverso}
                        value={values.cartasVinculadas}
                        onChange={(_, novasCartas) =>
                          setFieldValue('cartasVinculadas', novasCartas)
                        }
                        getOptionLabel={option => option.nome ?? ''}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        disabled={!values.universo}
                        noOptionsText={
                          values.universo
                            ? 'Nenhum CardFlux encontrado neste universo'
                            : 'Selecione um Universo primeiro'
                        }
                        renderTags={(tagValue, getTagProps) =>
                          tagValue.map((option, index) => (
                            <Chip
                              {...getTagProps({ index })}
                              key={option.id}
                              label={option.nome}
                              size="small"
                              sx={{
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-primary)',
                              }}
                            />
                          ))
                        }
                        renderInput={params => (
                          <TextField
                            {...params}
                            label="Cartas Vinculadas"
                            placeholder="Buscar CardFlux..."
                            sx={slotInputSx}
                          />
                        )}
                        slotProps={{
                          paper: {
                            sx: {
                              background: 'var(--bg-card)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-primary)',
                            },
                          },
                        }}
                      />

                      <FastField name="descricaoEncadeamento">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Descrição"
                            fullWidth
                            multiline
                            rows={3}
                            sx={slotInputSx}
                          />
                        )}
                      </FastField>
                    </Box>
                  )}
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
                    onClick={() => navigate(ROUTE_PATHS.CARDFLUX)}
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
                    {isEditing ? 'Salvar Alterações' : 'Salvar CardFlux'}
                  </Button>
                </Box>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default NovoCardFlux;
