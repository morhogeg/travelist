# STEVE Quick Start Guide

Get STEVE running in 5 minutes! This guide will help you experience STEVE's strategic analysis capabilities with minimal setup.

## System Requirements

### Required
- **Python**: 3.8 or higher
- **Node.js**: 14.0 or higher (for web dashboard)
- **npm**: 6.0 or higher (comes with Node.js)
- **Git**: For cloning the repository

### Operating Systems
- ✅ macOS (10.15+)
- ✅ Linux (Ubuntu 20.04+, other distros should work)
- ✅ Windows 10/11 (with WSL2 recommended)

### Hardware
- **RAM**: Minimum 4GB, 8GB recommended
- **Storage**: 500MB free space
- **Internet**: Required for API calls

## 5-Minute Setup

### Step 1: Clone and Enter Directory (30 seconds)
```bash
git clone https://github.com/morhogeg/STEVE.git
cd STEVE
```

### Step 2: Quick Test Mode (2 minutes)

#### Option A: Web Dashboard (Recommended for First-Time Users)
```bash
./run-web.sh
```
Then open http://localhost:5173 in your browser.

#### Option B: Command Line Interface
```bash
./run-cli.sh --test
```

This runs STEVE with sample data - no configuration needed!

### Step 3: See Results (2 minutes)
- In test mode, STEVE analyzes sample Jira tickets
- View strategic alignment scores (0-100)
- See categorization: Core Value, Strategic Enabler, Drift, or Distraction
- Review AI-generated insights

### Step 4: Next Steps (30 seconds)
Ready for real analysis? Continue to full setup below.

## Full Setup for Production Use

### 1. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Jira Configuration (Required)
JIRA_URL=https://your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-jira-api-token

# AI Provider (Choose one)
OPENAI_API_KEY=your-openai-key
# OR
OPENROUTER_API_KEY=your-openrouter-key

# Optional: Notion Integration
NOTION_API_KEY=your-notion-key
NOTION_DATABASE_ID=your-database-id
```

Need help getting API keys? See [API_KEYS.md](./docs/API_KEYS.md)

### 2. Validate Setup
```bash
./validate-setup.sh
```
This checks all prerequisites and connections.

### 3. Customize Your Strategic Principles
Edit `steve/config/principles.yaml` to match your strategy:
```yaml
principles:
  - name: "Customer First"
    description: "Prioritize customer value and experience"
    weight: 30
```

See [sample configurations](./examples/) for industry-specific templates.

### 4. Run Your First Real Analysis

#### Web Dashboard
```bash
./run-web.sh
```

#### CLI with Custom Query
```bash
./run-cli.sh --query "project = MOBILE AND created >= -7d"
```

## What Happens Next?

1. **Ticket Ingestion**: STEVE fetches tickets from your Jira
2. **Strategic Analysis**: AI agents evaluate each ticket
3. **Scoring**: Tickets get scores 0-100 for strategic alignment
4. **Categorization**: Automatic grouping into strategic categories
5. **Insights**: Executive summary with recommendations

## Quick Commands Reference

| Command | Description |
|---------|-------------|
| `./run-web.sh` | Start web dashboard |
| `./run-cli.sh --test` | Run with sample data |
| `./run-cli.sh --mode execution` | Full analysis mode |
| `./validate-setup.sh` | Check your setup |
| `./steve-help.sh` | Show all commands |

## Common First-Time Issues

1. **"Command not found"**: Make scripts executable
   ```bash
   chmod +x *.sh
   ```

2. **"Python not found"**: Install Python 3.8+
   ```bash
   # macOS
   brew install python@3.11
   
   # Ubuntu/Debian
   sudo apt update && sudo apt install python3.11
   ```

3. **"npm not found"**: Install Node.js
   ```bash
   # macOS
   brew install node
   
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

## Next Steps

- 📖 Read the [full documentation](./README.md)
- 🔧 Check [troubleshooting guide](./docs/TROUBLESHOOTING.md)
- 🎯 Explore [sample configurations](./examples/)
- 💡 Learn about [strategic principles](./docs/PRINCIPLES.md)

## Get Help

- **Issues**: [GitHub Issues](https://github.com/morhogeg/STEVE/issues)
- **Documentation**: [Full Docs](./docs/)
- **Examples**: [Sample Configs](./examples/)

---

**Ready to analyze your Jira tickets strategically? You're all set! 🚀**