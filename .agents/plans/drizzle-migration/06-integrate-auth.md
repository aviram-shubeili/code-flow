# Step 6: Integrate Auth.js with Drizzle

**Estimated Time:** 45-60 minutes  
**Prerequisites:** Step 5 completed  
**Dependencies:** Database configured and healthy

## 🎯 Objective

Update Auth.js configuration to use Drizzle adapter instead of Prisma, ensuring authentication works with the new database layer.

## 📋 Tasks

### 6.1 Update Auth.js Configuration

**File: `src/auth.ts`** - Replace with Drizzle integration:

```typescript
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { db } from './db';

// Shared auth configuration
const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
} as const;

// Single Auth.js configuration that works in both Node.js and Edge runtime
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  ...authConfig,
});
```

### 6.2 Update API Route

**File: `src/app/api/auth/[...nextauth]/route.ts`** - Simplify to use handlers:

```typescript
import { handlers } from '@/auth';

export const runtime = 'nodejs'; // Important: Drizzle works in Node.js runtime

export const { GET, POST } = handlers;
```

### 6.3 Remove Problematic Middleware (Temporary)

**File: `src/middleware.ts`** - Comment out or delete temporarily:

```typescript
// Temporarily disabled during Drizzle migration
// We'll re-enable this after confirming Auth.js + Drizzle works

// export { auth as middleware } from '@/auth';

// For now, no middleware - we'll handle auth in pages/components
console.log('Middleware temporarily disabled during Drizzle migration');
```

### 6.4 Create Auth Helper Utilities

**File: `src/lib/auth.ts`** (Create new file):

```typescript
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

/**
 * Get the current session, redirecting to sign-in if not authenticated
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  return session;
}

/**
 * Get the current session without redirecting
 */
export async function getOptionalAuth() {
  return await auth();
}

/**
 * Check if user is authenticated (boolean)
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

/**
 * Get current user or null
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}
```

### 6.5 Create Auth Components

**File: `src/components/auth/signin-button.tsx`** (Create directory and file):

```typescript
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github");
      }}
    >
      <Button type="submit" variant="default">
        Sign in with GitHub
      </Button>
    </form>
  );
}
```

**File: `src/components/auth/signout-button.tsx`**:

```typescript
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <Button type="submit" variant="outline">
        Sign out
      </Button>
    </form>
  );
}
```

**File: `src/components/auth/user-info.tsx`**:

```typescript
import { getCurrentUser } from "@/lib/auth";
import { SignInButton } from "./signin-button";
import { SignOutButton } from "./signout-button";

export async function UserInfo() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Not signed in</span>
        <SignInButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {user.image && (
          <img
            src={user.image}
            alt={user.name || "User"}
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-sm font-medium">{user.name || user.email}</span>
      </div>
      <SignOutButton />
    </div>
  );
}
```

### 6.6 Update Main Page to Test Auth

**File: `src/app/page.tsx`** - Update to test authentication:

```typescript
import { UserInfo } from "@/components/auth/user-info";
import { getOptionalAuth } from "@/lib/auth";

export default async function HomePage() {
  const session = await getOptionalAuth();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">CodeFlow Dashboard</h1>

      <div className="mb-8">
        <UserInfo />
      </div>

      {session?.user ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Welcome back!</h2>
          <p>You are signed in as {session.user.name || session.user.email}</p>

          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-medium mb-2">Session Debug Info:</h3>
            <pre className="text-sm">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Welcome to CodeFlow</h2>
          <p>Please sign in to access your pull request dashboard.</p>
        </div>
      )}
    </div>
  );
}
```

### 6.7 Create Auth Pages (Optional but Recommended)

**File: `src/app/auth/signin/page.tsx`**:

```typescript
import { SignInButton } from "@/components/auth/signin-button";

export default function SignInPage() {
  return (
    <div className="container mx-auto p-8 max-w-md">
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-bold">Sign In to CodeFlow</h1>
        <p className="text-gray-600">
          Connect your GitHub account to access your pull request dashboard.
        </p>
        <SignInButton />
      </div>
    </div>
  );
}
```

**File: `src/app/auth/error/page.tsx`**:

```typescript
export default function AuthErrorPage() {
  return (
    <div className="container mx-auto p-8 max-w-md">
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="text-gray-600">
          There was an error signing you in. Please try again.
        </p>
        <a
          href="/"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
```

### 6.8 Test Database Integration

**File: `src/db/test-auth-integration.ts`** (Create test file):

```typescript
import { db } from './index';
import { users, accounts, sessions } from './schema';

async function testAuthIntegration() {
  try {
    console.log('Testing Auth.js database integration...');

    // Test users table
    const userCount = await db.select().from(users);
    console.log(`✅ Users table accessible, ${userCount.length} users found`);

    // Test accounts table
    const accountCount = await db.select().from(accounts);
    console.log(
      `✅ Accounts table accessible, ${accountCount.length} accounts found`,
    );

    // Test sessions table
    const sessionCount = await db.select().from(sessions);
    console.log(
      `✅ Sessions table accessible, ${sessionCount.length} sessions found`,
    );

    console.log('🎉 Auth.js database integration test passed!');
  } catch (error) {
    console.error('❌ Auth.js database integration test failed:', error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  testAuthIntegration();
}
```

## 🧪 Validation Steps

1. **Test database integration**

```bash
npx tsx src/db/test-auth-integration.ts
```

2. **Check TypeScript compilation**

```bash
npx tsc --noEmit
```

3. **Start development server**

```bash
npm run dev
```

4. **Test authentication flow**

- Visit `http://localhost:3000`
- Click "Sign in with GitHub"
- Complete GitHub OAuth flow
- Verify user data is stored in database

5. **Check database after auth test**

```bash
npm run db:studio
# Verify user, account, and session records were created
```

6. **Test sign out**

- Click "Sign out" button
- Verify session is cleared
- Check database that session is removed

## ⚠️ Expected State After Completion

- **Auth.js using Drizzle adapter** instead of Prisma
- **Authentication flow working** end-to-end
- **User data stored** in PostgreSQL via Drizzle
- **Middleware temporarily disabled** to avoid Edge runtime issues
- **Manual auth checking** implemented in pages/components
- **Debug info visible** on home page for testing

## 📝 Notes

- **Middleware disabled** temporarily - we'll address Edge runtime separately
- **Runtime set to "nodejs"** in API route to ensure compatibility
- **Auth helpers created** for easy auth checking throughout app
- **Components created** for reusable auth UI
- **Debug session info** displayed for development testing

## ✅ Success Criteria

- [ ] Auth.js configuration updated to use Drizzle adapter
- [ ] API route updated and working
- [ ] Middleware temporarily disabled without errors
- [ ] Auth helper utilities created
- [ ] Auth components created and working
- [ ] Home page updated with auth testing
- [ ] Database integration test passes
- [ ] Full authentication flow works (sign in → sign out)
- [ ] User data properly stored in database
- [ ] TypeScript compilation passes
- [ ] Development server starts without errors

## 📊 Update Migration Status

After completing this step:

- [ ] Update the status in `README.md`:
  - Change `- [ ] Step 6: Integrate Auth.js` to `- [x] Step 6: Integrate Auth.js ✅`
  - Add completion timestamp
- [ ] Update `00-migration-overview.md` if needed
- [ ] Note any authentication flow improvements or issues resolved

**Next Step:** Proceed to `07-final-validation.md`
