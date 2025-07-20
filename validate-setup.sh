#!/bin/bash

# STEVE Setup Validation Script
# This script checks all prerequisites and validates configuration

echo "===================================="
echo "🔍 STEVE Setup Validator"
echo "===================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
SETUP_VALID=true

# Function to check command exists
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $2 found: $(command -v $1)${NC}"
        if [ ! -z "$3" ]; then
            VERSION=$($3)
            echo "   Version: $VERSION"
        fi
        return 0
    else
        echo -e "${RED}❌ $2 not found${NC}"
        echo "   Please install $2 to continue"
        SETUP_VALID=false
        return 1
    fi
}

# Function to check Python version
check_python_version() {
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        REQUIRED_VERSION="3.8"
        
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            echo -e "${GREEN}✅ Python version $PYTHON_VERSION (>= $REQUIRED_VERSION)${NC}"
        else
            echo -e "${RED}❌ Python version $PYTHON_VERSION is below required $REQUIRED_VERSION${NC}"
            SETUP_VALID=false
        fi
    fi
}

# Function to check Node version
check_node_version() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | sed 's/v//')
        REQUIRED_VERSION="14.0.0"
        
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            echo -e "${GREEN}✅ Node.js version $NODE_VERSION (>= $REQUIRED_VERSION)${NC}"
        else
            echo -e "${RED}❌ Node.js version $NODE_VERSION is below required $REQUIRED_VERSION${NC}"
            SETUP_VALID=false
        fi
    fi
}

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $2 found${NC}"
        return 0
    else
        echo -e "${RED}❌ $2 not found at $1${NC}"
        if [ ! -z "$3" ]; then
            echo "   $3"
        fi
        SETUP_VALID=false
        return 1
    fi
}

# Function to check directory exists
check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $2 found${NC}"
        return 0
    else
        echo -e "${RED}❌ $2 not found at $1${NC}"
        SETUP_VALID=false
        return 1
    fi
}

# Function to validate .env file
check_env_vars() {
    if [ -f ".env" ]; then
        echo -e "${GREEN}✅ .env file found${NC}"
        
        # Check required variables
        source .env 2>/dev/null
        
        # Check Jira configuration
        if [ ! -z "$JIRA_URL" ] && [ ! -z "$JIRA_EMAIL" ] && [ ! -z "$JIRA_API_TOKEN" ]; then
            echo -e "${GREEN}✅ Jira configuration present${NC}"
            
            # Test Jira connection
            echo -n "   Testing Jira connection... "
            RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
                -H "Authorization: Basic $(echo -n $JIRA_EMAIL:$JIRA_API_TOKEN | base64)" \
                "$JIRA_URL/rest/api/2/myself")
            
            if [ "$RESPONSE" = "200" ]; then
                echo -e "${GREEN}Connected!${NC}"
            else
                echo -e "${RED}Failed (HTTP $RESPONSE)${NC}"
                echo "   Please check your Jira credentials"
                SETUP_VALID=false
            fi
        else
            echo -e "${YELLOW}⚠️  Jira configuration incomplete${NC}"
            echo "   Required: JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN"
        fi
        
        # Check AI provider
        if [ ! -z "$OPENAI_API_KEY" ] || [ ! -z "$OPENROUTER_API_KEY" ]; then
            echo -e "${GREEN}✅ AI provider API key found${NC}"
        else
            echo -e "${RED}❌ No AI provider API key found${NC}"
            echo "   Required: Either OPENAI_API_KEY or OPENROUTER_API_KEY"
            SETUP_VALID=false
        fi
        
        # Check optional Notion
        if [ ! -z "$NOTION_API_KEY" ]; then
            echo -e "${GREEN}✅ Notion integration configured${NC}"
        else
            echo -e "   Notion integration not configured (optional)"
        fi
        
    else
        echo -e "${RED}❌ .env file not found${NC}"
        echo "   Run: cp .env.example .env"
        echo "   Then edit .env with your credentials"
        SETUP_VALID=false
    fi
}

# Function to check Python packages
check_python_packages() {
    echo "Checking Python packages..."
    
    if [ -f "steve/requirements.txt" ]; then
        # Check if virtual environment exists
        if [ -d "steve/venv" ] || [ -d "venv" ]; then
            echo -e "${GREEN}✅ Python virtual environment found${NC}"
        else
            echo -e "${YELLOW}⚠️  No virtual environment found (will be created by run scripts)${NC}"
        fi
    else
        echo -e "${RED}❌ requirements.txt not found${NC}"
        SETUP_VALID=false
    fi
}

# Main validation
echo "1. Checking System Requirements"
echo "==============================="
check_command python3 "Python 3" "python3 --version"
check_python_version
check_command node "Node.js" "node --version"
check_node_version
check_command npm "npm" "npm --version"
check_command git "Git" "git --version"
echo ""

echo "2. Checking Project Structure"
echo "============================="
check_directory "steve" "STEVE core directory"
check_directory "steve-frontend-simple" "Frontend directory"
check_file "run-web.sh" "Web launcher script"
check_file "run-cli.sh" "CLI launcher script"
check_file ".env.example" "Environment template"
echo ""

echo "3. Checking Configuration"
echo "========================"
check_env_vars
echo ""

echo "4. Checking Dependencies"
echo "======================="
check_python_packages
echo ""

echo "5. Quick Fixes Available"
echo "======================="
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "📋 Create .env file:"
    echo "   cp .env.example .env"
    echo ""
fi

if [ ! -x "run-web.sh" ]; then
    echo "🔧 Make scripts executable:"
    echo "   chmod +x *.sh"
    echo ""
fi

echo "===================================="
if [ "$SETUP_VALID" = true ]; then
    echo -e "${GREEN}✅ Setup validation PASSED!${NC}"
    echo ""
    echo "You're ready to run STEVE:"
    echo "  - Test mode: ./run-cli.sh --test"
    echo "  - Web interface: ./run-web.sh"
    echo "  - CLI mode: ./run-cli.sh"
else
    echo -e "${RED}❌ Setup validation FAILED${NC}"
    echo ""
    echo "Please fix the issues above before running STEVE."
    echo "See QUICKSTART.md for detailed setup instructions."
    exit 1
fi
echo "===================================="