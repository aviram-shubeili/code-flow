# Tech Stack

This is the DEFINITIVE technology selection for the entire CodeFlow project. All development must use these exact versions and choices. This table serves as the single source of truth for all technology decisions.

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.3+ | Type-safe frontend development | Essential for maintainable codebase, excellent Next.js integration |
| Frontend Framework | Next.js | 14.0+ | Full-stack React framework | SSR/SSG capabilities, API routes, optimal AWS Lambda deployment |
| UI Component Library | Tailwind CSS + Headless UI | 3.4+ / 2.0+ | Rapid UI development | GitHub-familiar design system, developer-focused aesthetics |
| State Management | Zustand | 4.4+ | Lightweight client state | Minimal boilerplate, perfect for dashboard state management |
| API State Management | TanStack Query | 5.0+ | Server state synchronization | GitHub API caching, background updates, request deduplication, optimistic UI |
| Backend Language | TypeScript | 5.3+ | Unified language across stack | Shared types between frontend/backend, reduced context switching |
| Backend Framework | Next.js API Routes | 14.0+ | Serverless API endpoints | Native Lambda deployment, unified codebase |
| API Style | REST | - | Standard HTTP APIs | Simple, well-understood, optimal for CRUD operations |
| Database | PostgreSQL | 15+ | Primary data store | ACID compliance, excellent RDS support, complex query capabilities |
| ORM | Prisma | 5.7+ | Database abstraction layer | Type-safe queries, excellent TypeScript integration, schema migrations |
| Connection Pooling | Prisma Connection Pool | - | Database connection management | Optimized for serverless, handles 5-50 concurrent users efficiently |
| Cache | Database-level + Browser | - | Performance optimization | Cost-effective MVP caching strategy |
| File Storage | AWS S3 | - | Static assets and logs | Seamless CloudFront integration, enterprise-grade reliability |
| Authentication | Auth.js (NextAuth.js v5) | 5.0+ | GitHub OAuth integration | Latest version with improved TypeScript support, session management, enterprise SSO ready |
| Slack Integration | @slack/bolt-js | 3.17+ | Slack Bot API framework | Official Slack SDK for bot development, webhook handling, event subscriptions |
| Frontend Testing | Vitest + Testing Library | 1.6+ / 14+ | Component and unit testing | Fast execution, excellent TypeScript support |
| Backend Testing | Vitest + Supertest | 1.6+ / 6.3+ | API integration testing | Consistent testing stack, Lambda-compatible |
| E2E Testing | Playwright | 1.40+ | Critical workflow testing | Cross-browser reliability, excellent CI/CD integration |
| Build Tool | Next.js + Turbo | 14.0+ / 1.10+ | Monorepo build system | Optimized for serverless deployment, fast rebuilds |
| Bundle Analyzer | @next/bundle-analyzer | 13.5+ | Performance monitoring | Bundle size tracking, performance budget enforcement |
| Bundler | Webpack (via Next.js) | - | Asset bundling | Built-in optimization, tree shaking, code splitting |
| IaC Tool | AWS CDK | 2.100+ | Infrastructure as code | TypeScript-native, excellent Lambda/RDS deployment |
| CI/CD | GitHub Actions | - | Automated deployment | Native GitHub integration, AWS deployment actions |
| Monitoring | AWS CloudWatch | - | Application monitoring | Built-in AWS integration, cost-effective for MVP |
| Logging | Winston + CloudWatch | 3.11+ | Structured logging | JSON formatting, centralized log aggregation |
| CSS Framework | Tailwind CSS | 3.4+ | Utility-first styling | Rapid development, consistent design system |

### Performance Budget & Constraints

**Critical Performance Requirements:**
- **Dashboard Load Time:** < 2 seconds (NFR1 compliance) - achieved via TanStack Query caching
- **Lambda Cold Start:** < 1 second for API routes  
- **Bundle Size Target:** < 250KB gzipped for initial page load (adjusted for TanStack Query)
- **Concurrent User Support:** 5-50 users with per-user GitHub rate limits (5000 requests/hour each)
- **API Rate Limit Strategy:** Per-user rate limiting with graceful degradation using TanStack Query stale data
- **Client Cache Hit Rate:** >80% for repeat dashboard visits (TanStack Query efficiency)

**Monitoring Strategy:**
- **@next/bundle-analyzer:** Track bundle size growth and identify bloat
- **CloudWatch Metrics:** Monitor Lambda cold starts and execution duration  
- **Prisma Connection Pool:** Track database connection usage for user profiles and repository preferences
- **GitHub API Rate Tracking:** Per-user rate limit monitoring and alerts at 80% usage
- **TanStack Query DevTools:** Monitor cache hit rates, stale data serving, and API call reduction efficiency
