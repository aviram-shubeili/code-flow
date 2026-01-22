/**
 * Prisma Client Singleton
 * 
 * Implements singleton pattern to prevent multiple Prisma Client instances
 * in serverless environments (AWS Lambda via Next.js).
 * 
 * Connection pooling is handled automatically by Prisma for serverless.
 * 
 * Prisma 7 requires adapter configuration for database connections
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const { Pool } = pg

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: pg.Pool | undefined
}

/**
 * Get the database URL, validating it exists
 * Lazy evaluation to support build-time without DATABASE_URL
 */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is required. ' +
      'Please check your .env.local file or environment configuration.'
    )
  }
  return url
}

// Cached client instance (separate from globalForPrisma to avoid proxy issues)
let cachedClient: PrismaClient | undefined

/**
 * Lazily creates and caches the Prisma client
 * This allows the module to be imported during build without DATABASE_URL
 */
function createPrismaClient(): PrismaClient {
  if (cachedClient) {
    return cachedClient
  }
  
  if (globalForPrisma.prisma) {
    cachedClient = globalForPrisma.prisma
    return cachedClient
  }

  // Create connection pool
  const pool = globalForPrisma.pool ?? new Pool({
    connectionString: getDatabaseUrl()
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pool = pool
  }

  // Create Prisma adapter
  const adapter = new PrismaPg(pool)

  cachedClient = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = cachedClient
  }

  return cachedClient
}

// Export a lazy proxy that creates the client on first use
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = createPrismaClient()
    return Reflect.get(client, prop)
  }
})

/**
 * Graceful shutdown handler for Prisma Client
 * Call this in serverless cleanup or process termination handlers
 */
export async function disconnectPrisma() {
  if (cachedClient) {
    await cachedClient.$disconnect()
  }
  if (globalForPrisma.pool) {
    await globalForPrisma.pool.end()
  }
}
