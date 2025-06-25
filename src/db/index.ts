import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { dbConfig } from './config';

// Configure postgres client based on environment
const client = postgres(dbConfig.url!, {
  // Connection pool settings
  max: dbConfig.maxConnections,

  // Connection timeout
  connect_timeout: dbConfig.connectTimeout,

  // Disable prefetch for transaction mode compatibility
  prepare: false,

  // Enable SSL in production
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,

  // Logging in development
  debug: dbConfig.enableLogging,
});

// Create Drizzle instance
export const db = drizzle(client, {
  schema,
  logger: dbConfig.enableLogging,
});

// Export schema and types
export { schema };

export type {
  User,
  NewUser,
  Account,
  NewAccount,
  Session,
  NewSession,
  VerificationToken,
  NewVerificationToken,
  Authenticator,
  NewAuthenticator,
} from './schema';

// Utility function to test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await db.select().from(schema.users).limit(1);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Graceful shutdown function
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await client.end();
    console.log('Database connection closed gracefully');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

// Global error handler for database connection issues
process.on('beforeExit', () => {
  closeDatabaseConnection();
});
