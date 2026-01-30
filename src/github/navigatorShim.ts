const userAgent = 'codeflow-vscode-extension';

export function ensureNavigatorShim(): void {
	try {
		const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
		if (!descriptor || descriptor.configurable) {
			Object.defineProperty(globalThis, 'navigator', {
				value: { userAgent },
				configurable: true,
				writable: false,
				enumerable: false,
			});
		}
	} catch (error) {
		console.warn('Unable to define navigator shim for Octokit.', error);
	}
}

ensureNavigatorShim();
