import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

// TODO: Add Drizzle adapter in Step 6 of migration
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
});