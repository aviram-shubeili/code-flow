/**
 * Auth.js Middleware
 * 
 * Protects routes that require authentication and keeps sessions alive.
 * Middleware automatically:
 * - Checks for valid session
 * - Redirects to sign-in if unauthenticated
 * - Updates session activity timestamp
 * - Handles session expiration gracefully
 * 
 * Protected routes are configured via matcher below.
 */

export { auth as middleware } from '@/auth'

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
