import { vi } from 'vitest';
import type { Session } from 'next-auth';
import { SessionFactory } from '../factories/session-factory';

// Helper functions for testing authentication scenarios
export const authTestUtils = {
  // Mock next-auth/react hooks
  mockUseSession: (session: Session | null = null) => {
    return vi.mocked(() => ({
      data: session,
      status: session ? 'authenticated' : 'unauthenticated',
      update: vi.fn(),
    }));
  },

  // Mock session loading state
  mockLoadingSession: () => {
    return vi.mocked(() => ({
      data: undefined,
      status: 'loading',
      update: vi.fn(),
    }));
  },

  // Create test session with GitHub provider
  createGitHubSession: (overrides: Partial<Session> = {}) => {
    return SessionFactory.createGitHubSession(overrides);
  },

  // Mock authentication error
  mockAuthError: (error = 'Authentication failed') => {
    return vi.mocked(() => ({
      data: null,
      status: 'unauthenticated',
      error,
      update: vi.fn(),
    }));
  },
};

// Helper functions for API testing
export const apiTestUtils = {
  // Create mock request object
  createMockRequest: (overrides: Partial<Request> = {}): Request => {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    const defaultRequest = new Request('http://localhost:3000/api/test', {
      method: 'GET',
      headers,
    });

    return {
      ...defaultRequest,
      ...overrides,
    } as Request;
  },

  // Create authenticated request with session
  createAuthenticatedRequest: (
    session: Session,
    overrides: Partial<Request> = {},
  ): Request => {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', 'Bearer test-token');
    headers.set('Cookie', `next-auth.session-token=${JSON.stringify(session)}`);

    return apiTestUtils.createMockRequest({
      headers,
      ...overrides,
    });
  },
};

// Helper functions for database testing
export const dbTestUtils = {
  // Mock database connection
  mockDbConnection: () => {
    return {
      query: vi.fn(),
      end: vi.fn(),
      connect: vi.fn(),
      release: vi.fn(),
    };
  },

  // Create test database URL
  getTestDbUrl: () => {
    return (
      process.env['DATABASE_URL'] ||
      'postgresql://test:test@localhost:5432/test_db'
    );
  },

  // Clean up test data
  cleanupTestData: async () => {
    // This would be implemented with actual database cleanup logic
    // For now, it's a placeholder
    console.log('Cleaning up test data...');
  },
};

// Helper functions for component testing
export const componentTestUtils = {
  // Wait for async operations to complete
  waitForAsyncOperations: () => {
    return new Promise((resolve) => setTimeout(resolve, 0));
  },

  // Mock router navigation
  mockRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),

  // Simulate user interaction delay
  simulateUserDelay: (ms = 100) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};
