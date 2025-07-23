import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../lib/test-utils';
import { SignOutButton } from './signout-button';

// Mock the auth module
vi.mock('@/auth', () => ({
  signOut: vi.fn(),
}));

describe('SignOutButton', () => {
  it('should render sign out button', () => {
    render(<SignOutButton />);
    
    const button = screen.getByRole('button', { name: /sign out/i });
    expect(button).toBeInTheDocument();
  });

  it('should have correct button styling', () => {
    render(<SignOutButton />);
    
    const button = screen.getByRole('button', { name: /sign out/i });
    expect(button).toHaveClass('bg-white');
    expect(button).toHaveClass('hover:bg-gray-50');
    expect(button).toHaveClass('text-gray-900');
    expect(button).toHaveClass('border');
  });

  it('should be a submit button inside a form', () => {
    render(<SignOutButton />);
    
    const form = screen.getByRole('button').closest('form');
    const button = screen.getByRole('button', { name: /sign out/i });
    
    expect(form).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should have accessible focus styles', () => {
    render(<SignOutButton />);
    
    const button = screen.getByRole('button', { name: /sign out/i });
    expect(button).toHaveClass('focus-visible:ring-2');
    expect(button).toHaveClass('focus-visible:ring-blue-500');
  });
});