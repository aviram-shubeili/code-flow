import * as vscode from 'vscode';

export class GitHubAuthProvider {
	private static readonly TOKEN_KEY = 'github.pat';

	constructor(private context: vscode.ExtensionContext) {}

	async authenticate(): Promise<void> {
		const token = await vscode.window.showInputBox({
			prompt: 'Enter your GitHub Personal Access Token',
			password: true,
			placeHolder: 'ghp_...',
			ignoreFocusOut: true,
			validateInput: (value) => {
				if (!value || value.trim().length === 0) {
					return 'Token cannot be empty';
				}
				if (!value.startsWith('ghp_') && !value.startsWith('github_pat_')) {
					return 'Invalid token format. GitHub PATs start with ghp_ or github_pat_';
				}
				return null;
			}
		});

		if (token) {
			await this.context.secrets.store(GitHubAuthProvider.TOKEN_KEY, token);
		}
	}

	async getToken(): Promise<string | undefined> {
		return await this.context.secrets.get(GitHubAuthProvider.TOKEN_KEY);
	}

	async clearToken(): Promise<void> {
		await this.context.secrets.delete(GitHubAuthProvider.TOKEN_KEY);
	}

	async isAuthenticated(): Promise<boolean> {
		const token = await this.getToken();
		return !!token;
	}
}
