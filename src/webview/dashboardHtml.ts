import * as vscode from 'vscode';

export function getNonce(): string {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i += 1) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export function getDashboardHtml(webview: vscode.Webview, nonce: string): string {
	const csp = `default-src 'none'; img-src ${webview.cspSource} https: data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';`;
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="${csp}">
	<title>CodeFlow Dashboard</title>
	<style>
		* {
			box-sizing: border-box;
		}
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
			padding: 24px;
			margin: 0;
			color: var(--vscode-foreground);
			background: linear-gradient(135deg, var(--vscode-editor-background) 0%, rgba(0,0,0,0.05) 100%);
			min-height: 100vh;
		}
		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 32px;
			padding: 20px 24px;
			border-radius: 12px;
			background: var(--vscode-sideBar-background);
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
			border: 1px solid var(--vscode-panel-border);
		}
		.header h1 {
			margin: 0;
			font-size: 28px;
			font-weight: 700;
			background: linear-gradient(135deg, var(--vscode-textLink-foreground), var(--vscode-textLink-activeForeground));
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}
		.last-updated {
			font-size: 12px;
			color: var(--vscode-descriptionForeground);
			margin-top: 4px;
			opacity: 0.8;
		}
		.refresh-btn {
			background: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			padding: 8px 18px;
			border-radius: 6px;
			cursor: pointer;
			font-size: 13px;
			font-weight: 500;
			transition: all 0.2s ease;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		}
		.refresh-btn:hover {
			background: var(--vscode-button-hoverBackground);
			transform: translateY(-1px);
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
		}
		.refresh-btn:active {
			transform: translateY(0);
		}
		.dashboard {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
			gap: 24px;
			margin-top: 20px;
		}
		@media (max-width: 1200px) {
			.dashboard {
				grid-template-columns: 1fr;
			}
		}
		.section {
			border: 1px solid var(--vscode-panel-border);
			border-radius: 12px;
			padding: 20px;
			background: var(--vscode-sideBar-background);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
			transition: all 0.3s ease;
			position: relative;
			overflow: hidden;
		}
		.section::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 3px;
			background: linear-gradient(90deg, var(--vscode-textLink-foreground), var(--vscode-textLink-activeForeground));
			opacity: 0;
			transition: opacity 0.3s ease;
		}
		.section:hover {
			transform: translateY(-2px);
			box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
		}
		.section:hover::before {
			opacity: 1;
		}
		.section-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 16px;
		}
		.section-title {
			font-size: 17px;
			font-weight: 700;
			margin: 0;
			display: flex;
			align-items: center;
			gap: 8px;
		}
		.section-title::before {
			content: '📋';
			font-size: 20px;
		}
		.section:nth-child(1) .section-title::before { content: '👀'; }
		.section:nth-child(2) .section-title::before { content: '🔄'; }
		.section:nth-child(3) .section-title::before { content: '✍️'; }
		.section:nth-child(4) .section-title::before { content: '✅'; }
		.section-count {
			background: linear-gradient(135deg, var(--vscode-badge-background), rgba(0, 100, 200, 0.8));
			color: var(--vscode-badge-foreground);
			padding: 4px 12px;
			border-radius: 12px;
			font-size: 12px;
			font-weight: 700;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
			min-width: 24px;
			text-align: center;
		}
		.pr-list {
			list-style: none;
			padding: 0;
			margin: 0;
		}
		.pr-card {
			border: 1px solid var(--vscode-panel-border);
			border-radius: 8px;
			padding: 14px;
			margin-bottom: 10px;
			cursor: pointer;
			transition: all 0.2s ease;
			background: var(--vscode-editor-background);
			position: relative;
			overflow: hidden;
		}
		.pr-card::before {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			bottom: 0;
			width: 4px;
			background: var(--vscode-textLink-foreground);
			transform: scaleY(0);
			transition: transform 0.2s ease;
		}
		.pr-card:hover {
			background: var(--vscode-list-hoverBackground);
			transform: translateX(4px);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
			border-color: var(--vscode-textLink-foreground);
		}
		.pr-card:hover::before {
			transform: scaleY(1);
		}
		.pr-title {
			font-weight: 600;
			margin-bottom: 8px;
			font-size: 14px;
			line-height: 1.4;
			color: var(--vscode-foreground);
		}
		.pr-meta {
			display: flex;
			gap: 12px;
			font-size: 12px;
			color: var(--vscode-descriptionForeground);
			flex-wrap: wrap;
		}
		.pr-meta > span {
			display: inline-flex;
			align-items: center;
			gap: 4px;
		}
		.pr-badge {
			background: linear-gradient(135deg, var(--vscode-badge-background), rgba(100, 100, 255, 0.6));
			color: var(--vscode-badge-foreground);
			padding: 3px 8px;
			border-radius: 4px;
			font-size: 11px;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}
		.empty-state {
			text-align: center;
			padding: 60px 20px;
			color: var(--vscode-descriptionForeground);
			font-size: 14px;
			opacity: 0.7;
		}
		.empty-state::before {
			content: '📭';
			display: block;
			font-size: 48px;
			margin-bottom: 12px;
		}
		.loading {
			text-align: center;
			padding: 60px;
			font-size: 14px;
			color: var(--vscode-descriptionForeground);
		}
		.loading::before {
			content: '⏳';
			display: block;
			font-size: 48px;
			margin-bottom: 12px;
			animation: spin 2s linear infinite;
		}
		@keyframes spin {
			from { transform: rotate(0deg); }
			to { transform: rotate(360deg); }
		}
		.error-state {
			text-align: center;
			padding: 60px 20px;
			color: var(--vscode-errorForeground);
		}
		.error-state::before {
			content: '⚠️';
			display: block;
			font-size: 48px;
			margin-bottom: 12px;
		}
		.error-actions {
			margin-top: 20px;
			display: flex;
			gap: 12px;
			justify-content: center;
		}
		.error-btn {
			background: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			padding: 8px 16px;
			border-radius: 6px;
			cursor: pointer;
			font-size: 13px;
			font-weight: 500;
			transition: all 0.2s ease;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		}
		.error-btn:hover {
			transform: translateY(-1px);
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
		}
		.error-btn.secondary {
			background: var(--vscode-button-secondaryBackground);
			color: var(--vscode-button-secondaryForeground);
		}
	</style>
</head>
<body>
	<div class="header">
		<div>
			<h1>CodeFlow Dashboard</h1>
			<div class="last-updated" id="lastUpdated">Loading...</div>
		</div>
		<button class="refresh-btn" id="refreshBtn">Refresh</button>
	</div>

	<div class="dashboard" id="dashboard">
		<div class="loading">Loading pull requests...</div>
	</div>

	<script nonce="${nonce}">
		const vscode = acquireVsCodeApi();
		let currentData = null;
		let pendingRequestTimer = null;

		function setLoadingState() {
			const dashboard = document.getElementById('dashboard');
			dashboard.innerHTML = '<div class="loading">Loading pull requests...</div>';
		}

		function startRequestTimeout() {
			clearRequestTimeout();
			pendingRequestTimer = setTimeout(() => {
				showError('No response from the extension. Try reload the window or restart the extension host.', false);
			}, 10000);
		}

		function clearRequestTimeout() {
			if (pendingRequestTimer) {
				clearTimeout(pendingRequestTimer);
				pendingRequestTimer = null;
			}
		}

		function refresh() {
			setLoadingState();
			startRequestTimeout();
			vscode.postMessage({ command: 'refresh' });
		}

		function authenticate() {
			vscode.postMessage({ command: 'authenticate' });
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

		function renderPRCard(pr, sectionKey, index) {
			const statusBadge = pr.reviewDecision ? 
				'<span class="pr-badge">' + pr.reviewDecision.replace('_', ' ') + '</span>' : '';
			
			return '<li class="pr-card" data-section="' + sectionKey + '" data-index="' + index + '">' +
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

		function renderSection(title, prs, sectionKey) {
			const prCards = prs.length > 0 
				? '<ul class="pr-list">' + prs.map((pr, index) => renderPRCard(pr, sectionKey, index)).join('') + '</ul>'
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
			clearRequestTimeout();
			currentData = data;
			
			const lastUpdated = document.getElementById('lastUpdated');
			lastUpdated.textContent = 'Last updated: ' + formatDate(data.lastUpdated);

			const dashboard = document.getElementById('dashboard');
			dashboard.innerHTML = 
				renderSection('Needs Review', data.needsReview, 'needsReview') +
				renderSection('Returned to You', data.returnedToYou, 'returnedToYou') +
				renderSection('My PRs', data.myPRs, 'myPRs') +
				renderSection('Reviewed-Awaiting', data.reviewedAwaiting, 'reviewedAwaiting');
		}

		function showError(message, requiresAuth) {
			clearRequestTimeout();
			const dashboard = document.getElementById('dashboard');
			const actions = requiresAuth
				? '<button class="error-btn" data-action="authenticate">Authenticate with GitHub</button>'
				: '';
			const retry = '<button class="error-btn secondary" data-action="refresh">Retry</button>';
			dashboard.innerHTML =
				'<div class="error-state">' +
					'<div>' + message + '</div>' +
					'<div class="error-actions">' + actions + retry + '</div>' +
				'</div>';
		}

		const refreshBtn = document.getElementById('refreshBtn');
		if (refreshBtn) {
			refreshBtn.addEventListener('click', refresh);
		}

		document.body.addEventListener('click', (event) => {
			const target = event.target;
			if (!(target instanceof HTMLElement)) {
				return;
			}

			const actionElement = target.closest('[data-action]');
			if (actionElement instanceof HTMLElement) {
				const action = actionElement.dataset.action;
				if (action === 'refresh') {
					refresh();
					return;
				}
				if (action === 'authenticate') {
					authenticate();
					return;
				}
			}

			const prCard = target.closest('.pr-card');
			if (prCard instanceof HTMLElement && currentData) {
				const section = prCard.dataset.section;
				const index = prCard.dataset.index ? Number(prCard.dataset.index) : NaN;
				if (!section || Number.isNaN(index)) {
					return;
				}
				const list = currentData[section] || [];
				const pr = list[index];
				if (pr && pr.url) {
					openPR(pr.url);
				}
			}
		});

		// Listen for messages from the extension
		window.addEventListener('message', event => {
			const message = event.data;
			switch (message.command) {
				case 'updateData':
					updateDashboard(message.data);
					break;
				case 'error':
					showError(message.message || 'Failed to load data', message.requiresAuth);
					break;
			}
		});

		// Request initial data
		setTimeout(() => {
			setLoadingState();
			startRequestTimeout();
			vscode.postMessage({ command: 'refresh' });
		}, 100);
	</script>
</body>
</html>`;
}
