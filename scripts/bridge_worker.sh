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
if git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
    git checkout "$BRANCH"
else
    git checkout -b "$BRANCH"
fi

# 2. Run Gemini
echo "🤖 Running Gemini Agent..."
if /Users/morhogeg/.nvm/versions/node/v22.16.0/bin/gemini --yolo "$COMMENT_BODY"; then
    echo "✅ Gemini finished successfully."
    
    # Get summary of changes
    CHANGES=$(git status --porcelain | sed 's/^...//')
    FILES_LIST=$(echo "$CHANGES" | awk '{printf "- %s\\n", $0}')
    
    # 3. Push Changes
    echo "📤 Pushing changes..."
    git add .
    COMMIT_MSG="ai: $COMMENT_BODY (Issue #$ISSUE_NUMBER)"
    git commit -m "$COMMIT_MSG" || echo "No changes to commit"
    git push origin "$BRANCH"
    
    # 4. Report Status
    REPORT="## 🚀 Mission Accomplished!
I have completed the task: **$COMMENT_BODY**

### 📂 Files Modified:
$FILES_LIST

### 💻 How to Review on your Mac:
1. Open your terminal in \`travelist-2\`.
2. Run: \`./review.sh preview $ISSUE_NUMBER\`
3. Check the results in the Xcode simulator.
4. If you like it, run: \`./review.sh approve $ISSUE_NUMBER\`
5. If not, run: \`./review.sh deny $ISSUE_NUMBER\`"

    echo "📢 Reporting success..."
    ./scripts/report_status.sh "success" "$ISSUE_NUMBER" "$REPORT"
else
    echo "❌ Gemini failed."
    ./scripts/report_status.sh "failure" "$ISSUE_NUMBER" "I encountered an error while trying to execute this task. Please check the runner logs."
    exit 1
fi
