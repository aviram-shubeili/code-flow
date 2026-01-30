import * as vscode from 'vscode';
import { GitHubClient } from '../github/client';
import { DashboardData } from '../types';
import { NotificationService } from '../services/NotificationService';
import { getDashboardHtml, getNonce } from './dashboardHtml';
import { Logger } from '../services/Logger';

export class DashboardViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _disposables: vscode.Disposable[] = [];

    constructor(
        private readonly extensionUri: vscode.Uri,
        private readonly githubClient: GitHubClient,
        private readonly notificationService: NotificationService
    ) { }

    resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')],
        };
        const nonce = getNonce();
        webviewView.webview.html = getDashboardHtml(webviewView.webview, nonce);

        webviewView.onDidDispose(() => this.dispose(), null, this._disposables);
        webviewView.onDidChangeVisibility(() => {
            if (this._view?.visible) {
                this.refresh();
            }
        }, null, this._disposables);

        webviewView.webview.onDidReceiveMessage(
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

        void this.refresh();
    }

    async refresh(): Promise<void> {
        if (!this._view) {
            return;
        }

        try {
            Logger.info('DashboardView refresh started');
            const data = await this.githubClient.getDashboardData();
            await this.notificationService.checkAndNotify(data);
            this._view.webview.postMessage({ command: 'updateData', data });
            Logger.info('DashboardView refresh completed');
        } catch (error: any) {
            const message = error?.message || 'Unknown error';
            const requiresAuth = /not authenticated|unauthorized|401/i.test(message);
            this._view.webview.postMessage({ command: 'error', message, requiresAuth });
            vscode.window.showErrorMessage(`Failed to refresh: ${message}`);
            Logger.error('DashboardView refresh failed', error);
        }
    }

    async updateIfVisible(data: DashboardData): Promise<void> {
        if (this._view && this._view.visible) {
            this._view.webview.postMessage({ command: 'updateData', data });
        }
    }

    dispose(): void {
        this._view = undefined;

        while (this._disposables.length) {
            const item = this._disposables.pop();
            item?.dispose();
        }
    }
}
