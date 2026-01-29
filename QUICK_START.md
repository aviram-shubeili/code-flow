# CodeFlow Quick Start Guide

Get started with CodeFlow in under 5 minutes!

## Step 1: Install the Extension

### From Source (Development)
1. Clone the repository
2. Run `npm install`
3. Press F5 in VS Code to launch in development mode

### From VSIX (Once published)
1. Download the .vsix file
2. In VS Code, run "Extensions: Install from VSIX..." from Command Palette
3. Select the downloaded file

## Step 2: Create a GitHub Token

1. Visit [GitHub Settings > Tokens](https://github.com/settings/tokens/new)
2. Click "Generate new token (classic)"
3. Give it a name: **CodeFlow Extension**
4. Select these scopes:
   - ✅ `repo` - Full control of private repositories
   - ✅ `read:org` - Read org membership
   - ✅ `read:user` - Read user profile
5. Click "Generate token"
6. **Copy the token immediately!** You won't see it again

## Step 3: Authenticate

1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Type: **CodeFlow: Authenticate with GitHub**
3. Paste your token
4. Press Enter

✅ Your token is now securely stored!

## Step 4: Open the Dashboard

1. Open Command Palette
2. Type: **CodeFlow: Open Dashboard**
3. The dashboard will load your PRs automatically

## Understanding Your Dashboard

### 📋 Needs Review
PRs where you've been requested as a reviewer. These need your attention!

**Action**: Click to open on GitHub and review

### 🔄 Returned to You
Your PRs where reviewers have requested changes.

**Action**: Address the feedback and push your updates

### 📝 My PRs
All your open pull requests across repositories.

**Action**: Monitor progress, check for approvals, merge when ready

### ✅ Reviewed-Awaiting
PRs you've reviewed that are still open, waiting for author action.

**Action**: Follow up if needed

## Daily Workflow

1. **Morning Check**: Open CodeFlow to see overnight updates
2. **Review PRs**: Handle items in "Needs Review"
3. **Address Feedback**: Work on "Returned to You" items
4. **Track Progress**: Monitor "My PRs" status
5. **Follow Up**: Check "Reviewed-Awaiting" if needed

## Tips & Tricks

- **Automatic Updates**: Dashboard refreshes every 60 seconds
- **Notifications**: Get alerts for new reviews, changes, and approvals
- **Quick Access**: Click any PR card to open on GitHub
- **Manual Refresh**: Use the Refresh button for immediate updates
- **Time Indicators**: See how long since each PR was updated

## Troubleshooting

### No PRs showing?
- Check you have open PRs or review requests
- Verify your GitHub token is valid
- Try the Refresh button

### "Not authenticated" error?
- Re-run `CodeFlow: Authenticate with GitHub`
- Create a new token if yours expired
- Verify token has correct scopes

### Dashboard won't load?
- Check internet connection
- Verify GitHub API is accessible
- Check VS Code Developer Console for errors

## Next Steps

- Read the full [Setup Guide](docs/setup-guide.md) for advanced configuration
- Check the [README](README.md) for development information
- Report issues on [GitHub](https://github.com/aviram-shubeili/code-flow/issues)

---

**Happy reviewing! 🚀**
