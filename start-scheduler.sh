#!/bin/bash
# Startup script to initialize the newsletter scheduler
# This should be called after the Next.js server starts

echo "Initializing newsletter scheduler..."

# Wait for server to be ready
sleep 2

# Initialize scheduler
curl -X POST http://localhost:3000/api/init-scheduler

echo "Newsletter scheduler initialized!"
