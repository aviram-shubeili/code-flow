# Step 5: Configure Database Connection

**Estimated Time:** 30-45 minutes  
**Prerequisites:** Step 4 completed  
**Dependencies:** Schema created and migrated

## Status
- [ ] Not Started
- [ ] In Progress
- [x] Completed ✅ (Completed on: 2024-12-28)

## 🎯 Objective

Configure and optimize the database connection for both development and production environments, ensuring proper connection pooling and error handling.

## 📋 Tasks

### 5.1 Enhanced Database Connection Configuration

**File: `src/db/index.ts`** - Update with enhanced configuration:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection configuration
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL environment variable is required but not set. ' +
      'Please check your .env.local file.',
  );
}

// Configure postgres client based on environment
const client = postgres(connectionString, {
  // Connection pool settings
  max: process.env.NODE_ENV === 'production' ? 10 : 1,

  // Connection timeout
  connect_timeout: 10,

  // Disable prefetch for transaction mode compatibility
  prepare: false,

  // Enable SSL in production
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,

  // Logging in development
  debug: process.env.NODE_ENV === 'development',
});

// Create Drizzle instance
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === 'development',
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
  PrCache,
  NewPrCache,
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
```

### 5.2 Environment Variable Validation

**File: `src/db/config.ts`** (Create new file):

```typescript
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
```

### 5.3 Update Database Index to Use Config

**File: `src/db/index.ts`** - Update to use configuration:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { dbConfig } from './config';

// Create postgres client with validated configuration
const client = postgres(dbConfig.url!, {
  max: dbConfig.maxConnections,
  connect_timeout: dbConfig.connectTimeout,
  prepare: false,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  debug: dbConfig.enableLogging,
});

// Create Drizzle instance
export const db = drizzle(client, {
  schema,
  logger: dbConfig.enableLogging,
});

// Export everything
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
  PrCache,
  NewPrCache,
} from './schema';

// Utility functions
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await db.select().from(schema.users).limit(1);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  try {
    await client.end();
    console.log('Database connection closed gracefully');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}
```

### 5.4 Add Database Health Check

**File: `src/app/api/health/db/route.ts`** (Create new API route):

```typescript
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
```

### 5.5 Update Environment Variables Documentation

**File: `.env.local.example`** (Update if exists, or create):

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/codeflow"

# Optional Database Settings
# DB_MAX_CONNECTIONS=10
# DB_CONNECT_TIMEOUT=10
# DB_ENABLE_LOGGING=true

# Auth.js Configuration
AUTH_SECRET="your-secret-key-here"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Docker PostgreSQL Configuration (for docker-compose)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=codeflow
```

### 5.6 Add Database Management Scripts

**File: `package.json`** - Add additional scripts:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:drop": "drizzle-kit drop",
    "db:reset": "npm run db:drop && npm run db:generate && npm run db:migrate",
    "db:test": "npx tsx src/db/test-connection.ts",
    "db:health": "curl -f http://localhost:3000/api/health/db || echo 'Health check failed'"
  }
}
```

## 🧪 Validation Steps

1. **Test configuration validation**

```bash
# This should validate config without errors
npx tsx -e "import './src/db/config.js'"
```

2. **Test database connection**

```bash
npm run db:test
```

3. **Start development server and test health endpoint**

```bash
npm run dev
# In another terminal:
curl http://localhost:3000/api/health/db
```

4. **Test with invalid DATABASE_URL**

```bash
# Temporarily modify .env.local with invalid URL and test
DATABASE_URL="invalid-url" npx tsx src/db/test-connection.ts
# Should show validation error
```

5. **Test Drizzle Studio with new configuration**

```bash
npm run db:studio
```

## ⚠️ Expected State After Completion

- **Database connection properly configured** with environment-specific settings
- **Configuration validation working** with helpful error messages
- **Health check endpoint available** for monitoring
- **Connection pooling optimized** for development and production
- **Error handling improved** with graceful shutdown
- **Ready for production deployment** with SSL and connection limits

## 📝 Notes

- **Connection pooling** is important for production performance
- **SSL configuration** will be needed for AWS RDS in production
- **Environment validation** helps catch configuration issues early
- **Health checks** are useful for monitoring and debugging
- **Graceful shutdown** prevents connection leaks

## ✅ Success Criteria

- [ ] Enhanced database configuration implemented
- [ ] Environment variable validation working
- [ ] Database health check endpoint responds correctly
- [ ] Connection test passes
- [ ] Drizzle Studio works with new configuration
- [ ] No console errors during startup
- [ ] Configuration loads correctly in all environments
- [ ] Additional database scripts added to package.json

## 📊 Update Migration Status

After completing this step:

- [ ] Update the status in `README.md`:
  - Change `- [ ] Step 5: Configure Database` to `- [x] Step 5: Configure Database ✅`
  - Add completion timestamp
- [ ] Update `00-migration-overview.md` if needed
- [ ] Note any configuration optimizations or connection improvements made

**Next Step:** Proceed to `06-integrate-auth.md`
