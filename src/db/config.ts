// Database configuration and validation

export const dbConfig = {
  url: process.env.DATABASE_URL,
  maxConnections: process.env.DB_MAX_CONNECTIONS
    ? parseInt(process.env.DB_MAX_CONNECTIONS)
    : process.env.NODE_ENV === 'production'
      ? 10
      : 1,
  connectTimeout: process.env.DB_CONNECT_TIMEOUT
    ? parseInt(process.env.DB_CONNECT_TIMEOUT)
    : 10,
  enableLogging:
    process.env.DB_ENABLE_LOGGING === 'true' ||
    process.env.NODE_ENV === 'development',
} as const;

// Validate required environment variables
export function validateDatabaseConfig(): void {
  if (!dbConfig.url) {
    throw new Error(
      'DATABASE_URL is required. Please set it in your .env.local file.\n' +
      'Example: DATABASE_URL="postgresql://postgres:password@localhost:5432/codeflow"',
    );
  }

  // Validate URL format
  try {
    new URL(dbConfig.url);
  } catch (error) {
    throw new Error(
      `Invalid DATABASE_URL format: ${dbConfig.url}\n` +
      'Expected format: postgresql://username:password@host:port/database',
    );
  }

  console.log('✅ Database configuration validated');
}

// Call validation on module load
validateDatabaseConfig();
