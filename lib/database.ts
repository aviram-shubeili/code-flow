import { PrismaClient } from '@prisma/client'
import { prisma } from './prisma'

/**
 * Database service layer for CodeFlow application
 * Provides basic database operations and health checking for story 0.4
 */
export class DatabaseService {
  constructor(private client: PrismaClient = prisma) { }

  // Health Check
  /**
   * Verify database connection and basic functionality
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: string }> {
    try {
      // Test basic connection
      await this.client.$queryRaw`SELECT 1`

      // Test table access
      await this.client.user.count()

      return {
        status: 'healthy',
        details: 'Database connection and table access verified',
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}