---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/analysis/architecture-decision-record-2026-01-28.md
  - docs/brief.md
  - docs/project-context.md
  - docs/front-end-spec.md
  - _bmad-output/analysis/brainstorming-session-copilot-sdk-features.md
workflowType: 'architecture'
project_name: 'code-flow'
user_name: 'Aviram'
date: '2026-01-31'
lastStep: 8
status: 'complete'
completedAt: '2026-01-31'
---

# Architecture Decision Document - CodeFlow

**Project:** code-flow  
**Architect:** Winston  
**Date:** 2026-01-31

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Project Goals & Constraints

**Personal Project Context:**
- Solo developer building for portfolio and learning
- Primary learning goals: Copilot SDK, VS Code extension development
- First users: 5-15 person team at work
- Must ship usable product, not just experimental

**Implications:**
- Favor interesting tech over "boring but proven" (Copilot SDK ✓)
- Clean, demonstrable architecture for portfolio value
- Avoid over-engineering for scale that won't come
- Document decisions well (interview talking points)

---

### Requirements Overview

**Functional Requirements (29 total):**
- Authentication & Setup (FR1-4): VS Code Auth API integration
- PR Data & Synchronization (FR5-8): GitHub GraphQL API with pagination
- Dashboard & Categorization (FR9-13): 4-section outcome-based layout
- Review & Author Workflows (FR14-17): PR lifecycle management
- AI Phase 1 Features (FR25-29): Copilot SDK integration with graceful fallback
- Notifications (FR18-20): In-editor VS Code notifications with "seen" tracking
- Team Insight (FR21-22): Team-level PR visibility
- Documentation (FR23-24): Setup and troubleshooting guides

**Non-Functional Requirements:**
- Dashboard load time <2 seconds
- 99.5% crash-free sessions
- Configurable polling interval (default 30s, range 15s-120s)
- WCAG 2.1 AA accessibility compliance
- Graceful degradation when Copilot unavailable

---

### Technical Decisions (Corrections to ADR)

| Item | Original ADR | Updated Decision |
|------|--------------|------------------|
| **Authentication** | PAT + SecretStorage | VS Code Auth API (`vscode.authentication`) |
| **Polling Interval** | Fixed 60s | Configurable (default 30s, 15s-120s range) |
| **Rate Limits** | Simple 5000 req/hr | Point-based GraphQL costs + pagination |

---

### Scale & Complexity

| Dimension | Assessment |
|-----------|------------|
| **Project complexity** | Medium — non-trivial stack, well-scoped MVP |
| **Primary domain** | VS Code Extension (Node.js + React webview) |
| **AI integration** | Copilot SDK first-mover (portfolio differentiator) |
| **Data complexity** | Low — PR metadata from GitHub, no database |
| **Real-time needs** | Medium — configurable polling, optimistic UI |
| **Architectural components** | ~8 major modules |

---

### Navigation Architecture

**Two-View Model:**
```
Dashboard View           PR Chat Page
┌─────────────────┐     ┌─────────────────┐
│ 4-Section Grid  │ ──► │ PR Header       │
│ PR Cards        │     │ Unified Timeline│
│ [💬] buttons    │ ◄── │ Comment Input   │
└─────────────────┘     └─────────────────┘
```

**Routing:** Client-side routing within single webview (React Router or state-based)

---

### Notification Architecture

**"Seen" State Tracking:**
- Store `{ prId: lastSeenUpdatedAt }` in VS Code `globalState`
- Compare PR's `updatedAt` on each refresh
- Trigger notification if newer activity detected
- Update stored timestamp when user views PR

**Notification Triggers:**
- New comments since last seen
- New reviews (approved, changes requested)
- Status changes (merged, closed)
- New commits pushed

---

### PR Chat Page (Phase 2)

**Unified Timeline Model:**
- User messages: PR description, review comments, general comments
- System events: commits, reviews, merge, CI status
- Data source: GitHub `PullRequestTimelineItems` GraphQL API

**Features:**
- Chronological message display with sender avatars
- System events styled distinctly from user messages
- Comment input with optimistic posting
- Back navigation to dashboard

---

### Cross-Cutting Concerns

1. **Graceful Degradation** — Core features work without Copilot SDK
2. **Error Handling** — GitHub API failures, rate limits, stale data indicators
3. **State Management** — PR data sync between extension host and webview
4. **Theming** — VS Code theme integration (automatic dark/light)
5. **Testing Strategy** — Unit, component, and extension integration tests

---

### Technical Constraints & Dependencies

| Dependency | Risk | Mitigation |
|------------|------|------------|
| **Copilot SDK** | Technical preview, may change | Adapter pattern, graceful fallback |
| **GitHub GraphQL API** | Point-based rate limits | Efficient queries, pagination, caching |
| **VS Code Auth API** | Scope requirements | Request minimal scopes (`repo`) |
| **Webview ↔ Extension** | postMessage serialization | Type-safe message contracts |

---

## Starter Template Evaluation

### Primary Technology Domain

**VS Code Extension with React Webview** — TypeScript throughout, React UI bundled via Vite.

### Starter Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **yo code (TypeScript)** | Official, always current, minimal | No React webview setup |
| **Custom scaffold** | Exactly what we need | More initial setup |
| **Community templates** | Some include React | Often stale, unmaintained |

### Selected Approach: `yo code` + Manual Webview Setup

**Rationale:** The official generator gives us a correct, current extension structure. We'll add the React + Vite webview manually — it's straightforward and gives us full control over the stack.

### Initialization Commands

**Step 1: Create extension scaffold**
```bash
npx --package yo --package generator-code -- yo code
# Select: New Extension (TypeScript)
# Name: codeflow
# Bundler: esbuild (recommended for extensions)
# Package manager: npm
```

**Step 2: Add webview-ui (React + Vite + Tailwind + shadcn/ui)**
```bash
cd codeflow
mkdir webview-ui
cd webview-ui
npm create vite@latest . -- --template react-ts
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
```

### Architectural Decisions Provided by Stack

| Layer | Technology | Decision Made |
|-------|------------|---------------|
| **Extension Host** | TypeScript + esbuild | Fast builds, VS Code standard |
| **Webview UI** | React 18 + TypeScript | Component-based, type-safe |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first, accessible components |
| **Build** | Vite (webview), esbuild (extension) | Fast HMR, optimized bundles |
| **Testing** | Vitest (webview), Mocha (extension) | Per-context test runners |
| **Theming** | VS Code CSS variables | Automatic dark/light mode |

### Project Structure

```
codeflow/
├── src/                          # Extension host
│   ├── extension.ts              # Entry point, activation
│   ├── webview/                  # Webview panel management  
│   │   └── DashboardPanel.ts
│   ├── github/                   # GitHub API client
│   ├── auth/                     # VS Code Auth integration
│   └── copilot/                  # Copilot SDK adapter
├── webview-ui/                   # React webview
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/           # shadcn/ui + custom
│   │   ├── hooks/                # React hooks
│   │   └── lib/                  # Utilities
│   ├── package.json
│   └── vite.config.ts
├── package.json                  # Extension manifest
├── tsconfig.json
└── esbuild.js                    # Extension bundler config
```

### Key Integration Points

**Webview ↔ Extension Communication:**
```typescript
// Extension → Webview
panel.webview.postMessage({ type: 'pr-data', data: prs });

// Webview → Extension  
vscode.postMessage({ type: 'refresh-request' });
```

**VS Code Theme Integration (in Tailwind):**
```css
/* globals.css */
:root {
  --background: var(--vscode-editor-background);
  --foreground: var(--vscode-editor-foreground);
  /* shadcn/ui uses these CSS variables */
}
```

**Note:** Project initialization using these commands will be the first implementation story.

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Webview state management approach
- Extension ↔ Webview message contract
- Extension host storage strategy

**Important Decisions (Shape Architecture):**
- Testing strategy and tooling
- Development workflow

**Deferred Decisions (Post-MVP):**
- E2E testing framework
- Performance monitoring

---

### Webview State Management

**Decision:** TanStack Query + React Context

| Concern | Solution |
|---------|----------|
| **PR data fetching** | TanStack Query |
| **Caching & refetching** | TanStack Query (built-in) |
| **Loading/error states** | TanStack Query (built-in) |
| **UI state** (active section, filters) | React Context + useState |

**Rationale:** 
- TanStack Query handles the "fetch, cache, poll" pattern that matches our 30s refresh requirement
- Automatic background refetching aligns with polling model
- React Context for simple UI state avoids over-engineering
- ~13KB gzipped — acceptable for webview

**Example Pattern:**
```typescript
// hooks/usePullRequests.ts
export function usePullRequests() {
  return useQuery({
    queryKey: ['pull-requests'],
    queryFn: fetchPRsFromExtension,
    refetchInterval: 30000,  // Configurable via settings
    staleTime: 25000,
  });
}
```

---

### Extension Host Storage

**Decision:** VS Code `globalState` for all persistent data

| Data Type | Storage | Scope |
|-----------|---------|-------|
| Auth token | `vscode.authentication` | Managed by VS Code |
| User preferences | `context.globalState` | All workspaces |
| PR "seen" timestamps | `context.globalState` | All workspaces |
| Cached PR data | `context.globalState` | All workspaces |

**Rationale:**
- User has single GitHub account across workspaces
- "Seen" state should follow user, not workspace
- No external dependencies (SQLite, etc.)
- Built-in serialization to JSON

**Example Pattern:**
```typescript
// Storage keys
const STORAGE_KEYS = {
  SEEN_STATE: 'codeflow.seenState',
  PREFERENCES: 'codeflow.preferences',
  PR_CACHE: 'codeflow.prCache',
} as const;

// Usage
const seenState = context.globalState.get<SeenState>(STORAGE_KEYS.SEEN_STATE) ?? {};
await context.globalState.update(STORAGE_KEYS.SEEN_STATE, newSeenState);
```

---

### Webview ↔ Extension Message Contract

**Decision:** Shared TypeScript interfaces in common types folder

**Location:** `src/shared/messages.ts`

```typescript
// Messages FROM webview TO extension
export type WebviewMessage = 
  | { type: 'refresh-request' }
  | { type: 'open-pr'; prId: string }
  | { type: 'mark-seen'; prId: string }
  | { type: 'trigger-ai-review'; prId: string }
  | { type: 'update-preferences'; preferences: Partial<UserPreferences> };

// Messages FROM extension TO webview
export type ExtensionMessage =
  | { type: 'pr-data'; prs: PullRequest[]; lastUpdated: number }
  | { type: 'preferences'; preferences: UserPreferences }
  | { type: 'error'; code: string; message: string }
  | { type: 'ai-review-status'; prId: string; status: 'pending' | 'complete' | 'error' };
```

**Rationale:**
- Compile-time type safety without runtime overhead
- No additional dependencies
- Shared folder imported by both extension host and webview
- Discriminated unions enable exhaustive switch handling

---

### Testing Strategy

**Decision:** Vitest for unit/component tests + VS Code test runner for integration

| Layer | Tool | Purpose |
|-------|------|---------||
| **Webview Components** | Vitest + Testing Library | React component testing, fast feedback |
| **Extension Host Units** | Vitest + mocked `vscode` | Business logic, API clients |
| **Extension Integration** | `@vscode/test-electron` | Tests requiring real VS Code APIs |

**Rationale:**
- Vitest is 10-50x faster than Mocha
- Single test syntax across webview and extension host
- Integration tests in real VS Code for auth, storage, activation
- All tests run in CI (GitHub Actions with `xvfb-run` for integration)

**Test Structure:**
```
tests/
├── webview/              # Vitest + Testing Library
│   └── components/
├── extension/            # Vitest with vscode mocks
│   ├── github/
│   └── copilot/
└── integration/          # @vscode/test-electron
    └── activation.test.ts
```

**CI Configuration:**
```yaml
- run: npm run test:unit        # Vitest (fast)
- run: xvfb-run npm run test:integration  # Real VS Code
```

---

### Typed GraphQL with Code Generation

**Decision:** GraphQL Code Generator for fully typed GitHub API queries

**Why:**
- Full type safety from query definition → response handling
- IDE autocomplete for query results
- Catches breaking GitHub schema changes at build time
- Zero runtime type errors from API responses

**Dependencies:**
```bash
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations
```

**Configuration (`codegen.yml`):**
```yaml
schema:
  - https://api.github.com/graphql:
      headers:
        Authorization: Bearer ${GITHUB_TOKEN}
documents: "src/github/queries/**/*.graphql"
generates:
  src/github/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
```

**Example Query (`src/github/queries/pull-requests.graphql`):**
```graphql
query GetPullRequests($owner: String!, $repo: String!, $first: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequests(first: $first, states: [OPEN]) {
      nodes {
        id
        number
        title
        author { login avatarUrl }
        reviewDecision
        updatedAt
      }
    }
  }
}
```

**Generated Types (automatic):**
```typescript
// src/github/generated/graphql.ts
export type GetPullRequestsQuery = {
  repository: {
    pullRequests: {
      nodes: Array<{
        id: string;
        number: number;
        title: string;
        author: { login: string; avatarUrl: string } | null;
        reviewDecision: PullRequestReviewDecision | null;
        updatedAt: string;
      } | null> | null;
    };
  } | null;
};

export type GetPullRequestsQueryVariables = {
  owner: string;
  repo: string;
  first: number;
};
```

**Build Integration:**
```json
{
  "scripts": {
    "codegen": "graphql-codegen --config codegen.yml",
    "prebuild": "npm run codegen"
  }
}
```

**Project Structure Update:**
```
src/github/
├── queries/
│   ├── pull-requests.graphql     # Query definitions
│   ├── timeline.graphql
│   └── reviews.graphql
├── generated/
│   └── graphql.ts                # Auto-generated types
├── api-client.ts                 # Uses generated types
└── types.ts                      # Domain types (extend generated)
```

**Note:** The `generated/` folder can be gitignored (regenerated on build) or committed (faster CI, no token needed).

---

### Development Workflow

**Decision:** Webview HMR only (Option A)

**Development Mode:**
```bash
# Terminal 1: Webview dev server
cd webview-ui && npm run dev

# Terminal 2: Extension host (F5 in VS Code)
# Launches Extension Development Host
```

**How It Works:**
- Vite dev server on `localhost:5173` with instant HMR
- Extension loads webview from dev server during development
- Production build bundles webview into extension

**Rationale:**
- 80% of dev time is in webview (React/UI work)
- Simple setup, fewer moving parts
- Can upgrade to full watch mode later if needed
- Extension host changes are less frequent

**Build Commands:**
```json
{
  "scripts": {
    "dev:webview": "cd webview-ui && vite",
    "build:webview": "cd webview-ui && vite build",
    "build:extension": "esbuild src/extension.ts --bundle --outfile=dist/extension.js",
    "build": "npm run build:webview && npm run build:extension",
    "codegen": "graphql-codegen --config codegen.yml",
    "prebuild": "npm run codegen",
    "package": "vsce package"
  }
}
```

---

### Recommended VS Code Extensions

**Required for Development:**

| Extension | Purpose |
|-----------|----------|
| `graphql.vscode-graphql` | GraphQL language support: autocomplete, validation, go-to-definition for `.graphql` files |
| `graphql.vscode-graphql-syntax` | Syntax highlighting for `.graphql` files and embedded GraphQL in TypeScript |
| `bradlc.vscode-tailwindcss` | Tailwind CSS IntelliSense: class autocomplete, hover previews, linting |
| `dbaeumer.vscode-eslint` | ESLint integration for real-time linting |
| `esbenp.prettier-vscode` | Prettier formatting on save |

**Workspace Configuration (`.vscode/extensions.json`):**
```json
{
  "recommendations": [
    "graphql.vscode-graphql",
    "graphql.vscode-graphql-syntax",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

**GraphQL Extension Configuration (`.graphqlrc.yml`):**
```yaml
schema:
  - https://api.github.com/graphql:
      headers:
        Authorization: Bearer ${GITHUB_TOKEN}
documents: "src/github/queries/**/*.graphql"
```

This enables the GraphQL extension to provide autocomplete and validation against GitHub's schema while editing queries.

---

### Decision Impact Analysis

**Implementation Sequence:**
1. Project scaffolding (yo code + webview-ui setup)
2. Message contract types (enables parallel work)
3. Extension host storage utilities
4. Webview with TanStack Query setup
5. Testing infrastructure

**Cross-Component Dependencies:**
```
Message Types ─────┬──► Extension Host
                   │
                   └──► Webview UI
                   
TanStack Query ────────► Depends on message contract
                   
Storage ───────────────► Extension host only (webview requests via messages)
```

---

## Implementation Patterns & Consistency Rules

These patterns ensure all AI agents write compatible, consistent code that integrates seamlessly.

---

### Naming Patterns

#### File Naming

| Context | Convention | Examples |
|---------|------------|----------|
| **React components** | PascalCase | `PRCard.tsx`, `Dashboard.tsx`, `PRChatPage.tsx` |
| **React hooks** | camelCase with `use` prefix | `usePullRequests.ts`, `useExtensionMessage.ts` |
| **Utilities/services** | kebab-case | `github-client.ts`, `message-types.ts` |
| **shadcn/ui components** | kebab-case (their convention) | `components/ui/button.tsx` |
| **Extension host modules** | kebab-case | `src/github/api-client.ts`, `src/copilot/adapter.ts` |
| **Test files** | Match source file + `.test` | `PRCard.test.tsx`, `api-client.test.ts` |

#### Code Naming

| Element | Convention | Examples |
|---------|------------|----------|
| **TypeScript types/interfaces** | PascalCase | `PullRequest`, `ExtensionMessage`, `UserPreferences` |
| **Functions** | camelCase | `fetchPullRequests`, `handleRefresh`, `triggerAiReview` |
| **Variables** | camelCase | `prData`, `isLoading`, `pendingReviews` |
| **Constants** | SCREAMING_SNAKE | `STORAGE_KEYS`, `DEFAULT_POLL_INTERVAL`, `API_BASE_URL` |
| **React components** | PascalCase | `PRCard`, `DashboardSection`, `UnifiedTimeline` |
| **Custom hooks** | camelCase with `use` prefix | `usePullRequests`, `useSeenState` |

#### Message Type Naming

| Pattern | Convention | Examples |
|---------|------------|----------|
| **Message types** | kebab-case strings | `'refresh-request'`, `'pr-data'`, `'ai-review-status'` |
| **Error codes** | SCREAMING_SNAKE | `'RATE_LIMITED'`, `'AUTH_FAILED'`, `'NETWORK_ERROR'` |

---

### Structure Patterns

#### Test Organization

| Test Type | Location | Tool | Purpose |
|-----------|----------|------|---------|
| **Unit tests** | Co-located (`*.test.ts`) | Vitest | Pure functions, hooks, utilities |
| **Component tests** | Co-located (`*.test.tsx`) | Vitest + Testing Library | React component testing |
| **Integration tests** | `tests/integration/` | `@vscode/test-electron` | Real VS Code APIs |
| **E2E tests** | `tests/e2e/` | TBD (post-MVP) | Full user flows |

#### Component Organization

Components organized by feature, matching the two-view model:

```
webview-ui/src/
├── components/
│   ├── dashboard/           # Dashboard view components
│   │   ├── Dashboard.tsx
│   │   ├── Dashboard.test.tsx
│   │   ├── PRCard.tsx
│   │   ├── PRCard.test.tsx
│   │   ├── SectionGrid.tsx
│   │   └── SectionGrid.test.tsx
│   ├── pr-chat/             # PR Chat page components
│   │   ├── PRChatPage.tsx
│   │   ├── UnifiedTimeline.tsx
│   │   ├── TimelineEvent.tsx
│   │   └── CommentInput.tsx
│   ├── shared/              # Shared across views
│   │   ├── PRHeader.tsx
│   │   └── LoadingSpinner.tsx
│   └── ui/                  # shadcn/ui components (no tests)
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── hooks/
│   ├── usePullRequests.ts
│   ├── usePullRequests.test.ts
│   ├── useExtensionMessage.ts
│   └── useSeenState.ts
├── lib/
│   ├── utils.ts             # shadcn/ui utilities
│   └── vscode-api.ts        # VS Code postMessage wrapper
└── context/
    ├── UIContext.tsx
    └── QueryProvider.tsx
```

#### Extension Host Organization

```
src/
├── extension.ts             # Entry point, activation
├── webview/
│   ├── dashboard-panel.ts   # Webview panel management
│   └── webview-provider.ts
├── github/
│   ├── api-client.ts
│   ├── api-client.test.ts
│   ├── queries.ts           # GraphQL queries
│   └── types.ts
├── auth/
│   └── auth-provider.ts     # VS Code Auth API wrapper
├── copilot/
│   ├── adapter.ts           # Copilot SDK adapter
│   ├── adapter.test.ts
│   └── fallback.ts          # Graceful degradation
├── storage/
│   ├── storage-service.ts   # globalState wrapper
│   └── storage-keys.ts
└── shared/
    ├── messages.ts          # Message contract types
    └── types.ts             # Shared domain types
```

---

### Format Patterns

#### API Response Wrapper

Messages from extension to webview follow consistent structure:

```typescript
// Success with data
{ type: 'pr-data', prs: PullRequest[], lastUpdated: number }

// Error (flat structure)
{ type: 'error', code: 'RATE_LIMITED', message: 'GitHub API rate limit exceeded' }

// Status update
{ type: 'ai-review-status', prId: string, status: 'pending' | 'complete' | 'error' }
```

#### Date/Time Format

| Context | Format |
|---------|--------|
| **API responses** | ISO 8601 strings (`2026-01-31T14:30:00Z`) |
| **Storage** | Unix timestamps (milliseconds) |
| **UI display** | Relative time (`2 hours ago`) via date-fns or similar |

#### JSON Field Naming

| Layer | Convention |
|-------|------------|
| **GitHub API responses** | camelCase (GraphQL) |
| **Internal types** | camelCase |
| **Message payloads** | camelCase |
| **Storage keys** | dot-notation strings (`'codeflow.seenState'`) |

---

### Loading State Patterns

#### State Ownership

| State | Owner | Pattern |
|-------|-------|---------|
| **Data loading** | TanStack Query | `isLoading`, `isFetching`, `error` |
| **Background refresh** | TanStack Query | `isRefetching` (don't show skeleton) |
| **Async UI operations** | React Context | `pendingAiReviews: Set<string>` |
| **UI state** | React Context | `activeSection`, `selectedPrId` |

#### Loading UI Patterns

```typescript
// Initial load: Show skeleton
if (isLoading) return <DashboardSkeleton />;

// Background refresh: Show subtle indicator, keep data visible
<LastUpdated timestamp={lastUpdated} isRefreshing={isRefetching} />

// User-triggered refresh: Spinner on button
<Button onClick={refetch} disabled={isFetching}>
  {isFetching ? <Spinner /> : <RefreshIcon />}
</Button>

// Async operation: Per-item loading state
<PRCard isAiReviewPending={pendingReviews.has(pr.id)} />
```

---

### Error Handling Patterns

#### Error Boundary Strategy

| Scope | Handler | Recovery |
|-------|---------|----------|
| **App-level** | React Error Boundary at `App.tsx` | Show error UI, offer refresh |
| **Query-level** | TanStack Query `onError` | Toast notification, keep stale data |
| **Component-level** | Try-catch in event handlers | Toast notification |

#### Error Message Structure

```typescript
// Extension → Webview error
{ type: 'error', code: ErrorCode, message: string }

// ErrorCodes (SCREAMING_SNAKE)
type ErrorCode = 
  | 'RATE_LIMITED'      // GitHub API rate limit
  | 'AUTH_FAILED'       // Authentication required
  | 'NETWORK_ERROR'     // Connection failed
  | 'API_ERROR'         // GitHub API returned error
  | 'COPILOT_UNAVAILABLE'; // Copilot SDK not available
```

#### User-Facing vs Logged Errors

| Type | User sees | Log contains |
|------|-----------|--------------|
| **Rate limit** | "GitHub rate limit reached. Retry in X minutes." | Full error + reset timestamp |
| **Auth failure** | "Please sign in with GitHub." | Error details |
| **Network error** | "Connection failed. Check your network." | Error stack |
| **API error** | "Something went wrong. Try again." | Full API response |

---

### Enforcement Guidelines

**All AI Agents MUST:**

1. Follow file naming conventions exactly as specified above
2. Use co-located test files with `.test.ts(x)` suffix
3. Place shared types in `src/shared/` directory
4. Use TanStack Query for all data fetching in webview
5. Use kebab-case for message type strings
6. Include proper TypeScript types for all function parameters and returns
7. Handle errors using the patterns above (no silent failures)

**Pattern Verification:**

- ESLint rules enforce naming conventions
- TypeScript strict mode catches type mismatches
- PR reviews verify structural consistency

---

### Pattern Examples

**Good Examples:**

```typescript
// ✅ Correct hook naming and structure
// hooks/usePullRequests.ts
export function usePullRequests() {
  return useQuery({
    queryKey: ['pull-requests'],
    queryFn: fetchPRsFromExtension,
    refetchInterval: 30000,
  });
}

// ✅ Correct message handling
vscode.postMessage({ type: 'refresh-request' });

// ✅ Correct error code
{ type: 'error', code: 'RATE_LIMITED', message: '...' }

// ✅ Correct component file
// components/dashboard/PRCard.tsx
export function PRCard({ pr }: { pr: PullRequest }) { ... }
```

**Anti-Patterns:**

```typescript
// ❌ Wrong: camelCase message type
{ type: 'refreshRequest' }  // Should be 'refresh-request'

// ❌ Wrong: lowercase error code
{ code: 'rate_limited' }    // Should be 'RATE_LIMITED'

// ❌ Wrong: tests in separate folder
tests/webview/PRCard.test.tsx  // Should be co-located

// ❌ Wrong: PascalCase utility file
src/github/ApiClient.ts  // Should be api-client.ts

// ❌ Wrong: custom loading boolean instead of TanStack Query
const [loading, setLoading] = useState(true);  // Use useQuery
```

---

## Project Structure & Boundaries

### Requirements to Structure Mapping

| Requirement Category | Location |
|---------------------|----------|
| **Authentication (FR1-4)** | `src/auth/` |
| **PR Data & Sync (FR5-8)** | `src/github/` |
| **Dashboard (FR9-13)** | `webview-ui/src/components/dashboard/` |
| **Review/Author Workflows (FR14-17)** | `webview-ui/src/components/dashboard/` + `src/github/` |
| **AI Features (FR25-29)** | `src/copilot/` + `webview-ui/src/components/shared/` |
| **Notifications (FR18-20)** | `src/notifications/` |
| **Team Insight (FR21-22)** | `webview-ui/src/components/dashboard/` + `src/github/` |

---

### Complete Project Directory Structure

```
codeflow/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions: lint, test, package
├── .vscode/
│   ├── launch.json                   # Extension debug configs
│   ├── tasks.json                    # Build tasks
│   ├── settings.json                 # Workspace settings
│   └── extensions.json               # Recommended extensions
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── .graphqlrc.yml                    # GraphQL extension config
├── codegen.yml                       # GraphQL Code Generator config
├── README.md
├── CHANGELOG.md
├── LICENSE
├── package.json                      # Extension manifest + workspace deps
├── tsconfig.json                     # Extension host config
├── esbuild.js                        # Extension bundler config
│
├── src/                              # Extension host (Node.js)
│   ├── extension.ts                  # Entry point, activation, command registration
│   │
│   ├── webview/
│   │   ├── dashboard-panel.ts        # WebviewPanel creation & management
│   │   ├── webview-provider.ts       # HTML/script injection, dev mode detection
│   │   └── message-handler.ts        # Route incoming webview messages
│   │
│   ├── github/
│   │   ├── api-client.ts             # GraphQL client wrapper (uses generated types)
│   │   ├── api-client.test.ts
│   │   ├── queries/                  # GraphQL query definitions
│   │   │   ├── pull-requests.graphql
│   │   │   ├── timeline.graphql
│   │   │   └── reviews.graphql
│   │   ├── generated/                # Auto-generated by graphql-codegen
│   │   │   └── graphql.ts            # TypeScript types for all queries
│   │   ├── pr-service.ts             # PR fetching, categorization logic
│   │   ├── pr-service.test.ts
│   │   └── types.ts                  # Domain types (extend generated)
│   │
│   ├── auth/
│   │   ├── auth-provider.ts          # VS Code Auth API wrapper
│   │   └── auth-provider.test.ts
│   │
│   ├── copilot/
│   │   ├── adapter.ts                # Copilot SDK adapter pattern
│   │   ├── adapter.test.ts
│   │   ├── fallback.ts               # Graceful degradation when unavailable
│   │   ├── review-generator.ts       # AI review summary generation
│   │   └── review-generator.test.ts
│   │
│   ├── notifications/
│   │   ├── notification-service.ts   # VS Code notification API wrapper
│   │   ├── seen-tracker.ts           # "Seen" state comparison logic
│   │   └── seen-tracker.test.ts
│   │
│   ├── storage/
│   │   ├── storage-service.ts        # globalState wrapper with typed keys
│   │   ├── storage-keys.ts           # STORAGE_KEYS constant
│   │   └── storage-service.test.ts
│   │
│   └── shared/
│       ├── messages.ts               # WebviewMessage, ExtensionMessage types
│       ├── types.ts                  # PullRequest, UserPreferences, etc.
│       └── constants.ts              # DEFAULT_POLL_INTERVAL, etc.
│
├── webview-ui/                       # React webview (Vite + React 18)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── components.json              # shadcn/ui config
│   ├── index.html
│   │
│   └── src/
│       ├── main.tsx                 # React entry point
│       ├── App.tsx                  # Root component, router, providers
│       ├── App.test.tsx
│       ├── globals.css              # Tailwind + VS Code theme variables
│       │
│       ├── components/
│       │   ├── dashboard/
│       │   │   ├── Dashboard.tsx         # Main dashboard view
│       │   │   ├── Dashboard.test.tsx
│       │   │   ├── SectionGrid.tsx       # 4-section grid layout
│       │   │   ├── SectionGrid.test.tsx
│       │   │   ├── PRCard.tsx            # Individual PR card
│       │   │   ├── PRCard.test.tsx
│       │   │   ├── PRCardSkeleton.tsx    # Loading skeleton
│       │   │   └── SectionHeader.tsx     # Section title + count
│       │   │
│       │   ├── pr-chat/
│       │   │   ├── PRChatPage.tsx        # PR detail/chat view
│       │   │   ├── PRChatPage.test.tsx
│       │   │   ├── UnifiedTimeline.tsx   # Messages + events timeline
│       │   │   ├── UnifiedTimeline.test.tsx
│       │   │   ├── TimelineEvent.tsx     # System event (commit, review)
│       │   │   ├── TimelineMessage.tsx   # User comment
│       │   │   ├── CommentInput.tsx      # New comment form
│       │   │   └── CommentInput.test.tsx
│       │   │
│       │   ├── shared/
│       │   │   ├── PRHeader.tsx          # PR title, status, links
│       │   │   ├── LoadingSpinner.tsx
│       │   │   ├── ErrorDisplay.tsx      # Error UI component
│       │   │   ├── LastUpdated.tsx       # Refresh indicator
│       │   │   └── AiInsightBadge.tsx    # AI review indicator
│       │   │
│       │   └── ui/                       # shadcn/ui (auto-generated)
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── badge.tsx
│       │       ├── avatar.tsx
│       │       ├── skeleton.tsx
│       │       ├── toast.tsx
│       │       ├── toaster.tsx
│       │       └── ...
│       │
│       ├── hooks/
│       │   ├── usePullRequests.ts       # TanStack Query hook for PRs
│       │   ├── usePullRequests.test.ts
│       │   ├── useExtensionMessage.ts   # Subscribe to extension messages
│       │   ├── useExtensionMessage.test.ts
│       │   ├── useSeenState.ts          # Track "seen" PRs
│       │   └── usePreferences.ts        # User preferences hook
│       │
│       ├── context/
│       │   ├── QueryProvider.tsx        # TanStack Query provider
│       │   ├── UIContext.tsx            # activeSection, selectedPrId
│       │   └── UIContext.test.tsx
│       │
│       └── lib/
│           ├── utils.ts                 # shadcn/ui cn() utility
│           ├── vscode-api.ts            # postMessage wrapper
│           └── date-utils.ts            # Relative time formatting
│
├── tests/
│   ├── integration/                     # @vscode/test-electron
│   │   ├── runTests.ts                  # Test runner setup
│   │   ├── activation.test.ts           # Extension activates correctly
│   │   ├── auth-flow.test.ts            # Auth API integration
│   │   ├── webview-creation.test.ts     # Webview spawns correctly
│   │   └── fixtures/
│   │       └── mock-prs.json
│   │
│   └── e2e/                             # Post-MVP placeholder
│       └── README.md
│
└── dist/                                # Build output (gitignored)
    ├── extension.js                     # Bundled extension host
    └── webview/                         # Built webview assets
        ├── index.html
        └── assets/
```

---

### Architectural Boundaries

**Extension ↔ Webview Boundary:**

```
┌─────────────────────────────────────┐     ┌─────────────────────────────────────┐
│          Extension Host             │     │           Webview UI                │
│                                     │     │                                     │
│  ┌─────────────────┐               │     │               ┌─────────────────┐  │
│  │  GitHub API     │◄──────────────┼─────┼───────────────┤  TanStack Query │  │
│  │  (api-client)   │               │     │               │  (data layer)   │  │
│  └─────────────────┘               │     │               └─────────────────┘  │
│           │                        │     │                       │            │
│  ┌────────▼────────┐               │     │               ┌───────▼────────┐   │
│  │  PR Service     │    postMessage│     │postMessage    │  React Hooks   │   │
│  │  (categorize)   │──────────────►│◄────┼───────────────┤  (usePRs...)   │   │
│  └─────────────────┘               │     │               └────────────────┘   │
│           │                        │     │                       │            │
│  ┌────────▼────────┐               │     │               ┌───────▼────────┐   │
│  │  Storage        │               │     │               │  UI Components │   │
│  │  (globalState)  │               │     │               │  (React)       │   │
│  └─────────────────┘               │     │               └────────────────┘   │
│                                     │     │                                     │
└─────────────────────────────────────┘     └─────────────────────────────────────┘
                    │                                           │
                    └───────────── Typed Messages ──────────────┘
                                 (src/shared/messages.ts)
```

**Data Flow:**

1. Extension authenticates via VS Code Auth API
2. Extension fetches PRs from GitHub GraphQL
3. PR Service categorizes into 4 sections
4. Data sent to webview via `postMessage`
5. TanStack Query caches and manages data state
6. React components render based on query state
7. User actions sent back via `postMessage`

---

### Integration Points

| Integration | Files | Communication |
|-------------|-------|---------------|
| **GitHub API** | `src/github/api-client.ts` | HTTPS/GraphQL |
| **VS Code Auth** | `src/auth/auth-provider.ts` | `vscode.authentication` |
| **Copilot SDK** | `src/copilot/adapter.ts` | SDK API (TBD) |
| **VS Code Storage** | `src/storage/storage-service.ts` | `context.globalState` |
| **Webview ↔ Extension** | `src/shared/messages.ts` | `postMessage` |

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together without conflicts. VS Code Auth API, TanStack Query, React 18, Tailwind/shadcn, Vite, esbuild, and GraphQL Code Generator form a cohesive, modern stack. The Copilot SDK adapter pattern properly isolates the technical preview from core functionality. Typed GraphQL ensures end-to-end type safety from query definition to response handling.

**Pattern Consistency:**
Implementation patterns fully support architectural decisions. Naming conventions are consistent across extension host (kebab-case files) and webview (PascalCase components). All patterns use the same error handling approach and loading state ownership model.

**Structure Alignment:**
Project structure supports all decisions. Clear separation between extension host (`src/`) and webview (`webview-ui/src/`). Shared types in `src/shared/` prevent drift. Component organization matches the two-view navigation model. GraphQL queries organized in dedicated `queries/` folder with auto-generated types.

---

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**

| Category | Requirements | Architectural Support |
|----------|--------------|----------------------|
| Authentication & Setup | FR1-4 | `src/auth/auth-provider.ts` |
| PR Data & Sync | FR5-8 | `src/github/api-client.ts`, typed GraphQL, TanStack Query |
| Dashboard & Categorization | FR9-13 | `webview-ui/src/components/dashboard/` |
| Review & Author Workflows | FR14-17 | Dashboard + pr-service categorization |
| AI Phase 1 | FR25-29 | `src/copilot/` with adapter pattern |
| Notifications | FR18-20 | `src/notifications/` + seen-tracker |
| Team Insight | FR21-22 | Dashboard sections + pr-service filtering |
| Documentation | FR23-24 | N/A (content, not architecture) |

**Non-Functional Requirements Coverage:**

| Requirement | Architectural Support |
|-------------|----------------------|
| Dashboard <2 seconds | TanStack Query caching, Vite builds, optimistic UI |
| 99.5% crash-free | Error boundaries, graceful degradation patterns |
| WCAG 2.1 AA | shadcn/ui accessible components, VS Code theme integration |
| Graceful fallback | Copilot adapter + fallback.ts pattern |

---

### Implementation Readiness Validation ✅

**Decision Completeness:**
All critical decisions are documented with rationale. Technology versions will be pinned at project initialization. Implementation patterns include concrete examples and anti-patterns. GraphQL queries provide compile-time type safety.

**Structure Completeness:**
Complete directory structure defined with ~65 files mapped to requirements. All integration points (GitHub API, VS Code Auth, Copilot SDK, Storage) have dedicated modules.

**Pattern Completeness:**
Comprehensive naming conventions cover files, code, and messages. Error handling includes boundary strategy, error codes, and user-facing vs logged distinction. Loading states have clear ownership rules.

---

### Gap Analysis Results

**Critical Gaps:** None

**Important Gaps (Acceptable Deferrals):**
1. *Polling interval UI* — Settings exposed via `UserPreferences` type; detailed UI deferred to implementation stories
2. *Client-side routing approach* — React Router vs state-based routing deferred to Dashboard story implementation

**Nice-to-Have (Future Enhancement):**
1. Specific Copilot SDK API signatures (blocked by SDK preview status)
2. E2E testing framework selection (post-MVP)

---

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Medium complexity, solo dev)
- [x] Technical constraints identified (Copilot SDK preview, GitHub rate limits)
- [x] Cross-cutting concerns mapped (theming, error handling, state sync)

**✅ Architectural Decisions**
- [x] Critical decisions documented (Auth, Storage, State Management, GraphQL Typing)
- [x] Technology stack fully specified (VS Code + React + TypeScript + GraphQL Codegen)
- [x] Integration patterns defined (postMessage contracts)
- [x] Performance considerations addressed (TanStack Query caching)

**✅ Implementation Patterns**
- [x] Naming conventions established (files, code, messages)
- [x] Structure patterns defined (co-located tests, feature folders)
- [x] Communication patterns specified (typed message contracts)
- [x] Process patterns documented (error handling, loading states)

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established (extension ↔ webview)
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

**✅ Development Environment**
- [x] Recommended VS Code extensions defined
- [x] GraphQL tooling configured (.graphqlrc.yml, codegen.yml)
- [x] Build pipeline documented

---

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Clean separation of concerns (extension host vs webview)
- Type-safe message contracts prevent integration bugs
- Typed GraphQL eliminates API response type drift
- TanStack Query eliminates custom state management complexity
- Copilot SDK adapter pattern isolates preview volatility
- Comprehensive patterns prevent AI agent implementation conflicts
- Portfolio-quality architecture with clear documentation

**Areas for Future Enhancement:**
- E2E testing framework selection (post-MVP)
- Performance monitoring and analytics
- Advanced caching strategies for larger teams

---

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions
- Check anti-patterns section before writing code
- Run `npm run codegen` after modifying `.graphql` files

**First Implementation Priority:**
```bash
# Step 1: Create extension scaffold
npx --package yo --package generator-code -- yo code

# Step 2: Add webview-ui
cd codeflow && mkdir webview-ui && cd webview-ui
npm create vite@latest . -- --template react-ts
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init

# Step 3: Add GraphQL tooling
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations
```

---
