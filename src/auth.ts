import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from './db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  session: {
    strategy: 'jwt', // Use JWT for Edge compatibility
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // Only persist user id to the token - access tokens are stored securely in DB
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client (no sensitive tokens)
      if (token) {
        session.user.id = token.userId;
      }
      return session;
    },
  },
  // Allow account linking to resolve OAuthAccountNotLinked error
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});
