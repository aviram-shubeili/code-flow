/**
 * UserAvatar Component
 * 
 * Displays user avatar with fallback to initials.
 * Works with Auth.js session data.
 * 
 * Usage:
 * ```tsx
 * import { auth } from '@/auth'
 * import { UserAvatar } from '@/components/auth'
 * 
 * export default async function Page() {
 *   const session = await auth()
 *   if (!session) return null
 *   
 *   return <UserAvatar user={session.user} />
 * }
 * ```
 */

export interface UserAvatarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  /**
   * Avatar size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Get user initials from name or email
 */
function getUserInitials(user: UserAvatarProps['user']): string {
  if (user.name) {
    const parts = user.name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return parts[0][0].toUpperCase()
  }

  if (user.email) {
    return user.email[0].toUpperCase()
  }

  return '?'
}

/**
 * User avatar with image fallback to initials
 */
export function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }

  const initials = getUserInitials(user)

  if (user.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt={user.name || user.email || 'User'}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-blue-600 font-semibold text-white ${className}`}
    >
      {initials}
    </div>
  )
}
