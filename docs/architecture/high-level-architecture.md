# High Level Architecture

### Technical Summary

CodeFlow employs a **serverless-first Next.js architecture** deployed on AWS Lambda with PostgreSQL data persistence, optimizing for rapid MVP development while maintaining enterprise scalability. The system implements **intelligent GitHub GraphQL API rate limiting** with mathematical cost calculations and exponential backoff strategies to support 5-50 concurrent users during peak collaboration hours. **Slack integration** via Bot API enables direct messaging and channel notifications for PR status updates, while the **four-section dashboard** provides scan-to-action workflows optimized for developer productivity. The MVP architecture emphasizes **cost efficiency** through AWS free-tier optimization, simple database-level caching, and **graceful degradation** during API rate limiting scenarios.

### Platform and Infrastructure Choice

**Platform:** AWS Serverless Stack  
**Key Services:** Lambda (Next.js API routes), RDS PostgreSQL, S3/CloudFront (static assets), Cognito (future enterprise SSO)  
**Deployment Host and Regions:** US-East-1 primary, US-West-2 secondary for disaster recovery

**Rationale:** AWS serverless aligns with PRD requirements for cost optimization, automatic scaling, and enterprise readiness. Lambda functions handle variable load patterns efficiently while RDS provides ACID compliance for PR state management. This stack enables rapid MVP deployment while supporting future enterprise features like SAML/SSO integration.

### Repository Structure

**Structure:** Monorepo with clear module separation  
**Monorepo Tool:** npm workspaces (lightweight, Next.js compatible)  
**Package Organization:** Apps (web, api) + shared packages (types, utils, ui components)

**Rationale:** Monorepo accelerates MVP development through shared TypeScript interfaces and simplified deployment pipeline, while maintaining clear boundaries for future microservices migration if scaling demands require it.

### High Level Architecture Diagram

```mermaid
graph TB
    subgraph "User Layer"
        DEV[Developer Browser]
        SLACK[Slack Workspace]
    end

    subgraph "CDN/Edge Layer"
        CF[CloudFront CDN]
        S3[S3 Static Assets]
    end

    subgraph "Application Layer - AWS Lambda"
        NEXTJS[Next.js SSR/API Routes]
        AUTH[Auth.js v5]
        RATELIMIT[Rate Limit Manager]
        NOTIFY[Notification Service]
    end

    subgraph "Integration Layer"
        GITHUB[GitHub GraphQL API]
        SLACKAPI[Slack Bot API]
    end

    subgraph "Data Layer"
        RDS[(PostgreSQL RDS)]
    end

    DEV --> CF
    SLACK --> NEXTJS
    CF --> S3
    CF --> NEXTJS
    NEXTJS --> AUTH
    NEXTJS --> RATELIMIT
    NEXTJS --> NOTIFY
    RATELIMIT --> GITHUB
    NOTIFY --> SLACKAPI
    NEXTJS --> RDS
    
    classDef aws fill:#ff9900,stroke:#232f3e,color:#fff
    classDef external fill:#4285f4,stroke:#1a73e8,color:#fff
    classDef app fill:#00d4aa,stroke:#00a088,color:#fff
    
    class CF,S3,NEXTJS,RDS aws
    class GITHUB,SLACKAPI,SLACK external
    class AUTH,RATELIMIT,NOTIFY app
```

### Architectural Patterns

- **Serverless Architecture:** AWS Lambda for compute with automatic scaling - _Rationale:_ Optimal for variable load patterns and cost efficiency during MVP phase
- **API Gateway Pattern:** Single Next.js API entry point with route-based organization - _Rationale:_ Centralized rate limiting, authentication, and monitoring
- **Repository Pattern:** Abstract data access for PR and user management - _Rationale:_ Enables testing and supports future database scaling strategies
- **Circuit Breaker Pattern:** Graceful degradation during GitHub API rate limiting - _Rationale:_ Maintains service availability with cached data during API constraints
- **Event-Driven Notifications:** Slack integration via Bot API with webhook support - _Rationale:_ Real-time PR status updates without constant polling overhead, faster approval process than Microsoft Graph API
