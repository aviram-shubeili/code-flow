/**
 * SignOutButton Component Tests
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock the auth module
vi.mock('@/auth', () => ({
  signOut: vi.fn(),
}))

import { SignOutButton } from '@/components/auth/SignOutButton'

describe('SignOutButton', () => {
  it('renders sign out button with default text', () => {
    render(<SignOutButton />)
    expect(screen.getByText('Sign out')).toBeInTheDocument()
  })

  it('renders button with custom text', () => {
    render(<SignOutButton>Custom Sign Out Text</SignOutButton>)
    expect(screen.getByText('Custom Sign Out Text')).toBeInTheDocument()
  })

  it('renders as a form with submit button', () => {
    render(<SignOutButton />)
    const button = screen.getByRole('button', { name: /sign out/i })
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('applies default outline variant', () => {
    render(<SignOutButton />)
    const button = screen.getByRole('button', { name: /sign out/i })
    expect(button).toHaveClass('border')
  })

  it('applies custom variant prop to button', () => {
    render(<SignOutButton variant="primary" />)
    const button = screen.getByRole('button', { name: /sign out/i })
    expect(button).toHaveClass('bg-blue-600')
  })

  it('applies size prop to button', () => {
    render(<SignOutButton size="sm" />)
    const button = screen.getByRole('button', { name: /sign out/i })
    expect(button).toHaveClass('h-9')
  })
})
