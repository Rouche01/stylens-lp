#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/scripts/gostylens.config.js"
API_KEY="${POSTHOG_API_KEY:-}"
HOST="${POSTHOG_HOST:-https://n.gostylens.com}"

if [[ -z "$API_KEY" ]]; then
  echo "generate-analytics-config: POSTHOG_API_KEY is not set" >&2
  exit 1
fi

cat >"$OUT" <<EOF
window.GOSTYLENS_ANALYTICS = {
  apiKey: "$API_KEY",
  host: "$HOST",
};
EOF

echo "Wrote $OUT"
