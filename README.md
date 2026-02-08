# CodeFlow

PR management dashboard for VS Code - streamline pull request reviews inside your editor.

## Features

- **PR Dashboard**: View and manage pull requests organized by workflow state
- **Theme Integration**: Automatically inherits your VS Code theme (dark/light)
- **AI-Powered Summaries**: (Coming soon) Copilot SDK integration for PR insights

## Development

### Prerequisites

- Node.js 18+
- VS Code 1.109+

### Setup

```bash
# Install root dependencies
npm install

# Install webview dependencies
cd webview-ui && npm install && cd ..

# Build everything
npm run build:webview && npm run compile
```

### Development Workflow (HMR)

For the best development experience with Hot Module Replacement:

**Terminal 1 - Start Vite dev server:**

```bash
npm run dev:webview
```

**Terminal 2 - Launch extension:**

1. Press `F5` to launch "Run Extension (Dev Mode)"
2. Run command: `CodeFlow: Open Dashboard`

The webview will load from the Vite dev server (`localhost:5173`) and support HMR - changes to React components will appear immediately without reloading.

### Build Commands

| Command                 | Description                         |
| ----------------------- | ----------------------------------- |
| `npm run compile`       | Type-check + lint + build extension |
| `npm run watch`         | Watch mode for extension host       |
| `npm run dev:webview`   | Start Vite dev server for webview   |
| `npm run build:webview` | Build webview for production        |
| `npm run lint`          | Run ESLint                          |
| `npm run lint:fix`      | Auto-fix lint issues                |
| `npm run format`        | Run Prettier                        |
| `npm run test`          | Run tests                           |

### Project Structure

```
code-flow/
├── src/                    # Extension host (Node.js)
│   ├── extension.ts        # Entry point
│   └── webview/            # Webview panel management
├── webview-ui/             # React webview (Vite + Tailwind)
│   └── src/
│       ├── components/     # React components
│       └── globals.css     # VS Code theme integration
├── dist/                   # Built extension
└── package.json
```

## Extension Commands

- `CodeFlow: Open Dashboard` - Open the PR management dashboard

## Release Notes

### 0.0.1

- Initial extension scaffold
- React webview with Vite + Tailwind + shadcn/ui
- VS Code theme integration
- Dashboard panel management

---

**Enjoy!**
