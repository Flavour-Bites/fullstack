#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOKEN_FILE="$PROJECT_ROOT/.env.sonar.local"

if [[ ! -f "$TOKEN_FILE" ]]; then
    echo "Error: $TOKEN_FILE not found."
    exit 1
fi

set -a
# shellcheck source=/dev/null
source "$TOKEN_FILE"
set +a

if [[ -z "${SONAR_TOKEN:-}" ]]; then
    echo "Error: SONAR_TOKEN is not set in $TOKEN_FILE."
    exit 1
fi

export SONAR_TOKEN

# Ensure sonar-scanner is in PATH if installed in user Applications
if ! command -v sonar-scanner &>/dev/null; then
    if [[ -d "$HOME/Applications/sonar-scanner/bin" ]]; then
        export PATH="$HOME/Applications/sonar-scanner/bin:$PATH"
    fi
fi

cd "$PROJECT_ROOT"

exec sonar-scanner -Dsonar.token="$SONAR_TOKEN" "$@"
