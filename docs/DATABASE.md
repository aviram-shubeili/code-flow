# Database Management Guide

This guide covers local development setup, production deployment, and troubleshooting for the CodeFlow database infrastructure.

## Quick Start (Local Development)

### Prerequisites
- Docker Desktop installed and running
- Node.js 20+ installed
- Git repository cloned

### Setup Commands
```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Edit .env.local with your values (see Environment Variables section)

# 3. Start PostgreSQL container
npm run db:up

# 4. Run database migrations
npm run db:migrate

# 5. Seed development data
npm run db:seed

# 6. Verify setup
npm run dev
# Visit http://localhost:3000/api/health to check database connection
```

## Environment Variables

### Required Variables

Create a `.env.local` file with these values:

```bash
# Database Configuration
DATABASE_URL="postgresql://codeflow:dev_password@localhost:5432/codeflow_dev"

# Auth.js Configuration  
NEXTAUTH_SECRET="your-secure-secret-min-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth (get from GitHub Developer Settings)
GITHUB_CLIENT_ID="your-github-oauth-app-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-app-client-secret"

# Optional Development Settings
NODE_ENV="development"
LOG_LEVEL="debug"
```

### Production Environment Variables

```bash
# Production Database (RDS)
DATABASE_URL="postgresql://username:password@your-rds-endpoint:5432/codeflow_prod"
DATABASE_SSL="true"
DATABASE_POOL_MIN="2"
DATABASE_POOL_MAX="10"

# Production Auth.js
NEXTAUTH_SECRET="production-secret-min-32-chars"
NEXTAUTH_URL="https://your-domain.com"

# Production GitHub OAuth
GITHUB_CLIENT_ID="production-github-client-id"
GITHUB_CLIENT_SECRET="production-github-client-secret"

NODE_ENV="production"
LOG_LEVEL="info"
```

## Available Scripts

### Development Scripts

| Script | Description |
|--------|-------------|
| `npm run db:up` | Start PostgreSQL container |
| `npm run db:down` | Stop PostgreSQL container |
| `npm run db:logs` | View PostgreSQL container logs |
| `npm run db:reset` | Complete database reset (Windows) |
| `npm run db:reset:unix` | Complete database reset (Unix/Mac) |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:seed` | Seed development data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:push` | Push schema changes without migration |
| `npm run db:pull` | Pull schema from database |

### Test Data Available After Seeding

- **Dev User**: `dev@codeflow.local` (GitHub: `codeflow-dev-user`)
  - 3 repositories: 2 active, 1 inactive
- **Test User**: `test@codeflow.local` (GitHub: `codeflow-test-user`)  
  - 2 repositories: all active
- **Shared Repository**: Organization repository for testing

## Database Schema

### Auth.js Tables (Auto-managed)
- `users` - User accounts from GitHub OAuth
- `accounts` - OAuth provider account details
- `sessions` - User session management
- `verification_tokens` - Email verification tokens

### CodeFlow Business Tables
- `user_profiles` - Extended user information with GitHub data
- `repositories` - Monitored repositories per user

## Development Workflow

### Making Schema Changes

1. **Edit Prisma Schema**
   ```bash
   # Edit prisma/schema.prisma
   ```

2. **Create Migration**
   ```bash
   npm run db:migrate
   # This creates migration files and applies them
   ```

3. **Generate Client**
   ```bash
   npm run db:generate
   # Updates TypeScript types
   ```

### Resetting Local Database

```bash
# Complete reset (Windows)
npm run db:reset

# Manual reset
npm run db:down
npm run db:up
npm run db:migrate
npm run db:seed
```

### Debugging Database Issues

1. **Check Container Status**
   ```bash
   docker-compose ps
   npm run db:logs
   ```

2. **Test Connection**
   ```bash
   # Visit health endpoint
   curl http://localhost:3000/api/health
   ```

3. **Access Database Directly**
   ```bash
   # Using Prisma Studio (recommended)
   npm run db:studio
   
   # Using psql
   docker-compose exec postgres psql -U codeflow -d codeflow_dev
   ```

## Production Deployment

### Database Setup (AWS RDS)

1. **Create RDS PostgreSQL Instance**
   - PostgreSQL 15+
   - Appropriate instance size
   - Enable SSL connections
   - Configure security groups

2. **Set Environment Variables**
   ```bash
   DATABASE_URL="postgresql://username:password@rds-endpoint:5432/dbname?sslmode=require"
   DATABASE_SSL="true"
   ```

3. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

### Connection Pooling

The application uses Prisma's built-in connection pooling optimized for serverless environments:

- **Min Connections**: 2 (configurable via `DATABASE_POOL_MIN`)
- **Max Connections**: 10 (configurable via `DATABASE_POOL_MAX`)
- **Timeout**: 10 seconds
- **Idle Timeout**: 60 seconds

## Troubleshooting

### Common Issues

#### "Docker is not running"
```bash
# Windows: Start Docker Desktop
# Linux/Mac: Start Docker daemon
sudo systemctl start docker
```

#### "Port 5432 already in use"
```bash
# Stop conflicting PostgreSQL service
sudo systemctl stop postgresql

# Or use different port in docker-compose.yml
ports:
  - "5433:5432"
```

#### "Database connection failed"
```bash
# Check container status
docker-compose ps

# Check logs
npm run db:logs

# Verify environment variables
echo $DATABASE_URL
```

#### "Prisma Client not generated"
```bash
npm run db:generate
```

#### "Migration failed"
```bash
# Reset and re-run
npm run db:down
npm run db:up
npm run db:migrate
```

### Environment Validation Errors

The application validates all environment variables on startup. Common fixes:

- Ensure `DATABASE_URL` is properly formatted
- Verify `NEXTAUTH_SECRET` is at least 32 characters
- Check GitHub OAuth credentials are correct
- Confirm all required variables are set in `.env.local`

### Performance Issues

1. **Check Connection Pool**
   - Monitor connection usage in CloudWatch (production)
   - Adjust `DATABASE_POOL_MAX` if needed

2. **Query Performance**
   ```bash
   # Enable query logging in development
   LOG_LEVEL="debug"
   ```

3. **Database Size**
   ```bash
   # Check database size
   docker-compose exec postgres psql -U codeflow -d codeflow_dev -c "SELECT pg_size_pretty(pg_database_size('codeflow_dev'));"
   ```

## Backup and Recovery

### Local Development Backup
```bash
# Backup data
docker-compose exec postgres pg_dump -U codeflow codeflow_dev > backup.sql

# Restore data
docker-compose exec -T postgres psql -U codeflow codeflow_dev < backup.sql
```

### Production Backup
- Use AWS RDS automated backups
- Configure backup retention period
- Test restore procedures regularly

## Support

For database-related issues:
1. Check this troubleshooting guide
2. Review application logs
3. Check GitHub Issues for known problems
4. Contact the development team