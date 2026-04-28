#!/usr/bin/env bash
set -euo pipefail

# Start backend on internal port 3000
(cd apps/api && PORT=3000 node dist/main.js) &
BACKEND_PID=$!

# Forward signals to backend so it shuts down cleanly
trap 'kill -TERM $BACKEND_PID 2>/dev/null || true' SIGINT SIGTERM EXIT

# Start frontend preview on the public port (5000)
cd apps/web
exec npx vite preview --host 0.0.0.0 --port 5000 --strictPort
