#!/bin/bash

echo "Starting local development server..."
echo ""
echo "The server will be available at: http://localhost:8080"
echo "Press Ctrl+C to stop the server"
echo ""

# Check if Node.js is available
if command -v node &> /dev/null; then
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    
    # Start the server
    npx http-server -p 8080 -c-1 --cors
else
    # Fallback to Python
    echo "Node.js not found. Using Python..."
    if command -v python3 &> /dev/null; then
        python3 -m http.server 8080
    elif command -v python &> /dev/null; then
        python -m http.server 8080
    else
        echo "Error: Neither Node.js nor Python found. Please install one of them."
        exit 1
    fi
fi

