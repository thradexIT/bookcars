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

# Optional remote test bootstrap. This is intentionally explicit and gated so
# public deployments never fall back to the local development credentials.
if [ "${MITOS_BOOTSTRAP_TEST_FIXTURES:-false}" = "true" ]; then
  if [ -z "${MITOS_DEMO_PASSWORD:-}" ] || [ "${#MITOS_DEMO_PASSWORD}" -lt 16 ]; then
    echo "MITOS remote test bootstrap refused: MITOS_DEMO_PASSWORD must be at least 16 characters." >&2
    exit 1
  fi
  MITOS_ALLOW_SEED=true node dist/src/setup/mitosDevSeed.js
fi

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
