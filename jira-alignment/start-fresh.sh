#!/bin/bash

echo "🚀 Starting Fresh STEVE Frontend..."

# Kill any existing processes
pkill -f "vite" 2>/dev/null || true
pkill -f "python.*main_simple_real.py" 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Start backend API
echo "🔧 Starting backend API..."
cd steve-frontend-api
python3 main_simple_real.py &
BACKEND_PID=$!

# Give backend time to start
sleep 2

# Start frontend with fresh cache
echo "🎨 Starting frontend (clearing cache)..."
cd ../steve-frontend-simple

# Clear vite cache
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf dist 2>/dev/null || true

# Start with fresh build
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✨ STEVE is running with our modern design!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo ""
echo "💡 Open in a FRESH browser window or incognito mode"
echo "🔄 Hard refresh with Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    pkill -f "python.*main_simple_real.py" 2>/dev/null || true
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    echo "✅ Services stopped."
    exit 0
}

# Set up trap to cleanup on Ctrl+C
trap cleanup INT

# Wait for processes
wait