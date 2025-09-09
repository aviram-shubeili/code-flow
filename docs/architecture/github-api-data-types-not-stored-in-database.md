# GitHub API Data Types (Not Stored in Database)

These TypeScript interfaces define data structures returned directly from GitHub API and used throughout the application. **These are NOT stored in our database** - they represent live data from GitHub.

### Pull Request Data (GitHub API Response)

**Purpose:** Live PR data fetched from GitHub API for dashboard categorization

```typescript
interface GitHubPullRequest {
  id: number;               // GitHub PR identifier
  number: number;           // PR number within repository
  title: string;            // PR title
  body: string | null;      // PR description
  state: 'open' | 'closed'; // GitHub PR state
  draft: boolean;           // Draft PR status
  user: GitHubUser;         // PR author
  requested_reviewers: GitHubUser[]; // Requested reviewers
  assignees: GitHubUser[];  // Assigned users
  comments: number;         // Comment count
  updated_at: string;       // Last modification (ISO string)
  created_at: string;       // Creation time (ISO string)
  head: {
    ref: string;            // Source branch
    repo: {
      full_name: string;    // Repository full name
    };
  };
  base: {
    ref: string;            // Target branch
  };
  mergeable_state: 'mergeable' | 'conflicting' | 'unknown';
}
```

### Review Data (GitHub API Response)

**Purpose:** Live review data from GitHub API for dashboard logic

```typescript
interface GitHubReview {
  id: number;
  user: GitHubUser;
  state: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED';
  submitted_at: string | null;
  body: string | null;
}
```

### Supporting Types (GitHub API)

```typescript
// GitHub user information from API responses
interface GitHubUser {
  id: number;
  login: string;        // Username
  name: string | null;  // Display name
  avatar_url: string;   // Avatar URL
}

// Dashboard categorization result (computed from GitHub API data)
interface DashboardCategorizationResult {
  needsReview: GitHubPullRequest[];    // PRs where user is requested reviewer
  returnedToYou: GitHubPullRequest[];  // User's PRs with changes requested  
  myPRs: GitHubPullRequest[];          // All PRs authored by user
  reviewedAwaiting: GitHubPullRequest[]; // PRs user reviewed, awaiting author
}

// Repository data from GitHub API (not stored)
interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  private: boolean;
  default_branch: string;
  language: string | null;
  description: string | null;
}
```
