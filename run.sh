#!/bin/bash

# Aggressively kill any existing vite or backend processes
pkill -9 -f "vite" 2>/dev/null || true
pkill -9 -f "node server/index.js" 2>/dev/null || true
sleep 3

# Start backend in background
node server/index.js &

# Give backend time to start
sleep 2

# Start frontend
cd client && npm run dev
