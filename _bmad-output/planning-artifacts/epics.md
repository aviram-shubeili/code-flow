---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
workflowType: 'epics-and-stories'
project_name: 'code-flow'
user_name: 'Aviram'
date: '2026-01-31'
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

