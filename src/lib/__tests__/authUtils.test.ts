import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type MockedFunction,
} from 'vitest';
import { getCurrentUser } from '../authUtils';
import type { Session } from 'next-auth';

// Mock the auth module
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

describe('authUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return user when session exists', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };
      const mockSession: Session = {
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      // Import and mock auth
      const authModule = await import('@/auth');
      const authMock = vi.mocked(authModule.auth) as unknown as MockedFunction<
        () => Promise<Session | null>
      >;
      authMock.mockResolvedValue(mockSession);

      const result = await getCurrentUser();
      expect(result).toEqual(mockUser);
    });

    it('should return null when session does not exist', async () => {
      // Import and mock auth
      const authModule = await import('@/auth');
      const authMock = vi.mocked(authModule.auth) as unknown as MockedFunction<
        () => Promise<Session | null>
      >;
      authMock.mockResolvedValue(null);

      const result = await getCurrentUser();
      expect(result).toBeNull();
    });

    it('should return null when session user is undefined', async () => {
      const mockSession: Partial<Session> = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        // user is undefined, which means no user in session
      };

      // Import and mock auth
      const authModule = await import('@/auth');
      const authMock = vi.mocked(authModule.auth) as unknown as MockedFunction<
        () => Promise<Session | null>
      >;
      authMock.mockResolvedValue(mockSession as Session);

      const result = await getCurrentUser();
      expect(result).toBeNull();
    });
  });
});
