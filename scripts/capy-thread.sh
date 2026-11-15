#!/usr/bin/env bash
# Start a Capy thread from a prompt file, using the documented public API:
#   https://docs.capy.ai/api-reference/quickstart
#   POST https://api.capy.ai/api/v1/threads  {requestId, projectId, message}
#
# Usage:
#   export CAPY_API_KEY='capy_...'           # capy.ai -> Settings -> API (shown once; never commit it)
#   scripts/capy-thread.sh --list-projects   # prints the projects the key can see
#   export CAPY_PROJECT_ID='project_...'
#   scripts/capy-thread.sh capy/01-revyl-notes-check.md
#
# For a capy/*.md file, only the first fenced block after the "## Prompt" heading is sent.
# Any other file is sent whole.
set -euo pipefail

API="${CAPY_API_URL:-https://api.capy.ai/api/v1}"

if [ -z "${CAPY_API_KEY:-}" ]; then
  echo "CAPY_API_KEY is not set. Create a key at https://capy.ai/settings/api and export it." >&2
  exit 1
fi
command -v python3 >/dev/null || { echo "python3 is required." >&2; exit 1; }

if [ "${1:-}" = "--list-projects" ]; then
  curl -sS --fail-with-body -H "Authorization: Bearer $CAPY_API_KEY" "$API/projects"
  echo
  exit 0
fi

FILE="${1:-}"
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "Usage: $0 <prompt-file> | --list-projects" >&2
  exit 1
fi
if [ -z "${CAPY_PROJECT_ID:-}" ]; then
  echo "CAPY_PROJECT_ID is not set. Run: $0 --list-projects" >&2
  exit 1
fi

REQUEST_ID="$(uuidgen 2>/dev/null || python3 -c 'import uuid; print(uuid.uuid4())')"

# Build the JSON body in Python so quotes and newlines in the prompt are escaped correctly.
BODY="$(python3 - "$FILE" "$CAPY_PROJECT_ID" "$REQUEST_ID" <<'PY'
import json, re, sys

path, project_id, request_id = sys.argv[1:4]
text = open(path, encoding="utf-8").read()
m = re.search(r"^## Prompt\s*\n+```[^\n]*\n(.*?)\n```", text, re.S | re.M)
message = (m.group(1) if m else text).strip()
if not message:
    sys.exit("The prompt is empty.")
print(json.dumps({"requestId": request_id, "projectId": project_id, "message": message}))
PY
)"

RESPONSE="$(curl -sS --fail-with-body -X POST "$API/threads" \
  -H "Authorization: Bearer $CAPY_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$BODY")"

printf '%s\n' "$RESPONSE" | python3 -c '
import json, sys
t = json.load(sys.stdin)
print("thread:", t.get("id"))
print("status:", t.get("status"))
print("Open https://capy.ai and find it on the Threads page.")
print("Poll:   curl -H \"Authorization: Bearer $CAPY_API_KEY\" %s/threads/%s" % (sys.argv[1], t.get("id")))
' "$API"
