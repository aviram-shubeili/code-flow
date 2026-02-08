# Story 1.3: Extension ↔ Webview Communication Contract

Status: ready-for-dev

---

## Story

As a **developer**,
I want type-safe message passing between extension and webview,
so that I can reliably communicate data and actions.

---

## Acceptance Criteria

1. **Given** extension host and webview-ui are set up
   **When** the message contract is implemented
   **Then** `src/shared/messages.ts` defines `WebviewMessage` and `ExtensionMessage` types

2. **And** message type strings use kebab-case (e.g., `'ready'`, `'ping'`, `'pong'`)

3. **And** error codes use SCREAMING_SNAKE (e.g., `'UNKNOWN_ERROR'`)

4. **And** `webview-ui/src/lib/vscode-api.ts` wraps `postMessage` with type safety

5. **And** extension host has a message handler routing incoming webview messages

6. **And** a round-trip test message successfully passes from webview → extension → webview

---

## First Principles Design Decision

> **This is a "pattern" story, not a "content" story.**

### Key Insight from First Principles Analysis

Instead of defining ALL message types upfront (PR data, auth, AI features), this story establishes:

1. **Core infrastructure** - The typed wrapper and handler pattern
2. **Extensible pattern** - Easy to add new message types in future stories
3. **Minimal proof** - Just enough messages to prove round-trip works

### Why Minimal Contract

| Truth                                  | Implication                                                         |
| -------------------------------------- | ------------------------------------------------------------------- |
| postMessage is fire-and-forget         | No built-in request/response - we build correlation if needed later |
| TypeScript types are compile-time only | Runtime validation is separate concern (not MVP)                    |
| Future stories add their own messages  | Story 2.1 adds auth, Story 3.1 adds PR data                         |
| YAGNI principle                        | Don't build what we don't need yet                                  |

### Minimal Contract for This Story

```typescript
// src/shared/messages.ts - MINIMAL contract to prove pattern

type ErrorCode = 'UNKNOWN_ERROR'; // Extend in future stories

// Webview → Extension
export type WebviewMessage =
  | { type: 'ready' } // Webview loaded
  | { type: 'ping' }; // Round-trip test

// Extension → Webview
export type ExtensionMessage =
  | { type: 'pong' } // Response to ping
  | { type: 'error'; code: ErrorCode; message: string }; // Generic error
```

---

## Tasks / Subtasks

- [ ] **Task 1: Create shared message types** (AC: #1, #2, #3)
  - [ ] Create `src/shared/` directory
  - [ ] Create `src/shared/messages.ts` with `WebviewMessage` and `ExtensionMessage` types
  - [ ] Define `ErrorCode` type with `'UNKNOWN_ERROR'` as initial value
  - [ ] Add JSDoc comments explaining how to extend the contract
  - [ ] Verify kebab-case for message types, SCREAMING_SNAKE for error codes

- [ ] **Task 2: Create type-safe VS Code API wrapper for webview** (AC: #4)
  - [ ] Create `webview-ui/src/lib/` directory if not exists
  - [ ] Create `webview-ui/src/lib/vscode-api.ts`
  - [ ] Implement typed `postMessage` wrapper function
  - [ ] Implement typed message listener hook or utility
  - [ ] Export `vscode` API interface for webview use

- [ ] **Task 3: Create extension host message handler** (AC: #5)
  - [ ] Create `src/webview/message-handler.ts`
  - [ ] Implement message routing with exhaustive type checking
  - [ ] Handle `'ready'` message (log for now)
  - [ ] Handle `'ping'` message (respond with `'pong'`)
  - [ ] Wire handler into `DashboardPanel` from Story 1.2

- [ ] **Task 4: Implement round-trip test** (AC: #6)
  - [ ] Update webview App.tsx to send `'ping'` on button click
  - [ ] Display received `'pong'` response in UI
  - [ ] Add visual feedback showing message round-trip succeeded
  - [ ] Manual test: click button → see confirmation

- [ ] **Task 5: Configure TypeScript path sharing** (AC: #1)
  - [ ] Update root `tsconfig.json` to include shared types
  - [ ] Update `webview-ui/tsconfig.json` to reference shared types
  - [ ] Verify both extension and webview can import from `src/shared/`
  - [ ] Verify no duplicate type definitions

---

## Dev Notes

### Architecture Compliance (CRITICAL)

**From [architecture.md](../../_bmad-output/planning-artifacts/architecture.md):**

This story implements the **Webview ↔ Extension Message Contract** decision:

> **Decision:** Shared TypeScript interfaces in common types folder
> **Location:** `src/shared/messages.ts`

**Required Patterns:**

| Pattern              | Requirement              | Example                              |
| -------------------- | ------------------------ | ------------------------------------ |
| Message type strings | kebab-case               | `'ready'`, `'ping'`, `'pong'`        |
| Error codes          | SCREAMING_SNAKE          | `'UNKNOWN_ERROR'`, `'RATE_LIMITED'`  |
| File naming          | kebab-case for utilities | `messages.ts`, `vscode-api.ts`       |
| Type naming          | PascalCase               | `WebviewMessage`, `ExtensionMessage` |

**Architecture Boundary:**

```
┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│        Extension Host           │     │          Webview UI             │
│                                 │     │                                 │
│  src/webview/message-handler.ts │◄────┤►  webview-ui/src/lib/vscode-api.ts
│                                 │     │                                 │
│  imports: src/shared/messages.ts│     │  imports: src/shared/messages.ts│
└─────────────────────────────────┘     └─────────────────────────────────┘
                    │                                     │
                    └──────── Shared Type Contract ───────┘
                              src/shared/messages.ts
```

### Technical Requirements

**Message Contract Structure (from architecture.md):**

```typescript
// src/shared/messages.ts

/**
 * Error codes for extension → webview error messages.
 * Convention: SCREAMING_SNAKE_CASE
 * Add new codes as needed in future stories.
 */
export type ErrorCode = 'UNKNOWN_ERROR';

/**
 * Messages FROM webview TO extension.
 * Convention: kebab-case type strings
 *
 * To add a new message type:
 * 1. Add to this union type
 * 2. Add handler in src/webview/message-handler.ts
 */
export type WebviewMessage = { type: 'ready' } | { type: 'ping' };

/**
 * Messages FROM extension TO webview.
 * Convention: kebab-case type strings
 *
 * To add a new message type:
 * 1. Add to this union type
 * 2. Handle in webview-ui/src/lib/vscode-api.ts listener
 */
export type ExtensionMessage =
  | { type: 'pong' }
  | { type: 'error'; code: ErrorCode; message: string };
```

**VS Code API Wrapper (webview side):**

```typescript
// webview-ui/src/lib/vscode-api.ts

import type { WebviewMessage, ExtensionMessage } from '../../../src/shared/messages';

// Acquire VS Code API (only call once)
const vscode = acquireVsCodeApi();

/**
 * Send a typed message to the extension host.
 */
export function postMessage(message: WebviewMessage): void {
  vscode.postMessage(message);
}

/**
 * Subscribe to messages from the extension host.
 * Returns cleanup function.
 */
export function onMessage(callback: (message: ExtensionMessage) => void): () => void {
  const handler = (event: MessageEvent<ExtensionMessage>) => {
    callback(event.data);
  };
  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}
```

**Message Handler (extension side):**

```typescript
// src/webview/message-handler.ts

import * as vscode from 'vscode';
import type { WebviewMessage, ExtensionMessage } from '../shared/messages';

export function handleWebviewMessage(message: WebviewMessage, webview: vscode.Webview): void {
  switch (message.type) {
    case 'ready':
      console.log('Webview is ready');
      break;
    case 'ping':
      const response: ExtensionMessage = { type: 'pong' };
      webview.postMessage(response);
      break;
    default:
      // TypeScript exhaustive check
      const _exhaustive: never = message;
      console.warn('Unknown message type:', _exhaustive);
  }
}
```

### Project Structure After This Story

```
code-flow/
├── src/
│   ├── extension.ts                  # Entry point (no changes)
│   ├── shared/                       # NEW - Shared types
│   │   └── messages.ts               # NEW - Message contract
│   └── webview/
│       ├── dashboard-panel.ts        # MODIFY - Wire message handler
│       ├── webview-provider.ts       # No changes
│       └── message-handler.ts        # NEW - Route incoming messages
├── webview-ui/
│   └── src/
│       ├── App.tsx                   # MODIFY - Add ping/pong test UI
│       └── lib/
│           └── vscode-api.ts         # NEW - Type-safe postMessage
├── tsconfig.json                     # MODIFY - Include shared path
└── ... (existing files)
```

### TypeScript Configuration for Shared Types

**Root `tsconfig.json` update:**

```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["./src/shared/*"]
    }
  },
  "include": ["src/**/*"]
}
```

**`webview-ui/tsconfig.json` update:**

```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../src/shared/*"]
    }
  },
  "references": [{ "path": "../tsconfig.json" }]
}
```

**Alternative (simpler):** Use relative imports `../../../src/shared/messages` - works without config changes but less elegant.

### Previous Story Intelligence (Story 1.2)

**From Story 1.2 implementation:**

- `webview-ui/` directory exists with React + Vite + Tailwind
- `src/webview/dashboard-panel.ts` exists - needs message handler wiring
- `src/webview/webview-provider.ts` exists - generates HTML
- Extension command `codeflow.openDashboard` registered
- HMR development workflow configured

**Files from Story 1.2 that will be modified:**

| File                             | Change                                |
| -------------------------------- | ------------------------------------- |
| `src/webview/dashboard-panel.ts` | Wire `onDidReceiveMessage` to handler |
| `webview-ui/src/App.tsx`         | Add ping button and pong display      |

### Git Intelligence

**Recent commits:**

- `b12fb63` - 1-1 ready (Story 1.1 complete)
- `3c5c4a4` - update bmad
- `1c8bc49` - docs (#52)
- `e934283` - pivoting to vscode extension (#50)

**Current branch state:** Extension scaffold complete, webview-ui scaffolded (Story 1.2 in progress)

### Testing This Story

**Manual Round-Trip Test:**

1. Start webview dev server: `npm run dev:webview`
2. Press F5 to launch Extension Development Host
3. Run command "CodeFlow: Open Dashboard"
4. Click "Test Connection" button in webview
5. Verify "Connected!" message appears (proves pong received)

**Verification Checklist:**

- [ ] `src/shared/messages.ts` exports `WebviewMessage` and `ExtensionMessage`
- [ ] Message types use kebab-case (`'ready'`, `'ping'`, `'pong'`)
- [ ] Error codes use SCREAMING_SNAKE (`'UNKNOWN_ERROR'`)
- [ ] Webview can import from shared types without errors
- [ ] Extension can import from shared types without errors
- [ ] Ping message sent from webview reaches extension (check console)
- [ ] Pong message sent from extension reaches webview (check UI)
- [ ] TypeScript catches invalid message types at compile time

### Adding New Messages (Future Reference)

When a future story needs new messages (e.g., Story 2.1 Auth):

```typescript
// 1. Add to WebviewMessage union
export type WebviewMessage = { type: 'ready' } | { type: 'ping' } | { type: 'auth-request' }; // NEW

// 2. Add to ExtensionMessage union
export type ExtensionMessage =
  | { type: 'pong' }
  | { type: 'error'; code: ErrorCode; message: string }
  | { type: 'auth-status'; authenticated: boolean; username?: string }; // NEW

// 3. Add ErrorCode if needed
export type ErrorCode = 'UNKNOWN_ERROR' | 'AUTH_FAILED'; // EXTENDED

// 4. Handle in message-handler.ts switch statement
// 5. Handle in webview message listener
```

### References

- [Source: architecture.md#Webview ↔ Extension Message Contract](../../_bmad-output/planning-artifacts/architecture.md)
- [Source: architecture.md#Message Type Naming](../../_bmad-output/planning-artifacts/architecture.md)
- [Source: architecture.md#Error Handling Patterns](../../_bmad-output/planning-artifacts/architecture.md)
- [VS Code Webview API - Message Passing](https://code.visualstudio.com/api/extension-guides/webview#passing-messages-from-a-webview-to-an-extension)
- [TypeScript Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### Change Log

| Date       | Change                                               | Author                     |
| ---------- | ---------------------------------------------------- | -------------------------- |
| 2026-02-08 | Story created with First Principles analysis applied | SM Agent (Claude Opus 4.5) |

### File List

_Files to be created/modified by dev agent:_

```
code-flow/
├── src/
│   ├── shared/                       # NEW directory
│   │   └── messages.ts               # NEW - Message contract types
│   └── webview/
│       ├── dashboard-panel.ts        # MODIFY - Wire message handler
│       └── message-handler.ts        # NEW - Route incoming messages
├── webview-ui/
│   └── src/
│       ├── App.tsx                   # MODIFY - Add ping/pong test
│       └── lib/
│           └── vscode-api.ts         # NEW - Type-safe wrapper
├── tsconfig.json                     # MODIFY - Add shared paths (optional)
└── webview-ui/tsconfig.json          # MODIFY - Reference shared (optional)
```
