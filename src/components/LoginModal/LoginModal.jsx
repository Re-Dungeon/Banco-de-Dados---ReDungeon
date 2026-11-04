import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
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

const LoginModal = ({ open, onClose, onSuccess, isClosing = false }) => {
  const [firebaseError, setFirebaseError] = useState('');
  const { login } = useAuth();

  const handleClose = () => {
    if (isClosing) {
      return;
    }

    setFirebaseError('');
    onClose();
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setFirebaseError('');
    try {
      await login(values.email, values.password);
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
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
      className={isClosing ? 'redungeon-login-dialog redungeon-login-dialog--closing' : 'redungeon-login-dialog'}
      aria-labelledby="login-modal-title"
      transitionDuration={{ enter: 220, exit: 180 }}
    >
      <StyledDialogContent>
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton
            onClick={handleClose}
            aria-label="Fechar"
            size="small"
            sx={{
              color: 'rgba(148, 163, 184, 0.9)',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.45)',
              border: '1px solid rgba(148, 163, 184, 0.14)',
              transition: 'all 0.18s ease',
              '&:hover': {
                color: '#e2e8f0',
                background: 'rgba(59,130,246,0.12)',
                borderColor: 'rgba(96, 165, 250, 0.35)',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.25,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 3.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'linear-gradient(135deg, rgba(111, 45, 168, 0.9) 0%, rgba(59, 130, 246, 0.35) 100%)',
              boxShadow:
                '0 14px 32px rgba(111, 45, 168, 0.22), inset 0 1px 0 rgba(255,255,255,0.2)',
              border: '1px solid rgba(148, 163, 184, 0.24)',
            }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2.75C9.10051 2.75 6.75 5.10051 6.75 8V9.5H6C4.89543 9.5 4 10.3954 4 11.5V18.5C4 19.6046 4.89543 20.5 6 20.5H18C19.1046 20.5 20 19.6046 20 18.5V11.5C20 10.3954 19.1046 9.5 18 9.5H17.25V8C17.25 5.10051 14.8995 2.75 12 2.75ZM12 4.75C14.0711 4.75 15.75 6.42893 15.75 8.5V9.5H8.25V8.5C8.25 6.42893 9.92893 4.75 12 4.75ZM9.5 13.5C10.3284 13.5 11 14.1716 11 15C11 15.8284 10.3284 16.5 9.5 16.5C8.67157 16.5 8 15.8284 8 15C8 14.1716 8.67157 13.5 9.5 13.5ZM14.5 13.5C15.3284 13.5 16 14.1716 16 15C16 15.8284 15.3284 16.5 14.5 16.5C13.6716 16.5 13 15.8284 13 15C13 14.1716 13.6716 13.5 14.5 13.5Z"
                fill="#F8FAFC"
              />
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
            <Form style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Field name="email">
                {({ field }) => (
                  <StyledTextField
                    {...field}
                    placeholder="E-mail"
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
                    placeholder="Senha"
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
  onSuccess: PropTypes.func,
  isClosing: PropTypes.bool,
};

export default LoginModal;
