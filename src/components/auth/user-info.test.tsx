import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../lib/test-utils';
import { UserInfo } from './user-info';
import * as authUtils from '@/lib/authUtils';

// Mock the auth utilities
vi.mock('@/lib/authUtils', () => ({
  getCurrentUser: vi.fn(),
}));

// Mock child components
vi.mock('./signin-button', () => ({
  SignInButton: () => <button>Sign in with GitHub</button>,
}));

vi.mock('./signout-button', () => ({
  SignOutButton: () => <button>Sign out</button>,
}));

describe('UserInfo', () => {
  const mockGetCurrentUser = vi.mocked(authUtils.getCurrentUser);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show sign in button when user is not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    render(await UserInfo());
    
    expect(screen.getByText('Not signed in')).toBeInTheDocument();
    expect(screen.getByText('Sign in with GitHub')).toBeInTheDocument();
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  });

  it('should show user info when user is authenticated', async () => {
    const mockUser = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.jpg',
    };

    mockGetCurrentUser.mockResolvedValue(mockUser);

    render(await UserInfo());
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
    expect(screen.queryByText('Not signed in')).not.toBeInTheDocument();
  });

  it('should show user email when name is not available', async () => {
    const mockUser = {
      id: 'test-user',
      name: null,
      email: 'test@example.com',
      image: 'https://example.com/avatar.jpg',
    };

    mockGetCurrentUser.mockResolvedValue(mockUser);

    render(await UserInfo());
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('should show user avatar when available', async () => {
    const mockUser = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.jpg',
    };

    mockGetCurrentUser.mockResolvedValue(mockUser);

    render(await UserInfo());
    
    const avatar = screen.getByRole('img', { name: 'Test User' });
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(avatar).toHaveClass('h-8 w-8 rounded-full');
  });

  it('should not show avatar when image is not available', async () => {
    const mockUser = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    };

    mockGetCurrentUser.mockResolvedValue(mockUser);

    render(await UserInfo());
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});