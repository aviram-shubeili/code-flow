# Requirements

### Functional

1. **FR1:** The system must authenticate users via GitHub OAuth and securely access repository data for PR retrieval
2. **FR2:** The dashboard must automatically categorize PRs into four sections: "Needs Review" (assigned to user), "Returned to You" (user's PRs with feedback), "My PRs" (tracking merge progress), and "Reviewed-Awaiting" (PRs user reviewed, awaiting author action)
3. **FR3:** PR cards must display essential information including title, author, reviewers, current status, and comment count
4. **FR4:** The system must integrate with Microsoft Teams to send individual DM notifications for PR status changes and review outcomes
5. **FR5:** The platform must update PR status with intelligent polling that adapts to GitHub API rate limits, including exponential backoff and degraded service modes during rate limiting
6. **FR6:** Teams notifications must use structured outcome messaging templates like "APPROVED - ready to merge", "3 comments need addressing", or "Changes requested with blocking issues"
7. **FR7:** Users must be able to view and access GitHub PRs directly from dashboard cards
8. **FR8:** The system must handle GitHub API authentication with secure token management, including support for future enterprise SSO integration patterns
9. **FR9:** The dashboard must support multiple repository access per authenticated user
10. **FR10:** Teams integration must require individual user consent and proper Microsoft Graph API authentication
11. **FR11:** The system must provide graceful degradation when API rate limits are exceeded, displaying last known status with clear indicators of data freshness

### Non Functional

1. **NFR1:** Dashboard load time must be under 2 seconds for responsive user experience
2. **NFR2:** The system must support modern browsers (Chrome, Firefox, Safari, Edge) - last 2 versions
3. **NFR3:** Platform must handle GitHub API rate limits gracefully with exponential backoff, maintaining service availability even when throttled
4. **NFR4:** Teams integration must comply with Microsoft's security requirements and app approval process
5. **NFR5:** The system must maintain 99.5% uptime during business hours (9 AM - 6 PM local time)
6. **NFR6:** Database queries must complete within 500ms to support real-time dashboard updates
7. **NFR7:** The platform must be responsive and function effectively on desktop and tablet devices
8. **NFR8:** User data must be encrypted in transit and at rest, following enterprise security standards, with architecture supporting future SAML/SSO integration
9. **NFR9:** The system must support concurrent API load from teams of 5-50 members, calculated as: (team size × repositories × active PRs × polling frequency), with performance testing validated for peak morning usage (9-11 AM)
10. **NFR10:** AWS deployment must optimize for cost efficiency, targeting free-tier usage where feasible
11. **NFR11:** During peak collaboration hours (8-11 AM local time), the system must maintain acceptable performance despite increased GitHub API usage across all team members
12. **NFR12:** When GitHub API rate limits are reached, the system must continue operating with cached data and clearly indicate data staleness to users (maximum 15-minute-old data acceptable)
