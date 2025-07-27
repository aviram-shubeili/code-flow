import type { User } from 'next-auth';

export interface CreateUserOptions {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export class UserFactory {
  static create(options: CreateUserOptions = {}): User {
    const defaultUser: User = {
      id: `user-${Math.random().toString(36).substring(7)}`,
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://avatars.githubusercontent.com/u/123456?v=4',
    };

    return {
      ...defaultUser,
      ...options,
    };
  }

  static createMany(count: number, options: CreateUserOptions = {}): User[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        ...options,
        id: `user-${index + 1}`,
        email: `test${index + 1}@example.com`,
        name: `Test User ${index + 1}`,
      }),
    );
  }

  static createGitHubUser(options: CreateUserOptions = {}): User {
    return this.create({
      name: 'GitHub User',
      email: 'github.user@example.com',
      image: 'https://avatars.githubusercontent.com/u/123456?v=4',
      ...options,
    });
  }
}
