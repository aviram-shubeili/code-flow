/**
 * Health API Route Test
 *
 * This test demonstrates:
 * - Next.js API route testing
 * - HTTP response validation
 * - JSON response structure testing
 * - Environment-aware testing
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the database module
vi.mock('@/lib/database', () => ({
  db: {
    checkConnection: vi.fn().mockResolvedValue(true),
  },
}))

import { GET } from '@/app/api/health/route'
import { db } from '@/lib/database'

describe('/api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default to connected
    vi.mocked(db.checkConnection).mockResolvedValue(true)
  })

  describe('GET /api/health', () => {
    it('returns health status successfully when database is connected', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: expect.any(String),
        checks: {
          database: 'connected',
        },
      })
    })

    it('returns degraded status when database is disconnected', async () => {
      vi.mocked(db.checkConnection).mockResolvedValue(false)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data).toMatchObject({
        status: 'degraded',
        checks: {
          database: 'disconnected',
        },
      })
    })

    it('returns valid timestamp format', async () => {
      const response = await GET()
      const data = await response.json()

      // Should be a valid ISO string
      expect(() => new Date(data.timestamp)).not.toThrow()
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp)
    })

    it('returns positive uptime', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data.uptime).toBeGreaterThanOrEqual(0)
      expect(typeof data.uptime).toBe('number')
    })

    it('returns correct environment', async () => {
      const response = await GET()
      const data = await response.json()

      // Should be one of the expected environments
      expect(['development', 'test', 'production']).toContain(data.environment)
    })

    it('returns consistent status value', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data.status).toBe('ok')
    })

    it('handles multiple concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, () => GET())
      const responses = await Promise.all(requests)

      for (const response of responses) {
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.status).toBe('ok')
      }
    })
  })
})
