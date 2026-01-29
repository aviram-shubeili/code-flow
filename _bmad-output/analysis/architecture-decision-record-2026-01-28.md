# CodeFlow Architecture Decision Record

**Date:** January 28, 2026  
**Status:** Approved  
**Decision Makers:** Aviram (Product Owner), BMAD Agent Team  
**Supersedes:** Original cloud-first SaaS approach

---

## Executive Summary

CodeFlow pivots from a cloud-deployed Next.js SaaS to a **VS Code Extension** as the MVP platform. This decision enables:

- **Copilot SDK integration from Day 1** — Early adopter positioning on GitHub's newest AI platform
- Native Copilot agentic workflows (planning, tool use, file operations)
- Enterprise compatibility without OAuth app approval
- 85-90% code portability to future SaaS when needed

> **Strategic Positioning:** CodeFlow will be among the first VS Code extensions to leverage the GitHub Copilot SDK, differentiating through AI-native PR insights.

---

## Decision: VS Code Extension over Docker or Cloud SaaS

### Alternatives Considered

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Cloud SaaS (Vercel + Auth.js)** | Standard web deployment | OAuth approval friction, infra costs, blocks MVP | ❌ Rejected for MVP |
| **Docker + PAT** | Simple, always-available | Container isolation blocks Copilot SDK | ❌ Rejected |
| **VS Code Extension** | Native Copilot path, zero friction, in-editor | New tech stack to learn | ✅ Selected |

### Why VS Code Extension Wins

1. **Copilot SDK Access** — Extension host is Node.js, can spawn Copilot CLI as JSON-RPC server for agentic AI workflows
2. **User Behavior** — Developers live in VS Code, not browser tabs
3. **Distribution** — VS Code Marketplace provides acquisition channel
4. **Enterprise Compatibility** — PAT works immediately, no OAuth app approval
5. **Code Portability** — 85-90% reusable for future cloud pivot
6. **Early Adopter Advantage** — First-mover on Copilot SDK = visibility, community engagement, GitHub partnership potential

---

## Product Vision

> **CodeFlow = Smart PR Dashboard + Smart Notifications + Fast PR Conversations + AI Insights**

### User Journey

```
1. Something changes on a PR I care about
         ↓
2. I get notified WHERE I already am (VS Code / Slack / Teams)
         ↓
3. I click → lands in CodeFlow extension
         ↓
4. AI summarizes PR, I see what changed, I respond inline
         ↓
5. PR closes faster
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    VS Code Extension                            │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │          EXTENSION HOST (Node.js runtime)                 │ │
│  │          ════════════════════════════════                 │ │
│  │  This IS your "backend"                                   │ │
│  │  - GitHub API calls (Octokit + GraphQL)                   │ │
│  │  - Copilot SDK client (@github/copilot-sdk)               │ │
│  │  - PR categorization logic                                │ │
│  │  - Notification service (polling)                         │ │
│  │  - Message handlers                                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                         │                                       │
│         ┌───────────────┴───────────────┐                       │
│         │                               │                       │
│         ▼ postMessage()                 ▼ JSON-RPC              │
│  ┌─────────────────────┐         ┌─────────────────────┐        │
│  │  WEBVIEW (Browser)  │         │  COPILOT CLI        │        │
│  │  ═══════════════════│         │  (External Process) │        │
│  │  - React Dashboard  │         │  - Agentic runtime  │        │
│  │  - PR Cards + AI    │         │  - Tool execution   │        │
│  │  - Category Tabs    │         │  - Planning/Reason  │        │
│  │  - Chat Panel       │         │  - Model access     │        │
│  │  - Tailwind CSS     │         │                     │        │
│  └─────────────────────┘         └─────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### Copilot SDK Architecture

The Copilot SDK communicates with GitHub's Copilot CLI via JSON-RPC:

```
CodeFlow Extension
       ↓
  @github/copilot-sdk (npm)
       ↓ JSON-RPC
  Copilot CLI (server mode)
       ↓
  GitHub Copilot Backend
```

**Key Capabilities:**
- **Agentic Workflows**: SDK handles planning, tool invocation, file operations
- **Built-in Tools**: File read/write, Git operations, Bash commands, web requests
- **Model Access**: All Copilot models (GPT-4o, Claude, etc.) via unified API
- **Custom Tools**: Define CodeFlow-specific tools (PR analysis, reviewer suggestions)

**User Requirement:** Copilot CLI must be installed (`gh copilot` or standalone)

---

## Adapter Pattern Architecture

To support graceful degradation and future upgrades (Cloud deployment, additional AI providers) without rewriting the app, we use an **adapter pattern** that separates portable logic from platform-specific implementations.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: Core Logic (Portable — Never Changes)             │
│  ├── lib/github-api.ts      ← GraphQL queries (preferred)   │
│  ├── lib/pr-categorizer.ts  ← Four-category logic           │
│  ├── lib/types.ts           ← PR, User, Review types        │
│  └── components/            ← React UI components           │
│                                                             │
│  Zero dependencies on: auth method, runtime, SDK            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: Adapters (Swappable Implementations)              │
│  ├── adapters/auth.ts       ← getToken() interface          │
│  ├── adapters/ai.ts         ← AI insights interface         │
│  ├── adapters/notifications.ts ← notification delivery      │
│  └── adapters/chat.ts       ← comments/chat interface       │
│                                                             │
│  Implementations vary by platform and phase                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: Shell (Current Platform — Replaceable)            │
│                                                             │
│  NOW:    VS Code Extension + PAT + Copilot SDK              │
│  FUTURE: + CodeFlow Backend (team features)                 │
│  FUTURE: + vscode.lm fallback (if SDK unavailable)          │
│  FUTURE: Cloud SaaS (if demand emerges)                     │
└─────────────────────────────────────────────────────────────┘
```

### AI Adapter Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      AIAdapter Interface                     │
│  isAvailable() | summarizePR() | assessRisk() | askQuestion│
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  CopilotSDK     │  │  LanguageModel  │  │    NoOp         │
│  Adapter        │  │  Adapter        │  │    Adapter      │
│  ━━━━━━━━━━━━━  │  │  ━━━━━━━━━━━━━  │  │  ━━━━━━━━━━━━━  │
│  PRIMARY        │  │  FALLBACK       │  │  DEGRADED       │
│  @github/       │  │  vscode.lm.*    │  │  AI hidden      │
│  copilot-sdk    │  │  (if SDK fails) │  │  (no Copilot)   │
│  ───────────────│  │  ───────────────│  │  ───────────────│
│  ✓ Agentic      │  │  ✓ In-process   │  │  ✓ Always works │
│  ✓ Tools        │  │  ✓ No CLI       │  │  ✓ No deps      │
│  ✓ Multi-step   │  │  ✗ No tools     │  │  ✗ No AI        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Selection Logic:**
1. Try `CopilotSDKAdapter.isAvailable()` — if Copilot CLI running, use it
2. Fallback to `LanguageModelAdapter` — if VS Code Copilot extension available
3. Final fallback to `NoOpAdapter` — dashboard works, AI features hidden

### Adapter Interfaces

```typescript
// lib/adapters/auth.ts
export interface AuthAdapter {
  getToken(): Promise<string>;
  getCurrentUser(): Promise<{ login: string; avatarUrl: string }>;
}
// MVP: PATAuthAdapter — reads from VS Code SecretStorage
// Future Cloud: AuthJSAdapter — uses Auth.js session

// lib/adapters/ai.ts
export interface AIAdapter {
  isAvailable(): Promise<boolean>;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  summarizePR(pr: PR): Promise<string | null>;
  assessRisk(pr: PR): Promise<RiskLevel | null>;
  suggestReviewers(pr: PR): Promise<string[] | null>;
  askQuestion(prId: string, question: string): Promise<AsyncIterable<string>>;
}

// MVP: CopilotSDKAdapter — uses @github/copilot-sdk
import { CopilotClient } from "@github/copilot-sdk";

export class CopilotSDKAdapter implements AIAdapter {
  private client: CopilotClient | null = null;
  
  async initialize(): Promise<void> {
    this.client = new CopilotClient();
    await this.client.start();
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      // Check if Copilot CLI is available
      const status = await this.client?.getStatus();
      return status?.authenticated ?? false;
    } catch {
      return false;
    }
  }
  
  async summarizePR(pr: PR): Promise<string | null> {
    if (!this.client) return null;
    
    const session = await this.client.createSession({
      model: "gpt-4o",
      systemMessage: {
        mode: "append",
        content: `You are a code review assistant. Summarize PRs concisely.`
      }
    });
    
    const response = await session.send({
      prompt: `Summarize this PR:\n\nTitle: ${pr.title}\nDescription: ${pr.body}\nFiles: ${pr.changedFiles.join(", ")}`
    });
    
    // Collect streaming response
    let summary = "";
    session.on((event) => {
      if (event.type === "assistant.message") {
        summary = event.data.content;
      }
    });
    
    await session.destroy();
    return summary;
  }
  
  async shutdown(): Promise<void> {
    await this.client?.stop();
  }
}

// Fallback: NoOpAdapter for users without Copilot
export class NoOpAIAdapter implements AIAdapter {
  async isAvailable() { return false; }
  async initialize() {}
  async shutdown() {}
  async summarizePR() { return null; }
  async assessRisk() { return null; }
  async suggestReviewers() { return null; }
  async *askQuestion() { yield "AI features require GitHub Copilot"; }
}

// lib/adapters/notifications.ts
export interface NotificationAdapter {
  notify(event: PREvent, recipient: User): Promise<void>;
}
// MVP+1.5: VSCodeToastAdapter — VS Code notification toasts
// MVP+2: SlackAdapter, TeamsAdapter — via backend or GitHub Actions

// lib/adapters/chat.ts
export interface ChatAdapter {
  getComments(prId: string): Promise<Comment[]>;
  postComment(prId: string, body: string): Promise<Comment>;
  subscribeToComments?(prId: string, callback: (c: Comment) => void): void;
}
// MVP+1: GitHubCommentsAdapter — direct GitHub API (GraphQL)
// Phase 2+: RealtimeChatAdapter — WebSocket via backend
```

---

## Feature Roadmap

### Phase 1: MVP (Dashboard + Copilot SDK)

| Feature | Description | Backend |
|---------|-------------|--------|
| Dashboard | 4-category PR view (Needs Review, Your PRs, Follow-up, Reviewed) | ❌ |
| PAT Auth | Secure token storage via VS Code SecretStorage API | ❌ |
| GitHub API | Octokit + **GraphQL** for efficient PR data fetching | ❌ |
| Copilot SDK | AI-powered PR summaries, risk assessment | ❌ |
| Refresh | Manual + auto-refresh on interval | ❌ |

**User Prerequisites:**
- GitHub Copilot subscription (Free tier supported with limits)
- Copilot CLI installed (`npm install -g @github/copilot-cli` or via GitHub CLI)
- VS Code with GitHub Copilot extension

**Graceful Degradation:** If Copilot CLI unavailable, AI features hidden, dashboard works normally.

**Estimated Effort:** 3-4 weeks (includes SDK integration learning curve)

> **Marketing Note:** "CodeFlow: The first PR dashboard powered by GitHub Copilot SDK"

### Phase 2: MVP+1 (Chat)

| Feature | Description | Backend |
|---------|-------------|---------|
| Chat Panel | GitHub PR comments rendered in extension | ❌ |
| Threaded View | Comments grouped by file/line | ❌ |
| Inline Reply | Post comments without leaving VS Code | ❌ |
| Resolve | Mark threads resolved (GitHub API) | ❌ |

**Estimated Effort:** 1 week

### Phase 3: MVP+1.5 (Local Notifications)

| Feature | Description | Backend |
|---------|-------------|---------|
| Background Polling | Check for PR changes every 30-60 seconds | ❌ |
| VS Code Toasts | Notification popups for new activity | ❌ |
| Deep Links | "Open in CodeFlow" action on notifications | ❌ |

**Notification Event Matrix:**

| Event Type | Notify Owner | Notify Reviewers | Notify Followers |
|------------|--------------|------------------|------------------|
| New commit pushed | — | ✅ | ✅ |
| New comment | ✅ (if not author) | ✅ | ✅ |
| New review submitted | ✅ | ✅ (others) | ✅ |
| Review requested | ✅ | ✅ (the requested) | — |
| PR approved | ✅ | — | ✅ |
| Changes requested | ✅ | — | ✅ |

**Estimated Effort:** 3-4 days

### Phase 4: MVP+2 (External Notifications) — OPEN DECISION

| Option | Description | Backend | Trade-off |
|--------|-------------|---------|-----------|
| **A: GitHub Actions Template** | We provide workflow YAML, users install per-repo | ❌ | Faster, no hosting, but per-repo config |
| **B: CodeFlow Backend** | Central webhook receiver, routing rules | ✅ | More control, but infra to maintain |

**Recommendation:** Start with Option A, upgrade to B when users need custom routing.

**Estimated Effort:** A = 2-3 days, B = 1-2 weeks

### Phase 5: Advanced Copilot Features (Agentic Workflows)

| Feature | Description | Backend |
|---------|-------------|--------|
| "Fix This" | Copilot analyzes review comment → suggests code fix | ❌ |
| Auto-Categorize | Let Copilot decide PR priority based on content | ❌ |
| Review Assistant | AI drafts review comments based on code patterns | ❌ |
| Custom Tools | CodeFlow-specific tools for Copilot agent mode | ❌ |

**Agentic Capabilities (via Copilot SDK):**
- Multi-step reasoning across PR files
- Tool invocation (read files, analyze diffs, check tests)
- Planning and autonomous task completion

**Estimated Effort:** 2-3 weeks

### Phase 6: Backend Features (When Demand Emerges)

| Feature | Description | Trigger |
|---------|-------------|---------|
| "Follow" any PR | Opt-in to notifications for PRs you don't own/review | User request |
| Notification Preferences | Custom routing rules (which events, which channels) | User request |
| Team Dashboard | "What's blocking my team?" view | Org/team request |
| Analytics | Review velocity, stale PR trends | Manager request |

---

## Cloud SaaS Migration Path

### When to Pivot to SaaS

| Trigger | Feature Unlocked |
|---------|------------------|
| "I want to see my *team's* PRs" | Team dashboard |
| "I want cross-repo analytics" | Central data store |
| "I want webhook-based notifications" | Always-on receiver |
| "I want SSO/enterprise auth" | SAML integration |

### Migration Effort Estimate

| Component | From (Extension) | To (Next.js) | Effort |
|-----------|------------------|--------------|--------|
| `webviews/components/*` | Copy | `app/components/*` | Direct copy |
| `lib/github/*` | Copy | `lib/github/*` | Direct copy |
| `shared/types.ts` | Copy | `types/*` | Direct copy |
| `adapters/*` | Rewrite | REST-based adapters | 1-2 weeks |
| Auth | PAT → OAuth | Auth.js + GitHub OAuth | 1 week |
| Data | Real-time API | PostgreSQL + caching | 1-2 weeks |

**Estimated total SaaS migration:** 3-4 weeks (when needed)

---

## Project Structure

```
codeflow-extension/
├── .vscode/
│   ├── launch.json                 # Debug configurations
│   └── tasks.json                  # Build tasks
│
├── src/                            # Extension host (Node.js "backend")
│   ├── extension.ts                # Entry point, activation
│   ├── commands/                   # VS Code command handlers
│   ├── views/                      # Webview providers
│   │   ├── DashboardViewProvider.ts
│   │   └── ChatPanelProvider.ts
│   ├── services/                   # Background services
│   │   └── NotificationService.ts
│   ├── github/                     # GitHub integration
│   │   ├── api.ts                  # Octokit wrapper
│   │   ├── types.ts                # PR, Review interfaces
│   │   └── categorize.ts           # PR categorization logic
│   ├── copilot/                    # Copilot SDK integration
│   │   ├── client.ts               # CopilotClient wrapper + lifecycle
│   │   ├── adapter.ts              # CopilotSDKAdapter impl
│   │   ├── tools.ts                # Custom CodeFlow tools for agent
│   │   └── prompts.ts              # System prompts for PR analysis
│   ├── adapters/                   # Swappable implementations
│   │   ├── auth.ts
│   │   ├── ai.ts
│   │   ├── notifications.ts
│   │   └── chat.ts
│   ├── auth/                       # PAT management
│   │   └── tokenStore.ts
│   └── test/                       # Extension-level tests
│
├── webviews/                       # React frontend (browser)
│   ├── dashboard/                  # Main dashboard view
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   ├── chat/                       # Chat panel view
│   │   └── ChatPanel.tsx
│   ├── components/                 # Shared React components
│   │   ├── PRCard.tsx
│   │   ├── CategoryTabs.tsx
│   │   ├── AIInsights.tsx
│   │   └── ui/
│   ├── hooks/
│   │   ├── useGitHubData.ts
│   │   ├── useVSCodeApi.ts
│   │   └── useCopilot.ts
│   └── lib/
│       ├── messaging.ts
│       └── formatters.ts
│
├── shared/                         # Code shared between extension & webview
│   └── types.ts                    # Message types, PR interfaces
│
├── tests/
│   ├── unit/                       # Pure function tests (Vitest)
│   ├── components/                 # React component tests
│   └── integration/                # Extension integration tests
│
├── package.json                    # Extension manifest + npm
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Webview bundler config
└── vitest.config.ts                # Test config
```

---

## Open Items

### Decisions Deferred

| Item | Options | Decision Point |
|------|---------|----------------|
| Slack/Teams Notifications | GitHub Actions vs. Backend | After MVP+1.5, based on user feedback |
| Real-time Chat | Polling vs. WebSocket | Phase 2, based on UX testing |
| Backend Hosting | Vercel, Railway, self-hosted | When backend features needed |

### Technical Investigations Needed

| Item | Question | Status |
|------|----------|--------|
| Copilot SDK | ⚠️ **Technical Preview** — API may change, monitor releases | Accept risk for early adopter advantage |
| Copilot CLI Distribution | How to guide users through CLI install? In-extension prompt? | To implement |
| VS Code SecretStorage | PAT storage best practices | ✅ Validated (`context.secrets.store/get/delete`) |
| Webview CSP | Nonce handling for React scripts | ✅ Not needed with `webview.cspSource` |
| GraphQL vs REST | Use GraphQL for dashboard (fewer roundtrips) | ✅ Decision: Use GraphQL |
| Rate Limiting | GitHub API: 5000 req/hr. Polling interval: 60s = safe | Monitor usage |

### Copilot SDK Risk Mitigation

| Risk | Mitigation |
|------|------------|
| SDK is Technical Preview | Adapter pattern allows fallback to `NoOpAdapter` |
| CLI installation friction | Provide clear onboarding wizard in extension |
| Premium request quotas | Cache AI results, batch requests, respect user quotas |
| Breaking API changes | Pin SDK version, monitor changelog, plan upgrade sprints |

---

## Success Metrics

### MVP

- [ ] Extension installs from Marketplace
- [ ] Time from install to first dashboard view < 5 minutes
- [ ] Dashboard load time < 2 seconds
- [ ] **Copilot SDK adoption rate** (% of users with CLI installed)
- [ ] **AI summary generation success rate** (% of PRs with summaries)
- [ ] **Premium request consumption** (avg per user/day)

### MVP+1/+2

- [ ] % of users engaging with chat panel
- [ ] Time to first reply (vs. GitHub web)
- [ ] Notification click-through rate
- [ ] **"Ask Copilot" query volume**

### Phase 5 (Agentic)

- [ ] "Fix This" feature usage
- [ ] Auto-generated review comment acceptance rate
- [ ] Multi-step task completion rate

---

## Reference Implementation

Study: **[microsoft/vscode-pull-request-github](https://github.com/microsoft/vscode-pull-request-github)**

Microsoft's official GitHub PR extension — CodeFlow aims to simplify and enhance with:
1. Four-category dashboard (vs. flat list)
2. **Copilot SDK integration for AI insights** (first-mover advantage)
3. Smart notifications that respect user's preferred channels

### Copilot SDK Resources

| Resource | URL |
|----------|-----|
| **SDK Repository** | [github/copilot-sdk](https://github.com/github/copilot-sdk) |
| **Getting Started** | [docs/getting-started.md](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md) |
| **Cookbook** | [cookbook/README.md](https://github.com/github/copilot-sdk/blob/main/cookbook/README.md) |
| **Custom Instructions** | [awesome-copilot/copilot-sdk.md](https://github.com/github/awesome-copilot/blob/main/collections/copilot-sdk.md) |
| **CLI Installation** | [GitHub Copilot CLI docs](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) |

---

## Approval

This ADR was developed through collaborative discussion between:

- 🏗️ Winston (Architect) — Architecture patterns, Copilot SDK integration strategy
- 📋 John (Product Manager) — User value, feature prioritization
- 💻 Amelia (Developer) — Implementation feasibility
- 🏃 Bob (Scrum Master) — Phasing, effort estimates
- 🧪 Murat (Test Architect) — Quality gates, graceful degradation
- 🎨 Sally (UX Designer) — User experience flows
- 📊 Mary (Business Analyst) — Competitive positioning
- 🧙 BMad Master — Synthesis and orchestration

---

## Strategic Risk Acknowledgment

> **Accepted Risk:** The GitHub Copilot SDK is in **Technical Preview** (v0.1.19 as of January 2026).
>
> **Rationale:** Early adoption creates differentiation. Being "the PR dashboard built on Copilot SDK" positions CodeFlow for:
> - Visibility in the developer community
> - Potential GitHub partnership opportunities
> - Feature parity as SDK matures
> - Community contributions from other SDK adopters
>
> **Mitigation:** Adapter pattern allows seamless fallback to `vscode.lm` API or `NoOpAdapter` if SDK issues arise.

---

**Status:** Ready for implementation sprint planning.
**Updated:** January 28, 2026 — Copilot SDK integration from Day 1 (per product decision)
