# CodeFlow - System Patterns & Architecture

**Last Updated:** 2025-07-23

## Overall Architecture Pattern

### Multi-Tier Client-Server Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Database      │    │  External APIs  │
│  (React/Next)   │◄──►│  (Next.js API)   │◄──►│  (PostgreSQL)   │    │   (GitHub)      │
│                 │    │                  │    │                 │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Layer (React/Next.js)
- **Pattern:** Component-based UI with App Router
- **State Management:** React state + Server Actions for mutations
- **Styling:** Tailwind CSS utility-first approach
- **Components:** Shadcn UI for consistent design system
- **Type Safety:** Full TypeScript coverage

### Backend API Layer (Next.js API Routes)
- **Pattern:** Facade pattern - Backend abstracts GitHub API complexity
- **Routes Structure:**
  ```
  /api/auth/[...nextauth]           - Authentication endpoints
  /api/pull-requests/needs-review   - PRs needing user's review
  /api/pull-requests/returned-to-you - PRs with changes requested
  /api/pull-requests/my-awaiting-review - User's PRs awaiting review
  /api/pull-requests/reviewed-awaiting-author - PRs awaiting author (conditional)
  /api/health/*                     - System health checks
  ```
- **Data Flow:** Client → API Route → Business Logic → GitHub GraphQL → Response
- **Response Format:** Standardized JSON with PR data (ID, Title, Link, Author, Status, Comments, Changes)

### Database Layer (PostgreSQL + Drizzle)
- **ORM Pattern:** Type-safe query building with Drizzle
- **Schema Management:** Migration-based with Drizzle Kit
- **Connection Pooling:** Configured for Edge runtime compatibility
- **Auth Integration:** Auth.js adapter schema (User, Account, Session, VerificationToken)
- **Custom Fields:** GitHub-specific user data (github_id, github_username, github_avatar_url)

## Key Design Patterns

### Authentication & Authorization
- **OAuth 2.0 Flow:** GitHub OAuth with PKCE for security
- **Session Management:** Auth.js handles token refresh and persistence
- **Security Pattern:** Tokens never exposed to frontend, server-side only

### Data Fetching Strategy
- **Server Components:** Default for static content and initial data
- **Client Components:** For interactive elements requiring state
- **GitHub GraphQL Integration:** Backend fetches PR data via GraphQL for efficiency
- **Caching Strategy:** 
  - Backend caching for GitHub API responses (memory/PostgreSQL)
  - Frontend caching with React Query/SWR for perceived performance
  - Time-based expiry for PR data, immediate refresh for user data

### Component Architecture
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   ├── dashboard/         # Main dashboard with four sections
│   └── api/               # API routes (facade pattern)
│       └── pull-requests/ # PR data endpoints
├── components/            # Reusable components
│   ├── auth/              # Authentication components
│   ├── ui/                # Shadcn UI components
│   └── dashboard/         # PR cards, sections, status badges
├── db/                    # Database layer
│   ├── schema.ts          # Auth.js + custom GitHub schema
│   └── migrations/        # Database migrations
└── lib/                   # GitHub API client, utilities
```

### Error Handling Pattern
- **API Routes:** Consistent error response format
- **Frontend:** Error boundaries for graceful degradation
- **Database:** Connection retry logic and health checks
- **External APIs:** Timeout handling and fallback responses

## Technical Decision Framework

### Type Safety First
- **Principle:** Everything typed, no `any` unless absolutely necessary
- **Implementation:** TypeScript strict mode, Drizzle for type-safe queries
- **Validation:** Runtime validation for external API responses

### Security by Design
- **Authentication:** No client-side token storage
- **Environment:** Secure environment variable handling
- **HTTPS:** Required for all production communication
- **Input Validation:** Server-side validation for all user inputs

### Performance Considerations
- **Bundle Size:** Tree-shaking and code splitting
- **Database:** Connection pooling and query optimization
- **Caching:** Intelligent caching strategy for GitHub API responses
- **Loading States:** Progressive loading for better UX

### Development Experience
- **Hot Reload:** Fast development feedback loop
- **Type Checking:** Real-time type checking in development
- **Database Tools:** Drizzle Studio for database management
- **Docker:** Consistent development environment

## Integration Patterns

### GitHub API Integration
- **Protocol:** GraphQL for efficient data fetching
- **Required Data:** PR lists filtered by user relationship and status
- **Rate Limiting:** 5000 requests/hour for authenticated users, backend caching essential
- **Error Handling:** Graceful degradation when API unavailable
- **Data Transformation:** Backend normalizes GitHub data into standardized PR objects
- **Authentication Scopes:** repo, user:email, read:user for complete PR access

### Database Patterns
- **Auth.js Schema:** Standard tables (User, Account, Session, VerificationToken)
- **Custom Extensions:** GitHub-specific user fields (github_id, username, avatar_url)
- **Migration Strategy:** Version-controlled schema changes via Drizzle Kit
- **Caching Storage:** Optional PR data caching in PostgreSQL for performance
- **Connection Management:** Proper connection lifecycle with pooling

### Deployment Architecture
- **Containerization:** Docker for consistent environments
- **Environment Separation:** Clear dev/staging/production boundaries
- **Health Checks:** Database and API connectivity monitoring
- **Scaling:** Designed for horizontal scaling if needed

## Code Organization Principles

### File Structure Logic
- **Co-location:** Related files grouped together
- **Separation of Concerns:** Clear boundaries between layers
- **Naming Conventions:** Consistent and descriptive naming
- **Import Organization:** Absolute imports from src root

### Component Design
- **Single Responsibility:** Each component has one clear purpose
- **Composition:** Prefer composition over inheritance
- **Props Interface:** Clear TypeScript interfaces for all props
- **Accessibility:** ARIA attributes and semantic HTML

### State Management Strategy
- **Server State:** Managed by Next.js and React Server Components
- **Client State:** Local component state for UI interactions
- **Form State:** React Hook Form for complex forms
- **Global State:** Minimal global state, prefer server state

This architecture supports the learning goals while maintaining production-quality standards suitable for portfolio demonstration.
