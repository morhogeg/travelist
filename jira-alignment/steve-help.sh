#!/bin/bash

# STEVE Help - Show available run options

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "
███████╗████████╗███████╗██╗   ██╗███████╗
██╔════╝╚══██╔══╝██╔════╝██║   ██║██╔════╝
███████╗   ██║   █████╗  ██║   ██║█████╗  
╚════██║   ██║   ██╔══╝  ╚██╗ ██╔╝██╔══╝  
███████║   ██║   ███████╗ ╚████╔╝ ███████╗
╚══════╝   ╚═╝   ╚══════╝  ╚═══╝  ╚══════╝

Strategic Ticket Evaluation & Vision Enforcer
"

echo "🚀 STEVE Run Options:"
echo ""
echo "1️⃣  Web Interface (Recommended for interactive analysis):"
echo "    ./run-web.sh"
echo "    → Opens dashboard at http://localhost:5173"
echo "    → Real-time charts, agent config, dark mode"
echo ""
echo "2️⃣  CLI Mode (For automation & VS Code integration):"
echo "    ./run-cli.sh [options]"
echo "    → Direct Jira analysis and updates"
echo "    → Automatic Notion export"
echo ""
echo "📚 Common CLI Examples:"
echo "    ./run-cli.sh --test                     # Safe test mode"
echo "    ./run-cli.sh --mode execution           # Analyze current sprint"
echo "    ./run-cli.sh --mode full_review --sorted # Full analysis with ranking"
echo "    ./run-cli.sh --dry-run                  # Preview without updates"
echo ""
echo "⚙️  Configuration:"
echo "    1. Copy .env.example to .env"
echo "    2. Add your Jira & API credentials"
echo "    3. Customize config/principles.yaml"
echo ""
echo "📖 For more info: cat README.md"