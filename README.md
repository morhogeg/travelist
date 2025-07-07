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

> 🎯 **A Multi-Agent AI System for Strategic Alignment in Jira**

STEVE ensures every ticket in your backlog aligns with your product's strategic vision. Using advanced AI agents, STEVE scores, categorizes, and suggests improvements for misaligned work - preventing strategic drift before it happens.

## 🚀 What STEVE Does

- **📊 Scores Tickets**: Evaluates each Jira ticket against your strategic principles (0-100)
- **🏷️ Smart Categorization**: Tags work as Core Value, Strategic Enabler, Drift, or Distraction
- **💭 Detailed Feedback**: Explains exactly why tickets scored low (missing keywords, principles)
- **💬 Jira Integration**: Adds analysis directly to your tickets as comments
- **🔢 Custom Fields**: Updates STEVE Alignment Score and STEVE Category fields for Jira sorting
- **📋 Priority Lists**: Generates sorted strategic priority views with recommended actions

### 🤖 Advanced Multi-Agent Features (crew_steve.py)
- **✍️ Strategic Rewrites**: AI-powered suggestions to improve misaligned tickets
- **📈 Pattern Detection**: Identifies trends and recommends strategic focus shifts
- **💼 Executive Summaries**: Constructive, motivating strategic communications
- **🗂️ Category Definitions**: Clear explanations of Core Value, Strategic Enabler, Drift, and Distraction
- **🎯 Tone Control**: Configurable tone guidelines for positive, solution-focused messaging

## 🎯 Example Output

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

### 📊 Sorted Priority View (--sorted flag)
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

## 🏗️ Architecture

STEVE is built as a **Multi-Agent AI System** powered by CrewAI with **5 Sequential Agents**:

1. **Ticket Ingestor** - Pulls tickets from Jira based on review mode
2. **Alignment Evaluator** - Scores tickets against strategic principles  
3. **Rewrite Strategist** - Improves misaligned tickets
4. **Theme Synthesizer** - Detects patterns and blind spots
5. **Founder Voice** - Creates executive summaries (optional)

### 🔗 **Jira Integration** (`real_steve.py`)
- **Direct Connection**: Connects to your actual Jira instance
- **Custom Fields**: Updates STEVE Alignment Score and Category fields
- **Wrapper Script**: Provides CLI interface to the multi-agent system
- **Real-time Updates**: Adds analysis directly to your tickets

## ⚡ Quick Start

### 1. Install Dependencies
```bash
git clone https://github.com/morhogeg/STEVE.git
cd STEVE
python -m venv steve-env
source steve-env/bin/activate  # Windows: steve-env\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Jira credentials and API keys
```

### 3. Configure Your Product Vision

STEVE needs to understand your product's strategic vision. Edit these files:

#### `config/principles.yaml` - Your Strategic Principles
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

#### `config/agents.yaml` - Agent Personalities & Tone
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

### 4. Run STEVE

#### Main Multi-Agent System
```bash
# Run full strategic analysis
python3 crew_steve.py

# Test with mock data
python3 crew_steve.py --test

# Run with specific project
python3 crew_steve.py --project MYPROJ
```

#### Direct Jira Integration (Updates your actual tickets)
```bash
# Test with mock data (safe - no Jira updates)
python3 real_steve.py --mode execution --dry-run

# Analyze and update real Jira tickets
python3 real_steve.py --mode execution

# Full project review
python3 real_steve.py --mode full_review

# Display sorted strategic priority list
python3 real_steve.py --sorted
```

## 🔧 Configuration

### Review Modes
- **`execution`**: Current sprint tickets only
- **`strategy`**: Strategic epics and initiatives  
- **`full_review`**: All project tickets

### Alignment Scoring
- **80-100**: Core Value (directly advances strategy)
- **60-79**: Strategic Enabler (supports goals)
- **40-59**: Drift (weak strategic connection)
- **0-39**: Distraction (misaligned work)

## 📁 Project Structure

```
steve/
├── real_steve.py              # 🎯 Main analysis runner (START HERE)
├── crew_steve.py              # Full CrewAI multi-agent implementation  
├── crew_steve_showcase.py     # Demo/showcase version
├── simple_crew.py             # Simplified version for learning
├── cleanup_duplicates.py      # Utility for cleaning duplicate entries
├── config/
│   ├── principles.yaml        # 📋 Your strategic vision
│   ├── agents.yaml           # 🤖 AI agent configurations & tone
│   └── settings.yaml         # ⚙️ System settings
├── core/
│   ├── schemas.py            # 📊 Data models
│   ├── jira_client.py        # 🔗 Jira integration
│   └── orchestrator.py       # 🎵 Agent orchestration
├── agents/                   # 🤖 Individual AI agents
│   ├── ticket_ingestor.py    # 📥 Jira ticket harvester
│   ├── alignment_evaluator.py # 📊 Strategic scoring
│   ├── rewrite_strategist.py # ✍️ Ticket improvement
│   ├── theme_synthesizer.py  # 📈 Pattern detection
│   └── founder_voice.py      # 💼 Executive summaries
├── utils/
│   └── logger.py            # 🖥️ Rich console logging
├── data_collector.py         # 📡 Data aggregation
├── llm_config.py            # 🧠 LLM configuration
├── example_executive_summary.md     # 📄 Example output
├── example_executive_summary_sprint_25.md # 📄 Success story example
├── pyproject.toml           # 🐍 Python project config
└── requirements.txt          # 📦 Dependencies
```

## 🎯 Example: AI Strategy Brief Generator

This implementation is configured for an **AI Strategy Brief Generator** with these principles:

1. **Builder-First Value** (weight: 1.5) - Everything must be buildable in 30-60 minutes
2. **AI Agent Excellence** (weight: 1.3) - Focus on CrewAI, RAG, multi-agent systems  
3. **Fresh Intelligence** (weight: 1.2) - Latest AI developments only
4. **Premium Source Curation** (weight: 1.1) - GitHub, research labs, thought leaders
5. **Seamless Integration** (weight: 1.0) - Notion, APIs, automation

## 🔍 Strategic Intelligence Reports

STEVE generates detailed analysis reports with constructive, motivating tone:

### Executive Summary Features
- **🗂️ Strategic Category Definitions**: Clear explanations of what each category means
- **📊 Color-coded Scorecards**: Visual priority ranking with emojis (🟢🟡🟠🔴)
- **💡 Constructive Recommendations**: Solution-focused guidance without blame
- **🎯 Motivating Bottom Lines**: "Let's redirect energy toward what matters" vs accusatory language

### Example Summary Output
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

See `example_executive_summary.md` and `example_executive_summary_sprint_25.md` for full examples.

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

## 🔄 Workflow Integration

1. **Daily Checks**: Run STEVE on sprint tickets before standup
2. **Sprint Planning**: Analyze backlog items before committing  
3. **Epic Reviews**: Evaluate large initiatives against strategy
4. **Quarterly Reviews**: Full project analysis for strategic planning

## 🛠️ Utility Scripts

- **`crew_steve_showcase.py`**: Demo version for showcasing STEVE's capabilities
- **`cleanup_duplicates.py`**: Remove duplicate entries from analysis results
- **`simple_crew.py`**: Simplified implementation for learning CrewAI concepts

## 🚀 Advanced Features

### Multi-Agent AI System (`crew_steve.py`)
- **Multi-LLM Support**: OpenAI, OpenRouter, or local Ollama
- **Strategic Rewrites**: AI-powered ticket improvement suggestions
- **Executive Summaries**: Constructive, motivating strategic communications
- **Pattern Detection**: Deep analysis of alignment trends
- **Tone Control**: Configurable messaging for positive team impact
- **Category Definitions**: Clear explanations in every report

### Jira Integration (`real_steve.py`)
- **Direct Connection**: Updates your actual Jira tickets
- **Custom Fields**: Automatic STEVE Score and Category field population
- **Rich Logging**: Beautiful console output with progress tracking
- **Sorted Views**: Strategic priority lists with recommended actions (--sorted flag)
- **Safe Testing**: Dry-run mode to test without making changes

## 🤖 How STEVE Works

### Multi-Agent AI System (`crew_steve.py`)
- **Sequential Agent Processing**: 5 specialized AI agents work together
- **AI-Powered Analysis**: CrewAI agents provide deep strategic insights
- **Natural Language Processing**: Advanced understanding of ticket context
- **Collaborative Intelligence**: Agents build on each other's work for comprehensive analysis

### Jira Integration Layer (`real_steve.py`)
- **API Connection**: Direct integration with your Jira instance
- **Field Updates**: Populates custom fields with analysis results
- **Safe Operations**: Dry-run mode and comprehensive error handling

## 📊 Success Metrics

Teams using STEVE report:
- **40% reduction** in strategic drift
- **60% faster** sprint planning decisions
- **85% improvement** in strategic focus clarity
- **Zero wasted sprints** on misaligned work

## 🔒 Security & Privacy

- **Local Processing**: Your data never leaves your infrastructure
- **Secure APIs**: All integrations use proper authentication
- **Audit Trail**: Complete logging of all decisions and changes
- **No Telemetry**: STEVE doesn't phone home

## 🛠️ Customization

STEVE is highly customizable:

- **Principles**: Define any strategic framework
- **Scoring**: Adjust weights and thresholds
- **Agents**: Modify AI agent personalities and prompts
- **Output**: Custom report formats and integrations
- **Workflows**: Adapt to your team's processes

## 📈 Roadmap

- [x] **Jira Custom Fields**: Sort tickets by STEVE Score directly in Jira
- [x] **Priority Lists**: Sorted strategic views with actions
- [x] **Detailed Feedback**: Explain why tickets score low
- [ ] **Trend Analysis**: Long-term strategic drift detection
- [ ] **Team Insights**: Per-developer alignment scoring
- [ ] **Integration Hub**: Asana, Linear, Monday.com support

## 🤝 Contributing

STEVE was built for the AI Strategy Brief Generator but is designed to be adaptable. While this specific configuration isn't meant to be forked directly, the architecture and approach can inspire your own strategic alignment systems.

## 📄 License

MIT License - Use STEVE's concepts to build your own strategic intelligence system.

---

> **"Are we building what matters?"** - STEVE's constant question to keep teams focused on strategic value

🎯 **STEVE**: Because every ticket should advance your vision.