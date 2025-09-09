import { auth } from '@/auth';

/**
 * Get the current session (Auth.js standard pattern)
 * Use this in Server Components and Server Actions
 */
export const getSession = auth;

/**
 * Server-side auth check for pages that need user data
 * Returns session or null - let the UI handle the redirect
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}
