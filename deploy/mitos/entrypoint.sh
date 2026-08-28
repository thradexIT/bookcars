#!/bin/sh
set -eu

mkdir -p \
  /data/cdn/bookcars/users \
  /data/cdn/bookcars/temp/users \
  /data/cdn/bookcars/cars \
  /data/cdn/bookcars/temp/cars \
  /data/cdn/bookcars/locations \
  /data/cdn/bookcars/temp/locations \
  /data/cdn/bookcars/contracts \
  /data/cdn/bookcars/temp/contracts \
  /data/cdn/bookcars/licenses \
  /data/cdn/bookcars/temp/licenses

cd /bookcars/backend
node --import ./dist/src/monitoring/instrument.js dist/src &
BACKEND_PID=$!

nginx -g 'daemon off;' &
NGINX_PID=$!

cleanup() {
  kill "$BACKEND_PID" "$NGINX_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

# BusyBox ash supports wait -n. Exit the container if either critical process exits
# so Railway can restart the service instead of leaving a half-alive gateway.
wait -n "$BACKEND_PID" "$NGINX_PID"
STATUS=$?
cleanup
wait "$BACKEND_PID" 2>/dev/null || true
wait "$NGINX_PID" 2>/dev/null || true
exit "$STATUS"
