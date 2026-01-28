/**
 * Mock for Auth.js (NextAuth.js v5)
 *
 * Provides mock implementations for auth functions used in tests.
 */

import { vi } from 'vitest'

// Auth.js v5 exports
export const auth = vi.fn()
export const signIn = vi.fn()
export const signOut = vi.fn()

// Mock handlers for API routes
export const handlers = {
  GET: vi.fn(),
  POST: vi.fn(),
}

// Mock NextAuth default export (v5 configuration)
const NextAuth = vi.fn(() => ({
  auth,
  signIn,
  signOut,
  handlers,
}))

export default NextAuth
