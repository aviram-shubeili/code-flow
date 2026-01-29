# Project Context: CodeFlow

## Purpose
CodeFlow is a VS Code extension that streamlines pull request management inside the editor. It prioritizes review outcomes over event notifications, reducing context switching and review cycle delays for GitHub-based teams.

## Target Users
- Mid-size development teams (5–15 developers) using GitHub and VS Code
- Enterprise teams (15+ developers) with high PR volume and distributed collaboration

## Core User Workflows
1. Open in-editor dashboard to see actionable PRs by outcome category.
2. Review PRs with quick context and links to GitHub for full review.
3. Track “returned to you” items when feedback needs addressing.
4. Receive in-editor notifications for key status changes.
5. Use Copilot-powered summaries/risk cues when available.

## Product Constraints
- MVP is a VS Code extension (not a web SaaS) to enable Copilot SDK integration.
- Auth via GitHub PAT stored in VS Code SecretStorage.
- No backend required for MVP.
- Real-time updates via polling (target 60s).

## Technical Architecture (MVP)
- Extension host (Node.js + TypeScript) acts as backend.
- Webview UI (React + Vite + Tailwind) for dashboard.
- GitHub API (GraphQL preferred) for PR data.
- Copilot SDK (technical preview) for AI summaries and risk cues, with graceful fallback.

## External Dependencies
- GitHub API access and PAT permissions
- GitHub Copilot CLI installed for AI features
- VS Code Copilot extension for fallback

## Non-Goals (MVP)
- Full GitHub review UI inside the extension
- Advanced filtering/grouping and analytics
- External notification integrations (Slack/Teams) unless Phase 2
- Backend services or hosted infrastructure

## Current State
- Product brief exists in docs/brief.md
- UX specification exists in docs/front-end-spec.md
- ADR confirms VS Code extension decision and Copilot SDK-first approach
- No PRD created yet

## Key Risks
- Copilot SDK stability and CLI installation friction
- GitHub API rate limits at higher team scale
- Adoption risk if teams resist changing PR workflows

## Success Metrics (MVP)
- Reduce PR review cycle time by 50%
- 80% of users open dashboard daily in first month
- 60% action rate on in-editor notifications
- 15 minutes/day saved per active user
