import * as vscode from 'vscode';

export class Logger {
    private static channel: vscode.OutputChannel | undefined;

    static init(): vscode.OutputChannel {
        if (!Logger.channel) {
            Logger.channel = vscode.window.createOutputChannel('CodeFlow');
        }
        return Logger.channel;
    }

    static info(message: string): void {
        Logger.ensure();
        Logger.channel!.appendLine(`[INFO] ${message}`);
    }

    static warn(message: string): void {
        Logger.ensure();
        Logger.channel!.appendLine(`[WARN] ${message}`);
    }

    static error(message: string, error?: unknown): void {
        Logger.ensure();
        const details = Logger.formatError(error);
        Logger.channel!.appendLine(`[ERROR] ${message}${details ? ` - ${details}` : ''}`);
    }

    private static ensure(): void {
        if (!Logger.channel) {
            Logger.init();
        }
    }

    private static formatError(error: unknown): string {
        if (!error) {
            return '';
        }
        if (error instanceof Error) {
            return error.stack || error.message;
        }
        if (typeof error === 'string') {
            return error;
        }
        try {
            return JSON.stringify(error);
        } catch {
            return String(error);
        }
    }
}
