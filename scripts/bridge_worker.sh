#!/bin/bash
set -e

# Usage: ./bridge_worker.sh [issue_number] [comment_body]

ISSUE_NUMBER=$1
COMMENT_BODY=$2
BRANCH="ai-dev/$ISSUE_NUMBER"

echo "🚀 Starting worker for Issue #$ISSUE_NUMBER"
echo "📝 Comment: $COMMENT_BODY"

# 1. Setup Git
echo "📂 Setting up branch $BRANCH..."
git checkout -b "$BRANCH" || git checkout "$BRANCH"

# 2. Run Gemini
echo "🤖 Running Gemini Agent..."
if /Users/morhogeg/.nvm/versions/node/v22.16.0/bin/gemini --yolo "$COMMENT_BODY"; then
    echo "✅ Gemini finished successfully."
    
    # 3. Push Changes
    echo "📤 Pushing changes..."
    git add .
    # Use a generic commit message if none provided
    COMMIT_MSG="ai: $COMMENT_BODY (Issue #$ISSUE_NUMBER)"
    git commit -m "$COMMIT_MSG" || echo "No changes to commit"
    git push origin "$BRANCH"
    
    # 4. Report Status
    echo "📢 Reporting success..."
    ./scripts/report_status.sh success "$ISSUE_NUMBER" "https://github.com/morhogeg/travelist/tree/$BRANCH"
else
    echo "❌ Gemini failed."
    # 4. Report Failure
    ./scripts/report_status.sh failure "$ISSUE_NUMBER" "N/A"
    exit 1
fi
