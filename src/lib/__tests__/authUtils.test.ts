import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentUser } from '../authUtils';

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
      const mockSession = {
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      // Import and mock auth
      const authModule = await import('@/auth');
      const authMock = vi.mocked(authModule.auth);
      authMock.mockResolvedValue(mockSession as any);

      const result = await getCurrentUser();
      expect(result).toEqual(mockUser);
    });

    it('should return null when session does not exist', async () => {
      // Import and mock auth
      const authModule = await import('@/auth');
      const authMock = vi.mocked(authModule.auth);
      authMock.mockResolvedValue(null as any);

      const result = await getCurrentUser();
      expect(result).toBeNull();
    });

    it('should return null when session exists but has no user', async () => {
      const mockSession = {
        user: null,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      // Import and mock auth
      const authModule = await import('@/auth');
      const authMock = vi.mocked(authModule.auth);
      authMock.mockResolvedValue(mockSession as any);

      const result = await getCurrentUser();
      expect(result).toBeNull();
    });
  });
});
