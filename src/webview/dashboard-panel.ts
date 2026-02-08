import * as vscode from 'vscode';
import { getWebviewContent } from './webview-provider';

export class DashboardPanel {
  public static currentPanel: DashboardPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._panel.webview.html = getWebviewContent(this._panel.webview, extensionUri);

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message: unknown) => {
        const msg = message as { type: string };
        switch (msg.type) {
          case 'info':
            vscode.window.showInformationMessage((message as { text: string }).text);
            return;
          case 'error':
            vscode.window.showErrorMessage((message as { text: string }).text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  /**
   * Creates or shows the dashboard panel
   */
  public static createOrShow(extensionUri: vscode.Uri): void {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (DashboardPanel.currentPanel) {
      DashboardPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      'codeflowDashboard',
      'CodeFlow Dashboard',
      column || vscode.ViewColumn.One,
      {
        // Enable JavaScript in the webview
        enableScripts: true,
        // Retain context when hidden (prevents re-initialization)
        retainContextWhenHidden: true,
        // And restrict the webview to only loading content from our extension's `webview-ui/dist` directory.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'webview-ui', 'dist')],
      }
    );

    DashboardPanel.currentPanel = new DashboardPanel(panel, extensionUri);
  }

  /**
   * Disposes the panel and releases resources
   */
  public dispose(): void {
    DashboardPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
