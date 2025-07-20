<div align="center">

```
███████╗████████╗███████╗██╗   ██╗███████╗
██╔════╝╚══██╔══╝██╔════╝██║   ██║██╔════╝
███████╗   ██║   █████╗  ██║   ██║█████╗  
╚════██║   ██║   ██╔══╝  ╚██╗ ██╔╝██╔══╝  
███████║   ██║   ███████╗ ╚████╔╝ ███████╗
╚══════╝   ╚═╝   ╚══════╝  ╚═══╝  ╚══════╝
```

</div>

# STEVE - Strategic Ticket Evaluation & Vision Enforcer

> **Find the ticket that kills your roadmap — before it does.**

## 🚀 Get Started in 5 Seconds
```bash
git clone https://github.com/morhogeg/STEVE.git && cd STEVE && ./run-web.sh
```
Open http://localhost:5173 — that's it. No config needed for demo mode.

---

## 💡 What Just Happened to Our Sprint

*"We used STEVE to pre-screen a 40-ticket backlog. In 8 minutes, we identified 6 distractions eating 30% of our velocity and uncovered a core-value ticket buried at the bottom. That one re-prioritization saved us 2 weeks of drift."*

**— Actual result from our last sprint planning**

## 🎯 Core Features

STEVE does three things exceptionally well:

### 1. **Scores Every Ticket** (0-100)
- 🟢 **80-100**: Core Value — directly advances your strategy
- 🔵 **60-79**: Strategic Enabler — supports your goals  
- 🟡 **40-59**: Drift — well-intentioned but misaligned
- 🔴 **0-39**: Distraction — actively harmful to focus

### 2. **Updates Jira Automatically**
- Adds strategic scores to every ticket
- Writes constructive analysis comments
- Creates custom fields for native Jira sorting

### 3. **Delivers Executive Intelligence**
- One-page strategic health report
- Specific recommendations with rationale
- Publishes to Notion with visual dashboards

## 🖥️ Choose Your Interface

### Web Dashboard (Visual Thinkers)
```bash
./run-web.sh
```
Real-time charts, drag-and-drop priorities, dark mode.

### Command Line (Power Users)
```bash
./run-cli.sh --mode execution
```
Instant analysis, scriptable, CI/CD ready.

## 📊 See It In Action

<details>
<summary><b>Example Output (Click to Expand)</b></summary>

```
📊 PROJ-123: 95/100 (Core Value)
   📝 Add CrewAI tutorial generator for hands-on projects
   💭 Strongly aligns with Builder-First Value principle
   🎯 Next: Ship this week

📊 PROJ-124: 25/100 (Distraction)  
   📝 Add animated GIF support to chat
   💭 No strategic alignment. Consider removing.
   ⚠️ Saving 3 dev days by skipping this
```

</details>

## ⚙️ Real Setup (After Demo)

1. **Add Your Jira Credentials**
   ```bash
   cp .env.example .env
   # Edit .env with your Jira URL, email, and API token
   ```

2. **Define Your Strategy**
   ```yaml
   # steve/config/principles.yaml
   principles:
     - name: "Customer Obsession"
       weight: 1.5  # Most important
   ```

3. **Run on Real Tickets**
   ```bash
   ./run-cli.sh --mode execution
   ```

Need help? Run `./validate-setup.sh` to check prerequisites.

## 🚨 Why Teams Need This

**Without STEVE**: You ship fast but ship wrong. Sprint retrospectives reveal 40% of work was "nice to have."

**With STEVE**: Every ticket has a strategy score. Misalignment is visible before standup. Teams ship less but achieve more.

## 🔗 Advanced Capabilities

<details>
<summary><b>For Power Users (Click to See More)</b></summary>

- **5 AI Agents** collaborate for deep analysis
- **Pattern Detection** across sprints
- **Custom Scoring** algorithms
- **Notion Integration** with interactive reports
- **API Access** for custom workflows

[📖 Full Documentation →](./docs/README_FULL.md)

</details>

## 🛡️ Who Built This

Originally created for an AI Strategy Brief Generator to ensure every tutorial actually helps builders ship.

Now used by product teams who are tired of building features nobody asked for.

---

<div align="center">

**One command. Every ticket scored. Strategic drift eliminated.**

[Get Started](#-get-started-in-5-seconds) · [Full Docs](./docs/README_FULL.md) · [Report Issue](https://github.com/morhogeg/STEVE/issues)

</div>