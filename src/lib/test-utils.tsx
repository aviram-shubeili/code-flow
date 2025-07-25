import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import type { Session } from 'next-auth';

// Mock session for testing
const mockSession: Session = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://avatars.githubusercontent.com/u/123456?v=4',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: Session | null;
}

// Simple wrapper that doesn't require next-auth
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <div data-testid='test-wrapper'>{children}</div>;
}

// Custom render function that includes necessary providers
function customRender(
  ui: ReactElement,
  { ...renderOptions }: CustomRenderOptions = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <TestWrapper>{children}</TestWrapper>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Helper functions for common test scenarios
export const renderWithoutSession = (
  ui: ReactElement,
  options?: RenderOptions,
) => {
  return customRender(ui, { session: null, ...options });
};

export const renderWithSession = (
  ui: ReactElement,
  session?: Session,
  options?: RenderOptions,
) => {
  return customRender(ui, { session: session || mockSession, ...options });
};

// Mock session utilities
export const createMockSession = (
  overrides: Partial<Session> = {},
): Session => ({
  ...mockSession,
  ...overrides,
});

export const createMockUser = (overrides: Partial<Session['user']> = {}) => ({
  ...mockSession.user,
  ...overrides,
});
