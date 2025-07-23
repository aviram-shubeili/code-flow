/**
 * Auth.js Module Augmentation
 *
 * This file extends the default Auth.js types to include custom properties
 * that CodeFlow adds to sessions, users, and JWT tokens.
 *
 * By augmenting these modules, we get full type safety for our custom
 * authentication properties without needing type assertions.
 */

import type { DefaultSession, DefaultUser } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Session interface with custom properties
   *
   * Extends the default session to include user ID, which is essential
   * for CodeFlow's user-specific PR tracking functionality.
   */
  interface Session {
    user: {
      /** User's unique identifier from the database */
      id: string;
    } & DefaultSession['user'];
  }

  /**
   * User interface with explicit ID typing
   *
   * Ensures that user objects always have a string ID, which is
   * required for our database schema and session management.
   */
  interface User extends DefaultUser {
    /** User's unique identifier (overrides DefaultUser.id which can be string | undefined) */
    id: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * JWT token interface with custom properties
   *
   * Adds userId to the JWT payload for session persistence.
   * This allows us to maintain user context across requests
   * without storing sensitive data in the token.
   */
  interface JWT extends DefaultJWT {
    /** User's unique identifier stored in the JWT token */
    userId: string;
  }
}

export {};
