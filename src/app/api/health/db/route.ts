import { NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/db';
import { dbConfig } from '@/db/config';

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    // Test the database connection
    const connectionStart = Date.now();
    const isHealthy = await testDatabaseConnection();
    const connectionTime = Date.now() - connectionStart;

    if (isHealthy) {
      return NextResponse.json(
        {
          status: 'healthy',
          timestamp,
          connectionTimeMs: connectionTime,
          database: {
            url: dbConfig.url ? 'configured' : 'missing',
            maxConnections: dbConfig.maxConnections,
            connectTimeout: dbConfig.connectTimeout,
          }
        },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp,
          connectionTimeMs: connectionTime,
          database: {
            url: dbConfig.url ? 'configured' : 'missing',
            maxConnections: dbConfig.maxConnections,
            connectTimeout: dbConfig.connectTimeout,
          },
          message: 'Database connection test failed'
        },
        { status: 503 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
