// Database configuration and validation

export const dbConfig = {
  url: process.env['DATABASE_URL'],
  maxConnections: parseInt(process.env['DB_MAX_CONNECTIONS'] || '20', 10),
  connectTimeout: parseInt(process.env['DB_CONNECT_TIMEOUT'] || '60', 10),
  enableLogging: process.env['NODE_ENV'] === 'development',
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
  } catch {
    throw new Error(
      `Invalid DATABASE_URL format: ${dbConfig.url}\n` +
      'Expected format: postgresql://username:password@host:port/database',
    );
  }

  console.log('✅ Database configuration validated');
}

// Call validation on module load
validateDatabaseConfig();
