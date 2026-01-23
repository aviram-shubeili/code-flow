# Unified Project Structure

This section defines the complete monorepo file structure for CodeFlow, optimized for Next.js 14 with TypeScript and AWS serverless deployment.

### Repository Organization

```
codeflow/
├── .github/                          # GitHub Actions workflows
│   └── workflows/
│       ├── ci.yml                    # Continuous integration
│       ├── deploy-staging.yml        # Staging deployment
│       └── deploy-production.yml     # Production deployment
├── .next/                            # Next.js build output (ignored)
├── .vscode/                          # VS Code settings
│   ├── settings.json                 # Editor configuration
│   ├── extensions.json               # Recommended extensions
│   └── launch.json                   # Debug configuration
├── app/                              # Next.js 14 App Router
│   ├── (auth)/                       # Auth routes group
│   │   └── auth/
│   │       ├── signin/
│   │       │   └── page.tsx          # GitHub OAuth sign-in
│   │       └── error/
│   │           └── page.tsx          # Auth error handling
│   ├── (dashboard)/                  # Protected dashboard routes
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Main dashboard
│   │   ├── repositories/
│   │   │   ├── page.tsx              # Repository management
│   │   │   └── add/
│   │   │       └── page.tsx          # Add repository
│   │   ├── settings/
│   │   │   └── page.tsx              # User settings
│   │   └── layout.tsx                # Dashboard layout
│   ├── api/                          # Backend API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts          # Auth.js configuration
│   │   ├── profile/
│   │   │   └── route.ts              # User profile endpoints
│   │   ├── repositories/
│   │   │   ├── route.ts              # Repository CRUD
│   │   │   └── [id]/
│   │   │       └── route.ts          # Repository by ID
│   │   ├── pull-requests/
│   │   │   ├── route.ts              # Dashboard data
│   │   │   └── [owner]/
│   │   │       └── [repo]/
│   │   │           └── [number]/
│   │   │               └── route.ts  # PR details
│   │   ├── github/
│   │   │   ├── repositories/
│   │   │   │   └── route.ts          # GitHub repos
│   │   │   └── rate-limit/
│   │   │       └── route.ts          # Rate limit status
│   │   └── health/
│   │       └── route.ts              # System health
│   ├── globals.css                   # Global Tailwind styles
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   ├── loading.tsx                   # Global loading UI
│   ├── error.tsx                     # Global error UI
│   └── not-found.tsx                 # 404 page
├── components/                       # React components
│   ├── ui/                           # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   ├── Toast.tsx
│   │   └── index.ts                  # Barrel exports
│   ├── dashboard/                    # Dashboard components
│   │   ├── DashboardGrid.tsx         # Four-section layout
│   │   ├── PullRequestCard.tsx       # PR card component
│   │   ├── SectionHeader.tsx         # Section headers
│   │   ├── EmptyState.tsx            # Empty state UI
│   │   ├── RefreshButton.tsx         # Refresh trigger
│   │   └── RateLimitBanner.tsx       # Rate limit warning
│   ├── repository/                   # Repository components
│   │   ├── RepositoryList.tsx        # Repository list
│   │   ├── RepositoryCard.tsx        # Repository card
│   │   ├── AddRepositoryModal.tsx    # Add repository dialog
│   │   └── RepositorySearch.tsx      # GitHub search
│   ├── auth/                         # Authentication components
│   │   ├── SignInButton.tsx          # GitHub OAuth button
│   │   ├── UserAvatar.tsx            # User avatar display
│   │   └── SignOutButton.tsx         # Sign out button
│   └── layout/                       # Layout components
│       ├── Navigation.tsx            # Main navigation
│       ├── Header.tsx                # App header
│       ├── Sidebar.tsx               # Dashboard sidebar
│       └── Footer.tsx                # App footer
├── hooks/                            # Custom React hooks
│   ├── auth/
│   │   └── useSession.ts             # Auth.js session hook
│   ├── api/                          # TanStack Query hooks
│   │   ├── useDashboard.ts           # Dashboard data fetching
│   │   ├── useRepositories.ts        # Repository management
│   │   ├── usePullRequest.ts         # PR details fetching
│   │   ├── useGitHubRepos.ts         # GitHub repo search
│   │   └── useRateLimit.ts           # Rate limit monitoring
│   ├── ui/
│   │   ├── useModal.ts               # Modal state management
│   │   ├── useToast.ts               # Toast notifications
│   │   └── useLocalStorage.ts        # Local storage wrapper
│   └── utils/
│       ├── useDebounce.ts            # Input debouncing
│       └── useInterval.ts            # Interval management
├── lib/                              # Utility libraries
│   ├── auth.ts                       # Auth.js configuration
│   ├── github.ts                     # GitHub API service
│   ├── database.ts                   # Database service
│   ├── prisma.ts                     # Prisma client
│   ├── api-client.ts                 # API client utilities
│   ├── utils.ts                      # General utilities
│   ├── validations.ts                # Zod schemas
│   ├── constants.ts                  # App constants
│   └── env.ts                        # Environment validation
├── stores/                           # Zustand state stores
│   ├── authStore.ts                  # Authentication state
│   ├── dashboardStore.ts             # Dashboard UI state
│   └── repositoryStore.ts            # Repository state
├── types/                            # TypeScript definitions
│   ├── api.ts                        # API response types
│   ├── github.ts                     # GitHub API types
│   ├── database.ts                   # Database model types
│   ├── auth.ts                       # Auth types
│   └── index.ts                      # Shared types
├── styles/                           # Additional styles
│   └── components.css                # Component-specific styles
├── prisma/                           # Database schema & migrations
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Database migrations
│   │   └── 001_init/
│   │       └── migration.sql
│   └── seed.ts                       # Database seeding
├── vercel.json                       # Vercel configuration (optional)
├── tests/                            # Test files
│   ├── __mocks__/                    # Test mocks
│   │   ├── next-auth.ts
│   │   └── @octokit/rest.ts
│   ├── components/                   # Component tests
│   │   ├── dashboard/
│   │   │   ├── DashboardGrid.test.tsx
│   │   │   └── PullRequestCard.test.tsx
│   │   └── ui/
│   │       ├── Button.test.tsx
│   │       └── Card.test.tsx
│   ├── hooks/                        # Hook tests
│   │   ├── api/
│   │   │   ├── useDashboard.test.ts
│   │   │   └── useRepositories.test.ts
│   │   └── utils/
│   │       └── useDebounce.test.ts
│   ├── lib/                          # Utility tests
│   │   ├── github.test.ts
│   │   └── database.test.ts
│   ├── api/                          # API route tests
│   │   ├── pull-requests.test.ts
│   │   └── repositories.test.ts
│   ├── e2e/                          # Playwright E2E tests
│   │   ├── dashboard.spec.ts
│   │   ├── authentication.spec.ts
│   │   └── repository-management.spec.ts
│   ├── fixtures/                     # Test data fixtures
│   │   ├── github-responses.ts
│   │   └── database-fixtures.ts
│   ├── setup.ts                      # Test setup
│   └── teardown.ts                   # Test teardown
├── scripts/                          # Build/deployment scripts
│   ├── build.sh                      # Production build script
│   ├── deploy.sh                     # Deployment script
│   ├── migrate.sh                    # Database migration script
│   ├── seed.sh                       # Database seeding script
│   └── cleanup-users.ts              # Inactive user cleanup
├── docs/                             # Documentation
│   ├── architecture.md               # This document
│   ├── prd/                          # Product requirements
│   │   ├── index.md
│   │   ├── requirements.md
│   │   ├── goals-and-background-context.md
│   │   ├── epic-and-story-structure.md
│   │   ├── technical-assumptions.md
│   │   ├── user-interface-design-goals.md
│   │   ├── success-metrics.md
│   │   └── next-steps.md
│   ├── api/                          # API documentation
│   │   └── openapi.yml               # OpenAPI specification
│   ├── deployment/                   # Deployment guides
│   │   ├── aws-setup.md
│   │   ├── github-actions.md
│   │   └── environment-variables.md
│   └── development/                  # Development guides
│       ├── getting-started.md
│       ├── testing.md
│       └── troubleshooting.md
├── public/                           # Static assets
│   ├── images/
│   │   ├── logo.svg
│   │   ├── favicon.ico
│   │   └── og-image.png
│   ├── icons/
│   │   └── github.svg
│   └── robots.txt
├── .env.example                      # Environment variables template
├── .env.local                        # Local environment (ignored)
├── .gitignore                        # Git ignore rules
├── .eslintrc.json                    # ESLint configuration
├── .prettierrc                       # Prettier configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
├── next.config.js                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── jest.config.js                    # Jest testing configuration
├── playwright.config.ts              # Playwright E2E configuration
├── package.json                      # Node.js dependencies
├── package-lock.json                 # Dependency lock file
├── README.md                         # Project overview
├── CONTRIBUTING.md                   # Contribution guidelines
├── LICENSE                           # MIT license
└── CHANGELOG.md                      # Version history
```

### Configuration Files

#### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"],
      "@/stores/*": ["./stores/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", ".next", "dist", "infrastructure"]
}
```

#### Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
  },
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
```

#### Package.json Scripts

```json
{
  "name": "codeflow",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "deploy": "vercel",
    "deploy:prod": "vercel --prod",
    "format": "prettier --write .",
    "clean": "rm -rf .next dist",
    "analyze": "cross-env ANALYZE=true next build"
  }
}
```

### Development Workflow Organization

**Branch Strategy:**

- `main` - Production branch (protected)
- `staging` - Staging branch (protected)
- `feature/*` - Feature branches
- `hotfix/*` - Production hotfixes

**Environment Files:**

```bash
# .env.example (template)
DATABASE_URL="postgresql://username:password@localhost:5432/codeflow_dev"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"

# Vercel deployment (automatic via GitHub integration)
```

**VS Code Workspace Settings:**

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"],
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

This unified project structure provides a scalable, maintainable codebase following Next.js 14 best practices with clear separation of concerns and comprehensive tooling support.
