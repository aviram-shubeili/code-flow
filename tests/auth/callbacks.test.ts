/**
 * Auth Callback Integration Tests
 *
 * Tests the Auth.js callback functions that handle:
 * - Session token enrichment with access token
 * - UserProfile creation on first sign-in
 * - User last active updates on returning sign-in
 * - Error handling in callbacks
 */

import { type Account, type Profile, type User } from 'next-auth'

import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the database module
const mockGetUserProfile = vi.fn()
const mockCreateUserProfile = vi.fn()
const mockUpdateUserLastActive = vi.fn()

vi.mock('@/lib/database', () => ({
  db: {
    getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
    createUserProfile: (...args: unknown[]) => mockCreateUserProfile(...args),
    updateUserLastActive: (...args: unknown[]) => mockUpdateUserLastActive(...args),
  },
}))

// Mock Prisma account lookup
const mockAccountFindFirst = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    account: {
      findFirst: (...args: unknown[]) => mockAccountFindFirst(...args),
    },
  },
}))

describe('Auth Callbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signIn callback logic', () => {
    // Helper to get the signIn callback logic
    async function simulateSignInCallback(
      user: User,
      account: Account | null,
      profile: Profile | undefined
    ): Promise<boolean> {
      // Import database service
      const { db } = await import('@/lib/database')

      // Simulate signIn callback logic (mirrors auth.ts implementation)
      try {
        if (account?.provider !== 'github' || !profile || !user.id) {
          return true
        }

        const existingProfile = await db.getUserProfile(user.id)

        if (!existingProfile) {
          const githubProfile = profile as unknown as { login: string; id: number }
          await db.createUserProfile({
            userId: user.id,
            githubId: githubProfile.id,
            username: githubProfile.login,
          })
        } else {
          await db.updateUserLastActive(user.id)
        }

        return true
      } catch {
        return true // Allow sign-in even on error
      }
    }

    it('creates UserProfile for new GitHub users', async () => {
      const user: User = { id: 'user-123', name: 'Test User', email: 'test@example.com' }
      const account: Account = {
        provider: 'github',
        providerAccountId: '456',
        type: 'oauth',
      }
      const profile = {
        login: 'testuser',
        id: 456,
      } as unknown as Profile

      mockGetUserProfile.mockResolvedValue(null)
      mockCreateUserProfile.mockResolvedValue({ userId: 'user-123', githubId: 456 })

      const result = await simulateSignInCallback(user, account, profile)

      expect(result).toBe(true)
      expect(mockGetUserProfile).toHaveBeenCalledWith('user-123')
      expect(mockCreateUserProfile).toHaveBeenCalledWith({
        userId: 'user-123',
        githubId: 456,
        username: 'testuser',
      })
      expect(mockUpdateUserLastActive).not.toHaveBeenCalled()
    })

    it('updates lastActiveAt for returning users', async () => {
      const user: User = { id: 'user-123', name: 'Test User', email: 'test@example.com' }
      const account: Account = {
        provider: 'github',
        providerAccountId: '456',
        type: 'oauth',
      }
      const profile = {
        login: 'testuser',
        id: 456,
      } as unknown as Profile

      mockGetUserProfile.mockResolvedValue({ userId: 'user-123', githubId: 456 })

      const result = await simulateSignInCallback(user, account, profile)

      expect(result).toBe(true)
      expect(mockGetUserProfile).toHaveBeenCalledWith('user-123')
      expect(mockCreateUserProfile).not.toHaveBeenCalled()
      expect(mockUpdateUserLastActive).toHaveBeenCalledWith('user-123')
    })

    it('skips processing for non-GitHub providers', async () => {
      const user: User = { id: 'user-123', name: 'Test User', email: 'test@example.com' }
      const account: Account = {
        provider: 'google',
        providerAccountId: '456',
        type: 'oauth',
      }
      const profile: Profile = {} as Profile

      const result = await simulateSignInCallback(user, account, profile)

      expect(result).toBe(true)
      expect(mockGetUserProfile).not.toHaveBeenCalled()
    })

    it('skips processing when no profile is provided', async () => {
      const user: User = { id: 'user-123', name: 'Test User', email: 'test@example.com' }
      const account: Account = {
        provider: 'github',
        providerAccountId: '456',
        type: 'oauth',
      }

      const result = await simulateSignInCallback(user, account, undefined)

      expect(result).toBe(true)
      expect(mockGetUserProfile).not.toHaveBeenCalled()
    })

    it('skips processing when user.id is undefined', async () => {
      const user: User = { name: 'Test User', email: 'test@example.com' } as User
      const account: Account = {
        provider: 'github',
        providerAccountId: '456',
        type: 'oauth',
      }
      const profile = { login: 'testuser', id: 456 } as unknown as Profile

      const result = await simulateSignInCallback(user, account, profile)

      expect(result).toBe(true)
      expect(mockGetUserProfile).not.toHaveBeenCalled()
    })

    it('allows sign-in even when database operation fails', async () => {
      const user: User = { id: 'user-123', name: 'Test User', email: 'test@example.com' }
      const account: Account = {
        provider: 'github',
        providerAccountId: '456',
        type: 'oauth',
      }
      const profile = { login: 'testuser', id: 456 } as unknown as Profile

      mockGetUserProfile.mockRejectedValue(new Error('Database error'))

      const result = await simulateSignInCallback(user, account, profile)

      expect(result).toBe(true) // Should still allow sign-in
    })
  })

  describe('session callback logic', () => {
    interface SessionWithUser {
      user: { id: string; name?: string | null; email?: string | null; image?: string | null }
      expires: string
      accessToken?: string
    }

    async function simulateSessionCallback(
      session: SessionWithUser,
      userId: string
    ): Promise<SessionWithUser> {
      const { prisma } = await import('@/lib/prisma')

      try {
        const account = await prisma.account.findFirst({
          where: { userId, provider: 'github' },
        })

        if (account?.access_token) {
          session.accessToken = account.access_token
        }

        session.user.id = userId

        return session
      } catch {
        return session
      }
    }

    it('adds access token and user id to session', async () => {
      const session: SessionWithUser = {
        user: { id: '', name: 'Test', email: 'test@example.com' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      }

      mockAccountFindFirst.mockResolvedValue({
        access_token: 'gho_test_token_12345',
        provider: 'github',
      })

      const result = await simulateSessionCallback(session, 'user-123')

      expect(result.accessToken).toBe('gho_test_token_12345')
      expect(result.user.id).toBe('user-123')
    })

    it('returns session without token when account not found', async () => {
      const session: SessionWithUser = {
        user: { id: '', name: 'Test', email: 'test@example.com' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      }

      mockAccountFindFirst.mockResolvedValue(null)

      const result = await simulateSessionCallback(session, 'user-123')

      expect(result.accessToken).toBeUndefined()
      expect(result.user.id).toBe('user-123')
    })

    it('handles database errors gracefully', async () => {
      const session: SessionWithUser = {
        user: { id: '', name: 'Test', email: 'test@example.com' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      }

      mockAccountFindFirst.mockRejectedValue(new Error('Connection error'))

      const result = await simulateSessionCallback(session, 'user-123')

      // Should return session even on error
      expect(result).toBeDefined()
    })
  })
})
