#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

upsert_env() {
  local file="$1"
  local key="$2"
  local value="$3"

  [[ -f "$file" ]] || return 0

  if grep -qE "^[[:space:]]*${key}=" "$file"; then
    # Only replace the selected key. Secrets and unrelated configuration stay untouched.
    sed -i -E "s|^[[:space:]]*${key}=.*$|${key}=${value}|" "$file"
  else
    printf '\n%s=%s\n' "$key" "$value" >>"$file"
  fi
}

printf '\nMITOS LOCAL ENV NORMALIZER\n==========================\n'

if [[ -f backend/.env.docker ]]; then
  upsert_env backend/.env.docker BC_WEBSITE_NAME 'MITOS RENT A CAR'
  upsert_env backend/.env.docker BC_SMTP_FROM 'no-reply@mitos.pe'
  upsert_env backend/.env.docker BC_ADMIN_EMAIL 'admin@mitos.pe'
  upsert_env backend/.env.docker BC_DEFAULT_LANGUAGE 'es'
  upsert_env backend/.env.docker BC_TIMEZONE 'America/Lima'
  upsert_env backend/.env.docker BC_IPINFO_DEFAULT_COUNTRY 'PE'
  printf '✅ normalized backend/.env.docker visible identity/localization only\n'
else
  printf '• backend/.env.docker absent; skipped\n'
fi

if [[ -f frontend/.env.docker ]]; then
  upsert_env frontend/.env.docker VITE_BC_WEBSITE_NAME 'MITOS RENT A CAR'
  upsert_env frontend/.env.docker VITE_BC_DEFAULT_LANGUAGE 'es'
  upsert_env frontend/.env.docker VITE_BC_MAP_LATITUDE '-12.0464'
  upsert_env frontend/.env.docker VITE_BC_MAP_LONGITUDE '-77.0428'
  upsert_env frontend/.env.docker VITE_BC_MAP_ZOOM '11'
  printf '✅ normalized frontend/.env.docker visible identity/localization only\n'
else
  printf '• frontend/.env.docker absent; skipped\n'
fi

if [[ -f admin/.env.docker ]]; then
  upsert_env admin/.env.docker VITE_BC_WEBSITE_NAME 'MITOS RENT A CAR'
  upsert_env admin/.env.docker VITE_BC_DEFAULT_LANGUAGE 'es'
  printf '✅ normalized admin/.env.docker visible identity/localization only\n'
else
  printf '• admin/.env.docker absent; skipped\n'
fi

printf '\nNo DB/JWT/payment/SMTP credentials were modified.\n'
printf 'Next: recreate DEV services, reseed, then run __scripts/mitos-final-closure.sh\n\n'
