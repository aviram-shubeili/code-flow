# Step 4: Setup Auth.js Compatible Schema

**Estimated Time:** 45-60 minutes  
**Prerequisites:** Step 3 completed  
**Dependencies:** Drizzle installed and configured

## Status
- [ ] Not Started
- [ ] In Progress
- [x] Completed ✅ (Completed on: 2024-12-28)

## 🎯 Objective

Create the database schema compatible with Auth.js using Drizzle ORM, including all necessary tables for authentication and user management.

## 📋 Tasks

### 4.1 Create Auth.js Schema Tables

**File: `src/db/schema.ts`** - Replace the existing placeholder content:

```typescript
import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"
 
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
})
 
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
)
 
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})
 
export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
)
 
export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
)
```

### 4.2 Keep Database Connection Unchanged

**Note:** The `src/db/index.ts` file already has the correct setup from Step 3. We'll only need to update it slightly after the schema is created to export the new table types.

The file should remain:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// For production, you might want to configure connection pooling
const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client, { schema });

// Export client for potential cleanup operations
export { client };

// Re-export schema for use in Auth.js and other parts of the app
export * from './schema';
```

**Why this works:**
- Database connection setup stays in `index.ts` (single responsibility)
- Schema definitions stay in `schema.ts` (table definitions only)
- All exports are automatically available via `export * from './schema'`

### 4.3 Generate Initial Migration

```bash
# Generate the first migration based on schema
npm run db:generate
```

This will create a migration file in `src/db/migrations/` with SQL commands to create all tables.

### 4.4 Apply Migration to Database

Ensure your Docker PostgreSQL is running:
```bash
# Make sure database is running
npm run docker:up
```

Then apply the migration:
```bash
# Apply migration to database
npm run db:migrate
```

### 4.5 Verify Database Schema

**Option 1: Use Drizzle Studio**
```bash
npm run db:studio
```
This opens a web interface to browse your database schema and data.

**Option 2: Connect via psql** (if you have PostgreSQL client installed)
```bash
# Connect to the database
docker exec -it codeflow-postgres-1 psql -U postgres -d codeflow

# List tables
\dt

# Describe tables
\d user
\d account
\d session
\d "verificationToken"
\d pr_cache

# Exit
\q
```

### 4.6 Test Database Connection

**Create a test file:** `src/db/test-connection.ts`

```typescript
import { db, users } from "./index";

async function testConnection() {
  try {
    console.log("Testing database connection...");
    
    // Try to query users table (should be empty)
    const result = await db.select().from(users).limit(1);
    console.log("✅ Database connection successful!");
    console.log("Users table query result:", result);
    
    // Try to count tables to verify schema exists
    const tableCount = await db.$count(users);
    console.log(`📊 Users table contains ${tableCount} records`);
    
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}

// Run the test
testConnection().then(() => {
  console.log("Test completed");
  process.exit(0);
}).catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
```

**Run the test:**
```bash
npx dotenv -e .env.local -- npx tsx src/db/test-connection.ts
```

## 🧪 Validation Steps

1. **Check schema file syntax**
```bash
npx tsc --noEmit src/db/schema.ts
```

2. **Verify migration generation**
```bash
ls -la src/db/migrations/
# Should contain at least one .sql file
```

3. **Check database tables were created**
```bash
# Using Docker exec (adjust container name if needed)
docker exec -it code-flow-postgres-1 psql -U cf_admin_7x2p -d codeflow -c "\dt"
```

4. **Test database connection**
```bash
npx tsx src/db/test-connection.ts
```

5. **Verify Drizzle Studio works**
```bash
npm run db:studio
# Should open browser to http://localhost:4983 or similar
```

## ⚠️ Expected State After Completion

- **Database schema defined** with all Auth.js required tables
- **Initial migration created** and applied
- **Database tables exist** in PostgreSQL
- **Connection working** and testable
- **Types exported** for use in application
- **Ready for Auth.js integration**

## 📝 Notes

- **Auth.js table structure** follows the official adapter requirements
- **GitHub-specific fields** added to users table for CodeFlow needs
- **PR cache table** prepared for future GitHub API caching
- **TypeScript types** automatically inferred from schema
- **Migration system** ready for future schema changes

## ✅ Success Criteria

- [ ] Schema file created with all required tables
- [ ] Migration generated successfully
- [ ] Migration applied to database
- [ ] All tables exist in PostgreSQL database
- [ ] Database connection test passes
- [ ] Drizzle Studio can connect and show tables
- [ ] TypeScript compilation passes
- [ ] No errors in schema validation

## 📊 Update Migration Status

After completing this step:
[ ] All tables exist in PostgreSQL database
- [ ] Database connection test passes
- [ ] Drizzle Studio can connect and show tables
- [ ] TypeScript compilation passes
- [ ] No errors in schema validation

## 📊 Update Migration Status

After completing this step:
- [ ] Update the status in `README.md`:
  - Change `- [ ] Step 4: Setup Auth Schema` to `- [x] Step 4: Setup Auth Schema ✅`
  - Add completion timestamp
- [ ] Update `00-migration-overview.md` if needed
- [ ] Note any schema design decisions or migration challenges

**Next Step:** Proceed to `05-configure-database.md`
