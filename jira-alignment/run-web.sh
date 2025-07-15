#!/bin/bash

# STEVE Web Runner - Modern Dashboard Interface
# This script runs STEVE with the web frontend for interactive analysis

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

Web Dashboard Mode - Interactive Strategic Analysis
"

# Kill any existing processes on our ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Start backend API
echo "🚀 Starting backend API..."
cd steve-frontend-api

# Check if virtual environment exists, create if not
if [ ! -d "../steve/steve-env" ]; then
    echo "Creating Python virtual environment..."
    cd ../steve
    python3 -m venv steve-env
    cd ../steve-frontend-api
fi

# Activate virtual environment and install dependencies
source ../steve/steve-env/bin/activate
echo "📦 Installing API dependencies..."
pip install -q -r requirements.txt
echo "📦 Installing STEVE backend dependencies..."
pip install -q -r ../steve/requirements.txt

# Start the backend
python3 main_simple_real.py &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Start frontend
echo "🎨 Starting frontend dashboard..."
cd ../steve-frontend-simple

# Install npm dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!

# Display access information
echo ""
echo "✅ STEVE Web Interface is running!"
echo ""
echo "🌐 Frontend Dashboard: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Features available:"
echo "  • Real-time strategic dashboard with metrics"
echo "  • Interactive ticket analysis grid"
echo "  • Score distribution charts"
echo "  • Agent configuration panel"
echo "  • Dark/light theme toggle"
echo "  • Executive summary with copy/export"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    echo "✅ Services stopped."
    exit 0
}

# Set up trap to cleanup on Ctrl+C
trap cleanup INT

# Wait for processes
wait