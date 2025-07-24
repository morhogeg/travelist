<!--
  Copyright 2025 Mor Hogeg
  
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  
      http://www.apache.org/licenses/LICENSE-2.0
  
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

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

> 🎯 **One Command. Complete Strategic Intelligence.**

## 🚀 What STEVE Does

```bash
python3 steve/steve.py --mode execution
```

**This single command delivers:**

- **🤖 Multi-Agent Analysis**: 5 AI agents collaborate for deep strategic insights
- **📊 Strategic Scoring**: Evaluates each ticket against your principles (0-100)
- **🏷️ Smart Categorization**: Tags work as Core Value, Strategic Enabler, Drift, or Distraction
- **💬 Jira Integration**: Updates your actual tickets with scores, categories, and analysis comments
- **💼 Executive Summaries**: Constructive, motivating strategic reports with clear recommendations
- **📄 Notion Integration**: Beautiful, interactive executive summaries with visual formatting
- **🌐 Web Dashboard**: Modern React interface with real-time analysis and visualizations

### Example Output

```
📊 PROJ-123: 95/100 (Core Value)
   📝 Add CrewAI tutorial generator for hands-on projects
   💭 Strongly aligns with Builder-First Value principle
   🎯 Principles: Builder-First Value, AI Agent Excellence

📊 PROJ-124: 25/100 (Distraction)  
   📝 Add animated GIF support to chat
   💭 Limited strategic alignment. Consider deprioritizing.
```

## ⚡ Quick Start

**Step 1. Clone the repository**
```bash
git clone https://github.com/morhogeg/STEVE.git && cd STEVE
```

### 🌐 Web Dashboard (Recommended)

**Step 2. Launch the web interface**
```bash
./run-web.sh
```

**That's it!** Open http://localhost:5173 to access the modern web interface.

### 🖥️ Command Line Interface

**Step 2. Configure your .env file** (see Configuration section)

**Step 3. Run CLI analysis**
```bash
./run-cli.sh --mode execution
```

<details>
<summary><b>Quick CLI Examples</b></summary>

```bash
# Test with mock data (no Jira connection needed)
./run-cli.sh --test

# Analyze current sprint and update Jira
./run-cli.sh --mode execution

# Full project review with sorted results
./run-cli.sh --mode full_review --sorted

# Dry run without updating Jira
./run-cli.sh --mode strategy --dry-run
```
</details>

## 👀 Visual Preview

**Want to see STEVE in action?** Watch the dashboard in 20 seconds:

[🎥 Watch Demo Video](https://your-loom-link-here.com)

*Screenshot: STEVE analyzing strategic alignment in real-time*

## 🏗️ How It Works (3 Phases)

- **🤖 Multi-Agent Analysis**: 5 LLM agents analyze, score, and rewrite Jira tickets
- **🔗 Jira Sync**: Auto-updates tickets with comments and alignment scores  
- **📊 Strategic Reports**: Publishes Notion dashboards with summaries

<details>
<summary><b>Agent Breakdown</b></summary>

1. **Ticket Ingestor** - Pulls tickets from Jira based on review mode
2. **Alignment Evaluator** - Scores tickets against your strategic principles  
3. **Rewrite Strategist** - Suggests improvements for misaligned tickets
4. **Theme Synthesizer** - Detects patterns and recommends focus shifts
5. **Founder Voice** - Creates constructive executive summaries
</details>

## 🔧 Configuration

### 1. Install Dependencies

```bash
python -m venv steve-env
source steve-env/bin/activate  # Windows: steve-env\Scripts\activate
pip install -r steve/requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

**Required for CLI and Jira sync:**
```env
JIRA_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=your.email@company.com
JIRA_API_TOKEN=your_api_token_here
JIRA_PROJECT_KEY=PROJ
```

**Required for AI agents:**
```env
OPENAI_API_KEY=sk-...  # Or use OPENROUTER_API_KEY
```

**Optional - Notion executive summaries:**
```env
USE_FOUNDER_VOICE=true
NOTION_TOKEN=secret_your_integration_token_here
NOTION_DATABASE_ID=your_database_id_here
```

### 3. Configure Your Strategic Principles

Edit `steve/config/principles.yaml` to match your product vision:

<details>
<summary><b>Example Configuration</b></summary>

```yaml
principles:
  - name: "Customer Obsession"
    description: "Every feature should improve customer experience"
    keywords: ["customer", "user", "experience", "UX", "usability"]
    weight: 1.5  # Higher weight = more important
  
  - name: "Technical Excellence"
    description: "Maintain high code quality and performance"
    keywords: ["performance", "quality", "scalable", "maintainable"]
    weight: 1.2

thresholds:
  core_value: 80      # 80-100 score = Core Value
  strategic_enabler: 60  # 60-79 = Strategic Enabler
  drift: 40           # 40-59 = Drift
  # 0-39 = Distraction
```
</details>

## 🎯 Alignment Scoring

- **90-100**: Core Value (directly advances strategy)
- **60-89**: Strategic Enabler (supports goals)
- **40-59**: Drift (weak strategic connection)
- **0-39**: Distraction (misaligned work)

## 🌐 Web Interface Features

<details>
<summary><b>Dashboard Capabilities</b></summary>

- **Real-time Metrics**: Health score, total tickets, core value count
- **Interactive Charts**: Category distribution and score trends
- **Agent Configuration**: Customize AI behavior in real-time
- **Dark/Light Themes**: Complete theme switching
- **Export Options**: Download reports in multiple formats
</details>

## 📄 Notion Integration

STEVE automatically publishes executive summaries to Notion with:
- Interactive score distributions
- Visual category breakdowns
- Strategic health indicators
- Actionable next steps

## 🔄 Common Workflows

<details>
<summary><b>Daily & Sprint Planning</b></summary>

### Daily Strategic Alignment
```bash
# Quick sprint check before standup
python3 steve/steve.py --mode execution --sorted
```

### Sprint Planning
```bash
# Analyze backlog before committing to new work  
python3 steve/steve.py --mode strategy --project MYPROJ
```

### Quarterly Reviews
```bash
# Complete project analysis
python3 steve/steve.py --mode full_review
```
</details>

## 🛠️ Development

See full project layout and advanced features in [docs/README.dev.md](docs/README.dev.md)

## 🤝 Contributing

STEVE was built for the AI Strategy Brief Generator but is designed to be adaptable. The architecture and approach can inspire your own strategic alignment systems.

## 📄 License

Licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details.

Copyright 2025 Mor Hogeg

### 🙏 Attribution Requirements

When using or modifying STEVE, please ensure proper attribution:
- Include the NOTICE file in any distribution
- Maintain the copyright notice "Copyright 2025 Mor Hogeg" in all copies
- Clearly state any changes you make to the original software
- If you use STEVE in your project, please consider adding a note like:
  ```
  Built with STEVE (https://github.com/morhogeg/STEVE) by Mor Hogeg
  ```

---

> **"Are we building what matters?"** - STEVE's guiding question

🎯 **One command. Complete strategic intelligence. Every ticket aligned.**