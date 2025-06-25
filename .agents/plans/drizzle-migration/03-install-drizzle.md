# Step 3: Install and Configure Drizzle

**Estimated Time:** 30-45 minutes  
**Prerequisites:** Steps 1-2 completed  
**Dependencies:** Documentation updated

## 🎯 Objective

Install Drizzle ORM and its dependencies, set up basic configuration for PostgreSQL integration.

## 📋 Tasks

### 3.1 Install Drizzle Dependencies

**Core Drizzle packages (per Auth.js docs):**
```bash
# Install Auth.js Drizzle adapter and core ORM
npm install drizzle-orm @auth/drizzle-adapter

# Install development tools
npm install -D drizzle-kit
```

**PostgreSQL driver options (choose one):**

**Option A: postgres.js (Recommended for Edge compatibility)**
```bash
npm install postgres
```

**Option B: node-postgres (Traditional choice)**
```bash
npm install pg
npm install -D @types/pg
```

**For CodeFlow, we'll use postgres.js as it's more Edge-friendly:**
```bash
npm install postgres
npm install -D @types/postgres
```

### 3.2 Create Drizzle Configuration

**File: `drizzle.config.ts`** (Create in project root)

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### 3.3 Create Database Schema Directory Structure

Create the following directory structure:

```
src/db/
├── schema.ts          # Database schema definitions
├── index.ts           # Database connection and exports
└── migrations/        # Migration files (auto-generated)
```

**Commands:**

```bash
mkdir src/db
mkdir src/db/migrations
touch src/db/schema.ts
touch src/db/index.ts
```

### 3.4 Create Database Connection

**File: `src/db/index.ts`**

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

### 3.5 Add Drizzle Scripts to package.json

**File: `package.json`** - Add to scripts section:

```json
{
  "scripts": {
    "db:generate": "dotenv -e .env.local -- drizzle-kit generate",
    "db:migrate": "dotenv -e .env.local -- drizzle-kit migrate",
    "db:push": "dotenv -e .env.local -- drizzle-kit push",
    "db:studio": "dotenv -e .env.local -- drizzle-kit studio",
    "db:drop": "dotenv -e .env.local -- drizzle-kit drop"
  }
}
```

**Note:** Using `dotenv-cli` ensures our scripts can read from `.env.local`

### 3.6 Handle Environment Variables

**IMPORTANT**: Drizzle Kit does NOT natively support `.env.local` files - it only reads from `process.env` and standard `.env` files.

**Install dotenv-cli for script support:**

```bash
npm install -D dotenv-cli
```

**File: `.env.local`** - Ensure you have:

```bash
# Database (should already exist from previous setup)
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/codeflow"

# Auth.js (should already exist)
AUTH_SECRET="your-secret-key"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

**Note:** The Auth.js documentation mentions `AUTH_DRIZZLE_URL` but this is optional since we're passing the database connection directly to the adapter.

### 3.7 Create TypeScript Configuration for Drizzle

Ensure `tsconfig.json` supports the necessary features:

**Check `tsconfig.json` has:**

```json
{
  "compilerOptions": {
    "experimentalDecorators": false, // Drizzle doesn't need decorators
    "strict": true, // Important for type safety
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## 🧪 Validation Steps

1. **Check dependency installation**

```bash
npm list drizzle-orm @auth/drizzle-adapter postgres drizzle-kit
```

2. **Verify Drizzle Kit CLI**

```bash
npx drizzle-kit --version
```

3. **Test configuration loading**

```bash
# This should show the config without errors (using dotenv for .env.local)
dotenv -e .env.local -- npx drizzle-kit studio --config=drizzle.config.ts
# Press Ctrl+C to exit immediately - just testing config loading
```

4. **Verify directory structure**

```bash
ls -la src/db/
# Should show: schema.ts, index.ts, migrations/
```

5. **Check TypeScript compilation**

```bash
# Should compile without errors (though runtime will fail until schema is complete)
npx tsc --noEmit
```

## ⚠️ Expected State After Completion

- **Drizzle dependencies installed** and available
- **Configuration files created** but schema is empty
- **Database connection setup** but not yet tested
- **Scripts ready** for database operations
- **TypeScript compiles** but runtime will fail until schema is complete

## 📝 Notes

- **postgres.js vs node-postgres**: We chose `postgres` (postgres.js) over `pg` (node-postgres) for better Edge runtime compatibility
- **drizzle-kit** is the CLI tool for migrations, introspection, and Drizzle Studio
- **@auth/drizzle-adapter** enables Auth.js integration (version aligned with Auth.js docs)
- **Configuration is flexible** - can be adjusted for different environments
- **Schema will be empty initially** - Step 4 will define the Auth.js tables

## 🔍 Documentation Verification

This plan has been verified against:
- ✅ [Auth.js Drizzle Adapter docs](https://authjs.dev/getting-started/adapters/drizzle) 
- ✅ [Drizzle PostgreSQL docs](https://orm.drizzle.team/docs/get-started-postgresql)
- ✅ Official installation commands match Auth.js requirements
- ✅ Database connection pattern follows Drizzle best practices

## ✅ Success Criteria

- [ ] All Drizzle packages installed successfully
- [ ] `drizzle.config.ts` created and valid
- [ ] `src/db/` directory structure created
- [ ] Database connection file created
- [ ] Package.json scripts added
- [ ] Environment variables verified
- [ ] TypeScript configuration compatible
- [ ] Drizzle Kit CLI accessible and working

## 📊 Update Migration Status

After completing this step:

- [ ] Update the status in `README.md`:
  - Change `- [ ] Step 3: Install Drizzle` to `- [x] Step 3: Install Drizzle ✅`
  - Add completion timestamp
- [ ] Update `00-migration-overview.md` if needed
- [ ] Note any installation challenges or configuration adjustments made

**Next Step:** Proceed to `04-setup-auth-schema.md`
