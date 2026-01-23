/**
 * Auth Error Page
 * 
 * Displays meaningful error messages for OAuth authentication failures.
 * Handles various error scenarios:
 * - Configuration errors (server misconfiguration)
 * - AccessDenied (user cancelled OAuth)
 * - Verification errors (invalid/expired tokens)
 * - Network errors
 */

import Link from 'next/link'

import Button from '@/components/ui/Button'

interface AuthErrorPageProps {
  searchParams: Promise<{ error?: string }>
}

/**
 * Map Auth.js error codes to user-friendly messages
 */
const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Server Configuration Error',
    description:
      'There is a problem with the server configuration. Please contact support or try again later.',
  },
  AccessDenied: {
    title: 'Access Denied',
    description:
      'You cancelled the authorization request. Please try signing in again if you want to access CodeFlow.',
  },
  Verification: {
    title: 'Verification Failed',
    description:
      'The sign-in link or token has expired or has already been used. Please request a new sign-in link.',
  },
  OAuthSignin: {
    title: 'OAuth Sign-In Error',
    description: 'An error occurred while attempting to sign in with GitHub. Please try again.',
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description:
      'An error occurred during the OAuth callback. This may be due to network issues or GitHub being temporarily unavailable.',
  },
  OAuthCreateAccount: {
    title: 'Account Creation Error',
    description: 'Could not create your account. Please try again or contact support.',
  },
  EmailCreateAccount: {
    title: 'Email Account Error',
    description: 'Could not create an account with this email address.',
  },
  Callback: {
    title: 'Callback Error',
    description: 'An error occurred in the authentication callback. Please try signing in again.',
  },
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description:
      'This GitHub account is not linked to your CodeFlow account. Please sign in with the account you used to create your profile.',
  },
  SessionRequired: {
    title: 'Session Required',
    description: 'Please sign in to access this page.',
  },
  Default: {
    title: 'Authentication Error',
    description: 'An unexpected error occurred during sign-in. Please try again.',
  },
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams
  const errorType = params.error || 'Default'
  const error = errorMessages[errorType] || errorMessages.Default

  // Log error for monitoring (in production, send to error tracking service)
  console.error('Auth error:', { errorType, timestamp: new Date().toISOString() })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">{error.title}</h1>
          <p className="mt-2 text-sm text-gray-600">{error.description}</p>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-4">
          <Link href="/auth/signin">
            <Button variant="primary" className="w-full">
              Try signing in again
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Go to home page
            </Button>
          </Link>
        </div>

        {/* Support Information */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>If this problem persists, please contact support.</p>
          <p className="mt-1">Error code: {errorType}</p>
        </div>
      </div>
    </div>
  )
}
