/**
 * Auth.js Middleware (Edge Runtime)
 *
 * Protects routes that require authentication and keeps sessions alive.
 *
 * Uses edge-compatible configuration from auth.config.ts (no database adapter).
 * This allows middleware to run in Edge Runtime without Node.js crypto errors.
 *
 * Middleware automatically:
 * - Checks for valid session (via encrypted cookie, not database)
 * - Redirects to sign-in if unauthenticated
 * - Updates session activity timestamp
 * - Handles session expiration gracefully
 *
 * Protected routes are configured via matcher below.
 *
 * @see https://authjs.dev/guides/edge-compatibility
 */

import NextAuth from 'next-auth'

import authConfig from './auth.config'

/**
 * Export auth middleware using edge-compatible configuration
 * This instantiates NextAuth without the database adapter
 */
export const { auth: middleware } = NextAuth(authConfig)

/**
 * Middleware configuration
 *
 * Protects the following routes:
 * - /dashboard/* - User dashboard and analytics
 * - /repositories/* - Repository management
 * - /settings/* - User settings
 * - /api/profile/* - Profile API endpoints
 * - /api/repositories/* - Repository API endpoints
 * - /api/pull-requests/* - Pull request API endpoints
 * - /api/github/* - GitHub API proxy endpoints
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/repositories/:path*',
    '/settings/:path*',
    '/api/profile/:path*',
    '/api/repositories/:path*',
    '/api/pull-requests/:path*',
    '/api/github/:path*',
  ],
}
