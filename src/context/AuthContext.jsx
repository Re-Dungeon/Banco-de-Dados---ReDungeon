import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from 'service/firebase';
import { DEFAULT_USER_SETTINGS, getUserSettings } from 'service/storage';
import usePermissions from 'hooks/usePermissions';

const AuthContext = createContext(null);

const adjustHexColor = (hex, amount) => {
  const normalized = hex.replace('#', '');
  const safe = normalized.length === 3
    ? normalized
        .split('')
        .map(part => part + part)
        .join('')
    : normalized;

  const number = Number.parseInt(safe, 16);
  const channels = [
    (number >> 16) & 255,
    (number >> 8) & 255,
    number & 255,
  ].map(channel => {
    const next = Math.max(0, Math.min(255, channel + amount));
    return next.toString(16).padStart(2, '0');
  });

  return `#${channels.join('')}`.toUpperCase();
};

const applySavedTheme = settings => {
  const nextTheme = 'dark';
  const accent = settings?.corDestaque || '#6F2DA8';
  const primaryDark = adjustHexColor(accent, -28);
  const primaryLight = adjustHexColor(accent, 28);

  document.documentElement.setAttribute('data-theme', nextTheme);
  document.documentElement.style.setProperty('--color-accent', accent);
  document.documentElement.style.setProperty('--color-primary', accent);
  document.documentElement.style.setProperty('--color-primary-dark', primaryDark);
  document.documentElement.style.setProperty('--color-primary-light', primaryLight);
  document.documentElement.style.setProperty('--accent-primary', accent);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState(DEFAULT_USER_SETTINGS);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const requestIdRef = useRef(0);

  const resetUserSettings = useCallback(() => {
    setUserSettings(DEFAULT_USER_SETTINGS);
    applySavedTheme(DEFAULT_USER_SETTINGS);
  }, []);

  const refreshUserPreferences = useCallback(
    async (uid = currentUser?.uid, overrideSettings) => {
      if (!uid) {
        resetUserSettings();
        return DEFAULT_USER_SETTINGS;
      }

      if (overrideSettings) {
        setUserSettings(overrideSettings);
        applySavedTheme(overrideSettings);
        return overrideSettings;
      }

      const requestId = ++requestIdRef.current;
      setLoadingPreferences(true);

      try {
        const nextSettings = await getUserSettings(uid);

        if (requestId !== requestIdRef.current) {
          return nextSettings;
        }

        setUserSettings(nextSettings);
        applySavedTheme(nextSettings);
        return nextSettings;
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error('[AuthContext] refreshUserPreferences failed', {
            code: error?.code ?? null,
            message: error?.message ?? String(error),
            operation: 'getUserSettings(uid)',
          });
        }

        if (requestId !== requestIdRef.current) {
          return DEFAULT_USER_SETTINGS;
        }

        resetUserSettings();
        return DEFAULT_USER_SETTINGS;
      } finally {
        if (requestId === requestIdRef.current) {
          setLoadingPreferences(false);
        }
      }
    },
    [currentUser, resetUserSettings],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setLoading(false);

      if (!user?.uid) {
        requestIdRef.current += 1;
        setCurrentUser(null);
        setLoadingPreferences(false);
        resetUserSettings();
        return;
      }

      setCurrentUser(user);
      setLoadingPreferences(true);
      void refreshUserPreferences(user.uid);
    });

    return () => unsubscribe();
  }, [refreshUserPreferences, resetUserSettings]);

  const login = useCallback(
    (email, password) => signInWithEmailAndPassword(auth, email, password),
    [],
  );

  const signup = useCallback(
    (email, password) => createUserWithEmailAndPassword(auth, email, password),
    [],
  );

  const loginWithGoogle = useCallback(
    () => signInWithPopup(auth, googleProvider),
    [],
  );

  const logout = useCallback(async () => {
    requestIdRef.current += 1;
    setLoadingPreferences(false);
    await signOut(auth);
  }, []);

  const { isAdmin, allowedUniversos, loadingPermissions, canCreate, canWrite } =
    usePermissions(currentUser);

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      userSettings,
      loadingPreferences,
      refreshUserPreferences,
      login,
      signup,
      loginWithGoogle,
      logout,
      isAdmin,
      allowedUniversos,
      loadingPermissions,
      canCreate,
      canWrite,
    }),
    [
      currentUser,
      loading,
      userSettings,
      loadingPreferences,
      refreshUserPreferences,
      login,
      signup,
      loginWithGoogle,
      logout,
      isAdmin,
      allowedUniversos,
      loadingPermissions,
      canCreate,
      canWrite,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
