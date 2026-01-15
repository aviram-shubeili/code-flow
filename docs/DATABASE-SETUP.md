# Database Setup Guide

This guide covers local development database setup, management, and troubleshooting for CodeFlow.

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 22.12+ installed
- npm or yarn package manager

### Initial Setup

1. **Start the PostgreSQL container:**
   ```powershell
   npm run db:up
   ```

2. **Run database migrations:**
   ```powershell
   npm run db:migrate
   ```

3. **Seed development data:**
   ```powershell
   npm run db:seed
   ```

4. **(Optional) Open Prisma Studio to inspect data:**
   ```powershell
   npm run db:studio
   ```

## Available Commands

### Database Lifecycle

| Command | Description |
|---------|-------------|
| `npm run db:up` | Start PostgreSQL container in detached mode |
| `npm run db:down` | Stop and remove PostgreSQL container |
| `npm run db:logs` | View PostgreSQL container logs |
| `npm run db:reset` | Complete reset: stop, start, migrate, and seed |

### Prisma Operations

| Command | Description |
|---------|-------------|
| `npm run db:migrate` | Run pending migrations (development) |
| `npm run db:migrate:deploy` | Deploy migrations (production) |
| `npm run db:generate` | Regenerate Prisma Client from schema |
| `npm run db:seed` | Seed database with development data |
| `npm run db:studio` | Open Prisma Studio (visual database browser) |

### Test Database

| Command | Description |
|---------|-------------|
| `npm run db:test:up` | Start test PostgreSQL container (port 5433) |
| `npm run db:test:down` | Stop test PostgreSQL container |

> **Note:** The test database uses `tmpfs` (in-memory storage) for faster test execution. Test data is intentionally ephemeral and will be lost when the container stops. This is by design to ensure clean test isolation.

## Database Schema

### Auth.js Tables

CodeFlow uses [Auth.js (NextAuth.js v5)](https://authjs.dev/) for authentication with database sessions:

- **users** - User accounts
- **accounts** - OAuth provider accounts (GitHub)
- **sessions** - Active user sessions
- **verification_tokens** - Email verification tokens

### CodeFlow Business Tables

- **user_profiles** - Extended user profile data (GitHub ID, username, activity tracking)
- **repositories** - Monitored repositories with activation status

## Development Data

After seeding, the following test data is available:

### Test Users

| Email | GitHub ID | Username | Repositories |
|-------|-----------|----------|--------------|
| dev@codeflow.dev | 123456789 | dev-user | 3 (2 active, 1 inactive) |
| dev2@codeflow.dev | 987654321 | dev-user-2 | 0 |

### Test Repositories

| Full Name | GitHub ID | Status |
|-----------|-----------|--------|
| dev-org/codeflow | 1001 | Active |
| dev-org/test-repo | 1002 | Active |
| dev-org/archived-repo | 1003 | Inactive |

## Environment Variables

### Local Development (.env.local)

```bash
# Main database connection
DATABASE_URL="postgresql://codeflow:dev_password@localhost:5432/codeflow_dev"

# Test database connection
TEST_DATABASE_URL="postgresql://test_user:test_pass@localhost:5433/codeflow_test"
```

### Production

Production database URL should be configured through Vercel Environment Variables:

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.us-east-1.aws.neon.tech/codeflow?sslmode=require"
```

**Important:** Never commit production credentials to version control.

## Database Management Scripts

### PowerShell Scripts (Windows)

Located in `scripts/` directory:

- **db-reset.ps1** - Reset local database
- **db-seed.ps1** - Seed database with development data

```powershell
# Run PowerShell scripts directly
.\scripts\db-reset.ps1
.\scripts\db-seed.ps1
```

### Bash Scripts (Linux/Mac)

- **db-reset.sh** - Reset local database
- **db-seed.sh** - Seed database with development data

```bash
# Make scripts executable (first time only)
chmod +x scripts/db-*.sh

# Run bash scripts
./scripts/db-reset.sh
./scripts/db-seed.sh
```

## Troubleshooting

### Container Won't Start

**Problem:** `docker-compose up` fails or container exits immediately.

**Solutions:**
1. Check if port 5432 is already in use:
   ```powershell
   netstat -ano | findstr :5432
   ```
2. Stop other PostgreSQL instances or change port in `docker-compose.yml`
3. Check Docker logs:
   ```powershell
   npm run db:logs
   ```

### Cannot Connect to Database

**Problem:** `ECONNREFUSED` or connection timeout errors.

**Solutions:**
1. Verify container is running:
   ```powershell
   docker ps | findstr codeflow-postgres
   ```
2. Wait for container to be healthy (check healthcheck status)
3. Verify DATABASE_URL in `.env.local` matches container configuration

### Migration Errors

**Problem:** `prisma migrate` fails with schema conflicts.

**Solutions:**
1. Check migration status:
   ```powershell
   npx prisma migrate status
   ```
2. For development, reset database:
   ```powershell
   npm run db:reset
   ```
3. Never edit migration files manually - create new migrations instead

### Prisma Client Out of Sync

**Problem:** TypeScript errors about missing Prisma Client types.

**Solutions:**
1. Regenerate Prisma Client:
   ```powershell
   npm run db:generate
   ```
2. Restart TypeScript server in VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Seed Script Fails

**Problem:** Seeding fails with duplicate key or constraint violations.

**Solutions:**
1. Reset database (will clear all data):
   ```powershell
   npm run db:reset
   ```
2. Check that migrations are up to date before seeding

## Production Database Configuration

### Neon PostgreSQL Setup

1. **Create Neon Project:**
   - Sign up at [neon.tech](https://neon.tech)
   - Create new project: `codeflow`
   - Select region: `US East (N. Virginia)` (closest to Vercel's default)
   - Copy connection string

2. **Connection String Format:**
   ```bash
   # For Prisma (use pooled connection)
   DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.us-east-1.aws.neon.tech/codeflow?sslmode=require"
   
   # For migrations (use direct connection)
   DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/codeflow?sslmode=require"
   ```

3. **Prisma Configuration:**
   
   When deploying to production with Neon, update `prisma/schema.prisma` to include `directUrl`:
   ```prisma
   // prisma/schema.prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")  // Required for Neon pooler migrations
   }
   ```
   
   > **Note:** The current schema omits `directUrl` for local development simplicity. This will be configured in Story 0.7 (Infrastructure Setup) when production deployment is implemented.

4. **Connection Pooling:**
   - Neon includes PgBouncer-based connection pooling
   - Optimized for serverless with auto-suspend and instant wake
   - Configured for Vercel Functions environment

5. **Environment Variables (Vercel Dashboard):**
   - Go to Project Settings → Environment Variables
   - Add `DATABASE_URL` with pooled connection string
   - Add `DIRECT_URL` with direct connection string (for migrations)

### Deployment Migrations

Run migrations during deployment:

```bash
# In CI/CD pipeline (GitHub Actions)
npx prisma migrate deploy
```

**Never** use `prisma migrate dev` in production - it's for development only.

## Backup and Recovery

### Local Development

Data is persisted in Docker volume `code-flow_postgres_data`. To backup:

```powershell
docker exec codeflow-postgres pg_dump -U codeflow codeflow_dev > backup.sql
```

To restore:

```powershell
docker exec -i codeflow-postgres psql -U codeflow codeflow_dev < backup.sql
```

### Production (Neon)

Neon provides automatic point-in-time recovery:

1. **Branching**: Create database branches for testing migrations
2. **Point-in-time Recovery**: Restore to any point within retention window
3. **Free Tier**: 7-day history retention
4. **Launch Tier**: 30-day history retention

To create a backup branch:
```bash
# Via Neon Console or API
# Create a branch from a specific point in time for testing
```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Auth.js Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Neon Documentation](https://neon.tech/docs)
