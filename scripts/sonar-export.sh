#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOKEN_FILE="$PROJECT_ROOT/.env.sonar.local"
OUTPUT_DIR="$PROJECT_ROOT/sonarqube-results"

SONAR_HOST_URL="${SONAR_HOST_URL:-http://localhost:9100}"
PROJECT_KEY="${SONAR_PROJECT_KEY:-flavour-bites}"
DEFAULT_PROJECT_NAME=$(grep '^sonar.projectName=' "$PROJECT_ROOT/sonar-project.properties" 2>/dev/null | cut -d= -f2- || true)
PROJECT_NAME="${SONAR_PROJECT_NAME:-${DEFAULT_PROJECT_NAME:-$PROJECT_KEY}}"

CE_TASK_TIMEOUT="${SONAR_CE_TASK_TIMEOUT:-120}"
PAGE_SIZE="${SONAR_ISSUE_PAGE_SIZE:-500}"

if [[ ! -f "$TOKEN_FILE" ]]; then
    echo "Error: $TOKEN_FILE not found."
    exit 1
fi

set -a
source "$TOKEN_FILE"
set +a

if [[ -z "${SONAR_TOKEN:-}" ]]; then
    echo "Error: SONAR_TOKEN is not set in $TOKEN_FILE."
    exit 1
fi

mkdir -p "$OUTPUT_DIR"

echo "Exporting SonarQube results..."
echo "Project: $PROJECT_NAME ($PROJECT_KEY)"
echo "Server:  $SONAR_HOST_URL"
echo

# Wait for SonarQube's Compute Engine task to finish before exporting results.
if [[ -f "$PROJECT_ROOT/.scannerwork/report-task.txt" ]]; then
    CE_TASK_ID=$(grep '^ceTaskId=' "$PROJECT_ROOT/.scannerwork/report-task.txt" | cut -d= -f2 || true)

    if [[ -n "$CE_TASK_ID" ]]; then
        echo "Waiting for SonarQube Compute Engine task $CE_TASK_ID..."

        for ((i=0; i<CE_TASK_TIMEOUT; i++)); do
            STATUS=$(
                curl -fsS \
                    -u "$SONAR_TOKEN:" \
                    "$SONAR_HOST_URL/api/ce/task?id=$CE_TASK_ID" |
                    jq -r '.task.status // "UNKNOWN"'
            )

            case "$STATUS" in
                SUCCESS)
                    echo "Task $CE_TASK_ID completed successfully."
                    break
                    ;;

                FAILED|CANCELED)
                    echo "Error: Task $CE_TASK_ID ended with status: $STATUS"
                    exit 1
                    ;;

                PENDING|IN_PROGRESS)
                    sleep 1
                    ;;

                *)
                    echo "Error: Unknown Compute Engine task status: $STATUS"
                    exit 1
                    ;;
            esac

            if (( i == CE_TASK_TIMEOUT - 1 )); then
                echo "Error: Timed out waiting for task $CE_TASK_ID."
                exit 1
            fi
        done
    fi
fi

# ------------------------------------------------------------------
# Project issues
# ------------------------------------------------------------------

echo "Fetching issues..."

curl -fsS \
    -u "$SONAR_TOKEN:" \
    --get "$SONAR_HOST_URL/api/issues/search" \
    --data-urlencode "componentKeys=$PROJECT_KEY" \
    --data-urlencode "ps=$PAGE_SIZE" \
    -o "$OUTPUT_DIR/issues-page-1.json"

TOTAL=$(jq -r '.total // 0' "$OUTPUT_DIR/issues-page-1.json")

if [[ "$TOTAL" -gt "$PAGE_SIZE" ]]; then
    TOTAL_PAGES=$(( (TOTAL + PAGE_SIZE - 1) / PAGE_SIZE ))

    for ((PAGE=2; PAGE<=TOTAL_PAGES; PAGE++)); do
        echo "Fetching issues page $PAGE/$TOTAL_PAGES..."

        curl -fsS \
            -u "$SONAR_TOKEN:" \
            --get "$SONAR_HOST_URL/api/issues/search" \
            --data-urlencode "componentKeys=$PROJECT_KEY" \
            --data-urlencode "ps=$PAGE_SIZE" \
            --data-urlencode "p=$PAGE" \
            -o "$OUTPUT_DIR/issues-page-$PAGE.json"
    done
fi

# Combine issue pages into one JSON document.
jq -s '
    {
        total: .[0].total,
        issues: (map(.issues) | add)
    }
' "$OUTPUT_DIR"/issues-page-*.json > "$OUTPUT_DIR/issues.json"

rm "$OUTPUT_DIR"/issues-page-*.json

# ------------------------------------------------------------------
# Project measures
# ------------------------------------------------------------------

echo "Fetching project metrics..."

METRIC_KEYS="bugs,vulnerabilities,code_smells,security_hotspots,coverage,duplicated_lines_density,ncloc,lines_to_cover,uncovered_lines"

curl -fsS \
    -u "$SONAR_TOKEN:" \
    --get "$SONAR_HOST_URL/api/measures/component" \
    --data-urlencode "component=$PROJECT_KEY" \
    --data-urlencode "metricKeys=$METRIC_KEYS" \
    -o "$OUTPUT_DIR/metrics.json"

# ------------------------------------------------------------------
# Quality Gate
# ------------------------------------------------------------------

echo "Fetching quality gate status..."

curl -fsS \
    -u "$SONAR_TOKEN:" \
    --get "$SONAR_HOST_URL/api/qualitygates/project_status" \
    --data-urlencode "projectKey=$PROJECT_KEY" \
    -o "$OUTPUT_DIR/quality-gate.json"

# ------------------------------------------------------------------
# Generate AI-readable Markdown report
# ------------------------------------------------------------------

echo "Generating AI-readable report..."

jq -r --arg projName "$PROJECT_NAME" '
    "# SonarQube Analysis — \($projName)\n\n" +
    "## Summary\n\n" +
    "- Total issues: \(.total)\n\n" +
    "## Issues\n\n" +
    (
        if (.issues | length) == 0 then
            "No issues were reported.\n"
        else
            (
                .issues[] |
                "### \(.rule // "Unknown rule") — \(.severity // "UNKNOWN")\n\n" +
                "- **Message:** \(.message // "N/A")\n" +
                "- **Type:** \(.type // "N/A")\n" +
                "- **File:** \(.component // "N/A")\n" +
                "- **Line:** \(.line // "N/A")\n" +
                "- **Status:** \(.status // "N/A")\n" +
                "- **Resolution:** \(.resolution // "N/A")\n" +
                "- **Effort:** \(.effort // "N/A")\n" +
                "- **Tags:** \((.tags // []) | join(", "))\n\n"
            )
        end
    )
' "$OUTPUT_DIR/issues.json" > "$OUTPUT_DIR/report.md"

cat > "$OUTPUT_DIR/README.md" <<EOF
# ${PROJECT_NAME} — SonarQube Results

Generated: $(date -Iseconds)

SonarQube server: $SONAR_HOST_URL

Project key: $PROJECT_KEY

## Files

- \`report.md\` — AI-friendly human-readable issue report
- \`issues.json\` — Complete issue data returned by SonarQube
- \`metrics.json\` — Project-level quality metrics
- \`quality-gate.json\` — Quality Gate result

## Suggested AI-agent input

Give the agent:

1. \`report.md\`
2. \`metrics.json\`
3. \`quality-gate.json\`

Use \`issues.json\` when the agent needs the complete raw SonarQube issue metadata.
EOF

echo
echo "Export complete."
echo "Results: $OUTPUT_DIR"
echo
ls -lh "$OUTPUT_DIR"
