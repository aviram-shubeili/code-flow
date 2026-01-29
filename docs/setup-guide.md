# CodeFlow Setup Guide

This guide will help you set up CodeFlow and start managing your pull requests inside VS Code.

## Prerequisites

- VS Code version 1.85.0 or higher
- A GitHub account with access to repositories
- GitHub Personal Access Token (PAT)

## Step 1: Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give your token a descriptive name (e.g., "CodeFlow Extension")
4. Select the following scopes:
   - ✅ **repo** (Full control of private repositories)
   - ✅ **read:org** (Read org and team membership)
   - ✅ **read:user** (Read user profile data)
5. Click "Generate token"
6. **Important**: Copy the token immediately - you won't be able to see it again!

## Step 2: Install and Authenticate

1. Install the CodeFlow extension (if not already installed)
2. Open the Command Palette:
   - Mac: `Cmd+Shift+P`
   - Windows/Linux: `Ctrl+Shift+P`
3. Type and select: `CodeFlow: Authenticate with GitHub`
4. Paste your GitHub Personal Access Token when prompted
5. Press Enter

Your token is securely stored using VS Code's SecretStorage API.

## Step 3: Open the Dashboard

1. Open the Command Palette again
2. Type and select: `CodeFlow: Open Dashboard`
3. The dashboard will load and display your pull requests

## Using the Dashboard

The dashboard is organized into four sections:

### 📋 Needs Review
Pull requests where you've been requested as a reviewer. These require your attention.

### 🔄 Returned to You
Your pull requests where reviewers have requested changes. Time to address feedback!

### 📝 My PRs
All your open pull requests. Track their progress toward merging.

### ✅ Reviewed-Awaiting
Pull requests you've reviewed that are still awaiting author action.

## Quick Actions

- **Click any PR card** to open it on GitHub in your browser
- **Use the Refresh button** to manually update the dashboard
- **Auto-refresh**: The dashboard automatically refreshes every 60 seconds

## Troubleshooting

### Dashboard shows "Not authenticated"
- Run `CodeFlow: Authenticate with GitHub` again
- Verify your PAT has the correct scopes (repo, read:org, read:user)
- Check that your PAT hasn't expired

### No pull requests showing up
- Ensure you have open PRs in repositories you have access to
- Check that you're assigned as a reviewer on some PRs
- Try clicking the Refresh button
- Verify your GitHub token has access to the repositories

### Rate Limiting
GitHub API has rate limits. If you hit the limit:
- Wait for the rate limit to reset (usually within an hour)
- The dashboard will automatically retry
- Consider reducing the refresh frequency

### Dashboard won't load
- Check your internet connection
- Verify your GitHub token is still valid
- Check the VS Code Developer Console for errors:
  - Menu: Help > Toggle Developer Tools
  - Look for errors in the Console tab

## PAT Security

Your GitHub Personal Access Token is:
- Stored securely using VS Code's SecretStorage API
- Never transmitted except to GitHub's API
- Never logged or displayed in plain text
- Only accessible by the CodeFlow extension

To revoke access:
- Delete your token from [GitHub Settings > Tokens](https://github.com/settings/tokens)
- The extension will prompt you to re-authenticate

## Support

For issues or feature requests, please visit:
https://github.com/aviram-shubeili/code-flow/issues
