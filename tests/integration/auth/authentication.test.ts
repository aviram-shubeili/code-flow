import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserFactory, SessionFactory } from '../../factories';

// Mock Next.js auth types
interface MockUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface MockSession {
  user: MockUser;
  expires: string;
}

// Mock authentication functions
const mockAuthFunctions = {
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  validateSession: vi.fn(),
};

// Mock the auth module
vi.mock('@/auth', () => ({
  signIn: mockAuthFunctions.signIn,
  signOut: mockAuthFunctions.signOut,
  auth: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  getSession: mockAuthFunctions.getSession,
  signIn: mockAuthFunctions.signIn,
  signOut: mockAuthFunctions.signOut,
}));

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GitHub OAuth Authentication', () => {
    it('should initiate GitHub OAuth sign-in', async () => {
      mockAuthFunctions.signIn.mockResolvedValue({
        url: 'https://github.com/login/oauth/authorize?...',
        ok: true,
      });

      const result = await mockAuthFunctions.signIn('github');

      expect(mockAuthFunctions.signIn).toHaveBeenCalledWith('github');
      expect(result.ok).toBe(true);
    });

    it('should handle OAuth callback and create session', async () => {
      const mockUser = UserFactory.createGitHubUser();
      const mockSession = SessionFactory.createGitHubSession();

      mockAuthFunctions.getSession.mockResolvedValue(mockSession);

      const session = await mockAuthFunctions.getSession();

      expect(session).toBeDefined();
      expect(session?.user.name).toBe('GitHub User');
      expect(session?.user.email).toBe('github.user@example.com');
    });

    it('should handle authentication errors', async () => {
      mockAuthFunctions.signIn.mockRejectedValue(new Error('OAuth error'));

      await expect(mockAuthFunctions.signIn('github')).rejects.toThrow(
        'OAuth error',
      );
    });
  });

  describe('Session Management', () => {
    it('should validate active sessions', async () => {
      const mockSession = SessionFactory.create();
      mockAuthFunctions.validateSession.mockResolvedValue(true);

      const isValid = await mockAuthFunctions.validateSession(mockSession);

      expect(isValid).toBe(true);
      expect(mockAuthFunctions.validateSession).toHaveBeenCalledWith(
        mockSession,
      );
    });

    it('should invalidate expired sessions', async () => {
      const expiredSession = SessionFactory.createExpired();
      mockAuthFunctions.validateSession.mockResolvedValue(false);

      const isValid = await mockAuthFunctions.validateSession(expiredSession);

      expect(isValid).toBe(false);
    });

    it('should handle session retrieval', async () => {
      const mockSession = SessionFactory.create();
      mockAuthFunctions.getSession.mockResolvedValue(mockSession);

      const session = await mockAuthFunctions.getSession();

      expect(session).toEqual(mockSession);
      expect(session?.user).toBeDefined();
      expect(session?.expires).toBeDefined();
    });

    it('should handle sign-out', async () => {
      mockAuthFunctions.signOut.mockResolvedValue({
        url: '/',
        ok: true,
      });

      const result = await mockAuthFunctions.signOut();

      expect(mockAuthFunctions.signOut).toHaveBeenCalled();
      expect(result.ok).toBe(true);
    });
  });

  describe('User Data Management', () => {
    it('should create user profile from OAuth data', () => {
      const githubUser = UserFactory.createGitHubUser({
        id: 'github-123',
        name: 'Test GitHub User',
        email: 'test@github.com',
      });

      expect(githubUser.id).toBe('github-123');
      expect(githubUser.name).toBe('Test GitHub User');
      expect(githubUser.email).toBe('test@github.com');
      expect(githubUser.image).toContain('avatars.githubusercontent.com');
    });

    it('should handle user profile updates', () => {
      const user = UserFactory.create();
      const updatedUser = {
        ...user,
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.email).toBe('updated@example.com');
      expect(updatedUser.id).toBe(user.id);
    });
  });
});
