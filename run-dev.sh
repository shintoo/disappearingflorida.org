#!/bin/bash

# Development script to run both backend and frontend servers concurrently

echo "Starting Disappearing Florida development servers..."
echo "=================================================="

# Check if backend virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "Backend virtual environment not found. Creating..."
    cd backend
    uv sync
    cd ..
fi

# Check if frontend node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "Frontend dependencies not found. Installing..."
    cd frontend
    npm install
    cd ..
fi

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Start backend
echo ""
echo "Starting FastAPI backend on http://localhost:8000..."
cd backend
source .venv/bin/activate
python -m app.main &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "Starting Vue frontend on http://localhost:5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "=================================================="
echo "Development servers running:"
echo "  - Backend API: http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs"
echo "  - Frontend: http://localhost:5173"
echo "  - Static pages: http://localhost:8000/"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "=================================================="

# Wait for background processes
wait
