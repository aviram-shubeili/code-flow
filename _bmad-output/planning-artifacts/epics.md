---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
workflowType: 'epics-and-stories'
project_name: 'code-flow'
user_name: 'Aviram'
date: '2026-02-06'
epicsCompleted: [1, 2, 3, 4]
---

# code-flow - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for CodeFlow, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Authentication & Setup**
- FR1: Users can connect a GitHub account via PAT to enable data access.
- FR2: Users can view required PAT scopes and validate access before connecting.
- FR3: Users can see whether Copilot CLI is available and authenticated.
- FR4: Users can proceed with core features when Copilot CLI is unavailable.

**PR Data & Synchronization**
- FR5: The system can fetch PR data from GitHub for repositories the user can access.
- FR6: The system can refresh PR data on an interval and on demand.
- FR7: Users can see last refresh time for PR data.
- FR8: The system can handle rate-limit responses and continue operating with cached data.

**Dashboard & Categorization**
- FR9: Users can view PRs grouped into four outcome-based categories.
- FR10: Users can see counts per category.
- FR11: Users can see PR status, author, reviewers, and comment counts on cards.
- FR12: Users can see PR history/state indicators on cards.
- FR13: Users can navigate from a PR card to the PR on GitHub.

**Review & Author Workflows**
- FR14: Reviewers can identify PRs requiring their attention.
- FR15: Authors can identify PRs returned to them for changes.
- FR16: Users can see when a PR they reviewed is awaiting author action.
- FR17: Users can trigger AI summaries for PRs when available.

**AI Phase 1 Features (Workflow Automation)**
- FR25: Users can see AI Pre-Flight Status badges on PR cards indicating Copilot review state.
- FR26: Users can see Copilot comment counts on PR cards before opening the PR.
- FR27: Users can trigger a One-Click AI Review from dashboard cards without opening the PR.
- FR28: Users can see Semantic Risk Labels ("Refactor", "Critical Logic", "Config Change") on PR cards when Copilot analysis is available.
- FR29: The system displays graceful fallback UI when Copilot SDK is unavailable.

**Notifications**
- FR18: Users can receive in-editor notifications for key PR outcomes.
- FR19: Notifications can link to the dashboard or GitHub PR.
- FR20: Users can see outcome-focused messaging (e.g., approved, changes requested).

**Team Insight (MVP-Light)**
- FR21: Team leads can view team PRs categorized by status.
- FR22: Team leads can identify bottleneck PRs by age/status.

**Documentation & Help**
- FR23: Users can access install and setup guidance.
- FR24: Users can access troubleshooting guidance and FAQs.

### NonFunctional Requirements

**Performance**
- NFR1: Dashboard loads in <2 seconds on typical developer machines.
- NFR2: PR data refresh completes within 60 seconds.

**Security**
- NFR3: PATs stored only in VS Code SecretStorage.
- NFR4: No credentials logged or persisted outside SecretStorage.

**Reliability**
- NFR5: ≥99.5% crash-free sessions.
- NFR6: Graceful fallback when Copilot SDK is unavailable.
- NFR7: SDK abstraction layer to accommodate API evolution during technical preview.

**Accessibility**
- NFR8: WCAG 2.1 AA for webview UI.

**Scalability**
- NFR9: Supports teams up to 50 developers and ~200 PRs/week without degraded UX.

### Additional Requirements

**From Architecture - Starter Template & Project Setup**
- ARCH1: Project scaffold using `yo code` generator with TypeScript + esbuild
- ARCH2: Webview-ui setup with React + Vite + Tailwind + shadcn/ui
- ARCH3: GraphQL Code Generator for fully typed GitHub API queries
- ARCH4: TanStack Query for webview state management with 30s configurable polling
- ARCH5: VS Code `globalState` for all persistent data storage
- ARCH6: Shared TypeScript message contract between extension host and webview
- ARCH7: Vitest for unit/component tests + VS Code test runner for integration
- ARCH8: Recommended VS Code extensions configuration (.vscode/extensions.json)

**From Architecture - Technical Implementation**
- ARCH9: VS Code Auth API (`vscode.authentication`) for GitHub authentication (not PAT + SecretStorage)
- ARCH10: Configurable polling interval (default 30s, range 15s-120s)
- ARCH11: Point-based GraphQL rate limit handling with pagination
- ARCH12: Two-view navigation model: Dashboard View ↔ PR Chat Page
- ARCH13: "Seen" state tracking in VS Code `globalState` for notification triggers
- ARCH14: Copilot SDK adapter pattern for graceful degradation
- ARCH15: Webview HMR development workflow with Vite dev server

**From Architecture - Naming & Structure Patterns**
- ARCH16: File naming: PascalCase for React components, camelCase for hooks, kebab-case for utilities
- ARCH17: Co-located test files with `.test.ts(x)` suffix
- ARCH18: Component organization by feature matching two-view model
- ARCH19: Message type strings use kebab-case (e.g., 'refresh-request', 'pr-data')
- ARCH20: Error codes use SCREAMING_SNAKE (e.g., 'RATE_LIMITED', 'AUTH_FAILED')

**From UX Design - Responsive & Accessibility**
- UX1: Sidebar mode (300-400px) as primary target with compact card layout
- UX2: Vertical icon tabs for section navigation in sidebar mode
- UX3: Horizontal tabs with full labels for panel mode (400-600px)
- UX4: Four-section grid layout for full panel mode (600px+)
- UX5: Typography-based urgency indicators (weight + size, not color-only)
- UX6: WCAG 2.1 AA compliance for all interactive elements
- UX7: Keyboard shortcuts: 1-4 for sections, j/k for navigation, Enter to open

**From UX Design - Component Requirements**
- UX8: PR Card component with compact/standard/expanded variants
- UX9: Age Badge component with size progression based on PR age
- UX10: AI Status Badge showing Copilot review state (Reviewed/Pending/Not Started)
- UX11: Section Header with count badges and active state
- UX12: Avatar Stack for reviewer visibility with status rings
- UX13: Risk Label component with semantic categorization badges
- UX14: Empty State component with contextual messaging per section

**From UX Design - Interaction Patterns**
- UX15: Hover-reveal pattern for actions that clutter default view
- UX16: Progressive disclosure: essential info visible, details on hover
- UX17: Toast notifications positioned bottom-right, max 3 stacked
- UX18: Outcome-focused notification messaging (not event-based)
- UX19: Deep link entry from notifications highlighting target PR

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 2 | Connect GitHub account via PAT |
| FR2 | Epic 2 | View required PAT scopes and validate |
| FR3 | Epic 2 | See Copilot CLI availability status |
| FR4 | Epic 2 | Proceed with core features when Copilot unavailable |
| FR5 | Epic 3 | Fetch PR data from GitHub |
| FR6 | Epic 3 | Refresh PR data on interval and on demand |
| FR7 | Epic 3 | See last refresh time |
| FR8 | Epic 3 | Handle rate-limits with cached data |
| FR9 | Epic 3 | View PRs in four outcome-based categories |
| FR10 | Epic 3 | See counts per category |
| FR11 | Epic 3 | See PR status, author, reviewers, comments on cards |
| FR12 | Epic 3 | See PR history/state indicators |
| FR13 | Epic 3 | Navigate from PR card to GitHub |
| FR14 | Epic 4 | Reviewers identify PRs requiring attention |
| FR15 | Epic 4 | Authors identify PRs returned for changes |
| FR16 | Epic 4 | See PRs awaiting author action |
| FR17 | Epic 5 | Trigger AI summaries when available |
| FR18 | Epic 6 | Receive in-editor notifications |
| FR19 | Epic 6 | Notifications link to dashboard or GitHub |
| FR20 | Epic 6 | Outcome-focused notification messaging |
| FR21 | Epic 7 | Team leads view team PRs by status |
| FR22 | Epic 7 | Identify bottleneck PRs by age/status |
| FR23 | Epic 8 | Access install and setup guidance |
| FR24 | Epic 8 | Access troubleshooting and FAQs |
| FR25 | Epic 5 | AI Pre-Flight Status badges on PR cards |
| FR26 | Epic 5 | Copilot comment counts before opening PR |
| FR27 | Epic 5 | One-Click AI Review from dashboard |
| FR28 | Epic 5 | Semantic Risk Labels on PR cards |
| FR29 | Epic 5 | Graceful fallback when Copilot unavailable |

## Epic List

### Epic 1: Project Foundation & Extension Scaffold
Development team has a fully configured VS Code extension project ready for feature development with proper tooling, testing infrastructure, and build pipeline.

**FRs covered:** None directly (foundational infrastructure)
**Additional Requirements:** ARCH1-8, ARCH15-20

---

### Epic 2: GitHub Authentication & Connection
Users can connect their GitHub account and see their connection status, with clear guidance when something's wrong.

**FRs covered:** FR1, FR2, FR3, FR4
**Additional Requirements:** ARCH9 (VS Code Auth API)

---

### Epic 3: PR Data Fetching & Dashboard Core
Users can view their PRs organized into four outcome-based categories with real-time data, visual urgency indicators, and manual refresh capability.

**FRs covered:** FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13
**Additional Requirements:** ARCH4, ARCH10, ARCH11, UX1-7, UX8-9, UX11, UX14-16

---

### Epic 4: Review & Author Workflows
Reviewers can identify PRs needing attention; Authors can see PRs returned for changes; Users can track PRs awaiting author response.

**FRs covered:** FR14, FR15, FR16
**Additional Requirements:** ARCH12, UX12

---

### Epic 5: AI-Powered PR Intelligence (Copilot SDK)
Users see AI Pre-Flight badges, comment counts, one-click AI reviews, semantic risk labels, and AI summaries — with graceful fallback when Copilot unavailable.

**FRs covered:** FR17, FR25, FR26, FR27, FR28, FR29
**Additional Requirements:** ARCH14, UX10, UX13

---

### Epic 6: In-Editor Notifications
Users receive outcome-focused notifications for key PR events with deep links to dashboard or GitHub.

**FRs covered:** FR18, FR19, FR20
**Additional Requirements:** ARCH13, UX17, UX18, UX19

---

### Epic 7: Team Insight Dashboard
Team leads can view team PRs and identify bottlenecks by age/status.

**FRs covered:** FR21, FR22

---

### Epic 8: Documentation & Help
Users can access install guides, setup guidance, troubleshooting, and FAQs.

**FRs covered:** FR23, FR24

---

## Epic 1: Project Foundation & Extension Scaffold

Development team has a fully configured VS Code extension project ready for feature development with proper tooling, testing infrastructure, and build pipeline.

### Story 1.1: Extension Scaffold with yo code

As a **developer**,
I want a properly scaffolded VS Code extension project,
So that I have a solid foundation to build CodeFlow features.

**Acceptance Criteria:**

**Given** no existing project structure
**When** the extension scaffold is created using `yo code`
**Then** the project has TypeScript configuration with strict mode enabled
**And** esbuild is configured as the bundler for fast builds
**And** the extension activates successfully in VS Code Extension Development Host
**And** `package.json` contains proper extension manifest with `activationEvents`
**And** the project follows kebab-case naming for utility files
**And** ESLint and Prettier are configured with consistent rules

---

### Story 1.2: Webview UI Foundation (React + Vite + Tailwind)

As a **developer**,
I want a React-based webview with modern tooling,
So that I can build the dashboard UI with fast iteration.

**Acceptance Criteria:**

**Given** the extension scaffold from Story 1.1
**When** the webview-ui directory is set up
**Then** React 18 with TypeScript is configured via Vite
**And** Tailwind CSS is configured with VS Code CSS variable integration
**And** shadcn/ui is initialized with Button, Card, Badge, Tabs, Toast components
**And** `globals.css` maps `--background` and `--foreground` to VS Code theme variables
**And** the webview renders a "Hello CodeFlow" placeholder when opened
**And** dark/light mode automatically inherits from VS Code theme
**And** PascalCase naming is used for React component files

---

### Story 1.3: Extension ↔ Webview Communication Contract

As a **developer**,
I want type-safe message passing between extension and webview,
So that I can reliably communicate data and actions.

**Acceptance Criteria:**

**Given** extension host and webview-ui are set up
**When** the message contract is implemented
**Then** `src/shared/messages.ts` defines `WebviewMessage` and `ExtensionMessage` types
**And** message type strings use kebab-case (e.g., `'refresh-request'`, `'pr-data'`)
**And** error codes use SCREAMING_SNAKE (e.g., `'RATE_LIMITED'`, `'AUTH_FAILED'`)
**And** `webview-ui/src/lib/vscode-api.ts` wraps `postMessage` with type safety
**And** extension host has a message handler routing incoming webview messages
**And** a round-trip test message successfully passes from webview → extension → webview

---

### Story 1.4: GraphQL Code Generator Setup

As a **developer**,
I want auto-generated TypeScript types for GitHub GraphQL queries,
So that I have compile-time type safety for API responses.

**Acceptance Criteria:**

**Given** the project structure from previous stories
**When** GraphQL Code Generator is configured
**Then** `codegen.yml` points to GitHub's GraphQL schema
**And** `.graphqlrc.yml` is configured for VS Code GraphQL extension support
**And** `src/github/queries/` directory exists for `.graphql` files
**And** `src/github/generated/graphql.ts` is auto-generated on `npm run codegen`
**And** `prebuild` script runs codegen automatically
**And** a sample `pull-requests.graphql` query generates proper TypeScript types
**And** `generated/` folder can be gitignored or committed (documented choice)

---

### Story 1.5: Testing Infrastructure

As a **developer**,
I want a testing setup for both webview and extension code,
So that I can write reliable tests with fast feedback.

**Acceptance Criteria:**

**Given** the project with webview-ui and extension host
**When** testing infrastructure is configured
**Then** Vitest is configured for webview component tests with Testing Library
**And** Vitest is configured for extension host unit tests with mocked `vscode` module
**And** `@vscode/test-electron` is set up for integration tests
**And** test files use co-located `.test.ts(x)` suffix pattern
**And** `npm run test:unit` runs all Vitest tests
**And** `npm run test:integration` runs VS Code integration tests
**And** a sample test passes for each test type (webview, extension unit, integration)

---

### Story 1.6: CI Pipeline (GitHub Actions)

As a **developer**,
I want automated CI on every push and PR,
So that code quality is validated before merge.

**Acceptance Criteria:**

**Given** testing infrastructure from Story 1.5
**When** GitHub Actions workflow is created
**Then** `.github/workflows/ci.yml` triggers on push and pull_request
**And** workflow runs `npm run lint` for ESLint checks
**And** workflow runs `npm run test:unit` for Vitest tests
**And** workflow runs `xvfb-run npm run test:integration` for VS Code tests on Linux
**And** workflow runs `npm run build` to verify production build
**And** workflow runs `vsce package` to verify extension packaging
**And** CI passes on a clean repository state

---

### Story 1.7: Development Workflow & Build Configuration

As a **developer**,
I want streamlined dev scripts and recommended tooling,
So that I can develop efficiently with fast feedback loops.

**Acceptance Criteria:**

**Given** all previous Epic 1 stories complete
**When** development workflow is configured
**Then** `npm run dev:webview` starts Vite dev server with HMR on localhost:5173
**And** F5 in VS Code launches Extension Development Host with webview loading from dev server
**And** `npm run build:webview` produces optimized production bundle
**And** `npm run build:extension` bundles extension host with esbuild
**And** `npm run build` runs both builds in sequence
**And** `.vscode/extensions.json` recommends: GraphQL, Tailwind IntelliSense, ESLint, Prettier
**And** `.vscode/launch.json` has debug configurations for extension and tests
**And** README documents the development workflow

---

## Epic 2: GitHub Authentication & Connection

Users can connect their GitHub account and see their connection status, with clear guidance when something's wrong.

### Story 2.1: VS Code GitHub Authentication Integration

As a **user**,
I want to connect my GitHub account using VS Code's built-in authentication,
So that I can access my PR data securely without managing tokens manually.

**Acceptance Criteria:**

**Given** the user opens CodeFlow for the first time
**When** they are not authenticated with GitHub
**Then** a "Sign in with GitHub" button is displayed in the webview
**And** clicking the button triggers `vscode.authentication.getSession('github', ['repo'], { createIfNone: true })`
**And** the VS Code GitHub authentication flow opens (browser or built-in)
**And** upon successful authentication, the session token is available to the extension
**And** the auth state is persisted across VS Code restarts via VS Code's session management
**And** `src/auth/auth-provider.ts` wraps the VS Code Auth API with typed interface

---

### Story 2.2: Authentication Status Display

As a **user**,
I want to see my GitHub connection status clearly,
So that I know if I'm connected and which account I'm using.

**Acceptance Criteria:**

**Given** the user has authenticated with GitHub
**When** they view the CodeFlow dashboard
**Then** their GitHub username and avatar are displayed in the header
**And** a "Connected" status indicator is visible
**And** a "Sign out" option is available (triggers `vscode.authentication.getSession` with `{ forceNewSession: true }`)

**Given** the user is not authenticated
**When** they view CodeFlow
**Then** a welcome screen with "Sign in with GitHub" is displayed
**And** the dashboard sections are not visible until authenticated

---

### Story 2.3: Authentication Scope Validation

As a **user**,
I want to know if my GitHub permissions are sufficient,
So that I can fix issues before they cause problems.

**Acceptance Criteria:**

**Given** the user authenticates with GitHub
**When** the authentication completes
**Then** the extension validates that the `repo` scope is present
**And** if scope is missing, an inline error shows "Additional permissions required"
**And** a "Re-authorize" button triggers a new auth session with correct scopes
**And** successful validation shows a brief "Connected successfully" toast

**Given** a GitHub API call fails with 401/403
**When** the error is detected
**Then** the user sees "Authentication issue - please sign in again"
**And** the sign-in flow is offered inline

---

### Story 2.4: Copilot SDK Detection & Graceful Fallback

As a **user**,
I want AI features to work when Copilot is available and gracefully disappear when it's not,
So that I always have a working dashboard.

**Acceptance Criteria:**

**Given** the extension initializes
**When** Copilot SDK is detected and working
**Then** AI features are enabled (badges, summaries, one-click review)

**Given** Copilot SDK is unavailable for any reason
**When** the dashboard loads
**Then** AI UI elements are hidden (not disabled or broken)
**And** a single dismissible banner shows: "🤖 AI features require GitHub Copilot. [Learn more] [Dismiss]"
**And** the "Learn more" link goes to Copilot setup documentation
**And** core dashboard works fully without AI

---

## Epic 3: PR Data Fetching & Dashboard Core

Users can view their PRs organized into four outcome-based categories with real-time data, visual urgency indicators, and manual refresh capability.

### Story 3.1: GitHub GraphQL PR Fetching Service

As a **developer**,
I want a typed service that fetches PR data from GitHub's GraphQL API,
So that I can retrieve comprehensive PR metadata efficiently.

**Acceptance Criteria:**

**Given** a user is authenticated with GitHub
**When** the PR fetching service is invoked
**Then** `src/github/services/pr-service.ts` queries GitHub GraphQL API for open PRs
**And** the query fetches PRs where user is author, reviewer, or assignee
**And** each PR includes: title, number, author, createdAt, updatedAt, state, reviewDecision
**And** each PR includes: reviews (author, state, submittedAt), comments (totalCount)
**And** each PR includes: labels, files (totalCount), additions, deletions, repository info
**And** pagination is handled using GitHub's cursor-based pagination (first 100, then cursor)
**And** the service returns typed `PullRequest[]` matching generated GraphQL types

**Given** the user has access to multiple repositories
**When** PRs are fetched
**Then** PRs from all accessible repositories are included in results
**And** repository name and owner are included on each PR for context

---

### Story 3.2: TanStack Query Integration & Polling

As a **developer**,
I want automatic data synchronization with configurable polling,
So that the dashboard stays current without manual intervention.

**Acceptance Criteria:**

**Given** the webview-ui uses TanStack Query
**When** the dashboard mounts
**Then** `useQuery` fetches PR data via extension host message passing
**And** data is cached client-side with a configurable stale time (default 30s)
**And** background refetching occurs at a configurable interval (default 30s, range 15s-120s)
**And** the polling interval is configurable via VS Code settings (`codeflow.pollInterval`)
**And** `webview-ui/src/hooks/usePullRequests.ts` encapsulates the query logic
**And** loading, error, and success states are properly exposed to components

**Given** the user switches away from VS Code
**When** the webview loses focus
**Then** polling pauses to conserve resources
**And** polling resumes when focus returns with an immediate refetch

---

### Story 3.3: Rate Limit Handling & Caching

As a **user**,
I want the extension to handle GitHub rate limits gracefully,
So that I can still use the dashboard even when API limits are reached.

**Acceptance Criteria:**

**Given** a GitHub API response includes rate limit headers
**When** the rate limit is approaching (< 100 points remaining)
**Then** the extension logs a warning and extends polling interval temporarily
**And** a subtle "Rate limit low" indicator appears in the dashboard header

**Given** the rate limit is exhausted (0 points remaining)
**When** a fetch is attempted
**Then** the fetch is skipped and cached data is displayed
**And** a clear banner shows "Using cached data - rate limit reached. Resets in X minutes"
**And** the extension schedules retry after the rate limit reset time
**And** users can still interact with cached PR cards and navigate to GitHub

**Given** any GitHub API error occurs (network, 5xx, timeout)
**When** the error is detected
**Then** cached data is displayed with "Last updated X ago" indicator
**And** a retry button is available for manual refresh
**And** errors are logged for debugging but not shown as alarming dialogs

---

### Story 3.4: Four-Section Dashboard Layout

As a **user**,
I want my PRs organized into four clear categories,
So that I instantly know what needs my attention.

**Acceptance Criteria:**

**Given** PR data is loaded
**When** the dashboard renders
**Then** PRs are categorized into exactly four sections:
  - **Needs Review**: PRs where user is requested reviewer and hasn't submitted review
  - **Returned to You**: PRs authored by user with changes requested or new comments since last push
  - **My PRs**: All PRs authored by user (excluding those in "Returned to You")
  - **Reviewed - Awaiting**: PRs user has reviewed but are awaiting author action
**And** each section displays a count badge showing number of PRs in that category
**And** sections with 0 PRs show the count as "(0)" in muted style

**Given** the dashboard is in sidebar mode (300-400px width)
**When** the layout renders
**Then** section navigation uses vertical icon tabs with tooltips
**And** only one section is visible at a time (tab-based navigation)
**And** PR cards use compact variant

**Given** the dashboard is in panel mode (400-600px width)
**When** the layout renders
**Then** section navigation uses horizontal tabs with abbreviated labels
**And** PR cards use standard variant

**Given** the dashboard is in full panel mode (600px+ width)
**When** the layout renders
**Then** a four-section grid layout displays all sections simultaneously
**And** each section is scrollable independently

---

### Story 3.5: PR Card Component

As a **user**,
I want to see essential PR information at a glance on each card,
So that I can make quick triage decisions.

**Acceptance Criteria:**

**Given** a PR is displayed in the dashboard
**When** the PR card renders in default state
**Then** the card displays: PR title, author name and avatar, repository name
**And** the card displays: age badge (time since created), review decision status icon
**And** the card displays: comment count, file count, CI status indicator (if available)
**And** the title typography weight reflects urgency (regular <24h, medium 24-48h, bold 48h+)

**Given** the user hovers over a PR card
**When** the hover state activates
**Then** additional metadata is revealed: additions/deletions, reviewer avatars, labels
**And** action buttons appear: "Open in GitHub" (primary), "Copy Link" (secondary)
**And** the hover reveal uses a 200ms CSS transition for smooth appearance

**Given** a PR has review status
**When** the card renders
**Then** approved PRs show a green checkmark icon with "Approved" label
**And** changes-requested PRs show an amber dot with "Changes requested" label
**And** pending PRs show a gray circle with "Pending review" label

**Given** the user views the PR card
**When** inspecting PR history/state
**Then** the card shows when last activity occurred (e.g., "Updated 2h ago")
**And** if the PR was previously approved then had new commits, show "Re-review needed" indicator

---

### Story 3.6: Age Badge & Visual Urgency System

As a **user**,
I want visual indicators that show PR urgency through size and weight,
So that I can quickly identify which PRs need attention most.

**Acceptance Criteria:**

**Given** a PR is displayed with an age badge
**When** the PR is less than 12 hours old
**Then** the age badge is 12px, gray background, regular weight text
**And** displays time as "Xh" or "< 1h"

**Given** a PR is 12-24 hours old
**When** the age badge renders
**Then** the badge is 12px, light gray background, regular weight
**And** displays time as "Xh"

**Given** a PR is 24-48 hours old
**When** the age badge renders
**Then** the badge is 14px, subtle amber background, medium weight
**And** displays time as "Xh" or "1d Xh"
**And** the PR title uses medium font weight (500)

**Given** a PR is older than 48 hours
**When** the age badge renders
**Then** the badge is 16px, warm amber background, semi-bold weight
**And** displays time as "Xd" or "Xd Xh"
**And** the PR title uses semi-bold font weight (600)

**Given** visual urgency is rendered
**When** accessibility is evaluated
**Then** urgency is communicated through size and weight, never color alone
**And** age badges have proper ARIA labels (e.g., "48 hours since opened")

---

### Story 3.7: Manual Refresh & Last Updated Status

As a **user**,
I want to see when data was last updated and manually refresh on demand,
So that I can trust the data freshness and get updates immediately when needed.

**Acceptance Criteria:**

**Given** the dashboard has loaded PR data
**When** the user views the dashboard header
**Then** a "Last updated X ago" timestamp is displayed (e.g., "Last updated 30 seconds ago")
**And** the timestamp updates every 30 seconds to stay accurate
**And** hovering the timestamp shows the exact time (e.g., "Feb 6, 2026 at 2:30 PM")

**Given** the user wants to refresh data manually
**When** they click the refresh button (or press `r`)
**Then** an immediate fetch is triggered regardless of polling interval
**And** the refresh button shows a spinner during the fetch
**And** the "Last updated" timestamp resets upon successful fetch
**And** a subtle toast confirms "Dashboard refreshed"

**Given** data is stale (>5 minutes since last successful fetch)
**When** the dashboard renders
**Then** the "Last updated" text uses warning styling (amber color)
**And** a subtle banner suggests "Data may be stale — refresh recommended"

---

### Story 3.8: GitHub Deep Link Navigation

As a **user**,
I want to navigate directly from PR cards to GitHub,
So that I can take action on PRs without searching for them.

**Acceptance Criteria:**

**Given** a PR card is displayed
**When** the user clicks the card (or presses Enter when focused)
**Then** the PR opens in the default browser at the GitHub PR URL
**And** the dashboard remains open in VS Code (no context loss)
**And** the URL format is `https://github.com/{owner}/{repo}/pull/{number}`

**Given** the user wants to copy a PR link
**When** they click "Copy Link" (or press `c` when card is focused)
**Then** the PR URL is copied to the system clipboard
**And** a toast confirms "Link copied to clipboard"

**Given** the user right-clicks a PR card
**When** the context menu appears
**Then** options include: "Open in GitHub", "Copy Link", "Open in GitHub PR Extension" (if installed)
**And** keyboard shortcuts are shown next to each option

---

### Story 3.9: Empty States & Contextual Messaging

As a **user**,
I want friendly messaging when sections have no PRs,
So that I understand the state without confusion.

**Acceptance Criteria:**

**Given** the "Needs Review" section has no PRs
**When** the section renders
**Then** it displays: "All caught up! No PRs need your review." with a celebratory icon (✅)
**And** the message tone is encouraging

**Given** the "Returned to You" section has no PRs
**When** the section renders
**Then** it displays: "Nothing returned. You're in the clear." with a reassuring icon (👍)
**And** the message tone is relaxed

**Given** the "My PRs" section has no PRs
**When** the section renders
**Then** it displays: "No open PRs. Ready to ship something?" with an encouraging icon (🚀)
**And** optionally includes a link to create a PR on GitHub

**Given** the "Reviewed - Awaiting" section has no PRs
**When** the section renders
**Then** it displays: "No PRs awaiting author response." with a neutral icon (📋)
**And** the message tone is informational

**Given** no PRs exist across all sections (new user or no activity)
**When** the dashboard renders
**Then** a full-page welcome state shows: "Welcome to CodeFlow! Your PRs will appear here once you're connected to repositories with open pull requests."
**And** helpful links to documentation are included

---

### Story 3.10: Keyboard Navigation & Accessibility

As a **user**,
I want full keyboard navigation throughout the dashboard,
So that I can work efficiently without a mouse.

**Acceptance Criteria:**

**Given** the user is on the dashboard
**When** they press number keys `1`, `2`, `3`, or `4`
**Then** the corresponding section is activated (Needs Review, Returned to You, My PRs, Reviewed-Awaiting)
**And** focus moves to the first PR card in that section

**Given** the user has focus within a section
**When** they press `j` or `down arrow`
**Then** focus moves to the next PR card
**And** the focused card has a visible focus ring (2px primary color outline)

**Given** the user has focus within a section
**When** they press `k` or `up arrow`
**Then** focus moves to the previous PR card

**Given** a PR card has focus
**When** the user presses `Enter`
**Then** the PR opens in GitHub (same as click behavior)

**Given** a PR card has focus
**When** the user presses `r`
**Then** manual refresh is triggered

**Given** the user presses `?`
**When** the help overlay renders
**Then** all keyboard shortcuts are displayed in a modal
**And** pressing `Escape` or `?` again closes the overlay

**Given** all interactive elements
**When** accessibility is evaluated
**Then** all elements have proper ARIA roles and labels
**And** focus order follows logical visual order
**And** the dashboard meets WCAG 2.1 AA requirements
**And** screen readers announce PR details meaningfully ("Pull request: Add auth refactor by Maya, 24 hours old, approved")

---

## Epic 4: Review & Author Workflows

Reviewers can identify PRs needing attention; Authors can see PRs returned for changes; Users can track PRs awaiting author response.

### Story 4.1: Needs Review Section Logic

As a **reviewer**,
I want to see PRs that specifically need my review action,
So that I can prioritize my review workload effectively.

**Acceptance Criteria:**

**Given** a PR exists where the user is a requested reviewer
**When** the user has NOT submitted any review (approved, changes requested, or commented)
**Then** the PR appears in the "Needs Review" section
**And** the PR is sorted by age (oldest first) within the section

**Given** a PR exists where the user is a requested reviewer
**When** the user HAS submitted a review (any type)
**And** new commits have been pushed since their review
**Then** the PR appears in the "Needs Review" section with a "Re-review needed" indicator
**And** the indicator shows: "New commits since your review"

**Given** a PR exists where the user is a requested reviewer
**When** the user submitted an approved review and no new commits exist
**Then** the PR does NOT appear in "Needs Review" section
**And** the PR appears in "Reviewed - Awaiting" section instead

**Given** a PR exists where the user was removed as a reviewer
**When** the dashboard refreshes
**Then** the PR is removed from "Needs Review" section
**And** no notification is shown for the removal

**Given** the user views the "Needs Review" section
**When** multiple PRs are present
**Then** PRs are sorted by: urgency (age) descending, then by review request time
**And** PRs older than 48h appear at the top with bold typography

---

### Story 4.2: Returned to You Section Logic

As a **PR author**,
I want to see when my PRs need my attention,
So that I can respond to feedback quickly and keep the review cycle moving.

**Acceptance Criteria:**

**Given** the user authored a PR
**When** a reviewer submits a "changes requested" review
**Then** the PR moves to the "Returned to You" section
**And** the card shows: "Changes requested" status with amber indicator
**And** the reviewer's name is shown: "Changes requested by [reviewer]"

**Given** the user authored a PR
**When** new comments are added after the user's last push
**Then** the PR moves to the "Returned to You" section
**And** the card shows: "[N] new comments" badge
**And** the badge highlights the unresponded comment count

**Given** the user authored a PR in "Returned to You"
**When** the user pushes new commits to the PR branch
**Then** the PR moves to "My PRs" section (awaiting re-review)
**And** the "Returned to You" section badge count decreases

**Given** the user authored a PR in "Returned to You"
**When** the user replies to all pending comments on GitHub
**Then** the PR remains in "Returned to You" until new commits are pushed
**And** the comment badge updates to show "0 unaddressed"

**Given** the user views "Returned to You" section
**When** multiple PRs are present
**Then** PRs are sorted by: most recent feedback first
**And** PRs with "changes requested" appear above those with only new comments

---

### Story 4.3: Reviewed - Awaiting Section Logic

As a **reviewer**,
I want to track PRs I've reviewed that are waiting for author action,
So that I know what's in my "review pipeline" without losing track.

**Acceptance Criteria:**

**Given** the user submitted a review on a PR
**When** the review was "approved" or "changes requested" or "commented"
**And** the PR is still open and awaiting author response
**Then** the PR appears in "Reviewed - Awaiting" section

**Given** the user reviewed a PR that's in "Reviewed - Awaiting"
**When** the author pushes new commits after the user's review
**Then** the PR moves to "Needs Review" section with "Re-review needed" indicator
**And** the PR is removed from "Reviewed - Awaiting"

**Given** the user reviewed a PR that's in "Reviewed - Awaiting"
**When** the PR is merged on GitHub
**Then** the PR is removed from "Reviewed - Awaiting" section
**And** a brief toast notification appears: "[PR title] was merged"

**Given** the user reviewed a PR that's in "Reviewed - Awaiting"
**When** the PR is closed (without merging) on GitHub
**Then** the PR is removed from "Reviewed - Awaiting" section
**And** no notification is shown (to avoid noise)

**Given** the user views "Reviewed - Awaiting" section
**When** multiple PRs are present
**Then** PRs are sorted by: user's review date (most recent first)
**And** the card shows: "You [approved/requested changes] [time ago]"

---

### Story 4.4: Avatar Stack Component

As a **user**,
I want to see who is involved in reviewing a PR at a glance,
So that I can understand the review status without opening the PR.

**Acceptance Criteria:**

**Given** a PR card is displayed
**When** reviewers are assigned or have submitted reviews
**Then** an avatar stack displays up to 3 reviewer avatars
**And** avatars overlap by 8px, rightmost avatar is on top
**And** each avatar is 24px diameter in standard view, 20px in compact view

**Given** a PR has more than 3 reviewers
**When** the avatar stack renders
**Then** the first 3 avatars are shown
**And** a "+N" indicator appears for remaining reviewers (e.g., "+2")
**And** hovering the "+N" shows a tooltip with all reviewer names

**Given** a reviewer has submitted an approval
**When** their avatar renders in the stack
**Then** a green ring (2px) surrounds their avatar
**And** hovering shows tooltip: "[name] approved"

**Given** a reviewer has requested changes
**When** their avatar renders in the stack
**Then** an amber ring (2px) surrounds their avatar
**And** hovering shows tooltip: "[name] requested changes"

**Given** a reviewer is assigned but hasn't reviewed yet
**When** their avatar renders in the stack
**Then** no ring surrounds their avatar (neutral state)
**And** hovering shows tooltip: "[name] - review pending"

**Given** a reviewer has submitted a comment-only review
**When** their avatar renders in the stack
**Then** a gray ring (2px) surrounds their avatar
**And** hovering shows tooltip: "[name] commented"

**Given** hovering over the avatar stack
**When** the hover state activates
**Then** a tooltip panel shows all reviewers with status:
  - "✓ [name] approved"
  - "⚠ [name] requested changes"
  - "💬 [name] commented"
  - "... [name] pending"

---

### Story 4.5: Review State Tracking & Persistence

As a **developer**,
I want reliable tracking of review states for accurate categorization,
So that PRs always appear in the correct section.

**Acceptance Criteria:**

**Given** the extension fetches PR data from GitHub GraphQL API
**When** processing review states
**Then** the following data is captured for each PR:
  - All reviews with: author, state (APPROVED, CHANGES_REQUESTED, COMMENTED, DISMISSED, PENDING), submittedAt
  - Review requests: requested reviewers (users and teams)
  - Latest commit SHA and its timestamp
  - Current user's review history on this PR

**Given** a PR's review state changes on GitHub
**When** the next poll completes (within 30 seconds)
**Then** the PR's section categorization is re-evaluated
**And** the PR card updates to reflect new state
**And** UI updates smoothly without jarring reflows

**Given** multiple reviews exist from the same reviewer
**When** determining their review status
**Then** only the most recent review is considered for status rings
**And** historical reviews are ignored for categorization

**Given** a team is requested as reviewer (not individual)
**When** the current user is a member of that team
**Then** the PR appears in "Needs Review" for the user
**And** the user can infer they are requested via team membership

**Given** a review is dismissed on GitHub
**When** the dashboard refreshes
**Then** the dismissed review is not counted for categorization
**And** the PR may move back to "Needs Review" if user was requested

---

### Story 4.6: PR State Change Animations

As a **user**,
I want smooth visual feedback when PRs move between sections,
So that I understand what changed without confusion.

**Acceptance Criteria:**

**Given** a PR needs to move from one section to another
**When** the state change is detected (e.g., after pushing commits, receiving review)
**Then** the PR card animates out of the current section (fade + slide left, 200ms)
**And** the PR card animates into the new section (fade + slide in from right, 200ms)
**And** section count badges update simultaneously

**Given** a new PR appears in a section (new review request)
**When** the dashboard updates
**Then** the new PR card animates in (fade + slide down from top, 200ms)
**And** the section badge pulses briefly to draw attention

**Given** a PR is merged or closed (removed from dashboard)
**When** the dashboard updates
**Then** the PR card animates out (fade + shrink, 200ms)
**And** remaining cards reflow smoothly (no jarring jump)

**Given** the user has enabled reduced motion preferences
**When** state changes occur
**Then** animations are replaced with instant transitions
**And** only color/opacity changes are used (respecting `prefers-reduced-motion`)

**Given** multiple PRs change state simultaneously
**When** the dashboard updates
**Then** animations are staggered (50ms delay between each)
**And** the UI remains responsive during animations

---

### Story 4.7: Workflow-Specific Quick Actions

As a **user**,
I want contextual quick actions based on which section a PR is in,
So that I can take the most relevant action efficiently.

**Acceptance Criteria:**

**Given** a PR card is in the "Needs Review" section
**When** the user hovers or focuses the card
**Then** quick actions appear:
  - "Start Review" (primary) - opens GitHub PR review interface
  - "Open in GitHub" (secondary) - opens PR overview
  - "Copy Link" (ghost)

**Given** a PR card is in the "Returned to You" section
**When** the user hovers or focuses the card
**Then** quick actions appear:
  - "View Feedback" (primary) - opens GitHub PR at comments
  - "Push Update" (secondary, if local branch detected) - hint text only, not functional
  - "Open in GitHub" (secondary)

**Given** a PR card is in the "My PRs" section
**When** the user hovers or focuses the card
**Then** quick actions appear:
  - "Check Status" (primary) - opens GitHub PR
  - "Request Re-review" (secondary) - hint to re-request on GitHub
  - "Copy Link" (ghost)

**Given** a PR card is in the "Reviewed - Awaiting" section
**When** the user hovers or focuses the card
**Then** quick actions appear:
  - "View PR" (primary) - opens GitHub PR
  - "Copy Link" (ghost)
**And** the actions are more subdued (user is waiting, not acting)

**Given** keyboard navigation is active (card is focused)
**When** the user presses shortcut keys
**Then** `s` triggers the primary action (Start Review / View Feedback / etc.)
**And** `o` opens in GitHub
**And** `c` copies link

---

### Story 4.8: Review Request Time Tracking

As a **reviewer**,
I want to see how long ago I was requested to review,
So that I can prioritize appropriately.

**Acceptance Criteria:**

**Given** a PR is in "Needs Review" section
**When** the card renders
**Then** it shows "Requested [time ago]" (e.g., "Requested 2 hours ago")
**And** this is distinct from the PR's age (creation time)

**Given** a PR was re-requested for review (re-review after new commits)
**When** the card renders
**Then** it shows "Re-review requested [time ago]"
**And** the time reflects when new commits triggered re-review

**Given** the user views PR cards in "Needs Review"
**When** sorting by default
**Then** PRs are sorted by request time (oldest requests first)
**And** the visual urgency system (typography weight) is based on request duration

**Given** a review request is older than 24 hours
**When** the card renders
**Then** "Requested 1d+ ago" appears with medium typography weight

**Given** a review request is older than 48 hours
**When** the card renders
**Then** "Requested 2d+ ago" appears with bold typography weight
**And** the card stands out as needing immediate attention

---

### Story 4.9: Author Response Time Indicators

As a **reviewer**,
I want to see how long a PR has been waiting for author response,
So that I can follow up appropriately if needed.

**Acceptance Criteria:**

**Given** a PR is in "Reviewed - Awaiting" section
**When** the card renders
**Then** it shows "Awaiting author for [time]" (e.g., "Awaiting author for 6 hours")
**And** the time is calculated from user's last review submission

**Given** the author has been inactive for more than 24 hours
**When** the card renders
**Then** the "Awaiting" text uses medium typography weight
**And** a subtle indicator suggests the author may need a nudge

**Given** the author has been inactive for more than 48 hours
**When** the card renders
**Then** the "Awaiting" text uses bold typography weight
**And** a hint appears: "Consider following up with the author"

**Given** the author pushes a commit or responds to comments
**When** the next refresh occurs
**Then** the PR moves to appropriate section ("Needs Review" if re-review needed)
**And** the "awaiting" timer resets

---

### Story 4.10: Workflow Section Filtering

As a **user**,
I want to filter PRs within each section by repository or label,
So that I can focus on specific projects when needed.

**Acceptance Criteria:**

**Given** the dashboard displays PRs from multiple repositories
**When** the user clicks the filter icon in a section header
**Then** a dropdown shows available filters:
  - Repository: list of repos with PR counts
  - Labels: list of labels present on PRs
  - Author (for Needs Review): filter by PR author

**Given** the user selects a repository filter
**When** the filter is applied
**Then** only PRs from that repository are shown in the section
**And** a filter badge appears in the section header showing active filter
**And** the section count updates to reflect filtered count

**Given** the user selects multiple filters
**When** filters are combined
**Then** AND logic is applied (must match all filters)
**And** filter badges show all active filters
**And** a "Clear filters" option is available

**Given** filters are applied to a section
**When** the user navigates away and returns
**Then** filters persist within the session
**And** filters reset when VS Code is restarted (not persisted to storage)

**Given** no PRs match the applied filters
**When** the section renders
**Then** an empty state shows: "No PRs match your filters"
**And** a "Clear filters" button is prominent



