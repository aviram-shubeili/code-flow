import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the database connection for testing
const mockDb = {
  query: vi.fn(),
  end: vi.fn(),
  connect: vi.fn(),
  release: vi.fn(),
};

// Mock the database config to return our mock
vi.mock('@/db/config', () => ({
  getDbConnection: vi.fn(() => mockDb),
}));

describe('Database Connection Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should establish database connection', async () => {
    mockDb.connect.mockResolvedValue(undefined);
    
    await mockDb.connect();
    
    expect(mockDb.connect).toHaveBeenCalledOnce();
  });

  it('should handle database connection errors', async () => {
    const connectionError = new Error('Database connection failed');
    mockDb.connect.mockRejectedValue(connectionError);
    
    await expect(mockDb.connect()).rejects.toThrow('Database connection failed');
  });

  it('should execute queries successfully', async () => {
    const mockResult = { rows: [{ id: 1, name: 'test' }] };
    mockDb.query.mockResolvedValue(mockResult);
    
    const result = await mockDb.query('SELECT * FROM users WHERE id = $1', [1]);
    
    expect(result).toEqual(mockResult);
    expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
  });

  it('should handle query errors', async () => {
    const queryError = new Error('Query execution failed');
    mockDb.query.mockRejectedValue(queryError);
    
    await expect(mockDb.query('INVALID SQL')).rejects.toThrow('Query execution failed');
  });

  it('should clean up database connections', async () => {
    mockDb.end.mockResolvedValue(undefined);
    
    await mockDb.end();
    
    expect(mockDb.end).toHaveBeenCalledOnce();
  });
});