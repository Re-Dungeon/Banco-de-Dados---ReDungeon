import React, { useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.jsx';
import { AuthProvider, useAuth } from 'context/AuthContext';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import PageLoadingScreen from 'components/PageLoadingScreen/PageLoadingScreen';
import 'common/styles/global.css';
import 'common/styles/sidebar.css';
import 'common/styles/pages.css';

const AppShell = () => {
  const { userSettings, currentUser, loading, loadingPreferences } = useAuth();
  const isAppLoading = loading || (Boolean(currentUser) && loadingPreferences);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'dark',
          primary: { main: userSettings?.corDestaque || '#6F2DA8' },
          secondary: { main: userSettings?.corDestaque || '#00D9FF' },
          background: {
            default: '#050816',
            paper: '#10182b',
          },
          text: {
            primary: '#f8fafc',
            secondary: '#94a3b8',
          },
        },
        typography: {
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: 8,
                transition: 'all 180ms ease',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                color: 'var(--text-primary)',
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                backgroundColor: 'var(--surface-elevated)',
                color: 'var(--text-primary)',
              },
            },
          },
        },
      }),
    [userSettings?.corDestaque],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <PageLoadingScreen visible={isAppLoading} />
        <App />
      </HashRouter>
    </ThemeProvider>
  );
};

export const bootstrapAppRoot = rootElement => {
  if (!rootElement) {
    throw new Error('Root element #root was not found.');
  }

  if (!rootElement.__redungeonRoot) {
    rootElement.__redungeonRoot = ReactDOM.createRoot(rootElement);
  }

  rootElement.__redungeonRoot.render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );

  return rootElement.__redungeonRoot;
};

if (import.meta.env.MODE !== 'test') {
  const rootElement = document.getElementById('root');
  bootstrapAppRoot(rootElement);
}
