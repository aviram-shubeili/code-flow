# Comprehensive Architectural and Technical Decisions Summary

This document outlines the technical blueprint for the Minimum Viable Product (MVP) release of CodeFlow, balancing the project's learning and portfolio goals with the product's functional requirements and technical considerations.

**1. Project & Product Goals:**

- **Project Goals:** Enhance web development skills (frontend, backend, API integration), build a modern portfolio project, gain experience in application design and implementation.
- **MVP Product Goals (Based on Product Specification Document):** Solve the "signal vs. noise" problem for PRs, provide immediate visibility into actionable PRs, enable tracking of authored/reviewed PRs, offer a clean and efficient personal PR dashboard.
- **Side Goal:** Potentially create a useful tool for your team.

**2. Core Technology Stack:**

- **Frontend:** React with **Next.js**, utilizing **TypeScript**. Chosen for modern development experience, routing capabilities, and strong industry adoption.
- **Backend API:** **Node.js** runtime logic using **TypeScript**, implemented within **Next.js API Routes**. This provides a unified language across the stack and simplifies deployment within the Next.js framework.
- **Database:** **PostgreSQL**. Selected for its robustness with structured data, suitability for current and future relational data needs, and the value of learning SQL and relational design principles.
- **VCS Integration:** Direct interaction with the **GitHub API**, specifically leveraging **GraphQL** internally on the backend for efficient data fetching.

**3. Non-Functional Requirements (MVP - Based on Product Specification Document):**

- **Performance:** Dashboard and API calls should be reasonably fast and feel responsive.
- **Security:** Secure authentication via **GitHub OAuth 2.0** is mandatory, with sensitive data like access tokens stored securely on the backend only. HTTPS must be used for all communication.
- **Browser Compatibility:** Must function correctly on the latest versions of major desktop browsers.
- **Responsiveness:** Basic responsiveness for desktop/laptop screen sizes.

**4. High-Level Software Architecture:**

- A standard **multi-tier client-server architecture**.
- **Client (Frontend):** Runs in the browser, built with React/Next.js/TypeScript, responsible for the UI and making requests to the Backend API.
- **Backend API (Server-Side):** Built with Node.js/TypeScript in Next.js API Routes, acts as a **Facade**. It handles business logic, authentication, caching, interactions with the Database and External Services (GitHub API).
- **Database:** PostgreSQL, provides persistent storage for users and potentially cached data.
- **External Services:** GitHub API (GraphQL) as the data source and GitHub OAuth Service for authentication.

**5. API Design (Backend Facade Approach):**

- The Backend exposes **REST-like HTTP endpoints** to the Frontend.
- Endpoints include: `/api/pull-requests/needs-review`, `/api/pull-requests/returned-to-you`, `/api/pull-requests/my-awaiting-review`, `/api/pull-requests/reviewed-awaiting-author` (conditional), `/api/auth/github`, `/api/auth/github/callback`.
- These backend endpoints **internally utilize the GitHub GraphQL API** to fetch, filter, and process the necessary data before returning a structured JSON response to the Frontend.
- JSON response for PR data will include: ID, Title, Link, Author (Name, Avatar URL), Status Badge info, Comment Count, Last Update Time, Changes (+/-).

**6. Database Design:**

- **PostgreSQL** is the chosen database.
- The database schema will follow the [Auth.js adapter schema](https://authjs.dev/reference/adapters#models), which includes tables for `User`, `Account`, `Session`, and `VerificationToken`.
- Custom fields (e.g., `github_id`, `github_username`, `github_avatar_url`) will be added to the `User` table as needed.
- The application will use the Auth.js DB adapter for all authentication and user management.
- For local development, a PostgreSQL server will be run inside a Docker container using Docker Compose. This ensures a consistent and isolated environment for development.

**7. Caching Strategy:**

- **Backend Caching** is crucial for performance and managing GitHub API rate limits. Responses from the GitHub GraphQL API will be cached on the backend (e.g., in memory or PostgreSQL).
- Frontend caching is still relevant for improving perceived performance by caching data received from the backend's REST API using libraries like React Query or SWR.
- Invalidation strategies will vary based on data volatility (e.g., update user info on login, time-based expiry for PR data cache).

**8. Cloud Deployment Strategy (on AWS):**

- **Environments:** Planning for distinct `development`, `staging`, and `production` environments, each with isolated AWS resources.
- **Frontend Hosting:** Static assets from the Next.js build deployed to **Amazon S3** and served globally and cost-effectively via **Amazon CloudFront** (leveraging its "Always Free" tier).
- **Backend API Routes:** Deployed as serverless functions using **AWS Lambda** and exposed via **Amazon API Gateway** (both with generous "Always Free" tiers for typical usage).
- **Database:** Managed PostgreSQL instance on **Amazon RDS**, utilizing the AWS Free Tier for the initial 12 months.

**9. CI/CD (Continuous Integration/Continuous Deployment):**

- **GitHub Actions** will be implemented to automate the build, testing, and deployment processes across the different AWS environments based on code commits.
