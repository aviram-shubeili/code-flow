import { http, HttpResponse } from 'msw';

// Mock GitHub API responses for testing
export const githubHandlers = [
  // GitHub OAuth endpoints
  http.get('https://github.com/login/oauth/authorize', () => {
    return HttpResponse.redirect('http://localhost:3000/api/auth/callback/github?code=test-code');
  }),

  http.post('https://github.com/login/oauth/access_token', () => {
    return HttpResponse.json({
      access_token: 'gho_test_token',
      token_type: 'bearer',
      scope: 'read:user,user:email',
    });
  }),

  // GitHub API user endpoint
  http.get('https://api.github.com/user', () => {
    return HttpResponse.json({
      id: 123456,
      login: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: 'https://avatars.githubusercontent.com/u/123456?v=4',
      html_url: 'https://github.com/testuser',
    });
  }),

  // GitHub API user emails endpoint
  http.get('https://api.github.com/user/emails', () => {
    return HttpResponse.json([
      {
        email: 'test@example.com',
        primary: true,
        verified: true,
        visibility: 'public',
      },
    ]);
  }),

  // GitHub GraphQL API
  http.post('https://api.github.com/graphql', async ({ request }) => {
    const body = await request.json() as { query: string; variables?: any };
    
    // Mock pull requests query
    if (body.query.includes('pullRequests')) {
      return HttpResponse.json({
        data: {
          viewer: {
            login: 'testuser',
            pullRequests: {
              nodes: [
                {
                  id: 'PR_1',
                  number: 123,
                  title: 'Test Pull Request',
                  url: 'https://github.com/test/repo/pull/123',
                  author: {
                    login: 'testuser',
                    avatarUrl: 'https://avatars.githubusercontent.com/u/123456?v=4',
                  },
                  reviewDecision: 'REVIEW_REQUIRED',
                  isDraft: false,
                  mergeable: 'MERGEABLE',
                  updatedAt: '2025-01-23T10:00:00Z',
                  additions: 150,
                  deletions: 50,
                  comments: {
                    totalCount: 5,
                  },
                  repository: {
                    name: 'test-repo',
                    owner: {
                      login: 'testorg',
                    },
                  },
                },
              ],
              pageInfo: {
                hasNextPage: false,
                endCursor: null,
              },
            },
          },
        },
      });
    }

    // Default GraphQL response
    return HttpResponse.json({
      data: {},
    });
  }),

  // Rate limiting endpoint
  http.get('https://api.github.com/rate_limit', () => {
    return HttpResponse.json({
      rate: {
        limit: 5000,
        remaining: 4999,
        reset: Math.floor(Date.now() / 1000) + 3600,
      },
    });
  }),
];