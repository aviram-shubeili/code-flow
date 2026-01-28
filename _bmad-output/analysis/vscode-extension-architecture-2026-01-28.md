# CodeFlow VS Code Extension Architecture

**Date:** January 28, 2026  
**Status:** Architecture Decision Record  
**Supersedes:** Cloud-first approach from original PRD

---

## Decision Summary

CodeFlow will be built as a **VS Code Extension** instead of a cloud-deployed Next.js application. This decision enables:

- ✅ Zero friction setup (install extension → done)
- ✅ Always available (sidebar icon in VS Code)
- ✅ Enterprise compatible (PAT, no OAuth app approval)
- ✅ Copilot SDK ready (Node.js extension host)
- ✅ 85-90% code portability to cloud SaaS when needed

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    VS Code Extension                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          EXTENSION HOST (Node.js runtime)           │   │
│  │          ═══════════════════════════════            │   │
│  │  This IS your "backend"                             │   │
│  │  - GitHub API calls (Octokit)                       │   │
│  │  - Copilot SDK (future)                             │   │
│  │  - PR categorization logic                          │   │
│  │  - Message handlers (like API routes)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                         │ postMessage() / onDidReceiveMessage│
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          WEBVIEW (Browser sandbox)                  │   │
│  │          ═══════════════════════════                │   │
│  │  This is your "frontend"                            │   │
│  │  - React Dashboard                                  │   │
│  │  - PR Cards                                         │   │
│  │  - Category Tabs                                    │   │
│  │  - Tailwind CSS styling                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
code-flow/
├── .vscode/
│   ├── launch.json                 # Debug configurations
│   └── tasks.json                  # Build tasks
│
├── src/                            # Extension host (Node.js "backend")
│   ├── extension.ts                # Entry point, activation
│   ├── commands/                   # VS Code command handlers
│   │   └── index.ts
│   ├── views/                      # Webview providers
│   │   ├── DashboardViewProvider.ts    # Main dashboard webview
│   │   └── base/
│   │       └── WebviewBase.ts          # Shared webview utilities
│   ├── github/                     # GitHub integration
│   │   ├── api.ts                      # Octokit wrapper
│   │   ├── types.ts                    # PR, Review interfaces
│   │   └── categorize.ts               # PR categorization logic
│   ├── copilot/                    # Copilot SDK integration (Phase 2)
│   │   └── index.ts
│   ├── auth/                       # PAT management
│   │   └── tokenStore.ts
│   └── test/                       # Extension-level tests
│       ├── suite/
│       │   └── extension.test.ts
│       └── runTest.ts
│
├── webviews/                       # React frontend (browser)
│   ├── dashboard/                  # Main dashboard view
│   │   ├── index.tsx                   # Entry point
│   │   ├── App.tsx                     # Root component
│   │   └── index.css                   # Styles
│   ├── components/                 # Shared React components
│   │   ├── PRCard.tsx
│   │   ├── CategoryTabs.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ReviewerList.tsx
│   │   └── ui/                         # Base UI components
│   │       ├── Button.tsx
│   │       └── Spinner.tsx
│   ├── hooks/                      # React hooks
│   │   ├── useGitHubData.ts
│   │   └── useVSCodeApi.ts             # VS Code messaging hook
│   ├── context/                    # React context
│   │   └── DashboardContext.tsx
│   └── lib/                        # Shared utilities
│       ├── messaging.ts                # postMessage wrapper
│       └── formatters.ts               # Date, status formatters
│
├── resources/                      # Static assets
│   └── icons/
│       ├── codeflow.svg                # Activity bar icon
│       └── pr-states/
│
├── shared/                         # Code shared between extension & webview
│   └── types.ts                        # Message types, PR interfaces
│
├── scripts/                        # Build scripts
│   └── build-webview.ts
│
├── tests/                          # Test files
│   ├── unit/                           # Pure function tests (Vitest)
│   │   ├── categorize.test.ts
│   │   └── formatters.test.ts
│   ├── components/                     # React component tests
│   │   └── PRCard.test.tsx
│   └── integration/                    # Extension integration tests
│       └── dashboard.test.ts
│
├── package.json                    # Extension manifest + npm
├── tsconfig.json                   # TypeScript config (extension)
├── tsconfig.webview.json           # Webview-specific TS config
├── vite.config.ts                  # Webview bundler config
├── vitest.config.ts                # Test config
└── README.md
```

---

## Key Implementation Files

### 1. Extension Manifest (`package.json`)

```json
{
  "name": "codeflow",
  "displayName": "CodeFlow - PR Dashboard",
  "description": "Intelligent PR dashboard that eliminates notification noise",
  "version": "0.1.0",
  "publisher": "aviram-shubeili",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": ["Other"],
  "activationEvents": ["onStartupFinished"],
  "main": "./dist/extension.js",
  "contributes": {
    "viewsContainers": {
      "activitybar": [
        {
          "id": "codeflow",
          "title": "CodeFlow",
          "icon": "resources/icons/codeflow.svg"
        }
      ]
    },
    "views": {
      "codeflow": [
        {
          "type": "webview",
          "id": "codeflow.dashboard",
          "name": "PR Dashboard"
        }
      ]
    },
    "commands": [
      {
        "command": "codeflow.refresh",
        "title": "Refresh Dashboard",
        "icon": "$(refresh)"
      },
      {
        "command": "codeflow.configure",
        "title": "Configure CodeFlow"
      }
    ],
    "configuration": {
      "title": "CodeFlow",
      "properties": {
        "codeflow.githubToken": {
          "type": "string",
          "default": "",
          "description": "GitHub Personal Access Token",
          "scope": "application"
        },
        "codeflow.repositories": {
          "type": "array",
          "default": [],
          "description": "Repositories to track (owner/repo format)",
          "items": {
            "type": "string"
          }
        },
        "codeflow.refreshInterval": {
          "type": "number",
          "default": 300,
          "description": "Auto-refresh interval in seconds (0 to disable)"
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run build",
    "build": "npm run build:extension && npm run build:webview",
    "build:extension": "esbuild src/extension.ts --bundle --outfile=dist/extension.js --external:vscode --format=cjs --platform=node",
    "build:webview": "vite build",
    "watch": "concurrently \"npm run watch:extension\" \"npm run watch:webview\"",
    "watch:extension": "esbuild src/extension.ts --bundle --outfile=dist/extension.js --external:vscode --format=cjs --platform=node --watch",
    "watch:webview": "vite build --watch",
    "test": "vitest",
    "test:extension": "node ./dist/test/runTest.js",
    "lint": "eslint src webviews",
    "package": "vsce package",
    "publish": "vsce publish"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/vscode": "^1.85.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vscode/test-electron": "^2.3.8",
    "@vscode/vsce": "^2.22.0",
    "@vitejs/plugin-react": "^4.2.0",
    "concurrently": "^8.0.0",
    "esbuild": "^0.19.0",
    "eslint": "^8.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "dependencies": {
    "@octokit/rest": "^20.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

---

### 2. Extension Entry Point (`src/extension.ts`)

```typescript
import * as vscode from 'vscode';
import { DashboardViewProvider } from './views/DashboardViewProvider';
import { GitHubAPI } from './github/api';
import { TokenStore } from './auth/tokenStore';

let dashboardProvider: DashboardViewProvider | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('CodeFlow extension activated');

  // Initialize token store and GitHub API
  const tokenStore = new TokenStore(context);
  const githubApi = new GitHubAPI(tokenStore);

  // Register dashboard view provider
  dashboardProvider = new DashboardViewProvider(
    context.extensionUri,
    githubApi
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'codeflow.dashboard',
      dashboardProvider,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
      }
    )
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('codeflow.refresh', () => {
      dashboardProvider?.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codeflow.configure', () => {
      vscode.commands.executeCommand(
        'workbench.action.openSettings',
        'codeflow'
      );
    })
  );

  // Watch for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('codeflow')) {
        dashboardProvider?.onConfigurationChanged();
      }
    })
  );

  // Set up auto-refresh
  const refreshInterval = vscode.workspace
    .getConfiguration('codeflow')
    .get<number>('refreshInterval', 300);

  if (refreshInterval > 0) {
    const intervalId = setInterval(() => {
      dashboardProvider?.refresh();
    }, refreshInterval * 1000);

    context.subscriptions.push({
      dispose: () => clearInterval(intervalId),
    });
  }
}

export function deactivate() {
  dashboardProvider = undefined;
}
```

---

### 3. Dashboard View Provider (`src/views/DashboardViewProvider.ts`)

```typescript
import * as vscode from 'vscode';
import { GitHubAPI } from '../github/api';
import { categorizePRs } from '../github/categorize';
import type { Message } from '../../shared/types';

export class DashboardViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'codeflow.dashboard';

  private _view?: vscode.WebviewView;
  private _isRefreshing = false;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _githubApi: GitHubAPI
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void | Thenable<void> {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'dist'),
        vscode.Uri.joinPath(this._extensionUri, 'resources'),
      ],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from webview
    this._setWebviewMessageListener(webviewView.webview);

    // Refresh when view becomes visible
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        this.refresh();
      }
    });
  }

  public async refresh(): Promise<void> {
    if (this._isRefreshing || !this._view) {
      return;
    }

    this._isRefreshing = true;

    try {
      this._view.webview.postMessage({ command: 'loading' });

      const prs = await this._githubApi.getAssignedPRs();
      const categorized = categorizePRs(prs, this._githubApi.currentUser);

      this._view.webview.postMessage({
        command: 'prsData',
        data: categorized,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      this._view.webview.postMessage({
        command: 'error',
        data: { message },
      });

      // Show error notification for auth issues
      if (message.includes('token') || message.includes('401')) {
        const action = await vscode.window.showErrorMessage(
          'CodeFlow: GitHub authentication failed. Please check your token.',
          'Configure'
        );
        if (action === 'Configure') {
          vscode.commands.executeCommand('codeflow.configure');
        }
      }
    } finally {
      this._isRefreshing = false;
    }
  }

  public onConfigurationChanged(): void {
    this._githubApi.refreshConfiguration();
    this.refresh();
  }

  private _setWebviewMessageListener(webview: vscode.Webview): void {
    webview.onDidReceiveMessage(async (message: Message) => {
      switch (message.command) {
        case 'ready':
          await this.refresh();
          break;

        case 'refresh':
          await this.refresh();
          break;

        case 'openPR':
          if (message.args?.url) {
            vscode.env.openExternal(vscode.Uri.parse(message.args.url));
          }
          break;

        case 'openFile':
          if (message.args?.path) {
            const uri = vscode.Uri.file(message.args.path);
            vscode.window.showTextDocument(uri);
          }
          break;

        case 'copyToClipboard':
          if (message.args?.text) {
            vscode.env.clipboard.writeText(message.args.text);
            vscode.window.showInformationMessage('Copied to clipboard');
          }
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'dashboard.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'dashboard.css')
    );

    const nonce = this._getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" 
        content="default-src 'none'; 
                 style-src ${webview.cspSource} 'unsafe-inline'; 
                 script-src 'nonce-${nonce}';
                 img-src ${webview.cspSource} https:;
                 font-src ${webview.cspSource};">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${styleUri}" rel="stylesheet">
  <title>CodeFlow Dashboard</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  private _getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
```

---

### 4. GitHub API Wrapper (`src/github/api.ts`)

```typescript
import { Octokit } from '@octokit/rest';
import * as vscode from 'vscode';
import { TokenStore } from '../auth/tokenStore';
import type { PR } from '../../shared/types';

export class GitHubAPI {
  private _octokit: Octokit | null = null;
  private _currentUser: string | null = null;

  constructor(private readonly _tokenStore: TokenStore) {
    this.refreshConfiguration();
  }

  public get currentUser(): string | null {
    return this._currentUser;
  }

  public refreshConfiguration(): void {
    const token = this._tokenStore.getToken();
    
    if (token) {
      this._octokit = new Octokit({ auth: token });
      this._fetchCurrentUser();
    } else {
      this._octokit = null;
      this._currentUser = null;
    }
  }

  private async _fetchCurrentUser(): Promise<void> {
    if (!this._octokit) return;

    try {
      const { data } = await this._octokit.users.getAuthenticated();
      this._currentUser = data.login;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      this._currentUser = null;
    }
  }

  public async getAssignedPRs(): Promise<PR[]> {
    if (!this._octokit) {
      throw new Error('GitHub token not configured. Please add your token in settings.');
    }

    const config = vscode.workspace.getConfiguration('codeflow');
    const repositories = config.get<string[]>('repositories', []);

    if (repositories.length === 0) {
      // If no repos configured, search across all accessible repos
      return this._searchAllPRs();
    }

    // Fetch PRs from configured repositories
    const allPRs: PR[] = [];

    for (const repo of repositories) {
      const [owner, name] = repo.split('/');
      if (!owner || !name) continue;

      try {
        const prs = await this._fetchRepoPRs(owner, name);
        allPRs.push(...prs);
      } catch (error) {
        console.error(`Failed to fetch PRs from ${repo}:`, error);
      }
    }

    return allPRs;
  }

  private async _fetchRepoPRs(owner: string, repo: string): Promise<PR[]> {
    if (!this._octokit) return [];

    const { data: pulls } = await this._octokit.pulls.list({
      owner,
      repo,
      state: 'open',
      per_page: 100,
    });

    // Fetch reviews for each PR
    const prsWithReviews = await Promise.all(
      pulls.map(async (pull) => {
        const { data: reviews } = await this._octokit!.pulls.listReviews({
          owner,
          repo,
          pull_number: pull.number,
        });

        return this._mapToPR(pull, owner, repo, reviews);
      })
    );

    return prsWithReviews;
  }

  private async _searchAllPRs(): Promise<PR[]> {
    if (!this._octokit || !this._currentUser) return [];

    // Search for PRs involving the current user
    const queries = [
      `is:pr is:open review-requested:${this._currentUser}`,
      `is:pr is:open author:${this._currentUser}`,
      `is:pr is:open reviewed-by:${this._currentUser}`,
      `is:pr is:open assignee:${this._currentUser}`,
    ];

    const allPRs: PR[] = [];
    const seenIds = new Set<number>();

    for (const query of queries) {
      try {
        const { data } = await this._octokit.search.issuesAndPullRequests({
          q: query,
          per_page: 50,
          sort: 'updated',
          order: 'desc',
        });

        for (const item of data.items) {
          if (seenIds.has(item.id)) continue;
          seenIds.add(item.id);

          // Extract owner/repo from URL
          const match = item.repository_url.match(/repos\/([^/]+)\/([^/]+)/);
          if (!match) continue;

          const [, owner, repo] = match;

          // Fetch full PR data with reviews
          const { data: pull } = await this._octokit.pulls.get({
            owner,
            repo,
            pull_number: item.number,
          });

          const { data: reviews } = await this._octokit.pulls.listReviews({
            owner,
            repo,
            pull_number: item.number,
          });

          allPRs.push(this._mapToPR(pull, owner, repo, reviews));
        }
      } catch (error) {
        console.error(`Search query failed: ${query}`, error);
      }
    }

    return allPRs;
  }

  private _mapToPR(
    pull: any,
    owner: string,
    repo: string,
    reviews: any[]
  ): PR {
    return {
      id: pull.id,
      number: pull.number,
      title: pull.title,
      url: pull.html_url,
      author: {
        login: pull.user.login,
        avatarUrl: pull.user.avatar_url,
      },
      repository: {
        owner,
        name: repo,
      },
      state: pull.merged ? 'merged' : pull.state,
      draft: pull.draft,
      reviewDecision: this._calculateReviewDecision(reviews),
      reviews: reviews.map((r) => ({
        author: r.user.login,
        state: r.state,
        submittedAt: r.submitted_at,
      })),
      requestedReviewers: pull.requested_reviewers.map((r: any) => r.login),
      comments: pull.comments + pull.review_comments,
      additions: pull.additions,
      deletions: pull.deletions,
      createdAt: pull.created_at,
      updatedAt: pull.updated_at,
    };
  }

  private _calculateReviewDecision(reviews: any[]): PR['reviewDecision'] {
    const latestByUser = new Map<string, string>();

    for (const review of reviews) {
      if (review.state === 'COMMENTED') continue;
      latestByUser.set(review.user.login, review.state);
    }

    const states = Array.from(latestByUser.values());

    if (states.includes('CHANGES_REQUESTED')) {
      return 'CHANGES_REQUESTED';
    }
    if (states.length > 0 && states.every((s) => s === 'APPROVED')) {
      return 'APPROVED';
    }
    return 'REVIEW_REQUIRED';
  }
}
```

---

### 5. PR Categorization Logic (`src/github/categorize.ts`)

```typescript
import type { PR, CategorizedPRs } from '../../shared/types';

export function categorizePRs(prs: PR[], currentUser: string | null): CategorizedPRs {
  const result: CategorizedPRs = {
    needsReview: [],
    returnedToYou: [],
    myPRs: [],
    reviewedAwaiting: [],
  };

  if (!currentUser) {
    return result;
  }

  for (const pr of prs) {
    const category = categorizeSinglePR(pr, currentUser);
    result[category].push(pr);
  }

  // Sort each category by updated date (most recent first)
  for (const category of Object.keys(result) as (keyof CategorizedPRs)[]) {
    result[category].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  return result;
}

function categorizeSinglePR(pr: PR, currentUser: string): keyof CategorizedPRs {
  const isAuthor = pr.author.login === currentUser;
  const isRequestedReviewer = pr.requestedReviewers?.includes(currentUser) ?? false;
  const hasReviewed = pr.reviews.some((r) => r.author === currentUser);

  // PRs you authored
  if (isAuthor) {
    // Check if there's feedback that needs addressing
    const hasChangesRequested = pr.reviewDecision === 'CHANGES_REQUESTED';
    const hasNewComments = hasUnaddressedFeedback(pr, currentUser);

    if (hasChangesRequested || hasNewComments) {
      return 'returnedToYou';
    }

    return 'myPRs';
  }

  // PRs where you're requested as reviewer
  if (isRequestedReviewer) {
    return 'needsReview';
  }

  // PRs you've already reviewed
  if (hasReviewed) {
    return 'reviewedAwaiting';
  }

  // Default: needs review (assigned or mentioned)
  return 'needsReview';
}

function hasUnaddressedFeedback(pr: PR, currentUser: string): boolean {
  // Find the latest activity from the author
  const authorActivity = pr.reviews
    .filter((r) => r.author === currentUser)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];

  if (!authorActivity) {
    return false;
  }

  // Check if there are reviews after the author's last activity
  const authorActivityTime = new Date(authorActivity.submittedAt).getTime();
  
  return pr.reviews.some(
    (r) =>
      r.author !== currentUser &&
      new Date(r.submittedAt).getTime() > authorActivityTime
  );
}
```

---

### 6. Shared Types (`shared/types.ts`)

```typescript
// ============================================
// Message Types (Extension <-> Webview)
// ============================================

export interface Message {
  command: string;
  args?: Record<string, unknown>;
  data?: unknown;
}

// ============================================
// PR Data Types
// ============================================

export interface PR {
  id: number;
  number: number;
  title: string;
  url: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  repository: {
    owner: string;
    name: string;
  };
  state: 'open' | 'closed' | 'merged';
  draft: boolean;
  reviewDecision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED' | null;
  reviews: Review[];
  requestedReviewers?: string[];
  comments: number;
  additions: number;
  deletions: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  author: string;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'PENDING' | 'DISMISSED';
  submittedAt: string;
}

// ============================================
// Dashboard Categories
// ============================================

export type PRCategory =
  | 'needsReview'      // PRs assigned to you for review
  | 'returnedToYou'    // Your PRs with feedback
  | 'myPRs'            // Your open PRs
  | 'reviewedAwaiting'; // PRs you reviewed, awaiting author

export interface CategorizedPRs {
  needsReview: PR[];
  returnedToYou: PR[];
  myPRs: PR[];
  reviewedAwaiting: PR[];
}

export const CategoryLabels: Record<PRCategory, string> = {
  needsReview: 'Needs Review',
  returnedToYou: 'Returned to You',
  myPRs: 'My PRs',
  reviewedAwaiting: 'Reviewed & Awaiting',
};

export const CategoryDescriptions: Record<PRCategory, string> = {
  needsReview: 'PRs waiting for your review',
  returnedToYou: 'Your PRs with new feedback',
  myPRs: 'Your open pull requests',
  reviewedAwaiting: 'PRs you reviewed, waiting for author',
};
```

---

### 7. React Dashboard App (`webviews/dashboard/App.tsx`)

```tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useVSCodeApi } from '../hooks/useVSCodeApi';
import { CategoryTabs } from '../components/CategoryTabs';
import { PRCard } from '../components/PRCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/ui/Spinner';
import type { CategorizedPRs, PRCategory, Message } from '../../shared/types';
import './App.css';

export function App() {
  const vscode = useVSCodeApi();
  const [prs, setPRs] = useState<CategorizedPRs | null>(null);
  const [activeCategory, setActiveCategory] = useState<PRCategory>('needsReview');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleRefresh = useCallback(() => {
    vscode.postMessage({ command: 'refresh' });
  }, [vscode]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<Message>) => {
      const message = event.data;
      
      switch (message.command) {
        case 'prsData':
          setPRs(message.data as CategorizedPRs);
          setError(null);
          setLoading(false);
          break;
          
        case 'loading':
          setLoading(true);
          break;
          
        case 'error':
          setError((message.data as { message: string }).message);
          setLoading(false);
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    // Signal ready to extension
    vscode.postMessage({ command: 'ready' });

    return () => window.removeEventListener('message', handleMessage);
  }, [vscode]);

  const handleOpenPR = useCallback(
    (url: string) => {
      vscode.postMessage({ command: 'openPR', args: { url } });
    },
    [vscode]
  );

  if (error) {
    return (
      <div className="dashboard error-state">
        <div className="error-message">
          <span className="codicon codicon-error" />
          <p>{error}</p>
          <button onClick={handleRefresh}>Retry</button>
        </div>
      </div>
    );
  }

  const currentPRs = prs?.[activeCategory] ?? [];
  const counts = prs
    ? {
        needsReview: prs.needsReview.length,
        returnedToYou: prs.returnedToYou.length,
        myPRs: prs.myPRs.length,
        reviewedAwaiting: prs.reviewedAwaiting.length,
      }
    : { needsReview: 0, returnedToYou: 0, myPRs: 0, reviewedAwaiting: 0 };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          counts={counts}
        />
        <button
          className="refresh-button"
          onClick={handleRefresh}
          disabled={loading}
          title="Refresh"
        >
          <span className={`codicon codicon-refresh ${loading ? 'spin' : ''}`} />
        </button>
      </header>

      <main className="dashboard-content">
        {loading && !prs ? (
          <LoadingSpinner />
        ) : currentPRs.length === 0 ? (
          <EmptyState category={activeCategory} />
        ) : (
          <ul className="pr-list">
            {currentPRs.map((pr) => (
              <li key={pr.id}>
                <PRCard pr={pr} onOpen={() => handleOpenPR(pr.url)} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
```

---

### 8. VS Code API Hook (`webviews/hooks/useVSCodeApi.ts`)

```typescript
import { useMemo } from 'react';
import type { Message } from '../../shared/types';

interface VSCodeApi {
  postMessage: (message: Message) => void;
  getState: <T>() => T | undefined;
  setState: <T>(state: T) => void;
}

declare function acquireVsCodeApi(): VSCodeApi;

// Singleton to prevent multiple acquisitions
let cachedApi: VSCodeApi | undefined;

export function useVSCodeApi(): VSCodeApi {
  return useMemo(() => {
    if (!cachedApi) {
      cachedApi = acquireVsCodeApi();
    }
    return cachedApi;
  }, []);
}

// Utility for non-hook contexts
export function getVSCodeApi(): VSCodeApi {
  if (!cachedApi) {
    cachedApi = acquireVsCodeApi();
  }
  return cachedApi;
}
```

---

### 9. Vite Config for Webview (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/webview',
    rollupOptions: {
      input: {
        dashboard: resolve(__dirname, 'webviews/dashboard/index.tsx'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    sourcemap: true,
    // Don't minify for easier debugging in extension host
    minify: false,
  },
  define: {
    // Prevent React from using process.env
    'process.env': {},
  },
});
```

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// tests/unit/categorize.test.ts
import { describe, it, expect } from 'vitest';
import { categorizePRs } from '../../src/github/categorize';
import type { PR } from '../../shared/types';

describe('categorizePRs', () => {
  const currentUser = 'aviram';

  it('puts PRs where user is requested reviewer in needsReview', () => {
    const pr: PR = {
      id: 1,
      number: 100,
      title: 'Test PR',
      url: 'https://github.com/test/repo/pull/100',
      author: { login: 'other-user', avatarUrl: '' },
      repository: { owner: 'test', name: 'repo' },
      state: 'open',
      draft: false,
      reviewDecision: 'REVIEW_REQUIRED',
      reviews: [],
      requestedReviewers: ['aviram'],
      comments: 0,
      additions: 10,
      deletions: 5,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const result = categorizePRs([pr], currentUser);
    
    expect(result.needsReview).toHaveLength(1);
    expect(result.needsReview[0].id).toBe(1);
  });

  it('puts user-authored PRs with changes requested in returnedToYou', () => {
    const pr: PR = {
      id: 2,
      number: 101,
      title: 'My PR',
      url: 'https://github.com/test/repo/pull/101',
      author: { login: 'aviram', avatarUrl: '' },
      repository: { owner: 'test', name: 'repo' },
      state: 'open',
      draft: false,
      reviewDecision: 'CHANGES_REQUESTED',
      reviews: [
        { author: 'reviewer', state: 'CHANGES_REQUESTED', submittedAt: '2026-01-02T00:00:00Z' },
      ],
      requestedReviewers: [],
      comments: 2,
      additions: 50,
      deletions: 10,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    };

    const result = categorizePRs([pr], currentUser);
    
    expect(result.returnedToYou).toHaveLength(1);
    expect(result.myPRs).toHaveLength(0);
  });
});
```

### Extension Integration Tests

```typescript
// src/test/suite/extension.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('CodeFlow Extension', () => {
  vscode.window.showInformationMessage('Starting CodeFlow tests');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('aviram-shubeili.codeflow'));
  });

  test('Extension should activate', async () => {
    const ext = vscode.extensions.getExtension('aviram-shubeili.codeflow');
    await ext?.activate();
    assert.ok(ext?.isActive);
  });

  test('Dashboard view should be registered', async () => {
    // Wait for extension activation
    await vscode.extensions.getExtension('aviram-shubeili.codeflow')?.activate();
    
    // Check if view is available
    const view = vscode.window.registerWebviewViewProvider;
    assert.ok(view);
  });

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    
    assert.ok(commands.includes('codeflow.refresh'));
    assert.ok(commands.includes('codeflow.configure'));
  });
});
```

---

## Cloud Migration Checklist

When ready to deploy as SaaS:

| Step | From (Extension) | To (Next.js) | Effort |
|------|------------------|--------------|--------|
| 1 | `webviews/components/*` | `app/components/*` | Copy directly |
| 2 | `webviews/hooks/useVSCodeApi.ts` | `hooks/useFetch.ts` | Rewrite (simple) |
| 3 | `src/github/*` | `lib/github/*` | Copy directly |
| 4 | `shared/types.ts` | `types/*` | Copy directly |
| 5 | `src/views/*Provider.ts` | `app/api/*` | Rewrite as REST |
| 6 | PAT in settings | OAuth + Auth.js | New implementation |
| 7 | — | PostgreSQL + Prisma | New implementation |

**Estimated total effort:** 1-2 weeks

---

## Next Steps

1. [ ] Scaffold extension project structure
2. [ ] Configure build tooling (esbuild + Vite)
3. [ ] Implement PAT storage and GitHub API wrapper
4. [ ] Build PR categorization logic with tests
5. [ ] Create React dashboard components
6. [ ] Test in Extension Development Host (F5)
7. [ ] Add auto-refresh functionality
8. [ ] Publish to VS Code Marketplace

---

## Reference Implementation

Study: **[microsoft/vscode-pull-request-github](https://github.com/microsoft/vscode-pull-request-github)**

This is Microsoft's official GitHub PR extension — essentially what CodeFlow aims to simplify and enhance with the four-category dashboard approach.
