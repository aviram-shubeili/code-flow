# CodeFlow VS Code Extension - Agent Guidelines

## Overview
PR management dashboard extension for VS Code. React webview + TypeScript extension host communicating via typed postMessage.

## Build & Test
```bash
npm run compile      # Type-check + lint + esbuild
npm run watch        # Dev mode (parallel tsc + esbuild watch)
npm run test         # Run extension tests
npm run lint:fix     # Auto-fix lint issues
npm run format       # Prettier formatting
```

## Architecture
```
Extension Host (Node.js)          Webview (React - planned)
├── src/extension.ts              webview-ui/
├── src/auth/                     ├── components/
├── src/github/                   ├── hooks/
├── src/copilot/                  └── context/
└── src/shared/messages.ts (shared type contracts)
```

Communication: typed `postMessage` contracts in `src/shared/messages.ts`

## Code Style

**Naming:**
| Element | Convention | Example |
|---------|------------|---------|
| React components | PascalCase | `PRCard.tsx` |
| Hooks | camelCase `use` prefix | `usePullRequests.ts` |
| Services/utilities | kebab-case | `api-client.ts` |
| Types | PascalCase | `PullRequest` |
| Constants | SCREAMING_SNAKE | `STORAGE_KEYS` |
| Message types | kebab-case strings | `'refresh-request'` |
| Error codes | SCREAMING_SNAKE | `'RATE_LIMITED'` |

**Rules (enforced by ESLint):**
- `strict: true` TypeScript
- Semicolons required
- Strict equality (`===`)
- Always use braces with `if/for/while`
- Throw Error objects, not literals

## Testing
- Co-locate tests: `filename.test.ts` next to source
- Extension tests: `@vscode/test-electron`
- Webview (planned): Vitest + Testing Library

## Project Conventions
- **State:** TanStack Query for data, React Context for UI state only
- **Errors:** `{ type: 'error', code: 'RATE_LIMITED', message: '...' }`
- **Themes:** Use VS Code CSS variables for dark/light mode
- **Graceful degradation:** Core features work without Copilot SDK

## BMAD Workflow
Project uses BMAD framework for structured development:
- Sprint status: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- Stories tracked by epic/story IDs (e.g., `1-2-webview-ui-foundation`)

## Current Status
- ✅ Extension scaffold complete
- 🔄 Webview UI foundation in progress
- ⏳ GitHub API, Copilot SDK, dashboard components pending
