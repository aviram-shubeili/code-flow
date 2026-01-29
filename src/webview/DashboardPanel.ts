import * as vscode from 'vscode';
import { GitHubClient } from '../github/client';
import { DashboardData } from '../types';

export class DashboardPanel {
	public static currentPanel: DashboardPanel | undefined;
	private static readonly viewType = 'codeflowDashboard';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];
	private _githubClient: GitHubClient;

	public static async createOrShow(extensionUri: vscode.Uri, githubClient: GitHubClient) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (DashboardPanel.currentPanel) {
			DashboardPanel.currentPanel._panel.reveal(column);
			await DashboardPanel.currentPanel.refresh();
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			DashboardPanel.viewType,
			'CodeFlow Dashboard',
			column || vscode.ViewColumn.One,
			{
				enableScripts: true,
				localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
				retainContextWhenHidden: true,
			}
		);

		DashboardPanel.currentPanel = new DashboardPanel(panel, extensionUri, githubClient);
		await DashboardPanel.currentPanel.refresh();
	}

	public static async refresh() {
		if (DashboardPanel.currentPanel) {
			await DashboardPanel.currentPanel.refresh();
		}
	}

	public static dispose() {
		DashboardPanel.currentPanel?.dispose();
		DashboardPanel.currentPanel = undefined;
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, githubClient: GitHubClient) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this._githubClient = githubClient;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.command) {
					case 'refresh':
						await this.refresh();
						return;
					case 'openPR':
						if (message.url) {
							vscode.env.openExternal(vscode.Uri.parse(message.url));
						}
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public async refresh() {
		try {
			const data = await this._githubClient.getDashboardData();
			this._panel.webview.postMessage({ command: 'updateData', data });
		} catch (error: any) {
			vscode.window.showErrorMessage(`Failed to refresh: ${error.message}`);
		}
	}

	private _update() {
		const webview = this._panel.webview;
		this._panel.webview.html = this._getHtmlForWebview(webview);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>CodeFlow Dashboard</title>
	<style>
		* {
			box-sizing: border-box;
		}
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
			padding: 20px;
			margin: 0;
			color: var(--vscode-foreground);
			background-color: var(--vscode-editor-background);
		}
		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20px;
			padding-bottom: 15px;
			border-bottom: 1px solid var(--vscode-panel-border);
		}
		.header h1 {
			margin: 0;
			font-size: 24px;
			font-weight: 600;
		}
		.last-updated {
			font-size: 12px;
			color: var(--vscode-descriptionForeground);
		}
		.refresh-btn {
			background: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			padding: 6px 14px;
			border-radius: 2px;
			cursor: pointer;
			font-size: 13px;
		}
		.refresh-btn:hover {
			background: var(--vscode-button-hoverBackground);
		}
		.dashboard {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 20px;
			margin-top: 20px;
		}
		.section {
			border: 1px solid var(--vscode-panel-border);
			border-radius: 6px;
			padding: 16px;
			background: var(--vscode-sideBar-background);
		}
		.section-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 12px;
		}
		.section-title {
			font-size: 16px;
			font-weight: 600;
			margin: 0;
		}
		.section-count {
			background: var(--vscode-badge-background);
			color: var(--vscode-badge-foreground);
			padding: 2px 8px;
			border-radius: 10px;
			font-size: 12px;
			font-weight: 600;
		}
		.pr-list {
			list-style: none;
			padding: 0;
			margin: 0;
		}
		.pr-card {
			border: 1px solid var(--vscode-panel-border);
			border-radius: 4px;
			padding: 12px;
			margin-bottom: 8px;
			cursor: pointer;
			transition: background-color 0.2s;
		}
		.pr-card:hover {
			background: var(--vscode-list-hoverBackground);
		}
		.pr-title {
			font-weight: 500;
			margin-bottom: 6px;
			font-size: 14px;
		}
		.pr-meta {
			display: flex;
			gap: 12px;
			font-size: 12px;
			color: var(--vscode-descriptionForeground);
		}
		.pr-badge {
			background: var(--vscode-badge-background);
			color: var(--vscode-badge-foreground);
			padding: 2px 6px;
			border-radius: 3px;
			font-size: 11px;
		}
		.empty-state {
			text-align: center;
			padding: 40px 20px;
			color: var(--vscode-descriptionForeground);
		}
		.loading {
			text-align: center;
			padding: 40px;
			font-size: 14px;
			color: var(--vscode-descriptionForeground);
		}
	</style>
</head>
<body>
	<div class="header">
		<div>
			<h1>CodeFlow Dashboard</h1>
			<div class="last-updated" id="lastUpdated">Loading...</div>
		</div>
		<button class="refresh-btn" onclick="refresh()">Refresh</button>
	</div>

	<div class="dashboard" id="dashboard">
		<div class="loading">Loading pull requests...</div>
	</div>

	<script>
		const vscode = acquireVsCodeApi();
		let currentData = null;

		function refresh() {
			vscode.postMessage({ command: 'refresh' });
		}

		function openPR(url) {
			vscode.postMessage({ command: 'openPR', url });
		}

		function formatDate(dateString) {
			const date = new Date(dateString);
			const now = new Date();
			const diff = now.getTime() - date.getTime();
			const hours = Math.floor(diff / (1000 * 60 * 60));
			const days = Math.floor(hours / 24);
			
			if (days > 0) {
				return days === 1 ? '1 day ago' : days + ' days ago';
			} else if (hours > 0) {
				return hours === 1 ? '1 hour ago' : hours + ' hours ago';
			} else {
				return 'Just now';
			}
		}

		function renderPRCard(pr) {
			const statusBadge = pr.reviewDecision ? 
				'<span class="pr-badge">' + pr.reviewDecision.replace('_', ' ') + '</span>' : '';
			
			return '<li class="pr-card" onclick="openPR(\'' + pr.url + '\')">' +
				'<div class="pr-title">' + pr.title + '</div>' +
				'<div class="pr-meta">' +
					'<span>' + pr.repository.owner + '/' + pr.repository.name + '#' + pr.number + '</span>' +
					'<span>by ' + pr.author.login + '</span>' +
					'<span>' + formatDate(pr.updatedAt) + '</span>' +
					'<span>💬 ' + pr.comments.totalCount + '</span>' +
					statusBadge +
				'</div>' +
			'</li>';
		}

		function renderSection(title, prs) {
			const prCards = prs.length > 0 
				? '<ul class="pr-list">' + prs.map(renderPRCard).join('') + '</ul>'
				: '<div class="empty-state">No pull requests</div>';

			return '<div class="section">' +
				'<div class="section-header">' +
					'<h2 class="section-title">' + title + '</h2>' +
					'<span class="section-count">' + prs.length + '</span>' +
				'</div>' +
				prCards +
			'</div>';
		}

		function updateDashboard(data) {
			currentData = data;
			
			const lastUpdated = document.getElementById('lastUpdated');
			lastUpdated.textContent = 'Last updated: ' + formatDate(data.lastUpdated);

			const dashboard = document.getElementById('dashboard');
			dashboard.innerHTML = 
				renderSection('Needs Review', data.needsReview) +
				renderSection('Returned to You', data.returnedToYou) +
				renderSection('My PRs', data.myPRs) +
				renderSection('Reviewed-Awaiting', data.reviewedAwaiting);
		}

		// Listen for messages from the extension
		window.addEventListener('message', event => {
			const message = event.data;
			switch (message.command) {
				case 'updateData':
					updateDashboard(message.data);
					break;
			}
		});

		// Request initial data
		setTimeout(() => {
			vscode.postMessage({ command: 'refresh' });
		}, 100);
	</script>
</body>
</html>`;
	}

	public dispose() {
		DashboardPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}
}
