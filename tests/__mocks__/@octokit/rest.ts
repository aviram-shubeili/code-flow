import { vi } from 'vitest'

export class Octokit {
    rest = {
        pulls: {
            list: vi.fn(),
            get: vi.fn(),
            listReviews: vi.fn(),
            listRequestedReviewers: vi.fn(),
        },
        repos: {
            listForAuthenticatedUser: vi.fn(),
            get: vi.fn(),
        },
        rateLimit: {
            get: vi.fn(),
        },
        users: {
            getAuthenticated: vi.fn(),
        },
        issues: {
            listForRepo: vi.fn(),
        },
    }

    constructor() {
        // Mock constructor
    }
}