#!/usr/bin/env bash
# Install as /usr/local/bin/sivay-platform-deploy, owned by root, mode 0755.
# A dedicated authorized_keys entry forces this command for GitHub Actions.
set -euo pipefail
command_pattern='^deploy ([0-9a-f]{40}) ([A-Za-z0-9_-]+(\[bot\])?)$'
if [[ ! "${SSH_ORIGINAL_COMMAND:-}" =~ $command_pattern ]]; then
    echo "Only 'deploy FULL_COMMIT_SHA GITHUB_ACTOR' is allowed." >&2
    exit 1
fi
release="${BASH_REMATCH[1]}"
registry_user="${BASH_REMATCH[2]}"
cd /home/ubuntu/SIVAY-platform

# Serializes checkout changes as well as the container replacement.
exec 8>deploy/.update.lock
flock -n 8 || { echo "Another GitHub deployment is running." >&2; exit 1; }
if [[ -n "$(git status --porcelain)" ]]; then
    echo "The server checkout has local changes; deployment stopped." >&2
    exit 1
fi
git fetch origin main
git merge-base --is-ancestor "$release" FETCH_HEAD
git checkout --detach "$release"

# The short-lived, read-only GITHUB_TOKEN arrives on stdin and is never logged.
# The production server does not need a persistent GitHub registry token.
registry_config="$(mktemp -d)"
trap 'rm -f "$registry_config/config.json"; rmdir "$registry_config"' EXIT
IFS= read -r registry_token
printf '%s' "$registry_token" | sudo -n docker --config "$registry_config" \
    login ghcr.io -u "$registry_user" --password-stdin
unset registry_token
export DOCKER_CONFIG="$registry_config"
bash deploy/release.sh "$release"
