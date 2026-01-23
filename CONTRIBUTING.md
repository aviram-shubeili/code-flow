# Contributing to CodeFlow

This guide documents the coding standards and development workflow for CodeFlow.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Format code
npm run format

# Run tests
npm test
```

## Development Environment Setup

### VS Code Settings (Recommended)

Add to your `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  }
}
```

> **Note:** `source.organizeImports` should be `"never"` - ESLint handles import sorting to avoid conflicts.

### Required VS Code Extensions

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)

## Code Quality Scripts

| Command                 | Description                       |
| ----------------------- | --------------------------------- |
| `npm run lint`          | Run ESLint on all files           |
| `npm run format`        | Format all files with Prettier    |
| `npm run format:check`  | Check if files are formatted (CI) |
| `npm run test`          | Run tests                         |
| `npm run test:coverage` | Run tests with coverage           |

## Naming Conventions

| Element               | Convention             | Example                                 |
| --------------------- | ---------------------- | --------------------------------------- |
| React Components      | PascalCase             | `DashboardGrid`, `PullRequestCard`      |
| Custom Hooks          | camelCase with 'use'   | `useDashboard`, `useRepositories`       |
| API Routes            | kebab-case             | `/api/pull-requests`, `/api/rate-limit` |
| Database Tables       | snake_case             | `user_profiles`, `repositories`         |
| TypeScript Interfaces | PascalCase             | `GitHubPullRequest`, `DashboardData`    |
| Zustand Stores        | camelCase with 'Store' | `authStore`, `dashboardStore`           |
| Constants             | SCREAMING_SNAKE_CASE   | `API_BASE_URL`, `MAX_RETRIES`           |
| CSS Classes           | kebab-case (Tailwind)  | `bg-blue-600`, `hover:bg-blue-700`      |

## Import Order

Imports are auto-sorted by ESLint in this order:

1. React/Next.js imports
2. External packages
3. Internal aliases (`@/components`, `@/lib`, etc.)
4. Relative imports
5. Type imports (using `import type`)

```typescript
// Example import order
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/Button'
import { useDashboard } from '@/hooks/api/useDashboard'

import { formatDate } from './utils'

import type { DashboardData } from '@/types'
```

## TypeScript Standards

### Strict Mode

TypeScript strict mode is enabled. All code must:

- Have explicit return types on functions
- Avoid `any` type (use `unknown` if truly unknown)
- Handle `null` and `undefined` explicitly
- Use `import type` for type-only imports

### Type Patterns

```typescript
// ✅ Use type imports
import type { User } from '@/types'

// ✅ Explicit return types
function processData(data: DataItem[]): ProcessedValue[] {
  return data.map((item) => ({ id: item.id, value: item.value }))
}

// ✅ Proper null handling
function processUser(user: User | null): string | null {
  if (user === null) {
    return null
  }
  return user.name?.toUpperCase() ?? 'Unknown'
}
```

## Component Development

### Component Structure

```typescript
// components/dashboard/PullRequestCard.tsx
import type { GitHubPullRequest } from '@/types/github'

interface PullRequestCardProps {
  pullRequest: GitHubPullRequest
  onClick: (pr: GitHubPullRequest) => void
  className?: string
}

export function PullRequestCard({
  pullRequest,
  onClick,
  className,
}: PullRequestCardProps) {
  return (
    <div className={className}>
      {/* Component JSX */}
    </div>
  )
}

// Named exports only, no default exports
export type { PullRequestCardProps }
```

### Custom Hooks

```typescript
// hooks/api/useDashboard.ts
import { useQuery } from '@tanstack/react-query'

import type { DashboardData } from '@/types'

export function useDashboard(repositoryId?: string) {
  return useQuery({
    queryKey: ['dashboard', repositoryId] as const,
    queryFn: () => fetchDashboard(repositoryId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
```

## Git Workflow

### Commit Messages

Use conventional commit format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks

**Examples:**

```
feat(dashboard): add pull request filtering
fix(auth): handle expired GitHub tokens
docs: update API documentation
refactor(api): extract rate limiting middleware
```

### Branch Naming

```
<type>/<short-description>

feat/dashboard-filtering
fix/auth-token-refresh
refactor/api-error-handling
```

## Testing

### Test File Location

- Unit tests: `tests/<category>/<file>.test.ts`
- API tests: `tests/api/<route>.test.ts`
- Component tests: `tests/components/<component>.test.tsx`

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# Interactive UI
npm run test:ui
```

## Database

### Migrations

```bash
# Create migration
npm run db:migrate

# Apply migrations (production)
npm run db:migrate:deploy

# Generate Prisma client
npm run db:generate

# Open Prisma Studio
npm run db:studio
```

### Reset Database

```bash
npm run db:reset
```

## Additional Resources

- [Architecture Documentation](docs/architecture/index.md)
- [Coding Standards](docs/architecture/coding-standards.md)
- [API Specification](docs/architecture/api-specification.md)
