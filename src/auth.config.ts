import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const authConfig = {
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAuth = nextUrl.pathname.startsWith('/auth');
      const isOnRoot = nextUrl.pathname === '/';

      // Handle auth pages
      if (isOnAuth) {
        if (isLoggedIn) {
          // Redirect logged-in users away from auth pages to dashboard
          return Response.redirect(new URL('/dashboard', nextUrl));
        } else {
          // Allow unauthenticated users to access auth pages
          return true;
        }
      }

      // Redirect root to appropriate page based on auth status
      if (isOnRoot) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        } else {
          return false;
        }
      }

      // Protect dashboard - require authentication
      if (isOnDashboard) {
        return isLoggedIn;
      }

      // Allow other pages
      return true;
    },
  },
  providers: [GitHub], // GitHub provider for both edge and non-edge environments
} satisfies NextAuthConfig;
