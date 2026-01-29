import * as vscode from 'vscode';
import { GitHubAuthProvider } from './github/auth';
import { GitHubClient } from './github/client';
import { DashboardPanel } from './webview/DashboardPanel';

export function activate(context: vscode.ExtensionContext) {
	console.log('CodeFlow extension is now active');

	const authProvider = new GitHubAuthProvider(context);
	const githubClient = new GitHubClient(authProvider);

	// Register commands
	context.subscriptions.push(
		vscode.commands.registerCommand('codeflow.openDashboard', async () => {
			await DashboardPanel.createOrShow(context.extensionUri, githubClient);
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
		})
	);

	// Open dashboard on startup if authenticated
	authProvider.getToken().then(token => {
		if (token) {
			vscode.commands.executeCommand('codeflow.openDashboard');
		}
	});
}

export function deactivate() {
	DashboardPanel.dispose();
}
