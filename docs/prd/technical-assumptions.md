# Technical Assumptions

### Repository Structure
**Monorepo**: Single repository structure for rapid MVP development and simplified deployment pipeline, designed with clear module separation to enable future microservices migration if needed.

### Service Architecture
**Monolithic with Serverless Functions**: Next.js application deployed as serverless functions on AWS Lambda for API routes, with static assets served via S3/CloudFront. This approach optimizes for development speed while maintaining cost efficiency and automatic scaling.

### Testing Requirements
**Unit + Integration Testing**: Comprehensive testing strategy including Vitest unit tests for business logic, API integration tests for GitHub/Teams connectivity, and Playwright end-to-end tests for critical dashboard workflows. Manual testing required for Teams integration approval process.

### Additional Technical Assumptions and Requests

**Technology Stack:**
- **Full-Stack Framework**: Next.js 14+ with TypeScript for unified frontend/backend development
- **Database**: PostgreSQL on AWS RDS for user data and PR state caching
- **Authentication**: NextAuth.js for GitHub OAuth integration with session management
- **Teams Integration**: Microsoft Graph SDK for Teams bot functionality and direct messaging
- **Hosting**: Serverless AWS deployment leveraging free tier limits where possible

**Integration Requirements:**
- **GitHub API**: GraphQL API v4 for efficient PR data retrieval with custom queries to minimize API calls
- **Microsoft Graph API**: Bot framework integration for Teams messaging, requiring Microsoft Partner approval process
- **Rate Limiting Strategy**: GraphQL query optimization with exponential backoff and intelligent batching to maximize efficiency

**Security and Compliance:**
- **Token Management**: Secure storage of GitHub and Microsoft tokens with automatic refresh capabilities
- **Enterprise Readiness**: Architecture designed to support future SAML/SSO integration without major refactoring
- **Data Privacy**: GDPR-compliant data handling with user data deletion capabilities

**Performance Optimization:**
- **Simple Caching**: Browser caching for static assets, database-level caching for PR data
- **Database Optimization**: Basic indexed queries for PR lookups
- **Monitoring**: Basic application logging with alerts for API rate limit approaches
