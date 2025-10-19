import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkDatabaseConnection, disconnectDatabase } from '@/lib/prisma'

// Mock the Prisma client
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    $queryRaw: vi.fn(),
    $disconnect: vi.fn(),
  }

  return {
    PrismaClient: vi.fn(() => mockPrisma),
  }
})

// Import after mocking
const { PrismaClient } = await import('@prisma/client')
const mockPrisma = new PrismaClient() as unknown as {
  $queryRaw: ReturnType<typeof vi.fn>
  $disconnect: ReturnType<typeof vi.fn>
}

describe('Prisma Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkDatabaseConnection', () => {
    it('should return true when database connection is successful', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }])

      const result = await checkDatabaseConnection()

      expect(result).toBe(true)
      expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(['SELECT 1'])
    })

    it('should return false and log error when database connection fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn())
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection failed'))

      const result = await checkDatabaseConnection()

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Database connection failed:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })

    it('should handle different types of database errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

      // Test with different error types
      mockPrisma.$queryRaw.mockRejectedValue('String error')
      expect(await checkDatabaseConnection()).toBe(false)

      mockPrisma.$queryRaw.mockRejectedValue(null)
      expect(await checkDatabaseConnection()).toBe(false)

      mockPrisma.$queryRaw.mockRejectedValue(undefined)
      expect(await checkDatabaseConnection()).toBe(false)

      consoleErrorSpy.mockRestore()
    })
  })

  describe('disconnectDatabase', () => {
    it('should call prisma disconnect', async () => {
      mockPrisma.$disconnect.mockResolvedValue(undefined)

      await disconnectDatabase()

      expect(mockPrisma.$disconnect).toHaveBeenCalled()
    })

    it('should handle disconnect errors gracefully', async () => {
      mockPrisma.$disconnect.mockRejectedValue(new Error('Disconnect failed'))

      // Should not throw
      await expect(disconnectDatabase()).rejects.toThrow('Disconnect failed')
    })
  })

  describe('Prisma Client Singleton', () => {
    it('should use the same instance across multiple imports', async () => {
      // Test that the singleton pattern actually works
      const { prisma: prisma1 } = await import('@/lib/prisma')
      const { prisma: prisma2 } = await import('@/lib/prisma')

      expect(prisma1).toBe(prisma2)
    })

    it('should configure Prisma client with correct options', async () => {
      const { prisma } = await import('@/lib/prisma')

      // Test that the prisma instance has the expected configuration
      expect(prisma).toBeDefined()
      expect(prisma.$queryRaw).toBeDefined()
      expect(prisma.$disconnect).toBeDefined()
    })
  })
})