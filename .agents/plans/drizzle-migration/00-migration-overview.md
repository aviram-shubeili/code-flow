# CodeFlow: Prisma to Drizzle Migration Plan

**Status:** 🚧 In Planning  
**Priority:** High  
**Estimated Time:** 4-6 hours  
**Date Created:** June 21, 2025

## 📋 Migration Overview

This plan outlines the complete migration from Prisma ORM to Drizzle ORM for the CodeFlow project to resolve Edge runtime compatibility issues and modernize the data layer.

## 🎯 Goals

1. **Primary:** Resolve Edge runtime issues with Auth.js middleware
2. **Secondary:** Learn modern ORM patterns with Drizzle
3. **Tertiary:** Improve bundle size and performance
4. **Portfolio:** Demonstrate ability to evaluate and migrate between technologies

## 📚 Background Context

- **Current Issue:** Prisma doesn't work in Vercel Edge Runtime without complex adapters
- **Current Stack:** Next.js + Auth.js + Prisma + PostgreSQL (Docker)
- **Target Stack:** Next.js + Auth.js + Drizzle + PostgreSQL (Docker)
- **Constraint:** Keep existing Docker PostgreSQL setup and Auth.js integration

## 🏗️ Migration Strategy

### Phase 1: Cleanup & Documentation (Steps 1-3)

- Remove Prisma dependencies and files
- Update documentation and instructions
- Prepare development environment

### Phase 2: Drizzle Setup (Steps 4-7)

- Install Drizzle dependencies
- Configure database connection
- Set up schema and migrations
- Integrate with Auth.js

### Phase 3: Testing & Validation (Steps 8-10)

- Test Auth.js integration
- Verify Edge runtime compatibility
- Validate existing workflows

### Phase 4: Finalization (Steps 11-12)

- Update scripts and tooling
- Update project documentation

## 📁 Plan Structure

```
.agents/plans/drizzle-migration/
├── 00-migration-overview.md          # This file
├── 01-cleanup-prisma.md              # Remove Prisma implementation
├── 02-update-documentation.md        # Update docs and instructions
├── 03-install-drizzle.md             # Install and configure Drizzle
├── 04-setup-auth-schema.md           # Create Auth.js compatible schema
├── 05-configure-database.md          # Database connection setup
├── 06-integrate-auth.md              # Update Auth.js configuration
├── 07-test-and-validate.md           # Testing and validation
└── 08-finalize-migration.md          # Final cleanup and documentation
```

## ⚡ Quick Start

1. **Review all plan files** in sequence
2. **Execute steps in order** - each builds on the previous
3. **Test thoroughly** after each major phase
4. **Keep Docker environment running** throughout migration

## 🚨 Important Notes

- **Backup database** before starting (export current data if any)
- **Commit frequently** during migration for easy rollback
- **Test Edge runtime** early to validate approach
- **Update .env.local** with any new environment variables

## ✅ Success Criteria

- [ ] Prisma completely removed from codebase
- [ ] Drizzle ORM fully integrated with Auth.js
- [ ] Edge runtime middleware working without errors
- [ ] All existing Docker workflows preserved
- [ ] Documentation updated to reflect new architecture
- [ ] Dev server starts and builds successfully
- [ ] Authentication flow works end-to-end

**Next Step:** Begin with `01-cleanup-prisma.md`
