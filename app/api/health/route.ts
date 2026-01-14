import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(): Promise<NextResponse> {
    // Check database connection
    const dbConnected = await db.checkConnection()

    // Determine overall health status
    const status = dbConnected ? 'ok' : 'degraded'
    const statusCode = dbConnected ? 200 : 503

    return NextResponse.json({
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        checks: {
            database: dbConnected ? 'connected' : 'disconnected',
        },
    }, { status: statusCode })
}