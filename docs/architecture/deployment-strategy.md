# Deployment Strategy

This section defines the deployment architecture for CodeFlow using **Vercel** for hosting and **Neon** for serverless PostgreSQL. This strategy prioritizes simplicity, zero-cost MVP development, and the ability to scale if the project grows.

## Philosophy: Start Simple, Scale When Needed

CodeFlow is a personal project that may be shared with a small team. The deployment strategy reflects this:

- **Zero infrastructure management** - No VPCs, security groups, or CDK
- **Free tier friendly** - $0/month for MVP development
- **5-minute deployment** - Push to GitHub, done
- **Easy migration path** - Can move to AWS/enterprise infrastructure later if needed

## Architecture Overview

```mermaid
graph TB
    subgraph "Vercel Platform"
        VERCEL[Vercel Hosting]
        EDGE[Edge Network / CDN]
        FUNCTIONS[Serverless Functions]
    end

    subgraph "Neon (Serverless PostgreSQL)"
        NEON[(Neon PostgreSQL)]
        POOLER[Connection Pooler]
    end

    subgraph "External Services"
        GITHUB[GitHub OAuth & API]
        REPO[Git Repository]
    end

    subgraph "Local Development"
        DOCKER[Docker PostgreSQL]
        NEXTJS_DEV[Next.js Dev Server]
    end

    REPO --> VERCEL
    VERCEL --> EDGE
    VERCEL --> FUNCTIONS
    FUNCTIONS --> POOLER
    POOLER --> NEON
    FUNCTIONS --> GITHUB

    NEXTJS_DEV --> DOCKER

    classDef vercel fill:#000,stroke:#fff,color:#fff
    classDef neon fill:#00e599,stroke:#000,color:#000
    classDef external fill:#4285f4,stroke:#1a73e8,color:#fff
    classDef local fill:#666,stroke:#333,color:#fff

    class VERCEL,EDGE,FUNCTIONS vercel
    class NEON,POOLER neon
    class GITHUB,REPO external
    class DOCKER,NEXTJS_DEV local
```

## Platform Selection

### Vercel (Frontend + API Hosting)

| Feature                 | Value                           |
| ----------------------- | ------------------------------- |
| **Cost**                | Free (Hobby tier)               |
| **Next.js Support**     | Native (Vercel created Next.js) |
| **Deployment**          | Push to GitHub → Auto deploy    |
| **Preview Deployments** | Automatic for PRs               |
| **Edge Network**        | Global CDN included             |
| **SSL**                 | Automatic HTTPS                 |
| **Functions**           | Serverless, auto-scaling        |

**Hobby Tier Limits (Free Forever):**

- 100 GB bandwidth/month
- 100 deployments/day
- 1M function invocations/month
- 100 GB-hours function duration
- 6,000 build minutes/month

### Neon (Serverless PostgreSQL)

| Feature                  | Value                                     |
| ------------------------ | ----------------------------------------- |
| **Cost**                 | Free tier available                       |
| **PostgreSQL Version**   | 15+                                       |
| **Connection Pooling**   | Built-in (PgBouncer)                      |
| **Branching**            | Database branches for preview deployments |
| **Prisma Compatible**    | Full support                              |
| **Serverless Optimized** | Auto-suspend, instant wake                |

**Free Tier Limits:**

- 0.5 GB storage
- 1 project
- 10 branches
- Unlimited compute hours (with auto-suspend)

## Deployment Configuration

### Vercel Setup

**1. Connect Repository**

```bash
# Install Vercel CLI (optional, can use web UI)
npm i -g vercel

# Link project
vercel link

# Deploy
vercel
```

**2. Environment Variables (Vercel Dashboard)**

```env
# Database (from Neon)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/codeflow?sslmode=require

# Authentication
NEXTAUTH_URL=https://codeflow.vercel.app
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# GitHub OAuth
GITHUB_CLIENT_ID=<from-github-oauth-app>
GITHUB_CLIENT_SECRET=<from-github-oauth-app>
```

**3. Build Settings (Auto-detected for Next.js)**

| Setting          | Value           |
| ---------------- | --------------- |
| Framework Preset | Next.js         |
| Build Command    | `npm run build` |
| Output Directory | `.next`         |
| Install Command  | `npm ci`        |

### Neon Setup

**1. Create Project**

1. Sign up at [neon.tech](https://neon.tech)
2. Create new project: `codeflow`
3. Select region: `US East (N. Virginia)` (closest to Vercel's default)
4. Copy connection string

**2. Connection String Format**

```env
# For Prisma (use pooled connection)
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.us-east-1.aws.neon.tech/codeflow?sslmode=require

# For migrations (use direct connection)
DIRECT_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/codeflow?sslmode=require
```

**3. Prisma Configuration**

```prisma
// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## CI/CD Pipeline

### GitHub Actions (Quality Gates)

**File:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: 20

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Test
        run: npm run test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

      - name: Build
        run: npm run build
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          NEXTAUTH_SECRET: test-secret

  # Vercel handles actual deployment automatically
```

### Database Migrations

**Option 1: Manual (Recommended for MVP)**

```bash
# Run migrations locally against Neon
npx prisma migrate deploy
```

**Option 2: GitHub Action (For Production)**

```yaml
# Add to ci.yml after quality job
migrate:
  needs: quality
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: 'npm'
    - run: npm ci
    - run: npx prisma migrate deploy
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Environment Strategy

### Local Development

```bash
# Use Docker PostgreSQL (already configured)
npm run db:up
npm run dev
```

### Preview Deployments (Pull Requests)

- Vercel automatically creates preview URLs
- Use shared Neon development branch
- URL format: `codeflow-git-{branch}-{username}.vercel.app`

### Production

- Deploys from `main` branch
- Uses Neon production database
- URL: `codeflow.vercel.app` (or custom domain)

## Cost Analysis

### MVP Phase (Free)

| Service   | Tier  | Monthly Cost |
| --------- | ----- | ------------ |
| Vercel    | Hobby | $0           |
| Neon      | Free  | $0           |
| GitHub    | Free  | $0           |
| **Total** |       | **$0**       |

### Growth Phase (If Needed)

| Service   | Tier   | Monthly Cost |
| --------- | ------ | ------------ |
| Vercel    | Pro    | $20          |
| Neon      | Launch | $19          |
| **Total** |        | **$39**      |

### When to Upgrade

- **Vercel Pro**: Commercial use, team collaboration, or hitting Hobby limits
- **Neon Launch**: >0.5 GB storage or need multiple production databases

## Scaling Path

If CodeFlow grows beyond a personal project:

```
Current (Free)          →    Growth ($39/mo)       →    Enterprise
─────────────────────────────────────────────────────────────────
Vercel Hobby            →    Vercel Pro            →    Vercel Enterprise
Neon Free               →    Neon Launch           →    AWS RDS / Aurora
Local Docker            →    Neon Branching        →    Dedicated staging
Manual migrations       →    Automated CI/CD       →    Full GitOps
```

## Quick Start Deployment

### First-Time Setup

```bash
# 1. Create Neon database
# → Go to neon.tech, create project, copy connection string

# 2. Deploy to Vercel
npx vercel

# 3. Add environment variables in Vercel Dashboard
# → Settings → Environment Variables

# 4. Run migrations
npx prisma migrate deploy

# 5. Done! Your app is live
```

### Ongoing Development

```bash
# Local development
npm run dev

# Push changes (auto-deploys to Vercel)
git push origin main

# Database changes
npx prisma migrate dev    # Create migration
npx prisma migrate deploy # Apply to production
```

## Comparison: Why Vercel + Neon vs AWS Amplify

| Factor                  | Vercel + Neon     | AWS Amplify + RDS    |
| ----------------------- | ----------------- | -------------------- |
| **Setup Time**          | 5 minutes         | Hours                |
| **Monthly Cost (MVP)**  | $0                | $15-25 (RDS minimum) |
| **Infrastructure Code** | None              | CDK/TypeScript       |
| **Learning Curve**      | Minimal           | Steep                |
| **Next.js Integration** | Native            | Good                 |
| **Scaling Complexity**  | Upgrade tier      | Significant changes  |
| **Migration Path**      | Easy to AWS later | Already on AWS       |

**Bottom Line**: For a personal project that might be shared with a team, Vercel + Neon provides the fastest path to production with zero cost and minimal complexity. If CodeFlow becomes a commercial product, migration to AWS is straightforward.
