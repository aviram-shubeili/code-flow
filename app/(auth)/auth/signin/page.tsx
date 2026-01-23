/**
 * Sign-In Page
 * 
 * OAuth sign-in page for GitHub authentication.
 * Displays sign-in button and redirects to dashboard after successful auth.
 */

import { SignInButton } from '@/components/auth'

export const metadata = {
  title: 'Sign In - CodeFlow',
  description: 'Sign in to CodeFlow with your GitHub account',
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome to CodeFlow
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor your pull requests and code reviews in one place
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <SignInButton />
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
            <p className="mt-2">
              We only request read access to your repositories and profile information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
