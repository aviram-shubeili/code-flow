# Tech Stack

This is the DEFINITIVE technology selection for the entire CodeFlow project. All development must use these exact versions and choices. This table serves as the single source of truth for all technology decisions.

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.3+ | Type-safe frontend development | Essential for maintainable codebase, excellent Next.js integration |
| Frontend Framework | Next.js | 15.0+ | Full-stack React framework | SSR/SSG capabilities, API routes, native Vercel deployment |
| UI Component Library | Tailwind CSS + Headless UI | 4.0+ / 2.0+ | Rapid UI development | GitHub-familiar design system, developer-focused aesthetics |
| State Management | Zustand | 4.4+ | Lightweight client state | Minimal boilerplate, perfect for dashboard state management |
| API State Management | TanStack Query | 5.0+ | Server state synchronization | GitHub API caching, background updates, request deduplication, optimistic UI |
| Backend Language | TypeScript | 5.3+ | Unified language across stack | Shared types between frontend/backend, reduced context switching |
| Backend Framework | Next.js API Routes | 15.0+ | Serverless API endpoints | Native Vercel Functions deployment, unified codebase |
| API Style | REST | - | Standard HTTP APIs | Simple, well-understood, optimal for CRUD operations |
| Database | PostgreSQL (Neon) | 15+ | Primary data store | Serverless PostgreSQL, auto-scaling, generous free tier |
| ORM | Prisma | 5.7+ | Database abstraction layer | Type-safe queries, excellent TypeScript integration, schema migrations |
| Connection Pooling | Neon Built-in | - | Database connection management | PgBouncer included, optimized for serverless |
| Cache | Database-level + Browser | - | Performance optimization | Cost-effective MVP caching strategy |
| Authentication | Auth.js (NextAuth.js v5) | 5.0+ | GitHub OAuth integration | Latest version with improved TypeScript support, session management |
| Hosting | Vercel | - | Frontend + API hosting | Zero-config Next.js deployment, automatic preview deployments |
| CDN | Vercel Edge Network | - | Global content delivery | Included with Vercel, automatic optimization |
| Frontend Testing | Vitest + Testing Library | 1.6+ / 14+ | Component and unit testing | Fast execution, excellent TypeScript support |
| Backend Testing | Vitest + Supertest | 1.6+ / 6.3+ | API integration testing | Consistent testing stack |
| E2E Testing | Playwright | 1.40+ | Critical workflow testing | Cross-browser reliability, excellent CI/CD integration |
| Build Tool | Next.js + Turbopack | 15.0+ | Build system | Optimized builds, fast HMR |
| Bundle Analyzer | @next/bundle-analyzer | 14.0+ | Performance monitoring | Bundle size tracking, performance budget enforcement |
| CI/CD | GitHub Actions | - | Automated testing | Native GitHub integration, Vercel handles deployment |
| Logging | Console + Vercel Logs | - | Application logging | Built-in Vercel log aggregation |
| CSS Framework | Tailwind CSS | 4.0+ | Utility-first styling | Rapid development, consistent design system |

### Performance Budget & Constraints

**Critical Performance Requirements:**
- **Dashboard Load Time:** < 2 seconds (NFR1 compliance) - achieved via TanStack Query caching
- **Cold Start:** < 1 second for API routes (Vercel Functions)
- **Bundle Size Target:** < 250KB gzipped for initial page load
- **Concurrent User Support:** 5-50 users with per-user GitHub rate limits (5000 requests/hour each)
- **API Rate Limit Strategy:** Per-user rate limiting with graceful degradation using TanStack Query stale data
- **Client Cache Hit Rate:** >80% for repeat dashboard visits (TanStack Query efficiency)

**Monitoring Strategy:**
- **@next/bundle-analyzer:** Track bundle size growth and identify bloat
- **Vercel Analytics:** Built-in performance monitoring (Speed Insights)
- **Neon Dashboard:** Database connection and query monitoring
- **GitHub API Rate Tracking:** Per-user rate limit monitoring and alerts at 80% usage
- **TanStack Query DevTools:** Monitor cache hit rates, stale data serving, and API call reduction efficiency


