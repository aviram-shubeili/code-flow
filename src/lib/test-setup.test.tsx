import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from './test-utils';
// Use relative path for factories since @ alias for tests doesn't work yet
import { UserFactory } from '../../tests/factories/user-factory';
import { SessionFactory } from '../../tests/factories/session-factory';

describe('Test Setup Verification', () => {
  it('should render with test utilities', () => {
    const TestComponent = () => <div>Hello Test World</div>;

    render(<TestComponent />);

    expect(screen.getByText('Hello Test World')).toBeInTheDocument();
  });

  it('should work with simple assertions', () => {
    expect(1 + 1).toBe(2);
  });

  it('should create mock users with UserFactory', () => {
    const user = UserFactory.create();

    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('image');
    expect(user.email).toBe('test@example.com');
  });

  it('should create mock sessions with SessionFactory', () => {
    const session = SessionFactory.create();

    expect(session).toHaveProperty('user');
    expect(session).toHaveProperty('expires');
    expect(session.user).toHaveProperty('id');
    expect(session.user).toHaveProperty('name');
  });

  it('should create GitHub-specific test data', () => {
    const githubUser = UserFactory.createGitHubUser();
    const githubSession = SessionFactory.createGitHubSession();

    expect(githubUser.name).toBe('GitHub User');
    expect(githubSession.user.name).toBe('GitHub User');
  });
});
