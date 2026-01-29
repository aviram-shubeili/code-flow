#!/bin/bash
# Validation script for CodeFlow extension

set -e

echo "🔍 CodeFlow Extension Validation"
echo "================================="
echo ""

# Check Node.js is installed
echo "✓ Checking Node.js..."
node --version

# Check npm is installed
echo "✓ Checking npm..."
npm --version

# Install dependencies
echo "✓ Installing dependencies..."
npm install --silent

# Check TypeScript compilation
echo "✓ Running type check..."
npm run check-types

# Run linting
echo "✓ Running linter..."
npm run lint

# Build extension
echo "✓ Building extension..."
node esbuild.js

# Verify build output
echo "✓ Verifying build output..."
if [ ! -f "dist/extension.js" ]; then
    echo "❌ Error: dist/extension.js not found"
    exit 1
fi

echo ""
echo "✅ All validation checks passed!"
echo ""
echo "Next steps:"
echo "1. Press F5 in VS Code to launch Extension Development Host"
echo "2. Run 'CodeFlow: Authenticate with GitHub' command"
echo "3. Run 'CodeFlow: Open Dashboard' command"
