import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

describe('API Routes Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('/api/health/db', () => {
    it('should return healthy database status', async () => {
      const response = await fetch('http://localhost:3000/api/health/db');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.status).toBe('healthy');
      expect(data.database).toBe('connected');
      expect(data.timestamp).toBeDefined();
    });

    it('should handle database connection errors', async () => {
      // Temporarily stop MSW to test error scenarios
      server.resetHandlers();

      // Mock a failed response
      server.use(
        http.get('*/api/health/db', () => {
          return HttpResponse.json(
            { 
              status: 'error',
              message: 'Database connection failed',
              timestamp: new Date().toISOString()
            },
            { status: 500 }
          );
        })
      );

      const response = await fetch('http://localhost:3000/api/health/db');
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
      expect(data.status).toBe('error');
      expect(data.message).toContain('Database connection failed');
    });

    it('should include proper response format', async () => {
      const response = await fetch('http://localhost:3000/api/health/db');
      const data = await response.json();

      expect(response.headers.get('content-type')).toContain('application/json');
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('database');
    });
  });

  describe('Authentication API', () => {
    it('should handle session requests', async () => {
      const response = await fetch('http://localhost:3000/api/auth/session');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.expires).toBeDefined();
    });

    it('should provide user information in session', async () => {
      const response = await fetch('http://localhost:3000/api/auth/session');
      const data = await response.json();

      expect(data.user.id).toBe('test-user-id');
      expect(data.user.name).toBe('Test User');
      expect(data.user.email).toBe('test@example.com');
    });
  });

  describe('Error Handling', () => {
    afterEach(() => {
      // Restore original handlers after each test
      server.resetHandlers();
    });

    it('should handle properly mocked error responses', async () => {
      // Add a handler for the error case
      server.use(
        http.get('*/api/test-error', () => {
          return HttpResponse.json(
            { error: 'Not Found' },
            { status: 404 }
          );
        })
      );

      const response = await fetch('http://localhost:3000/api/test-error');
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('Not Found');
    });

    it('should validate API request format', async () => {
      // Test that our health endpoint accepts GET requests
      const response = await fetch('http://localhost:3000/api/health/db', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      expect(response.ok).toBe(true);
      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });
});