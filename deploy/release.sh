#!/usr/bin/env bash
# Run as the repository owner on EC2; sudo is used only for Docker.
set -euo pipefail

cd "$(dirname "$0")/.."
release="${1:?Usage: bash deploy/release.sh FULL_COMMIT_SHA [--skip-migrations]}"
if [[ ! "$release" =~ ^[0-9a-f]{40}$ ]]; then
    echo "A full lowercase Git commit SHA is required." >&2
    exit 1
fi
if [[ "$(git rev-parse HEAD)" != "$release" ]]; then
    echo "Check out the release commit before deploying its images." >&2
    exit 1
fi
if [[ "${2:-}" != "" && "${2:-}" != "--skip-migrations" ]]; then
    echo "Unknown option: $2" >&2
    exit 1
fi
for file in deploy/runtime.env deploy/backend.env deploy/certs/global-bundle.pem; do
    if [[ ! -s "$file" ]]; then
        echo "Missing $file; follow docs/ec2-deployment.md first." >&2
        exit 1
    fi
done

# Also serializes manual deployments with GitHub Actions deployments.
exec 9>deploy/.deploy.lock
flock -n 9 || { echo "Another platform deployment is running." >&2; exit 1; }
release_env="$(mktemp)"
trap 'rm -f "$release_env"' EXIT
printf 'RELEASE_TAG=%s\n' "$release" > "$release_env"
docker=(sudo -n docker)
if [[ -n "${DOCKER_CONFIG:-}" ]]; then
    docker+=(--config "$DOCKER_CONFIG")
fi
compose=("${docker[@]}" compose --project-name sivay-platform
    --env-file deploy/runtime.env --env-file "$release_env"
    -f compose.production.yaml)

"${compose[@]}" config --quiet
"${compose[@]}" pull backend frontend
if [[ "${2:-}" != "--skip-migrations" ]]; then
    # The existing service remains running while the migration is applied.
    # Schema changes must remain compatible with the previous application.
    "${compose[@]}" run --rm --no-deps backend alembic upgrade head
fi
"${compose[@]}" up -d --no-build --wait --wait-timeout 120 backend frontend

# Check the real frontend -> API route without creating user data.
"${compose[@]}" exec -T frontend sh -c \
    'wget -S -O /dev/null http://127.0.0.1:8080/api/v1/auth/me 2>&1 | grep -q "HTTP/1.1 401"'
if [[ -f deploy/current-release ]]; then
    cp deploy/current-release deploy/previous-release
fi
printf '%s\n' "$release" > deploy/current-release
echo "Platform release $release is healthy."
