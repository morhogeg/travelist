#!/bin/bash

# STEVE CLI Runner - Command Line Interface for Strategic Analysis
# This script runs STEVE in CLI mode for direct Jira analysis

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

CLI Mode - Direct Jira Analysis & Notion Export
"

# Check if running in test mode
TEST_MODE=false
for arg in "$@"; do
    if [ "$arg" = "--test" ]; then
        TEST_MODE=true
        break
    fi
done

# Check if .env file exists (unless in test mode)
if [ "$TEST_MODE" = false ]; then
    if [ -f "steve/.env" ]; then
        ENV_FILE="steve/.env"
    elif [ -f "steve/.env.secure" ]; then
        ENV_FILE="steve/.env.secure"
        echo "📔 Using .env.secure file for credentials"
    else
        echo "⚠️  No .env file found!"
        echo ""
        echo "Please create steve/.env with your Jira credentials:"
        echo "  cp steve/.env.example steve/.env"
        echo "  Then edit steve/.env with your actual credentials"
        echo ""
        echo "Or if you have a .env.secure file, rename it:"
        echo "  mv steve/.env.secure steve/.env"
        echo ""
        echo "Or run with --test flag to use mock data:"
        echo "  ./run-cli.sh --test"
        echo ""
        exit 1
    fi
fi

# Check if virtual environment exists
if [ ! -d "steve/steve-env" ]; then
    echo "Creating Python virtual environment..."
    cd steve
    python3 -m venv steve-env
    cd ..
fi

# Activate virtual environment
echo "Activating virtual environment..."
source steve/steve-env/bin/activate

# Install requirements if needed
echo "Checking dependencies..."
pip install -q -r steve/requirements.txt

# Load environment variables from .env file (if not in test mode and file exists)
if [ "$TEST_MODE" = false ] && [ -n "$ENV_FILE" ]; then
    echo "Loading environment variables from $ENV_FILE..."
    set -a
    source "$ENV_FILE"
    set +a
fi

# Display usage help
echo "Usage: ./run-cli.sh [OPTIONS]"
echo ""
echo "Options:"
echo "  --test              Use mock data (safe mode)"
echo "  --mode MODE         Review mode: execution, strategy, full_review"
echo "  --project PROJECT   Jira project key"
echo "  --dry-run          Analyze without updating Jira"
echo "  --sorted           Display sorted priority list"
echo "  --no-notion        Skip Notion export"
echo ""
echo "Examples:"
echo "  ./run-cli.sh --test                    # Test with mock data"
echo "  ./run-cli.sh --mode execution          # Analyze current sprint"
echo "  ./run-cli.sh --mode full_review        # Analyze all tickets"
echo ""

# Run STEVE with all passed arguments
cd steve
python3 steve.py "$@"