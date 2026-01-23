# Story 1.1: GitHub OAuth Authentication

Status: ready-for-dev

## Story

As a developer,
I want to authenticate with GitHub OAuth,
so that I can securely access my repository data.

## Acceptance Criteria

1. **NextAuth.js configured with GitHub provider** - Auth.js v5 with Prisma adapter and GitHub OAuth provider
2. **OAuth flow handles authorization and callback** - Complete OAuth 2.0 flow with proper redirect handling
3. **User session persisted securely** - Database sessions using PostgreSQL with proper encryption
4. **Login/logout functionality on dashboard** - Sign in/out buttons with session-aware UI
5. **Error handling for OAuth failures** - Network errors, user denial, invalid tokens handled gracefully
6. **Session expiration handled gracefully** - Automatic session refresh and re-auth prompts when needed

## Tasks / Subtasks

- [ ] **Task 1: Install Auth.js Dependencies** (AC: #1)
  - [ ] Install `next-auth@beta` (per official docs: `npm install next-auth@beta`)
  - [ ] Install `@auth/prisma-adapter` for database sessions
  - [ ] Verify package versions align with Next.js 15 compatibility

- [ ] **Task 2: Setup Environment Variables** (AC: #1)
  - [ ] Run `npx auth secret` to generate AUTH_SECRET
  - [ ] Create GitHub OAuth App at github.com/settings/developers
  - [ ] Add AUTH_GITHUB_ID and AUTH_GITHUB_SECRET to .env.local

- [ ] **Task 3: Create Auth.js Configuration** (AC: #1, #2)
  - [ ] Create `auth.ts` at project root with NextAuth configuration
  - [ ] Configure GitHub provider (with custom scopes for repo access)
  - [ ] Configure Prisma adapter for database sessions
  - [ ] Set session strategy to "database" with 7-day maxAge
  - [ ] Implement session callback to add accessToken to session
  - [ ] Implement signIn callback for user profile creation

- [ ] **Task 4: Create API Route Handler** (AC: #2)
  - [ ] Create `app/api/auth/[...nextauth]/route.ts`
  - [ ] Export GET and POST handlers from `@/auth`
  - [ ] Verify OAuth callback URL matches GitHub App settings

- [ ] **Task 5: Create Auth Middleware** (AC: #3)
  - [ ] Create `middleware.ts` in project root
  - [ ] Export auth as middleware from `@/auth`
  - [ ] Configure protected routes (dashboard, repositories, settings, API)
  - [ ] Use Next.js middleware matcher for performance

- [ ] **Task 6: Create UserProfile on Sign-In** (AC: #3)
  - [ ] Implement signIn callback to call DatabaseService
  - [ ] Create/update UserProfile with githubId, username
  - [ ] Handle first-time vs returning user scenarios

- [ ] **Task 7: Create Auth UI Components** (AC: #4)
  - [ ] Create `components/auth/SignInButton.tsx` using Server Actions
  - [ ] Create `components/auth/SignOutButton.tsx` using Server Actions
  - [ ] Create `components/auth/UserAvatar.tsx`
  - [ ] Import signIn/signOut from `@/auth` (server-side)

- [ ] **Task 8: Create Auth Pages** (AC: #4, #5)
  - [ ] Create `app/(auth)/auth/signin/page.tsx`
  - [ ] Create `app/(auth)/auth/error/page.tsx`
  - [ ] Display meaningful error messages for OAuth failures
  - [ ] Implement redirect after successful sign-in

- [ ] **Task 9: Implement Error Handling** (AC: #5)
  - [ ] Handle OAuth denial (user cancelled)
  - [ ] Handle network failures during OAuth
  - [ ] Handle invalid/expired tokens
  - [ ] Log security events for auth failures

- [ ] **Task 10: Session Expiration Handling** (AC: #6)
  - [ ] Configure session maxAge in auth options
  - [ ] Middleware automatically keeps session alive
  - [ ] Handle expired session redirects to sign-in

- [ ] **Task 11: Write Tests** (AC: all)
  - [ ] Unit tests for auth configuration
  - [ ] Tests for SignInButton, SignOutButton components
  - [ ] API route tests for auth endpoints
  - [ ] Mock next-auth for component testing

## Dev Notes

> **IMPORTANT:** When in doubt, use the **Context7 MCP tools** to fetch up-to-date Auth.js documentation:
> 1. Use `mcp_context7_resolve-library-id` with `libraryName: "Auth.js"` to get the library ID
> 2. Use `mcp_context7_query-docs` with the resolved library ID to query specific topics
> 
> Example queries:
> - "GitHub OAuth provider setup Next.js"
> - "Prisma adapter configuration database sessions"
> - "signIn signOut server actions"
> - "middleware session protection"
>
> Official docs (fallback): https://authjs.dev/

### Critical Architecture Requirements

**Tech Stack (MUST USE):**
- `next-auth@beta` (Auth.js v5 - per official docs, install with `npm install next-auth@beta`)
- `@auth/prisma-adapter` (NOT `@next-auth/prisma-adapter` which is v4)
- Database sessions (NOT JWT) - required by architecture
- PostgreSQL via Prisma (already configured)

**GitHub OAuth Scopes (MINIMAL):**
```typescript
scope: 'read:user user:email repo:status'
```
- `read:user` - Basic profile info
- `user:email` - Access email addresses
- `repo:status` - Repository status and PR information
- **NO write access** for MVP security

### Environment Variables Required

Create/update `.env.local`:
```bash
# Auth.js Secret (REQUIRED)
# Generate with: npx auth secret
AUTH_SECRET="your-generated-secret"

# GitHub OAuth App (REQUIRED - create at github.com/settings/developers)
# Auth.js auto-detects AUTH_GITHUB_ID and AUTH_GITHUB_SECRET
AUTH_GITHUB_ID="your-oauth-app-client-id"
AUTH_GITHUB_SECRET="your-oauth-app-client-secret"
```

**Generate AUTH_SECRET:**
```bash
npx auth secret
```
This command will automatically add it to your `.env.local` file.

**GitHub OAuth App Setup:**
1. Go to https://github.com/settings/developers
2. Create New OAuth App
3. Set Homepage URL: `http://localhost:3000`
4. Set Callback URL: `http://localhost:3000/api/auth/callback/github`

### File Structure (EXACT PATHS)

```
auth.ts                      # Auth.js configuration (CREATE at project root per official docs)
app/
  api/
    auth/
      [...nextauth]/
        route.ts             # Auth API handler (CREATE)
  (auth)/
    auth/
      signin/
        page.tsx             # Sign-in page (CREATE)
      error/
        page.tsx             # Error page (CREATE)
components/
  auth/
    SignInButton.tsx         # GitHub sign-in button (CREATE)
    SignOutButton.tsx        # Sign-out button (CREATE)
    UserAvatar.tsx           # User avatar display (CREATE)
    index.ts                 # Barrel exports (CREATE)
middleware.ts                # Auth middleware (CREATE)
types/
  next-auth.d.ts             # TypeScript type extensions (CREATE)
```

### Auth.js v5 Configuration Template

Per official docs, create `auth.ts` at project root:

```typescript
// auth.ts (project root - per official Auth.js docs)
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GitHub from 'next-auth/providers/github'
import { prisma } from '@/lib/prisma'
import { db } from '@/lib/database'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      // Custom scopes for PR access (default is just 'read:user')
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async session({ session, user }) {
      // Add GitHub access token to session
      const account = await prisma.account.findFirst({
        where: { userId: user.id, provider: 'github' },
      })
      if (account?.access_token) {
        session.accessToken = account.access_token
        session.user.id = user.id
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github' && profile) {
        // Create/update UserProfile using DatabaseService
        const existingProfile = await db.getUserProfile(user.id)
        if (!existingProfile) {
          await db.createUserProfile({
            userId: user.id,
            githubId: parseInt(account.providerAccountId),
            username: (profile as { login: string }).login,
          })
        }
      }
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})
```

### API Route Handler

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth' // Referring to auth.ts at project root

export const { GET, POST } = handlers
```

### TypeScript Type Extensions

Create `types/next-auth.d.ts`:
```typescript
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
```

### Middleware Configuration

Per official docs, middleware exports auth to keep session alive:

```typescript
// middleware.ts
export { auth as middleware } from '@/auth'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/repositories/:path*',
    '/settings/:path*',
    '/api/profile/:path*',
    '/api/repositories/:path*',
    '/api/pull-requests/:path*',
    '/api/github/:path*',
  ],
}
```

### Component Patterns (Server Actions - Recommended)

Per official Auth.js docs, use Server Actions with forms:

**SignInButton.tsx (Server Action pattern):**
```typescript
// components/auth/SignInButton.tsx
import { signIn } from '@/auth'

export function SignInButton() {
  return (
    <form
      action={async () => {
        'use server'
        await signIn('github', { redirectTo: '/dashboard' })
      }}
    >
      <button type="submit">Sign in with GitHub</button>
    </form>
  )
}
```

**SignOutButton.tsx (Server Action pattern):**
```typescript
// components/auth/SignOutButton.tsx
import { signOut } from '@/auth'

export function SignOutButton() {
  return (
    <form
      action={async () => {
        'use server'
        await signOut()
      }}
    >
      <button type="submit">Sign out</button>
    </form>
  )
}
```

**Alternative: Client-side pattern (if needed for loading states):**
```typescript
// components/auth/SignInButtonClient.tsx
'use client'
import { signIn } from 'next-auth/react'

export function SignInButtonClient() {
  return (
    <button onClick={() => signIn('github', { callbackUrl: '/dashboard' })}>
      Sign in with GitHub
    </button>
  )
}
```

### Existing Code to Reuse

1. **`lib/prisma.ts`** - Prisma client singleton (DO NOT DUPLICATE)
2. **`lib/database.ts`** - DatabaseService with `createUserProfile()`, `getUserProfile()` (USE THESE)
3. **`components/ui/Button.tsx`** - Base button component (EXTEND, DON'T RECREATE)
4. **`prisma/schema.prisma`** - Auth.js tables already defined (Account, Session, User, UserProfile)

### Database Schema (ALREADY EXISTS)

Auth.js tables are already in `prisma/schema.prisma`:
- `User` - Auth.js user table
- `Account` - OAuth provider accounts
- `Session` - Database sessions
- `UserProfile` - CodeFlow user extension

**NO MIGRATIONS NEEDED** - schema already has all required tables.

### Security Requirements

1. **No hardcoded secrets** - Use environment variables only
2. **Database sessions** - NOT JWT (per architecture)
3. **HTTPS in production** - Vercel handles automatically
4. **Token encryption** - Handled by Prisma/PostgreSQL
5. **Minimal scopes** - Only request what's needed

### Error Handling Patterns

```typescript
// app/(auth)/auth/error/page.tsx
export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const errorMessages: Record<string, string> = {
    Configuration: 'Server configuration error. Please try again later.',
    AccessDenied: 'You denied access. Please authorize to continue.',
    Verification: 'Token verification failed. Please sign in again.',
    Default: 'An unexpected error occurred. Please try again.',
  }
  
  const message = errorMessages[searchParams.error || 'Default']
  // ... render error UI
}
```

### Testing Approach

1. **Mock `next-auth`** - Already exists at `tests/__mocks__/next-auth.ts`
2. **Component tests** - Test SignInButton, SignOutButton render and click handlers
3. **API tests** - Test auth route returns correct handlers
4. **Integration** - Test session callback returns expected data

### Anti-Patterns to AVOID

1. **DO NOT use JWT sessions** - Architecture mandates database sessions
2. **DO NOT install `next-auth@5`** - Use `next-auth@beta` per official docs
3. **DO NOT create duplicate Prisma client** - Import from `lib/prisma.ts`
4. **DO NOT hardcode credentials** - Use environment variables
5. **DO NOT request write scopes** - MVP is read-only for security
6. **DO NOT skip UserProfile creation** - Required for CodeFlow features
7. **DO NOT use `@next-auth/prisma-adapter`** - Use `@auth/prisma-adapter` for v5
8. **DO NOT use NEXTAUTH_SECRET** - Use AUTH_SECRET per v5 docs
9. **DO NOT use GITHUB_CLIENT_ID/SECRET** - Use AUTH_GITHUB_ID/SECRET for auto-detection
10. **DO NOT put auth.ts in lib/** - Put at project root per official docs

### Definition of Done

- [ ] Users can sign in with GitHub OAuth
- [ ] Sessions persist across browser refreshes
- [ ] Logout clears session completely
- [ ] Protected routes redirect to sign-in
- [ ] OAuth errors display meaningful messages
- [ ] UserProfile created on first sign-in
- [ ] All tests pass (`npm run test`)
- [ ] Lint passes (`npm run lint`)

## References

- **Use Context7 tools for latest docs:** Query library from Context7 for up-to-date Auth.js v5 documentation
- **Official Auth.js Documentation (fallback):** https://authjs.dev/
- [Source: docs/architecture/security-considerations.md#Authentication & Authorization]
- [Source: docs/architecture/backend-architecture.md#Authentication & Authorization Architecture]
- [Source: docs/architecture/database-schema.md#Auth.js Integration]
- [Source: docs/architecture/tech-stack.md] - Auth.js v5
- [Source: docs/prd/epic-1-core-authentication-and-github-integration.md#US1.1]
- [Source: prisma/schema.prisma] - Existing Auth.js schema

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

### File List

