// Mock database fixtures for testing
export interface MockUser {
  id: string
  name: string
  email: string
  image: string
  githubId: number
  accessToken: string
  refreshToken?: string
  createdAt: Date
  updatedAt: Date
}

export interface MockRepository {
  id: string
  githubId: number
  name: string
  fullName: string
  isPrivate: boolean
  description?: string
  userId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MockSession {
  user: {
    id: string
    name: string
    email: string
    image: string
  }
  expires: string
}

// Mock user data
export const mockUser: MockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  image: 'https://github.com/images/error/testuser_happy.gif',
  githubId: 12345,
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2023-01-02T00:00:00Z'),
}

// Mock repository data
export const mockDbRepository: MockRepository = {
  id: 'repo-1',
  githubId: 1,
  name: 'test-repo',
  fullName: 'testuser/test-repo',
  isPrivate: false,
  description: 'A test repository',
  userId: mockUser.id,
  isActive: true,
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2023-01-02T00:00:00Z'),
}

// Mock session data
export const mockSession: MockSession = {
  user: {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    image: mockUser.image,
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
}
