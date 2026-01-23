/**
 * SignInButton Component
 * 
 * Server-side component that uses Auth.js Server Actions to initiate
 * GitHub OAuth flow. Follows the recommended pattern from Auth.js v5 docs.
 * 
 * Usage:
 * ```tsx
 * import { SignInButton } from '@/components/auth'
 * 
 * export default function Page() {
 *   return <SignInButton />
 * }
 * ```
 */

import { signIn } from '@/auth'
import Button from '@/components/ui/Button'

export interface SignInButtonProps {
  /**
   * Redirect URL after successful sign-in
   * @default '/dashboard'
   */
  redirectTo?: string
  /**
   * Button variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  /**
   * Button size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Custom button text
   * @default 'Sign in with GitHub'
   */
  children?: React.ReactNode
}

/**
 * Sign-in button using Server Actions (recommended Auth.js v5 pattern)
 */
export function SignInButton({
  redirectTo = '/dashboard',
  variant = 'primary',
  size = 'md',
  children = 'Sign in with GitHub',
}: SignInButtonProps) {
  return (
    <form
      action={async () => {
        'use server'
        await signIn('github', { redirectTo })
      }}
    >
      <Button type="submit" variant={variant} size={size}>
        {children}
      </Button>
    </form>
  )
}
