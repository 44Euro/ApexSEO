#!/bin/bash
# Restart the production server on a known-free port and wait until it answers.
PORT=${PORT:-3001}
lsof -nP -iTCP:$PORT -sTCP:LISTEN -t 2>/dev/null | xargs -r kill -9
sleep 1
NEXT_PUBLIC_SITE_URL="http://localhost:$PORT" PORT=$PORT npm run start > /tmp/prod.log 2>&1 &
until curl -sf -o /dev/null "http://localhost:$PORT/"; do
  if grep -q "Failed to start server" /tmp/prod.log; then echo "server failed"; tail -5 /tmp/prod.log; exit 1; fi
  sleep 1
done
echo "server ready on $PORT"
