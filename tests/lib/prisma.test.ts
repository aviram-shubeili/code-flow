/**
 * Unit Tests for Prisma Client Singleton
 *
 * Tests the Prisma client initialization and singleton pattern
 */

import { describe, expect, it } from 'vitest'

import { prisma } from '@/lib/prisma'

describe('Prisma Client', () => {
  it('should export a Prisma client instance', () => {
    expect(prisma).toBeDefined()
    // Access properties through the lazy proxy
    expect(prisma.user).toBeDefined()
    expect(prisma.userProfile).toBeDefined()
    expect(prisma.repository).toBeDefined()
    expect(prisma.account).toBeDefined()
    expect(prisma.session).toBeDefined()
  })

  it('should have proper Prisma client methods', () => {
    expect(typeof prisma.$connect).toBe('function')
    expect(typeof prisma.$disconnect).toBe('function')
    expect(typeof prisma.$queryRaw).toBe('function')
  })
})
