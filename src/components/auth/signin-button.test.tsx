import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../lib/test-utils';
import { SignInButton } from './signin-button';

// Mock the auth module
vi.mock('@/auth', () => ({
  signIn: vi.fn(),
}));

describe('SignInButton', () => {
  it('should render sign in button', () => {
    render(<SignInButton />);

    const button = screen.getByRole('button', { name: /sign in with github/i });
    expect(button).toBeInTheDocument();
  });

  it('should have correct button styling', () => {
    render(<SignInButton />);

    const button = screen.getByRole('button', { name: /sign in with github/i });
    expect(button).toHaveClass('bg-blue-600');
    expect(button).toHaveClass('hover:bg-blue-700');
    expect(button).toHaveClass('text-white');
  });

  it('should be a submit button inside a form', () => {
    render(<SignInButton />);

    const form = screen.getByRole('button').closest('form');
    const button = screen.getByRole('button', { name: /sign in with github/i });

    expect(form).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'submit');
  });
});
