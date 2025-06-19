#!/bin/bash

# Pre-commit script for TrackMe API
# This script runs formatting and linting checks before commits

echo "🔍 Running pre-commit checks..."

# Check if yarn is available
if ! command -v yarn &> /dev/null; then
    echo "❌ yarn is not installed or not in PATH"
    exit 1
fi

# Run Prettier formatting check
echo "📝 Checking code formatting..."
yarn format:check
if [ $? -ne 0 ]; then
    echo "❌ Code formatting check failed. Run 'yarn format' to fix formatting issues."
    exit 1
fi

# Run ESLint check
echo "🔍 Running ESLint..."
yarn lint
if [ $? -ne 0 ]; then
    echo "❌ ESLint check failed. Run 'yarn lint:fix' to fix linting issues."
    exit 1
fi

# Run TypeScript compilation check
echo "🔧 Checking TypeScript compilation..."
yarn build
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed. Fix the errors before committing."
    exit 1
fi

echo "✅ All pre-commit checks passed!"
exit 0 