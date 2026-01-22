# Story 0.6: Code Quality Standards

Status: ready-for-dev

## Story

As a developer,
I want basic project structure and coding standards defined,
so that development follows consistent patterns.

## Acceptance Criteria

1. **ESLint configuration with TypeScript rules** - Enhanced ESLint setup beyond Next.js defaults with strict TypeScript-specific rules
2. **Prettier configuration for consistent formatting** - Prettier installed and configured with project-specific rules
3. **Code style guide documented** - CONTRIBUTING.md with conventions and VS Code setup for format-on-save
4. **Import organization rules configured** - Auto-sorting and grouping of imports via ESLint plugin

> **Note:** Pre-commit hooks (Husky) intentionally omitted - CI quality gates in US0.3 + VS Code format-on-save provide sufficient enforcement for a personal project.

## Tasks / Subtasks

- [ ] **Task 1: Install Prettier and configure** (AC: #2)

  - [ ] Install `prettier` as dev dependency
  - [ ] Create `.prettierrc` with project formatting rules
  - [ ] Create `.prettierignore` for build outputs
  - [ ] Add `format` and `format:check` npm scripts
  - [ ] Verify formatting works with existing codebase

- [ ] **Task 2: Enhance ESLint with TypeScript and import rules** (AC: #1, #4)
  - [ ] Install `eslint-plugin-import`, `@typescript-eslint/eslint-plugin`
  - [ ] Install `eslint-plugin-simple-import-sort` for import organization
  - [ ] Install `eslint-config-prettier` to avoid conflicts
  - [ ] Update `eslint.config.mjs` with enhanced rules
  - [ ] Configure import sorting and grouping
  - [ ] Run `npm run lint` and fix any violations

- [ ] **Task 3: Document code style guide** (AC: #3)
  - [ ] Create `CONTRIBUTING.md` in project root
  - [ ] Document naming conventions (from architecture)
  - [ ] Document component/hook patterns
  - [ ] Document git workflow and commit message format
  - [ ] Document how to run linting and formatting

## Dev Notes

### Current State Analysis

**What Already Exists:**
- TypeScript strict mode is **fully configured** in `tsconfig.json` with all required settings per architecture
- Basic ESLint with `next/core-web-vitals` and `next/typescript` extends
- Tailwind CSS 4.0 configured
- Vitest testing framework in place

**What's Missing (This Story):**
- Prettier not installed
- No import organization rules
- No `.prettierrc` or `.prettierignore`
- No documented coding standards
- ESLint needs enhancement beyond Next.js defaults

### Technical Requirements

#### Prettier Configuration

Create `.prettierrc` with these settings:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

Create `.prettierignore`:

```
.next
node_modules
coverage
dist
*.lock
prisma/migrations
```

#### ESLint Enhancement

Update `eslint.config.mjs` to include:

1. **eslint-config-prettier** - Disable formatting rules that conflict with Prettier
2. **eslint-plugin-simple-import-sort** - Auto-sort imports
3. **Custom TypeScript rules** - Enhanced strict typing rules

Import order should be:
1. React/Next.js imports
2. External packages
3. Internal aliases (`@/components`, `@/lib`, etc.)
4. Relative imports
5. Type imports (using `import type`)

### Project Structure Notes

**Files to Create:**
- `.prettierrc` - Root directory
- `.prettierignore` - Root directory
- `CONTRIBUTING.md` - Root directory (code style documentation)

**Files to Modify:**
- `package.json` - Add scripts and lint-staged config
- `eslint.config.mjs` - Enhanced rules and plugins

**Path Alignment:** All paths align with unified project structure in architecture docs.

### Naming Conventions Reference

Per [coding-standards.md](docs/architecture/coding-standards.md):

| Element | Convention | Example |
|---------|------------|---------|
| React Components | PascalCase | `DashboardGrid`, `PullRequestCard` |
| Custom Hooks | camelCase with 'use' | `useDashboard`, `useRepositories` |
| API Routes | kebab-case | `/api/pull-requests`, `/api/rate-limit` |
| Database Tables | snake_case | `user_profiles`, `repositories` |
| TypeScript Interfaces | PascalCase | `GitHubPullRequest`, `DashboardData` |
| Zustand Stores | camelCase with 'Store' | `authStore`, `dashboardStore` |
| Constants | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRIES` |
| CSS Classes | kebab-case (Tailwind) | `bg-blue-600`, `hover:bg-blue-700` |

### Package Versions (Latest Stable)

```json
{
  "devDependencies": {
    "prettier": "^3.4.0",
    "eslint-config-prettier": "^10.0.0",
    "eslint-plugin-simple-import-sort": "^12.1.0"
  }
}
```

### Testing Validation

After implementation, verify:

1. `npm run lint` passes with no errors
2. `npm run format:check` passes (no unformatted files)
3. Import organization is auto-sorted on save (with VS Code configured)

### VS Code Integration (Document in CONTRIBUTING.md)

Recommend these VS Code settings for team:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  }
}
```

Note: `source.organizeImports` should be "never" - let ESLint plugin handle import sorting to avoid conflicts.

### References

- [Source: docs/architecture/coding-standards.md] - Complete coding standards
- [Source: docs/architecture/unified-project-structure.md] - File organization
- [Source: docs/architecture/tech-stack.md] - Technology versions
- [Source: docs/prd/epic-0-project-foundation-and-development-setup.md#US0.6] - Story requirements

### Anti-Patterns to Avoid

1. **Do NOT use deprecated ESLint config format** - Use flat config (`eslint.config.mjs`), not `.eslintrc.json`
2. **Do NOT configure Prettier rules in ESLint** - Use `eslint-config-prettier` to disable conflicting rules
3. **Do NOT use `eslint-plugin-prettier`** - This is deprecated pattern; run Prettier separately
4. **Do NOT use `@trivago/prettier-plugin-sort-imports`** - Use `eslint-plugin-simple-import-sort` instead for ESLint integration
5. **Do NOT add redundant TypeScript rules** - tsconfig.json already has strict mode configured

## Definition of Done

- [ ] Code passes linting (`npm run lint` returns 0)
- [ ] Formatting is consistent (`npm run format:check` returns 0)
- [ ] CONTRIBUTING.md documents code style and VS Code setup
- [ ] All existing code formatted and linted (no violations)

## Dev Agent Record

### Agent Model Used

<!-- To be filled by dev agent -->

### Completion Notes List

<!-- To be filled during implementation -->

### File List

<!-- To be filled during implementation -->
