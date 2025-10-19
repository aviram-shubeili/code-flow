/**
 * Health API Route Test
 * 
 * This test demonstrates:
 * - Next.js API route testing
 * - HTTP response validation
 * - JSON response structure testing
 * - Environment-aware testing
 * - Database connection mocking for unit tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from '@/app/api/health/route'

// Mock the database modules
vi.mock('@/lib/database', () => ({
    DatabaseService: vi.fn().mockImplementation(() => ({
        healthCheck: vi.fn()
    }))
}))

describe('/api/health', () => {
    let mockHealthCheck: ReturnType<typeof vi.fn>

    beforeEach(async () => {
        vi.clearAllMocks()

        // Get the mocked functions
        const { DatabaseService } = await import('@/lib/database')

        mockHealthCheck = vi.fn().mockResolvedValue({ status: 'healthy' })

        // Mock DatabaseService constructor to return our mocked health check
        vi.mocked(DatabaseService).mockImplementation(() => ({
            healthCheck: mockHealthCheck
        }) as unknown as InstanceType<typeof DatabaseService>)
    })

    describe('GET /api/health', () => {
        it('returns health status successfully', async () => {
            const response = await GET()
            const data = await response.json()

            // Should return 200 with mocked database connection
            expect(response.status).toBe(200)
            expect(data).toMatchObject({
                status: 'healthy',
                timestamp: expect.any(String),
                uptime: expect.any(Number),
                environment: expect.any(String),
                checks: {
                    database: true,
                },
            })
        })

        it('returns 503 when database is down', async () => {
            // Mock database connection failure
            mockHealthCheck.mockRejectedValue(new Error('Database connection failed'))

            const response = await GET()
            const data = await response.json()

            expect(response.status).toBe(503)
            expect(data.status).toBe('unhealthy')
            expect(data.checks.database).toBe(false)
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

            // Status should be 'healthy' with mocked database
            expect(data.status).toBe('healthy')
        })

        it('returns Content-Type as application/json', async () => {
            const response = await GET()

            expect(response.headers.get('content-type')).toContain('application/json')
        })

        it('handles multiple concurrent requests', async () => {
            const requests = Array.from({ length: 5 }, () => GET())
            const responses = await Promise.all(requests)

            for (const response of responses) {
                expect(response.status).toBe(200)
                const data = await response.json()
                expect(data.status).toBe('healthy')
            }
        })
    })
})