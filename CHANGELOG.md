# Changelog

All notable changes to the CodeFlow extension will be documented in this file.

## [0.1.0] - 2026-01-29

### Added
- Initial POC release of CodeFlow VS Code extension
- GitHub authentication using Personal Access Token (PAT)
- Secure token storage with VS Code SecretStorage API
- Four-section dashboard with outcome-based PR categorization:
  - **Needs Review**: PRs assigned to you for review
  - **Returned to You**: Your PRs with changes requested
  - **My PRs**: All your open pull requests
  - **Reviewed-Awaiting**: PRs you've reviewed awaiting author action
- Pull request cards showing:
  - PR title and number
  - Repository owner/name
  - Author information
  - Time since last update
  - Comment counts
  - Review status badges
- One-click navigation to PRs on GitHub
- Manual refresh capability
- Automatic background polling every 60 seconds
- VS Code notifications for key events:
  - New review requests
  - Changes requested on your PRs
  - PR approvals
- Commands:
  - `CodeFlow: Open Dashboard` - Open the dashboard panel
  - `CodeFlow: Authenticate with GitHub` - Set up GitHub authentication
  - `CodeFlow: Refresh PRs` - Manually refresh PR data
- Comprehensive setup guide and documentation
- Launch configurations for extension development
- Build tooling with esbuild and TypeScript

### Technical Details
- Built with TypeScript 5.3.3
- Uses GitHub GraphQL API for efficient data fetching
- Webview-based UI with inline HTML/CSS/JavaScript
- Graceful error handling and fallbacks
- Rate limit aware with caching support

## Future Releases

### Planned Features
- Copilot SDK integration for AI-powered features:
  - AI Pre-Flight Status badges
  - One-Click AI Review triggers
  - Semantic Risk Labels
  - AI-generated PR summaries
- Enhanced filtering and sorting options
- Team dashboard view for managers
- Customizable notification preferences
- Support for multiple GitHub accounts
- Browser-based PR review capabilities
