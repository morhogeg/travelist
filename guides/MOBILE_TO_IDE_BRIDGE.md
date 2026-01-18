# 📱 Mobile-to-IDE Bridge (Antigravity)

The Mobile-to-IDE bridge allows you to trigger AI tasks from your iPhone (via GitHub) and review/approve them on your Mac.

## 🚀 The Workflow

### 1. On your iPhone (GitHub App)
- **Create an Issue**: You can trigger the bot directly by creating a new GitHub Issue. The bot will use the **Issue Description** as its instruction.
- **Tag the Bot in Comments**: You can also trigger the bot by tagging `@Gemini-bot` in any comment on an existing issue.
  - *Example*: `@Gemini-bot make the headline on the home screen green`
- **Wait for Report**: The bot will process the request on your Mac (via the self-hosted runner) and post a **Mission Report** back to the issue when finished.

> [!TIP]
> **One Issue vs. Many?**
> It is recommended to create a **new issue** for each distinct feature or bug. This keeps the code branches isolated and makes it easier to "Approve" or "Deny" specific changes without affecting others.

---

### 2. On your Mac (Terminal)
Once you see the "Mission Accomplished" report on GitHub, use the `review.sh` utility to manage the work.

#### **Step A: Preview the work**
Run this command to checkout the AI's code, sync the project, and open Xcode:
```bash
./review.sh preview <issue_number>
```
*Example: `./review.sh preview 7`*

#### **Step B: Verify in Xcode**
- Press **Cmd + R** in Xcode to run the app in the simulator.
- Verify that the changes match your request.

#### **Step C: Approve or Deny**
- **To Merge**: If you are happy, run:
  ```bash
  ./review.sh approve <issue_number>
  ```
  *This merges the code into `main` and deletes the temporary branch.*

- **To Discard**: If you don't like the changes, run:
  ```bash
  ./review.sh deny <issue_number>
  ```
  *This deletes the AI's work and keeps your `main` branch clean.*

---

## 🛠️ Under the Hood
- **Runner**: A self-hosted GitHub Actions runner is installed in `~/actions-runner`. It must be running (`./run.sh`) for the bridge to work.
- **Worker**: The `scripts/bridge_worker.sh` script handles the git operations and triggers the `gemini` CLI.
- **Permissions**: The GitHub workflow has `contents: write` and `issues: write` permissions to manage branches and comments.
