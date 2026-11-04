import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: class GoogleAuthProvider {},
  getAuth: vi.fn(() => ({ currentUser: null })),
  onAuthStateChanged: vi.fn(() => () => {}),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-server-timestamp'),
  updateDoc: vi.fn(),
}));

vi.mock('service/firebase', () => ({
  auth: { currentUser: null },
  googleProvider: { setCustomParameters: () => undefined },
  db: {},
}));

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.removeItem('redungeon:skip_delete_confirmation');
});
