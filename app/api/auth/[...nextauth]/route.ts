/**
 * Auth.js API Route Handler
 * 
 * Handles all authentication routes:
 * - GET /api/auth/signin - Sign-in page
 * - GET /api/auth/signout - Sign-out page
 * - POST /api/auth/signin/:provider - Initiate OAuth flow
 * - GET /api/auth/callback/:provider - OAuth callback
 * - GET /api/auth/session - Get current session
 * - POST /api/auth/signout - Sign out
 * 
 * These handlers are exported from the auth.ts configuration.
 */

import { handlers } from '@/auth'

export const { GET, POST } = handlers
