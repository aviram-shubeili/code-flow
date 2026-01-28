/**
 * SignInButton Component Tests
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock the auth module
vi.mock('@/auth', () => ({
  signIn: vi.fn(),
}))

import { SignInButton } from '@/components/auth/SignInButton'

describe('SignInButton', () => {
  it('renders sign in button with default text', () => {
    render(<SignInButton />)
    expect(screen.getByText('Sign in with GitHub')).toBeInTheDocument()
  })

  it('renders button with custom text', () => {
    render(<SignInButton>Custom Sign In Text</SignInButton>)
    expect(screen.getByText('Custom Sign In Text')).toBeInTheDocument()
  })

  it('renders as a form with submit button', () => {
    render(<SignInButton />)
    const button = screen.getByRole('button', { name: /sign in/i })
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('applies variant prop to button', () => {
    render(<SignInButton variant="secondary" />)
    const button = screen.getByRole('button', { name: /sign in/i })
    expect(button).toHaveClass('bg-gray-100')
  })

  it('applies size prop to button', () => {
    render(<SignInButton size="lg" />)
    const button = screen.getByRole('button', { name: /sign in/i })
    expect(button).toHaveClass('h-11')
  })
})
