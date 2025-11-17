/**
 * Health API Route Test
 * 
 * This test demonstrates:
 * - Next.js API route testing
 * - HTTP response validation
 * - JSON response structure testing
 * - Environment-aware testing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from '@/app/api/health/route'

describe('/api/health', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('GET /api/health', () => {
        it('returns health status successfully', async () => {
            const response = await GET()
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data).toMatchObject({
                status: 'ok',
                timestamp: expect.any(String),
                uptime: expect.any(Number),
                environment: expect.any(String),
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
                expect(data.status).toBe('ok')
            }
        })
    })
})