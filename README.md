# CodeFlow

> **CodeFlow is your personal pull request command center.**
>
> Track, review, and manage all your open PRs across projects in one beautiful, unified dashboard—built for developers who want clarity, speed, and control over their code review workflow.

## Project Overview

CodeFlow is a learning-focused, portfolio-grade web application that helps developers track and manage pull requests across repositories. Built with modern technologies, it aims to:
- Provide a single dashboard for PR review status
- Serve as a hands-on learning project for Next.js, TypeScript, Docker, Auth.js, PostgreSQL, and more
- Demonstrate best practices in full-stack web development

## Tech Stack
- **Next.js** (App Router, TypeScript)
- **Tailwind CSS** & **Shadcn UI** (modern UI)
- **Auth.js** (authentication)
- **PostgreSQL** (database, via Docker)
- **pgAdmin** (DB management, via Docker)
- **Docker Compose** (local dev environment)

## Getting Started

### 1. Clone the repository
```sh
git clone <your-fork-url>
cd code-flow
```

### 2. Set up environment variables
- Copy `.env.local.example` to `.env.local`:
  ```sh
  cp .env.local.example .env.local
  ```
- Fill in your own secure values for each variable.
- **Never commit `.env.local` to version control.**

### 3. Start Docker services (PostgreSQL & pgAdmin)
```sh
npm run docker:up
```
- This uses `docker-compose.yml` and `.env.local` for configuration.
- pgAdmin will be available at [http://localhost:5050](http://localhost:5050)

### 4. Start the development server
```sh
npm run dev
```
- Or use `npm run dev:all` to start both Docker and the dev server in one step.
- App will be available at [http://localhost:3000](http://localhost:3000)

### 5. Stopping services
```sh
npm run docker:down
```

## Usage Scripts
- `npm run dev` – Start Next.js dev server
- `npm run docker:up` – Start DB and pgAdmin
- `npm run docker:down` – Stop DB and pgAdmin
- `npm run dev:all` – Start Docker and dev server together

## Security & Credentials
- Store secrets in `.env.local` (excluded from git)
- Back up your `.env.local` securely (e.g., password manager, encrypted storage)
- For teams, consider a secrets manager (e.g., 1Password, Doppler)

## Documentation
- See `docs/` for architecture, diagrams, and product specs
- See `.github/instructions/code-flow-copilot-instructions.instructions.md` for Copilot usage guidance

## Contributing
- PRs and issues welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) if available.

---

*This project is for learning and portfolio purposes. For questions, see the documentation or open an issue.*
