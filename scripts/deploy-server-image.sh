#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_PATH="${DEPLOY_PATH:-}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_IMAGE="${DEPLOY_IMAGE:-runa-cyber-club:prod}"
DEPLOY_PLATFORM="${DEPLOY_PLATFORM:-linux/amd64}"

if [[ -z "$DEPLOY_HOST" || -z "$DEPLOY_PATH" ]]; then
  cat <<USAGE
Usage:
  DEPLOY_HOST=user@server DEPLOY_PATH=/var/www/runa npm run deploy:server

Optional:
  DEPLOY_PORT=22
  DEPLOY_IMAGE=runa-cyber-club:prod
  DEPLOY_PLATFORM=linux/amd64

What this does:
  1. Builds the Docker image locally.
  2. Streams the image to the server with docker load.
  3. Creates the proxy network on the server if needed.
  4. Migrates old server data from .runtime/local-* to .runtime/server-* once.
  5. Recreates the server container without rebuilding on the server.
USAGE
  exit 1
fi

REMOTE_PATH="${DEPLOY_PATH%/}"
SSH_OPTS=(-p "$DEPLOY_PORT")

cd "$ROOT_DIR"

echo "==> Building image ${DEPLOY_IMAGE} for ${DEPLOY_PLATFORM}"
docker build --platform "$DEPLOY_PLATFORM" -t "$DEPLOY_IMAGE" .

echo "==> Uploading image to ${DEPLOY_HOST}"
docker save "$DEPLOY_IMAGE" | ssh "${SSH_OPTS[@]}" "$DEPLOY_HOST" docker load

echo "==> Updating container on ${DEPLOY_HOST}:${REMOTE_PATH}"
ssh "${SSH_OPTS[@]}" "$DEPLOY_HOST" "DEPLOY_IMAGE='$DEPLOY_IMAGE' DEPLOY_PATH='$REMOTE_PATH' bash -s" <<'EOF'
set -euo pipefail

cd "$DEPLOY_PATH"

mkdir -p .runtime/server-cms .runtime/server-uploads

if [[ -d .runtime/local-cms ]] && [[ -z "$(ls -A .runtime/server-cms 2>/dev/null)" ]]; then
  cp -a .runtime/local-cms/. .runtime/server-cms/
fi

if [[ -d .runtime/local-uploads ]] && [[ -z "$(ls -A .runtime/server-uploads 2>/dev/null)" ]]; then
  cp -a .runtime/local-uploads/. .runtime/server-uploads/
fi

docker network inspect proxy >/dev/null 2>&1 || docker network create proxy >/dev/null

DOCKER_IMAGE="$DEPLOY_IMAGE" docker compose -f docker-compose.server.yml up -d --no-build --force-recreate --remove-orphans
docker compose -f docker-compose.server.yml ps
EOF
