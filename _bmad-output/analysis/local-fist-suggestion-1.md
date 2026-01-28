
## Executive Summary

We explored simplifying CodeFlow from a cloud-deployed SaaS to a **local-first developer tool** that team members clone and run on their own machines. This dramatically reduces complexity while delivering the same core value: a PR dashboard that eliminates notification noise.

**Key Insight:** Ship fast with Docker + PAT, but **architect for change**. Two future upgrades are anticipated:
1. **GitHub Copilot SDK integration** — AI-powered PR insights
2. **Cloud deployment** — SaaS model if demand emerges

The architecture uses an **adapter pattern** to make these migrations low-effort without rewriting core logic.

---

## The Decision

### Architecture: Docker + PAT Authentication

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER'S MACHINE                              │
│                                                                 │
│  docker-compose up (one time)                                   │
│         ↓                                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Docker Container (restart: always)                        │  │
│  │ ┌──────────────────────────────────────────────────────┐ │  │
│  │ │ Next.js App                                          │ │  │
│  │ │                                                      │ │  │
│  │ │ First visit → PAT setup screen                       │ │  │
│  │ │ Token stored → ./data/config.json (volume mounted)   │ │  │
│  │ │ Subsequent visits → Dashboard immediately            │ │  │
│  │ │                                                      │ │  │
│  │ │ API calls → GitHub GraphQL with stored PAT           │ │  │
│  │ └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Browser → localhost:3000 → Always available                   │
└─────────────────────────────────────────────────────────────────┘
```

### User Experience

| Step | Action | Frequency |
|------|--------|-----------|
| 1 | Clone repo | Once |
| 2 | `docker-compose up -d` | Once |
| 3 | Open `localhost:3000` | First time only |
| 4 | Click "Create Token" → Generate on GitHub → Paste | Once |
| 5 | Open `localhost:3000` | Daily use |

After initial setup, the dashboard is **always available** — container auto-starts on boot.

---

## Key Decisions

### 1. Authentication: Personal Access Token (PAT)

**Why PAT over OAuth/Auth.js:**
- Enterprise orgs often require OAuth app approval — weeks of friction
- PAT works immediately with user's existing org access
- No callback URLs, no session management, no token refresh logic
- Simpler mental model for developers

**Why PAT over GitHub CLI (`gh auth token`):**
- Docker isolation makes `gh` CLI access complicated
- PAT is self-contained — no external dependencies
- Users understand PATs; they already use them for CI/CD

**User flow:**
- App provides pre-filled GitHub URL: `https://github.com/settings/tokens/new?description=CodeFlow&scopes=repo,read:user`
- User clicks "Generate" → copies → pastes
- Done in under 60 seconds

### 2. Deployment: Docker with Auto-Restart

**Why Docker:**
- `restart: always` means dashboard is available after every reboot
- No manual `npm run dev` commands
- Consistent environment across team members
- Single command setup: `docker-compose up -d`

**Why not native Node/PM2:**
- Requires Node.js version management
- PM2 startup scripts vary by OS
- More steps in setup process

### 3. Token Storage: JSON Config File

**Location:** `./data/config.json` (Docker volume mounted)

```json
{
  "githubToken": "ghp_xxxxxxxxxxxxxxxxxxxx"
}
```

**Security posture:**
- Plaintext is industry standard for local dev tools (npm, Docker, AWS CLI all do this)
- File permissions set to `0600` (owner read/write only)
- Directory gitignored to prevent accidental commits
- Relies on full-disk encryption (BitLocker/FileVault) for at-rest protection
- PAT scoped to minimal permissions (`repo`, `read:user`)
- PAT expiration recommended (90 days)

### 4. Database: None for MVP

**Rationale:**
- Fresh API calls on each dashboard load
- No sync/staleness issues
- Dramatically simpler architecture
- Can add caching layer later if performance requires it

### 5. What Gets Removed

| Component | Status |
|-----------|--------|
| Auth.js | ❌ Removed |
| OAuth callbacks | ❌ Removed |
| Session management | ❌ Removed |
| Neon PostgreSQL | ❌ Removed (for now) |
| Prisma ORM | ❌ Removed (for now) |
| Vercel deployment | ❌ Not needed |
| Environment variable complexity | ✅ Just `GITHUB_TOKEN` internally |

### 6. What Stays the Same

- Next.js + TypeScript
- GitHub GraphQL API
- React dashboard UI
- Four-section PR categorization logic
- Existing component structure

---

## Paths Not Taken

### ❌ Auth.js / OAuth Device Flow

**What it was:** Browser-based OAuth with GitHub, session management, token refresh.

**Why we rejected it:**
- Enterprise orgs require OAuth app approval (admin friction)
- Complex callback URL configuration
- Session management adds code complexity
- Overkill for single-user local tool

**When to reconsider:** If we pivot back to cloud-hosted SaaS model.

---

### ❌ GitHub CLI (`gh auth token`) for Authentication

**What it was:** Leverage existing `gh auth login` credentials, call `gh auth token` at runtime.

**Why we rejected it:**
- Docker container isolation prevents native access to host's `gh` CLI
- Would require setup script to extract token into `.env`
- Adds dependency on `gh` CLI being installed

**When to reconsider:** If we drop Docker and go native Node.js with PM2.

---

### ❌ Native Node.js + PM2 (No Docker)

**What it was:** Run the app directly with Node.js, use PM2 for process management and auto-start.

**Why we rejected it:**
- Requires Node.js version alignment across team
- PM2 startup configuration varies by OS
- More setup steps for users

**Trade-off acknowledged:** This approach would allow native `gh auth token` access, avoiding PAT creation.

**When to reconsider:** If Docker proves problematic for the team.

---

### ❌ Electron / Tauri Desktop App

**What it was:** Bundle Next.js as a native desktop app with system tray, auto-start, etc.

**Why we rejected it (for now):**
- Significantly more build complexity
- Larger distribution size
- Overkill for MVP validation

**Key advantage acknowledged:** Cleanest path for Copilot SDK integration (native `gh` CLI access, no Docker isolation issues). Reference implementation: [excalidraw-copilot-app](https://github.com/OrenMe/excalidraw-copilot-app).

**When to reconsider:** 
- When Copilot SDK features become priority
- If there's demand for "download and double-click" experience
- If Docker proves problematic for the team

---

### ❌ Encrypted Token Storage

**What it was:** Encrypt `config.json` at rest using OS credential manager (Windows DPAPI, macOS Keychain).

**Why we rejected it:**
- Adds native dependencies (`keytar`)
- Complicates Docker builds
- Plaintext is industry standard for local dev tools
- Marginal security gain for significant complexity

**When to reconsider:** If team has strict security requirements or shared machines.

---

### ❌ PostgreSQL / SQLite for Caching

**What it was:** Store PR data locally for faster dashboard loads.

**Why we rejected it:**
- Adds sync/staleness complexity
- Fresh API calls are fast enough for MVP
- Fewer moving parts = faster development

**When to reconsider:** If API rate limits become an issue, or if we add features requiring historical data.

---

### ❌ Cloud Deployment (Vercel)

**What it was:** Original plan — deploy as a web app, users access via URL.

**Why we rejected it:**
- Overhead was blocking MVP progress
- Enterprise OAuth approval friction
- Local-first validates core value prop faster

**When to reconsider:** After local MVP proves value, if there's demand for hosted version.

---

## Future-Proofing: Layered Architecture

To support future upgrades (Copilot SDK, Cloud deployment) without rewriting the app, we use an **adapter pattern** that separates portable logic from platform-specific implementations.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: Core Logic (Portable — Never Changes)             │
│  ├── lib/github-api.ts      ← GraphQL queries               │
│  ├── lib/pr-categorizer.ts  ← Four-section logic            │
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
│  ├── adapters/ai.ts         ← getAIInsights() interface     │
│  └── adapters/storage.ts    ← saveConfig() interface        │
│                                                             │
│  Implementations vary by platform                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: Shell (Current Platform — Replaceable)            │
│                                                             │
│  TODAY: Docker + Next.js + PAT                              │
│  FUTURE: Electron + Copilot SDK                             │
│  FUTURE: Vercel + Auth.js + Cloud                           │
└─────────────────────────────────────────────────────────────┘
```

### Adapter Interfaces

**Auth Adapter:**
```typescript
// lib/adapters/auth.ts
export interface AuthAdapter {
  getToken(): Promise<string>;
  getCurrentUser(): Promise<{ login: string; avatarUrl: string }>;
}

// Implementations:
// - PATAuthAdapter (today) — reads from config.json
// - GHCliAuthAdapter (Electron) — calls `gh auth token`
// - AuthJSAdapter (cloud) — uses Auth.js session
```

**AI Adapter:**
```typescript
// lib/adapters/ai.ts
export interface AIAdapter {
  analyzePR(pr: PullRequest): Promise<AIInsights | null>;
  isAvailable(): boolean;
}

// Implementations:
// - NoOpAIAdapter (today) — returns null, AI disabled
// - CopilotSDKAdapter (future) — uses @github/copilot-sdk
```

### Platform Wiring

```typescript
// lib/platform.ts — single place to swap implementations
import { PATAuthAdapter } from './adapters/auth';
import { NoOpAIAdapter } from './adapters/ai';

export const auth = new PATAuthAdapter();
export const ai = new NoOpAIAdapter();
```

Components import from `platform.ts` — they don't know or care about the implementation.

### Migration Effort Estimates

| Future Upgrade | What Changes | What Stays | Effort |
|----------------|--------------|------------|--------|
| **Add Copilot SDK (Electron)** | Add Electron shell, create `CopilotSDKAdapter`, update `platform.ts` | React components, PR logic, GraphQL queries | Moderate |
| **Go to Cloud (Vercel)** | Add Auth.js, create `AuthJSAdapter`, Vercel deployment | React components, PR logic, GraphQL queries | Moderate |

**~70-80% of code is portable.** Only the shell and adapter implementations change.

---

## GitHub Copilot SDK Considerations

### SDK Architecture

The Copilot SDK communicates with a local Copilot CLI process:

```
Your App → @github/copilot-sdk → JSON-RPC → Copilot CLI (server mode)
```

**Requirements:**
- Copilot CLI must be installed
- User needs GitHub Copilot subscription
- CLI must be authenticated (separate from GitHub PAT)

### Docker + Copilot SDK Challenge

Docker container isolation makes Copilot CLI access complicated:

| Component | Issue in Docker |
|-----------|-----------------|
| Copilot CLI binary | Must be installed in container |
| Copilot auth | Separate from PAT, needs credential access |

**Solutions when SDK is needed:**

1. **External CLI Server Mode:** Run Copilot CLI on host, container connects via `host.docker.internal`
2. **Switch to Electron:** Native access to CLI and credentials (cleanest)

### Electron Alternative (Reference: Oren's App)

Oren's [excalidraw-copilot-app](https://github.com/OrenMe/excalidraw-copilot-app) demonstrates a working Electron + Copilot SDK pattern:

- Uses `gh auth login` for authentication
- Copilot SDK runs in Electron main process
- React UI in renderer process
- SQLite for local storage

**If Copilot SDK becomes critical:** Electron migration is straightforward because:
- React components port directly
- Core logic (PR categorization) is unchanged
- Only shell and auth adapter change

### Current Decision

**Defer Copilot SDK to Phase 2.** 

Rationale:
- MVP value is the dashboard itself, not AI features
- Docker + PAT ships faster
- Adapter pattern ensures low-effort migration when ready

---

## CI/CD Considerations

Token acquisition is abstracted to support both local and CI environments:

```typescript
function getGitHubToken(): string {
  // CI environment (GitHub Actions)
  if (process.env.GITHUB_TOKEN) {
    return process.env.GITHUB_TOKEN;
  }
  
  // Local (Docker with config.json)
  const config = readConfigFile();
  if (config.githubToken) {
    return config.githubToken;
  }
  
  throw new Error('GitHub token not configured');
}
```

- **Unit tests:** Mock GitHub API responses
- **Integration tests in CI:** Use `GITHUB_TOKEN` from GitHub Actions
- **Local development:** Use PAT from config.json

---

## Open Questions for Stakeholders

1. **Docker requirement:** Is Docker Desktop installed across the team? Any licensing concerns?

2. **PAT management:** Are team members comfortable creating/managing their own PATs?

3. **Security posture:** Is plaintext token storage acceptable given it's on personal machines?

4. **Update mechanism:** How do we handle app updates? `git pull && docker-compose up --build`?

5. **Teams integration:** Still on roadmap? Would require additional architecture for webhooks.

6. **Copilot SDK timeline:** When do we want AI features? This affects whether we stay Docker or migrate to Electron.

7. **Cloud aspirations:** If cloud deployment is likely, should we keep Auth.js code dormant rather than deleting it?

---

## Next Steps

1. ✅ Stakeholder review of this document
2. ⏳ Finalize decisions based on feedback
3. ⏳ Create adapter interfaces (`auth.ts`, `ai.ts`, `storage.ts`)
4. ⏳ Implement `PATAuthAdapter` and `NoOpAIAdapter`
5. ⏳ Build PAT setup screen
6. ⏳ Create Dockerfile and docker-compose.yaml
7. ⏳ Implementation sprint — PR dashboard MVP

### Phased Roadmap

| Phase | Focus | Platform |
|-------|-------|----------|
| **Phase 1 (Now)** | Core dashboard, four-section PR view | Docker + PAT |
| **Phase 2 (Future)** | Copilot SDK AI features | Electron or External CLI |
| **Phase 3 (Future)** | Cloud deployment, multi-user | Vercel + Auth.js |

---

## Files to Modify/Create

### New Files (Adapter Architecture)

| File | Purpose |
|------|---------|
| `lib/adapters/auth.ts` | Auth interface + PATAuthAdapter implementation |
| `lib/adapters/ai.ts` | AI interface + NoOpAIAdapter (placeholder) |
| `lib/adapters/storage.ts` | Storage interface for config persistence |
| `lib/platform.ts` | Wires up current adapter implementations |
| `lib/github-api.ts` | GraphQL client using auth adapter |
| `lib/pr-categorizer.ts` | Pure business logic for PR sections |

### Infrastructure Files

| File | Action |
|------|--------|
| `Dockerfile` | Create — production Next.js build |
| `docker-compose.yaml` | Update — add volume mount, restart policy |
| `app/setup/page.tsx` | Create — PAT setup screen |
| `.gitignore` | Update — add `/data/` |

### Files to Remove/Simplify

| File | Action |
|------|--------|
| `auth.config.ts` | Delete — no longer needed |
| `auth.ts` | Delete — no longer needed |
| `middleware.ts` | Simplify — remove auth checks |
| `prisma/` | Keep but unused for MVP (future caching) |

### Component Guidelines

- Keep React components in `components/` platform-agnostic
- No direct imports of Node.js APIs in components
- Use adapters via `lib/platform.ts` for all external services

---

*Document generated from brainstorming session with Architect Agent*
*Updated with layered architecture strategy and Copilot SDK considerations*
