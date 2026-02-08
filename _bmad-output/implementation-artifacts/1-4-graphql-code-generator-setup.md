# Story 1.4: GraphQL Code Generator Setup

Status: ready-for-dev

---

## Story

As a **developer**,
I want auto-generated TypeScript types for GitHub GraphQL queries,
so that I have compile-time type safety for API responses.

---

## Acceptance Criteria

1. **Given** the project structure from previous stories
   **When** GraphQL Code Generator is configured
   **Then** `codegen.ts` points to GitHub's GraphQL schema

2. **And** `.graphqlrc.yml` is configured for VS Code GraphQL extension support

3. **And** `src/github/queries/` directory exists for `.graphql` files

4. **And** `src/github/generated/graphql.ts` is auto-generated on `npm run codegen`

5. **And** `prebuild` script runs codegen automatically

6. **And** a sample `pull-requests.graphql` query generates proper TypeScript types

7. **And** `generated/` folder can be gitignored or committed (documented choice)

---

## Tasks / Subtasks

- [ ] **Task 1: Install GraphQL Code Generator dependencies** (AC: #1, #4)
  - [ ] Install core codegen: `npm install -D @graphql-codegen/cli graphql`
  - [ ] Install TypeScript plugins: `npm install -D @graphql-codegen/typescript @graphql-codegen/typescript-operations`
  - [ ] Install schema loader: `npm install -D @graphql-codegen/introspection`
  - [ ] Verify all dependencies in devDependencies

- [ ] **Task 2: Create codegen configuration** (AC: #1, #4)
  - [ ] Create `codegen.ts` in project root with GitHub schema config
  - [ ] Configure to read `.graphql` files from `src/github/queries/`
  - [ ] Configure output to `src/github/generated/graphql.ts`
  - [ ] Add environment variable support for `GITHUB_TOKEN`

- [ ] **Task 3: Configure VS Code GraphQL extension** (AC: #2)
  - [ ] Create `.graphqlrc.yml` with schema pointing to GitHub GraphQL API
  - [ ] Configure documents pattern for query files
  - [ ] Update `.vscode/extensions.json` to recommend GraphQL extensions

- [ ] **Task 4: Create directory structure** (AC: #3)
  - [ ] Create `src/github/queries/` directory
  - [ ] Create `src/github/generated/` directory
  - [ ] Add `.gitkeep` or initial files as needed

- [ ] **Task 5: Create sample pull-requests.graphql query** (AC: #6)
  - [ ] Create `src/github/queries/pull-requests.graphql`
  - [ ] Include query for fetching open PRs with standard fields:
    - id, number, title, author, reviewDecision, updatedAt, createdAt
    - reviews, comments, labels, repository info
  - [ ] Include pagination support (cursor-based)

- [ ] **Task 6: Configure build scripts** (AC: #4, #5)
  - [ ] Add `codegen` script to `package.json`
  - [ ] Add `prebuild` hook to run codegen before build
  - [ ] Test `npm run codegen` generates types successfully
  - [ ] Verify `npm run build` includes codegen step

- [ ] **Task 7: Document generated folder handling** (AC: #7)
  - [ ] Decide: gitignore or commit generated types
  - [ ] Add documentation comment in codegen.ts explaining choice
  - [ ] Update `.gitignore` if gitignoring generated folder
  - [ ] Document in README if committing

- [ ] **Task 8: Verify type generation** (AC: #6)
  - [ ] Run `npm run codegen`
  - [ ] Verify `src/github/generated/graphql.ts` is created
  - [ ] Verify TypeScript types match query structure
  - [ ] Verify query variable types are generated
  - [ ] Test importing types in a sample file

- [ ] **Task 9: Add CI validation for generated types** (AC: #7)
  - [ ] Add workflow step to `.github/workflows/ci.yml` (when created in Story 1.6)
  - [ ] Step should regenerate types and fail if there's a diff
  - [ ] Document that CI requires `GITHUB_TOKEN` for this validation
  - [ ] Add comment in workflow explaining the validation purpose

---

## Dev Notes

### Architecture Compliance (CRITICAL)

**From [architecture.md](../../_bmad-output/planning-artifacts/architecture.md#typed-graphql-with-code-generation):**

This story implements the "Typed GraphQL with Code Generation" architectural decision:

> **Decision:** GraphQL Code Generator for fully typed GitHub API queries
>
> **Why:**
>
> - Full type safety from query definition to response handling
> - IDE autocomplete for query results
> - Catches breaking GitHub schema changes at build time
> - Zero runtime type errors from API responses

### Dependencies to Install

```bash
npm install -D @graphql-codegen/cli graphql @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/introspection
```

**Package versions (use latest stable):**

- `@graphql-codegen/cli` - Core CLI tool
- `graphql` - GraphQL.js library (peer dependency)
- `@graphql-codegen/typescript` - Generates TypeScript types for schema
- `@graphql-codegen/typescript-operations` - Generates types for operations (queries/mutations)
- `@graphql-codegen/introspection` - Schema introspection support

### Codegen Configuration

**`codegen.ts` (TypeScript config - modern approach):**

```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  // GitHub GraphQL schema - requires GITHUB_TOKEN env var
  schema: {
    'https://api.github.com/graphql': {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'code-flow-extension',
      },
    },
  },
  // Location of .graphql query files
  documents: 'src/github/queries/**/*.graphql',
  generates: {
    // Output file for generated types
    'src/github/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        // Use strict TypeScript
        strictScalars: true,
        // Map GitHub scalar types
        scalars: {
          DateTime: 'string',
          URI: 'string',
          HTML: 'string',
          GitObjectID: 'string',
          GitSSHRemote: 'string',
          GitTimestamp: 'string',
          PreciseDateTime: 'string',
          X509Certificate: 'string',
          Base64String: 'string',
          BigInt: 'string',
          Date: 'string',
        },
        // Generate readonly types
        immutableTypes: true,
        // Use 'type' instead of 'interface' for object types
        declarationKind: 'type',
        // Skip generating __typename by default
        skipTypename: true,
        // Use type imports
        useTypeImports: true,
      },
    },
  },
};

export default config;
```

### GraphQL VS Code Extension Configuration

**`.graphqlrc.yml`:**

```yaml
schema:
  - https://api.github.com/graphql:
      headers:
        Authorization: Bearer ${GITHUB_TOKEN}
        User-Agent: code-flow-extension
documents: 'src/github/queries/**/*.graphql'
```

### Sample Query File

**`src/github/queries/pull-requests.graphql`:**

```graphql
# Fetch open pull requests where user is involved
query GetPullRequests($searchQuery: String!, $first: Int!, $after: String) {
  search(query: $searchQuery, type: ISSUE, first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      ... on PullRequest {
        id
        number
        title
        url
        state
        isDraft
        createdAt
        updatedAt
        mergeable
        reviewDecision
        author {
          login
          avatarUrl
        }
        repository {
          name
          owner {
            login
          }
        }
        labels(first: 10) {
          nodes {
            name
            color
          }
        }
        reviews(first: 10) {
          nodes {
            author {
              login
              avatarUrl
            }
            state
            submittedAt
          }
        }
        reviewRequests(first: 10) {
          nodes {
            requestedReviewer {
              ... on User {
                login
                avatarUrl
              }
              ... on Team {
                name
                slug
              }
            }
          }
        }
        comments {
          totalCount
        }
        commits(last: 1) {
          nodes {
            commit {
              oid
              committedDate
              statusCheckRollup {
                state
              }
            }
          }
        }
        additions
        deletions
        changedFiles
      }
    }
  }
  rateLimit {
    remaining
    resetAt
    cost
  }
}
```

### Generated Types Example

After running `npm run codegen`, the generated file will include types like:

```typescript
// src/github/generated/graphql.ts (auto-generated)

export type GetPullRequestsQueryVariables = {
  readonly searchQuery: string;
  readonly first: number;
  readonly after?: string | null;
};

export type GetPullRequestsQuery = {
  readonly search: {
    readonly pageInfo: {
      readonly hasNextPage: boolean;
      readonly endCursor: string | null;
    };
    readonly nodes: ReadonlyArray<{
      readonly id: string;
      readonly number: number;
      readonly title: string;
      readonly url: string;
      // ... all fields typed
    } | null> | null;
  };
  readonly rateLimit: {
    readonly remaining: number | null;
    readonly resetAt: string | null;
    readonly cost: number | null;
  } | null;
};
```

### Package.json Updates

Add to `scripts` section:

```json
{
  "scripts": {
    "codegen": "graphql-codegen --config codegen.ts",
    "prebuild": "npm run codegen",
    "compile": "npm run check-types && npm run lint && node esbuild.js",
    "build": "npm run compile"
  }
}
```

### VS Code Extensions Configuration

Update `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "graphql.vscode-graphql",
    "graphql.vscode-graphql-syntax"
  ]
}
```

### Target Project Structure After This Story

```
code-flow/
├── src/
│   ├── extension.ts                  # Existing
│   ├── test/
│   │   └── extension.test.ts         # Existing
│   └── github/                       # NEW
│       ├── queries/                  # NEW - GraphQL query files
│       │   └── pull-requests.graphql # NEW - Sample query
│       └── generated/                # NEW - Auto-generated
│           └── graphql.ts            # NEW - Generated types
├── .graphqlrc.yml                    # NEW - GraphQL extension config
├── codegen.ts                        # NEW - Codegen configuration
├── package.json                      # MODIFY - Add codegen scripts
└── .vscode/
    └── extensions.json               # MODIFY - Add GraphQL extension recommendations
```

### File Naming Conventions (MANDATORY)

| Context             | Convention | Examples                                    |
| ------------------- | ---------- | ------------------------------------------- |
| **GraphQL files**   | kebab-case | `pull-requests.graphql`, `timeline.graphql` |
| **Generated files** | kebab-case | `graphql.ts`                                |
| **Config files**    | kebab-case | `codegen.ts`, `.graphqlrc.yml`              |

### Environment Variable Setup

The codegen requires a GitHub token with `repo` scope to fetch the schema.

**For local development:**

1. Create a GitHub Personal Access Token (classic) with `repo` scope
2. Set environment variable before running codegen:

```bash
# Windows PowerShell
$env:GITHUB_TOKEN="ghp_your_token_here"
npm run codegen

# Windows CMD
set GITHUB_TOKEN=ghp_your_token_here
npm run codegen

# Unix/Mac
GITHUB_TOKEN=ghp_your_token_here npm run codegen
```

**For CI (GitHub Actions):**

The token is available as `secrets.GITHUB_TOKEN` automatically.

### ADR: Codegen Configuration Format

**Decision:** Use `codegen.ts` (TypeScript) over `codegen.yml` (YAML)

**Rationale:**

1. **Consistency** - This is a TypeScript-first project; keep configuration in TypeScript
2. **Type safety** - TypeScript config catches configuration errors at edit time
3. **IDE support** - Full autocomplete and validation for config options
4. **Environment variables** - Clean access via `process.env.GITHUB_TOKEN`
5. **Scalar mappings** - Complex scalar type mappings benefit from TypeScript's checking

### ADR: Generated Folder Handling

**Decision: COMMIT generated types WITH CI validation (Hybrid Approach)**

This decision was analyzed using Architecture Decision Records with multiple perspectives:

| Approach                   | Pros                       | Cons                                     |
| -------------------------- | -------------------------- | ---------------------------------------- |
| Commit only                | Simple, no CI token needed | Risk of stale types                      |
| Gitignore only             | Always fresh types         | CI complexity, token required everywhere |
| **Commit + CI validation** | Best of both worlds        | Slightly more CI setup                   |

**Selected: Hybrid Approach**

**Rationale:**

1. **Fast local builds** - Developers don't need `GITHUB_TOKEN` for regular builds
2. **PR visibility** - Type changes appear in PR diffs, making schema impacts visible
3. **Safety net** - CI validation catches stale types before merge
4. **Deterministic** - Production builds use committed, verified types

**Implementation:**

1. **Commit the generated types** to `src/github/generated/graphql.ts`

2. **Add CI validation step** (in Story 1.6 CI Pipeline):

   ```yaml
   # .github/workflows/ci.yml
   - name: Verify generated types are up-to-date
     env:
       GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
     run: |
       npm run codegen
       git diff --exit-code src/github/generated/ || (echo "Generated types are stale. Run 'npm run codegen' and commit." && exit 1)
   ```

3. **Document in README:**
   - After modifying `.graphql` files, run `npm run codegen`
   - Commit the updated `src/github/generated/graphql.ts`
   - CI will fail if generated types don't match queries

**Trade-off accepted:** CI requires `GITHUB_TOKEN` for validation, but this is automatically available in GitHub Actions via `secrets.GITHUB_TOKEN`.

### ADR: Schema Fetching Strategy

**Decision:** Fetch schema from GitHub API at codegen time (not local schema file)

**Rationale:**

1. **Always current** - Catches GitHub API deprecations and changes early
2. **No maintenance** - Don't need to manually update local schema file
3. **Acceptable latency** - 5-10 second fetch is fine for a prebuild step
4. **Build-time only** - Schema fetch happens during codegen, not at runtime

**Trade-off accepted:** Requires network connectivity during `npm run codegen`. Documented in error handling section.

### Previous Story Intelligence (Story 1.2)

**From Story 1.2 (in-progress):**

- Story 1.2 establishes the webview-ui foundation
- This story (1.4) runs in parallel with 1.2 and 1.3
- Story 1.3 creates the shared message contract in `src/shared/messages.ts`
- The generated GraphQL types will be used by PR service in later stories

**Files that may overlap:**

- `package.json` - Both stories add scripts (coordinate additions)
- `.vscode/extensions.json` - 1.2 may add Tailwind extension, 1.4 adds GraphQL

### Git Intelligence

Recent commits:

- `b12fb63 1-1 ready` - Story 1.1 extension scaffold completed
- `3c5c4a4 update bmad` - BMAD framework updates
- `1c8bc49 docs (#52)` - Documentation updates
- `e934283 pivoting to vscode extension (#50)` - Project pivot to VS Code

The project has a clean extension scaffold ready for feature additions.

### Testing This Story

1. **Codegen Runs Test:**
   - Set `GITHUB_TOKEN` environment variable
   - Run `npm run codegen`
   - Verify no errors in output
   - Verify `src/github/generated/graphql.ts` is created

2. **Type Safety Test:**
   - Create a test file that imports generated types
   - Verify TypeScript recognizes the types
   - Verify IDE autocomplete works for query result fields

3. **Build Integration Test:**
   - Run `npm run build`
   - Verify prebuild runs codegen
   - Verify no type errors in build

4. **VS Code Extension Test:**
   - Open a `.graphql` file in VS Code
   - Verify syntax highlighting works
   - Verify autocomplete suggests GitHub schema fields

5. **Query Validation Test:**
   - Modify `pull-requests.graphql` with invalid field
   - Run `npm run codegen`
   - Verify codegen fails with schema validation error

### Error Handling Notes

**Common codegen errors:**

1. **Missing GITHUB_TOKEN:**

   ```
   Error: Unable to fetch schema from https://api.github.com/graphql
   ```

   Solution: Set `GITHUB_TOKEN` environment variable

2. **Invalid token/scope:**

   ```
   Error: 401 Unauthorized
   ```

   Solution: Verify token has `repo` scope and is not expired

3. **Schema validation error:**

   ```
   Error: Field "invalidField" is not defined by type "PullRequest"
   ```

   Solution: Fix the query file to use valid schema fields

4. **Network error:**
   ```
   Error: Unable to connect to https://api.github.com/graphql
   ```
   Solution: Check network connectivity, proxy settings

**Important:** The `npm run codegen` command requires network connectivity to fetch GitHub's GraphQL schema. If working offline, use the previously committed generated types (they will work for builds, just can't be regenerated).

### References

- [Source: architecture.md#Typed GraphQL with Code Generation](../../_bmad-output/planning-artifacts/architecture.md)
- [Source: architecture.md#Implementation Handoff](../../_bmad-output/planning-artifacts/architecture.md)
- [Source: epics.md#Story 1.4](../../_bmad-output/planning-artifacts/epics.md)
- [GraphQL Code Generator Documentation](https://the-guild.dev/graphql/codegen/docs/getting-started)
- [GitHub GraphQL API Documentation](https://docs.github.com/en/graphql)
- [GitHub GraphQL Explorer](https://docs.github.com/en/graphql/overview/explorer)

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### Change Log

| Date       | Change                                   | Author                     |
| ---------- | ---------------------------------------- | -------------------------- |
| 2026-02-08 | Story created with comprehensive context | SM Agent (Claude Opus 4.5) |

### File List

_Files to be created/modified by dev agent:_

```
code-flow/
├── src/github/                       # NEW directory
│   ├── queries/                      # NEW directory
│   │   └── pull-requests.graphql     # NEW - Sample PR query
│   └── generated/                    # NEW directory
│       └── graphql.ts                # GENERATED - Auto-generated types
├── codegen.ts                        # NEW - Codegen configuration
├── .graphqlrc.yml                    # NEW - VS Code GraphQL extension config
├── package.json                      # MODIFY - Add codegen scripts & deps
└── .vscode/
    └── extensions.json               # MODIFY - Add GraphQL extensions
```
