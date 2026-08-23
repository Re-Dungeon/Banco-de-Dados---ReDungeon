import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Formik, Form, FastField, Field } from 'formik';
import { addAptidao, updateAptidao } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import useEntityFormGuard from 'hooks/useEntityFormGuard';
import FormPageHeader from 'components/FormPageHeader/FormPageHeader';
import FormSelect from 'components/FormSelect/FormSelect';
import ImagePreviewPanel from 'components/ImagePreviewPanel/ImagePreviewPanel';
import FormActions from 'components/FormActions/FormActions';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import {
  APTIDAO_SCHEMA,
  APTIDAO_INITIAL_VALUES,
  NIVEL_PROGRESSAO_INICIAL,
  getAptidaoUniversos,
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

const NovaAptidao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const aptidaoParaEditar = location.state?.aptidao ?? null;
  const universoDoItem = getAptidaoUniversos(aptidaoParaEditar);

  const { isAdmin, allowedUniversos } = useAuth();
  const { universos, loadingUniversos, isEditing } = useEntityFormGuard({
    itemParaEditar: aptidaoParaEditar,
    universoDoItem,
    routeOnDeny: ROUTE_PATHS.APTIDOES,
    permitirEdicaoParcial: true,
  });

  // Aptidões aceitam associação parcial: um usuário sem acesso a todos os
  // universos já vinculados ainda pode abrir a edição para adicionar/remover
  // o(s) seu(s) próprio(s) universo(s) (ver `canTogglePartialUniverso` em
  // firestore.rules). Fora desse caso, os demais campos ficam bloqueados
  // para não gerar uma escrita que o Firestore vai rejeitar.
  const temAcessoTotal =
    !isEditing ||
    isAdmin ||
    (universoDoItem.length > 0 &&
      universoDoItem.every(id => allowedUniversos.includes(id)));

  const editInitialValues = aptidaoParaEditar
    ? {
        ...APTIDAO_INITIAL_VALUES,
        ...aptidaoParaEditar,
        universos: universoDoItem,
        progressaoNiveis: aptidaoParaEditar.progressaoNiveis || [],
      }
    : APTIDAO_INITIAL_VALUES;

  const handleSubmit = async (values, { setSubmitting }) => {
    // Sem acesso total, o select de universos só lista os universos do
    // próprio usuário — preserva os demais universos já vinculados ao invés
    // de deixar o submit removê-los silenciosamente.
    const payload = temAcessoTotal
      ? values
      : {
          ...values,
          universos: [
            ...universoDoItem.filter(id => !allowedUniversos.includes(id)),
            ...values.universos.filter(id => allowedUniversos.includes(id)),
          ],
        };

    if (isEditing) {
      await updateAptidao(aptidaoParaEditar.id, payload);
    } else {
      await addAptidao(payload);
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

      {isEditing && !temAcessoTotal && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            border: '1px solid var(--color-accent)',
            borderRadius: 2,
            background: 'var(--bg-card)',
            color: 'var(--text-secondary)',
          }}
        >
          <Typography variant="body2">
            Esta aptidão pertence a universos que você não administra. Você só
            pode adicionar ou remover os seus próprios universos nela — os
            demais campos ficam bloqueados para edição.
          </Typography>
        </Box>
      )}

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
                            disabled={!temAcessoTotal}
                            error={touched.nome && Boolean(errors.nome)}
                            helperText={touched.nome && errors.nome}
                            sx={slotInputSx}
                          />
                        )}
                      </FastField>

                      <Field name="universos">
                        {({ field, form }) => (
                          <FormSelect
                            field={field}
                            form={form}
                            multiple
                            label="Universos"
                            compactSelection
                            compactMaxVisible={2}
                            options={universos.map(universo => ({
                              value: universo.id,
                              label: universo.Nome,
                            }))}
                          />
                        )}
                      </Field>
                    </Box>

                    <FastField name="linkImagem">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Link da Imagem da Aptidão"
                          fullWidth
                          disabled={!temAcessoTotal}
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
                          disabled={!temAcessoTotal}
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
                          disabled={!temAcessoTotal}
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
                                  disabled={!temAcessoTotal}
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
                              disabled={!temAcessoTotal}
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
                              disabled={!temAcessoTotal}
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
