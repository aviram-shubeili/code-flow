# CodeFlow Architecture Diagrams

## 1. System Architecture Overview

```mermaid
graph TD
    subgraph Client
        A[Web Browser] -->|HTTPS| B[Next.js Frontend]
    end

    subgraph Server
        B -->|API Calls| C[Next.js API Routes]
        C -->|Query| D[GitHub GraphQL API]
        C -->|Read/Write| E[(PostgreSQL)]
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bfb,stroke:#333,stroke-width:2px
    style D fill:#fbb,stroke:#333,stroke-width:2px
    style E fill:#bff,stroke:#333,stroke-width:2px
```

## 2. Component Diagram

```mermaid
classDiagram
    class Frontend {
        +React Components
        +Dashboard Page
        +PR List View
        +PR Detail View
        +Auth Components
    }
    
    class APIRoutes {
        +/api/auth/github
        +/api/pull-requests/needs-review
        +/api/pull-requests/returned-to-you
        +/api/pull-requests/my-awaiting-review
        +/api/pull-requests/reviewed-awaiting-author
    }
    
    class GitHubService {
        +fetchPRs(status: string)
        +getUserData()
        +getRepositoryData()
        +submitReview(prId: string, review: object)
        +getPRDetails(prId: string)
    }
    
    class Database {
        +getUser(githubId: string)
        +updateUser(userData: object)
        +cachePRData(repo: string, prData: object)
        +getCachedPRs(repo: string, status: string)
        +invalidateCache(repo: string, prId: string)
    }
    
    class AuthService {
        +handleOAuthCallback(code: string)
        +getUserSession(token: string)
        +refreshToken(refreshToken: string)
    }
    
    Frontend --> APIRoutes : "Makes API calls"
    APIRoutes --> AuthService : "Validates sessions"
    APIRoutes --> GitHubService : "Fetches PR data"
    APIRoutes --> Database : "Manages cache & user data"
    GitHubService --> GitHub : "GitHub GraphQL API"
    AuthService --> GitHub : "OAuth flow"
    Database <--> GitHubService : "Caches responses"
    
    class GitHub {
        <<External>>
        +GitHub API
    }
```

## 3. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend (Next.js API)
    participant G as GitHub OAuth
    
    U->>F: Clicks "Login with GitHub"
    F->>B: GET /api/auth/github
    B-->>F: Redirect to GitHub OAuth
    F->>G: User authenticates with GitHub
    G-->>B: OAuth callback with code
    B->>G: Exchange code for access token
    G-->>B: Returns access token
    B->>B: Store token securely
    B-->>F: Set HTTP-only cookie with session
    F-->>U: Redirect to dashboard
```

## 4. Data Flow for PR Dashboard

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant G as GitHub API
    participant D as Database
    
    U->>F: Opens dashboard
    F->>B: GET /api/pull-requests/needs-review
    B->>D: Check cache
    alt Cached data exists and is fresh
        D-->>B: Return cached PRs
    else Need fresh data
        B->>G: Fetch PRs with GraphQL
        G-->>B: Return PR data
        B->>D: Cache PR data
    end
    B-->>F: Return formatted PRs
    F->>U: Render PR cards
```

## 5. AWS Deployment Architecture

```mermaid
graph LR
    subgraph AWS
        A[CloudFront] --> B["S3 Bucket"]
        A --> C["API Gateway"]
        C --> D["Lambda@Edge"]
        E["RDS PostgreSQL"] --> D
        F["GitHub Actions"] --> |Deploy| B
        F --> |Deploy| C
    end
    
    User -->|HTTPS| A
    D -->|"GitHub API"| G["GitHub"]
    
    style A fill:#FF9900,stroke:#333
    style B fill:#569A31,stroke:#333
    style C fill:#FF4F8B,stroke:#333
    style D fill:#FF9900,stroke:#333
    style E fill:#3366CC,stroke:#333
    style F fill:#2088FF,stroke:#333
```

## 6. Database Schema

```mermaid
erDiagram
    USER ||--o{ ACCOUNT : has
    USER ||--o{ SESSION : has
    USER ||--o{ PR_CACHE : has
    USER ||--o{ VERIFICATION_TOKEN : has

    USER {
        string id PK
        string name
        string email
        string emailVerified
        string image
        string github_id
        string github_username
        string github_avatar_url
        string github_access_token
        timestamp created_at
        timestamp updated_at
    }
    ACCOUNT {
        string id PK
        string userId FK
        string type
        string provider
        string providerAccountId
        string refresh_token
        string access_token
        string expires_at
        string token_type
        string scope
        string id_token
        string session_state
    }
    SESSION {
        string id PK
        string sessionToken
        string userId FK
        timestamp expires
    }
    VERIFICATION_TOKEN {
        string identifier PK
        string token
        timestamp expires
    }
    PR_CACHE {
        string cache_id PK
        string user_id FK
        string pr_id
        string repository
        string title
        string status
        json pr_data
        timestamp fetched_at
        timestamp expires_at
    }
```

*Note: Auth.js DB adapter schema is used for authentication and user management. Custom fields are added to the USER table as needed.*

## 7. Component Interaction for PR Status Update

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant G as GitHub API
    
    U->>F: Reviews PR (approves/requests changes)
    F->>B: POST /api/pull-requests/review
    B->>G: Submit review via GraphQL
    G-->>B: Review submitted successfully
    B->>B: Invalidate cache for this PR
    B-->>F: Success response
    F-->>U: Update UI to reflect new status
```

These diagrams provide a comprehensive overview of the CodeFlow system architecture, component interactions, data flows, and deployment strategy. They serve as living documentation that can be updated as the system evolves.
