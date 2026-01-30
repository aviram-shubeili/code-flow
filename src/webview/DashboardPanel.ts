import * as vscode from 'vscode';
import { GitHubClient } from '../github/client';
import { DashboardData } from '../types';
import { NotificationService } from '../services/NotificationService';
import { getDashboardHtml, getNonce } from './dashboardHtml';
import { Logger } from '../services/Logger';

export class DashboardPanel {
	public static currentPanel: DashboardPanel | undefined;
	private static readonly viewType = 'codeflowDashboard';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];
	private _githubClient: GitHubClient;
	private _notificationService: NotificationService;

	public static async createOrShow(extensionUri: vscode.Uri, githubClient: GitHubClient, notificationService: NotificationService) {
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

		DashboardPanel.currentPanel = new DashboardPanel(panel, extensionUri, githubClient, notificationService);
		await DashboardPanel.currentPanel.refresh();
	}

	public static async refresh() {
		if (DashboardPanel.currentPanel) {
			await DashboardPanel.currentPanel.refresh();
		}
	}

	public static async updateIfVisible(data: DashboardData) {
		if (DashboardPanel.currentPanel && DashboardPanel.currentPanel._panel.visible) {
			DashboardPanel.currentPanel._panel.webview.postMessage({ command: 'updateData', data });
		}
	}

	public static dispose() {
		DashboardPanel.currentPanel?.dispose();
		DashboardPanel.currentPanel = undefined;
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, githubClient: GitHubClient, notificationService: NotificationService) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this._githubClient = githubClient;
		this._notificationService = notificationService;

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
					case 'authenticate':
						await vscode.commands.executeCommand('codeflow.authenticate');
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
			Logger.info('DashboardPanel refresh started');
			const data = await this._githubClient.getDashboardData();
			await this._notificationService.checkAndNotify(data);
			this._panel.webview.postMessage({ command: 'updateData', data });
			Logger.info('DashboardPanel refresh completed');
		} catch (error: any) {
			const message = error?.message || 'Unknown error';
			const requiresAuth = /not authenticated|unauthorized|401/i.test(message);
			this._panel.webview.postMessage({ command: 'error', message, requiresAuth });
			vscode.window.showErrorMessage(`Failed to refresh: ${message}`);
			Logger.error('DashboardPanel refresh failed', error);
		}
	}

	private _update() {
		const webview = this._panel.webview;
		this._panel.webview.html = this._getHtmlForWebview(webview);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const nonce = getNonce();
		return getDashboardHtml(webview, nonce);
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
