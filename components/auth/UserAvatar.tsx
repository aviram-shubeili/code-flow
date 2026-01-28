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

import Image from 'next/image'

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
 * Size mappings for avatar dimensions
 */
const sizeConfig = {
  sm: { className: 'h-8 w-8 text-xs', pixels: 32 },
  md: { className: 'h-10 w-10 text-sm', pixels: 40 },
  lg: { className: 'h-12 w-12 text-base', pixels: 48 },
}

/**
 * Get user initials from name or email
 */
function getUserInitials(user: UserAvatarProps['user']): string {
  if (user.name) {
    const parts = user.name.trim().split(' ').filter(Boolean)
    if (parts.length >= 2) {
      const firstChar = parts[0]?.[0] ?? ''
      const lastChar = parts[parts.length - 1]?.[0] ?? ''
      return `${firstChar}${lastChar}`.toUpperCase()
    }
    const singleChar = parts[0]?.[0]
    if (singleChar) {
      return singleChar.toUpperCase()
    }
  }

  if (user.email) {
    const emailChar = user.email[0]
    if (emailChar) {
      return emailChar.toUpperCase()
    }
  }

  return '?'
}

/**
 * User avatar with image fallback to initials
 */
export function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const config = sizeConfig[size]
  const initials = getUserInitials(user)

  if (user.image) {
    return (
      <Image
        src={user.image}
        alt={user.name || user.email || 'User'}
        width={config.pixels}
        height={config.pixels}
        className={`${config.className} rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`${config.className} flex items-center justify-center rounded-full bg-blue-600 font-semibold text-white ${className}`}
    >
      {initials}
    </div>
  )
}
