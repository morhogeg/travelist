# STEVE Developer Documentation

## 📁 Project Structure

```
STEVE/
├── run-steve-simple.sh       # 🚀 ONE-COMMAND STARTUP
├── steve/                    # 🧠 Python backend
│   ├── steve.py             # 🎯 Unified command interface
│   ├── crew_steve_core.py   # Multi-agent AI system core
│   ├── real_steve.py        # Jira integration layer
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
│   │   ├── App.setup.css   # 🎨 Setup flow styles
│   │   ├── App.darkmode-refined.css # 🌙 Dark theme
│   │   └── App.score-colors.css # 🎯 Color-coded scores
│   ├── package.json        # 📦 Frontend dependencies
│   ├── tsconfig.json       # ⚙️ TypeScript configuration
│   └── vite.config.ts      # ⚡ Vite build configuration
└── steve-frontend-api/      # 🔗 API bridge layer
    ├── main_simple_real.py # 📡 FastAPI backend adapter
    └── requirements.txt     # 📦 API dependencies
```

## 🚀 Advanced Command Options

### Unified Command Interface
```bash
python3 steve/steve.py [OPTIONS]
```

**Analysis Control:**
- `--mode execution|strategy|full_review` - Scope of analysis
- `--project MYPROJ` - Target specific Jira project
- `--test` - Use mock data for safe testing
- `--dry-run` - Analyze without updating Jira tickets

**Output Control:**
- `--sorted` - Include strategic priority ranking
- `--analysis-only` - Skip Jira updates, analysis only
- `--no-notion` - Skip saving executive summary to Notion

### Direct Module Commands

```bash
# Multi-agent analysis only
python3 steve/crew_steve_core.py --test

# Direct Jira integration only  
python3 steve/real_steve.py --mode execution --dry-run

# Showcase/demo version
python3 steve/crew_steve_showcase.py
```

## 🛠️ Utility Scripts

- **`steve/validate-setup.sh`**: Check prerequisites and validate configuration
- **`steve-help.sh`**: Display all available commands and options
- **`start-fresh.sh`**: Clean environment setup for fresh installations
- **`steve/crew_steve_showcase.py`**: Demo version for showcasing STEVE's capabilities
- **`steve/cleanup_duplicates.py`**: Remove duplicate entries from analysis results
- **`steve/simple_crew.py`**: Simplified implementation for learning CrewAI concepts

## 📊 Jira Custom Fields Setup

STEVE can update custom fields for native Jira sorting:

1. **Create Custom Fields** in Jira Settings > Issues > Custom Fields:
   - `STEVE Alignment Score` (Number field, 0-100)
   - `STEVE Category` (Text field)

2. **Add to Screens**: Configure these fields on your issue screens

3. **Sort in Jira**: 
   - Use JQL: `project = PROJ ORDER BY "STEVE Alignment Score" DESC`
   - Save as filter "STEVE Strategic View"
   - Sort boards by clicking column headers

## 🧪 Testing & Development

### Run Tests
```bash
# Test with mock data
python3 steve/steve.py --mode execution --test

# Test specific components
python3 -m pytest steve/tests/
```

### Development Mode
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG

# Use local LLM for testing
export OPENROUTER_API_KEY=your-key
```

## 📋 Environment Variables Reference

### Core Variables
- `JIRA_URL`: Your Atlassian instance URL
- `JIRA_EMAIL`: User email for authentication
- `JIRA_API_TOKEN`: API token from Atlassian
- `JIRA_PROJECT_KEY`: Default project to analyze

### AI Configuration
- `OPENAI_API_KEY`: OpenAI API key
- `OPENROUTER_API_KEY`: Alternative LLM provider
- `LLM_MODEL`: Model selection (default: gpt-4)

### Integration Options
- `USE_FOUNDER_VOICE`: Enable executive summaries
- `NOTION_TOKEN`: Notion integration token
- `NOTION_DATABASE_ID`: Target database for reports
- `SLACK_WEBHOOK_URL`: Slack notifications

### System Settings
- `LOG_LEVEL`: DEBUG, INFO, WARNING, ERROR
- `LOG_FILE`: Path to log file
- `TEST_MODE`: Use mock data
- `DRY_RUN`: Skip Jira updates

## 🔌 API Endpoints (Frontend Integration)

The FastAPI backend provides:

```
GET  /api/analysis/status
POST /api/analysis/start
GET  /api/analysis/results
GET  /api/tickets
POST /api/agents/config
```

## 🎨 Frontend Customization

### Theme Configuration
Edit `steve-frontend-simple/src/App.darkmode-refined.css` for dark theme customization.

### Score Color Mapping
Modify `steve-frontend-simple/src/App.score-colors.css`:
- 🟢 High (80-100)
- 🔵 Medium (60-79)
- 🟡 Low (40-59)
- 🔴 Critical (0-39)

## 📈 Performance Considerations

- Batch size: 50 tickets per analysis run
- Rate limiting: 100 API calls/minute to Jira
- Cache duration: 15 minutes for web dashboard
- LLM timeout: 30 seconds per agent call

## 🔐 Security Notes

- Never commit `.env` files
- Rotate API tokens regularly
- Use environment-specific configs
- Enable HTTPS for production deployments