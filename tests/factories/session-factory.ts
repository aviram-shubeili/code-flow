import type { Session } from 'next-auth';
import { UserFactory } from './user-factory';

interface CreateSessionOptions {
  user?: Partial<Session['user']>;
  expires?: string;
}

export class SessionFactory {
  static create(options: CreateSessionOptions = {}): Session {
    const defaultExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    return {
      user: UserFactory.create(options.user),
      expires: options.expires || defaultExpires,
    };
  }

  static createExpired(options: CreateSessionOptions = {}): Session {
    const expiredDate = new Date(Date.now() - 60 * 1000).toISOString(); // Expired 1 minute ago
    
    return this.create({
      ...options,
      expires: expiredDate,
    });
  }

  static createWithCustomUser(userOverrides: Partial<Session['user']> = {}): Session {
    return this.create({
      user: userOverrides,
    });
  }

  static createGitHubSession(options: CreateSessionOptions = {}): Session {
    return this.create({
      user: UserFactory.createGitHubUser(options.user),
      expires: options.expires,
    });
  }
}