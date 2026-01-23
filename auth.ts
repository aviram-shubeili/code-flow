/**
 * Auth.js v5 Configuration
 * 
 * Configures NextAuth with GitHub OAuth provider and Prisma database adapter.
 * Uses database sessions (NOT JWT) as per architecture requirements.
 * 
 * Environment Variables Required:
 * - AUTH_SECRET: Generated with `npx auth secret`
 * - AUTH_GITHUB_ID: GitHub OAuth App Client ID
 * - AUTH_GITHUB_SECRET: GitHub OAuth App Client Secret
 * 
 * @see https://authjs.dev/
 */

import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

import { PrismaAdapter } from '@auth/prisma-adapter'

import { db } from '@/lib/database'
import { prisma } from '@/lib/prisma'

/**
 * NextAuth.js v5 configuration
 * 
 * Key features:
 * - GitHub OAuth with minimal scopes (read:user, user:email, repo:status)
 * - Database sessions with 7-day expiration
 * - UserProfile creation on first sign-in
 * - Access token stored in session for GitHub API requests
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  
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

  session: {
    // Use database sessions (NOT JWT) as per architecture
    strategy: 'database',
    // Sessions expire after 7 days of inactivity
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  },

  callbacks: {
    /**
     * Session callback - adds GitHub access token to session
     * This allows server-side components to make authenticated GitHub API requests
     */
    async session({ session, user }) {
      try {
        // Fetch GitHub account to get access token
        const account = await prisma.account.findFirst({
          where: { 
            userId: user.id, 
            provider: 'github' 
          },
        })

        if (account?.access_token) {
          // Add access token to session for GitHub API requests
          session.accessToken = account.access_token
        }

        // Add user ID to session for database queries
        session.user.id = user.id

        return session
      } catch (error) {
        console.error('Session callback error:', error)
        return session
      }
    },

    /**
     * Sign-in callback - creates UserProfile on first sign-in
     * Uses DatabaseService to maintain data consistency
     */
    async signIn({ user, account, profile }) {
      try {
        // Only process GitHub sign-ins
        if (account?.provider !== 'github' || !profile) {
          return true
        }

        // Check if UserProfile already exists
        const existingProfile = await db.getUserProfile(user.id)

        if (!existingProfile) {
          // Create UserProfile for new users
          const githubProfile = profile as { login: string; id: number }
          
          await db.createUserProfile({
            userId: user.id,
            githubId: githubProfile.id,
            username: githubProfile.login,
          })

          console.log(`Created UserProfile for user ${user.id} (${githubProfile.login})`)
        } else {
          // Update last active timestamp for returning users
          await db.updateUserLastActive(user.id)
        }

        return true
      } catch (error) {
        console.error('Sign-in callback error:', error)
        // Allow sign-in even if UserProfile creation fails
        // This prevents auth lockout on database errors
        return true
      }
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  // Enable debug logging in development
  debug: process.env.NODE_ENV === 'development',
})
