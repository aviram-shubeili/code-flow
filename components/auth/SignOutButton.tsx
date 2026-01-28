/**
 * SignOutButton Component
 *
 * Server-side component that uses Auth.js Server Actions to sign out users.
 * Follows the recommended pattern from Auth.js v5 docs.
 *
 * Usage:
 * ```tsx
 * import { SignOutButton } from '@/components/auth'
 *
 * export default function Page() {
 *   return <SignOutButton />
 * }
 * ```
 */

import { signOut } from '@/auth'
import Button from '@/components/ui/Button'

export interface SignOutButtonProps {
  /**
   * Redirect URL after sign-out
   * @default '/'
   */
  redirectTo?: string
  /**
   * Button variant
   * @default 'outline'
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  /**
   * Button size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Custom button text
   * @default 'Sign out'
   */
  children?: React.ReactNode
}

/**
 * Sign-out button using Server Actions (recommended Auth.js v5 pattern)
 */
export function SignOutButton({
  redirectTo = '/',
  variant = 'outline',
  size = 'md',
  children = 'Sign out',
}: SignOutButtonProps) {
  return (
    <form
      action={async () => {
        'use server'
        await signOut({ redirectTo })
      }}
    >
      <Button type="submit" variant={variant} size={size}>
        {children}
      </Button>
    </form>
  )
}
