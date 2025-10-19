import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(): Promise<NextResponse> {
  try {
    // Basic health check
    const health = {
      status: 'healthy' as 'healthy' | 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: false,
      },
    }

    // Check database and Prisma operations
    try {
      const db = new DatabaseService()
      const dbHealth = await db.healthCheck()
      health.checks.database = dbHealth.status === 'healthy'
    } catch (error) {
      console.warn('Database health check failed:', error)
      health.checks.database = false
    }

    // Determine overall status
    const allChecksPass = Object.values(health.checks).every(check => check === true)
    if (!allChecksPass) {
      health.status = 'unhealthy'
    }

    const statusCode = health.status === 'healthy' ? 200 : 503

    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    console.error('Health check error:', error)

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        checks: {
          database: false,
        },
      },
      { status: 500 }
    )
  }
}