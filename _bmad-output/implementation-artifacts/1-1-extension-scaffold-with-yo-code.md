# Story 1.1: Extension Scaffold with yo code

Status: done

---

## Story

As a **developer**,
I want a properly scaffolded VS Code extension project,
so that I have a solid foundation to build CodeFlow features.

---

## Acceptance Criteria

1. **Given** no existing project structure  
   **When** the extension scaffold is created using `yo code`  
   **Then** the project has TypeScript configuration with strict mode enabled

2. **And** esbuild is configured as the bundler for fast builds

3. **And** the extension activates successfully in VS Code Extension Development Host

4. **And** `package.json` contains proper extension manifest with `activationEvents`

5. **And** the project follows kebab-case naming for utility files

6. **And** ESLint and Prettier are configured with consistent rules

---

## Tasks / Subtasks

- [x] **Task 1: Create extension scaffold with yo code** (AC: #1, #4)
  - [x] Run `npx --package yo --package generator-code -- yo code`
  - [x] Select: New Extension (TypeScript)
  - [x] Name: `code-flow`
  - [x] Bundler: esbuild (recommended for extensions)
  - [x] Package manager: npm
  - [x] Verify `package.json` has proper extension fields

- [x] **Task 2: Configure TypeScript with strict mode** (AC: #1)
  - [x] Ensure `tsconfig.json` has `"strict": true`
  - [x] Verify TypeScript version is 5.x+ (5.9.3)
  - [x] Confirm no TypeScript compilation errors

- [x] **Task 3: Configure esbuild bundler** (AC: #2)
  - [x] Verify `esbuild.js` exists with correct configuration
  - [x] Ensure build outputs to `dist/extension.js`
  - [x] Confirm `--bundle` and `--external:vscode` flags are set
  - [x] Test `npm run compile` produces working bundle

- [x] **Task 4: Configure ESLint and Prettier** (AC: #6)
  - [x] Install ESLint and Prettier dependencies
  - [x] Create `eslint.config.mjs` configuration (flat config format)
  - [x] Create `.prettierrc` configuration
  - [x] Ensure ESLint and Prettier configs are compatible
  - [x] Add lint scripts to `package.json`

- [x] **Task 5: Test extension activation** (AC: #3)
  - [x] Press F5 to launch Extension Development Host
  - [x] Verify extension activates without errors
  - [x] Confirm "Hello World" command works
  - [x] Check Output panel for activation logs

- [x] **Task 6: Verify naming conventions** (AC: #5)
  - [x] Ensure utility files use kebab-case
  - [x] Verify `src/` folder structure is clean
  - [x] Kept `vsc-extension-quickstart.md` per user request

---

## Dev Notes

### Architecture Compliance (CRITICAL)

**From [architecture.md](../_bmad-output/planning-artifacts/architecture.md):**

This story implements the first step of the architecture's "Initialization Commands":

```bash
npx --package yo --package generator-code -- yo code
# Select: New Extension (TypeScript)
# Name: codeflow
# Bundler: esbuild (recommended for extensions)
# Package manager: npm
```

### Target Project Structure After This Story

```
codeflow/
├── .vscode/
│   ├── launch.json         # Extension debug configs (yo code generates)
│   └── tasks.json          # Build tasks
├── src/
│   └── extension.ts        # Entry point, activation
├── .gitignore
├── .eslintrc.json          # (ADD - not from yo code)
├── .prettierrc             # (ADD - not from yo code)
├── package.json            # Extension manifest
├── tsconfig.json           # TypeScript config (strict mode)
├── esbuild.js              # Bundler config (yo code generates)
└── README.md
```

### File Naming Conventions (MANDATORY)

| Context | Convention | Examples |
|---------|------------|----------|
| React components (later) | PascalCase | `PRCard.tsx`, `Dashboard.tsx` |
| React hooks (later) | camelCase with `use` prefix | `usePullRequests.ts` |
| **Utilities/services** | **kebab-case** | `api-client.ts`, `message-types.ts` |
| Extension host modules | kebab-case | `auth-provider.ts`, `storage-service.ts` |

### ESLint & Prettier Configuration

**`.eslintrc.json`** - Recommended config:
```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/naming-convention": [
      "warn",
      {
        "selector": "import",
        "format": ["camelCase", "PascalCase"]
      }
    ],
    "curly": "warn",
    "eqeqeq": "warn",
    "no-throw-literal": "warn",
    "semi": "warn"
  },
  "ignorePatterns": ["out", "dist", "**/*.d.ts"]
}
```

**`.prettierrc`** - Recommended config:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### TypeScript Configuration Requirements

`tsconfig.json` MUST include:
```json
{
  "compilerOptions": {
    "strict": true,
    "module": "Node16",
    "target": "ES2022",
    "lib": ["ES2022"],
    "sourceMap": true,
    "outDir": "out",
    "rootDir": "src"
  }
}
```

### package.json Required Fields

The extension manifest (`package.json`) must include:

```json
{
  "name": "codeflow",
  "displayName": "CodeFlow",
  "description": "PR management dashboard for VS Code",
  "version": "0.0.1",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": ["Other"],
  "activationEvents": [],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "codeflow.helloWorld",
        "title": "Hello World"
      }
    ]
  },
  "scripts": {
    "compile": "npm run check-types && node esbuild.js",
    "check-types": "tsc --noEmit",
    "watch": "npm-run-all -p watch:*",
    "watch:esbuild": "node esbuild.js --watch",
    "watch:tsc": "tsc --noEmit --watch --project tsconfig.json",
    "lint": "eslint src --ext ts",
    "lint:fix": "eslint src --ext ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "vscode:prepublish": "npm run compile"
  }
}
```

### NPM Dependencies to Add

```bash
# Development dependencies for linting/formatting
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint prettier
```

### Project Structure Notes

- This story creates the **extension host only** - webview-ui comes in Story 1.2
- The `src/` folder will only contain `extension.ts` after this story
- Later stories will add: `webview/`, `github/`, `auth/`, `copilot/`, `storage/`, `shared/`

### Testing This Story

1. **Activation Test:**
   - Press F5 → Extension Development Host opens
   - Open Command Palette (Ctrl+Shift+P)
   - Type "Hello World" → Command executes
   - Check Debug Console for `"Extension activated"` message

2. **Build Test:**
   - Run `npm run compile` → No errors
   - Check `dist/extension.js` exists
   - File should be bundled (single file output)

3. **Lint Test:**
   - Run `npm run lint` → No errors
   - Run `npm run format` → Code formatted

4. **TypeScript Test:**
   - Run `npm run check-types` → No errors
   - Try adding `let x: string = 5;` → Should error (strict mode)

### References

- [Source: architecture.md#Starter Template Evaluation](../_bmad-output/planning-artifacts/architecture.md)
- [Source: architecture.md#Initialization Commands](../_bmad-output/planning-artifacts/architecture.md)
- [Source: architecture.md#Implementation Patterns & Consistency Rules](../_bmad-output/planning-artifacts/architecture.md)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [yo code Generator](https://github.com/Microsoft/vscode-generator-code)

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

- Fixed `$esbuild-watch` problemMatcher error in `.vscode/tasks.json` by defining inline matcher

### Completion Notes List

- Scaffolded VS Code extension using `yo code` generator
- TypeScript 5.9.3 with strict mode enabled
- esbuild bundler configured, outputs to `dist/extension.js`
- ESLint (flat config) + Prettier configured with lint:fix and format scripts
- Extension activates successfully, "Hello World" command works in Extension Development Host
- Note: Extension name is `code-flow` (not `codeflow`) - created in repo root as this IS the extension project

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-06 | Story created with full context | SM Agent |
| 2026-02-06 | Implemented all tasks, extension scaffold complete | Dev Agent (Claude Opus 4.5) |
| 2026-02-08 | Code review: Fixed .gitignore (H1), tsconfig outDir (H2), package.json description (M1), added real tests (M3) | Code Review (Claude Opus 4.5) |

### File List

_Files created/modified by dev agent:_

```
code-flow/
├── .vscode/
│   ├── launch.json          # (yo code generated)
│   └── tasks.json           # (yo code generated, fixed problemMatcher)
├── src/
│   ├── extension.ts         # (yo code generated)
│   └── test/
│       └── extension.test.ts # (yo code generated)
├── dist/
│   ├── extension.js         # (compiled output)
│   └── extension.js.map
├── .gitignore               # (yo code generated)
├── .prettierrc              # (added)
├── .vscode-test.mjs         # (yo code generated)
├── .vscodeignore            # (yo code generated)
├── CHANGELOG.md             # (yo code generated)
├── eslint.config.mjs        # (yo code generated - flat config)
├── esbuild.js               # (yo code generated)
├── package.json             # (yo code generated, added format/lint:fix scripts)
├── package-lock.json        # (npm install)
├── tsconfig.json            # (yo code generated, strict: true)
├── vsc-extension-quickstart.md # (yo code generated, kept per user request)
└── README.md                # (yo code generated)
```
