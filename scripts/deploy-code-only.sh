#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_PATH="${DEPLOY_PATH:-}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_DELETE="${DEPLOY_DELETE:-0}"
DEPLOY_DRY_RUN="${DEPLOY_DRY_RUN:-0}"

if [[ -z "$DEPLOY_HOST" || -z "$DEPLOY_PATH" ]]; then
  cat <<USAGE
Usage:
  DEPLOY_HOST=user@server DEPLOY_PATH=/var/www/runa npm run deploy:code

Optional:
  DEPLOY_PORT=22
  DEPLOY_DELETE=1   # also delete removed files (safe for excluded paths)
  DEPLOY_DRY_RUN=1  # preview only, no upload

This deploy script transfers only changed files and skips media directories:
  - public/images/
  - public/uploads/
USAGE
  exit 1
fi

RSYNC_OPTS=(
  -az
  --human-readable
  --progress
  --omit-dir-times
  --exclude=.git/
  --exclude=.next/
  --exclude=node_modules/
  --exclude=.env*
  --exclude=.DS_Store
  --exclude=.tmp-docker-backup/
  --exclude=.runtime/
  --exclude=public/images/
  --exclude=public/uploads/
  --exclude=data/cms/
)

if [[ "$DEPLOY_DELETE" == "1" ]]; then
  RSYNC_OPTS+=(--delete --delete-after)
fi

if [[ "$DEPLOY_DRY_RUN" == "1" ]]; then
  RSYNC_OPTS+=(--dry-run -v)
fi

REMOTE_PATH="${DEPLOY_PATH%/}/"

cd "$ROOT_DIR"

rsync "${RSYNC_OPTS[@]}" -e "ssh -p ${DEPLOY_PORT}" ./ "${DEPLOY_HOST}:${REMOTE_PATH}"

echo "Deploy completed: ${DEPLOY_HOST}:${REMOTE_PATH}"
