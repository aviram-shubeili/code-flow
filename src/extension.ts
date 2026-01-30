import './github/navigatorShim';
import * as vscode from 'vscode';
import { GitHubAuthProvider } from './github/auth';
import { GitHubClient } from './github/client';
import { DashboardPanel } from './webview/DashboardPanel';
import { NotificationService } from './services/NotificationService';
import { DashboardViewProvider } from './webview/DashboardViewProvider';
import { Logger } from './services/Logger';

let pollingInterval: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
	const outputChannel = Logger.init();
	context.subscriptions.push(outputChannel);
	Logger.info('CodeFlow extension is now active');

	const authProvider = new GitHubAuthProvider(context);
	const githubClient = new GitHubClient(authProvider);
	const notificationService = new NotificationService(context);
	const dashboardViewProvider = new DashboardViewProvider(
		context.extensionUri,
		githubClient,
		notificationService
	);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('codeflow.dashboard', dashboardViewProvider)
	);

	// Register commands
	context.subscriptions.push(
		vscode.commands.registerCommand('codeflow.openDashboard', async () => {
			await DashboardPanel.createOrShow(context.extensionUri, githubClient, notificationService);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('codeflow.authenticate', async () => {
			await authProvider.authenticate();
			vscode.window.showInformationMessage('Successfully authenticated with GitHub!');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('codeflow.refresh', async () => {
			await DashboardPanel.refresh();
			await dashboardViewProvider.refresh();
		})
	);

	// Set up automatic polling every 60 seconds
	const startPolling = async () => {
		const isAuth = await authProvider.isAuthenticated();
		if (isAuth) {
			pollingInterval = setInterval(async () => {
				try {
					const data = await githubClient.getDashboardData();
					await notificationService.checkAndNotify(data);
					await DashboardPanel.updateIfVisible(data);
					await dashboardViewProvider.updateIfVisible(data);
				} catch (error) {
					// Silent fail for background polling
					Logger.error('Polling error', error);
				}
			}, 60000); // 60 seconds
		}
	};

	// Open dashboard on startup if authenticated
	authProvider.getToken().then(token => {
		if (token) {
			vscode.commands.executeCommand('codeflow.openDashboard');
			startPolling();
		}
	});

	// Clean up polling on deactivation
	context.subscriptions.push({
		dispose: () => {
			if (pollingInterval) {
				clearInterval(pollingInterval);
			}
		}
	});
}

export function deactivate() {
	if (pollingInterval) {
		clearInterval(pollingInterval);
	}
	DashboardPanel.dispose();
}
