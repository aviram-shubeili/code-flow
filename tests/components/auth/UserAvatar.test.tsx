/**
 * UserAvatar Component Tests
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { UserAvatar } from '@/components/auth/UserAvatar'

describe('UserAvatar', () => {
  it('renders avatar with image when provided', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      image: 'https://example.com/avatar.jpg',
    }

    render(<UserAvatar user={user} />)
    const img = screen.getByRole('img')
    // Next.js Image component transforms URL, so we check it contains the original
    expect(img).toHaveAttribute('alt', 'John Doe')
    expect(img.getAttribute('src')).toContain('avatar.jpg')
  })

  it('renders initials from name when no image', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      image: null,
    }

    render(<UserAvatar user={user} />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders single initial for single word name', () => {
    const user = {
      name: 'John',
      email: 'john@example.com',
      image: null,
    }

    render(<UserAvatar user={user} />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('renders email initial when no name', () => {
    const user = {
      name: null,
      email: 'john@example.com',
      image: null,
    }

    render(<UserAvatar user={user} />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('renders question mark when no name or email', () => {
    const user = {
      name: null,
      email: null,
      image: null,
    }

    render(<UserAvatar user={user} />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('applies size classes correctly', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      image: null,
    }

    const { rerender } = render(<UserAvatar user={user} size="sm" />)
    expect(screen.getByText('JD')).toHaveClass('h-8', 'w-8')

    rerender(<UserAvatar user={user} size="md" />)
    expect(screen.getByText('JD')).toHaveClass('h-10', 'w-10')

    rerender(<UserAvatar user={user} size="lg" />)
    expect(screen.getByText('JD')).toHaveClass('h-12', 'w-12')
  })

  it('applies custom className', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      image: null,
    }

    render(<UserAvatar user={user} className="custom-class" />)
    expect(screen.getByText('JD')).toHaveClass('custom-class')
  })

  it('uses correct alt text for image based on available data', () => {
    const { rerender } = render(
      <UserAvatar
        user={{ name: 'John Doe', email: 'john@example.com', image: 'https://example.com/1.jpg' }}
      />
    )
    expect(screen.getByAltText('John Doe')).toBeInTheDocument()

    rerender(
      <UserAvatar
        user={{ name: null, email: 'john@example.com', image: 'https://example.com/2.jpg' }}
      />
    )
    expect(screen.getByAltText('john@example.com')).toBeInTheDocument()

    rerender(<UserAvatar user={{ name: null, email: null, image: 'https://example.com/3.jpg' }} />)
    expect(screen.getByAltText('User')).toBeInTheDocument()
  })
})
