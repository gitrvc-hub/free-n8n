#!/usr/bin/env bash

set -euo pipefail

REPO_DIR="${REPO_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

cd "$REPO_DIR"

if [ ! -f .env ]; then
	printf 'Missing %s/.env\n' "$REPO_DIR" >&2
	exit 1
fi

set -a
. "$REPO_DIR/.env"
set +a

export GIT_SHA="${GIT_SHA:-${GITHUB_SHA:-latest}}"

docker compose pull sveltekit-app watchdog
docker compose up -d --no-deps caddy sveltekit-app watchdog
docker compose ps
