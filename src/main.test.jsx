import { beforeEach, describe, expect, it, vi } from 'vitest';

const createRootMock = vi.fn(() => ({
  render: vi.fn(),
}));

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: createRootMock,
  },
}));

describe('bootstrapAppRoot', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    createRootMock.mockClear();
  });

  it('cria uma única raiz para o container principal', async () => {
    vi.resetModules();

    const { bootstrapAppRoot } = await import('./main.jsx');
    const rootElement = document.getElementById('root');

    const firstRoot = bootstrapAppRoot(rootElement);
    const secondRoot = bootstrapAppRoot(rootElement);

    expect(createRootMock).toHaveBeenCalledTimes(1);
    expect(firstRoot).toBe(secondRoot);
  });
});
