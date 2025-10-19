import { z } from 'zod'
import type { Prisma } from '@prisma/client'

// Environment validation schema
const envSchema = z.object({
  // Database Configuration
  DATABASE_URL: z
    .url('DATABASE_URL must be a valid PostgreSQL URL')
    .refine(
      (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
      'DATABASE_URL must be a PostgreSQL connection string'
    ),

  // Application Environment
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development')
    .describe('Application environment'),

  LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error'])
    .default('info')
    .describe('Logging level'),

  // Optional production database settings
  DATABASE_SSL: z
    .string()
    .optional()
    .transform((val) => val === 'true' || val === '1')
    .describe('Enable SSL for database connection (production)'),

  DATABASE_POOL_MIN: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : undefined)
    .pipe(z.number().min(0).max(50).optional())
    .describe('Minimum database connection pool size'),

  DATABASE_POOL_MAX: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : undefined)
    .pipe(z.number().min(1).max(100).optional())
    .describe('Maximum database connection pool size'),
})

export type Env = z.infer<typeof envSchema>

// Parse and validate environment variables
function parseEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err: z.core.$ZodIssue) =>
        `${err.path.join('.')}: ${err.message}`
      ).join('\n')

      throw new Error(
        `Environment validation failed:\n${missingVars}\n\n` +
        `Please check your .env.local file and ensure all required variables are set.`
      )
    }
    throw error
  }
}

// Export validated environment
export const env: Env = parseEnv()

// Database connection URL with SSL configuration
export function getDatabaseUrl(): string {
  let url = env.DATABASE_URL

  // Add SSL configuration for production
  if (env.NODE_ENV === 'production' && env.DATABASE_SSL !== false) {
    const urlObj = new URL(url)
    urlObj.searchParams.set('sslmode', 'require')
    url = urlObj.toString()
  }

  return url
}

// Prisma connection configuration
export function getPrismaConfig(): Prisma.PrismaClientOptions {
  return {
    log: env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  }
}

// Validate critical environment for startup
export function validateStartupEnvironment(): void {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required but not provided')
  }

  // Note: GitHub OAuth and Authentication validation will be added in Epic 1

  console.log(`✅ Environment validation passed for ${env.NODE_ENV} environment`)
}