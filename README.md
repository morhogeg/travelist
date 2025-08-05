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
> No templates. No rigid frameworks. Just your product vision—applied.

STEVE is a unified multi-agent AI system that ensures every ticket in your backlog aligns with YOUR product's strategic vision. Every analysis is dynamically generated based on your unique principles. Get AI-powered strategic analysis, automatic Jira updates, **interactive Notion reports**, and a **modern web dashboard** - preventing strategic drift before it happens.

> 📝 **Export executive summaries to Notion** with one click! Get interactive toggles, visual scoring distributions, and professional formatting for immediate team collaboration.

> 🌐 **Modern Web Interface** provides real-time strategic insights with color-coded score badges, interactive charts, and agent configuration - all in a beautiful dark/light theme dashboard.

## ⚡ Quick Start

```bash
./run-web.sh
```

**That's it!** Open http://localhost:5173 to access STEVE's unified interface.

See [🚀 What STEVE Does](#-what-steve-does) for full feature list.

## 🚀 What STEVE Does

**The unified web interface delivers:**

- **🤖 Multi-Agent Analysis**: 5 AI agents collaborate for deep strategic insights
- **📊 Strategic Scoring**: Evaluates each ticket against YOUR custom principles (0-100)
- **🏷️ Smart Categorization**: Tags work as Core Value, Strategic Enabler, Drift, or Distraction
- **💬 Jira Integration**: Updates your actual tickets with scores, categories, and analysis comments
- **💼 Executive Summaries**: Constructive, motivating strategic reports with clear recommendations
- **📄 Notion Export**: One-click export of executive summaries to Notion with visual formatting
- **🌐 Web Dashboard**: Modern React interface with real-time analysis and visualizations
- **🎨 Color-Coded Scores**: Instant visual feedback (🟢 High, 🔵 Medium, 🟡 Low, 🔴 Critical)
- **📋 Priority Lists**: Sorted strategic views with actionable next steps
- **🗂️ Category Definitions**: Clear explanations of what each strategic category means
- **✍️ Strategic Rewrites**: AI-powered suggestions to improve misaligned tickets
- **📈 Pattern Detection**: Identifies trends and recommends strategic focus shifts
- **⚙️ Agent Configuration**: Customize AI agent instructions via web interface
- **🎯 Dynamic Rationales**: Unique, contextual explanations based on YOUR product vision
- **🔄 Adaptive to Any Product Domain**: Works with e-commerce, fintech, SaaS, open-source, and any other domain

✅ **STEVE adapts to your product** — just define your principles, and it handles the rest.

## 📋 What Makes STEVE Different: Executive-Grade Strategy Summaries

STEVE generates detailed analysis reports with constructive, motivating tone:

### Executive Summary Features
- **🗂️ Strategic Category Definitions**: Clear explanations of what each category means
- **📊 Color-coded Scorecards**: Visual priority ranking with emojis (🟢🟡🟠🔴)
- **💡 Constructive Recommendations**: Solution-focused guidance without blame
- **🎯 Motivating Bottom Lines**: "Let's redirect energy toward what matters" vs accusatory language

### 📋 Sample Executive Summary Output

```
🎯 STRATEGIC ALIGNMENT SUMMARY
Total Tickets: 22
Average Alignment: 71.2/100 - Significant improvement!
Core Value: 50% (Target: 60%+ — almost there!)

📊 Top Performers:
  🟢 PROJ-201: Multi-agent workflow orchestrator (98/100)
  🟢 PROJ-203: Real-time AI research aggregator (96/100)

💡 Recommendations:
  ✅ Amplify AI Excellence - Build on CrewAI momentum
  📈 Transform Maintenance into Innovation - Redirect drift energy
  🎯 Push for 60%+ Core Value - Just 3 tickets away!

Bottom Line: We're shipping fast AND shipping smart. Let's keep this momentum rolling!
```

## 🎯 Example Output

<details>
<summary><b>Click to see example ticket analysis</b></summary>

```
📊 PROJ-123: 95/100 (Core Value)
   📝 Add CrewAI tutorial generator for hands-on projects
   💭 Strongly aligns with Builder-First Value principle
   🎯 Principles: Builder-First Value, AI Agent Excellence

📊 PROJ-124: 25/100 (Distraction)  
   📝 Add animated GIF support to chat
   💭 Limited strategic alignment. Consider deprioritizing.
   💭 Issues: No alignment with: Builder-First Value, AI Agent Excellence
```

### 📊 Sorted Priority View
```
┏━━━━━┳━━━━━━━━┳━━━━━━━━━━┳━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━┓
┃ Rank ┃ Score  ┃ Ticket   ┃ Category       ┃ Summary                        ┃ Action             ┃
┡━━━━━╇━━━━━━━━╇━━━━━━━━━━╇━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━┩
│ #1   │ 100/100│ PROJ-23  │ Core Value     │ Add CrewAI tutorial generator...│ ✅ Keep prioritized │
│ #2   │ 82.5/100│ PROJ-37 │ Core Value     │ Create mobile app for reading...│ ✅ Keep prioritized │
│ #3   │ 60/100 │ PROJ-29  │ Strategic En...│ Add email digest feature...    │ 📈 Consider promoting│
│ #4   │ 52.5/100│ PROJ-34 │ Drift          │ Implement comments system...   │ ⚠️ Needs realignment │
│ #5   │ 30/100 │ PROJ-2   │ Distraction    │ Go-To-Market Planning          │ ❌ Consider removing │
└━━━━━┴━━━━━━━━┴━━━━━━━━━━┴━━━━━━━━━━━━━━━━┴━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┴━━━━━━━━━━━━━━━━━━━━┘
```

</details>

## 🏗️ How STEVE Works

When you run STEVE, here's what happens:

### **Phase 1: Multi-Agent Analysis** 🤖
STEVE's **5 AI Agents** collaborate sequentially:

1. **Ticket Ingestor** - Pulls tickets from Jira based on review mode
2. **Alignment Evaluator** - Scores tickets against your strategic principles  
3. **Rewrite Strategist** - Suggests improvements for misaligned tickets
4. **Theme Synthesizer** - Detects patterns and recommends focus shifts
5. **Founder Voice** - Creates constructive executive summaries

### **Phase 2: Jira Integration** 🔗
STEVE automatically updates your actual Jira tickets:

- **Custom Fields**: Populates STEVE Alignment Score and Category
- **Analysis Comments**: Adds detailed strategic feedback to each ticket
- **Safe Operation**: Dry-run mode available for testing

<details>
<summary><b>Enhanced Jira Comment Format 💬</b></summary>

Each ticket receives a comprehensive strategic analysis comment with:

```
⸻
📦 *Ticket Type*: Platform Infra (non-user-facing)
🧭 *Strategic Role*: Unlocks builder capabilities in downstream sprint
⸻
🎯 *Strategic Alignment Summary*
*Score*: 75/100 — Strategic Enabler
*Matched Principles*: Seamless Integration
Solid principle alignment positions this as strategic infrastructure.
⸻
🧠 *Why This Aligns*
This infrastructure work lays critical groundwork by establishing 
the data flow needed for agent responsiveness.
⸻
🧭 *Recommendation*
• ✅ *Action*: Schedule for next sprint with clear success criteria
• 💡 *Rationale*: Future agent features depend on this foundation
• 🔄 *Reframe Tip*: Add "enables real-time agent response" to description
⸻
```

**Key Features**:
- **Ticket Type & Role**: Immediate context about work category and strategic purpose
- **Specific Explanations**: No generic templates - each comment is tailored to the ticket
- **Actionable Recommendations**: Concrete next steps with timelines and metrics
- **Reframe Tips**: Suggestions for improving strategic alignment (60-79 scores)
- **Data-Driven Insights**: References specific impacts like "enables 80% of builders"

</details>

### **Phase 3: Strategic Reporting** 📊
STEVE generates executive-ready intelligence:

- **Color-coded Scorecards**: Visual priority ranking with emojis
- **Executive Summaries**: Constructive, motivating strategic insights
- **Priority Lists**: Sorted recommendations with specific actions

## ⚡ Quick Setup

### 1. Clone Repository
```bash
git clone https://github.com/morhogeg/STEVE.git
cd STEVE
```

### 2. Configure Environment
Edit `.env` with your Jira credentials and API keys.


<details>
<summary><b>3. Configure Your Product Vision</b></summary>

STEVE needs to understand your product's strategic vision. Edit these files:

#### `steve/config/principles.yaml` - Your Strategic Principles
```yaml
# IMPORTANT: STEVE generates UNIQUE rationales for each ticket based on YOUR vision!
# No hardcoded templates - every analysis is contextual and specific to your product.

principles:
  - name: "Customer Obsession"  # <-- Change to YOUR principle
    description: "Every feature should improve customer experience"
    keywords: ["customer", "user", "experience", "UX", "usability"]
    weight: 1.5  # Higher weight = more important
  
  - name: "Technical Excellence"  # <-- Add as many as needed
    description: "Maintain high code quality and performance"
    keywords: ["performance", "quality", "scalable", "maintainable"]
    weight: 1.2

# STEVE dynamically adapts to ANY product domain - not hardcoded rules!
# - SaaS: "Subscription Value", "User Retention", "API-First"
# - FinTech: "Security First", "Regulatory Compliance", "Transaction Speed"
# - Healthcare: "Patient Privacy", "Clinical Accuracy", "Provider Efficiency"
# - E-commerce: "Conversion Rate", "Cart Experience", "Mobile-First"
# - Gaming: "Player Engagement", "Monetization", "Social Features"
# - EdTech: "Learning Outcomes", "Teacher Efficiency", "Student Engagement"

thresholds:
  core_value: 80      # 80-100 score = Core Value
  strategic_enabler: 60  # 60-79 = Strategic Enabler
  drift: 40           # 40-59 = Drift
  # 0-39 = Distraction
```

#### `steve/config/agents.yaml` - Agent Personalities & Tone
Customize how agents analyze tickets and communicate:
```yaml
agents:
  alignment_evaluator:
    temperature: 0.3  # Creativity level (0-1)
    
  founder_voice:
    tone: "constructive, motivating, clarity-driven"
    tone_guidelines:
      prefer_phrases:
        - "Let's redirect energy toward what matters"
        - "Time to close the gap between effort and impact"
    category_definitions:
      core_value: "High-impact work that directly advances our mission"
      drift: "Well-intentioned work lacking clear strategic connection"
```

#### `.env` - Your Jira Configuration
```bash
JIRA_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=your.email@company.com
JIRA_API_TOKEN=your_api_token_here
JIRA_PROJECT_KEY=PROJ  # Your project key
OPENAI_API_KEY=sk-...  # Or use OPENROUTER_API_KEY
USE_FOUNDER_VOICE=true  # Enable executive summaries (optional)
```

</details>

### 4. Run STEVE

```bash
./run-web.sh
```

## 🔧 Configuration

### Prerequisites & Setup Validation
Run `./steve/validate-setup.sh` to check:
- ✅ Python 3.8+ and Node.js 14+ installed
- ✅ All required dependencies available
- ✅ Jira connection and API keys configured
- ✅ Project structure intact


### Alignment Scoring
- **90-100**: Core Value (directly advances strategy)
- **60-89**: Strategic Enabler (supports goals)
- **40-59**: Drift (weak strategic connection)
- **0-39**: Distraction (misaligned work)

### Notion Integration
Export executive summaries to Notion with one click! The web interface includes an "Export to Notion" button that creates beautifully formatted pages with:

**Features**:
- **Interactive Score Distribution**: Toggle blocks showing ticket details by score ranges
- **Visual Category Breakdown**: Color-coded callouts with alignment percentages
- **Strategic Health Diagnosis**: Automated assessment with contextual recommendations
- **Quick Guide**: Collapsible scoring system explanation for team reference
- **Professional Formatting**: Clean layout with dividers, emojis, and structured sections
- **Actionable Next Steps**: Checkbox-style todo items for immediate follow-up

**Setup**: 
1. In the web interface, click the settings icon and navigate to "Notion Integration"
2. Enter your Notion Integration Token and Database ID
3. Click "Save Configuration"
4. After running analysis, click the "Export to Notion" button next to the Executive Summary

Alternatively, add these to your `.env` file:
```bash
NOTION_TOKEN=secret_your_integration_token_here
NOTION_DATABASE_ID=your_database_id_here
```

**Benefits**:
- **Interactive Analysis**: Team members can explore score distributions and ticket details
- **Visual Clarity**: Color-coded categories and strategic health indicators
- **Permanent Record**: Timestamped strategic decisions with searchable history
- **Team Collaboration**: Shared workspace for strategic discussions and planning
- **Professional Presentation**: Executive-ready formatting for stakeholder reviews

<details>
<summary><b>🌐 Web Interface Features</b></summary>

The modern React frontend provides a premium interface for strategic analysis:

### 🎯 **Strategic Dashboard**
- **Real-time Metrics**: Health score, total tickets, core value count, attention needed
- **Interactive Charts**: Pie chart for category distribution, bar chart for score ranges
- **Hover Tooltips**: Show relevant tickets when hovering over chart segments
- **Color-coded Scores**: 🟢 High (80-100), 🔵 Medium (60-79), 🟡 Low (40-59), 🔴 Critical (0-39)

### 📊 **Ticket Analysis Grid**
- **Smart Filtering**: Search by text, filter by category
- **Flexible Sorting**: By score, ticket key, or category
- **Individual Ticket Expansion**: Click to expand only the ticket you want to see
- **Score Badges**: Instant visual feedback with gradient backgrounds
- **Dynamic Vision-Based Rationales**: Every ticket gets a UNIQUE explanation based on YOUR specific principles - never generic templates!
- **Clean Formatting**: No bullet points in recommendations, just clear action items

### ⚙️ **Agent Configuration Panel**
- **Live Customization**: Modify AI agent instructions in real-time
- **Agent Profiles**: Configure personality, tone, and behavior for each agent
- **Settings Persistence**: Automatically saves configurations locally
- **Visual Indicators**: Icons and colors for easy agent identification

### 🎨 **Modern Design System**
- **Dark/Light Themes**: Complete theme switching with system preference detection
- **Glass Morphism**: Translucent cards with backdrop blur effects
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Accessibility**: Keyboard navigation and screen reader support

### 📋 **Executive Summary**
- **Rich Typography**: Premium fonts with drop caps and proper hierarchy
- **Export to Notion**: One-click button to export summary to your Notion workspace
- **Interactive Formatting**: Collapsible sections and visual emphasis
- **Notion Integration Settings**: Configure credentials directly in the settings panel

### 🚀 **Quick Actions**
- **One-Click Analysis**: Start ticket analysis with visual progress tracking
- **Theme Toggle**: Instant switching between light and dark modes
- **Settings Access**: Quick configuration without leaving the main interface
- **Real-time Updates**: Live data refresh and synchronization

Access the web interface at **http://localhost:5173** after running `./run-web.sh`

</details>

<details>
<summary><b>📁 Project Structure</b></summary>

```
STEVE/
├── run-web.sh                # 🚀 ONE-COMMAND STARTUP (START HERE)
├── steve/                    # 🧠 Python backend
│   ├── steve.py             # 🎯 Main backend orchestrator
│   ├── crew_steve_core.py   # Multi-agent AI system
│   ├── crew_steve.py        # Legacy CLI version
│   ├── crew_steve_showcase.py # Demo/showcase version
│   ├── simple_crew.py       # Simplified version for learning
│   ├── cleanup_duplicates.py # Utility for cleaning duplicate entries
│   ├── config/
│   │   ├── principles.yaml  # 📋 Your strategic vision
│   │   ├── agents.yaml     # 🤖 AI agent configurations & tone
│   │   └── settings.yaml   # ⚙️ System settings
│   ├── core/
│   │   ├── schemas.py      # 📊 Data models
│   │   ├── jira_client.py  # 🔗 Jira integration
│   │   └── orchestrator.py # 🎵 Agent orchestration
│   ├── agents/             # 🤖 Individual AI agents
│   │   ├── ticket_ingestor.py    # 📥 Jira ticket harvester
│   │   ├── alignment_evaluator.py # 📊 Strategic scoring
│   │   ├── rewrite_strategist.py # ✍️ Ticket improvement
│   │   ├── theme_synthesizer.py  # 📈 Pattern detection
│   │   └── founder_voice.py      # 💼 Executive summaries
│   ├── utils/
│   │   ├── logger.py       # 🖥️ Rich console logging
│   │   └── notion_integration.py # 📄 Notion integration
│   ├── data_collector.py   # 📡 Data aggregation
│   ├── llm_config.py      # 🧠 LLM configuration
│   ├── example_executive_summary.md # 📄 Example output
│   ├── NOTION_SETUP.md    # 📄 Notion integration setup
│   ├── pyproject.toml     # 🐍 Python project config
│   └── requirements.txt    # 📦 Backend dependencies
├── steve-frontend-simple/   # 🌐 Modern web interface
│   ├── src/
│   │   ├── App.tsx         # 📱 Main React application
│   │   ├── App.modern.css  # 🎨 Modern design system
│   │   ├── App.darkmode-refined.css # 🌙 Dark theme
│   │   ├── App.score-colors.css     # 🎯 Color-coded scores
│   │   └── App.darkmode-final.css   # 🌃 Enhanced dark mode
│   ├── package.json        # 📦 Frontend dependencies
│   ├── tsconfig.json       # ⚙️ TypeScript configuration
│   ├── vite.config.ts      # ⚡ Vite build configuration
│   └── README.md           # 📖 Frontend documentation
└── steve-frontend-api/      # 🔗 API bridge layer
    ├── main_simple_real.py # 📡 FastAPI backend adapter
    └── requirements.txt     # 📦 API dependencies
```

</details>

## 🎯 Example: AI Strategy Brief Generator

This example shows how STEVE adapts to a specific product vision. When configured for an **AI Strategy Brief Generator**, STEVE dynamically generates rationales like:
- "Directly advances Builder-First Value with hands-on CrewAI tutorial"
- "Enables rapid prototyping of multi-agent workflows"
- "Provides fresh intelligence from latest research papers"

**Example Principles** (fully customizable):
1. **Builder-First Value** (weight: 1.5) - Everything must be buildable in 30-60 minutes
2. **AI Agent Excellence** (weight: 1.3) - Focus on CrewAI, RAG, multi-agent systems  
3. **Fresh Intelligence** (weight: 1.2) - Latest AI developments only
4. **Premium Source Curation** (weight: 1.1) - GitHub, research labs, thought leaders
5. **Seamless Integration** (weight: 1.0) - Notion, APIs, automation

**But YOUR product might have completely different principles!** STEVE will adapt its analysis to match YOUR vision - whether it's e-commerce, healthcare, fintech, or any other domain.

### 🔢 Jira Custom Fields Setup

STEVE can update custom fields for native Jira sorting:

1. **Create Custom Fields** in Jira Settings > Issues > Custom Fields:
   - `STEVE Alignment Score` (Number field, 0-100)
   - `STEVE Category` (Text field)

2. **Add to Screens**: Configure these fields on your issue screens

3. **Sort in Jira**: 
   - Use JQL: `project = PROJ ORDER BY "STEVE Alignment Score" DESC`
   - Save as filter "STEVE Strategic View"
   - Sort boards by clicking column headers

## 🛡️ What STEVE Prevents

- **Feature Creep**: Identifies tickets that don't serve strategic goals
- **Strategic Drift**: Catches teams working on misaligned priorities  
- **Resource Waste**: Highlights low-value work before it consumes time
- **Vision Dilution**: Keeps everyone focused on what matters most



<details>
<summary><b>🚀 Advanced Features</b></summary>


**Multi-Agent AI Features:**
- **Multi-LLM Support**: OpenAI, OpenRouter, or local Ollama
- **Strategic Rewrites**: AI-powered ticket improvement suggestions
- **Executive Summaries**: Constructive, motivating strategic communications
- **Pattern Detection**: Deep analysis of alignment trends
- **Tone Control**: Configurable messaging for positive team impact
- **Category Definitions**: Clear explanations in every report

**Jira Integration Features:**
- **Direct Connection**: Updates your actual Jira tickets automatically
- **Custom Fields**: Populates STEVE Score and Category fields
- **Rich Logging**: Beautiful console output with progress tracking
- **Safe Operations**: Comprehensive error handling and dry-run capabilities

</details>


## 🛠️ Customization

STEVE is highly customizable:

- **Principles**: Define any strategic framework
- **Scoring**: Adjust weights and thresholds
- **Agents**: Modify AI agent personalities and prompts
- **Output**: Custom report formats and integrations
- **Workflows**: Adapt to your team's processes

## 📚 Documentation

- **Configuration Files** - See `steve/config/` directory for principles and agent setup
- **Example Output** - View sample executive summaries in `steve/` directory


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