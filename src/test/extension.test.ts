import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    const extension = vscode.extensions.getExtension('undefined_publisher.code-flow');
    assert.ok(extension, 'Extension should be installed');
  });

  test('Extension should activate and register commands', async () => {
    const extension = vscode.extensions.getExtension('undefined_publisher.code-flow');
    assert.ok(extension, 'Extension should be installed');

    // Activate the extension
    await extension.activate();

    // Verify command is now registered
    const commands = await vscode.commands.getCommands(true);
    assert.ok(
      commands.includes('code-flow.helloWorld'),
      'Hello World command should be registered after activation'
    );
  });
});
