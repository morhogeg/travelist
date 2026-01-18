#!/bin/bash
set -e

# Antigravity Review Utility
# Usage: ./review.sh [list|preview|approve|deny] [issue_number]

COMMAND=$1
ISSUE_NUM=$2
BRANCH="ai-dev/$ISSUE_NUM"

function show_help() {
    echo "📖 Antigravity Review Utility"
    echo "Usage:"
    echo "  ./review.sh list             - Show all pending AI tasks"
    echo "  ./review.sh preview <num>    - Sync and open Xcode to see changes"
    echo "  ./review.sh approve <num>    - Merge changes into main"
    echo "  ./review.sh deny <num>       - Discard changes"
}

if [ -z "$COMMAND" ]; then
    show_help
    exit 0
fi

case $COMMAND in
    "list")
        echo "🔍 Pending AI Tasks (Branches):"
        git fetch origin --prune > /dev/null
        git branch -r | grep "origin/ai-dev/" || echo "No pending tasks found."
        ;;

    "preview")
        if [ -z "$ISSUE_NUM" ]; then echo "❌ Missing issue number"; exit 1; fi
        echo "🔄 Fetching $BRANCH..."
        git fetch origin
        git checkout "$BRANCH" || git checkout -b "$BRANCH" "origin/$BRANCH"
        echo "📦 Syncing with iOS..."
        npx cap sync ios
        echo "🚀 Opening Xcode..."
        open ios/App/App.xcworkspace
        echo "✨ Done! Review the changes in Xcode. When ready, run ./review.sh approve $ISSUE_NUM"
        ;;

    "approve")
        if [ -z "$ISSUE_NUM" ]; then echo "❌ Missing issue number"; exit 1; fi
        echo "✅ Approving and Merging $BRANCH..."
        git checkout main
        git pull origin main
        git merge "$BRANCH" --no-edit
        git push origin main
        echo "🧹 Cleaning up..."
        git branch -d "$BRANCH"
        git push origin --delete "$BRANCH"
        echo "🚀 Mission Accomplished! Changes are now in main."
        ;;

    "deny")
        if [ -z "$ISSUE_NUM" ]; then echo "❌ Missing issue number"; exit 1; fi
        echo "🗑️ Discarding $BRANCH..."
        git checkout main
        git branch -D "$BRANCH" || true
        git push origin --delete "$BRANCH" || true
        echo "👋 Task discarded."
        ;;

    *)
        show_help
        ;;
esac
