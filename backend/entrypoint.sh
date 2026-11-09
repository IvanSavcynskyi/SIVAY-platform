#!/bin/sh
set -e

# Wait for PostgreSQL to be ready
echo "Checking database connection at ${POSTGRES_SERVER:-localhost}:${POSTGRES_PORT:-5432}..."

python << 'EOF'
import socket
import time
import os
import sys

host = os.getenv("POSTGRES_SERVER", "localhost")
port = int(os.getenv("POSTGRES_PORT", "5432"))
max_retries = 30
retry_interval = 2

for attempt in range(1, max_retries + 1):
    try:
        with socket.create_connection((host, port), timeout=2):
            print(f"Successfully connected to database at {host}:{port}")
            sys.exit(0)
    except OSError:
        print(f"Waiting for database to become available... (attempt {attempt}/{max_retries})")
        time.sleep(retry_interval)

print(f"Error: Could not connect to database at {host}:{port} within timeout", file=sys.stderr)
sys.exit(1)
EOF

# Run database migrations if enabled (enabled by default)
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    echo "Running Alembic migrations..."
    alembic upgrade head
    echo "Migrations applied successfully."
fi

# Execute the main command passed to the container
echo "Starting application with: $@"
exec "$@"

