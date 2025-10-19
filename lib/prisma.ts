import { PrismaClient } from '@prisma/client'
import { getPrismaConfig } from './env'

declare global {
  var __prisma: PrismaClient | undefined
}

// Prisma client singleton pattern for serverless environments
// Prevents multiple instances in development with hot reloading
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ??
  new PrismaClient(getPrismaConfig())

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Connection health check utility
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Graceful shutdown helper
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
}