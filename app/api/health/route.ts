import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse> {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
    })
}