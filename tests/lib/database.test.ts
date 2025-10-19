import { describe, it, expect, beforeEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import { DatabaseService } from '@/lib/database'

// Mock Prisma client
const prismaMock = mockDeep<PrismaClient>()

// Create a test instance with the mock
const dbService = new DatabaseService(prismaMock as unknown as PrismaClient)

describe('DatabaseService - Story 0.4 Basic Setup', () => {
  beforeEach(() => {
    mockReset(prismaMock)
  })

  describe('Health Check', () => {
    it('should return healthy status when database is accessible', async () => {
      prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }])
      prismaMock.user.count.mockResolvedValue(5)

      const result = await dbService.healthCheck()

      expect(result).toEqual({
        status: 'healthy',
        details: 'Database connection and table access verified',
      })
    })

    it('should return unhealthy status when database is not accessible', async () => {
      prismaMock.$queryRaw.mockRejectedValue(new Error('Connection failed'))

      const result = await dbService.healthCheck()

      expect(result.status).toBe('unhealthy')
      expect(result.details).toContain('Database health check failed')
    })

    it('should handle user table access errors', async () => {
      prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }])
      prismaMock.user.count.mockRejectedValue(new Error('Table access failed'))

      const result = await dbService.healthCheck()

      expect(result.status).toBe('unhealthy')
      expect(result.details).toContain('Database health check failed')
    })
  })
})