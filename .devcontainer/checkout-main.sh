#!/bin/bash
set -e

# Only run if we are inside a git repo
if [ -d ".git" ]; then
    echo "🔍 Checking current Git branch..."

    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo "⚠️ Uncommitted changes detected. Skipping branch switch to avoid overwriting work."
        exit 0
    fi

    git fetch origin develop

    # Get current branch
    current_branch=$(git rev-parse --abbrev-ref HEAD)

    if [ "$current_branch" != "develop" ]; then
        echo "🔄 Switching to develop branch..."
        git checkout develop || echo "❌ Could not checkout develop, please check manually."
    else
        echo "✅ Already on develop branch."
    fi

    # Pull latest changes
    echo "⬇️ Pulling latest changes from develop..."
    git pull origin develop || echo "❌ Could not pull from develop, check your network or permissions."
else
    echo "❌ No .git directory found. Please clone the repo before opening devcontainer."
fi
