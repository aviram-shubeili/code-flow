import { graphql } from '@octokit/graphql';
import { GitHubAuthProvider } from './auth';
import { PullRequest, GitHubUser, DashboardData } from '../types';

export class GitHubClient {
	private graphqlWithAuth: typeof graphql | null = null;

	constructor(private authProvider: GitHubAuthProvider) {}

	private async getGraphQLClient() {
		if (!this.graphqlWithAuth) {
			const token = await this.authProvider.getToken();
			if (!token) {
				throw new Error('Not authenticated');
			}
			this.graphqlWithAuth = graphql.defaults({
				headers: {
					authorization: `token ${token}`,
				},
			});
		}
		return this.graphqlWithAuth;
	}

	async getCurrentUser(): Promise<GitHubUser> {
		const client = await this.getGraphQLClient();
		const response: any = await client(`
			query {
				viewer {
					login
					name
					avatarUrl
					email
				}
			}
		`);
		return response.viewer;
	}

	async getDashboardData(): Promise<DashboardData> {
		const user = await this.getCurrentUser();
		const client = await this.getGraphQLClient();

		// Fetch PRs for review (assigned to user)
		const needsReviewResponse: any = await client(`
			query($login: String!) {
				search(
					query: "type:pr state:open review-requested:$login"
					type: ISSUE
					first: 20
				) {
					nodes {
						... on PullRequest {
							id
							number
							title
							createdAt
							updatedAt
							url
							isDraft
							state
							author {
								login
								avatarUrl
							}
							repository {
								owner {
									login
								}
								name
							}
							reviewDecision
							reviewRequests(first: 10) {
								nodes {
									requestedReviewer {
										... on User {
											login
											avatarUrl
										}
									}
								}
							}
							comments {
								totalCount
							}
							reviewThreads {
								totalCount
							}
						}
					}
				}
			}
		`, { login: user.login });

		// Fetch user's PRs
		const myPRsResponse: any = await client(`
			query($login: String!) {
				search(
					query: "type:pr state:open author:$login"
					type: ISSUE
					first: 20
				) {
					nodes {
						... on PullRequest {
							id
							number
							title
							createdAt
							updatedAt
							url
							isDraft
							state
							author {
								login
								avatarUrl
							}
							repository {
								owner {
									login
								}
								name
							}
							reviewDecision
							reviews(first: 10) {
								nodes {
									author {
										login
										avatarUrl
									}
									state
								}
							}
							comments {
								totalCount
							}
							reviewThreads {
								totalCount
							}
						}
					}
				}
			}
		`, { login: user.login });

		const needsReview = this.transformPRs(needsReviewResponse.search.nodes || []);
		const myPRs = this.transformPRs(myPRsResponse.search.nodes || []);

		// Categorize "returned to you" - PRs where changes were requested
		const returnedToYou = myPRs.filter(
			pr => pr.reviewDecision === 'CHANGES_REQUESTED'
		);

		// Categorize "reviewed-awaiting" - PRs user reviewed that are still open
		// For POC, we'll use a simplified approach
		const reviewedAwaiting: PullRequest[] = [];

		return {
			needsReview,
			returnedToYou,
			myPRs,
			reviewedAwaiting,
			lastUpdated: new Date().toISOString(),
		};
	}

	private transformPRs(nodes: any[]): PullRequest[] {
		return nodes.map(node => ({
			id: node.id,
			number: node.number,
			title: node.title,
			author: {
				login: node.author?.login || 'unknown',
				avatarUrl: node.author?.avatarUrl || '',
			},
			repository: {
				owner: node.repository?.owner?.login || '',
				name: node.repository?.name || '',
			},
			state: node.state,
			isDraft: node.isDraft || false,
			createdAt: node.createdAt,
			updatedAt: node.updatedAt,
			url: node.url,
			reviewDecision: node.reviewDecision,
			reviewers: (node.reviewRequests?.nodes || node.reviews?.nodes || [])
				.map((r: any) => r.requestedReviewer || r.author)
				.filter((r: any) => r && r.login)
				.map((r: any) => ({
					login: r.login,
					avatarUrl: r.avatarUrl,
				})),
			comments: {
				totalCount: node.comments?.totalCount || 0,
			},
			reviewThreads: {
				totalCount: node.reviewThreads?.totalCount || 0,
			},
		}));
	}
}
