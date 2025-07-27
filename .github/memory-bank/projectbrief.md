# CodeFlow - Project Brief

**Created:** 2025-07-23  
**Status:** Active Development  
**Project Type:** Learning + Portfolio Web Application  

## Core Identity

**What:** CodeFlow is a centralized pull request tracking dashboard that solves the "signal vs. noise" problem for developers managing PRs across repositories.

**Why:** This project serves dual purposes:
1. **Learning Project:** Hands-on experience with modern web development stack (Next.js, TypeScript, Auth.js, Drizzle ORM, PostgreSQL, Docker)
2. **Portfolio Piece:** Demonstrates full-stack development capabilities and modern best practices
3. **Potential Utility:** Could become a valuable tool for the development team

## Project Scope & Constraints

### MVP Requirements
- **Single User Focus:** Individual developer dashboard (not team management)
- **GitHub Integration:** OAuth authentication + GraphQL API for PR data
- **Core Sections:**
  1. Needs Your Review
  2. Returned to You  
  3. My PRs - Awaiting Review
  4. Reviewed - Awaiting Author (conditional)

### Technology Constraints
- **Frontend:** React + Next.js (App Router) + TypeScript
- **Backend:** Next.js API Routes + TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Auth.js with GitHub OAuth
- **UI:** Tailwind CSS + Shadcn UI components
- **Development:** Docker Compose for local environment

### Success Criteria
1. **Learning:** Demonstrate proficiency with chosen tech stack
2. **Portfolio:** Production-ready code quality and architecture
3. **Functionality:** Solve core PR management workflow problems
4. **User Experience:** Clean, intuitive, responsive interface

## Key Principles

- **Security First:** Secure token handling, HTTPS, proper authentication
- **Type Safety:** Full TypeScript coverage across frontend and backend
- **Best Practices:** Follow industry standards for code organization, git workflow, and documentation
- **Iterative Development:** Start with MVP, build incrementally
- **Learning Focus:** Understand the "why" behind every technical decision

## Repository Structure

This is a Next.js project with the following key areas:
- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - Reusable React components
- `/src/db` - Database schema, migrations, and utilities
- `/docs` - Project documentation and specifications
- `/scripts` - Development and deployment scripts
- `/.github` - GitHub workflows, instructions, and memory bank

## Current Phase

**Phase:** Foundation & Authentication Setup  
**Focus:** Establishing solid technical foundation with Docker environment, database schema, and GitHub OAuth integration before building PR dashboard features.
