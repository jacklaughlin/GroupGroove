#!/bin/bash
node server/index.js &
cd client && npm run dev
