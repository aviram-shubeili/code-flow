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

// Validate DATABASE_URL early for better error messages
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is required. ' +
    'Please check your .env.local file or environment configuration.'
  )
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: pg.Pool | undefined
}

// Create connection pool
const pool = globalForPrisma.pool ?? new Pool({
  connectionString: process.env.DATABASE_URL
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool
}

// Create Prisma adapter
const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Graceful shutdown handler for Prisma Client
 * Call this in serverless cleanup or process termination handlers
 */
export async function disconnectPrisma() {
  await prisma.$disconnect()
  await pool.end()
}
