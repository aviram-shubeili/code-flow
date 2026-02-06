---
stepsCompleted: [step-01-init, step-02-discovery, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish]
inputDocuments:
  - docs/brief.md
  - docs/project-context.md
  - docs/front-end-spec.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/analysis/brainstorming-session-copilot-sdk-features.md
  - _bmad-output/analysis/architecture-decision-record-2026-01-28.md
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 1
  projectDocs: 0
classification:
  projectType: developer_tool
  domain: dev productivity
  complexity: medium
  projectContext: greenfield
workflowType: 'prd'
date: 2026-01-28
author: Aviram
---

# Product Requirements Document - CodeFlow

**Author:** Aviram
**Date:** January 28, 2026

## Executive Summary

CodeFlow is a VS Code extension that delivers outcome‑based pull request management inside the editor. It reduces notification noise and review delays by grouping PRs by action required and surfacing AI‑powered intelligence when Copilot is available. The core value is faster review cycles with less context switching for GitHub‑based teams (5–15 developers, with enterprise teams as a secondary segment).

The MVP implements **Phase 1 (Hands/Workflow Automation)** of a 3‑phase AI strategy: AI Pre‑Flight Status badges showing Copilot review state, One‑Click AI Review triggers from dashboard cards, and Semantic Risk Labels replacing generic size indicators. This provides immediate value with low dependency on user data while the foundation is built for advanced intelligence features. Graceful fallback ensures core functionality when Copilot is unavailable.

## Success Criteria

### User Success

- Daily dashboard usage by ≥80% of active users.
- PR triage time reduced by ≥50%.
- ≥60% of in-editor notifications lead to action within 2 hours.

### Business Success

- 500 installs within 6 months.
- 25% faster merge cycles for teams using CodeFlow.
- 70% activation: connect GitHub + view dashboard in first session.

### Technical Success

- Dashboard load time <2 seconds.
- 99.5% crash-free sessions.
- AI summary success rate ≥85% when Copilot SDK is available.
- One-Click AI Review trigger success rate ≥95%.
- AI Pre-Flight Status refresh latency <5 seconds after Copilot review completes.

### Measurable Outcomes

- Median “ready for review → merge” time reduced by 25%.
- Daily triage completed in under 3 minutes for 70% of active users.
- ≥40% of PR actions initiated from the extension UI.

## Product Scope

### MVP Strategy & Philosophy

**MVP Approach:** Problem‑solving MVP to validate outcome‑based PR triage inside VS Code.
**Resource Requirements:** Single developer for an initial 2–3 week MVP build.

### MVP Feature Set (Phase 1 — Workflow Automation)

**Core User Journeys Supported:** Reviewer, Author, Tech Lead, Setup Owner.

**Must‑Have Capabilities:**

- PAT auth + SecretStorage
- 4‑section dashboard with outcome‑based categorization
- Basic PR cards + PR history/state visibility
- 60s polling + manual refresh
- VS Code notifications for key outcomes
- Setup checks (PAT scopes + Copilot SDK)
- Clear "last updated" indicator + GitHub deep links

**AI Phase 1 Features (Hands — Workflow Automation):**

- **AI Pre‑Flight Status:** Dashboard badges indicating Copilot review state with comment counts visible on PR cards before opening
- **One‑Click AI Review:** Trigger Copilot reviews directly from dashboard cards—eliminating the "empty page" problem
- **Semantic Risk Labels:** AI‑derived descriptors ("Refactor", "Critical Logic", "Config Change") replacing generic size labels
- **AI Summaries:** TL;DR for each PR to accelerate triage decisions
- **Graceful Fallback:** Core functionality preserved when Copilot SDK is unavailable

### Post‑MVP Features

**Phase 2 — User Profiling (Memory):**

- **Living Interest Graph:** Semantic user profile tracking expertise and interests (e.g., "Auth", "Payment Service")
- **Continuous Interest Learning:** Hybrid explicit (onboarding) + implicit (merged PR analysis) learning
- **Transparent Expertise Model:** Users can view and edit their "AI‑perceived skills"
- Interactive notification actions
- Advanced filtering/sorting
- PR comments panel (read/reply)

**Phase 3 — Dashboard Intelligence (Brains):**

- **AI Focus Category / Triage Assistant:** Dynamic, high‑signal section of "Must Do" items based on relevance, complexity, and urgency
- **Persona‑Based AI Review:** Tailored reviews using user's Interest Graph ("Review for security flaws because user is a security expert")
- **Custom AI Review Instructions:** Allow users to provide specific instructions for Copilot reviews (e.g., "make sure coding standards are kept", "focus on security vulnerabilities", "check for performance issues")
- **Background AI Review Processing:** Trigger Copilot reviews that run asynchronously (local or cloud‑based), allowing users to continue working while review happens in the background
- **Review Completion Notifications:** Notify users when background AI reviews complete with summary of findings and comments added
- **Smart Diff Hiding:** AI‑powered collapse of boilerplate, generated code, and simple refactors
- Team‑level bottleneck view with AI insights

**Phase 3+ — Team Health (Heart):**

- **Team Alignment Healer:** AI surfaces PRs from disconnected teammates to maintain team alignment
- **Pre‑Submission Coach:** Private "whisper" mode catching obvious issues before PR is visible to reviewers

**Platform Expansion:**

- External notifications (Slack/Teams via workflows)
- Cross‑platform support (GitLab/Bitbucket)
- Analytics & optimization recommendations

### Risk Mitigation Strategy

**Technical Risks:** Copilot SDK volatility (technical preview) and GitHub rate limits → graceful fallback mode, SDK abstraction layer, caching, backoff, and clear "last updated."
**Market Risks:** Validate outcome‑based triage via pilot teams and action‑rate metrics.
**Resource Risks:** Keep MVP lean; 3‑phase strategy defers complex User Profiling (Phase 2) and Dashboard Intelligence (Phase 3) until Phase 1 automation is validated.

## User Journeys

### Journey 1 — Reviewer (Primary: “Maya, Senior Engineer”)

**Opening:** Maya starts her day in VS Code and is already juggling multiple repos. Notifications feel noisy and she’s unsure which PRs truly need her attention.
**Rising Action:** She opens CodeFlow and sees PRs categorized by outcome. A "Needs Review" card rises to the top with Semantic Risk Labels ("Critical Logic") and AI Pre‑Flight badges showing Copilot has already reviewed.
**Climax:** She clicks "One‑Click AI Review" on a PR without existing review, scans the AI summary and comment count badge, and decides whether to deep‑review.
**Resolution:** She completes the review quickly and feels confident nothing urgent is missed.

**What could go wrong:** Copilot SDK isn't available; data is stale.
**Recovery:** Fallback to basic PR metadata + clear “last updated” + GitHub deep link.

### Journey 2 — Author (Primary: “Eli, Feature Developer”)

**Opening:** Eli ships a PR and waits for reviewers. The silence is painful and re‑review cycles stall.
**Rising Action:** CodeFlow notifies Eli when review comments land and shows “Returned to You” with context.
**Climax:** Eli responds quickly, updates the PR, and sees it move to “Reviewed‑Awaiting.”
**Resolution:** The PR merges after a smooth, visible, polite notification loop.

**What could go wrong:** Reviewers miss the update; Eli re‑pings manually.
**Recovery:** Outcome‑focused notifications + reminder cadence.

### Journey 3 — Tech Lead (Secondary: “Rafi, Team Lead”)

**Opening:** Rafi wants to spot bottlenecks but has no clear view of team PR state.
**Rising Action:** He opens the team dashboard and sees PRs categorized by status and age.
**Climax:** He identifies the stuck PRs and re‑assigns reviewers or nudges the team.
**Resolution:** Bottlenecks clear without micromanagement, and merge velocity improves.

**What could go wrong:** Permissions block team‑wide visibility.
**Recovery:** Show partial view + clear permissions warning.

### Journey 4 — Setup Owner (Onboarding: “Dana, Repo Admin”)

**Opening:** Dana needs to enable CodeFlow safely for the team.
**Rising Action:** She follows a short setup path (PAT scopes + Copilot CLI check).
**Climax:** The extension connects, and she sees the first dashboard load.
**Resolution:** Team members can authenticate and see their PRs immediately.

**What could go wrong:** PAT scope confusion or missing Copilot CLI.
**Recovery:** Inline guidance + fallback when Copilot is unavailable.

### Journey Requirements Summary

- Outcome‑based PR categorization and clear “Needs Review / Returned / My PRs / Reviewed‑Awaiting.”
- **AI Pre-Flight Status badges** showing Copilot review state and comment counts.
- **One-Click AI Review** triggers from dashboard cards.
- **Semantic Risk Labels** replacing generic size indicators.
- AI summaries with graceful fallback.
- PR history/state visibility per card.
- Fast re-review loop notifications.
- Team-level bottleneck view (for lead).
- Simple onboarding with PAT scope guidance + Copilot SDK checks.
- Clear “last updated” timestamps and deep links to GitHub.

## Domain-Specific Requirements

### Compliance & Regulatory

- No formal regulatory requirements for MVP.

### Technical Constraints

- Copilot SDK dependency for AI features; must handle absence gracefully.
- GitHub API rate limits require polling strategy and caching.
- PAT authentication must be securely stored via VS Code SecretStorage.
- SDK is in technical preview and may change—architecture must accommodate API evolution.

### Integration Requirements

- GitHub API (GraphQL preferred) for PR metadata.
- Copilot SDK for AI features (review triggers, comment metadata, risk analysis).
- SDK availability checks with graceful degradation path.

### Risk Mitigations

- Provide graceful fallback when Copilot SDK unavailable.
- SDK abstraction layer to isolate technical preview volatility.
- Backoff/queueing for rate limits.
- Clear PAT scope guidance and storage practices.

## Innovation & Novel Patterns

### Detected Innovation Areas

- Outcome‑focused PR management inside the editor (action vs. event).
- AI‑first triage for “what needs attention now.”

### Market Context & Competitive Landscape

- Existing tools focus on notifications/reminders; CodeFlow shifts to outcome‑based prioritization and in‑editor workflows.

### Validation Approach

- Pilot teams: measure triage time, action rate on notifications, and PR cycle time vs baseline.

### Risk Mitigation

- If AI signals don’t help: fall back to manual categorization + metadata‑only dashboard.

## Developer Tool Specific Requirements

### Project-Type Overview

CodeFlow is a VS Code extension for PR management. It must work across any repo language since it operates on GitHub PR metadata rather than language-specific tooling.

### Technical Architecture Considerations

- VS Code extension host + webview (React + Vite).
- GitHub API (GraphQL preferred) for PR metadata.
- **Copilot SDK Integration:**
  - Programmatic triggering of Copilot reviews via SDK
  - Polling/listener service for Copilot review state and comment metadata
  - State management for AI badge counts and review status on PR cards
  - Graceful fallback when Copilot SDK is unavailable.

### Language & Ecosystem Support

- **Language support:** All (repo language‑agnostic).
- **IDE support (MVP):** VS Code only.

### Installation & Package Management

- **Package manager:** npm (MVP standard).

### Documentation Requirements

- Install guide
- Setup guide (PAT + Copilot CLI checks)
- Troubleshooting
- FAQ

### Examples & Demos

- Include a demo repo/PR scenario for onboarding and testing.

### Implementation Considerations

- Maintain performance targets (dashboard <2s).
- Provide secure PAT storage and clear permission guidance.
- Ensure rate‑limit safety and polling backoff.


## Functional Requirements

### Authentication & Setup

- FR1: Users can connect a GitHub account via PAT to enable data access.
- FR2: Users can view required PAT scopes and validate access before connecting.
- FR3: Users can see whether Copilot CLI is available and authenticated.
- FR4: Users can proceed with core features when Copilot CLI is unavailable.

### PR Data & Synchronization

- FR5: The system can fetch PR data from GitHub for repositories the user can access.
- FR6: The system can refresh PR data on an interval and on demand.
- FR7: Users can see last refresh time for PR data.
- FR8: The system can handle rate‑limit responses and continue operating with cached data.

### Dashboard & Categorization

- FR9: Users can view PRs grouped into four outcome‑based categories.
- FR10: Users can see counts per category.
- FR11: Users can see PR status, author, reviewers, and comment counts on cards.
- FR12: Users can see PR history/state indicators on cards.
- FR13: Users can navigate from a PR card to the PR on GitHub.

### Review & Author Workflows

- FR14: Reviewers can identify PRs requiring their attention.
- FR15: Authors can identify PRs returned to them for changes.
- FR16: Users can see when a PR they reviewed is awaiting author action.
- FR17: Users can trigger AI summaries for PRs when available.

### AI Phase 1 Features (Workflow Automation)

- FR25: Users can see AI Pre‑Flight Status badges on PR cards indicating Copilot review state.
- FR26: Users can see Copilot comment counts on PR cards before opening the PR.
- FR27: Users can trigger a One‑Click AI Review from dashboard cards without opening the PR.
- FR28: Users can see Semantic Risk Labels ("Refactor", "Critical Logic", "Config Change") on PR cards when Copilot analysis is available.
- FR29: The system displays graceful fallback UI when Copilot SDK is unavailable.

### Notifications

- FR18: Users can receive in‑editor notifications for key PR outcomes.
- FR19: Notifications can link to the dashboard or GitHub PR.
- FR20: Users can see outcome‑focused messaging (e.g., approved, changes requested).

### Team Insight (MVP‑Light)

- FR21: Team leads can view team PRs categorized by status.
- FR22: Team leads can identify bottleneck PRs by age/status.

### Documentation & Help

- FR23: Users can access install and setup guidance.
- FR24: Users can access troubleshooting guidance and FAQs.

## Non-Functional Requirements

### Performance

- Dashboard loads in <2 seconds on typical developer machines.
- PR data refresh completes within 60 seconds.

### Security

- PATs stored only in VS Code SecretStorage.
- No credentials logged or persisted outside SecretStorage.

### Reliability

- ≥99.5% crash‑free sessions.
- Graceful fallback when Copilot SDK is unavailable.
- SDK abstraction layer to accommodate API evolution during technical preview.

### Accessibility

- WCAG 2.1 AA for webview UI.

### Scalability

- Supports teams up to 50 developers and ~200 PRs/week without degraded UX.
