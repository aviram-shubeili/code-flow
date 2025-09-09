# Coding Standards

This section defines the essential coding standards and patterns for AI agents and developers working on CodeFlow.

### Critical Fullstack Rules

**Type Safety and Sharing:**
- **Shared Types**: Always define types in `types/` directory and import from there - never duplicate type definitions
- **API Contracts**: API request/response types must match exactly between frontend and backend
- **Database Types**: Use Prisma-generated types, never manually type database models
- **GitHub API Types**: Import from `types/github.ts`, don't use `any` for GitHub API responses

**API Development:**
- **Error Handling**: All API routes must use `withErrorHandling` wrapper and return structured errors
- **Authentication**: Never skip session validation - use `getServerSession` in all protected routes
- **Rate Limiting**: Always check GitHub rate limits before making API calls
- **Request IDs**: Generate unique request IDs for tracing and debugging

**State Management:**
- **TanStack Query**: Never bypass TanStack Query for server state - it's the single source of truth
- **Zustand**: Use only for UI state (modals, filters, etc.) - never for server data
- **Local State**: Prefer server state over local state when data comes from APIs
- **Cache Invalidation**: Always invalidate related queries after mutations

**Database Operations:**
- **Prisma Only**: Never write raw SQL - use Prisma client for all database operations
- **Connection Management**: Use the singleton Prisma instance from `lib/prisma.ts`
- **Transactions**: Use Prisma transactions for operations affecting multiple tables
- **Error Handling**: Wrap database operations in try-catch and throw AppError instances

**Environment Variables:**
- **Validation**: All environment variables must be validated in `lib/env.ts`
- **Access Pattern**: Access environment variables only through validated config objects
- **Secrets**: Use AWS Secrets Manager for production secrets, never hardcode

**TypeScript Standards:**
- **Strict Mode**: All TypeScript files must pass strict mode compilation with zero errors
- **No Any**: Never use `any` type - use `unknown` for truly unknown types, proper interfaces otherwise
- **Explicit Return Types**: All functions must have explicit return type annotations
- **Null Safety**: Use strict null checks - handle `null` and `undefined` explicitly
- **Type Assertions**: Avoid type assertions (`as Type`) - use type guards instead
- **Import Types**: Use `import type` for type-only imports to optimize bundle size

### Strict TypeScript Configuration

**Required tsconfig.json Settings:**
```json
// tsconfig.json - MANDATORY strict settings
{
  "compilerOptions": {
    "strict": true,                    // Enable all strict type-checking options
    "noImplicitAny": true,            // Error on expressions with implied 'any'
    "noImplicitReturns": true,        // Error when not all code paths return a value
    "noImplicitThis": true,           // Error on 'this' with implied 'any'
    "noUnusedLocals": true,           // Error on unused local variables
    "noUnusedParameters": true,       // Error on unused function parameters
    "exactOptionalPropertyTypes": true, // Strict optional property types
    "noUncheckedIndexedAccess": true, // Add 'undefined' to index signature results
    "noImplicitOverride": true,       // Error when override modifier is missing
    "allowUnreachableCode": false,    // Error on unreachable code
    "allowUnusedLabels": false,       // Error on unused labels
    "skipLibCheck": false,            // Check all .d.ts files (even node_modules)
    "forceConsistentCasingInFileNames": true // Error on inconsistent casing
  }
}
```

**Mandatory Type Patterns:**

**Function Signatures:**
```typescript
// ❌ WRONG - Missing return type
export function processData(data) {
  return data.map(item => item.value)
}

// ✅ CORRECT - Explicit types throughout
export function processData(data: DataItem[]): ProcessedValue[] {
  return data.map((item: DataItem): ProcessedValue => ({
    id: item.id,
    value: item.value,
    timestamp: new Date(),
  }))
}

// ❌ WRONG - Using 'any'
export function handleApiResponse(response: any): void {
  console.log(response.data)
}

// ✅ CORRECT - Proper generic constraints
export function handleApiResponse<T extends ApiResponse>(response: T): T['data'] {
  return response.data
}
```

**Type Guards Instead of Assertions:**
```typescript
// ❌ WRONG - Type assertion
const user = data as User
const userName = user.name

// ✅ CORRECT - Type guard
function isUser(data: unknown): data is User {
  return typeof data === 'object' && 
         data !== null && 
         'id' in data && 
         'name' in data &&
         typeof (data as User).name === 'string'
}

if (isUser(data)) {
  const userName = data.name // TypeScript knows data is User
}
```

**Null Safety Patterns:**
```typescript
// ❌ WRONG - Not handling null/undefined
function processUser(user: User | null) {
  return user.name.toUpperCase() // Runtime error if user is null
}

// ✅ CORRECT - Explicit null handling
function processUser(user: User | null): string | null {
  if (user === null) {
    return null
  }
  
  return user.name?.toUpperCase() ?? 'Unknown'
}

// ✅ CORRECT - Using type narrowing
function processUser(user: User | null): string {
  if (user === null) {
    throw new Error('User cannot be null')
  }
  
  // TypeScript knows user is not null here
  return user.name.toUpperCase()
}
```

**API Response Typing:**
```typescript
// ❌ WRONG - Generic object
interface ApiResponse {
  data: any
  status: number
}

// ✅ CORRECT - Generic with constraints
interface ApiResponse<T = unknown> {
  data: T
  status: number
  message?: string
  error?: ApiError
}

// ✅ CORRECT - Specific response types
interface DashboardApiResponse extends ApiResponse<DashboardCategorizationResult> {}
interface RepositoriesApiResponse extends ApiResponse<{ repositories: Repository[] }> {}

// Usage with proper typing
export async function fetchDashboard(): Promise<DashboardApiResponse> {
  const response = await fetch('/api/pull-requests')
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  
  return response.json() as Promise<DashboardApiResponse>
}
```

**Component Props Typing:**
```typescript
// ❌ WRONG - Loose prop types
interface Props {
  data?: any
  onClick?: Function
  className?: string
}

// ✅ CORRECT - Strict prop types
interface PullRequestCardProps {
  pullRequest: GitHubPullRequest
  section: 'needsReview' | 'returnedToYou' | 'myPRs' | 'reviewedAwaiting'
  onClick: (pr: GitHubPullRequest) => void
  className?: string
  'data-testid'?: string
}

// ✅ CORRECT - Using React types
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  loading?: boolean
}
```

**Error Handling Types:**
```typescript
// ❌ WRONG - Catching unknown errors loosely
try {
  await riskyOperation()
} catch (error) {
  console.log(error.message) // error is 'unknown'
}

// ✅ CORRECT - Proper error type checking
try {
  await riskyOperation()
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log(error.message)
  } else if (typeof error === 'string') {
    console.log(error)
  } else {
    console.log('Unknown error occurred')
  }
}

// ✅ CORRECT - Custom error types
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

function handleError(error: unknown): never {
  if (error instanceof ValidationError) {
    throw new AppError(ApiErrorCode.INVALID_INPUT, error.message, 400, {
      field: error.field,
      validationCode: error.code,
    })
  }
  
  if (error instanceof Error) {
    throw new AppError(ApiErrorCode.INTERNAL_ERROR, error.message, 500)
  }
  
  throw new AppError(ApiErrorCode.INTERNAL_ERROR, 'Unknown error', 500)
}
```

**Environment Variable Validation:**
```typescript
// lib/env.ts - MANDATORY for all environment variables
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  GITHUB_CLIENT_ID: z.string().min(1, 'GITHUB_CLIENT_ID is required'),
  GITHUB_CLIENT_SECRET: z.string().min(1, 'GITHUB_CLIENT_SECRET is required'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

export type Env = z.infer<typeof envSchema>

// Validate environment at startup
export const env: Env = envSchema.parse(process.env)

// Usage throughout application
import { env } from '@/lib/env'

// ❌ WRONG - Direct process.env access
const dbUrl = process.env.DATABASE_URL

// ✅ CORRECT - Validated environment access
const dbUrl = env.DATABASE_URL // TypeScript knows this is a string
```

**TypeScript Compilation Validation:**
```bash
# MANDATORY - Must pass before any commit
npm run type-check

# CI/CD pipeline MUST include
npm run type-check --noEmit
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| React Components | PascalCase | `DashboardGrid`, `PullRequestCard` |
| Custom Hooks | camelCase with 'use' | `useDashboard`, `useRepositories` |
| API Routes | kebab-case | `/api/pull-requests`, `/api/rate-limit` |
| Database Tables | snake_case | `user_profiles`, `repositories` |
| TypeScript Interfaces | PascalCase | `GitHubPullRequest`, `DashboardData` |
| Zustand Stores | camelCase with 'Store' | `authStore`, `dashboardStore` |
| Constants | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRIES` |
| CSS Classes | kebab-case (Tailwind) | `bg-blue-600`, `hover:bg-blue-700` |

### Component Development Standards

**Component Structure:**
```typescript
// components/dashboard/PullRequestCard.tsx
import { GitHubPullRequest } from '@/types/github'
import { Button, Card, Badge } from '@/components/ui'
import { formatDistanceToNow } from 'date-fns'

interface PullRequestCardProps {
  pullRequest: GitHubPullRequest
  section: 'needsReview' | 'returnedToYou' | 'myPRs' | 'reviewedAwaiting'
  onClick: (pr: GitHubPullRequest) => void
  className?: string
}

export function PullRequestCard({ 
  pullRequest, 
  section, 
  onClick, 
  className 
}: PullRequestCardProps) {
  // Component implementation
  return (
    <Card className={cn('p-4 hover:shadow-md transition-shadow cursor-pointer', className)}>
      {/* Component JSX */}
    </Card>
  )
}

// Always export as named export, not default
export type { PullRequestCardProps }
```

**Hook Development:**
```typescript
// hooks/api/useDashboard.ts
import { useQuery } from '@tanstack/react-query'
import { DashboardCategorizationResult } from '@/types/github'
import { apiRequest } from '@/lib/api-client'

export function useDashboard(repositoryId?: string) {
  return useQuery({
    queryKey: ['dashboard', repositoryId] as const,
    queryFn: () => apiRequest<DashboardCategorizationResult>(
      `/pull-requests${repositoryId ? `?repository=${repositoryId}` : ''}`
    ),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
    retry: (failureCount, error) => {
      // Custom retry logic based on error type
      return shouldRetryError(error) && failureCount < 3
    },
  })
}

// Export query key for external cache invalidation
export const dashboardQueryKey = (repositoryId?: string) => 
  ['dashboard', repositoryId] as const
```

### API Route Standards

**Route Handler Pattern:**
```typescript
// app/api/repositories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { withErrorHandling } from '@/lib/error-handler'
import { withMetrics } from '@/lib/metrics'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/database'
import { addRepositorySchema } from '@/lib/validations'

export const GET = withErrorHandling(async (req: NextRequest) => {
  return withMetrics('GetRepositories', async () => {
    // 1. Authentication check
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new AppError(ApiErrorCode.UNAUTHORIZED, 'Authentication required', 401)
    }

    // 2. Parse and validate query parameters
    const { searchParams } = new URL(req.url)
    const activeOnly = searchParams.get('active') === 'true'

    // 3. Business logic
    const db = new DatabaseService()
    const repositories = await db.getUserRepositories(session.user.id, activeOnly)

    // 4. Return response
    return NextResponse.json({ repositories })
  })
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  return withMetrics('CreateRepository', async () => {
    // 1. Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new AppError(ApiErrorCode.UNAUTHORIZED, 'Authentication required', 401)
    }

    // 2. Parse and validate request body
    const body = await req.json()
    const validatedData = addRepositorySchema.parse(body)

    // 3. Business logic
    const db = new DatabaseService()
    const repository = await db.addRepository(session.user.id, validatedData)

    // 4. Return response
    return NextResponse.json({ repository }, { status: 201 })
  })
})
```

### Testing Standards

**Component Testing:**
```typescript
// tests/components/dashboard/PullRequestCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { PullRequestCard } from '@/components/dashboard/PullRequestCard'
import { mockPullRequest } from '../../fixtures/github-responses'

describe('PullRequestCard', () => {
  const defaultProps = {
    pullRequest: mockPullRequest,
    section: 'needsReview' as const,
    onClick: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders PR information correctly', () => {
    render(<PullRequestCard {...defaultProps} />)
    
    expect(screen.getByText(mockPullRequest.title)).toBeInTheDocument()
    expect(screen.getByText(`#${mockPullRequest.number}`)).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    render(<PullRequestCard {...defaultProps} />)
    
    fireEvent.click(screen.getByRole('article'))
    expect(defaultProps.onClick).toHaveBeenCalledWith(mockPullRequest)
  })
})
```

**API Route Testing:**
```typescript
// tests/api/repositories.test.ts
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/repositories/route'
import { getServerSession } from 'next-auth'
import { mockSession, mockRepository } from '../fixtures/database-fixtures'

jest.mock('next-auth')
jest.mock('@/lib/database')

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('/api/repositories', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/repositories', () => {
    it('returns user repositories when authenticated', async () => {
      mockGetServerSession.mockResolvedValue(mockSession)
      
      const req = new NextRequest('http://localhost:3000/api/repositories')
      const response = await GET(req, {})
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.repositories).toBeDefined()
    })

    it('returns 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)
      
      const req = new NextRequest('http://localhost:3000/api/repositories')
      const response = await GET(req, {})

      expect(response.status).toBe(401)
    })
  })
})
```

These coding standards ensure consistency, maintainability, and reliability across the entire CodeFlow codebase while supporting effective AI-driven development.