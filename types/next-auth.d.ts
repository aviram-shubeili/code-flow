/**
 * TypeScript type extensions for Auth.js (NextAuth.js v5)
 *
 * Extends the default Session and User types to include GitHub access token
 * and user ID for authenticated requests to GitHub API.
 */

import 'next-auth'

declare module 'next-auth' {
  /**
   * Extended Session interface
   * Adds accessToken for GitHub API requests and user.id for database queries
   */
  interface Session {
    accessToken?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
