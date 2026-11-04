import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(
  value => typeof value === 'string' && value.trim().length > 0,
);

if (!hasFirebaseConfig && import.meta.env.MODE !== 'test') {
  throw new Error(
    'Firebase configuration is missing. Set the VITE_FIREBASE_* variables before starting the app.',
  );
}

const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;

const noopGoogleProvider = {
  setCustomParameters: () => undefined,
};

export const auth = hasFirebaseConfig ? getAuth(app) : { currentUser: null };
export const googleProvider = hasFirebaseConfig
  ? new GoogleAuthProvider()
  : noopGoogleProvider;
export const db = hasFirebaseConfig ? getFirestore(app) : {};
