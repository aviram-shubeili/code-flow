// Mock GitHub API response types and data for testing
// TODO: Move these interfaces to @/types/github when implementing real GitHub integration

export interface GitHubUser {
    id: number
    login: string
    name: string
    avatar_url: string
    email: string
}

export interface GitHubRepository {
    id: number
    name: string
    full_name: string
    private: boolean
    owner: GitHubUser
    html_url: string
    description: string
    created_at: string
    updated_at: string
}

export interface GitHubPullRequest {
    id: number
    number: number
    title: string
    body: string
    state: 'open' | 'closed'
    user: GitHubUser
    created_at: string
    updated_at: string
    html_url: string
    base: {
        ref: string
        repo: GitHubRepository
    }
    head: {
        ref: string
        repo: GitHubRepository
    }
    draft: boolean
    mergeable: boolean | null
    mergeable_state: string
}

// Mock data for testing
export const mockGitHubUser: GitHubUser = {
    id: 1,
    login: 'testuser',
    name: 'Test User',
    avatar_url: 'https://github.com/images/error/testuser_happy.gif',
    email: 'test@example.com',
}

export const mockRepository: GitHubRepository = {
    id: 1,
    name: 'test-repo',
    full_name: 'testuser/test-repo',
    private: false,
    owner: mockGitHubUser,
    html_url: 'https://github.com/testuser/test-repo',
    description: 'A test repository',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
}

export const mockPullRequest: GitHubPullRequest = {
    id: 1,
    number: 1,
    title: 'Test Pull Request',
    body: 'This is a test pull request',
    state: 'open',
    user: mockGitHubUser,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T12:00:00Z',
    html_url: 'https://github.com/testuser/test-repo/pull/1',
    base: {
        ref: 'main',
        repo: mockRepository,
    },
    head: {
        ref: 'feature-branch',
        repo: mockRepository,
    },
    draft: false,
    mergeable: true,
    mergeable_state: 'clean',
}

// Rate limit response
export const mockRateLimit = {
    resources: {
        core: {
            limit: 5000,
            remaining: 4999,
            reset: 1234567890,
            used: 1,
        },
    },
}

// API response wrappers
export const mockApiResponse = <T>(data: T) => ({
    data,
    status: 200,
    url: 'https://api.github.com/test',
    headers: {},
})

export const mockListPullRequestsResponse = mockApiResponse([mockPullRequest])
export const mockGetPullRequestResponse = mockApiResponse(mockPullRequest)
export const mockListRepositoriesResponse = mockApiResponse([mockRepository])
export const mockGetUserResponse = mockApiResponse(mockGitHubUser)
export const mockGetRateLimitResponse = mockApiResponse(mockRateLimit)