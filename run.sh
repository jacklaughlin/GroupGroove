#!/bin/bash

# Start backend in background and restart if it crashes
while true; do
  node server/index.js &
  BACKEND_PID=$!
  wait $BACKEND_PID
  echo "Backend exited, restarting in 2s..."
  sleep 2
done &

# Give backend a moment to start
sleep 2

# Start frontend (this keeps the process alive)
cd client && npm run dev
