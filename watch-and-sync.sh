#!/bin/bash

# Watch for file changes and auto-build + sync to iOS
# Usage: ./watch-and-sync.sh

echo "🔄 Watching for changes... Press Ctrl+C to stop"
echo "Watching: src/**/*"
echo ""

# Build once initially
echo "📦 Initial build..."
npm run build && npx cap sync ios
echo "✅ Initial sync complete. Rebuild in Xcode now."
echo ""

# Watch for changes using fswatch (install with: brew install fswatch)
if command -v fswatch &> /dev/null; then
    fswatch -o -e ".*" -i "\\.tsx?$" -i "\\.css$" -i "\\.ts$" src/ | while read f; do
        echo "🔄 Changes detected, rebuilding..."
        npm run build > /dev/null 2>&1 && npx cap sync ios > /dev/null 2>&1
        echo "✅ Synced at $(date +%H:%M:%S) - Refresh in Xcode (Cmd+R)"
    done
else
    echo "⚠️  fswatch not found. Install with: brew install fswatch"
    echo "Then run this script again."
fi
