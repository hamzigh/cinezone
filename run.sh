#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"
UI_DIR="$ROOT_DIR/ui"

SERVER_PORT="${SERVER_PORT:-3000}"
UI_PORT="${UI_PORT:-4200}"

PIDS=()

cleanup() {
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
  done
}

trap cleanup EXIT INT TERM

ensure_dependencies() {
  local dir="$1"
  local name="$2"

  if [ ! -d "$dir/node_modules" ]; then
    echo "Installing $name dependencies..."
    (cd "$dir" && npm install)
  fi
}

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but was not found in PATH." >&2
  exit 1
fi

ensure_dependencies "$SERVER_DIR" "server"
ensure_dependencies "$UI_DIR" "ui"

echo "Starting CineZone API on http://localhost:$SERVER_PORT"
(cd "$SERVER_DIR" && PORT="$SERVER_PORT" npm start) &
PIDS+=("$!")

echo "Starting CineZone UI on http://localhost:$UI_PORT"
(cd "$UI_DIR" && npm start -- --host 0.0.0.0 --port "$UI_PORT") &
PIDS+=("$!")

echo
echo "CineZone is running:"
echo "  API: http://localhost:$SERVER_PORT"
echo "  UI:  http://localhost:$UI_PORT"
echo
echo "Press Ctrl+C to stop both processes."

wait -n "${PIDS[@]}"
