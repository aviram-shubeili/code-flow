# Step 1: Clean Up Current Prisma Implementation

**Estimated Time:** 30-45 minutes  
**Prerequisites:** None  
**Dependencies:** None

## 🎯 Objective

Remove all Prisma-related code, dependencies, and files from the CodeFlow project to prepare for Drizzle migration.

## 📋 Tasks

### 1.1 Remove Prisma Dependencies

```bash
# Remove Prisma packages
npm uninstall prisma @prisma/client @auth/prisma-adapter

# Remove Prisma dev dependencies
npm uninstall prisma --save-dev
```

### 1.2 Remove Prisma Files and Directories

- [ ] Delete `src/prisma/` directory entirely
  - [ ] `src/prisma/schema.prisma`
  - [ ] `src/prisma/migrations/` folder
- [ ] Delete `prisma.config.ts` (if exists)
- [ ] Delete `src/prisma.ts` (Prisma client setup)

### 1.3 Remove Prisma Scripts from package.json

Remove or comment out Prisma-related scripts:

- [ ] `"studio": "dotenv -e .env.local -- prisma studio --schema=src/prisma/schema.prisma"`
- [ ] Any other Prisma migration or generate scripts

### 1.4 Clean Up Auth.js Integration

**File: `src/auth.ts`**

- [ ] Remove `import { PrismaAdapter } from '@auth/prisma-adapter'`
- [ ] Remove `import { prisma } from './prisma'`
- [ ] Remove `adapter: PrismaAdapter(prisma)` from Auth.js config
- [ ] Comment out or temporarily remove the Auth configuration that uses Prisma

**File: `src/app/api/auth/[...nextauth]/route.ts`**

- [ ] Ensure no Prisma imports remain

### 1.5 Clean Up Dependencies in package.json

Verify `package.json` no longer contains:

- [ ] `@prisma/client`
- [ ] `prisma`
- [ ] `@auth/prisma-adapter`

### 1.6 Update .gitignore (if needed)

Remove Prisma-specific entries if they exist:

```
# Remove these lines if present
/prisma/migrations/
.env
```

## 🧪 Validation Steps

1. **Run npm install** to ensure no dependency conflicts

```bash
npm install
```

2. **Check for remaining Prisma references**

```bash
# Search for any remaining Prisma imports or usage
grep -r "prisma" src/ --include="*.ts" --include="*.tsx"
grep -r "@prisma" src/ --include="*.ts" --include="*.tsx"
```

3. **Attempt to build** (should fail, but no Prisma errors)

```bash
npm run build
```

## ⚠️ Expected State After Completion

- **Auth.js will be broken** (expected - we'll fix in later steps)
- **No Prisma references** in codebase
- **Build may fail** due to missing database adapter
- **Docker PostgreSQL** should still be running and accessible

## 📝 Notes

- **Keep database running** - we'll reuse the same PostgreSQL instance
- **Save any important data** if you have test data you want to preserve
- **Commit changes** after completing cleanup for easy rollback

## ✅ Success Criteria

- [ ] All Prisma packages removed from dependencies
- [ ] All Prisma files deleted
- [ ] All Prisma imports removed from source code
- [ ] No Prisma references found in grep search
- [ ] npm install runs without Prisma-related errors

## 📊 Update Migration Status

After completing this step:

- [ ] Update the status in `README.md`:
  - Change `- [ ] Step 1: Cleanup Prisma` to `- [x] Step 1: Cleanup Prisma ✅`
  - Add completion timestamp
- [ ] Update `00-migration-overview.md` if needed
- [ ] Note any issues encountered or deviations from plan

**Next Step:** Proceed to `02-update-documentation.md`
