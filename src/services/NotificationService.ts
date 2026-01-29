import * as vscode from 'vscode';
import { PullRequest, DashboardData } from '../types';

interface NotificationState {
	lastNotified: { [prId: string]: string };
}

export class NotificationService {
	private state: NotificationState = { lastNotified: {} };
	private previousData: DashboardData | null = null;

	constructor(private context: vscode.ExtensionContext) {
		// Load previous notification state
		this.state = context.globalState.get('notificationState', { lastNotified: {} });
	}

	async checkAndNotify(newData: DashboardData): Promise<void> {
		if (!this.previousData) {
			// First load, don't send notifications
			this.previousData = newData;
			return;
		}

		// Check for new PRs needing review
		const newNeedsReview = this.findNewPRs(
			this.previousData.needsReview,
			newData.needsReview
		);

		for (const pr of newNeedsReview) {
			await this.notifyNewReviewRequest(pr);
		}

		// Check for PRs returned to user (changes requested)
		const newReturned = this.findNewPRs(
			this.previousData.returnedToYou,
			newData.returnedToYou
		);

		for (const pr of newReturned) {
			await this.notifyChangesRequested(pr);
		}

		// Check for approved PRs
		const newlyApproved = this.findStatusChange(
			this.previousData.myPRs,
			newData.myPRs,
			'APPROVED'
		);

		for (const pr of newlyApproved) {
			await this.notifyApproved(pr);
		}

		this.previousData = newData;
		await this.saveState();
	}

	private findNewPRs(oldList: PullRequest[], newList: PullRequest[]): PullRequest[] {
		const oldIds = new Set(oldList.map(pr => pr.id));
		return newList.filter(pr => !oldIds.has(pr.id));
	}

	private findStatusChange(
		oldList: PullRequest[],
		newList: PullRequest[],
		newStatus: string
	): PullRequest[] {
		const oldMap = new Map(oldList.map(pr => [pr.id, pr]));
		return newList.filter(pr => {
			const old = oldMap.get(pr.id);
			return old && old.reviewDecision !== newStatus && pr.reviewDecision === newStatus;
		});
	}

	private async notifyNewReviewRequest(pr: PullRequest): Promise<void> {
		const action = await vscode.window.showInformationMessage(
			`📋 Review requested: ${pr.title}`,
			'View PR',
			'Open Dashboard'
		);

		if (action === 'View PR') {
			vscode.env.openExternal(vscode.Uri.parse(pr.url));
		} else if (action === 'Open Dashboard') {
			vscode.commands.executeCommand('codeflow.openDashboard');
		}

		this.state.lastNotified[pr.id] = new Date().toISOString();
	}

	private async notifyChangesRequested(pr: PullRequest): Promise<void> {
		const action = await vscode.window.showWarningMessage(
			`🔄 Changes requested on: ${pr.title}`,
			'View PR',
			'Open Dashboard'
		);

		if (action === 'View PR') {
			vscode.env.openExternal(vscode.Uri.parse(pr.url));
		} else if (action === 'Open Dashboard') {
			vscode.commands.executeCommand('codeflow.openDashboard');
		}

		this.state.lastNotified[pr.id] = new Date().toISOString();
	}

	private async notifyApproved(pr: PullRequest): Promise<void> {
		const action = await vscode.window.showInformationMessage(
			`✅ PR approved: ${pr.title}`,
			'View PR',
			'Open Dashboard'
		);

		if (action === 'View PR') {
			vscode.env.openExternal(vscode.Uri.parse(pr.url));
		} else if (action === 'Open Dashboard') {
			vscode.commands.executeCommand('codeflow.openDashboard');
		}

		this.state.lastNotified[pr.id] = new Date().toISOString();
	}

	private async saveState(): Promise<void> {
		await this.context.globalState.update('notificationState', this.state);
	}

	public reset(): void {
		this.previousData = null;
		this.state = { lastNotified: {} };
		this.saveState();
	}
}
