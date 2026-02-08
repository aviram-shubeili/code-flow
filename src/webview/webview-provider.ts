import * as vscode from 'vscode';

/**
 * Check if we're running in development mode
 * In dev mode, we load from Vite dev server for HMR support
 */
const isDev = process.env.NODE_ENV === 'development';
const DEV_SERVER_URL = 'http://localhost:5173';

/**
 * Gets the HTML content for the webview
 * In development: loads from Vite dev server for HMR
 * In production: loads bundled assets from webview-ui/dist
 */
export function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  if (isDev) {
    // Development: Load from Vite dev server for HMR
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CodeFlow Dashboard</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="${DEV_SERVER_URL}/@vite/client"></script>
          <script type="module" src="${DEV_SERVER_URL}/src/main.tsx"></script>
        </body>
      </html>
    `;
  }

  // Production: Load bundled assets
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'webview-ui', 'dist', 'assets', 'index.js')
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'webview-ui', 'dist', 'assets', 'index.css')
  );
  const nonce = getNonce();

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'nonce-${nonce}';">
        <link rel="stylesheet" href="${styleUri}">
        <title>CodeFlow Dashboard</title>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
      </body>
    </html>
  `;
}

/**
 * Generates a nonce for CSP
 */
function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
