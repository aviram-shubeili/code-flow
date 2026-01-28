/**
 * Auth.js Edge-Compatible Configuration
 * 
 * This configuration works in Edge Runtime (used by middleware).
 * Does NOT include database adapter or any Node.js-specific code.
 * 
 * Shared between:
 * - middleware.ts (Edge Runtime)
 * - auth.ts (extends with database adapter for Node.js Runtime)
 * 
 * @see https://authjs.dev/guides/edge-compatibility
 */

import GitHub from 'next-auth/providers/github'

import type { NextAuthConfig } from 'next-auth'

/**
 * Base Auth.js configuration
 * Edge-compatible - no database adapter, no Prisma
 */
export default {
    providers: [
        GitHub({
            // Request minimal OAuth scopes for PR monitoring
            // read:user - Basic profile information
            // user:email - Access to user email addresses
            // repo:status - Repository status and PR information (read-only)
            authorization: {
                params: {
                    scope: 'read:user user:email repo:status',
                },
            },
        }),
    ],

    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },

    callbacks: {
        /**
         * Authorization callback - runs in Edge Runtime
         * Determines if user can access protected routes
         * Uses session from encrypted cookie (no database query needed)
         */
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isProtectedRoute =
                nextUrl.pathname.startsWith('/dashboard') ||
                nextUrl.pathname.startsWith('/repositories') ||
                nextUrl.pathname.startsWith('/settings') ||
                nextUrl.pathname.startsWith('/api/profile') ||
                nextUrl.pathname.startsWith('/api/repositories') ||
                nextUrl.pathname.startsWith('/api/pull-requests') ||
                nextUrl.pathname.startsWith('/api/github')

            if (isProtectedRoute && !isLoggedIn) {
                return false // Redirect to login
            }

            return true
        },
    },

    // Enable debug logging in development
    debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig
