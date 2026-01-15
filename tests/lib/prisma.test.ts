/**
 * Unit Tests for Prisma Client Singleton
 * 
 * Tests the Prisma client initialization and singleton pattern
 */

import { describe, it, expect } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('Prisma Client', () => {
  it('should export a Prisma client instance', () => {
    expect(prisma).toBeDefined()
    expect(prisma).toHaveProperty('user')
    expect(prisma).toHaveProperty('userProfile')
    expect(prisma).toHaveProperty('repository')
    expect(prisma).toHaveProperty('account')
    expect(prisma).toHaveProperty('session')
  })

  it('should have proper Prisma client methods', () => {
    expect(typeof prisma.$connect).toBe('function')
    expect(typeof prisma.$disconnect).toBe('function')
    expect(typeof prisma.$queryRaw).toBe('function')
  })
})
