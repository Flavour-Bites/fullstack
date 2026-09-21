import 'dotenv/config';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Full-app tests build the real Express stack, which registers the Telegram
// webhook route and therefore constructs a grammy Bot. Production fails fast
// with a clear message via validateEnv(); tests get a hermetic placeholder so
// CI (no .env) is deterministic on any runner.
process.env.TELEGRAM_BOT_TOKEN ??= 'ci-test-bot-token';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
    Link: ({ children, to, className, ...props }: any) => React.createElement('a', { href: to, className, ...props }, children),
    NavLink: ({ children, to, className, ...props }: any) => React.createElement('a', { href: to, className, ...props }, children),
  };
});

// Polyfill matchMedia which is often missing in jsdom
if (typeof window !== 'undefined') {
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
}
