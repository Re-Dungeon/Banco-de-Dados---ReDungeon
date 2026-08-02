import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.removeItem('redungeon:skip_delete_confirmation');
});
