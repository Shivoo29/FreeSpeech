#!/bin/bash

# FreeSpeech Platform Startup Script

echo "🎙️  FreeSpeech - Audio Processing Platform"
echo "=========================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Check for .env file
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
fi

# Create necessary directories
mkdir -p database uploads

# Start backend server in background
echo "Starting backend server..."
cd backend
python app.py &
BACKEND_PID=$!
cd ..

# Start frontend server
echo "Starting frontend server..."
cd frontend
python3 -m http.server 8080 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ FreeSpeech is now running!"
echo ""
echo "🌐 Frontend: http://localhost:8080"
echo "🔌 Backend API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
