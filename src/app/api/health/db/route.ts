import { NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/db';

export async function GET() {
  try {
    const isHealthy = await testDatabaseConnection();

    if (isHealthy) {
      return NextResponse.json(
        { status: 'healthy', timestamp: new Date().toISOString() },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { status: 'unhealthy', timestamp: new Date().toISOString() },
        { status: 503 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
