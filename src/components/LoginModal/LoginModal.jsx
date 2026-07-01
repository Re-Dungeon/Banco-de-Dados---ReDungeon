import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { useAuth } from 'context/AuthContext';
import { loginSchema, signupSchema, getFirebaseErrorMessage } from './utils';
import {
  StyledDialog,
  StyledDialogContent,
  ModalTitle,
  ModalSubtitle,
  StyledTextField,
  SubmitButton,
  GoogleButton,
  Divider,
  ToggleText,
  ErrorAlert,
} from './styles';

const LoginModal = ({ open, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [firebaseError, setFirebaseError] = useState('');
  const { login, signup, loginWithGoogle } = useAuth();

  const handleToggle = () => {
    setIsLogin(prev => !prev);
    setFirebaseError('');
  };

  const handleClose = () => {
    setFirebaseError('');
    setIsLogin(true);
    onClose();
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setFirebaseError('');
    try {
      if (isLogin) {
        await login(values.email, values.password);
      } else {
        await signup(values.email, values.password);
      }
      handleClose();
    } catch (err) {
      setFirebaseError(getFirebaseErrorMessage(err.code));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setFirebaseError('');
    try {
      await loginWithGoogle();
      handleClose();
    } catch (err) {
      setFirebaseError(getFirebaseErrorMessage(err.code));
    }
  };

  const loginInitialValues = { email: '', password: '' };
  const signupInitialValues = { email: '', password: '', confirmPassword: '' };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      aria-labelledby="login-modal-title"
    >
      <StyledDialogContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', mt: -2, mr: -2 }}
        >
          <IconButton
            onClick={handleClose}
            aria-label="Fechar"
            size="small"
            sx={{
              color: 'var(--text-muted)',
              '&:hover': { color: 'var(--text-primary)' },
            }}
          >
            ✕
          </IconButton>
        </Box>

        <ModalTitle id="login-modal-title">
          {isLogin ? '🔐 Entrar' : '✨ Criar Conta'}
        </ModalTitle>
        <ModalSubtitle>
          {isLogin
            ? 'Acesse o Re:Dungeon com sua conta'
            : 'Crie sua conta no Re:Dungeon'}
        </ModalSubtitle>

        <Formik
          key={isLogin ? 'login' : 'signup'}
          initialValues={isLogin ? loginInitialValues : signupInitialValues}
          validationSchema={isLogin ? loginSchema : signupSchema}
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
                    inputProps={{ 'aria-label': 'E-mail' }}
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
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    inputProps={{ 'aria-label': 'Senha' }}
                  />
                )}
              </Field>

              {!isLogin && (
                <Field name="confirmPassword">
                  {({ field }) => (
                    <StyledTextField
                      {...field}
                      label="Confirmar Senha"
                      type="password"
                      fullWidth
                      size="small"
                      error={
                        touched.confirmPassword &&
                        Boolean(errors.confirmPassword)
                      }
                      helperText={
                        touched.confirmPassword && errors.confirmPassword
                      }
                      autoComplete="new-password"
                      inputProps={{ 'aria-label': 'Confirmar Senha' }}
                    />
                  )}
                </Field>
              )}

              {firebaseError && (
                <ErrorAlert role="alert">{firebaseError}</ErrorAlert>
              )}

              <SubmitButton
                type="submit"
                fullWidth
                disabled={isSubmitting}
                aria-label={isLogin ? 'Entrar' : 'Criar conta'}
              >
                {isSubmitting
                  ? 'Aguarde...'
                  : isLogin
                    ? 'Entrar'
                    : 'Criar Conta'}
              </SubmitButton>
            </Form>
          )}
        </Formik>

        <Divider>ou</Divider>

        <GoogleButton
          fullWidth
          onClick={handleGoogleLogin}
          aria-label="Entrar com Google"
          startIcon={<span aria-hidden="true">G</span>}
        >
          Continuar com Google
        </GoogleButton>

        <ToggleText>
          {isLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
          <span
            onClick={handleToggle}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleToggle()}
          >
            {isLogin ? 'Cadastre-se' : 'Entrar'}
          </span>
        </ToggleText>
      </StyledDialogContent>
    </StyledDialog>
  );
};

LoginModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LoginModal;
