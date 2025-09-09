# CodeFlow - MVP Product Specification Document

**Version:** 1.0

**Date:** October 26, 2023

**Status:** Approved for MVP Development

**1. Introduction**

- **1.1. Product Name:** CodeFlow
- **1.2. Overview:** CodeFlow is a web application designed as a centralized dashboard to provide individual developers with a clear, organized, and near real-time overview of their relevant Pull Request (PR) workflow. By categorizing PRs based on their status relative to the user, CodeFlow aims to streamline the code review process, reduce cognitive load, and help developers manage their PR-related tasks efficiently.
- **1.3. Purpose:** This document outlines the requirements, features, and specifications for the Minimum Viable Product (MVP) release of CodeFlow.

**2. Goals**

- **2.1. Project Goals (for the creator):**
  - Enhance knowledge and practical skills in web development (frontend, backend, API integration).
  - Create a compelling project for a personal portfolio.
  - Gain experience in defining, designing, and building a user-centered application.
- **2.2. Product Goals (MVP):**
  - Solve the core "signal vs. noise" problem for developers managing PRs.
  - Provide developers with immediate visibility into PRs requiring their action (review or updates).
  - Enable developers to easily track the status of PRs they have authored or reviewed.
  - Offer a clean, intuitive, and efficient user experience for managing personal PR workload.
- **2.3. Side Goal (Potential):**
  - If successful, create a stable version usable by the creator's team to improve their workflow.

**3. Target Audience**

- **3.1. Primary MVP Focus:** **Individual Software Developers** participating in code reviews within a team using Git-based platforms (starting with GitHub).
- **3.2. Secondary (Future):** Team Leads, Scrum Masters, Project Managers (requiring team-level views and metrics - *Deferred for post-MVP*).

**4. User Problems & Pain Points (Addressed by MVP)**

- **4.1. Information Overload:** Difficulty finding relevant PRs amidst high activity in repositories.
- **4.2. Identifying Actionable Items:** Wasting time determining which PRs specifically require *their* review or updates.
- **4.3. Tracking Submitted Work:** Uncertainty about the review status/progress of PRs they authored.
- **4.4. Following Up on Reviews:** Difficulty tracking PRs they reviewed that are awaiting action from the author.
- **4.5. Context Switching:** Needing to constantly navigate the source control platform's UI to piece together their PR landscape.

**5. MVP Scope**

- **5.1. In Scope:**
  - User Authentication (OAuth for GitHub initially).
  - Personalized Dashboard View displaying PRs relevant to the logged-in user.
  - Sections: Needs Your Review, Returned to You, My PRs - Awaiting Review.
  - Conditional Section: Reviewed - Awaiting Author (if API filtering proves straightforward).
  - Display essential PR data: ID, Title, Link, Author (Name + Avatar), Status Badge, Last Update Time, Changes (+/-), Comment Count (total).
  - Manual data refresh functionality.
  - Responsive design (desktop/laptop focused).
  - Basic Loading, Empty, and Error states.
- **5.2. Out of Scope (Deferred for Post-MVP):**
  - Team/Organization level views.
  - Performance metrics or historical reporting.
  - Advanced comment data (resolved/unresolved counts, commenter avatars).
  - Sections: "Approved," "Recently Merged".
  - Real-time updates (websockets, automatic polling).
  - Support for other platforms (GitLab, Bitbucket).
  - Advanced filtering, sorting, or searching within sections.
  - Complex comment-based status logic (if not easily achievable via API for MVP).
  - User settings/preferences.
  - Direct actions on PRs (e.g., approving/commenting within CodeFlow).
  - Secondary links (e.g., github.dev).

**6. Functional Requirements (MVP)**

- **6.1. Authentication:**
  - **FR-AUTH-01:** Users must be able to log in securely using their GitHub account via OAuth 2.0.
  - **FR-AUTH-02:** Application must securely store and manage user authentication tokens required for GitHub API calls.
  - **FR-AUTH-03:** A mechanism for user logout must be provided.
- **6.2. Dashboard:**
  - **FR-DASH-01:** Upon successful login, the user must be presented with their personalized dashboard view.
  - **FR-DASH-02:** The dashboard must fetch PR data from the connected GitHub account relevant *only* to the logged-in user.
  - **FR-DASH-03:** The dashboard must contain distinct sections for different PR categories (See 6.3).
  - **FR-DASH-04:** A manual "Refresh" button must be present to allow users to fetch the latest PR data on demand.
  - **FR-DASH-05:** While data is being fetched, appropriate loading indicators must be displayed within relevant sections.
  - **FR-DASH-06:** If a section contains no relevant PRs, a clear "Empty State" message must be displayed within that section.
  - **FR-DASH-07:** If fetching data fails, a user-friendly error message must be displayed with a potential retry option (via Refresh button).
- **6.3. Dashboard Sections & Logic:**
  - **FR-SEC-01: Needs Your Review**
    - Displays PRs where the logged-in user is an assigned reviewer and the PR is open and not yet approved by them.
    - Must differentiate between PRs needing a first review and those needing re-review after author updates (see FR-PRC-04 for badges).
  - **FR-SEC-02: Returned to You**
    - Displays PRs authored by the logged-in user where the status is "Changes Requested" (based on explicit GitHub status for MVP).
  - **FR-SEC-03: My PRs - Awaiting Review**
    - Displays PRs authored by the logged-in user that are open, not blocked ("Changes Requested"), and awaiting review/approval from others.
  - **FR-SEC-04: Reviewed - Awaiting Author (Conditional MVP)**
    - *Requirement:* Include only if GitHub API allows straightforward filtering for PRs where the logged-in user's review status is explicitly "Changes Requested".
    - Displays PRs where the logged-in user is a reviewer (not author) and their review status is "Changes Requested".
- **6.4. PR Card / Row Display:**
  - **FR-PRC-01:** Each PR within a section must be displayed as a distinct card or row.
  - **FR-PRC-02:** Each PR card must display the following data fetched from the API:
    - Author's Profile Picture (Avatar)
    - PR ID/Number
    - PR Title
    - Author's Username ("Opened by...")
    - Status Badge (See FR-PRC-04)
    - Total Comment Count (Simple numerical count)
    - Last Update Timestamp (human-readable relative time, e.g., "2 hours ago")
    - Code Changes Summary (+XX / -YY)
  - **FR-PRC-03:** Clicking anywhere on the main PR card/row area must open the corresponding PR page on GitHub in a new browser tab.
  - **FR-PRC-04: Status Badges:** Appropriate status badges must be displayed based on the section and PR state:
    - In Needs Your Review:
      - Needs Review (Amber): For PRs awaiting the user's first review action.
      - Needs Re-Review (Pink): For PRs where the author pushed commits *after* the user's last review action.
    - In Returned to You:
      - Changes Requested (Red): For PRs authored by the user marked as needing changes.
    - In My PRs - Awaiting Review:
      - Awaiting Review (Blue/Grey): For user's PRs waiting for others.
    - In Reviewed - Awaiting Author (If included):
      - Awaiting Author Action (Red): For PRs reviewed by the user where they requested changes.

**7. User Interface (UI) / User Experience (UX) Specifications**

- **7.1. Visual Design:** Clean, intuitive, professional aesthetic. Prioritize clarity and scannability.
- **7.2. Layout:** Desktop-first responsive layout. Sections organized vertically. PRs listed vertically within sections.
- **7.3. Reference Mockup:** The visual implementation should closely follow the provided HTML mockup (codeflow_mockup.html or equivalent visual spec) regarding layout, colors, typography, spacing, and component appearance.
- **7.4. Key UX Elements:**
  - **Readability:** Ensure sufficient contrast ratios, especially for text on colored badges. Use clear typography.
  - **Consistency:** Maintain consistent styling for interactive elements, spacing, and components across the application.
  - **Feedback:** Provide clear visual feedback for loading states, empty states, errors, and hover/click interactions.
  - **Efficiency:** Information should be presented concisely to allow quick scanning and identification of priority items.

**8. Non-Functional Requirements (MVP)**

- **8.1. Performance:** Dashboard loading should be reasonably fast. API calls should be optimized to fetch only necessary data. (No strict metrics for MVP, but should feel responsive).
- **8.2. Security:** Authentication via GitHub OAuth must be implemented securely. No sensitive credentials should be stored client-side. API interactions should use HTTPS.
- **8.3. Browser Compatibility:** Must function correctly on the latest versions of major desktop browsers (Chrome, Firefox, Safari, Edge).
- **8.4. Responsiveness:** Basic responsiveness to ensure usability on typical laptop/desktop screen sizes. Graceful degradation on smaller viewports is acceptable for MVP.

**9. Future Considerations (Post-MVP)**

- Team/Organization Views
- Enhanced Comment Integration (Resolved/Unresolved, Commenter Avatars)
- Additional Sections (Approved, Merged)
- Real-time Updates
- Support for GitLab, Bitbucket
- Advanced Filtering & Sorting
- User Preferences/Settings
- Performance Metrics & Reporting
- Direct PR Actions (Comments, Approvals - Requires careful scope consideration)
