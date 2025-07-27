import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/db/schema'

// Test database configuration
const TEST_DATABASE_URL = process.env['TEST_DATABASE_URL'] || 'postgresql://codeflow_user:codeflow_password@localhost:5433/codeflow_test_db'

// Create test database client
const testClient = postgres(TEST_DATABASE_URL, {
  max: 5, // Smaller connection pool for tests
  connect_timeout: 5, // Quick timeout for tests
  prepare: false,
  ssl: false,
  debug: false, // Disable logging in tests
})

// Create test database instance
export const testDb = drizzle(testClient, { schema })

/**
 * Clean up test database - removes all data from tables
 * Call this between tests to ensure clean state
 */
export async function cleanupTestDatabase() {
  try {
    // Delete in order to respect foreign key constraints
    await testDb.delete(schema.sessions)
    await testDb.delete(schema.accounts)
    await testDb.delete(schema.verificationTokens)
    await testDb.delete(schema.users)
    console.log('Test database cleaned up successfully')
  } catch (error) {
    console.error('Failed to cleanup test database:', error)
    throw error
  }
}

/**
 * Test the test database connection
 */
export async function testTestDatabaseConnection(): Promise<boolean> {
  try {
    await testDb.select().from(schema.users).limit(1)
    return true
  } catch (error) {
    console.error('Test database connection failed:', error)
    return false
  }
}

/**
 * Create test user data for testing
 */
export async function createTestUser(userData = {}) {
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://avatars.githubusercontent.com/u/12345?v=4',
    ...userData,
  }

  const [user] = await testDb.insert(schema.users).values(defaultUser).returning()
  return user
}

/**
 * Close test database connection
 */
export async function closeTestDatabase() {
  await testClient.end()
}
