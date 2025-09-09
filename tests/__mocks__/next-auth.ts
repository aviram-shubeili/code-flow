import { vi } from 'vitest'

export const getServerSession = vi.fn()
export const signIn = vi.fn()
export const signOut = vi.fn()

// Mock AuthOptions type
export const authOptions = {}

// Mock NextAuth default export
export default {
    getServerSession,
    signIn,
    signOut,
}