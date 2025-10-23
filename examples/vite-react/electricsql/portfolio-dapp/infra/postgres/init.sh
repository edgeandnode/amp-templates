#!/bin/bash
set -e

# Create multiple databases if POSTGRES_DB_LIST is set
if [ -n "$POSTGRES_DB_LIST" ]; then
  IFS=',' read -ra DBS <<< "$POSTGRES_DB_LIST"
  for db in "${DBS[@]}"; do
    echo "Creating database: $db"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
      CREATE DATABASE $db;
EOSQL
  done
fi
