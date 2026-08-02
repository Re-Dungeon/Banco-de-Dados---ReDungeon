import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import { useAuth } from 'context/AuthContext';
import { loginSchema, getFirebaseErrorMessage } from './utils';
import {
  StyledDialog,
  StyledDialogContent,
  ModalTitle,
  ModalSubtitle,
  StyledTextField,
  SubmitButton,
  ErrorAlert,
} from './styles';

const LoginModal = ({ open, onClose }) => {
  const [firebaseError, setFirebaseError] = useState('');
  const { login } = useAuth();

  const handleClose = () => {
    setFirebaseError('');
    onClose();
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setFirebaseError('');
    try {
      await login(values.email, values.password);
      handleClose();
    } catch (err) {
      setFirebaseError(getFirebaseErrorMessage(err.code));
    } finally {
      setSubmitting(false);
    }
  };

  const loginInitialValues = { email: '', password: '' };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      aria-labelledby="login-modal-title"
    >
        <StyledDialogContent>
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton
            onClick={handleClose}
            aria-label="Fechar"
            size="small"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              width: 28,
              height: 28,
              mt: -1,
              mr: -1,
              '&:hover': { color: '#3B82F6', background: 'rgba(59,130,246,0.06)' },
            }}
          >
            ✕
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(59,130,246,0.12)',
              boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.02), 0 6px 20px rgba(59,130,246,0.04)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1C9.23858 1 7 3.23858 7 6V9H6C4.89543 9 4 9.89543 4 11V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V11C20 9.89543 19.1046 9 18 9H17V6C17 3.23858 14.7614 1 12 1Z" fill="#FFB86B"/>
            </svg>
          </Box>
          <ModalTitle id="login-modal-title">Entrar</ModalTitle>
          <ModalSubtitle>Acesse o Re:Dungeon com sua conta</ModalSubtitle>
        </Box>

        <Formik
          initialValues={loginInitialValues}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field name="email">
                {({ field }) => (
                  <StyledTextField
                    {...field}
                    label="E-mail"
                    type="email"
                    fullWidth
                    size="small"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    autoComplete="email"
                    
                  />
                )}
              </Field>

              <Field name="password">
                {({ field }) => (
                  <StyledTextField
                    {...field}
                    label="Senha"
                    type="password"
                    fullWidth
                    size="small"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    autoComplete="current-password"
                    
                  />
                )}
              </Field>

              {firebaseError && (
                <ErrorAlert role="alert">{firebaseError}</ErrorAlert>
              )}

              <SubmitButton
                type="submit"
                fullWidth
                disabled={isSubmitting}
                aria-label="Entrar"
              >
                {isSubmitting ? 'Aguarde...' : 'Entrar'}
              </SubmitButton>
            </Form>
          )}
        </Formik>
      </StyledDialogContent>
    </StyledDialog>
  );
};

LoginModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LoginModal;
