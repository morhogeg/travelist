#!/bin/bash

# Usage: ./report_status.sh [success|failure] [issue_number] [pr_link]

STATUS=$1
ISSUE_NUMBER=$2
PR_LINK=$3

if [ "$STATUS" == "success" ]; then
  MESSAGE="## 🚀 Mission Accomplished!
The requested work has been completed.
You can review the changes here: $PR_LINK

Tag me again if you need further adjustments!"
else
  MESSAGE="## ❌ Mission Failed
I encountered some issues while executing the task.
Please check the logs for more details.
PR (if any): $PR_LINK"
fi

# Post comment using GitHub API
# Requires GITHUB_TOKEN to be set in the environment
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN is not set."
  exit 1
fi

curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/morhogeg/travelist/issues/$ISSUE_NUMBER/comments \
  -d "{\"body\":\"$MESSAGE\"}"
