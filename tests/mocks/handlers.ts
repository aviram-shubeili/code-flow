import { http, HttpResponse } from 'msw';
import { githubHandlers } from './github-api';

export const handlers = [
  // Auth.js endpoints
  http.get('*/api/auth/session', () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://avatars.githubusercontent.com/u/123456?v=4',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }),

  http.post('*/api/auth/signin/github', () => {
    return HttpResponse.json({ url: '/auth/signin' });
  }),

  http.post('*/api/auth/signout', () => {
    return HttpResponse.json({ url: '/' });
  }),

  // Health check endpoint
  http.get('*/api/health/db', () => {
    return HttpResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  }),

  // GitHub API handlers
  ...githubHandlers,
];