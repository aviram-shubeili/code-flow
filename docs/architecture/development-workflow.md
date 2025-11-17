# Development Workflow

This section defines the local development setup, commands, and processes for contributing to CodeFlow.

### Development Sprint Organization

**Strategic Approach: Features-First Development**

CodeFlow follows a features-first development strategy, building core functionality before finalizing infrastructure decisions. This approach enables architecture decisions based on real requirements rather than theoretical needs.

**Sprint Structure:**
- **Sprint 1 (Weeks 1-2)**: Next.js foundation + GitHub integration  
- **Sprint 2 (Weeks 3-4)**: Dashboard UI + core features
- **Sprint 3 (Weeks 5-6)**: Infrastructure decision + deployment

### Local Development Setup

#### Prerequisites

**Required Software:**
```bash
# Node.js 18+ (recommended via nvm)
nvm install 18
nvm use 18

# PostgreSQL 15+ (for Sprint 1)
# macOS:
brew install postgresql@15
brew services start postgresql@15

# Windows:
# Download from https://www.postgresql.org/download/windows/

# AWS CLI (for Sprint 3 infrastructure deployment)
# macOS:
brew install awscli

# Windows:
# Download from https://aws.amazon.com/cli/
```

#### Initial Setup

**Clone and Setup:**
```bash
# Clone repository
git clone https://github.com/your-org/codeflow.git
cd codeflow

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Setup database
createdb codeflow_dev
npm run db:push
npm run db:seed

# Generate Prisma client
npm run db:generate

# Start development server
npm run dev
```

#### Development Commands

**Core Development:**
```bash
# Start development server (http://localhost:3000)
npm run dev

# Type checking (recommended in separate terminal)
npm run type-check --watch

# Database management
npm run db:studio          # Open Prisma Studio
npm run db:migrate          # Create and apply migration
npm run db:reset           # Reset database and reseed

# Sprint 1 Development Focus
npm run dev:github         # GitHub API integration testing
npm run test:auth          # Authentication flow testing
npm run analyze:infra      # Infrastructure requirements analysis

# Testing
npm run test               # Unit tests
npm run test:watch         # Watch mode
npm run test:e2e          # E2E tests
npm run test:e2e:ui       # E2E tests with UI

# Code quality
npm run lint              # ESLint
npm run format            # Prettier
npm run type-check        # TypeScript
```

**Build and Deployment:**
```bash
# Production build
npm run build
npm run start

# Bundle analysis
npm run analyze

# Infrastructure deployment
npm run cdk:deploy        # Deploy to AWS
npm run cdk:destroy       # Destroy AWS resources
```

### Environment Configuration

#### Development Environment Variables

```bash
# .env.local (development)
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/codeflow_dev"

# Auth.js
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth (create at https://github.com/settings/developers)
GITHUB_CLIENT_ID="your-github-oauth-app-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-app-client-secret"

# Optional: Development settings
NODE_ENV="development"
LOG_LEVEL="debug"
```

#### GitHub OAuth App Setup

**Create GitHub OAuth App:**
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. **Application name**: CodeFlow Development  
4. **Homepage URL**: `http://localhost:3000`
5. **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
6. Copy Client ID and Client Secret to `.env.local`

#### Database Setup Scripts

**Database initialization:**
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding development database...')
  
  // Create test user profile
  const testUser = await prisma.user.create({
    data: {
      email: 'dev@codeflow.dev',
      name: 'Development User',
      image: 'https://avatars.githubusercontent.com/u/1?v=4',
    }
  })

  await prisma.userProfile.create({
    data: {
      userId: testUser.id,
      githubId: 123456789,
      username: 'dev-user',
    }
  })

  // Create test repositories
  await prisma.repository.createMany({
    data: [
      {
        githubId: 1,
        name: 'codeflow',
        fullName: 'your-org/codeflow',
        owner: 'your-org',
        isActive: true,
        userId: testUser.id,
      },
      {
        githubId: 2,
        name: 'test-repo',
        fullName: 'your-org/test-repo',
        owner: 'your-org',
        isActive: false,
        userId: testUser.id,
      },
    ]
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Testing Strategy

#### Unit Testing (Vitest + Testing Library)

**Component Testing:**
```typescript
// tests/components/dashboard/PullRequestCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { PullRequestCard } from '@/components/dashboard/PullRequestCard'
import { mockPullRequest } from '../../fixtures/github-responses'

describe('PullRequestCard', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    mockOnClick.mockClear()
  })

  it('renders PR information correctly', () => {
    render(
      <PullRequestCard
        pullRequest={mockPullRequest}
        section="needsReview"
        onClick={mockOnClick}
      />
    )

    expect(screen.getByText(mockPullRequest.title)).toBeInTheDocument()
    expect(screen.getByText(`#${mockPullRequest.number}`)).toBeInTheDocument()
    expect(screen.getByText('Review Requested')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    render(
      <PullRequestCard
        pullRequest={mockPullRequest}
        section="needsReview"
        onClick={mockOnClick}
      />
    )

    fireEvent.click(screen.getByRole('article'))
    expect(mockOnClick).toHaveBeenCalledWith(mockPullRequest)
  })
})
```

**API Hook Testing:**
```typescript
// tests/hooks/api/useDashboard.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDashboard } from '@/hooks/api/useDashboard'
import { mockDashboardData } from '../../fixtures/github-responses'

// Mock API client
jest.mock('@/lib/api-client', () => ({
  apiRequest: jest.fn(),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useDashboard', () => {
  it('fetches dashboard data successfully', async () => {
    const mockApiRequest = require('@/lib/api-client').apiRequest
    mockApiRequest.mockResolvedValue(mockDashboardData)

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockDashboardData)
  })
})
```

#### Integration Testing (Vitest + Supertest + Real Database)

**Integration tests validate interactions between layers using real database and mocked external services.**

**Database Layer Integration:**
```typescript
// tests/integration/database/user-repository.test.ts
import { prisma } from '@/lib/prisma'
import { DatabaseService } from '@/lib/database'

describe('User Repository Integration', () => {
  beforeEach(async () => {
    // Clean database before each test - NO MOCKING
    await prisma.$executeRaw`TRUNCATE TABLE users, user_profiles, repositories CASCADE`
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('creates user profile with GitHub data', async () => {
    const db = new DatabaseService()
    const userData = {
      userId: 'test-user-id',
      githubId: 12345,
      username: 'testuser'
    }
    
    const profile = await db.createUserProfile(userData)
    
    // Verify data persisted to real database
    expect(profile.id).toBeDefined()
    expect(profile.githubId).toBe(12345)
    
    const dbProfile = await prisma.userProfile.findUnique({
      where: { githubId: 12345 }
    })
    expect(dbProfile).toBeTruthy()
  })
})
```

**API Route Integration with Mocked External Services:**
```typescript
// tests/integration/api/pull-requests.test.ts
import request from 'supertest'
import { createTestApp } from '../../helpers/test-app'
import { mockGitHubPRs } from '../../fixtures/github-responses'

// Mock GitHub API (external service) but use REAL database
vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    rest: {
      pulls: {
        list: vi.fn().mockResolvedValue({ data: mockGitHubPRs })
      }
    }
  }))
}))

describe('GET /api/pull-requests', () => {
  let app: any
  
  beforeAll(async () => {
    app = await createTestApp()
  })
  
  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE users, sessions CASCADE`
  })

  it('returns 401 when not authenticated', async () => {
    const response = await request(app).get('/api/pull-requests')
    expect(response.status).toBe(401)
  })
  
  it('returns dashboard data for authenticated user', async () => {
    // Create real user in test database
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' }
    })
    const session = await createTestSession(user.id)
    
    const response = await request(app)
      .get('/api/pull-requests')
      .set('Cookie', `session-token=${session.sessionToken}`)
    
    expect(response.status).toBe(200)
    expect(response.body.needsReview).toBeArray()
  })
})
```

**Test Database Configuration:**
```typescript
// vitest.config.integration.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/integration/setup.ts'],
    threads: false, // Run serially to avoid DB conflicts
    testTimeout: 10000, // Longer timeout for DB operations
    include: ['tests/integration/**/*.test.ts']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})
```

```typescript
// tests/integration/setup.ts
import { exec } from 'child_process'
import { promisify } from 'util'
import dotenv from 'dotenv'

const execAsync = promisify(exec)

// Load test environment variables
dotenv.config({ path: '.env.test' })

beforeAll(async () => {
  // Ensure test database is running
  console.log('Starting test database...')
  await execAsync('docker-compose up -d postgres-test')
  
  // Run migrations on test database
  await execAsync('DATABASE_URL=$TEST_DATABASE_URL npx prisma migrate deploy')
}, 30000)

afterAll(async () => {
  console.log('Integration tests complete')
})
```

**Docker Test Database Setup:**
```yaml
# docker-compose.yml addition
postgres-test:
  image: postgres:15
  environment:
    POSTGRES_DB: codeflow_test
    POSTGRES_USER: test_user
    POSTGRES_PASSWORD: test_pass
  ports:
    - "5433:5432"
  tmpfs:
    - /var/lib/postgresql/data  # In-memory for speed
```

#### E2E Testing (Playwright)

**Authentication Flow:**
```typescript
// tests/e2e/authentication.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can sign in with GitHub', async ({ page }) => {
    await page.goto('/')
    
    // Click sign in button
    await page.click('text=Sign in with GitHub')
    
    // Should redirect to GitHub OAuth (or mock in test env)
    await expect(page).toHaveURL(/github\.com\/login\/oauth/)
    
    // Mock OAuth callback success
    await page.goto('/api/auth/callback/github?code=mock-code&state=mock-state')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('protected routes redirect to sign in', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to sign in page
    await expect(page).toHaveURL('/auth/signin')
    await expect(page.locator('h1')).toContainText('Sign in')
  })
})
```

**Dashboard Functionality:**
```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test'
import { mockGitHubUser, mockDashboardData } from '../fixtures/github-responses'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated session
    await page.addInitScript(() => {
      window.sessionStorage.setItem('next-auth.session-token', 'mock-token')
    })
    
    // Mock API responses
    await page.route('/api/pull-requests', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDashboardData),
      })
    })
  })

  test('displays dashboard sections correctly', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check all four sections are present
    await expect(page.locator('[data-testid="needs-review"]')).toBeVisible()
    await expect(page.locator('[data-testid="returned-to-you"]')).toBeVisible()
    await expect(page.locator('[data-testid="my-prs"]')).toBeVisible()
    await expect(page.locator('[data-testid="reviewed-awaiting"]')).toBeVisible()
    
    // Check PR cards are rendered
    const prCards = page.locator('[data-testid="pr-card"]')
    await expect(prCards).toHaveCount(mockDashboardData.needsReview.length)
  })

  test('can refresh dashboard data', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Click refresh button
    await page.click('[data-testid="refresh-button"]')
    
    // Should show loading state temporarily
    await expect(page.locator('[data-testid="refresh-spinner"]')).toBeVisible()
    
    // Should complete refresh
    await expect(page.locator('[data-testid="refresh-spinner"]')).not.toBeVisible()
  })
})
```

#### Test Configuration

**Jest Configuration:**
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

**Playwright Configuration:**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

This development workflow provides a comprehensive foundation for consistent, high-quality development with robust testing and quality assurance processes.

