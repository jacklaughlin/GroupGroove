#!/bin/bash

# Kill anything already using our ports to avoid conflicts
fuser -k 3001/tcp 2>/dev/null || true
fuser -k 5000/tcp 2>/dev/null || true
sleep 1

# Start backend in background
node server/index.js &

# Wait for backend to be ready
sleep 2

# Start frontend on port 5000 (keeps process alive)
cd client && npm run dev
