# CodeFlow - Technical Context

**Last Updated:** 2025-07-23

## Technology Stack

### Core Framework
- **Next.js 15.3.1** - App Router for modern React development
- **React 19.0.0** - Latest React with Server Components
- **TypeScript 5.x** - Type safety across entire application
- **Node.js** - Runtime environment

### Frontend Technologies
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **Shadcn UI** - Modern component library built on Radix
- **PostCSS** - CSS processing and optimization
- **Prettier** - Code formatting with Tailwind plugin

### Backend & API
- **Next.js API Routes** - Server-side API implementation
- **Auth.js (NextAuth) 5.0.0-beta** - Authentication framework
- **GitHub OAuth 2.0** - User authentication provider
- **GitHub GraphQL API** - Pull request data source

### Database Stack
- **PostgreSQL** - Primary database
- **Drizzle ORM 0.44.2** - Type-safe database queries
- **Drizzle Kit 0.31.1** - Database migrations and management
- **@auth/drizzle-adapter** - Auth.js integration
- **postgres 3.4.7** - PostgreSQL client library

### Development Tools
- **Docker Compose** - Local development environment
- **ESLint 9.x** - Code linting with Next.js config
- **Prettier 3.5.3** - Code formatting
- **TSX 4.20.3** - TypeScript execution for scripts
- **dotenv-cli** - Environment variable management

## Development Environment

### Local Setup Requirements
- **Node.js 18+** - Runtime environment
- **Docker & Docker Compose** - Container orchestration
- **Git** - Version control
- **PowerShell (pwsh.exe)** - Default shell on Windows

### Environment Configuration
```bash
# Core environment files
.env.local              # Local development secrets (not committed)
.env.local.example      # Template for environment setup
docker-compose.yml      # Container orchestration
drizzle.config.ts       # Database configuration
```

### Development Scripts (package.json)
```json
{
  "dev": "next dev --turbopack",           # Next.js dev server with Turbopack
  "docker:up": "docker compose --env-file .env.local up -d",
  "docker:down": "docker compose --env-file .env.local down",
  "dev:all": "npm run docker:up && npm run dev",
  
  "db:generate": "drizzle-kit generate",    # Generate migrations
  "db:migrate": "drizzle-kit migrate",      # Run migrations
  "db:push": "drizzle-kit push",           # Push schema changes
  "db:studio": "drizzle-kit studio",       # Database GUI
  
  "auth:test": "tsx src/db/test-auth-integration.ts",
  "db:health": "curl -f http://localhost:3000/api/health/db"
}
```

## Database Configuration

### PostgreSQL Setup
- **Version:** Latest PostgreSQL via Docker
- **Port:** 5432 (internal), configurable external port
- **Development:** Docker Compose with volume persistence
- **Administration:** pgAdmin 4 for database management

### Drizzle ORM Configuration
```typescript
// drizzle.config.ts
{
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
}
```

### Auth.js Integration
- **Adapter:** Drizzle adapter for Auth.js
- **Schema:** Standard Auth.js tables (User, Account, Session, VerificationToken)
- **Provider:** GitHub OAuth with proper scopes
- **Session Strategy:** Database sessions for security

## External Integrations

### GitHub API
- **Authentication:** OAuth 2.0 with GitHub provider
- **API Version:** GitHub GraphQL API v4
- **Required Scopes:** repo, user:email, read:user
- **Rate Limiting:** 5000 requests/hour for authenticated users
- **Data Requirements:**
  - Pull requests where user is reviewer (assigned/requested)
  - Pull requests authored by user
  - PR review states and comments
  - Author information and avatars
  - Code change statistics (+/- lines)

### Required Environment Variables
```bash
# Auth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generated-secret>

# GitHub OAuth
GITHUB_CLIENT_ID=<oauth-app-id>
GITHUB_CLIENT_SECRET=<oauth-app-secret>

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/codeflow

# Docker Services
POSTGRES_USER=<db-user>
POSTGRES_PASSWORD=<db-password>
POSTGRES_DB=codeflow
PGADMIN_DEFAULT_EMAIL=<admin-email>
PGADMIN_DEFAULT_PASSWORD=<admin-password>
```

## Build & Deployment

### Build Process
- **TypeScript Compilation** - Strict type checking
- **Prettier Formatting** - Code formatting validation
- **Next.js Build** - Optimized production build with static assets
- **Bundle Analysis** - Size optimization and tree-shaking

### Quality Gates
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting standards
- **TypeScript** - Type safety verification
- **Build Success** - Compilation without errors

### Deployment Strategy (AWS)
- **Environments:** Development, Staging, Production with isolated resources
- **Frontend:** Next.js static assets to S3 + CloudFront CDN
- **Backend:** AWS Lambda functions via API Gateway
- **Database:** Amazon RDS PostgreSQL (Free Tier eligible)
- **CI/CD:** GitHub Actions for automated deployment pipeline

### Container Strategy
- **Development:** Docker Compose for local services (PostgreSQL + pgAdmin)
- **Production:** Serverless deployment (Lambda functions)
- **Database:** Containerized PostgreSQL with persistent volumes locally

## Security Considerations

### Authentication Security
- **Token Storage:** Server-side only, never client-side
- **Session Management:** Secure HTTP-only cookies
- **CSRF Protection:** Built into Auth.js
- **HTTPS:** Required in production

### Environment Security
- **Secrets Management:** Environment variables only
- **Git Exclusion:** .env.local in .gitignore
- **Access Control:** Minimal required OAuth scopes
- **Database:** Strong passwords and restricted access

### API Security
- **Rate Limiting:** Respect GitHub API limits
- **Input Validation:** Server-side validation
- **Error Handling:** No sensitive data in error responses
- **CORS:** Proper cross-origin request handling

## Performance & Monitoring

### Application Performance
- **Server Components:** Default for better performance
- **Bundle Optimization:** Tree-shaking and code splitting
- **Caching Strategy:** API response caching where appropriate
- **Database Optimization:** Efficient queries with Drizzle

### Development Performance
- **Turbopack:** Fast development builds
- **Hot Module Replacement:** Instant updates during development
- **TypeScript:** Incremental compilation
- **Docker:** Efficient container startup

### Monitoring & Health Checks
- **Database Health:** `/api/health/db` endpoint
- **Docker Status:** Container monitoring scripts
- **Build Verification:** Automated build checks
- **Error Logging:** Comprehensive error tracking

This technical foundation supports both the learning objectives and production-quality requirements of the CodeFlow project.
