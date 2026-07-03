import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from 'service/firebase';
import usePermissions from 'hooks/usePermissions';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);
    const unsubscribe = onAuthStateChanged(auth, user => {
      clearTimeout(timeout);
      setCurrentUser(user);
      setLoading(false);
    });
    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

  const logout = () => signOut(auth);

  const { isAdmin, allowedUniversos, loadingPermissions, canCreate, canWrite } =
    usePermissions(currentUser);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        isAdmin,
        allowedUniversos,
        loadingPermissions,
        canCreate,
        canWrite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
