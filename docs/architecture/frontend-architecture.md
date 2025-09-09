# Frontend Architecture

This section defines the detailed frontend architecture for CodeFlow's React/Next.js implementation, providing specific patterns and templates for consistent development.

### Component Architecture

#### Component Organization Strategy

**File Structure:**
```
src/components/
├── ui/                     # Base UI components (reusable)
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Spinner.tsx
│   └── index.ts            # Barrel exports
├── dashboard/              # Dashboard-specific components  
│   ├── DashboardGrid.tsx   # Four-section layout
│   ├── PullRequestCard.tsx # Individual PR display
│   ├── SectionHeader.tsx   # Section titles with counts
│   ├── EmptyState.tsx      # No PRs message
│   ├── RefreshButton.tsx   # Manual refresh trigger
│   └── RateLimitBanner.tsx # Rate limit warnings
├── repository/             # Repository management
│   ├── RepositoryList.tsx  # User's monitored repos
│   ├── RepositoryCard.tsx  # Individual repo display
│   ├── AddRepositoryModal.tsx # Add repo dialog
│   └── RepositorySearch.tsx # GitHub repo search
├── auth/                   # Authentication components
│   ├── SignInButton.tsx    # GitHub OAuth trigger
│   ├── UserAvatar.tsx      # User profile display
│   └── SignOutButton.tsx   # Sign out action
└── layout/                 # Layout components
    ├── Navigation.tsx      # Main navigation
    ├── Header.tsx          # App header with user info
    ├── Sidebar.tsx         # Dashboard navigation
    └── Footer.tsx          # App footer
```

#### Component Templates

**Base Component Template:**
```typescript
// components/ui/Button.tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            // Variant styles
            'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600': variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500': variant === 'secondary',
            'border border-gray-300 bg-transparent hover:bg-gray-50 focus-visible:ring-gray-500': variant === 'outline',
            'hover:bg-gray-100 focus-visible:ring-gray-500': variant === 'ghost',
            // Size styles
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }
```

**Dashboard Component Template:**
```typescript
// components/dashboard/PullRequestCard.tsx
import { GitHubPullRequest } from '@/types/github'
import { Card } from '@/components/ui'
import { formatDistanceToNow } from 'date-fns'

interface PullRequestCardProps {
  pullRequest: GitHubPullRequest
  section: 'needsReview' | 'returnedToYou' | 'myPRs' | 'reviewedAwaiting'
  onClick: (pr: GitHubPullRequest) => void
}

export function PullRequestCard({ pullRequest, section, onClick }: PullRequestCardProps) {
  const timeAgo = formatDistanceToNow(new Date(pullRequest.updated_at), { addSuffix: true })
  
  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(pullRequest)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">
            {pullRequest.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {pullRequest.head.repo?.full_name} #{pullRequest.number}
          </p>
          
          <div className="flex items-center mt-2 space-x-2">
            <img 
              src={pullRequest.user.avatar_url} 
              alt={pullRequest.user.login}
              className="h-5 w-5 rounded-full"
            />
            <span className="text-sm text-gray-500">
              by {pullRequest.user.login}
            </span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">{timeAgo}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {pullRequest.draft && (
            <Badge variant="secondary">Draft</Badge>
          )}
          {section === 'needsReview' && (
            <Badge variant="warning">Review Requested</Badge>
          )}
          {section === 'returnedToYou' && (
            <Badge variant="destructive">Changes Requested</Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
```

### State Management Architecture

#### Zustand Store Structure

**Global State Organization:**
```typescript
// stores/authStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AuthState {
  user: User | null
  isLoading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      isLoading: false,
      
      signIn: async () => {
        set({ isLoading: true })
        try {
          await signIn('github')
        } finally {
          set({ isLoading: false })
        }
      },
      
      signOut: async () => {
        set({ isLoading: true })
        try {
          await signOut()
          set({ user: null })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    { name: 'auth-store' }
  )
)
```

**Dashboard State Management:**
```typescript
// stores/dashboardStore.ts
import { create } from 'zustand'

interface DashboardState {
  selectedRepository: string | null
  refreshing: boolean
  lastRefreshTime: Date | null
  setSelectedRepository: (repoId: string | null) => void
  setRefreshing: (refreshing: boolean) => void
  markRefreshed: () => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedRepository: null,
  refreshing: false,
  lastRefreshTime: null,
  
  setSelectedRepository: (repoId) => set({ selectedRepository: repoId }),
  setRefreshing: (refreshing) => set({ refreshing }),
  markRefreshed: () => set({ lastRefreshTime: new Date(), refreshing: false }),
}))
```

### Routing Architecture

#### Next.js App Router Structure

**Route Organization:**
```
app/
├── (auth)/                 # Auth group (no layout)
│   └── auth/
│       └── signin/
│           └── page.tsx
├── (dashboard)/            # Protected routes group
│   ├── dashboard/
│   │   └── page.tsx        # Main dashboard
│   ├── repositories/
│   │   ├── page.tsx        # Repository management
│   │   └── add/
│   │       └── page.tsx    # Add repository
│   ├── settings/
│   │   └── page.tsx        # User settings
│   └── layout.tsx          # Dashboard layout
├── api/                    # API routes
│   └── [...routes]         # Defined in API Specification
├── globals.css
├── layout.tsx              # Root layout
├── page.tsx                # Landing page
└── not-found.tsx           # 404 page
```

**Protected Route Implementation:**
```typescript
// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header user={session.user} />
        {children}
      </main>
    </div>
  )
}
```

### Frontend Services Layer

#### TanStack Query Integration

**API Client Setup:**
```typescript
// lib/api-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if (error?.response?.status === 401) return false
        return failureCount < 3
      },
    },
  },
})

// Generic API fetch wrapper
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || 'API request failed')
  }
  
  return response.json()
}
```

**Service Hook Examples:**
```typescript
// hooks/api/useDashboard.ts
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api-client'
import { DashboardCategorizationResult } from '@/types/github'

export function useDashboard(repositoryId?: string) {
  return useQuery({
    queryKey: ['dashboard', repositoryId],
    queryFn: () => apiRequest<DashboardCategorizationResult>(
      `/pull-requests${repositoryId ? `?repository=${repositoryId}` : ''}`
    ),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  })
}

// hooks/api/useRepositories.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Repository } from '@/types/database'

export function useRepositories() {
  return useQuery({
    queryKey: ['repositories'],
    queryFn: () => apiRequest<{ repositories: Repository[] }>('/repositories'),
    select: (data) => data.repositories,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useAddRepository() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: AddRepositoryData) => 
      apiRequest<{ repository: Repository }>('/repositories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
```
