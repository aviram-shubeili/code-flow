import '@testing-library/jest-dom';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Setup MSW
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  // Clean up DOM after each test
  cleanup();
  
  // Reset MSW handlers
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock environment variables
vi.mock('process', () => ({
  env: {
    NODE_ENV: 'test',
    NEXTAUTH_SECRET: 'test-secret',
    NEXTAUTH_URL: 'http://localhost:3000',
    GITHUB_CLIENT_ID: 'test-client-id',
    GITHUB_CLIENT_SECRET: 'test-client-secret',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
  },
}));