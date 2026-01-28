import { beforeEach, vi } from 'vitest'

import '@testing-library/jest-dom'

// Set DATABASE_URL for tests (mocked, not used for actual connections)
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

// Set Auth.js environment variables for tests
process.env.AUTH_SECRET = 'test-secret'
process.env.AUTH_GITHUB_ID = 'test-github-id'
process.env.AUTH_GITHUB_SECRET = 'test-github-secret'

// Mock Next.js server module
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: new Headers(init?.headers),
    })),
    next: vi.fn(),
    redirect: vi.fn(),
    rewrite: vi.fn(),
  },
  userAgent: vi.fn(),
}))

// Mock window.matchMedia which is not available in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock window.ResizeObserver which is not available in JSDOM
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock database connection check for unit tests
// In unit tests, we don't have a real database connection
vi.mock('@/lib/database', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  const actualDb = actual.db as Record<string, unknown>
  return {
    ...actual,
    db: {
      ...actualDb,
      checkConnection: vi.fn().mockResolvedValue(true),
    },
  }
})

// Setup global test environment
beforeEach(() => {
  vi.clearAllMocks()
})
