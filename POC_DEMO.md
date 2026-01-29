# CodeFlow POC Demo

This document describes the CodeFlow VS Code extension POC features and capabilities.

## Overview

CodeFlow is a VS Code extension that brings GitHub pull request management directly into your editor. It reduces context switching by providing an intelligent, outcome-focused dashboard for tracking PRs across all your repositories.

## Key Features Implemented

### 1. Authentication & Security
- **Secure GitHub PAT Storage**: Uses VS Code's SecretStorage API
- **PAT Validation**: Checks token format before storage
- **Token Security**: Never logged or displayed in plain text
- **Scope Guidance**: Clear documentation on required permissions

### 2. Four-Section Dashboard

The dashboard organizes PRs by what action you need to take:

```
┌────────────────────────────────────────────────────────────┐
│  CodeFlow Dashboard                    [Refresh]           │
│  Last updated: 2 minutes ago                               │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────┐  ┌──────────────────────────┐│
│  │ 📋 Needs Review      [3] │  │ 🔄 Returned to You   [1] ││
│  ├──────────────────────────┤  ├──────────────────────────┤│
│  │ ┌──────────────────────┐ │  │ ┌──────────────────────┐ ││
│  │ │ Add user auth system │ │  │ │ Fix mobile layout    │ ││
│  │ │ repo/name #123       │ │  │ │ repo/name #121       │ ││
│  │ │ by alice · 2h ago    │ │  │ │ 💬 3 CHANGES_REQ     │ ││
│  │ │ 💬 5                 │ │  │ └──────────────────────┘ ││
│  │ └──────────────────────┘ │  │                          ││
│  │ ┌──────────────────────┐ │  └──────────────────────────┘│
│  │ │ Update API docs      │ │                               │
│  │ │ repo/name #125       │ │  ┌──────────────────────────┐│
│  │ │ by bob · 5h ago      │ │  │ 📝 My PRs            [2] ││
│  │ │ 💬 2                 │ │  ├──────────────────────────┤│
│  │ └──────────────────────┘ │  │ ┌──────────────────────┐ ││
│  └──────────────────────────┘  │ │ Refactor services    │ ││
│                                 │ │ repo/name #122       │ ││
│                                 │ │ ✅ APPROVED          │ ││
│                                 │ │ 💬 8                 │ ││
│                                 │ └──────────────────────┘ ││
│                                 │ ┌──────────────────────┐ ││
│                                 │ │ Update dependencies  │ ││
│                                 │ │ repo/name #120       │ ││
│  ┌──────────────────────────┐  │ │ 👀 REVIEW_REQUIRED   │ ││
│  │ ✅ Reviewed-Awaiting [1] │  │ │ 💬 1                 │ ││
│  ├──────────────────────────┤  │ └──────────────────────┘ ││
│  │ ┌──────────────────────┐ │  └──────────────────────────┘│
│  │ │ Database migration   │ │                               │
│  │ │ repo/name #119       │ │                               │
│  │ │ by charlie · 1d ago  │ │                               │
│  │ │ 💬 3                 │ │                               │
│  │ └──────────────────────┘ │                               │
│  └──────────────────────────┘                               │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### 3. PR Card Information

Each PR card displays:
- **Title**: Full PR title
- **Repository**: owner/name format
- **Number**: PR number (#123)
- **Author**: Who created the PR
- **Timestamp**: Relative time (2h ago, 1 day ago)
- **Comments**: Comment count (💬 5)
- **Status Badge**: Review decision (APPROVED, CHANGES_REQUESTED, etc.)

### 4. User Interactions

**Click on any PR card** → Opens PR on GitHub in your browser

**Refresh button** → Manually refresh all PR data

**Automatic refresh** → Background updates every 60 seconds

### 5. Notifications

VS Code toast notifications for:

```
┌──────────────────────────────────────┐
│ 📋 Review requested: Add user auth   │
│                                      │
│  [View PR]  [Open Dashboard]         │
└──────────────────────────────────────┘
```

```
┌──────────────────────────────────────┐
│ 🔄 Changes requested on: Fix mobile  │
│                                      │
│  [View PR]  [Open Dashboard]         │
└──────────────────────────────────────┘
```

```
┌──────────────────────────────────────┐
│ ✅ PR approved: Refactor services    │
│                                      │
│  [View PR]  [Open Dashboard]         │
└──────────────────────────────────────┘
```

### 6. Commands

Access via Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):

- `CodeFlow: Open Dashboard` - Open/show the dashboard
- `CodeFlow: Authenticate with GitHub` - Set up GitHub token
- `CodeFlow: Refresh PRs` - Manually refresh PR data

## Technical Implementation

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│                     VS Code Extension                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Extension  │  │    GitHub    │  │ Notification │  │
│  │   Host       │←→│    Client    │←→│   Service    │  │
│  │ (extension.ts│  │  (GraphQL)   │  │              │  │
│  └──────┬───────┘  └──────────────┘  └──────────────┘  │
│         │                                               │
│         ↓                                               │
│  ┌──────────────┐                                       │
│  │   Webview    │ ← HTML/CSS/JavaScript                 │
│  │   Panel      │   (Inline, no build step)             │
│  └──────────────┘                                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
                        ↕
            ┌──────────────────────┐
            │   GitHub GraphQL API  │
            └──────────────────────┘
```

### File Structure
```
src/
├── extension.ts              # Entry point, command registration, polling
├── github/
│   ├── auth.ts              # PAT authentication & SecretStorage
│   └── client.ts            # GraphQL client, PR data fetching
├── webview/
│   └── DashboardPanel.ts    # Webview panel with inline HTML/CSS/JS
├── services/
│   └── NotificationService.ts # PR change detection & notifications
└── types/
    └── index.ts             # TypeScript interfaces
```

## Data Flow

1. **User authenticates** → PAT stored in SecretStorage
2. **Dashboard opens** → GraphQL query fetches PR data
3. **Data categorized** → PRs sorted into 4 sections based on:
   - Review requests → Needs Review
   - Changes requested on user's PRs → Returned to You
   - User's open PRs → My PRs
   - User reviewed, still open → Reviewed-Awaiting
4. **Data displayed** → Webview renders PR cards
5. **Background polling** → Every 60s:
   - Fetch latest PR data
   - Compare with previous state
   - Send notifications for changes
   - Update dashboard if visible
6. **User clicks PR** → Opens GitHub in browser

## GitHub API Usage

### GraphQL Queries

**Needs Review**: `type:pr state:open review-requested:{user}`

**My PRs**: `type:pr state:open author:{user}`

### Rate Limiting Strategy

- Polling every 60 seconds
- Caching of PR data
- Graceful degradation on rate limits
- Silent background failures (logs only)

## Security Features

- ✅ PAT stored in VS Code SecretStorage (encrypted)
- ✅ Token validation before storage
- ✅ No token logging or display
- ✅ Token only sent to GitHub API
- ✅ Clear scope requirements in docs
- ✅ Revocation instructions provided

## POC Limitations

This POC focuses on core functionality. Not included:

- ❌ Copilot SDK integration (deferred)
- ❌ AI-powered features (Phase 2-3)
- ❌ Advanced filtering/sorting
- ❌ Team dashboard views
- ❌ In-extension PR review
- ❌ Custom notification preferences
- ❌ Multi-account support
- ❌ External integrations (Slack, Teams)

## Success Criteria

✅ Core extension architecture established
✅ GitHub authentication working
✅ Four-section dashboard rendering
✅ PR data fetching and categorization
✅ Real-time updates via polling
✅ VS Code notifications for key events
✅ Clean, professional UI
✅ Comprehensive documentation
✅ Build and packaging working

## Next Steps

1. **User Testing**: Test with real GitHub repositories
2. **Feedback Collection**: Gather user experience feedback
3. **Performance Optimization**: Monitor API usage and polling
4. **Feature Validation**: Confirm outcome-based categorization helps
5. **Phase 2 Planning**: Prepare for Copilot SDK integration

## Demo Instructions

To demo the POC:

1. Run `npm install` to install dependencies
2. Press `F5` in VS Code to launch Extension Development Host
3. In the new window, run `CodeFlow: Authenticate with GitHub`
4. Enter a GitHub PAT with `repo`, `read:org`, `read:user` scopes
5. Run `CodeFlow: Open Dashboard`
6. Observe the four-section dashboard with your PRs
7. Click on a PR card to open it on GitHub
8. Wait 60 seconds to see automatic refresh
9. Create/update a PR on GitHub to trigger notifications

---

**POC Status**: ✅ Complete and ready for testing
