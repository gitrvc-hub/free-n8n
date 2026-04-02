#!/usr/bin/env bash
# Generates init-db.sql for local development
# Production uses env vars configured in docker-compose.yml

set -euo pipefail

N8N_DB_USER="${N8N_DB_USER:-n8n}"
N8N_DB_PASS="${N8N_DB_PASS:-n8n}"
PLATFORM_DB_USER="${PLATFORM_DB_USER:-platform}"
PLATFORM_DB_PASS="${PLATFORM_DB_PASS:-platform}"

cat > init-db.sql << EOF
CREATE USER ${N8N_DB_USER} WITH PASSWORD '${N8N_DB_PASS}';
CREATE DATABASE n8n OWNER ${N8N_DB_USER};

CREATE USER ${PLATFORM_DB_USER} WITH PASSWORD '${PLATFORM_DB_PASS}';
CREATE DATABASE platform OWNER ${PLATFORM_DB_USER};
EOF

echo "Generated init-db.sql"
