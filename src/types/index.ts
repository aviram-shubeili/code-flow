export interface PullRequest {
	id: string;
	number: number;
	title: string;
	author: {
		login: string;
		avatarUrl: string;
	};
	repository: {
		owner: string;
		name: string;
	};
	state: 'OPEN' | 'CLOSED' | 'MERGED';
	isDraft: boolean;
	createdAt: string;
	updatedAt: string;
	url: string;
	reviewDecision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED' | null;
	reviewers: Array<{
		login: string;
		avatarUrl: string;
	}>;
	comments: {
		totalCount: number;
	};
	reviewThreads: {
		totalCount: number;
	};
}

export interface DashboardData {
	needsReview: PullRequest[];
	returnedToYou: PullRequest[];
	myPRs: PullRequest[];
	reviewedAwaiting: PullRequest[];
	lastUpdated: string;
}

export interface GitHubUser {
	login: string;
	name: string;
	avatarUrl: string;
	email: string;
}
