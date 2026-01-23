# Components Architecture

This section defines the frontend component structure and backend service organization for CodeFlow's MVP implementation. The architecture follows Next.js conventions with clear separation of concerns and reusable component patterns.

### Frontend Component Organization

**Component Hierarchy Strategy:** Feature-based organization with shared components, following the four-section dashboard structure from PRD requirements.

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── dashboard/
│   │   │   └── page.tsx    # Main dashboard page
│   │   ├── repositories/
│   │   │   ├── page.tsx    # Repository management
│   │   │   └── add/
│   │   │       └── page.tsx # Add repository
│   │   └── layout.tsx      # Dashboard layout with nav
│   ├── auth/
│   │   └── signin/
│   │       └── page.tsx    # Sign-in page
│   ├── api/                # API Routes (Backend)
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts # Auth.js configuration
│   │   ├── profile/
│   │   │   └── route.ts    # User profile endpoints
│   │   ├── repositories/
│   │   │   ├── route.ts    # Repository CRUD
│   │   │   └── [id]/
│   │   │       └── route.ts # Repository by ID
│   │   ├── pull-requests/
│   │   │   ├── route.ts    # Dashboard data
│   │   │   └── [owner]/
│   │   │       └── [repo]/
│   │   │           └── [number]/
│   │   │               └── route.ts # PR details
│   │   ├── github/
│   │   │   ├── repositories/
│   │   │   │   └── route.ts # GitHub repos
│   │   │   └── rate-limit/
│   │   │       └── route.ts # Rate limit status
│   │   └── health/
│   │       └── route.ts    # System health
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # Shared UI Components
│   ├── ui/                 # Base UI components (Headless UI)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   └── index.ts        # Barrel exports
│   ├── dashboard/          # Dashboard-specific components
│   │   ├── DashboardGrid.tsx     # Four-section layout
│   │   ├── PullRequestCard.tsx   # Individual PR display
│   │   ├── SectionHeader.tsx     # Section titles with counts
│   │   ├── EmptyState.tsx        # No PRs message
│   │   ├── RefreshButton.tsx     # Manual refresh trigger
│   │   └── RateLimitBanner.tsx   # Rate limit warnings
│   ├── repository/         # Repository management
│   │   ├── RepositoryList.tsx    # User's monitored repos
│   │   ├── RepositoryCard.tsx    # Individual repo display
│   │   ├── AddRepositoryModal.tsx # Add repo dialog
│   │   └── RepositorySearch.tsx  # GitHub repo search
│   ├── auth/               # Authentication components
│   │   ├── SignInButton.tsx      # GitHub OAuth trigger
│   │   ├── UserAvatar.tsx        # User profile display
│   │   └── SignOutButton.tsx     # Sign out action
│   └── layout/             # Layout components
│       ├── Navigation.tsx        # Main navigation
│       ├── Header.tsx            # App header with user info
│       ├── Sidebar.tsx           # Dashboard navigation
│       └── Footer.tsx            # App footer
├── hooks/                  # Custom React hooks
│   ├── auth/
│   │   └── useSession.ts         # Auth.js session wrapper
│   ├── api/                # TanStack Query hooks
│   │   ├── useDashboard.ts       # Dashboard data fetching
│   │   ├── useRepositories.ts    # Repository management
│   │   ├── usePullRequest.ts     # Individual PR details
│   │   ├── useGitHubRepos.ts     # GitHub repository search
│   │   └── useRateLimit.ts       # Rate limit monitoring
│   ├── ui/
│   │   ├── useModal.ts           # Modal state management
│   │   └── useToast.ts           # Toast notifications
│   └── utils/
│       ├── useDebounce.ts        # Input debouncing
│       └── useLocalStorage.ts    # Local storage wrapper
├── lib/                    # Utility libraries
│   ├── auth.ts             # Auth.js configuration
│   ├── github.ts           # GitHub API client
│   ├── prisma.ts           # Database client
│   ├── utils.ts            # General utilities
│   ├── validations.ts      # Zod schemas
│   └── constants.ts        # App constants
├── stores/                 # Zustand stores
│   ├── authStore.ts        # Authentication state
│   ├── dashboardStore.ts   # Dashboard UI state
│   └── repositoryStore.ts  # Repository management state
├── types/                  # TypeScript definitions
│   ├── api.ts              # API response types
│   ├── github.ts           # GitHub API types
│   ├── database.ts         # Database model types
│   └── index.ts            # Shared types
└── styles/                 # Additional styles
    └── components.css      # Component-specific styles
```

### Key Frontend Components

#### Dashboard Components

**DashboardGrid.tsx** - Main dashboard layout implementing four-section structure

```typescript
interface DashboardGridProps {
  data: DashboardCategorizationResult
  isLoading: boolean
  error: Error | null
  onRefresh: () => void
}

// Implements responsive grid layout for:
// - Needs Review (top-left)
// - Returned to You (top-right)
// - My PRs (bottom-left)
// - Reviewed & Awaiting (bottom-right)
```

**PullRequestCard.tsx** - Individual PR display component

```typescript
interface PullRequestCardProps {
  pullRequest: GitHubPullRequest
  section: 'needsReview' | 'returnedToYou' | 'myPRs' | 'reviewedAwaiting'
  onClick: (pr: GitHubPullRequest) => void
}

// Features:
// - PR title, description, and metadata
// - Author avatar and repository info
// - Review status badges
// - Time since last activity
// - Click to view details
```

**SectionHeader.tsx** - Section titles with PR counts and actions

```typescript
interface SectionHeaderProps {
  title: string
  count: number
  description: string
  actions?: React.ReactNode
}

// Displays section title, PR count, description
// Optional action buttons (refresh, filter, etc.)
```

#### Repository Management Components

**RepositoryList.tsx** - User's monitored repositories with management actions
**AddRepositoryModal.tsx** - GitHub repository search and selection interface
**RepositorySearch.tsx** - Real-time GitHub API repository search with debouncing

### Backend Service Organization

#### API Route Handlers

**Authentication Services (Auth.js Integration)**

```typescript
// app/api/auth/[...nextauth]/route.ts
export const authOptions: NextAuthOptions = {
  providers: [GitHubProvider],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session: (session, token) => // Add GitHub data
  }
}
```

**GitHub API Services**

```typescript
// lib/github.ts
export class GitHubService {
  constructor(private accessToken: string) {}

  async getDashboardData(repositories: Repository[]): Promise<DashboardCategorizationResult>
  async getRepositories(query?: string): Promise<GitHubRepository[]>
  async getPullRequest(owner: string, repo: string, number: number): Promise<GitHubPullRequest>
  async getRateLimit(): Promise<GitHubRateLimit>

  // Implements rate limiting, error handling, retry logic
}
```

**Database Services (Prisma)**

```typescript
// lib/database.ts
export class DatabaseService {
  async createUserProfile(data: CreateUserProfileData): Promise<UserProfile>
  async addRepository(userId: string, data: AddRepositoryData): Promise<Repository>
  async getUserRepositories(userId: string, active?: boolean): Promise<Repository[]>
  async updateRepository(id: string, data: UpdateRepositoryData): Promise<Repository>
  async deleteRepository(id: string): Promise<void>

  // Handles user profiles and repository monitoring preferences only
}
```

### Component Communication Patterns

**State Management Strategy:**

- **Zustand**: Global UI state (dashboard filters, modal states)
- **TanStack Query**: Server state (GitHub API data, caching)
- **Auth.js**: Authentication state (session, user info)
- **React State**: Local component state (form inputs, UI toggles)

**Data Flow Pattern:**

1. **User Action** → Component event handler
2. **Component** → Custom hook (TanStack Query)
3. **Hook** → API route handler
4. **API Route** → GitHub API or Database service
5. **Response** → Hook cache → Component update

**Error Handling Strategy:**

- **API Errors**: Handled by TanStack Query with retry logic
- **Rate Limiting**: Graceful degradation with stale data serving
- **Network Errors**: Toast notifications with retry options
- **Form Errors**: Inline validation with error messages

### Responsive Design Strategy

**Breakpoint Strategy (Tailwind CSS):**

- **Mobile**: Single-column dashboard, drawer navigation
- **Tablet**: Two-column dashboard grid, sidebar navigation
- **Desktop**: Four-column dashboard grid, persistent sidebar

**Component Adaptivity:**

- Dashboard grid collapses to single column on mobile
- PR cards show condensed information on small screens
- Repository management uses full-screen modals on mobile
- Navigation transforms to hamburger menu on mobile

This component architecture provides a scalable foundation for the MVP while maintaining clear separation of concerns and following Next.js best practices.
