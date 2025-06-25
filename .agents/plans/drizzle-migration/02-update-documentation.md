# Step 2: Update Documentation and Instructions

**Estimated Time:** 45-60 minutes  
**Prerequisites:** Step 1 completed  
**Dependencies:** Cleanup completed

## 🎯 Objective

Update all project documentation, architecture diagrams, and instructions to reflect the new Drizzle-based architecture.

## 📋 Tasks

### 2.1 Update Architecture Documents

**File: `docs/CodeFlow - Comprehensive Architectural and Technical Decision.md`**

- [ ] **Section 2: Core Technology Stack**

  - [ ] Change "**ORM:** **Prisma**" to "**ORM:** **Drizzle**"
  - [ ] Update explanation: "Used for type-safe database access, schema migrations, and integration with Auth.js"

- [ ] **Section 6: Database Design**
  - [ ] Update "The database schema is defined and managed using **Prisma**" to "**Drizzle**"
  - [ ] Change "All migrations and schema changes are handled via Prisma's migration system" to "Drizzle migration system"
  - [ ] Update "The application uses the official **Prisma Adapter** for Auth.js" to "**Drizzle Adapter**"

### 2.2 Update Architecture Diagrams

**File: `docs/architecture-diagrams.md`**

- [ ] **Section 2: Component Diagram**

  - [ ] Change `PrismaClient` class to `DrizzleDB`
  - [ ] Update methods: `+query()`, `+mutate()`, `+migrate()`
  - [ ] Update connection: `APIRoutes --> DrizzleDB : "ORM access"`
  - [ ] Update: `DrizzleDB --> Database : "Read/Write"`

- [ ] **Section 6: Database Schema**
  - [ ] Update note: "_Note: Auth.js DB adapter schema is used for authentication and user management. The schema is managed and migrated using **Drizzle**._"

### 2.3 Update MVP Product Specification

**File: `docs/CodeFlow - MVP Product Specification Document.md`**

- [ ] **Search for any Prisma references** and update to Drizzle
- [ ] **Database technology mentions** should reference Drizzle where appropriate

### 2.4 Update README.md

**File: `README.md`**

- [ ] **Tech Stack section**

  - [ ] Change from "PostgreSQL (database, via Docker)" to "PostgreSQL with Drizzle ORM (via Docker)"
  - [ ] Or update tech stack bullet: "**Drizzle ORM** (database access layer)"

- [ ] **Getting Started section**

  - [ ] Update any Prisma-specific setup instructions
  - [ ] Ensure Docker instructions remain the same

- [ ] **Scripts section**
  - [ ] Remove or update Prisma Studio reference if present
  - [ ] Add placeholder for future Drizzle Studio equivalent

### 2.5 Update Copilot Instructions

**File: `.github/instructions/code-flow-copilot-instructions.instructions.md`**

- [ ] **Database section**

  - [ ] Change "Assist with Prisma schema definition and migrations" to "Assist with Drizzle schema definition and migrations"
  - [ ] Update: "Guide on integrating with Auth.js adapters" (keep as-is, but context changes)

- [ ] **Specific Technical Guidance > Database**
  - [ ] Update bullet: "**Database (PostgreSQL & Drizzle):**"

### 2.6 Update package.json Description

**File: `package.json`**

- [ ] Update any description fields that mention Prisma
- [ ] Ensure scripts section is clean (Prisma scripts should be removed from Step 1)

### 2.7 Create Migration Notes

**File: `docs/MIGRATION_NOTES.md`** (Create new file)

```markdown
# Migration Notes: Prisma to Drizzle

**Date:** June 21, 2025  
**Reason:** Resolve Edge runtime compatibility issues with Vercel Edge Functions

## Changes Made

### Technology Stack

- **Removed:** Prisma ORM
- **Added:** Drizzle ORM
- **Reason:** Drizzle is natively Edge runtime compatible

### Benefits

- ✅ Native Edge runtime support
- ✅ Smaller bundle size
- ✅ More explicit SQL-like queries
- ✅ Better TypeScript integration
- ✅ Learning opportunity

### Preserved

- ✅ PostgreSQL database (same Docker setup)
- ✅ Auth.js integration (using Drizzle adapter)
- ✅ All existing development workflows
- ✅ Docker Compose setup

## Breaking Changes

- Database migration system changed from Prisma to Drizzle
- ORM query syntax changed
- Database introspection tools changed (no more Prisma Studio)
```

## 🧪 Validation Steps

1. **Review all documentation files** for Prisma references

```bash
# Search for remaining Prisma references in docs
grep -r -i "prisma" docs/ README.md .github/
```

2. **Verify architectural consistency**

- [ ] All diagrams reference Drizzle instead of Prisma
- [ ] Tech stack lists are consistent across documents
- [ ] No conflicting information between documents

3. **Check for broken links or references**

- [ ] All internal document references still work
- [ ] External links are still valid

## 📝 Notes

- **Keep documentation accurate** - this helps with learning and portfolio value
- **Maintain consistency** across all documents
- **Document the why** - migration reasoning shows decision-making skills

## ✅ Success Criteria

- [ ] All Prisma references updated to Drizzle in documentation
- [ ] Architecture diagrams reflect new ORM choice
- [ ] README.md accurately represents current tech stack
- [ ] Copilot instructions updated for Drizzle assistance
- [ ] Migration notes document created
- [ ] No Prisma references found in documentation grep search

## 📊 Update Migration Status

After completing this step:

- [ ] Update the status in `README.md`:
  - Change `- [ ] Step 2: Update Documentation` to `- [x] Step 2: Update Documentation ✅`
  - Add completion timestamp
- [ ] Update `00-migration-overview.md` if needed
- [ ] Note any documentation challenges or improvements made

**Next Step:** Proceed to `03-install-drizzle.md`
