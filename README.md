# CodeFlow

A VS Code extension that brings pull request management directly into your editor. CodeFlow helps you track PRs across repositories with an intelligent, outcome-focused dashboard.

## Features

- **Four-Section Dashboard**: View PRs organized by action required
  - **Needs Review**: PRs assigned to you for review
  - **Returned to You**: Your PRs with feedback to address
  - **My PRs**: Track your PRs' merge progress
  - **Reviewed-Awaiting**: PRs you've reviewed, awaiting author action

- **In-Editor Experience**: No context switching - manage PRs without leaving VS Code
- **Real-Time Updates**: Stay informed with automatic PR status updates
- **Quick Actions**: One-click access to PRs on GitHub

## Getting Started

### Prerequisites

- VS Code 1.85.0 or higher
- A GitHub account with repository access

### Installation

1. Install dependencies:
```bash
npm install
```

2. Compile the extension:
```bash
npm run compile
```

3. Press F5 in VS Code to launch the extension in development mode

### Setup

1. Open the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Run `CodeFlow: Authenticate with GitHub`
3. Enter your GitHub Personal Access Token (PAT)
   - Create a PAT at https://github.com/settings/tokens
   - Required scopes: `repo`, `read:org`, `read:user`
4. Run `CodeFlow: Open Dashboard` to view your PRs

## Development

### Build

```bash
npm run compile
```

### Watch Mode

```bash
npm run watch
```

### Package Extension

```bash
npm run package
```

## Project Structure

```
src/
├── extension.ts          # Extension entry point
├── github/
│   ├── auth.ts          # GitHub authentication
│   └── client.ts        # GitHub API client
├── webview/
│   └── DashboardPanel.ts # Dashboard UI
└── types/
    └── index.ts         # TypeScript interfaces
```

## Commands

- `CodeFlow: Open Dashboard` - Open the CodeFlow dashboard
- `CodeFlow: Authenticate with GitHub` - Set up GitHub authentication
- `CodeFlow: Refresh PRs` - Manually refresh pull request data

## License

MIT
