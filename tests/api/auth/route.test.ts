/**
 * Auth API Route Tests
 */

import { describe, expect, it, vi } from 'vitest'

// Mock the auth module
vi.mock('@/auth', () => ({
  handlers: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}))

describe('Auth API Routes', () => {
  it('exports GET handler', async () => {
    const { GET } = await import('@/app/api/auth/[...nextauth]/route')
    expect(GET).toBeDefined()
    expect(typeof GET).toBe('function')
  })

  it('exports POST handler', async () => {
    const { POST } = await import('@/app/api/auth/[...nextauth]/route')
    expect(POST).toBeDefined()
    expect(typeof POST).toBe('function')
  })
})
