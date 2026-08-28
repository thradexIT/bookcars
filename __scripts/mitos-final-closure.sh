#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

FRONTEND_ORIGIN="${MITOS_FRONTEND_ORIGIN:-http://localhost:8080}"
ADMIN_ORIGIN="${MITOS_ADMIN_ORIGIN:-http://localhost:3001}"
API_ORIGIN="${MITOS_API_ORIGIN:-http://localhost:4002}"
CUSTOMER_EMAIL="${MITOS_DEMO_CUSTOMER_EMAIL:-jdoe@mitos.pe}"
ADMIN_EMAIL="${MITOS_DEMO_ADMIN_EMAIL:-admin@mitos.pe}"
PASSWORD="${MITOS_DEMO_PASSWORD:-B00kC4r5}"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT
CUSTOMER_COOKIES="$TMP_DIR/customer.cookies"
ADMIN_COOKIES="$TMP_DIR/admin.cookies"

pass() { printf '✅ %s\n' "$1"; }
fail() { printf '❌ %s\n' "$1" >&2; exit 1; }
info() { printf '• %s\n' "$1"; }

printf '\nMITOS FINAL CLOSURE PROBE\n=========================\n\n'

info 'Checking local customer/operator-visible identity env values'
for file in backend/.env.docker frontend/.env.docker admin/.env.docker; do
  if [[ -f "$file" ]]; then
    # Internal bookcars identifiers are intentionally allowed in DB names, CDN paths,
    # package/container names and certificate paths. Only visible identity keys are gated.
    grep -nEi '^[A-Z0-9_]*(WEBSITE_NAME|ADMIN_EMAIL|SMTP_FROM|CONTACT_EMAIL)=.*(BookCars|bookcars\.ma)' \
      "$file" >"$TMP_DIR/env_hits" || true
    if [[ -s "$TMP_DIR/env_hits" ]]; then
      cat "$TMP_DIR/env_hits" >&2
      fail "$file still contains legacy customer/operator-visible identity"
    fi
    pass "$file has no legacy value in visible identity keys"
  else
    info "$file is absent locally (skipped)"
  fi
done

info 'Checking versioned customer/operator-visible source literals'
VISIBLE_PATHS=(
  frontend/index.html
  frontend/.env.example
  frontend/.env.docker.example
  frontend/src/config
  frontend/src/components
  frontend/src/pages
  frontend/src/lang
  admin/index.html
  admin/.env.example
  admin/.env.docker.example
  admin/src/config
  admin/src/components
  admin/src/pages
  admin/src/lang
  backend/.env.example
  backend/.env.docker.example
)
grep -RInE --exclude='*.map' 'BookCars|bookcars\.ma' "${VISIBLE_PATHS[@]}" >"$TMP_DIR/source_hits_raw" 2>/dev/null || true
grep -vE '^[^:]+:[0-9]+:[[:space:]]*(//|/\*|\*|#)' "$TMP_DIR/source_hits_raw" >"$TMP_DIR/source_hits" || true
if [[ -s "$TMP_DIR/source_hits" ]]; then
  cat "$TMP_DIR/source_hits" >&2
  fail 'Versioned customer/operator-visible runtime source still contains legacy identity'
fi
pass 'Versioned customer/operator-visible runtime source has no legacy identity literal'

info 'Checking DEV compose services'
docker compose -f docker-compose.dev.yml ps

info 'Checking effective Compose identity and DEV side-effect boundary'
COMPOSE_CONFIG="$(docker compose -f docker-compose.dev.yml config)"
if grep -Ei 'BC_WEBSITE_NAME:[[:space:]]+BookCars|VITE_BC_WEBSITE_NAME:[[:space:]]+BookCars|bookcars\.ma' <<<"$COMPOSE_CONFIG" >/dev/null; then
  fail 'Effective DEV compose still exposes legacy visible identity'
fi
grep -Eq 'BC_WEBSITE_NAME:[[:space:]]+MITOS RENT A CAR' <<<"$COMPOSE_CONFIG" || fail 'Effective DEV compose does not pin backend Mitos identity'
grep -Eq 'BC_EMAIL_ENABLED:[[:space:]]+.*false' <<<"$COMPOSE_CONFIG" || fail 'DEV email side-effect isolation is not active'
pass 'Effective DEV compose pins Mitos identity and isolates SMTP from booking authority'

info 'Checking backend health reachability'
HTTP_CODE="$(curl -sS -o "$TMP_DIR/health" -w '%{http_code}' "$API_ORIGIN/health" || true)"
if [[ "$HTTP_CODE" == '200' ]]; then
  pass 'Backend health endpoint returned 200'
else
  info "Health endpoint returned $HTTP_CODE; direct probes remain authoritative"
fi

info 'Authenticating Mitos customer with browser Origin semantics'
CUSTOMER_CODE="$(curl -sS -c "$CUSTOMER_COOKIES" -b "$CUSTOMER_COOKIES" \
  -o "$TMP_DIR/customer.json" -w '%{http_code}' \
  -X POST "$API_ORIGIN/api/sign-in/frontend" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H 'Content-Type: application/json' \
  --data "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"$PASSWORD\",\"stayConnected\":false}")"
[[ "$CUSTOMER_CODE" == '200' ]] || { cat "$TMP_DIR/customer.json" >&2; fail "Customer auth returned HTTP $CUSTOMER_CODE"; }
grep -Fq "$CUSTOMER_EMAIL" "$TMP_DIR/customer.json" || fail 'Customer auth response did not contain expected Mitos identity'
pass 'Customer browser-origin authentication returned 200'

info 'Authenticating Mitos Admin with browser Origin semantics'
ADMIN_CODE="$(curl -sS -c "$ADMIN_COOKIES" -b "$ADMIN_COOKIES" \
  -o "$TMP_DIR/admin.json" -w '%{http_code}' \
  -X POST "$API_ORIGIN/api/sign-in/admin" \
  -H "Origin: $ADMIN_ORIGIN" \
  -H 'Content-Type: application/json' \
  --data "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$PASSWORD\",\"stayConnected\":false}")"
[[ "$ADMIN_CODE" == '200' ]] || { cat "$TMP_DIR/admin.json" >&2; fail "Admin auth returned HTTP $ADMIN_CODE"; }
grep -Fq "$ADMIN_EMAIL" "$TMP_DIR/admin.json" || fail 'Admin auth response did not contain expected Mitos identity'
pass 'Admin browser-origin authentication returned 200'

info 'Checking Admin booking supplier authority'
BOOKING_SUPPLIERS_CODE="$(curl -sS -c "$ADMIN_COOKIES" -b "$ADMIN_COOKIES" \
  -o "$TMP_DIR/admin-booking-suppliers.json" -w '%{http_code}' \
  -H "Origin: $ADMIN_ORIGIN" \
  "$API_ORIGIN/api/admin-booking-suppliers")"
[[ "$BOOKING_SUPPLIERS_CODE" == '200' ]] || { cat "$TMP_DIR/admin-booking-suppliers.json" >&2; fail "Admin booking supplier projection returned HTTP $BOOKING_SUPPLIERS_CODE"; }
grep -Fqi 'MITOS Rent a Car' "$TMP_DIR/admin-booking-suppliers.json" || fail 'Persisted Mitos booking supplier is missing from Admin booking authority'
pass 'Admin booking supplier projection sees persisted Mitos bookings independently of avatar state'

info 'Checking backend-driven public fleet'
FLEET_CODE="$(curl -sS -o "$TMP_DIR/fleet.json" -w '%{http_code}' "$API_ORIGIN/api/public-fleet/10")"
[[ "$FLEET_CODE" == '200' ]] || fail "Public fleet returned HTTP $FLEET_CODE"
grep -Fq 'Toyota Yaris 2025/26' "$TMP_DIR/fleet.json" || fail 'Toyota Yaris 2025/26 missing from public fleet'
grep -Fq 'Toyota Raize' "$TMP_DIR/fleet.json" || fail 'Toyota Raize missing from public fleet'
pass 'Public fleet contains Toyota Yaris 2025/26 and Toyota Raize'

info 'Checking Mitos DEV fixture assets'
for asset in \
  "$API_ORIGIN/cdn/bookcars/users/mitos-dev-supplier.svg" \
  "$API_ORIGIN/cdn/bookcars/cars/mitos-dev-toyota-yaris.svg" \
  "$API_ORIGIN/cdn/bookcars/cars/mitos-dev-toyota-raize.svg"; do
  CODE="$(curl -sS -o /dev/null -w '%{http_code}' "$asset")"
  [[ "$CODE" == '200' ]] || fail "Fixture asset not reachable: $asset (HTTP $CODE)"
done
pass 'Supplier + Yaris + Raize CDN fixture assets are reachable'

info 'Sweeping customer route document identity'
ROUTES=(
  '/'
  '/search'
  '/sign-in'
  '/sign-up'
  '/checkout'
  '/bookings'
  '/booking'
  '/settings'
  '/notifications'
  '/about'
  '/faq'
  '/contact'
  '/privacy'
  '/tos'
  '/cookie-policy'
)
for route in "${ROUTES[@]}"; do
  BODY="$TMP_DIR/route$(echo "$route" | tr '/:' '__').html"
  CODE="$(curl -sS -o "$BODY" -w '%{http_code}' "$FRONTEND_ORIGIN$route")"
  [[ "$CODE" == '200' ]] || fail "Customer route $route returned HTTP $CODE"
  if grep -Ei 'BookCars|bookcars\.ma' "$BODY" >/dev/null; then
    fail "Customer route $route contains legacy identity in served document"
  fi
done
pass 'Customer route documents return 200 with no legacy identity literal'

info 'Checking Admin document identity'
ADMIN_DOC_CODE="$(curl -sS -o "$TMP_DIR/admin.html" -w '%{http_code}' "$ADMIN_ORIGIN/admin")"
[[ "$ADMIN_DOC_CODE" == '200' ]] || fail "Admin /admin returned HTTP $ADMIN_DOC_CODE"
if grep -Ei 'BookCars|bookcars\.ma' "$TMP_DIR/admin.html" >/dev/null; then
  fail 'Admin served document contains legacy identity'
fi
grep -Fqi 'MITOS ADMIN' "$TMP_DIR/admin.html" || fail 'Admin served document does not contain MITOS ADMIN metadata'
pass 'Admin document identity is MITOS ADMIN'

printf '\nSOURCE + ENV + AUTH + FLEET + ADMIN BOOKING AUTHORITY + DOCUMENT SWEEP: PASS\n\n'
