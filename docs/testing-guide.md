# CodeFlow Testing Guide

This document provides comprehensive guidance for testing in the CodeFlow project, covering all layers of the testing pyramid.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Types](#test-types)
3. [Getting Started](#getting-started)
4. [Writing Tests](#writing-tests)
5. [Running Tests](#running-tests)
6. [Debugging Tests](#debugging-tests)
7. [Best Practices](#best-practices)
8. [CI/CD Integration](#cicd-integration)

## Testing Philosophy

CodeFlow follows a comprehensive Test-Driven Development (TDD) approach with multiple testing layers:

- **Unit Tests**: Test individual components and functions in isolation
- **Integration Tests**: Test how different parts work together
- **End-to-End Tests**: Test complete user workflows
- **API Tests**: Validate API endpoints and responses

## Test Types

### Unit Tests (Vitest + React Testing Library)

**Location**: `src/**/*.{test,spec}.{ts,tsx}`

**Purpose**: Test individual components, functions, and utilities in isolation.

**Technologies**:

- Vitest (test runner)
- React Testing Library (component testing)
- MSW (API mocking)
- Jest DOM (custom matchers)

**Example**:

```typescript
import { render, screen } from '@/lib/test-utils';
import { SignInButton } from './signin-button';

describe('SignInButton', () => {
  it('should render sign in button', () => {
    render(<SignInButton />);

    expect(screen.getByRole('button', { name: /sign in with github/i }))
      .toBeInTheDocument();
  });
});
```

### Integration Tests

**Location**: `tests/integration/**/*.{test,spec}.ts`

**Purpose**: Test how different parts of the system work together.

**Categories**:

- Database integration tests
- Authentication flow tests
- API endpoint tests

**Example**:

```typescript
describe('Authentication Integration', () => {
  it('should create session after GitHub OAuth', async () => {
    const result = await mockAuthFunctions.signIn('github');
    expect(result.ok).toBe(true);
  });
});
```

### End-to-End Tests (Playwright)

**Location**: `tests/e2e/**/*.spec.ts`

**Purpose**: Test complete user workflows across browsers.

**Example**:

```typescript
test('should complete authentication flow', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/dashboard/);
});
```

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. PostgreSQL database (via Docker)
3. Environment variables configured

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install
```

### Environment Setup

Create `.env.local` for testing:

```bash
cp .env.local.example .env.local
# Edit .env.local with test values
```

### Database Setup

```bash
# Start test database
npm run docker:up

# Run migrations
npm run db:push
```

## Writing Tests

### Test File Organization

```
src/
├── components/
│   └── auth/
│       ├── signin-button.tsx
│       └── signin-button.test.tsx
└── lib/
    ├── utils.ts
    └── utils.test.ts

tests/
├── integration/
│   ├── auth/
│   ├── api/
│   └── database/
├── e2e/
│   ├── auth-flow.spec.ts
│   └── dashboard.spec.ts
├── factories/
│   ├── user-factory.ts
│   └── session-factory.ts
└── utils/
    └── test-helpers.ts
```

### Test Naming Conventions

- **Files**: `*.test.{ts,tsx}` or `*.spec.{ts,tsx}`
- **Describe blocks**: Use descriptive names that explain what is being tested
- **Test cases**: Use "should" statements that describe expected behavior

### Component Testing Patterns

```typescript
// Use the custom render function for React components
import { render, screen, userEvent } from '@/lib/test-utils';

describe('UserProfile', () => {
  it('should display user information', () => {
    const mockUser = UserFactory.create();

    render(<UserProfile user={mockUser} />);

    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<UserProfile onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(onEdit).toHaveBeenCalled();
  });
});
```

### Test Factories

Use factories to create consistent test data:

```typescript
// tests/factories/user-factory.ts
export class UserFactory {
  static create(overrides = {}) {
    return {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      ...overrides,
    };
  }
}

// In tests
const user = UserFactory.create({ name: 'Custom Name' });
```

### Mocking Guidelines

#### Mock External Dependencies

```typescript
// Mock authentication
vi.mock('@/auth', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock database
vi.mock('@/db', () => ({
  getUser: vi.fn(),
}));
```

#### Use MSW for API Mocking

```typescript
// tests/mocks/handlers.ts
export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json({ users: [] });
  }),
];
```

## Running Tests

### Available Commands

```bash
# All tests
npm test                    # Run all Vitest tests
npm run test:watch         # Watch mode
npm run test:ui            # Vitest UI

# Specific test types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e           # Playwright E2E tests

# Coverage
npm run test:coverage      # Generate coverage report

# E2E specific
npm run test:e2e:ui        # Playwright UI mode
npm run test:e2e:headed    # Run with browser UI
npm run test:e2e:debug     # Debug mode
```

### Test Execution Patterns

```bash
# Run specific test file
npm test signin-button.test.tsx

# Run tests matching pattern
npm test -- --grep "authentication"

# Run tests in specific directory
npm test src/components/

# Run single test
npm test -- --grep "should render sign in button"
```

## Debugging Tests

### Debug Unit Tests

1. **Console logging**:

   ```typescript
   console.log(screen.debug()); // Print DOM structure
   ```

2. **Breakpoints**:
   ```bash
   npm run test:ui  # Use Vitest UI for debugging
   ```

### Debug E2E Tests

1. **Headed mode**:

   ```bash
   npm run test:e2e:headed
   ```

2. **Debug mode**:

   ```bash
   npm run test:e2e:debug
   ```

3. **Screenshots and videos**:
   - Automatic on failure
   - Located in `test-results/`

### Common Issues

#### Test Timeout

```typescript
// Increase timeout for slow operations
test(
  'slow operation',
  async () => {
    // ...
  },
  { timeout: 10000 },
);
```

#### DOM Cleanup

```typescript
// Tests should clean up automatically
// If issues persist, check test setup
afterEach(() => {
  cleanup();
});
```

## Best Practices

### General Principles

1. **Test Behavior, Not Implementation**

   - Focus on what the user sees and does
   - Avoid testing internal component state

2. **Keep Tests Simple**

   - One assertion per test when possible
   - Clear setup, action, assertion structure

3. **Use Descriptive Names**

   ```typescript
   // Good
   test('should show error message when login fails');

   // Bad
   test('login test');
   ```

### Component Testing

1. **Use Semantic Queries**

   ```typescript
   // Preferred
   screen.getByRole('button', { name: /submit/i });
   screen.getByLabelText(/email/i);

   // Avoid
   screen.getByTestId('submit-button');
   ```

2. **Test User Interactions**

   ```typescript
   await user.click(button);
   await user.type(input, 'text');
   ```

3. **Mock External Dependencies**
   - Always mock API calls
   - Mock complex child components when needed

### E2E Testing

1. **Use Page Object Pattern**

   ```typescript
   class LoginPage {
     constructor(private page: Page) {}

     async signIn(email: string, password: string) {
       await this.page.fill('[name="email"]', email);
       await this.page.fill('[name="password"]', password);
       await this.page.click('button[type="submit"]');
     }
   }
   ```

2. **Test Critical User Paths**

   - Authentication flows
   - Core functionality
   - Error scenarios

3. **Keep Tests Independent**
   - Each test should set up its own state
   - Don't rely on test execution order

## CI/CD Integration

### GitHub Actions

The project includes automated testing in CI/CD:

- **Unit & Integration Tests**: Run on all pushes and PRs
- **E2E Tests**: Run on main branch changes
- **Coverage Reports**: Generated and uploaded as artifacts

### Quality Gates

- **Minimum Coverage**: 80% line coverage
- **All Tests Pass**: No failing tests allowed
- **Linting**: Code must pass linting checks

### Local Pre-commit Checks

```bash
# Run all checks before committing
npm run lint
npm run test:coverage
npm run build
```

## Coverage Requirements

- **Overall**: 80% line coverage minimum
- **Components**: 90% coverage target
- **Critical Paths**: 100% coverage required

View coverage report:

```bash
npm run test:coverage
open coverage/index.html
```

## Troubleshooting

### Common Issues

1. **Tests fail in CI but pass locally**

   - Check environment variables
   - Verify database setup
   - Review timing issues

2. **Flaky E2E tests**

   - Add proper waits
   - Use `page.waitForLoadState()`
   - Increase timeouts if necessary

3. **Mock not working**
   - Ensure mock is before import
   - Check mock factory setup
   - Verify MSW handlers

### Getting Help

1. Check existing test examples
2. Review test documentation
3. Run tests in debug mode
4. Check coverage reports for guidance

---

For more specific guidance, refer to the individual test files and their patterns throughout the codebase.
