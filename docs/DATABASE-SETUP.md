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

Production database URL should be configured through AWS Secrets Manager or environment variable injection:

```bash
DATABASE_URL="postgresql://username:password@rds-endpoint.region.rds.amazonaws.com:5432/codeflow_prod"
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

### AWS RDS PostgreSQL Setup

1. **Create RDS Instance:**
   - PostgreSQL 15.x
   - Instance class: t3.micro (free tier) or larger
   - Storage: 20GB minimum
   - Enable Multi-AZ for production
   - Enable automated backups

2. **Security Configuration:**
   - VPC security group allowing inbound traffic on port 5432 from Lambda security group
   - SSL/TLS encryption required
   - Parameter group with `rds.force_ssl = 1`

3. **Connection Pooling:**
   - Prisma handles connection pooling automatically
   - Optimized for serverless with connection limits
   - Configured for Lambda execution environment

4. **Environment Variables:**
   ```bash
   DATABASE_URL="postgresql://username:password@<rds-endpoint>:5432/codeflow_prod?sslmode=require"
   ```

### Deployment Migrations

Run migrations during deployment:

```bash
# In CI/CD pipeline or deployment script
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

### Production

AWS RDS automated backups are configured during instance creation. Additionally:

1. Enable point-in-time recovery
2. Configure backup retention period (7-35 days)
3. Test restore procedures regularly
4. Consider cross-region backup replication for disaster recovery

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Auth.js Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [AWS RDS PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
