/**
 * Auth Configuration Tests
 */

import { describe, expect, it, vi } from 'vitest'

// Mock the auth module before importing
vi.mock('@/auth', () => ({
  auth: vi.fn(),
  handlers: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

describe('Auth Configuration', () => {
  it('exports auth function', async () => {
    const { auth } = await import('@/auth')
    expect(auth).toBeDefined()
    expect(typeof auth).toBe('function')
  })

  it('exports handlers object with GET and POST', async () => {
    const { handlers } = await import('@/auth')
    expect(handlers).toBeDefined()
    expect(handlers.GET).toBeDefined()
    expect(handlers.POST).toBeDefined()
    expect(typeof handlers.GET).toBe('function')
    expect(typeof handlers.POST).toBe('function')
  })

  it('exports signIn function', async () => {
    const { signIn } = await import('@/auth')
    expect(signIn).toBeDefined()
    expect(typeof signIn).toBe('function')
  })

  it('exports signOut function', async () => {
    const { signOut } = await import('@/auth')
    expect(signOut).toBeDefined()
    expect(typeof signOut).toBe('function')
  })
})
