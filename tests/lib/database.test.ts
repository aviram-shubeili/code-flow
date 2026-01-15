/**
 * Unit Tests for Database Service
 * 
 * Tests business logic methods with mocked Prisma client
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { DatabaseService } from '@/lib/database'
import type { PrismaClient, UserProfile, Repository } from '@prisma/client'

// Type for mocked Prisma client with vi.fn() methods
type MockPrismaClient = {
  userProfile: {
    create: Mock
    findUnique: Mock
    update: Mock
    delete: Mock
    deleteMany: Mock
  }
  repository: {
    findMany: Mock
    findUnique: Mock
    create: Mock
    update: Mock
    delete: Mock
    deleteMany: Mock
    createMany: Mock
  }
  $queryRaw: Mock
}

// Mock Prisma Client
const mockPrisma: MockPrismaClient = {
  userProfile: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  repository: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
  $queryRaw: vi.fn(),
}

describe('DatabaseService', () => {
  let db: DatabaseService

  beforeEach(() => {
    vi.clearAllMocks()
    db = new DatabaseService(mockPrisma as unknown as PrismaClient)
  })

  describe('User Profile Management', () => {
    it('should create a user profile', async () => {
      const mockProfile: UserProfile = {
        id: 'profile-1',
        userId: 'user-1',
        githubId: 123456,
        username: 'testuser',
        lastActiveAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.userProfile.create.mockResolvedValue(mockProfile)

      const result = await db.createUserProfile({
        userId: 'user-1',
        githubId: 123456,
        username: 'testuser',
      })

      expect(result).toEqual(mockProfile)
      expect(mockPrisma.userProfile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          githubId: 123456,
          username: 'testuser',
        }),
      })
    })

    it('should get user profile by user ID', async () => {
      const mockProfile: UserProfile = {
        id: 'profile-1',
        userId: 'user-1',
        githubId: 123456,
        username: 'testuser',
        lastActiveAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.userProfile.findUnique.mockResolvedValue(mockProfile)

      const result = await db.getUserProfile('user-1')

      expect(result).toEqual(mockProfile)
      expect(mockPrisma.userProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      })
    })

    it('should get user profile by GitHub ID', async () => {
      const mockProfile: UserProfile = {
        id: 'profile-1',
        userId: 'user-1',
        githubId: 123456,
        username: 'testuser',
        lastActiveAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.userProfile.findUnique.mockResolvedValue(mockProfile)

      const result = await db.getUserProfileByGitHubId(123456)

      expect(result).toEqual(mockProfile)
      expect(mockPrisma.userProfile.findUnique).toHaveBeenCalledWith({
        where: { githubId: 123456 },
      })
    })

    it('should update user last active timestamp', async () => {
      mockPrisma.userProfile.update.mockResolvedValue({} as UserProfile)

      await db.updateUserLastActive('user-1')

      expect(mockPrisma.userProfile.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { lastActiveAt: expect.any(Date) },
      })
    })

    it('should handle update last active errors gracefully', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn())
      mockPrisma.userProfile.update.mockRejectedValue(new Error('Update failed'))

      // Should not throw
      await expect(db.updateUserLastActive('user-1')).resolves.toBeUndefined()
      expect(consoleWarnSpy).toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
    })

    it('should delete user profile', async () => {
      mockPrisma.userProfile.delete.mockResolvedValue({} as UserProfile)

      await db.deleteUserProfile('user-1')

      expect(mockPrisma.userProfile.delete).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      })
    })
  })

  describe('Repository Management', () => {
    it('should get user repositories', async () => {
      const mockRepositories: Repository[] = [
        {
          id: 'repo-1',
          githubId: 1001,
          name: 'test-repo',
          fullName: 'owner/test-repo',
          owner: 'owner',
          isActive: true,
          userId: 'profile-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.repository.findMany.mockResolvedValue(mockRepositories)

      const result = await db.getUserRepositories('profile-1')

      expect(result).toEqual(mockRepositories)
      expect(mockPrisma.repository.findMany).toHaveBeenCalledWith({
        where: { userId: 'profile-1' },
        orderBy: { updatedAt: 'desc' },
      })
    })

    it('should get only active user repositories', async () => {
      mockPrisma.repository.findMany.mockResolvedValue([])

      await db.getUserRepositories('profile-1', true)

      expect(mockPrisma.repository.findMany).toHaveBeenCalledWith({
        where: { userId: 'profile-1', isActive: true },
        orderBy: { updatedAt: 'desc' },
      })
    })

    it('should get repository by GitHub ID', async () => {
      const mockRepo: Repository = {
        id: 'repo-1',
        githubId: 1001,
        name: 'test-repo',
        fullName: 'owner/test-repo',
        owner: 'owner',
        isActive: true,
        userId: 'profile-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.repository.findUnique.mockResolvedValue(mockRepo)

      const result = await db.getRepositoryByGitHubId(1001)

      expect(result).toEqual(mockRepo)
      expect(mockPrisma.repository.findUnique).toHaveBeenCalledWith({
        where: { githubId: 1001 },
      })
    })

    it('should get repository by full name', async () => {
      const mockRepo: Repository = {
        id: 'repo-1',
        githubId: 1001,
        name: 'test-repo',
        fullName: 'owner/test-repo',
        owner: 'owner',
        isActive: true,
        userId: 'profile-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.repository.findUnique.mockResolvedValue(mockRepo)

      const result = await db.getRepositoryByFullName('owner/test-repo')

      expect(result).toEqual(mockRepo)
      expect(mockPrisma.repository.findUnique).toHaveBeenCalledWith({
        where: { fullName: 'owner/test-repo' },
      })
    })

    it('should add a repository', async () => {
      const mockRepo: Repository = {
        id: 'repo-1',
        githubId: 1001,
        name: 'test-repo',
        fullName: 'owner/test-repo',
        owner: 'owner',
        isActive: true,
        userId: 'profile-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.repository.create.mockResolvedValue(mockRepo)

      const result = await db.addRepository('profile-1', {
        githubId: 1001,
        name: 'test-repo',
        fullName: 'owner/test-repo',
        owner: 'owner',
      })

      expect(result).toEqual(mockRepo)
      expect(mockPrisma.repository.create).toHaveBeenCalledWith({
        data: {
          userId: 'profile-1',
          githubId: 1001,
          name: 'test-repo',
          fullName: 'owner/test-repo',
          owner: 'owner',
          isActive: true,
        },
      })
    })

    it('should update repository', async () => {
      const mockRepo: Repository = {
        id: 'repo-1',
        githubId: 1001,
        name: 'test-repo',
        fullName: 'owner/test-repo',
        owner: 'owner',
        isActive: false,
        userId: 'profile-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.repository.update.mockResolvedValue(mockRepo)

      const result = await db.updateRepository('repo-1', { isActive: false })

      expect(result).toEqual(mockRepo)
      expect(mockPrisma.repository.update).toHaveBeenCalledWith({
        where: { id: 'repo-1' },
        data: { isActive: false },
      })
    })

    it('should delete repository', async () => {
      mockPrisma.repository.delete.mockResolvedValue({} as Repository)

      await db.deleteRepository('repo-1')

      expect(mockPrisma.repository.delete).toHaveBeenCalledWith({
        where: { id: 'repo-1' },
      })
    })

    it('should delete multiple repositories', async () => {
      mockPrisma.repository.deleteMany.mockResolvedValue({ count: 3 })

      const result = await db.deleteRepositories(['repo-1', 'repo-2', 'repo-3'])

      expect(result).toBe(3)
      expect(mockPrisma.repository.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['repo-1', 'repo-2', 'repo-3'] } },
      })
    })
  })

  describe('Cleanup Operations', () => {
    it('should cleanup inactive users', async () => {
      mockPrisma.userProfile.deleteMany.mockResolvedValue({ count: 5 })

      const result = await db.cleanupInactiveUsers(30)

      expect(result).toBe(5)
      expect(mockPrisma.userProfile.deleteMany).toHaveBeenCalledWith({
        where: {
          lastActiveAt: {
            lt: expect.any(Date),
          },
        },
      })
    })
  })

  describe('Health Check', () => {
    it('should return true when database connection is healthy', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }])

      const result = await db.checkConnection()

      expect(result).toBe(true)
      expect(mockPrisma.$queryRaw).toHaveBeenCalled()
    })

    it('should return false when database connection fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn())
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection failed'))

      const result = await db.checkConnection()

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })
})
